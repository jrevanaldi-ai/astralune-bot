import { snaptikDown } from '../scrape/tiktokdown.js';

export const handler = {
  tag: 'download',
  cmd: ['tiktok'],
  aliases: ['tt'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mengunduh video dari TikTok.\nContoh: .tiktok https://www.tiktok.com/@username/video/123456789'
    }, { quoted: message });
    return;
  }

  const url = args[0];

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
        jpegThumbnail: Buffer.from([]) // Thumbnail akan diambil dari video
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