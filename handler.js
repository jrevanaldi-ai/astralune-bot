import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadCommands() {
  const commands = {};
  const commandsDir = path.join(__dirname, 'commands');
  
  if (!fs.existsSync(commandsDir)) {
    fs.mkdirSync(commandsDir, { recursive: true });
    return commands;
  }
  
  const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    try {
      const commandModule = await import(`./commands/${file}`);
      if (commandModule.handler) {
        const command = {
          handler: commandModule.handler,
          execute: commandModule.execute
        };
        
        if (command.handler.cmd) {
          const cmds = Array.isArray(command.handler.cmd) ? command.handler.cmd : [command.handler.cmd];
          cmds.forEach(cmd => {
            commands[cmd.toLowerCase()] = command;
          });
        }
        if (command.handler.aliases) {
          command.handler.aliases.forEach(alias => {
            commands[alias.toLowerCase()] = command;
          });
        }
      }
    } catch (err) {
      console.error(`Error loading command ${file}:`, err);
    }
  }
  
  return commands;
}

let commands = {};

loadCommands().then(loadedCommands => {
  commands = loadedCommands;
  console.log(`Loaded ${Object.keys(commands).length} commands`);
}).catch(err => {
  console.error('Error loading commands:', err);
});

export async function handler(sock, message) {
  try {
    if (!message.message || !message.message.conversation) return;

    const text = message.message.conversation.trim();
    
    let prefix = null;
    for (const p of config.prefixes) {
      if (text.startsWith(p)) {
        prefix = p;
        break;
      }
    }
    
    if (!prefix) return;
    
    const args = text.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    if (!commands[commandName]) {
      return;
    }
    
    const command = commands[commandName];
    
    const sender = message.key.fromMe ? config.ownerNumber[0] : message.key.remoteJid.replace('@s.whatsapp.net', '');
    if (command.handler.owner && !config.ownerNumber.includes(sender)) {
      return;
    }
    
    const ctx = {
      sock,
      message,
      args,
      command: commandName,
      sender,
      isGroup: message.key.remoteJid.endsWith('@g.us'),
      groupMetadata: null,
      isAdmin: false
    };
    
    if (ctx.isGroup) {
      try {
        ctx.groupMetadata = await sock.groupMetadata(message.key.remoteJid);
        ctx.isAdmin = ctx.groupMetadata.participants.some(
          participant => participant.id === sender && participant.admin
        );
      } catch (error) {
        console.error('Error getting group metadata:', error);
      }
    }
    
    console.log(`Executing command: ${commandName}`);
    await command.execute(ctx);
    
  } catch (error) {
    console.error('Handler error:', error);
    if (config.ownerNumber.length > 0) {
      const owner = config.ownerNumber[0];
      try {
        await sock.sendMessage(`${owner}@s.whatsapp.net`, { 
          text: `Error: ${error.message}\n\nFrom: ${message.key.remoteJid}\nMessage: ${message.message?.conversation || '[Media Message]'}` 
        });
      } catch (sendError) {
        console.error('Failed to send error to owner:', sendError);
      }
    }
  }
}

export async function reloadCommands() {
  commands = await loadCommands();
  console.log(`Reloaded ${Object.keys(commands).length} commands`);
}