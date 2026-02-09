import { config } from '../config.js';

export const handler = {
  tag: 'main',
  cmd: ['owner'],
  aliases: ['ownerbot'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message } = ctx;

  try {
    // Ambil nomor owner dari konfigurasi
    const ownerNumbers = config.ownerNumber;
    
    if (!ownerNumbers || ownerNumbers.length === 0) {
      await sock.sendMessage(message.key.remoteJid, {
        text: 'Informasi owner tidak tersedia.'
      }, { quoted: message });
      return;
    }

    let ownerText = '*Owner Bot:*\n\n';
    
    for (const [index, number] of ownerNumbers.entries()) {
      // Format nomor: ganti 62 jadi +62
      const formattedNumber = number.startsWith('62') ? '+' + number : number;
      
      ownerText += `*${index + 1}.* ${formattedNumber}\n`;
    }
    
    ownerText += `\n*Catatan:* Ini adalah nomor resmi dari owner bot.`;

    await sock.sendMessage(message.key.remoteJid, {
      text: ownerText,
      contextInfo: {
        externalAdReply: {
          title: 'Astralune Bot Owner',
          body: 'Informasi tentang owner bot',
          thumbnailUrl: 'https://github.com/jrevanaldi-ai/images/blob/main/astralune.png?raw=true',
          sourceUrl: 'https://github.com/jrevanaldi-ai/astralune',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: message });

  } catch (error) {
    console.error('Owner command error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat mengambil informasi owner: ${error.message}`
    }, { quoted: message });
  }
}