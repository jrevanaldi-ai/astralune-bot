import { AnimeScraper } from '../scrape/anime-scraper.js';

export const handler = {
  tag: 'anime',
  cmd: ['animelist'],
  aliases: ['latestanime'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message } = ctx;

  try {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Sedang mengambil daftar anime terbaru, mohon tunggu...'
    }, { quoted: message });

    const scraper = new AnimeScraper();
    await scraper.fetchAnimeList();
    
    const latestAnime = scraper.getLatestAnime(10); // Ambil 10 anime terbaru
    
    if (latestAnime.length > 0) {
      let listText = '*Daftar Anime Terbaru:*\n\n';
      
      for (const anime of latestAnime) {
        listText += `*${anime.index}.* ${anime.title}\n`;
        listText += `   Status: ${anime.status}\n`;
        listText += `   Link: ${anime.url}\n\n`;
      }
      
      listText += 'Powered by Astralune Bot';

      await sock.sendMessage(message.key.remoteJid, {
        text: listText
      }, { quoted: message });
    } else {
      await sock.sendMessage(message.key.remoteJid, {
        text: 'Tidak ada anime terbaru yang ditemukan.'
      }, { quoted: message });
    }
  } catch (error) {
    console.error('Anime list error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat mengambil daftar anime: ${error.message}`
    }, { quoted: message });
  }
}