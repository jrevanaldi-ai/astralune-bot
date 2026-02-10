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
    if (!message.message) return;

    let text = '';
    
    // Mengenali berbagai jenis pesan
    const messageContent = message.message;
    
    // Cek berbagai jenis pesan teks
    if (messageContent.conversation) {
      text = messageContent.conversation;
    } else if (messageContent.extendedTextMessage?.text) {
      text = messageContent.extendedTextMessage.text;
    } else if (messageContent.imageMessage?.caption) {
      text = messageContent.imageMessage.caption;
    } else if (messageContent.videoMessage?.caption) {
      text = messageContent.videoMessage.caption;
    } else if (messageContent.audioMessage) {
      // Untuk pesan audio, kita bisa mengekstrak teks jika ada
      text = messageContent.audioMessage.caption || '';
    } else if (messageContent.documentMessage?.caption) {
      text = messageContent.documentMessage.caption;
    } else if (messageContent.stickerMessage) {
      // Untuk pesan stiker, biasanya tidak ada teks, tapi kita tetap coba
      text = '';
    } else if (messageContent.contactMessage) {
      text = messageContent.contactMessage.displayName || '';
    } else if (messageContent.locationMessage) {
      text = messageContent.locationMessage.name || 'Location shared';
    } else if (messageContent.viewOnceMessage?.message?.imageMessage?.caption) {
      text = messageContent.viewOnceMessage.message.imageMessage.caption;
    } else if (messageContent.viewOnceMessage?.message?.videoMessage?.caption) {
      text = messageContent.viewOnceMessage.message.videoMessage.caption;
    } else if (messageContent.listMessage) {
      text = messageContent.listMessage.description || '';
    } else if (messageContent.buttonsMessage) {
      text = messageContent.buttonsMessage.contentText || messageContent.buttonsMessage.caption || '';
    } else if (messageContent.templateMessage) {
      text = messageContent.templateMessage.hydratedTemplate?.hydratedContentText || 
             messageContent.templateMessage.hydratedTemplate?.hydratedFooterText || '';
    } else {
      // Jika tidak ada teks yang ditemukan, coba ekstrak dari pesan lain
      text = '';
    }

    // Jika tidak ada teks yang ditemukan, cek apakah ini pesan viewOnce
    if (!text && messageContent.viewOnceMessage?.message) {
      const viewOnceMsg = messageContent.viewOnceMessage.message;
      if (viewOnceMsg.imageMessage?.caption) {
        text = viewOnceMsg.imageMessage.caption;
      } else if (viewOnceMsg.videoMessage?.caption) {
        text = viewOnceMsg.videoMessage.caption;
      } else if (viewOnceMsg.extendedTextMessage?.text) {
        text = viewOnceMsg.extendedTextMessage.text;
      }
    }

    text = text.trim();

    // Cek apakah pesan dimulai dengan prefix
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
        const groupMetadataPromise = sock.groupMetadata(message.key.remoteJid);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout getting group metadata')), 3000)
        );

        try {
          ctx.groupMetadata = await Promise.race([groupMetadataPromise, timeoutPromise]);

          ctx.isAdmin = ctx.groupMetadata.participants.some(
            participant => participant.id === sender && participant.admin
          );
        } catch (timeoutError) {
          console.warn('Timeout getting group metadata, proceeding without admin info:', timeoutError.message);
        }
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
          text: `Error: ${error.message}\n\nFrom: ${message.key.remoteJid}\nMessage: ${(message.message?.conversation || message.message?.extendedTextMessage?.text || message.message?.imageMessage?.caption || message.message?.videoMessage?.caption || '[Media Message]').substring(0, 100)}`
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