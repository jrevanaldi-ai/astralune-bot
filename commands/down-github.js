import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const handler = {
  tag: 'download',
  cmd: ['github-zip'],
  aliases: ['github-down'],
  owner: false,
  requiresAdmin: false
};

async function downloadGithubRepo(repoUrl, outputPath) {
  try {
    const urlParts = repoUrl.split('/');
    const repoName = urlParts[urlParts.length - 1];
    const userName = urlParts[urlParts.length - 2];
    
    const zipUrl = `https://github.com/${userName}/${repoName}/archive/main.zip`;
    
    const response = await axios({
      method: 'GET',
      url: zipUrl,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading GitHub repo:', error);
    throw new Error('Gagal mengunduh repository GitHub. Pastikan URL benar dan repository publik.');
  }
}

export async function execute(ctx) {
  const { sock, message, args } = ctx;
  
  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mengunduh repository GitHub sebagai file ZIP.\nContoh: .down-github https://github.com/whiskeysockets/baileys'
    }, { quoted: message });
    return;
  }
  
  const repoUrl = args[0];
  
  if (!repoUrl.includes('github.com')) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Harap masukkan URL repository GitHub yang valid.\nContoh: .down-github https://github.com/whiskeysockets/baileys'
    }, { quoted: message });
    return;
  }

  try {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Sedang mengunduh repository GitHub...'
    }, { quoted: message });

    const urlParts = repoUrl.split('/');
    const repoName = urlParts[urlParts.length - 1];
    const userName = urlParts[urlParts.length - 2];
    const fileName = `${userName}-${repoName}.zip`;

    const tempPath = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }

    const filePath = path.join(tempPath, fileName);

    await downloadGithubRepo(repoUrl, filePath);

    await sock.sendMessage(message.key.remoteJid, {
      document: { url: filePath },
      fileName: fileName,
      mimetype: 'application/zip'
    }, { quoted: message });

    fs.unlinkSync(filePath);
    
  } catch (error) {
    console.error('Download GitHub error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat mengunduh repository: ${error.message}`
    }, { quoted: message });
  }
}
