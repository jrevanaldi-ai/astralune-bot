export const handler = {
  tag: 'owner',
  cmd: ['reload'],
  aliases: ['refresh'],
  owner: true
};

export async function execute(ctx) {
  const { sock, message } = ctx;

  try {
    await global.reloadCommands();
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Perintah berhasil dimuat ulang!'
    }, { quoted: message });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, {
      text: `Error saat memuat ulang perintah: ${error.message}`
    }, { quoted: message });
  }
}