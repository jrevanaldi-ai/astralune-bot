import axios from 'axios';
import { formatNumber } from '../utils/index.js';

export const handler = {
  tag: 'search',
  cmd: ['search-npm', 'npm-search'],
  aliases: ['npm', 'npms', 'find-npm'],
  owner: false
};

// Fungsi untuk mencari paket npm
async function searchNpmPackages(query) {
  try {
    const response = await axios.get(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=5`);
    const packages = response.data.objects;
    
    if (packages.length === 0) {
      return 'Tidak ditemukan paket npm yang cocok.';
    }
    
    let result = `*Hasil Pencarian NPM untuk "${query}"*\n\n`;
    
    for (const pkg of packages) {
      const { package: p } = pkg;
      result += `*Nama:* ${p.name}\n`;
      result += `*Versi:* ${p.version}\n`;
      result += `*Deskripsi:* ${p.description || 'Tidak ada deskripsi'}\n`;
      result += `*Maintainer:* ${p.maintainers.length > 0 ? p.maintainers[0].username : 'Tidak diketahui'}\n`;
      result += `*Homepage:* ${p.links.homepage || p.links.npm || 'Tidak tersedia'}\n`;
      result += `*Repository:* ${p.links.repository || 'Tidak tersedia'}\n\n`;
    }
    
    return result;
  } catch (error) {
    console.error('Error searching npm:', error);
    return 'Terjadi kesalahan saat mencari paket npm.';
  }
}

export async function execute(ctx) {
  const { sock, message, args } = ctx;
  
  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mencari paket npm.\nContoh: .search-npm express atau .npm express'
    }, { quoted: message });
    return;
  }
  
  const query = args.join(' ');
  const result = await searchNpmPackages(query);
  
  await sock.sendMessage(message.key.remoteJid, {
    text: result
  }, { quoted: message });
}
