import { savetube } from '../scrape/youtube-downloader.js';

export const handler = {
  tag: 'download',
  cmd: ['yt'],
  aliases: ['youtube'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mengunduh video/audio dari YouTube.\nContoh:\n.yt <url> (untuk audio)\n.yt <url> <kualitas> (untuk video)'
    }, { quoted: message });
    return;
  }

  const url = args[0];
  let format = 'mp3'; // default
  
  if (args[1]) {
    format = args[1]; // gunakan argumen kedua sebagai kualitas video
  }

  try {
    await sock.sendMessage(message.key.remoteJid, {
      text: `Sedang mengunduh dari YouTube, mohon tunggu...`
    }, { quoted: message });

    const downloader = new savetube();
    const result = await downloader.download(url, format);

    if (result.status) {
      if (format === 'mp3') {
        await sock.sendMessage(message.key.remoteJid, {
          audio: { url: result.dl },
          mimetype: 'audio/mpeg',
          fileName: `${result.title}.mp3`,
          contextInfo: {
            externalAdReply: {
              title: result.title,
              body: 'Audio dari YouTube',
              thumbnailUrl: result.thumb,
              sourceUrl: url,
              mediaType: 2,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: message });
      } else {
        await sock.sendMessage(message.key.remoteJid, {
          video: { url: result.dl },
          caption: `*Judul:* ${result.title}\n*Kualitas:* ${result.format}p\n*Durasi:* ${result.duration}\n\nPowered by Astralune Bot`,
          contextInfo: {
            externalAdReply: {
              title: result.title,
              body: `Video ${result.format}p dari YouTube`,
              thumbnailUrl: result.thumb,
              sourceUrl: url,
              mediaType: 2,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: message });
      }
    } else {
      await sock.sendMessage(message.key.remoteJid, {
        text: `Gagal mengunduh dari YouTube: ${result.msg || result.error || 'Tidak diketahui'}.`
      }, { quoted: message });
    }
  } catch (error) {
    console.error('YouTube download error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat mengunduh dari YouTube: ${error.message}`
    }, { quoted: message });
  }
}