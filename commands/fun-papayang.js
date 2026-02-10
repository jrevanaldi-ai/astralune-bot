export const handler = {
  tag: 'fun',
  cmd: ['papayang', 'pp'],
  aliases: ['papayang'],
  owner: false
};

export async function execute(ctx) {
  const { sock, message } = ctx;

  try {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Sedang mengambil gambar papayang, mohon tunggu...'
    }, { quoted: message });

    const response = await fetch('https://api-faa.my.id/faa/papayang');
    
    if (!response.ok) {
      await sock.sendMessage(message.key.remoteJid, {
        text: 'Gagal mengambil gambar papayang.'
      }, { quoted: message });
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    
    await sock.sendMessage(message.key.remoteJid, {
      image: imageBuffer,
      caption: 'Gambar Papayang',
      mimetype: 'image/jpeg'
    }, { quoted: message });
  } catch (error) {
    console.error('Papayang error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan saat mengambil gambar papayang: ${error.message}`
    }, { quoted: message });
  }
}