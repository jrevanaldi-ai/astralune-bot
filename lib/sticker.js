import webp from 'node-webpmux';
import { spawn } from 'child_process';

export async function imageToWebp(buffer, options = {}) {
    const { quality = 90 } = options;

    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
            '-i', 'pipe:0',
            '-vcodec', 'libwebp',
            '-vf', `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=fps=15,pad=320:320:-1:-1:color=0x00000000,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse`,
            '-lossless', '0',
            '-q:v', quality.toString(),
            '-preset', 'default',
            '-loop', '0',
            '-an', '-vsync', '0',
            '-f', 'webp',
            'pipe:1'
        ], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let chunks = [];
        ffmpeg.stdout.on('data', chunk => chunks.push(chunk));
        ffmpeg.stderr.on('data', err => console.error('FFmpeg error:', err.toString()));
        
        ffmpeg.on('close', code => {
            if (code !== 0) {
                reject(new Error(`FFmpeg exited with code ${code}`));
            } else {
                resolve(Buffer.concat(chunks));
            }
        });

        ffmpeg.stdin.write(buffer);
        ffmpeg.stdin.end();
    });
}

export async function videoToWebp(buffer, options = {}) {
    const { maxDuration = 30 } = options;

    // Konversi video ke WebP dengan durasi maksimal
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
            '-i', 'pipe:0',
            '-vcodec', 'libwebp',
            '-vf', `fps=15, scale=320:320:force_original_aspect_ratio=decrease, pad=320:320:-1:-1:color=0x00000000`,
            '-loop', '0',
            '-ss', '00:00:00.0',
            `-t`, `${Math.min(maxDuration, 30)}.0`,
            '-f', 'webp',
            'pipe:1'
        ], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let chunks = [];
        ffmpeg.stdout.on('data', chunk => chunks.push(chunk));
        ffmpeg.stderr.on('data', err => console.error('FFmpeg error:', err.toString()));
        
        ffmpeg.on('close', code => {
            if (code !== 0) {
                reject(new Error(`FFmpeg exited with code ${code}`));
            } else {
                resolve(Buffer.concat(chunks));
            }
        });

        ffmpeg.stdin.write(buffer);
        ffmpeg.stdin.end();
    });
}

export async function addExif(webpBuffer, metadata = {}) {
    if (!Buffer.isBuffer(webpBuffer)) {
        throw new Error('Input must be a WebP Buffer');
    }

    const isWebp = 
        webpBuffer[0] === 0x52 &&
        webpBuffer[1] === 0x49 &&
        webpBuffer[2] === 0x46 &&
        webpBuffer[3] === 0x46 &&
        webpBuffer[8] === 0x57 &&
        webpBuffer[9] === 0x45 &&
        webpBuffer[10] === 0x42 &&
        webpBuffer[11] === 0x50;

    if (!isWebp) {
        throw new Error('Not a valid WebP');
    }

    const img = new webp.Image();
    const exifData = {
        'sticker-pack-id': metadata.packId || `astralune-${Date.now()}`,
        'sticker-pack-name': metadata.packName || 'Astralune',
        'sticker-pack-publisher': metadata.packPublish || '© Astralune',
        'android-app-store-link': metadata.androidApp || 'https://play.google.com/store/apps/details?id=com.whatsapp',
        'ios-app-store-link': metadata.iOSApp || 'https://apps.apple.com/app/whatsapp-messenger/id310633997',
        emojis: metadata.emojis || ['😊', '😂', '😍', '😎', '🤩'],
        'is-avatar-sticker': metadata.isAvatar || 0,
    };

    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
    ]);

    const jsonBuffer = Buffer.from(JSON.stringify(exifData), 'utf-8');
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);

    await img.load(webpBuffer);
    img.exif = exif;

    return await img.save(null);
}

export async function sticker(buffer, options = {}) {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('Input must be a Buffer');
    }

    if (buffer.length === 0) {
        throw new Error('Empty buffer');
    }

    let isVideo = false;

    // Cek apakah buffer adalah video atau GIF
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
        isVideo = true; // GIF
    } else if (
        buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x78 || // mp4
        buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x00 || // mp4
        buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3 // webm
    ) {
        isVideo = true;
    }

    let webpBuffer;
    if (isVideo) {
        webpBuffer = await videoToWebp(buffer, {
            maxDuration: options.maxDuration || 10,
        });
    } else {
        webpBuffer = await imageToWebp(buffer, {
            quality: options.quality || 90,
        });
    }

    const result = await addExif(webpBuffer, {
        packName: options.packName,
        packPublish: options.authorName,
        emojis: options.emojis,
    });

    return result;
}