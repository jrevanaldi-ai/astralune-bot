import axios from 'axios';

export const handler = {
  tag: 'fun',
  cmd: ['joke'],
  aliases: ['jokes'],
  owner: false,
  requiresAdmin: false
};

async function getJoke() {
  try {
    const response = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single');
    return response.data;
  } catch (error) {
    throw new Error('Gagal mengambil joke. Silakan coba lagi nanti.');
  }
}

export async function execute(ctx) {
  const { sock, message } = ctx;

  try {
    const jokeData = await getJoke();

    if (jokeData.error) {
      throw new Error('Gagal mendapatkan joke. Silakan coba lagi nanti.');
    }

    const jokeText = jokeData.joke;

    await sock.sendMessage(message.key.remoteJid, {
      text: `😂 *Random Joke*\n\n${jokeText}`,
      contextInfo: {
        externalAdReply: {
          title: 'Random Joke',
          body: 'Get ready to laugh!',
          thumbnailUrl: 'https://github.com/jrevanaldi-ai/images/blob/main/astralune.png?raw=true',
          sourceUrl: 'https://v2.jokeapi.dev/',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: message });

  } catch (error) {
    console.error('Joke error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan: ${error.message}`
    }, { quoted: message });
  }
}