import { snaptikDown } from '../scrape/tiktokdown.js';

export const handler = {
  tag: 'download',
  cmd: ['tiktok'],
  aliases: ['tt'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  let url = args[0];
  
  // Jika tidak ada URL di argumen, cek apakah ada pesan yang direply
  if (!url && message.message.extendedTextMessage?.contextInfo?.quotedMessage) {
    const quotedMessage = message.message.extendedTextMessage.contextInfo.quotedMessage;
    
    // Cek apakah pesan yang direply berisi URL TikTok
    if (quotedMessage.conversation) {
      const quotedText = quotedMessage.conversation;
      const tiktokUrlMatch = quotedText.match(/https?:\/\/(www\.)?tiktok\.com\/.*/i);
      if (tiktokUrlMatch) {
        url = tiktokUrlMatch[0];
      }
    }
  }

  if (!url) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mengunduh video dari TikTok.\nContoh: .tiktok https://www.tiktok.com/@username/video/123456789\nAtau reply pesan yang berisi URL TikTok dengan perintah .tiktok'
    }, { quoted: message });
    return;
  }

  try {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Sedang mengunduh video TikTok, mohon tunggu...'
    }, { quoted: message });

    // Panggil fungsi dari scraper TikTok
    const result = await snaptikDown(url);

    if (result.status) {
      // Kirim video TikTok
      await sock.sendMessage(message.key.remoteJid, {
        video: { url: result.result.video_url },
        caption: `*Judul:* ${result.result.title}\n*Uploader:* ${result.result.username}\n\nPowered by Astralune Bot`,
        jpegThumbnail: result.result.thumbnail ? { url: result.result.thumbnail } : Buffer.from([])
      }, { quoted: message });
    } else {
      await sock.sendMessage(message.key.remoteJid, {
        text: `Gagal mengunduh video TikTok: ${result.message || 'Tidak diketahui'}. Mungkin URL tidak valid atau video tidak tersedia.`
      }, { quoted: message });
    }
  } catch (error) {
    console.error('TikTok download error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat mengunduh video TikTok: ${error.message}`
    }, { quoted: message });
  }
}