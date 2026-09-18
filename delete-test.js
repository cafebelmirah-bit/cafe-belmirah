const axios = require('axios');

async function deleteTestGallery() {
  try {
    const loginRes = await axios.post('https://api.belmirah.in/api/admin/login', {
      email: 'bypass@bypass.com',
      password: '123'
    });
    const token = loginRes.data.token;

    const res = await axios.delete('https://api.belmirah.in/api/gallery/8', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Deleted id 8:', res.data);
  } catch (err) {
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

deleteTestGallery();
