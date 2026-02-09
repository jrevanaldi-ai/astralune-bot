import { AnimeScraper } from '../scrape/anime-scraper.js';

export const handler = {
  tag: 'anime',
  cmd: ['anime'],
  aliases: ['searchanime'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mencari anime.\nContoh: .anime naruto'
    }, { quoted: message });
    return;
  }

  const query = args.join(' ');

  try {
    await sock.sendMessage(message.key.remoteJid, {
      text: `Sedang mencari anime "${query}", mohon tunggu...`
    }, { quoted: message });

    const scraper = new AnimeScraper();
    await scraper.fetchAnimeList();
    
    const searchResults = scraper.searchAnime(query);
    
    if (searchResults.length > 0) {
      // Ambil hasil pertama untuk ditampilkan
      const anime = searchResults[0];
      const detail = await scraper.getAnimeDetail(anime.url);
      
      let detailText = `*${detail.title}*\n\n`;
      detailText += `*Status:* ${anime.status}\n`;
      
      // Tambahkan informasi detail dari objek detail
      for (const [key, value] of Object.entries(detail.detail)) {
        detailText += `*${key}:* ${value}\n`;
      }
      
      detailText += `\n*Sinopsis:*\n${detail.sinopsis}\n\n`;
      detailText += `*Jumlah Episode:* ${detail.episodes.length}\n`;
      
      // Tampilkan beberapa episode terbaru
      if (detail.episodes.length > 0) {
        detailText += `\n*Beberapa Episode Terbaru:*\n`;
        const latestEpisodes = detail.episodes.slice(0, 5); // Ambil 5 episode terbaru
        for (const episode of latestEpisodes) {
          detailText += `- ${episode.title} (${episode.date})\n`;
        }
      }
      
      detailText += `\nPowered by Astralune Bot`;

      await sock.sendMessage(message.key.remoteJid, {
        text: detailText
      }, { quoted: message });
    } else {
      await sock.sendMessage(message.key.remoteJid, {
        text: `Anime "${query}" tidak ditemukan.`
      }, { quoted: message });
    }
  } catch (error) {
    console.error('Anime search error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat mencari anime: ${error.message}`
    }, { quoted: message });
  }
}