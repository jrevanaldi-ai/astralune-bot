import axios from 'axios';

async function ytPlay(query) {
  try {
    const response = await axios.get('https://api.elrayyxml.web.id/api/downloader/ytplay', {
      params: {
        q: query
      }
    });

    if (response.data && response.data.status) {
      return {
        status: true,
        result: response.data.result
      };
    } else {
      return {
        status: false,
        message: 'Tidak ditemukan hasil untuk pencarian tersebut'
      };
    }
  } catch (error) {
    return {
      status: false,
      message: error.response?.data?.message || error.message
    };
  }
}

export { ytPlay };