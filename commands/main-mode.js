import { isOwner } from '../helper/index.js';

export const handler = {
  tag: 'main',
  cmd: ['self', 'public'],
  aliases: ['mode'],
  owner: true
};

let isPublicMode = true;

export async function execute(ctx) {
  const { sock, message, args, sender } = ctx;

  if (!isOwner(sender, { ownerNumber: ['6281234567890'] })) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Perintah ini hanya dapat digunakan oleh owner!'
    }, { quoted: message });
    return;
  }

  const mode = args[0]?.toLowerCase();

  if (mode === 'self') {
    isPublicMode = false;
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Mode telah diubah ke SELF. Bot hanya merespons pesan dari owner.'
    }, { quoted: message });
  } else if (mode === 'public') {
    isPublicMode = true;
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Mode telah diubah ke PUBLIC. Bot merespons semua pesan.'
    }, { quoted: message });
  } else {
    const currentMode = isPublicMode ? 'PUBLIC' : 'SELF';
    await sock.sendMessage(message.key.remoteJid, {
      text: `Mode saat ini: ${currentMode}\nGunakan .self untuk mode pribadi atau .public untuk mode publik.`
    }, { quoted: message });
  }
}

export function isPublic() {
  return isPublicMode;
}