import { ytPlay } from '../scrape/youtube-play.js';

export const handler = {
  tag: 'download',
  cmd: ['play'],
  aliases: ['ytplay'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mencari dan mengunduh audio dari YouTube.\nContoh: .play lagu yang ingin dicari'
    }, { quoted: message });
    return;
  }

  const query = args.join(' ');

  try {
    await sock.sendMessage(message.key.remoteJid, {
      text: `Sedang mencari "${query}", mohon tunggu...`
    }, { quoted: message });

    const result = await ytPlay(query);

    if (result.status) {
      const { title, channel, duration, views, upload_at, thumbnail, download_url } = result.result;
      
      await sock.sendMessage(message.key.remoteJid, {
        image: { url: thumbnail },
        caption: `*Judul:* ${title}\n*Channel:* ${channel}\n*Durasi:* ${duration}\n*Views:* ${views}\n*Upload:* ${upload_at}\n\nSedang mengunduh audio...`
      }, { quoted: message });

      await sock.sendMessage(message.key.remoteJid, {
        audio: { url: download_url },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: message });
    } else {
      await sock.sendMessage(message.key.remoteJid, {
        text: `Gagal mencari lagu: ${result.message || 'Tidak ditemukan'}.`
      }, { quoted: message });
    }
  } catch (error) {
    console.error('YouTube Play error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat mencari lagu: ${error.message}`
    }, { quoted: message });
  }
}