export const handler = {
  tag: 'tools',
  cmd: ['getchid', 'getchannelid'],
  aliases: ['channelid'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  // Cek apakah pesan dikirim dari grup atau channel
  if (!message.key.remoteJid.endsWith('@g.us') && !message.key.remoteJid.endsWith('@newsletter')) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Perintah ini hanya bisa digunakan di grup atau channel WhatsApp.'
    }, { quoted: message });
    return;
  }

  try {
    // Dapatkan metadata grup/channel
    let metadata;
    try {
      metadata = await sock.groupMetadata(message.key.remoteJid);
    } catch (error) {
      // Jika bukan grup, mungkin ini adalah channel
      // Untuk channel, kita hanya bisa mengambil ID dari remoteJid
      await sock.sendMessage(message.key.remoteJid, {
        text: `*ID Channel/Grup:* ${message.key.remoteJid}\n\nCatatan: Ini adalah ID dari chat saat ini.`
      }, { quoted: message });
      return;
    }

    // Format informasi channel/grup
    const channelId = message.key.remoteJid;
    const channelName = metadata.subject || 'Nama tidak tersedia';
    const channelDesc = metadata.desc || 'Deskripsi tidak tersedia';
    const memberCount = metadata.participants ? metadata.participants.length : 'Tidak diketahui';

    const responseText = `
*Informasi Channel/Grup:*
*ID:* ${channelId}
*Nama:* ${channelName}
*Deskripsi:* ${channelDesc}
*Jumlah Member:* ${memberCount}

*Catatan:* ID ini bisa digunakan untuk berbagai keperluan administrasi bot.
    `.trim();

    await sock.sendMessage(message.key.remoteJid, {
      text: responseText
    }, { quoted: message });

  } catch (error) {
    console.error('Get Channel ID error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat mengambil informasi channel: ${error.message}`
    }, { quoted: message });
  }
}