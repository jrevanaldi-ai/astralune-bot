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
      text: 'Gunakan perintah ini untuk mengirim pesan ke semua grup atau grup tertentu.\nContoh: .broadcast halo semuanya!\nUntuk memilih grup, gunakan: .broadcast list'
    }, { quoted: message });
    return;
  }

  const command = args[0].toLowerCase();

  if (command === 'list') {
    // Tampilkan daftar grup yang diikuti bot
    try {
      const groupData = await sock.groupFetchAllParticipating();
      if (!groupData || Object.keys(groupData).length === 0) {
        await sock.sendMessage(message.key.remoteJid, {
          text: 'Bot tidak bergabung dalam grup manapun.'
        }, { quoted: message });
        return;
      }

      // Urutkan grup berdasarkan jumlah member (descending)
      const sortedGroups = Object.entries(groupData).sort((a, b) => {
        const membersA = a[1].participants ? a[1].participants.length : 0;
        const membersB = b[1].participants ? b[1].participants.length : 0;
        return membersB - membersA;
      });

      let groupList = '*Daftar Grup (diurutkan berdasarkan jumlah member):*\n\n';
      sortedGroups.forEach(([jid, data], index) => {
        const memberCount = data.participants ? data.participants.length : 0;
        groupList += `${index + 1}. *${data.subject}*\n`;
        groupList += `   ID: ${jid}\n`;
        groupList += `   Member: ${memberCount}\n\n`;
      });

      groupList += 'Balas pesan ini dengan angka untuk mengirim broadcast ke grup tertentu.';
      await sock.sendMessage(message.key.remoteJid, {
        text: groupList
      }, { quoted: message });

    } catch (error) {
      console.error('Gagal mengambil daftar grup:', error);
      await sock.sendMessage(message.key.remoteJid, {
        text: `Terjadi kesalahan saat mengambil daftar grup: ${error.message}`
      }, { quoted: message });
    }
  } else {
    // Kirim broadcast ke semua grup atau grup tertentu berdasarkan reply
    const broadcastMessage = args.join(' ');

    // Cek apakah pesan ini adalah reply ke daftar grup
    if (message.message.extendedTextMessage?.contextInfo?.quotedMessage) {
      // Ini adalah reply ke daftar grup, kirim ke grup tertentu
      const quotedMessage = message.message.extendedTextMessage.contextInfo.quotedMessage;
      const quotedText = quotedMessage.conversation || '';

      // Cek apakah pesan yang direply adalah daftar grup
      if (quotedText.includes('Daftar Grup (diurutkan berdasarkan jumlah member):')) {
        // Ambil angka dari pesan saat ini (reply)
        const targetIndex = parseInt(broadcastMessage.trim());

        if (isNaN(targetIndex) || targetIndex < 1) {
          await sock.sendMessage(message.key.remoteJid, {
            text: 'Silakan balas dengan angka yang valid (dimulai dari 1 sesuai daftar grup).'
          }, { quoted: message });
          return;
        }

        try {
          const groupData = await sock.groupFetchAllParticipating();
          if (!groupData || Object.keys(groupData).length === 0) {
            await sock.sendMessage(message.key.remoteJid, {
              text: 'Bot tidak bergabung dalam grup manapun.'
            }, { quoted: message });
            return;
          }

          // Urutkan grup berdasarkan jumlah member (descending)
          const sortedGroups = Object.entries(groupData).sort((a, b) => {
            const membersA = a[1].participants ? a[1].participants.length : 0;
            const membersB = b[1].participants ? b[1].participants.length : 0;
            return membersB - membersA;
          });

          if (targetIndex > sortedGroups.length) {
            await sock.sendMessage(message.key.remoteJid, {
              text: `Angka tidak valid. Hanya ada ${sortedGroups.length} grup.`
            }, { quoted: message });
            return;
          }

          // Ambil grup target
          const [targetGroupId, targetGroupData] = sortedGroups[targetIndex - 1];

          // Kirim pesan broadcast ke grup tertentu
          await sock.sendMessage(targetGroupId, {
            text: `*Broadcast dari Owner:*\n\n${broadcastMessage}`,
            contextInfo: {
              externalAdReply: {
                title: 'Astralune Bot Broadcast',
                body: 'Pesan dari owner bot',
                thumbnailUrl: 'https://github.com/jrevanaldi-ai/images/blob/main/astralune.png?raw=true',
                sourceUrl: 'https://github.com/jrevanaldi-ai/astralune',
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          });

          await sock.sendMessage(message.key.remoteJid, {
            text: `Broadcast berhasil dikirim ke grup: ${targetGroupData.subject}`
          }, { quoted: message });

        } catch (error) {
          console.error('Gagal mengirim broadcast ke grup tertentu:', error);
          await sock.sendMessage(message.key.remoteJid, {
            text: `Terjadi kesalahan saat mengirim broadcast ke grup: ${error.message}`
          }, { quoted: message });
        }

        return;
      }
    }

    // Jika bukan reply ke daftar grup, kirim ke semua grup
    try {
      const groupData = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groupData || {});

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
            text: `*Broadcast dari Owner:*\n\n${broadcastMessage}`,
            contextInfo: {
              externalAdReply: {
                title: 'Astralune Bot Broadcast',
                body: 'Pesan dari owner bot',
                thumbnailUrl: 'https://github.com/jrevanaldi-ai/images/blob/main/astralune.png?raw=true',
                sourceUrl: 'https://github.com/jrevanaldi-ai/astralune',
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
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
}