import fs from 'fs';
import path from 'path';

export const handler = {
  tag: 'main',
  cmd: ['menu'],
  aliases: ['help'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message } = ctx;
  
  const commandsDir = path.join(process.cwd(), 'commands');
  const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
  
  let menuText = '*Astralune Bot Menu*\n\n';
  
  const commandsByTag = {};
  
  for (const file of commandFiles) {
    const commandPath = path.join(commandsDir, file);
    const commandModule = await import(`file://${commandPath}`);
    
    if (commandModule.handler) {
      const { tag, cmd, aliases } = commandModule.handler;
      
      if (!commandsByTag[tag]) {
        commandsByTag[tag] = [];
      }
      
      commandsByTag[tag].push({
        cmd: Array.isArray(cmd) ? cmd[0] : cmd,
        aliases: aliases || []
      });
    }
  }
  
  for (const [tag, commands] of Object.entries(commandsByTag)) {
    menuText += `*${tag.charAt(0).toUpperCase() + tag.slice(1)} Commands:*\n`;
    
    for (const command of commands) {
      let cmdText = `• ${command.cmd}`;
      if (command.aliases.length > 0) {
        cmdText += ` (aliases: ${command.aliases.join(', ')})`;
      }
      menuText += `${cmdText}\n`;
    }
    
    menuText += '\n';
  }
  
  menuText += 'Powered by bot.astralune.cv';

  await sock.sendMessage(message.key.remoteJid, {
    text: menuText,
    contextInfo: {
      externalAdReply: {
        title: 'Astralune Bot Menu',
        body: 'Your all-in-one WhatsApp bot solution',
        thumbnailUrl: 'https://github.com/jrevanaldi-ai/images/blob/main/astralune.png?raw=true',
        sourceUrl: 'https://github.com/jrevanaldi-ai/astralune',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: message });
}