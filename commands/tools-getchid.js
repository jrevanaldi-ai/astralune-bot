export const handler = {
  tag: 'tools',
  cmd: ['getchid', 'getchannelid'],
  aliases: ['channelid'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  try {
    // Ambil ID dari chat saat ini (bisa private chat, grup, atau channel)
    const chatId = message.key.remoteJid;

    // Deteksi jenis chat
    let chatType = 'Private Chat';
    if (chatId.endsWith('@g.us')) {
      chatType = 'Group';
    } else if (chatId.endsWith('@newsletter')) {
      chatType = 'Newsletter Channel';
    } else if (chatId.endsWith('@s.whatsapp.net')) {
      chatType = 'Private Chat';
    }

    const responseText = `
*Informasi Chat Saat Ini:*
*Jenis:* ${chatType}
*ID:* ${chatId}

*Catatan:* Ini adalah ID unik dari chat ini. ID ini bisa digunakan untuk berbagai keperluan administrasi bot.
    `.trim();

    await sock.sendMessage(message.key.remoteJid, {
      text: responseText
    }, { quoted: message });

  } catch (error) {
    console.error('Get Chat ID error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat mengambil informasi chat: ${error.message}`
    }, { quoted: message });
  }
}