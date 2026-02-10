import util from 'util';

export const handler = {
  tag: 'owner',
  cmd: null, // Akan ditangani secara khusus karena menggunakan prefiks unik
  aliases: [],
  owner: true
};

// Fungsi ini akan dipanggil secara khusus dari handler utama
export async function executeEval(ctx) {
  const { sock, message, args, isOwner, text } = ctx;

  if (!isOwner) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Anda tidak memiliki izin untuk menggunakan perintah ini.'
    }, { quoted: message });
    return;
  }

  // Cek apakah pesan dimulai dengan =>
  if (!text.startsWith('=>')) {
    return; // Ini bukan perintah eval khusus
  }

  const code = text.substring(2).trim(); // Ambil teks setelah =>
  
  if (!code) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mengevaluasi ekspresi JavaScript.\nContoh: => 1+1'
    }, { quoted: message });
    return;
  }

  try {
    let evaled = await eval(`(async () => { return ${code} })()`);
    
    // Jika hasil evaluasi adalah promise, tunggu hasilnya
    if (evaled instanceof Promise) {
      evaled = await evaled;
    }

    const result = typeof evaled !== 'string' ? util.inspect(evaled, { depth: 0 }) : evaled;
    
    await sock.sendMessage(message.key.remoteJid, {
      text: result.substring(0, 4000)
    }, { quoted: message });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, {
      text: `Error: ${error.message}`
    }, { quoted: message });
    console.error(error);
  }
}

// Fungsi utama untuk diekspor
export async function execute(ctx) {
  // Panggil fungsi eval khusus
  await executeEval(ctx);
}