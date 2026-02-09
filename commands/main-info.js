import os from 'os';
import { formatNumber } from '../utils/index.js';
import { config } from '../config.js';

export const handler = {
  tag: 'main',
  cmd: ['info'],
  aliases: ['specs'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message } = ctx;

  // Informasi sistem
  const hostname = os.hostname();
  const platform = os.platform();
  const arch = os.arch();
  const cpuModel = os.cpus()[0].model;
  const cpuCount = os.cpus().length;
  const totalMemory = formatNumber(os.totalmem());
  const freeMemory = formatNumber(os.freemem());
  const usedMemory = formatNumber(os.totalmem() - os.freemem());
  const memoryUsagePercent = ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2);
  
  // Uptime dalam format yang lebih informatif
  const uptimeSeconds = os.uptime();
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  
  // Informasi Node.js
  const nodeVersion = process.version;
  const nodeUptime = process.uptime();
  const nodeUptimeMinutes = Math.floor(nodeUptime / 60);
  
  // Informasi bot
  const botName = config.botName;
  const prefixes = config.prefixes.join(', ');
  const ownerNumber = config.ownerNumber[0];
  
  // Informasi CPU
  const cpuLoad = os.loadavg();
  
  const infoText = `
*${botName} - System & Bot Information*

*System Information:*
• Hostname: ${hostname}
• Platform: ${platform}
• Architecture: ${arch}
• CPU Model: ${cpuModel}
• CPU Cores: ${cpuCount}
• CPU Load Average: ${cpuLoad[0].toFixed(2)}, ${cpuLoad[1].toFixed(2)}, ${cpuLoad[2].toFixed(2)}

*Memory Information:*
• Total Memory: ${totalMemory} bytes
• Used Memory: ${usedMemory} bytes
• Free Memory: ${freeMemory} bytes
• Memory Usage: ${memoryUsagePercent}%

*System Uptime:*
• System Uptime: ${days}d ${hours}h ${minutes}m
• Process Uptime: ${nodeUptimeMinutes} minutes

*Bot Information:*
• Bot Name: ${botName}
• Prefixes: ${prefixes}
• Owner Number: ${ownerNumber}
• Node.js Version: ${nodeVersion}

Powered by bot.astralune.cv
  `.trim();

  await sock.sendMessage(message.key.remoteJid, {
    text: infoText,
    contextInfo: {
      externalAdReply: {
        title: 'Astralune Bot Info',
        body: `System & Bot Information for ${hostname}`,
        thumbnailUrl: 'https://github.com/jrevanaldi-ai/images/blob/main/astralune.png?raw=true',
        sourceUrl: 'https://github.com/jrevanaldi-ai/astralune',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: message });
}