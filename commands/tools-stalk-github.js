import axios from 'axios';

export const handler = {
  tag: 'tools',
  cmd: ['github-stalk', 'gh-stalk'],
  aliases: ['stalk-gh'],
  owner: false
};

async function getGithubUserInfo(username) {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('Pengguna GitHub tidak ditemukan.');
    } else {
      throw new Error('Terjadi kesalahan saat mengambil data dari GitHub.');
    }
  }
}

export async function execute(ctx) {
  const { sock, message, args } = ctx;

  if (args.length === 0) {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Gunakan perintah ini untuk melihat informasi pengguna GitHub.\nContoh: .github-stalk jrevanaldi-ai atau .gh-stalk jrevanaldi-ai'
    }, { quoted: message });
    return;
  }

  const username = args[0];

  try {
    await sock.sendMessage(message.key.remoteJid, {
      text: 'Sedang mengambil informasi pengguna GitHub...'
    }, { quoted: message });

    const userInfo = await getGithubUserInfo(username);

    const profilePicUrl = userInfo.avatar_url;
    const bio = userInfo.bio || 'Tidak ada bio';
    const followers = userInfo.followers;
    const following = userInfo.following;
    const publicRepos = userInfo.public_repos;
    const publicGists = userInfo.public_gists;
    const location = userInfo.location || 'Tidak disebutkan';
    const company = userInfo.company || 'Tidak disebutkan';
    const blog = userInfo.blog || 'Tidak ada website';
    const twitter = userInfo.twitter_username ? `@${userInfo.twitter_username}` : 'Tidak disebutkan';
    const createdAt = new Date(userInfo.created_at).toLocaleDateString('id-ID');
    const updatedAt = new Date(userInfo.updated_at).toLocaleDateString('id-ID');
    const profileUrl = userInfo.html_url;

    const infoText = `
*Informasi Pengguna GitHub:*
  
*Username:* ${userInfo.login}
*Display Name:* ${userInfo.name || '-'}
*Bio:* ${bio}
*Company:* ${company}
*Location:* ${location}
*Website/Blog:* ${blog}
*Twitter:* ${twitter}

*Statistik:*
• Followers: ${followers}
• Following: ${following}
• Public Repositories: ${publicRepos}
• Public Gists: ${publicGists}

*Dibuat pada:* ${createdAt}
*Terakhir diperbarui:* ${updatedAt}

*Profile URL:* ${profileUrl}
    `.trim();

    await sock.sendMessage(message.key.remoteJid, {
      image: { url: profilePicUrl },
      caption: infoText,
      contextInfo: {
        externalAdReply: {
          title: `GitHub Profile - ${userInfo.name || userInfo.login}`,
          body: `Followers: ${followers} | Repos: ${publicRepos}`,
          thumbnailUrl: profilePicUrl,
          sourceUrl: profileUrl,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: message });

  } catch (error) {
    console.error('GitHub stalk error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: `Terjadi kesalahan: ${error.message}`
    }, { quoted: message });
  }
}