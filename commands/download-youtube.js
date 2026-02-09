import { savetube } from '../scrape/youtube-downloader.js';

export const handler = {
  tag: 'download',
  cmd: ['ytmp4', 'ytmp3', 'yt'],
  aliases: ['youtube'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mengunduh video/audio dari YouTube.\nContoh:\n.ytmp4 <url> (untuk video)\n.ytmp3 <url> (untuk audio)'
    }, { quoted: message });
    return;
  }

  const url = args[0];
  const command = ctx.command;

  // Tentukan format berdasarkan perintah
  let format = 'mp3'; // default
  if (command === 'ytmp4' || args[1]) {
    // Jika perintah adalah ytmp4 atau argumen kedua disediakan
    format = args[1] || '360'; // default kualitas video 360p
  } else if (command === 'ytmp3') {
    format = 'mp3';
  }

  try {
    await sock.sendMessage(message.key.remoteJid, {
      text: `Sedang mengunduh dari YouTube, mohon tunggu...`
    }, { quoted: message });

    const downloader = new savetube();
    const result = await downloader.download(url, format);

    if (result.status) {
      if (format === 'mp3') {
        // Kirim audio
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
        // Kirim video
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