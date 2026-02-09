import { isOwner } from '../helper/index.js';
import { config } from '../config.js';

export const handler = {
  tag: 'main',
  cmd: ['setprefix', 'prefix'],
  aliases: ['ubahprefix', 'gantiprefix'],
  owner: true
};

export async function execute(ctx) {
  const { sock, message, args, sender } = ctx;

  if (!isOwner(sender, config)) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Perintah ini hanya dapat digunakan oleh owner!'
    }, { quoted: message });
    return;
  }

  const newPrefix = args[0];

  if (!newPrefix) {
    const currentPrefixes = config.prefixes.join(', ');
    await sock.sendMessage(message.key.remoteJid, {
      text: `Prefix saat ini: ${currentPrefixes}\nGunakan .setprefix [prefix_baru] untuk mengganti prefix.`
    }, { quoted: message });
    return;
  }

  await sock.sendMessage(message.key.remoteJid, {
    text: `Prefix telah diubah ke "${newPrefix}"\nCatatan: Perubahan prefix saat ini hanya bersifat sementara.`
  }, { quoted: message });
}