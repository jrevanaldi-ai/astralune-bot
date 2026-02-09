import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const handler = {
  tag: 'tools',
  cmd: ['fetch'],
  aliases: ['get'],
  owner: false
};

async function fetchContent(url) {
  try {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': userAgent,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      timeout: 10000
    });

    return response;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw new Error('Gagal mengambil konten dari URL. Pastikan URL valid dan dapat diakses.');
  }
}

export async function execute(ctx) {
  const { sock, message, args } = ctx;
  
  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mengambil konten dari URL.\nContoh: .get https://example.com'
    }, { quoted: message });
    return;
  }
  
  const url = args[0];
  
  try {
    new URL(url);
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Harap masukkan URL yang valid.\nContoh: .get https://example.com'
    }, { quoted: message });
    return;
  }

  try {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Sedang mengambil konten dari URL...'
    }, { quoted: message });

    const response = await fetchContent(url);
    const contentType = response.headers['content-type'];

    const tempPath = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }

    let fileExtension = '';
    if (contentType.includes('application/pdf')) {
      fileExtension = '.pdf';
    } else if (contentType.includes('image/jpeg')) {
      fileExtension = '.jpg';
    } else if (contentType.includes('image/png')) {
      fileExtension = '.png';
    } else if (contentType.includes('image/gif')) {
      fileExtension = '.gif';
    } else if (contentType.includes('video/mp4')) {
      fileExtension = '.mp4';
    } else if (contentType.includes('video/webm')) {
      fileExtension = '.webm';
    } else if (contentType.includes('audio/mpeg')) {
      fileExtension = '.mp3';
    } else if (contentType.includes('text/html')) {
      fileExtension = '.html';
    } else if (contentType.includes('application/json')) {
      fileExtension = '.json';
    } else {
      const urlExt = path.extname(new URL(url).pathname);
      if (urlExt) {
        fileExtension = urlExt;
      } else {
        fileExtension = '.dat';
      }
    }

    const fileName = `fetched_content_${Date.now()}${fileExtension}`;
    const filePath = path.join(tempPath, fileName);

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    if (contentType.includes('image/')) {
      await sock.sendMessage(message.key.remoteJid, {
        image: { url: filePath },
        caption: `Gambar dari ${url}`
      }, { quoted: message });
    } else if (contentType.includes('video/')) {
      await sock.sendMessage(message.key.remoteJid, {
        video: { url: filePath },
        caption: `Video dari ${url}`
      }, { quoted: message });
    } else if (contentType.includes('audio/')) {
      await sock.sendMessage(message.key.remoteJid, {
        audio: { url: filePath },
        mimetype: contentType,
        ptt: false
      }, { quoted: message });
    } else if (contentType.includes('application/pdf')) {
      await sock.sendMessage(message.key.remoteJid, {
        document: { url: filePath },
        fileName: fileName,
        mimetype: 'application/pdf'
      }, { quoted: message });
    } else {
      if (contentType.includes('text/') || contentType.includes('application/json')) {
        const fileSize = fs.statSync(filePath).size;
        if (fileSize < 1000000) {
          const content = fs.readFileSync(filePath, 'utf8');
          await sock.sendMessage(message.key.remoteJid, {
            text: content.substring(0, 4000)
          }, { quoted: message });
        } else {
          await sock.sendMessage(message.key.remoteJid, {
            document: { url: filePath },
            fileName: fileName,
            mimetype: contentType
          }, { quoted: message });
        }
      } else {
        await sock.sendMessage(message.key.remoteJid, {
          document: { url: filePath },
          fileName: fileName,
          mimetype: contentType
        }, { quoted: message });
      }
    }

    fs.unlinkSync(filePath);
    
  } catch (error) {
    console.error('Fetch error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat mengambil konten: ${error.message}`
    }, { quoted: message });
  }
}