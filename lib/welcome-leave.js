import { Canvas, Image, loadImage } from '@napi-rs/canvas';
import sharp from 'sharp';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * Fungsi untuk membuat gambar welcome menggunakan @napi-rs/canvas
 * @param {string} displayName - Nama pengguna
 * @param {string} avatarUrl - URL avatar pengguna
 * @param {string} groupName - Nama grup
 * @returns {Promise<Buffer>} - Buffer gambar yang dihasilkan
 */
export async function createWelcomeImage(displayName, avatarUrl, groupName) {
  try {
    // Buat canvas
    const canvas = new Canvas(800, 400);
    const ctx = canvas.getContext('2d');

    // Latar belakang gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 400);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 400);

    // Tambahkan elemen dekoratif
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 400;
      ctx.fillText('✦', x, y);
    }

    // Gambar border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 790, 390);

    // Ambil avatar pengguna
    let avatarBuffer;
    try {
      const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
      avatarBuffer = response.data;
    } catch (error) {
      // Jika gagal mengambil avatar, gunakan placeholder
      avatarBuffer = await getDefaultAvatar(displayName);
    }

    // Konversi avatar ke image
    const avatarImage = await loadImage(avatarBuffer);
    
    // Gambar lingkaran untuk avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(400, 120, 80, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    
    // Gambar avatar
    const avatarWidth = 160;
    const avatarHeight = 160;
    ctx.drawImage(avatarImage, 400 - avatarWidth / 2, 120 - avatarHeight / 2, avatarWidth, avatarHeight);
    
    ctx.restore();

    // Gambar border untuk avatar
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(400, 120, 80, 0, Math.PI * 2, true);
    ctx.stroke();

    // Teks welcome
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    
    // Nama pengguna
    ctx.font = 'bold 30px Arial';
    ctx.fillText(`Haii ${displayName}`, 400, 220);
    
    // Teks selamat datang
    ctx.font = '20px Arial';
    ctx.fillText('Selamat Datang Di Grup', 400, 260);
    
    // Nama grup
    ctx.font = 'italic 18px Arial';
    ctx.fillText(groupName, 400, 300);

    // Tambahkan elemen dekoratif
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillText('✦', 50, 50);
    ctx.fillText('✦', 750, 370);
    ctx.fillText('✦', 50, 370);
    ctx.fillText('✦', 750, 50);

    // Konversi canvas ke buffer
    const buffer = await canvas.encode('png');
    
    return buffer;
  } catch (error) {
    console.error('Error creating welcome image:', error);
    throw error;
  }
}

/**
 * Fungsi untuk membuat gambar leave menggunakan @napi-rs/canvas
 * @param {string} displayName - Nama pengguna
 * @param {string} avatarUrl - URL avatar pengguna
 * @param {string} groupName - Nama grup
 * @returns {Promise<Buffer>} - Buffer gambar yang dihasilkan
 */
export async function createLeaveImage(displayName, avatarUrl, groupName) {
  try {
    // Buat canvas
    const canvas = new Canvas(800, 400);
    const ctx = canvas.getContext('2d');

    // Latar belakang gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 400);
    gradient.addColorStop(0, '#f093fb');
    gradient.addColorStop(1, '#f5576c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 400);

    // Tambahkan elemen dekoratif
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 400;
      ctx.fillText('✦', x, y);
    }

    // Gambar border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 790, 390);

    // Ambil avatar pengguna
    let avatarBuffer;
    try {
      const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
      avatarBuffer = response.data;
    } catch (error) {
      // Jika gagal mengambil avatar, gunakan placeholder
      avatarBuffer = await getDefaultAvatar(displayName);
    }

    // Konversi avatar ke image
    const avatarImage = await loadImage(avatarBuffer);
    
    // Gambar lingkaran untuk avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(400, 120, 80, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    
    // Gambar avatar
    const avatarWidth = 160;
    const avatarHeight = 160;
    ctx.drawImage(avatarImage, 400 - avatarWidth / 2, 120 - avatarHeight / 2, avatarWidth, avatarHeight);
    
    ctx.restore();

    // Gambar border untuk avatar
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(400, 120, 80, 0, Math.PI * 2, true);
    ctx.stroke();

    // Teks leave
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    
    // Nama pengguna
    ctx.font = 'bold 30px Arial';
    ctx.fillText(displayName, 400, 220);
    
    // Teks selamat tinggal
    ctx.font = '20px Arial';
    ctx.fillText('Selamat Tinggal Jelek~~~', 400, 260);
    
    // Nama grup
    ctx.font = 'italic 18px Arial';
    ctx.fillText(groupName, 400, 300);

    // Tambahkan elemen dekoratif
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillText('✦', 50, 50);
    ctx.fillText('✦', 750, 370);
    ctx.fillText('✦', 50, 370);
    ctx.fillText('✦', 750, 50);

    // Konversi canvas ke buffer
    const buffer = await canvas.encode('png');
    
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
  const canvas = new Canvas(160, 160);
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
  
  return await canvas.encode('png');
}

// Export fungsi-fungsi
export default {
  createWelcomeImage,
  createLeaveImage
};