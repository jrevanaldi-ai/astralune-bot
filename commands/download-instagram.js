export const handler = {
  tag: 'download',
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
      // Coba deteksi jenis media dari header atau ekstensi
      try {
        const headResponse = await fetch(mediaUrl, { method: 'HEAD' });
        const contentType = headResponse.headers.get('content-type');
        
        if (contentType && contentType.startsWith('video/')) {
          await sock.sendMessage(message.key.remoteJid, {
            video: { url: mediaUrl },
            caption: 'Video dari Instagram',
            mimetype: contentType
          }, { quoted: message });
        } else if (contentType && contentType.startsWith('image/')) {
          await sock.sendMessage(message.key.remoteJid, {
            image: { url: mediaUrl },
            caption: 'Gambar dari Instagram',
            mimetype: contentType
          }, { quoted: message });
        } else {
          // Jika tidak bisa deteksi dari header, coba dari ekstensi
          const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl);
          
          if (isVideo) {
            await sock.sendMessage(message.key.remoteJid, {
              video: { url: mediaUrl },
              caption: 'Video dari Instagram',
              mimetype: 'video/mp4'
            }, { quoted: message });
          } else {
            await sock.sendMessage(message.key.remoteJid, {
              image: { url: mediaUrl },
              caption: 'Gambar dari Instagram',
              mimetype: 'image/jpeg'
            }, { quoted: message });
          }
        }
      } catch (mediaError) {
        // Jika gagal deteksi jenis media, coba kirim sebagai document
        await sock.sendMessage(message.key.remoteJid, {
          document: { url: mediaUrl },
          fileName: 'media_instagram',
          caption: 'Media dari Instagram (terkirim sebagai dokumen karena tidak bisa dideteksi jenisnya)'
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