import { uploader } from '../lib/uploader.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export const handler = {
  tag: 'tool',
  cmd: ['upload', 'up'],
  aliases: ['uploader'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message } = ctx;

  // Cek apakah ada media yang dikirim atau direply
  let quoted = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
  let type = Object.keys(quoted || {})[0];
  
  if (!quoted || !type) {
    // Cek apakah ada media dalam pesan saat ini
    type = Object.keys(message.message || {})[0];
    quoted = message.message;
  }

  if (type === 'imageMessage' || type === 'videoMessage' || type === 'documentMessage' || type === 'audioMessage') {
    try {
      await sock.sendMessage(message.key.remoteJid, {
        text: 'Sedang mengupload file, mohon tunggu...'
      }, { quoted: message });
      
      let mediaBuffer = [];
      let messageType = '';
      
      if (type === 'imageMessage') {
        messageType = 'image';
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        for await (const chunk of stream) {
          mediaBuffer.push(chunk);
        }
      } else if (type === 'videoMessage') {
        messageType = 'video';
        const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
        for await (const chunk of stream) {
          mediaBuffer.push(chunk);
        }
      } else if (type === 'audioMessage') {
        messageType = 'audio';
        const stream = await downloadContentFromMessage(quoted.audioMessage, 'audio');
        for await (const chunk of stream) {
          mediaBuffer.push(chunk);
        }
      } else if (type === 'documentMessage') {
        messageType = 'document';
        const stream = await downloadContentFromMessage(quoted.documentMessage, 'document');
        for await (const chunk of stream) {
          mediaBuffer.push(chunk);
        }
      }
      
      const media = Buffer.concat(mediaBuffer);
      const result = await uploader(media);
      
      if (result.success) {
        await sock.sendMessage(message.key.remoteJid, {
          text: `Upload berhasil!\nURL: ${result.url}\nProvider: ${result.provider}`
        }, { quoted: message });
      } else {
        await sock.sendMessage(message.key.remoteJid, {
          text: 'Upload gagal. Silakan coba lagi.'
        }, { quoted: message });
      }
    } catch (error) {
      await sock.sendMessage(message.key.remoteJid, {
        text: `Error mengupload file: ${error.message}`
      }, { quoted: message });
    }
  } else {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Kirim atau reply gambar/video/audio/document dengan caption .upload untuk mengupload.'
    }, { quoted: message });
  }
}