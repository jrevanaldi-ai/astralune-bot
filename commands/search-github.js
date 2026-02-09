import axios from 'axios';
import { formatNumber } from '../utils/index.js';

export const handler = {
  tag: 'search',
  cmd: ['github-search'],
  aliases: ['github'],
  owner: false
};

async function searchGitHubRepos(query) {
  try {
    const response = await axios.get(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`);
    const repos = response.data.items;
    
    if (repos.length === 0) {
      return 'Tidak ditemukan repositori GitHub yang cocok.';
    }
    
    let result = `*Hasil Pencarian GitHub untuk "${query}"*\n\n`;
    
    for (const repo of repos) {
      result += `*Nama:* ${repo.full_name}\n`;
      result += `*Deskripsi:* ${repo.description || 'Tidak ada deskripsi'}\n`;
      result += `*Bahasa:* ${repo.language || 'Tidak disebutkan'}\n`;
      result += `*Stars:* ${formatNumber(repo.stargazers_count)}\n`;
      result += `*Forks:* ${formatNumber(repo.forks_count)}\n`;
      result += `*URL:* ${repo.html_url}\n\n`;
    }
    
    return result;
  } catch (error) {
    console.error('Error searching GitHub:', error);
    return 'Terjadi kesalahan saat mencari repositori GitHub.';
  }
}

export async function execute(ctx) {
  const { sock, message, args } = ctx;
  
  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mencari repositori GitHub.\nContoh: .search-github whatsapp bot atau .github whatsapp bot'
    }, { quoted: message });
    return;
  }
  
  const query = args.join(' ');
  const result = await searchGitHubRepos(query);
  
  await sock.sendMessage(message.key.remoteJid, {
    text: result
  }, { quoted: message });
}
