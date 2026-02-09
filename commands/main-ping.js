import { getTime } from '../helper/index.js';

export const handler = {
  tag: 'main',
  cmd: ['ping'],
  aliases: ['p'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message } = ctx;

  const startTime = Date.now();
  const response = await sock.sendMessage(message.key.remoteJid, { text: 'Pong! 🏓' }, { quoted: message });
  const endTime = Date.now();

  const latency = endTime - startTime;
  const serverTime = getTime();

  await sock.sendMessage(message.key.remoteJid, {
    text: `Pong! 🏓\nLatency: ${latency}ms\nServer Time: ${serverTime}`,
    contextInfo: {
      externalAdReply: {
        title: 'Astralune Bot Ping',
        body: `Latency: ${latency}ms`,
        thumbnailUrl: 'https://github.com/jrevanaldi-ai/images/blob/main/astralune.png?raw=true',
        sourceUrl: 'https://github.com/jrevanaldi-ai/astralune',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: message });
}