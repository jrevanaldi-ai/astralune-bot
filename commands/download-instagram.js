export const handler = {
  tag: 'downloader',
  cmd: ['ig', 'instagram'],
  aliases: ['igdl', 'instadl'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mengunduh media dari Instagram.\nContoh: .ig https://www.instagram.com/p/abcdefg/'
    }, { quoted: message });
    return;
  }

  const url = args[0];

  const instagramRegex = /https?:\/\/(www\.)?instagram\.com\/[^\s]+/;
  if (!instagramRegex.test(url)) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Harap masukkan URL Instagram yang valid.'
    }, { quoted: message });
    return;
  }

  try {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Sedang mengunduh dari Instagram, mohon tunggu...'
    }, { quoted: message });

    const response = await fetch(`https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(url)}`);
    const result = await response.json();

    if (!result.status || !result.result || !result.result.url) {
      await sock.sendMessage(message.key.remoteJid, {
        text: `Gagal mengunduh dari Instagram: ${result.message || 'Tidak dikenal'}.`
      }, { quoted: message });
      return;
    }

    const urls = result.result.url;

    if (!urls || urls.length === 0) {
      await sock.sendMessage(message.key.remoteJid, {
        text: 'Tidak ditemukan media untuk URL tersebut.'
      }, { quoted: message });
      return;
    }

    for (const mediaUrl of urls) {
      const isVideo = /\.(mp4|mov|avi|mkv)$/i.test(mediaUrl);
      
      if (isVideo) {
        await sock.sendMessage(message.key.remoteJid, {
          video: { url: mediaUrl },
          caption: 'Video dari Instagram',
          mimetype: 'video/mp4'
        }, { quoted: message });
      } else {
        await sock.sendMessage(message.key.remoteJid, {
          image: { url: mediaUrl },
          caption: 'Gambar dari Instagram'
        }, { quoted: message });
      }
    }
  } catch (error) {
    console.error('Instagram download error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat mengunduh dari Instagram: ${error.message}`
    }, { quoted: message });
  }
}