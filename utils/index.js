import fs from 'fs';
import path from 'path';

export function readJSON(filePath, defaultValue = {}) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    return defaultValue;
  }
}

export function writeJSON(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error);
  }
}

export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

export function isDirectory(dirPath) {
  try {
    const stat = fs.statSync(dirPath);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}

export function getAllFiles(dirPath, ext = '.js') {
  if (!fs.existsSync(dirPath)) return [];

  const files = fs.readdirSync(dirPath);
  return files.filter(file => path.extname(file) === ext);
}

export function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  return diffDays;
}

export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function isValidWA(number) {
  const cleanedNumber = number.replace(/\D/g, '');

  if (cleanedNumber.length < 10 || cleanedNumber.length > 15) {
    return false;
  }

  if (!/^\d/.test(cleanedNumber)) {
    return false;
  }

  return true;
}

export function cleanWA(number) {
  let cleanedNumber = number.replace(/\D/g, '');

  if (cleanedNumber.startsWith('0')) {
    cleanedNumber = '62' + cleanedNumber.substring(1);
  } else if (cleanedNumber.startsWith('62')) {
    cleanedNumber = '62' + cleanedNumber;
  } else if (cleanedNumber.startsWith('8')) {
    cleanedNumber = '62' + cleanedNumber;
  }

  return cleanedNumber;
}

export * from './logger.js';
export * from './functions.js';