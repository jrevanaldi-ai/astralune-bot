import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export const handler = {
  tag: 'owner',
  cmd: ['exec', 'execute'],
  aliases: ['$'],
  owner: true
};

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  const command = args.join(' ');
  if (!command) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk mengeksekusi perintah shell.\nContoh: .exec ls -la'
    }, { quoted: message });
    return;
  }

  const dangerousCommands = ['rm', 'mv', 'dd', 'wget', 'curl', 'chmod', 'chown', 'shutdown', 'reboot', 'poweroff'];
  const containsDangerousCommand = dangerousCommands.some(dc => command.includes(dc));
  
  if (containsDangerousCommand) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Perintah ini mengandung perintah berbahaya dan tidak diizinkan.'
    }, { quoted: message });
    return;
  }

  try {
    const { stdout, stderr } = await execPromise(command);
    
    const result = stdout || stderr || 'Perintah berhasil dijalankan tanpa output';
    
    await sock.sendMessage(message.key.remoteJid, {
      text: result.substring(0, 4000)
    }, { quoted: message });
  } catch (error) {
    await sock.sendMessage(message.key.remoteJid, {
      text: `Error: ${error.message}`
    }, { quoted: message });
  }
}