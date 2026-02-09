import fs from 'fs';
import path from 'path';

export function sendMessageWithEdit(sock, jid, message, quoted = null, options = {}) {
  return sock.sendMessage(jid, message, { quoted, ...options });
}

export function isOwner(sender, config) {
  return config.ownerNumber.includes(sender.replace('@s.whatsapp.net', ''));
}

export function getTime(format = 'HH:mm:ss') {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  if (format === 'HH:mm:ss') {
    return `${hours}:${minutes}:${seconds}`;
  }

  return now.toLocaleString();
}

export function cleanText(text) {
  return text.replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, '');
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isNumber(str) {
  return /^\d+$/.test(str);
}

export function getFileSize(filePath) {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    return stats.size;
  }
  return 0;
}

export function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export function mergeArrays(arr1, arr2) {
  return [...new Set([...arr1, ...arr2])];
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getFormattedDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

export * from './message.js';