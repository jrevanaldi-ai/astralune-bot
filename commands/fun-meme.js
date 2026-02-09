import axios from 'axios';

export const handler = {
  tag: 'fun',
  cmd: ['meme'],
  aliases: ['memes'],
  owner: false
};

async function getMeme() {
  try {
    const response = await axios.get('https://meme-api.herokuapp.com/gimme');
    return response.data;
  } catch (error) {
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

    await sock.sendMessage(message.key.remoteJid, {
      image: { url: memeData.url },
      caption: `*Title:* ${memeData.title}\n*Subreddit:* ${memeData.subreddit}\n*Author:* ${memeData.author}`,
      contextInfo: {
        externalAdReply: {
          title: 'Random Meme',
          body: memeData.title,
          thumbnailUrl: memeData.url,
          sourceUrl: memeData.postLink,
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