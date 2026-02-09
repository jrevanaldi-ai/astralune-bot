import { config } from '../config.js';

export const handler = {
  tag: 'owner',
  cmd: ['broadcast', 'bc'],
  aliases: ['broadcastall'],
  owner: true
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mengirim pesan ke semua grup yang diikuti bot.\nContoh: .broadcast halo semuanya!'
    }, { quoted: message });
    return;
  }

  const broadcastMessage = args.join(' ');

  try {
    // Dapatkan daftar semua grup yang diikuti bot
    const groupIds = [];
    
    // Dapatkan daftar grup dari fungsi Baileys
    try {
      // Ambil semua grup yang bot ikuti
      const groupData = await sock.groupFetchAllParticipating();
      groupIds.push(...Object.keys(groupData));
    } catch (error) {
      console.error('Gagal mengambil daftar grup:', error.message);
    }

    if (groupIds.length === 0) {
      await sock.sendMessage(message.key.remoteJid, {
        text: 'Bot tidak bergabung dalam grup manapun.'
      }, { quoted: message });
      return;
    }

    await sock.sendMessage(message.key.remoteJid, {
      text: `Sedang mengirim pesan broadcast ke ${groupIds.length} grup...`
    }, { quoted: message });

    let successCount = 0;
    let failCount = 0;

    // Kirim pesan ke setiap grup
    for (const groupId of groupIds) {
      try {
        await sock.sendMessage(groupId, {
          text: `*Broadcast dari Owner:*\n\n${broadcastMessage}`
        });
        successCount++;
      } catch (error) {
        console.error(`Gagal mengirim ke grup ${groupId}:`, error.message);
        failCount++;
      }
    }

    await sock.sendMessage(message.key.remoteJid, {
      text: `Broadcast selesai!\n\nSukses: ${successCount} grup\nGagal: ${failCount} grup`
    }, { quoted: message });

  } catch (error) {
    console.error('Broadcast error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat melakukan broadcast: ${error.message}`
    }, { quoted: message });
  }
}