export const handler = {
  tag: 'tools',
  cmd: ['getchid', 'getchannelid'],
  aliases: ['channelid'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mendapatkan ID channel dari URL channel WhatsApp.\nContoh: .getchid https://whatsapp.com/newsletter/CHANNEL_ID'
    }, { quoted: message });
    return;
  }

  const url = args[0];

  try {
    // Validasi apakah input adalah URL
    let channelId = null;
    
    // Cocokkan pola URL channel WhatsApp
    const channelUrlPattern = /(?:https?:\/\/)?(?:www\.)?whatsapp\.com\/newsletter\/([A-Za-z0-9._-]+)/i;
    const match = url.match(channelUrlPattern);
    
    if (match && match[1]) {
      // Ambil ID channel dari URL
      const channelIdentifier = match[1];
      // Format ID channel newsletter di WhatsApp
      channelId = `${channelIdentifier}@newsletter`;
    } else {
      // Jika tidak cocok dengan pola URL, coba cocokkan dengan ID langsung
      if (url.includes('@newsletter')) {
        channelId = url;
      } else {
        // Jika tidak dalam format URL atau ID langsung, beri tahu pengguna
        await sock.sendMessage(message.key.remoteJid, {
          text: 'Format URL tidak valid. Gunakan format: https://whatsapp.com/newsletter/CHANNEL_ID'
        }, { quoted: message });
        return;
      }
    }

    const responseText = `
*Informasi Channel:*
*URL:* ${url}
*ID Channel:* ${channelId}
*Jenis:* Newsletter Channel

*Catatan:* Ini adalah ID unik dari channel WhatsApp yang bisa digunakan untuk berbagai keperluan.
    `.trim();

    await sock.sendMessage(message.key.remoteJid, {
      text: responseText
    }, { quoted: message });

  } catch (error) {
    console.error('Get Channel ID error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat memproses URL: ${error.message}`
    }, { quoted: message });
  }
}