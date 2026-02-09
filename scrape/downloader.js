import axios from 'axios';

class DownrScraper {
    constructor() {
        this.baseURL = 'https://downr.org';
        this.headers = {
            'authority': 'downr.org',
            'accept': '*/*',
            'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'content-type': 'application/json',
            'origin': 'https://downr.org',
            'referer': 'https://downr.org/',
            'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
            'accept-encoding': 'gzip, deflate, br, zstd'
        };
    }

    async getSessionCookie() {
        const cookies = '_ga=GA1.1.536005378.1770437315; _clck=17lj13q%5E2%5Eg3d%5E0%5E2229; _ga_2HS60D2GS7=GS2.1.s1770437315$o1$g1$t1770437481$j60$l0$h0; _clsk=1yaus0r%5E1770437888260%5E3%5E1%5Ed.clarity.ms%2Fcollect';

        const headers = {
            ...this.headers,
            'cookie': cookies
        };

        const response = await axios.get(`${this.baseURL}/.netlify/functions/analytics`, { headers });

        const setCookie = response.headers['set-cookie'][0];
        const sessCookie = setCookie.split(';')[0];

        return `${cookies}; ${sessCookie}`;
    }

    async getVideoInfo(url) {
        const cookie = await this.getSessionCookie();

        const headers = {
            ...this.headers,
            'cookie': cookie
        };

        const payload = {
            url: url
        };

        const response = await axios.post(`${this.baseURL}/.netlify/functions/nyt`, payload, { headers });

        return {
            url: response.data.url,
            title: response.data.title,
            author: response.data.author,
            duration: response.data.duration,
            thumbnail: response.data.thumbnail,
            medias: response.data.medias
        };
    };
};

// Fungsi untuk mengunduh dari berbagai platform
export async function downloadFromUrl(url) {
    try {
        const scraper = new DownrScraper();
        const result = await scraper.getVideoInfo(url);
        
        // Deteksi tipe media berdasarkan URL dan informasi dari response
        let mediaType = 'video';
        let mimeType = 'video/mp4';
        let extension = '.mp4';
        
        // Deteksi tipe media berdasarkan URL
        if (result.url.includes('.mp3') || result.url.includes('audio')) {
            mediaType = 'audio';
            mimeType = 'audio/mpeg';
            extension = '.mp3';
        } else if (result.url.includes('.jpg') || result.url.includes('.jpeg') || result.url.includes('.png') || result.url.includes('.gif')) {
            mediaType = 'image';
            mimeType = 'image/jpeg'; // default to jpeg, will be adjusted based on actual file
            extension = '.jpg';
        } else if (result.url.includes('.mp4') || result.url.includes('.mov') || result.url.includes('.avi')) {
            mediaType = 'video';
            mimeType = 'video/mp4';
            extension = '.mp4';
        } else if (result.url.includes('.pdf')) {
            mediaType = 'document';
            mimeType = 'application/pdf';
            extension = '.pdf';
        } else if (result.url.includes('.doc') || result.url.includes('.docx')) {
            mediaType = 'document';
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            extension = '.docx';
        } else if (result.url.includes('.zip') || result.url.includes('.rar') || result.url.includes('.7z')) {
            mediaType = 'document';
            mimeType = 'application/zip';
            extension = '.zip';
        }
        
        // Jika result.medias tersedia, kita bisa mendapatkan info lebih detail
        if (result.medias && Array.isArray(result.medias) && result.medias.length > 0) {
            // Ambil media dengan kualitas tertinggi
            const highestQualityMedia = result.medias.reduce((prev, current) => {
                return (prev.quality || 0) > (current.quality || 0) ? prev : current;
            });
            
            if (highestQualityMedia) {
                // Deteksi tipe berdasarkan format atau mime type dari media
                if (highestQualityMedia.format && (highestQualityMedia.format.includes('audio') || highestQualityMedia.mime_type === 'audio/mp4' || highestQualityMedia.mime_type === 'audio/mpeg')) {
                    mediaType = 'audio';
                    mimeType = highestQualityMedia.mime_type || 'audio/mpeg';
                    extension = '.mp3';
                } else if (highestQualityMedia.format && (highestQualityMedia.format.includes('image') || highestQualityMedia.mime_type?.includes('image'))) {
                    mediaType = 'image';
                    mimeType = highestQualityMedia.mime_type || 'image/jpeg';
                    extension = '.jpg';
                } else if (highestQualityMedia.format && (highestQualityMedia.format.includes('video') || highestQualityMedia.mime_type?.includes('video'))) {
                    mediaType = 'video';
                    mimeType = highestQualityMedia.mime_type || 'video/mp4';
                    extension = '.mp4';
                }
            }
        }
        
        // Buat nama file yang aman
        const cleanTitle = result.title ? result.title.replace(/[\/\\:*?"<>|]/g, '_').replace(/[^\w\s-]/g, '') : 'media';
        const filename = cleanTitle + extension;
        
        // Kembalikan informasi media
        return {
            url: result.url,
            title: result.title,
            author: result.author,
            duration: result.duration,
            thumbnail: result.thumbnail,
            type: mediaType,
            filename: filename,
            mimetype: mimeType
        };
    } catch (error) {
        console.error('Error downloading from URL:', error);
        throw new Error(`Gagal mengunduh dari URL: ${error.message}`);
    }
}
