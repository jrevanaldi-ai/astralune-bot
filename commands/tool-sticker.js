import { sticker } from '../lib/sticker.js';

export const handler = {
  tag: 'tool',
  cmd: ['sticker', 's'],
  aliases: ['stiker'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  // Cek apakah ada gambar yang dikirim atau direply
  let quoted = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
  let type = Object.keys(quoted || {})[0];
  
  if (!quoted || !type) {
    // Cek apakah ada media dalam pesan saat ini
    type = Object.keys(message.message || {})[0];
    quoted = message.message;
  }

  if (type === 'imageMessage') {
    try {
      const media = await sock.downloadMediaMessage(quoted[type === 'imageMessage' ? type : Object.keys(quoted)[0]]);
      const stickerBuffer = await sticker(media, {
        packName: 'Astralune Sticker',
        authorName: 'Astralune Bot',
        quality: 50
      });
      
      await sock.sendMessage(message.key.remoteJid, {
        sticker: stickerBuffer
      }, { quoted: message });
    } catch (error) {
      await sock.sendMessage(message.key.remoteJid, {
        text: `Error membuat stiker: ${error.message}`
      }, { quoted: message });
    }
  } else if (type === 'videoMessage') {
    if (quoted[type].seconds > 10) {
      await sock.sendMessage(message.key.remoteJid, {
        text: 'Video terlalu panjang! Maksimal 10 detik.'
      }, { quoted: message });
      return;
    }
    
    try {
      const media = await sock.downloadMediaMessage(quoted[type]);
      const stickerBuffer = await sticker(media, {
        packName: 'Astralune Sticker',
        authorName: 'Astralune Bot',
        maxDuration: 10
      });
      
      await sock.sendMessage(message.key.remoteJid, {
        sticker: stickerBuffer
      }, { quoted: message });
    } catch (error) {
      await sock.sendMessage(message.key.remoteJid, {
        text: `Error membuat stiker: ${error.message}`
      }, { quoted: message });
    }
  } else {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Kirim atau reply gambar/video dengan caption .sticker untuk membuat stiker.'
    }, { quoted: message });
  }
}