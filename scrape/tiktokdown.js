import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * SNAPTIK CX SCRAPER
 * @param {String} url - Link Video TikTok
 * @creator AgungDevX
 */
async function snaptikDown(url) {
  try {
    console.log("[-] Mengambil link video...");
    
    // 1. Data Form berdasarkan payload screenshot
    const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
    let data = `--${boundary}\r\n`;
    data += `Content-Disposition: form-data; name="type"\r\n\r\ntiktokVideo\r\n`;
    data += `--${boundary}\r\n`;
    data += `Content-Disposition: form-data; name="url"\r\n\r\n${url}\r\n`;
    data += `--${boundary}\r\n`;
    
    // Hash ini biasanya statik atau dihasilkan oleh JS client
    data += `Content-Disposition: form-data; name="hash"\r\n\r\nf02bcde7c18ae1f002e293de6573b8f5\r\n`;
    data += `--${boundary}--\r\n`;
    
    // 2. Mengirim permintaan ke API Snaptik
    const response = await axios.post('https://snaptik.cx/en/check/', data, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://snaptik.cx/',
        'Origin': 'https://snaptik.cx',
        // Trik untuk menghindari pembatasan IP
        'X-Forwarded-For': Array(4).fill(0).map(() => Math.floor(Math.random() * 255)).join('.')
      }
    });
    
    // 3. Parsing respon HTML
    const $ = cheerio.load(response.data);
    const results = [];
    
    // Mengambil link download dari tag di dalam .down-right
    $('.down-right a').each((i, el) => {
      const link = $(el).attr('href');
      if (link && link !== '/') {
        results.push(link.startsWith('http') ? link : 'https://cdn.snaptik.cx' + link);
      }
    });
    
    if (results.length === 0) throw new Error("Link download tidak ditemukan!");
    
    return {
      status: true,
      creator: "AgungDevX",
      result: {
        title: $('.user-fullname').text().trim() || "TikTok Video",
        username: $('.user-username').text().trim(),
        thumbnail: $('.user-avatar img').attr('src'),
        video_url: results[0], // Link HD biasanya yang pertama
        backup_url: results[1] || null
      }
    };
  } catch (err) {
    return {
      status: false,
      creator: "AgungDevX",
      message: err.response ? "Kena Limit/Bot Filter" : err.message
    };
  }
}

export { snaptikDown };