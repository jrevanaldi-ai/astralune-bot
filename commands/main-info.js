import os from 'os';
import { formatNumber } from '../utils/index.js';

export const handler = {
  tag: 'main',
  cmd: ['info', 'information', 'server'],
  aliases: ['specs', 'system'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message } = ctx;

  const hostname = os.hostname();
  const platform = os.platform();
  const arch = os.arch();
  const cpuCount = os.cpus().length;
  const totalMemory = formatNumber(os.totalmem());
  const freeMemory = formatNumber(os.freemem());
  const uptime = Math.floor(os.uptime() / 60);

  const infoText = `
*System Information:*
Hostname: ${hostname}
Platform: ${platform}
Architecture: ${arch}
CPU Cores: ${cpuCount}
Total Memory: ${totalMemory} bytes
Free Memory: ${freeMemory} bytes
Uptime: ${uptime} minutes

Powered by bot.astralune.cv
  `.trim();

  await sock.sendMessage(message.key.remoteJid, { text: infoText }, { quoted: message });
}