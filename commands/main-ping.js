import { getTime } from '../helper/index.js';

export const handler = {
  tag: 'main',
  cmd: 'ping',
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
    text: `Pong! 🏓\nLatency: ${latency}ms\nServer Time: ${serverTime}`
  }, { quoted: message });
}