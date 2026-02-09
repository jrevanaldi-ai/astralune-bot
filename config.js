import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const config = {
  botName: 'Astralune Bot',
  
  ownerNumber: ['223454951375057'], // Ganti dengan nomor owner
  
  prefixes: ['.', ','],
  
  sessionPath: join(__dirname, 'session'),
  
  dataPath: join(__dirname, 'data'),
  
  timeout: {
    qr: 30000,
    message: 10000
  },
  
  database: {
    path: join(__dirname, 'data', 'database.json')
  },
  
  logging: {
    level: 'info', // info, warn, error
    colors: true
  },
  
  features: {
    autoRead: true,
    antiDelete: false,
    multiDevice: true
  },
  
  welcome: {
    welcomeOn: true,
    leaveOn: true
  }
};
