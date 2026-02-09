import axios from 'axios';
import https from 'https';

class TikTokDownloader {
    constructor() {
        this.baseUrl = 'https://www.tiktok.com/oembed';
        this.httpsAgent = new https.Agent({ rejectUnauthorized: false });
    }

    generateHeaders() {
        return {
            'accept': '*/*',
            'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'connection': 'keep-alive',
            'host': 'www.tiktok.com',
            'origin': 'https://snaptik.app',
            'referer': 'https://snaptik.app/',
            'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36'
        };
    }

    async getVideoInfo(videoUrl) {
        const headers = this.generateHeaders();

        const params = {
            url: videoUrl
        };

        const response = await axios.get(this.baseUrl, {
            headers,
            params,
            httpsAgent: this.httpsAgent
        });

        return response.data;
    }

    async download(videoUrl) {
        const videoInfo = await this.getVideoInfo(videoUrl);

        const thumbnailUrl = videoInfo.thumbnail_url;
        const videoId = videoInfo.embed_product_id;
        const author = videoInfo.author_unique_id;

        const headers = this.generateHeaders();

        const response = await axios.get(thumbnailUrl, {
            headers,
            responseType: 'arraybuffer',
            httpsAgent: this.httpsAgent
        });

        const cleanInfo = { ...videoInfo };
        delete cleanInfo.width;
        delete cleanInfo.height;
        delete cleanInfo.html;

        return {
            success: true,
            videoId: videoId,
            author: author,
            thumbnail: videoInfo.thumbnail_url,
            thumbnailBuffer: response.data,
            contentType: response.headers['content-type'],
            info: cleanInfo
        };
    }
}

// Fungsi untuk mengunduh video TikTok
export async function downloadTikTok(videoUrl) {
    try {
        const tiktok = new TikTokDownloader();
        const result = await tiktok.download(videoUrl);
        
        // Kembalikan informasi yang diperlukan oleh perintah
        return {
            title: result.info.title || 'TikTok Video',
            author: result.info.author_name || result.author || 'Unknown',
            author_url: result.info.author_url || '',
            description: result.info.description || '',
            thumbnail: result.thumbnail,
            video: {
                noWatermark: null, // API ini hanya menyediakan thumbnail, bukan video tanpa watermark
                withWatermark: null // dan juga tidak menyediakan video dengan watermark
            },
            // Tambahkan informasi tambahan dari hasil scrape
            embed_product_id: result.info.embed_product_id || '',
            provider_name: result.info.provider_name || 'TikTok',
            provider_url: result.info.provider_url || 'https://www.tiktok.com',
            thumbnail_width: result.info.thumbnail_width || 0,
            thumbnail_height: result.info.thumbnail_height || 0,
            version: result.info.version || '1.0',
            type: result.info.type || 'video'
        };
    } catch (error) {
        console.error('Error downloading TikTok:', error);
        throw new Error(`Gagal mengunduh video TikTok: ${error.message}`);
    }
}

export { TikTokDownloader };
