import fs from 'fs';
import path from 'path';
import { readJSON, writeJSON } from '../utils/index.js';

export class JSONDB {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = readJSON(this.filePath, {});
  }

  save() {
    writeJSON(this.filePath, this.data);
  }

  get(key, defaultValue = null) {
    const keys = key.split('.');
    let current = this.data;

    for (const k of keys) {
      if (current[k] === undefined) {
        return defaultValue;
      }
      current = current[k];
    }

    return current;
  }

  set(key, value) {
    const keys = key.split('.');
    let current = this.data;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (current[k] === undefined) {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
    this.save();
  }

  delete(key) {
    const keys = key.split('.');
    let current = this.data;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (current[k] === undefined) {
        return false;
      }
      current = current[k];
    }

    delete current[keys[keys.length - 1]];
    this.save();
    return true;
  }

  has(key) {
    return this.get(key) !== null;
  }

  all() {
    return this.data;
  }

  reset() {
    this.data = {};
    this.save();
  }
}

export function formatText(text, options = {}) {
  const {
    bold = false,
    italic = false,
    underline = false,
    strikethrough = false,
    quote = false
  } = options;

  let formatted = text;

  if (bold) formatted = `*${formatted}*`;
  if (italic) formatted = `_${formatted}_`;
  if (underline) formatted = `~${formatted}~`;
  if (strikethrough) formatted = `~${formatted}~`;
  if (quote) formatted = `>${formatted}`;

  return formatted;
}

export function createTable(headers, rows) {
  const colWidths = headers.map((header, index) => {
    let maxWidth = header.length;
    rows.forEach(row => {
      if (row[index] && row[index].toString().length > maxWidth) {
        maxWidth = row[index].toString().length;
      }
    });
    return maxWidth;
  });

  let table = '|';
  headers.forEach((header, index) => {
    table += ` ${header.padEnd(colWidths[index])} |`;
  });
  table += '\n|';
  
  headers.forEach((_, index) => {
    table += ` ${'-'.repeat(colWidths[index])} |`;
  });
  table += '\n';

  rows.forEach(row => {
    table += '|';
    row.forEach((cell, index) => {
      table += ` ${cell.toString().padEnd(colWidths[index])} |`;
    });
    table += '\n';
  });

  return table;
}

export function createLoadingAnimation() {
  const frames = ['|', '/', '-', '\\'];
  let i = 0;
  
  return setInterval(() => {
    process.stdout.write(`\rLoading ${frames[i++]}`);
    i %= frames.length;
  }, 200);
}

export function clearLoadingAnimation(intervalId) {
  clearInterval(intervalId);
  process.stdout.write('\r');
}

export function createProgressBar(current, total, length = 20) {
  const percentage = Math.round((current / total) * 100);
  const filledLength = Math.round((current / total) * length);
  const emptyLength = length - filledLength;
  
  const bar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);
  
  return `[${bar}] ${percentage}% (${current}/${total})`;
}

export class SimpleCache {
  constructor(ttl = 60000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    const expiry = Date.now() + this.ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  has(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export * from './cache.js';