import { downloadTikTok } from '../scrape/tiktok.js';
import axios from 'axios';

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
    const result = await downloadTikTok(url);
    
    // Kita perlu mengambil URL video sebenarnya dari halaman TikTok
    // Karena API oembed hanya memberikan metadata, bukan URL video
    const videoUrl = await extractVideoUrl(url);
    
    if (videoUrl) {
      // Kirim video TikTok
      await sock.sendMessage(message.key.remoteJid, {
        video: { url: videoUrl },
        caption: `*Judul:* ${result.title}\n*Uploader:* ${result.author}\n*Provider:* ${result.provider_name}\n*Embed ID:* ${result.embed_product_id}\n*Dimensi Thumbnail:* ${result.thumbnail_width}x${result.thumbnail_height}\n\n*Deskripsi:* ${result.description || 'Tidak ada deskripsi'}`
      }, { quoted: message });
    } else {
      await sock.sendMessage(message.key.remoteJid, {
        text: 'Gagal mengunduh video TikTok. Mungkin URL tidak valid atau video tidak tersedia.'
      }, { quoted: message });
    }
  } catch (error) {
    console.error('TikTok download error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat mengunduh video TikTok: ${error.message}`
    }, { quoted: message });
  }
}

// Fungsi untuk mengambil URL video dari halaman TikTok
async function extractVideoUrl(tiktokUrl) {
  try {
    // Ubah URL TikTok ke versi yang bisa diambil videonya
    // Ganti www.tiktok.com ke vm.tiktok.com atau vt.tiktok.com untuk mendapatkan redirect
    let processedUrl = tiktokUrl.replace('www.tiktok.com', 'vm.tiktok.com')
                               .replace('tiktok.com', 'vm.tiktok.com');
    
    // Lakukan request ke URL untuk mendapatkan redirect
    const response = await axios.get(processedUrl, {
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Ambil URL akhir setelah redirect
    const finalUrl = response.request.res.responseUrl || response.config.url;
    
    // Coba ambil URL video dari halaman HTML
    const html = response.data;
    
    // Cari URL video dalam HTML
    const videoMatch = html.match(/"video":{"urls":\[("[^"]+")\]/);
    if (videoMatch && videoMatch[1]) {
      return JSON.parse(videoMatch[1]);
    }
    
    // Alternatif: cari dengan regex lain
    const videoMatch2 = html.match(/video\/([^"]+)\.mp4/);
    if (videoMatch2 && videoMatch2[1]) {
      return `https://v16-webapp.tiktok.com/video/${videoMatch2[1]}.mp4`;
    }
    
    // Jika tidak ditemukan, kembalikan URL redirect
    return finalUrl;
  } catch (error) {
    console.error('Error extracting video URL:', error);
    return null;
  }
}