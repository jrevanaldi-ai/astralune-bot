import util from 'util';

export const handler = {
  tag: 'owner',
  cmd: ['eval'],
  aliases: ['ev'],
  owner: true
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  const text = args.join(' ');
  if (!text) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mengevaluasi kode JavaScript.\nContoh: .eval 1+1'
    }, { quoted: message });
    return;
  }

  try {
    let evaled = await eval(text);
    
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
  }
}