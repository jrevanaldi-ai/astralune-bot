import fs from 'fs';
import path from 'path';

export async function sendMessage(sock, jid, message, quoted = null, options = {}) {
  return sock.sendMessage(jid, message, { quoted, ...options });
}

export async function sendDelayedMessage(sock, jid, message, delay = 1000, quoted = null) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return sendMessage(sock, jid, message, quoted);
}

export async function editMessage(sock, jid, message, key, options = {}) {
  return sock.sendMessage(jid, { ...message, edit: key }, options);
}

export async function sendTemplateMessage(sock, jid, title, body, footer, buttonText, sections, quoted = null) {
  const templateButtons = [
    {
      index: 1,
      urlButton: {
        displayText: buttonText.url,
        url: buttonText.urlValue
      }
    },
    {
      index: 2,
      quickReplyButton: {
        displayText: buttonText.quickReply,
        id: buttonText.quickReplyId
      }
    }
  ];

  const templateMessage = {
    document: { url: 'https://example.com/file.pdf' },
    mimetype: 'application/pdf',
    fileName: 'example.pdf',
    footer: footer,
    caption: `*${title}*\n\n${body}`,
    templateButtons: templateButtons,
    headerType: 1
  };

  return sock.sendMessage(jid, templateMessage, { quoted });
}

export async function sendButtonMessage(sock, jid, title, body, footer, buttons, quoted = null) {
  const buttonMessage = {
    text: `*${title}*\n\n${body}\n\n${footer}`,
    footer: footer,
    buttons: buttons,
    headerType: 1
  };

  return sock.sendMessage(jid, buttonMessage, { quoted });
}

export async function sendListMessage(sock, jid, title, description, footer, buttonText, sections, quoted = null) {
  const message = {
    text: title,
    footer: footer,
    title: description,
    buttonText: buttonText,
    sections: sections
  };

  return sock.sendMessage(jid, message, { quoted });
}

export async function downloadMediaMessage(m, type, pathFile) {
  if (!m.message) return;
  
  const stream = await m.download();
  let buffer;
  
  if (typeof stream === 'object') {
    buffer = await stream.toArray();
  } else {
    buffer = stream;
  }
  
  const write = fs.createWriteStream(pathFile);
  buffer.pipe(write);
  
  return new Promise((resolve, reject) => {
    write.on('finish', () => resolve(pathFile));
    write.on('error', reject);
  });
}

export function isMedia(message) {
  const type = Object.keys(message)[0];
  const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'];
  return mediaTypes.includes(type);
}

export function isImage(message) {
  const type = Object.keys(message)[0];
  return type === 'imageMessage';
}

export function isVideo(message) {
  const type = Object.keys(message)[0];
  return type === 'videoMessage';
}

export function isAudio(message) {
  const type = Object.keys(message)[0];
  return type === 'audioMessage';
}

export function isDocument(message) {
  const type = Object.keys(message)[0];
  return type === 'documentMessage';
}

export function isSticker(message) {
  const type = Object.keys(message)[0];
  return type === 'stickerMessage';
}

export function getMessageId(message) {
  return message.key.id;
}

export function getSender(message) {
  return message.key.remoteJid;
}

export function isGroupMsg(message) {
  return message.key.remoteJid.endsWith('@g.us');
}

export function getSenderNumber(message) {
  return message.key.remoteJid.replace('@s.whatsapp.net', '');
}

export function getMessageTimestamp(message) {
  return message.messageTimestamp;
}