import axios from 'axios';

export const handler = {
  tag: 'news',
  cmd: ['wiki'],
  aliases: ['wikipedia'],
  owner: false
};

async function getWikiSummary(query) {
  try {
    // Coba endpoint API Wikipedia yang berbeda
    const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Astralune-Bot/1.0 (https://github.com/jrevanaldi-ai/astralune)'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('Artikel tidak ditemukan di Wikipedia.');
    } else if (error.response && error.response.status === 429) {
      throw new Error('Terlalu banyak permintaan ke Wikipedia. Silakan coba lagi nanti.');
    } else {
      console.error('Wiki API error:', error);
      throw new Error('Gagal mengambil data dari Wikipedia. Silakan coba lagi nanti.');
    }
  }
}

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mencari artikel di Wikipedia.\nContoh: .wiki Jakarta atau .wikipedia Indonesia'
    }, { quoted: message });
    return;
  }

  const query = args.join(' ');

  try {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Sedang mencari informasi di Wikipedia...'
    }, { quoted: message });

    const wikiData = await getWikiSummary(query);

    // Validasi data yang diterima
    if (!wikiData || !wikiData.title) {
      throw new Error('Data dari Wikipedia tidak valid.');
    }

    const title = wikiData.title;
    const extract = wikiData.extract || 'Tidak ada ringkasan tersedia.';
    const imageUrl = wikiData.thumbnail?.source;
    const url = wikiData.content_urls?.desktop.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`;

    let wikiText = `📚 *Wikipedia: ${title}*\n\n${extract}`;

    if (wikiText.length > 4000) {
      wikiText = wikiText.substring(0, 4000) + '...';
    }

    if (imageUrl) {
      await sock.sendMessage(message.key.remoteJid, {
        image: { url: imageUrl },
        caption: wikiText,
        contextInfo: {
          externalAdReply: {
            title: `Wikipedia - ${title}`,
            body: extract.substring(0, 50) + '...',
            thumbnailUrl: imageUrl,
            sourceUrl: url,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: message });
    } else {
      await sock.sendMessage(message.key.remoteJid, {
        text: wikiText,
        contextInfo: {
          externalAdReply: {
            title: `Wikipedia - ${title}`,
            body: extract.substring(0, 50) + '...',
            thumbnailUrl: 'https://github.com/jrevanaldi-ai/images/blob/main/astralune.png?raw=true',
            sourceUrl: url,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: message });
    }

  } catch (error) {
    console.error('Wiki error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan: ${error.message}`
    }, { quoted: message });
  }
}