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

    // Panggil fungsi dari scraper
    const result = await downloadFromUrl(url);
    
    if (result && result.type && result.url) {
      if (result.type === 'video') {
        await sock.sendMessage(message.key.remoteJid, {
          video: { url: result.url },
          caption: result.title ? `*Judul:* ${result.title}` : 'Video berhasil diunduh',
          contextInfo: {
            externalAdReply: {
              title: result.title || 'Video Download',
              body: 'Downloaded via Astralune Bot',
              thumbnailUrl: 'https://github.com/jrevanaldi-ai/images/blob/main/astralune.png?raw=true',
              sourceUrl: url,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: message });
      } else if (result.type === 'audio') {
        await sock.sendMessage(message.key.remoteJid, {
          audio: { url: result.url },
          mimetype: 'audio/mpeg',
          caption: result.title ? `*Judul:* ${result.title}` : 'Audio berhasil diunduh',
          contextInfo: {
            externalAdReply: {
              title: result.title || 'Audio Download',
              body: 'Downloaded via Astralune Bot',
              thumbnailUrl: 'https://github.com/jrevanaldi-ai/images/blob/main/astralune.png?raw=true',
              sourceUrl: url,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: message });
      } else if (result.type === 'image') {
        await sock.sendMessage(message.key.remoteJid, {
          image: { url: result.url },
          caption: result.title ? `*Judul:* ${result.title}` : 'Gambar berhasil diunduh',
          contextInfo: {
            externalAdReply: {
              title: result.title || 'Image Download',
              body: 'Downloaded via Astralune Bot',
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
          caption: result.title ? `*Judul:* ${result.title}` : 'Media berhasil diunduh',
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