import sharp from 'sharp';
import axios from 'axios';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

/**
 * Fungsi untuk membuat gambar welcome
 * @param {string} displayName - Nama pengguna
 * @param {string} avatarUrl - URL avatar pengguna
 * @param {string} groupName - Nama grup
 * @returns {Promise<Buffer>} - Buffer gambar yang dihasilkan
 */
export async function createWelcomeImage(displayName, avatarUrl, groupName) {
  try {
    // Buat canvas
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Latar belakang gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Tambahkan animasi SVG sebagai dekorasi (menggunakan SVG sederhana)
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillText('✦', x, y);
    }

    // Gambar border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, width - 10, height - 10);

    // Ambil avatar pengguna
    let avatarBuffer;
    try {
      const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
      avatarBuffer = response.data;
    } catch (error) {
      // Jika gagal mengambil avatar, gunakan placeholder
      avatarBuffer = await getDefaultAvatar(displayName);
    }

    // Konversi avatar ke canvas
    const avatarImage = await loadImage(avatarBuffer);
    
    // Gambar lingkaran untuk avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, 120, 80, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    
    // Gambar avatar
    const avatarWidth = 160;
    const avatarHeight = 160;
    ctx.drawImage(avatarImage, width / 2 - avatarWidth / 2, 120 - avatarHeight / 2, avatarWidth, avatarHeight);
    
    ctx.restore();

    // Gambar border untuk avatar
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(width / 2, 120, 80, 0, Math.PI * 2, true);
    ctx.stroke();

    // Teks welcome
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    
    // Nama pengguna
    ctx.font = 'bold 30px Arial';
    ctx.fillText(`Haii ${displayName}`, width / 2, 220);
    
    // Teks selamat datang
    ctx.font = '20px Arial';
    ctx.fillText('Selamat Datang Di Grup', width / 2, 260);
    
    // Nama grup
    ctx.font = 'italic 18px Arial';
    ctx.fillText(groupName, width / 2, 300);

    // Tambahkan elemen dekoratif
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillText('✦', 50, 50);
    ctx.fillText('✦', width - 80, height - 30);
    ctx.fillText('✦', 50, height - 30);
    ctx.fillText('✦', width - 80, 50);

    // Konversi canvas ke buffer
    const buffer = canvas.toBuffer('image/png');
    
    return buffer;
  } catch (error) {
    console.error('Error creating welcome image:', error);
    throw error;
  }
}

/**
 * Fungsi untuk membuat gambar leave
 * @param {string} displayName - Nama pengguna
 * @param {string} avatarUrl - URL avatar pengguna
 * @param {string} groupName - Nama grup
 * @returns {Promise<Buffer>} - Buffer gambar yang dihasilkan
 */
export async function createLeaveImage(displayName, avatarUrl, groupName) {
  try {
    // Buat canvas
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Latar belakang gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f093fb');
    gradient.addColorStop(1, '#f5576c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Tambahkan animasi SVG sebagai dekorasi (menggunakan SVG sederhana)
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillText('✦', x, y);
    }

    // Gambar border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, width - 10, height - 10);

    // Ambil avatar pengguna
    let avatarBuffer;
    try {
      const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
      avatarBuffer = response.data;
    } catch (error) {
      // Jika gagal mengambil avatar, gunakan placeholder
      avatarBuffer = await getDefaultAvatar(displayName);
    }

    // Konversi avatar ke canvas
    const avatarImage = await loadImage(avatarBuffer);
    
    // Gambar lingkaran untuk avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, 120, 80, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    
    // Gambar avatar
    const avatarWidth = 160;
    const avatarHeight = 160;
    ctx.drawImage(avatarImage, width / 2 - avatarWidth / 2, 120 - avatarHeight / 2, avatarWidth, avatarHeight);
    
    ctx.restore();

    // Gambar border untuk avatar
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(width / 2, 120, 80, 0, Math.PI * 2, true);
    ctx.stroke();

    // Teks leave
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    
    // Nama pengguna
    ctx.font = 'bold 30px Arial';
    ctx.fillText(displayName, width / 2, 220);
    
    // Teks selamat tinggal
    ctx.font = '20px Arial';
    ctx.fillText('Selamat Tinggal Jelek~~~', width / 2, 260);
    
    // Nama grup
    ctx.font = 'italic 18px Arial';
    ctx.fillText(groupName, width / 2, 300);

    // Tambahkan elemen dekoratif
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillText('✦', 50, 50);
    ctx.fillText('✦', width - 80, height - 30);
    ctx.fillText('✦', 50, height - 30);
    ctx.fillText('✦', width - 80, 50);

    // Konversi canvas ke buffer
    const buffer = canvas.toBuffer('image/png');
    
    return buffer;
  } catch (error) {
    console.error('Error creating leave image:', error);
    throw error;
  }
}

/**
 * Fungsi untuk membuat avatar default jika tidak bisa mengambil avatar asli
 * @param {string} displayName - Nama pengguna
 * @returns {Promise<Buffer>} - Buffer avatar default
 */
async function getDefaultAvatar(displayName) {
  const canvas = createCanvas(160, 160);
  const ctx = canvas.getContext('2d');
  
  // Latar belakang lingkaran
  const gradient = ctx.createRadialGradient(80, 80, 0, 80, 80, 80);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba4');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(80, 80, 80, 0, Math.PI * 2);
  ctx.fill();
  
  // Inisial nama
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayName.charAt(0).toUpperCase(), 80, 80);
  
  return canvas.toBuffer('image/png');
}

// Export fungsi-fungsi
export default {
  createWelcomeImage,
  createLeaveImage
};