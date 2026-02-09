import { Boom } from '@hapi/boom';
import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  WAMessageStubType
} from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import chalk from 'chalk';
import moment from 'moment-timezone';
import { config } from './config.js';
import { handler } from './handler.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Pino from 'pino';
import { logger, logIncomingMessage } from './utils/index.js';
import { createWelcomeImage, createLeaveImage } from './lib/welcome-leave.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getTime = () => moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

if (!fs.existsSync(config.sessionPath)) {
  fs.mkdirSync(config.sessionPath, { recursive: true });
}

if (!fs.existsSync(config.dataPath)) {
  fs.mkdirSync(config.dataPath, { recursive: true });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


// Fungsi untuk connect ke WhatsApp
async function connectToWhatsApp() {
  // Mengambil auth state dari file
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionPath);
  
  // Dapatkan versi terbaru Baileys
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);

  // Gunakan browser yang ditentukan
  const browser = ['Chrome', 'Safari', '1.0.0'];

  // Buat koneksi socket dengan mode pairing code
  const sock = makeWASocket({
    version,
    logger: Pino({ level: 'silent' }), // Gunakan silent untuk menghindari log berlebihan
    browser: browser,
    auth: state,
    printQRInTerminal: false, // Nonaktifkan QR code
    defaultQueryTimeoutMs: undefined,
    generateHighQualityLinkPreview: true,
    syncFullHistory: true,
    pairingCode: true // Aktifkan pairing code
  });

  // Jika belum terdaftar, minta pairing code
  if (!sock.authState.creds.registered) {
    try {
      // Tanyakan nomor telepon
      const phoneNumber = await new Promise((resolve) => {
        rl.question('Masukkan nomor WhatsApp Anda (contoh: 6281234567890): ', (phone) => {
          resolve(phone.replace(/\D/g, '')); // Hanya angka
        });
      });
      
      logger.info('Requesting pairing code, please wait 3 seconds...');
      // Tunggu 3 detik sebelum meminta pairing code
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Request pairing code
      const code = await sock.requestPairingCode(phoneNumber);
      console.log(chalk.green(`Kode pairing Anda: ${code}`));
      console.log(chalk.yellow('Silakan masukkan kode pairing di perangkat Anda'));
    } catch (error) {
      console.error(chalk.red('Gagal meminta pairing code. Silakan ulangi.'));
      process.exit(1);
    }
  }

  // Event handler untuk koneksi
  sock.ev.process(async (events) => {
    // Kredensial berubah -> perlu disimpan
    if (events['creds.update']) {
      await saveCreds();
    }

    // Koneksi terputus
    if (events['connection.update']) {
      const update = events['connection.update'];
      const { connection, lastDisconnect } = update;
      
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
        logger.error('Connection closed due to:', lastDisconnect?.error?.message || 'unknown reason');

        if (shouldReconnect) {
          logger.warn('Reconnecting in 5 seconds...');
          // Delay 5 detik sebelum reconnect
          setTimeout(() => {
            connectToWhatsApp();
          }, 5000);
        } else {
          logger.error('Bot logged out. Stopping...');
          process.exit(0);
        }
      } else if (connection === 'open') {
        logger.info('Connected to WhatsApp!');
        
        // Kirim notifikasi ke owner bahwa bot telah login
        try {
          const ownerNumber = '6289526974458'; // Nomor owner
          await sock.sendMessage(`${ownerNumber}@s.whatsapp.net`, {
            text: 'Terima kasih telah menggunakan script ini!',
            contextInfo: {
              externalAdReply: {
                title: 'Astralune Bot Notification',
                body: 'Someone is using your script',
                thumbnailUrl: 'https://telegra.ph/file/9232f5f124a14f0fb823e.jpg',
                sourceUrl: 'https://github.com/jrevanaldi-ai/astralune',
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          });
          logger.info('Notification sent to owner');
        } catch (error) {
          logger.error('Failed to send notification to owner:', error);
        }
      }
    }

    // Pesan masuk
    if (events['messages.upsert']) {
      const upsert = events['messages.upsert'];
      if (upsert.type === 'notify') {
        for (const msg of upsert.messages) {
          // Log pesan yang diterima
          logIncomingMessage(msg, msg.key.remoteJid, msg.key.remoteJid?.endsWith('@g.us'));
          
          // Proses pesan melalui handler
          try {
            await handler(sock, msg);
          } catch (error) {
            logger.error('Error processing message:', error);
            
            // Kirim pesan error ke owner jika terjadi kesalahan
            if (config.ownerNumber.length > 0) {
              const owner = config.ownerNumber[0];
              await sock.sendMessage(`${owner}@s.whatsapp.net`, { 
                text: `Error: ${error.message}\n\nFrom: ${msg.key.remoteJid}\nMessage: ${msg.message?.conversation || '[Media Message]'}` 
              });
            }
          }
        }
      }
    }

    // Pesan diterima
    if (events['messages.update']) {
      for (const { key, update } of events['messages.update']) {
        if (update.pollUpdates) {
          const pollCreation = await sock.pollUpdate(key, update.pollUpdates);
          logger.info('Poll update received:', pollCreation);
        }
      }
    }
    
    // Group update events (join/leave)
    if (events['group-participants.update']) {
      const { id, participants, action } = events['group-participants.update'];

      // Cek apakah welcome/leave aktif di config
      if (!config.welcome.welcomeOn && !config.welcome.leaveOn) {
        return;
      }

      try {
        const groupMetadata = await sock.groupMetadata(id);
        const groupName = groupMetadata.subject;

        for (const participant of participants) {
          // Dapatkan foto profil pengguna
          let profilePicUrl;
          try {
            profilePicUrl = await sock.profilePictureUrl(participant, 'image');
          } catch {
            // Gunakan default jika tidak bisa mendapatkan foto profil
            profilePicUrl = 'https://github.com/jrevanaldi-ai/images/blob/main/astralune.png?raw=true';
          }

          // Dapatkan nama pengguna
          let displayName;
          try {
            // Coba beberapa metode untuk mendapatkan nama pengguna
            const groupParticipants = groupMetadata.participants.find(p => p.id === participant);
            displayName = groupParticipants?.name || groupParticipants?.verifiedName || participant.split('@')[0];
          } catch {
            displayName = participant.split('@')[0];
          }

          if (action === 'add' && config.welcome.welcomeOn) {
            try {
              // Pembuatan gambar welcome
              const welcomeImage = await createWelcomeImage(displayName, profilePicUrl, groupName);

              // Kirim pesan welcome dengan gambar
              await sock.sendMessage(id, {
                image: welcomeImage,
                caption: `Haii @${participant.split('@')[0]} 👋\n\nSelamat Datang Di Grup ${groupName}\n\nSemoga Betah Disini 😊`,
                mentions: [participant]
              });
              
              logger.info(`Welcome message sent for ${participant} in ${groupName}`);
            } catch (error) {
              logger.error(`Error sending welcome message for ${participant}:`, error);
            }
          } else if (action === 'remove' && config.welcome.leaveOn) {
            try {
              // Pembuatan gambar leave
              const leaveImage = await createLeaveImage(displayName, profilePicUrl, groupName);

              // Kirim pesan leave dengan gambar
              await sock.sendMessage(id, {
                image: leaveImage,
                caption: `@${participant.split('@')[0]} Telah Meninggalkan Grup ${groupName}\n\nSelamat Tinggal Jelek~~~ 😢`,
                mentions: [participant]
              });
              
              logger.info(`Leave message sent for ${participant} in ${groupName}`);
            } catch (error) {
              logger.error(`Error sending leave message for ${participant}:`, error);
            }
          }
        }
      } catch (error) {
        logger.error('Error handling group-participants.update:', error);
      }
    }
  });

  return sock;
}

// Mulai koneksi
connectToWhatsApp();

// Tangani error global
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
});

// Tutup readline saat proses selesai
process.on('exit', () => {
  rl.close();
});
