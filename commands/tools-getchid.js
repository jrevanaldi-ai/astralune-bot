export const handler = {
  tag: 'tools',
  cmd: ['getchid', 'getchannelid'],
  aliases: ['channelid'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  // Cek apakah pesan dikirim dari channel (newsletter)
  if (!message.key.remoteJid.endsWith('@newsletter')) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Perintah ini hanya bisa digunakan di channel WhatsApp (newsletter).'
    }, { quoted: message });
    return;
  }

  try {
    // Untuk channel (newsletter), kita hanya bisa mengambil ID dari remoteJid
    // Karena Baileys tidak menyediakan metadata lengkap untuk channel seperti halnya grup
    const channelId = message.key.remoteJid;

    const responseText = `
*Informasi Channel:*
*ID Channel:* ${channelId}

*Catatan:* Ini adalah ID unik dari channel WhatsApp ini. ID ini bisa digunakan untuk berbagai keperluan administrasi bot.
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