import axios from 'axios';

export const handler = {
  tag: 'fun',
  cmd: ['meme'],
  aliases: ['memes'],
  owner: false
};

async function getMeme() {
  try {
    const response = await axios.get('https://meme-api.com/gimme');
    return response.data;
  } catch (error) {
    console.error('Meme API error:', error);
    throw new Error('Gagal mengambil meme. Silakan coba lagi nanti.');
  }
}

export async function execute(ctx) {
  const { sock, message } = ctx;

  try {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Sedang mengambil meme...',
    }, { quoted: message });

    const memeData = await getMeme();

    // Pastikan data meme valid
    if (!memeData || !memeData.url) {
      throw new Error('Data meme tidak valid diterima dari API.');
    }

    await sock.sendMessage(message.key.remoteJid, {
      image: { url: memeData.url },
      caption: `*Title:* ${memeData.title || 'Untitled'}\n*Subreddit:* ${memeData.subreddit || 'N/A'}\n*Author:* ${memeData.author || 'Unknown'}`,
      contextInfo: {
        externalAdReply: {
          title: 'Random Meme',
          body: memeData.title || 'Random Meme',
          thumbnailUrl: memeData.url,
          sourceUrl: memeData.postLink || memeData.url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: message });

  } catch (error) {
    console.error('Meme error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan: ${error.message}`
    }, { quoted: message });
  }
}