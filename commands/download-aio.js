import { downloadFromUrl } from '../scrape/downloader.js';

export const handler = {
  tag: 'download',
  cmd: ['aio', 'allinone'],
  aliases: ['dl', 'download'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mengunduh media dari berbagai platform.\nContoh: .aio https://youtube.com/watch?v=xxx atau .aio https://instagram.com/p/xxx'
    }, { quoted: message });
    return;
  }

  const url = args[0];

  try {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Sedang mengunduh media, mohon tunggu...'
    }, { quoted: message });

    await sock.sendMessage(message.key.remoteJid, {
      text: 'Mendeteksi tipe media...'
    }, { quoted: message });

    // Panggil fungsi dari scraper
    const result = await downloadFromUrl(url);
    
    if (result && result.type && result.url) {
      // Tampilkan informasi hasil deteksi
      console.log('Media detected:', {
        type: result.type,
        mimetype: result.mimetype,
        url: result.url,
        platform: result.platform,
        quality: result.quality
      });
      
      if (result.type === 'video') {
        await sock.sendMessage(message.key.remoteJid, {
          video: { url: result.url },
          caption: result.title ? 
            `*Judul:* ${result.title}\n*Platform:* ${result.platform || 'Unknown'}\n*Kualitas:* ${result.quality || 'Unknown'}` : 
            `Video berhasil diunduh\n*Platform:* ${result.platform || 'Unknown'}\n*Kualitas:* ${result.quality || 'Unknown'}`,
          mimetype: result.mimetype || 'video/mp4',
          contextInfo: {
            externalAdReply: {
              title: result.title || 'Video Download',
              body: `Platform: ${result.platform || 'Unknown'} | Quality: ${result.quality || 'Unknown'}`,
              thumbnailUrl: result.thumbnail || 'https://github.com/jrevanaldi-ai/images/blob/main/astralune.png?raw=true',
              sourceUrl: url,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: message });
      } else if (result.type === 'audio') {
        await sock.sendMessage(message.key.remoteJid, {
          audio: { url: result.url },
          mimetype: result.mimetype || 'audio/mpeg',
          caption: result.title ? 
            `*Judul:* ${result.title}\n*Platform:* ${result.platform || 'Unknown'}\n*Durasi:* ${result.duration ? Math.floor(result.duration / 1000) + ' detik' : 'Unknown'}` : 
            `Audio berhasil diunduh\n*Platform:* ${result.platform || 'Unknown'}`,
          contextInfo: {
            externalAdReply: {
              title: result.title || 'Audio Download',
              body: `Platform: ${result.platform || 'Unknown'} | Duration: ${result.duration ? Math.floor(result.duration / 1000) + 's' : 'Unknown'}`,
              thumbnailUrl: result.thumbnail || 'https://github.com/jrevanaldi-ai/images/blob/main/astralune.png?raw=true',
              sourceUrl: url,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: message });
      } else if (result.type === 'image') {
        await sock.sendMessage(message.key.remoteJid, {
          image: { url: result.url },
          caption: result.title ? 
            `*Judul:* ${result.title}\n*Platform:* ${result.platform || 'Unknown'}` : 
            `Gambar berhasil diunduh\n*Platform:* ${result.platform || 'Unknown'}`,
          contextInfo: {
            externalAdReply: {
              title: result.title || 'Image Download',
              body: `Platform: ${result.platform || 'Unknown'}`,
              thumbnailUrl: result.url,
              sourceUrl: url,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: message });
      } else {
        // Jika tipe tidak dikenali, kirim sebagai dokumen
        await sock.sendMessage(message.key.remoteJid, {
          document: { url: result.url },
          fileName: result.filename || 'media',
          caption: result.title ? 
            `*Judul:* ${result.title}\n*Platform:* ${result.platform || 'Unknown'}\n*Tipe File:* ${result.mimetype || 'Unknown'}` : 
            `Media berhasil diunduh\n*Platform:* ${result.platform || 'Unknown'}`,
          mimetype: result.mimetype || 'application/octet-stream'
        }, { quoted: message });
      }
    } else {
      await sock.sendMessage(message.key.remoteJid, {
        text: 'Gagal mengunduh media. Format atau URL tidak didukung.'
      }, { quoted: message });
    }
  } catch (error) {
    console.error('Download error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat mengunduh: ${error.message}`
    }, { quoted: message });
  }
}