const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testGallery() {
  try {
    const loginRes = await axios.post('https://api.belmirah.in/api/admin/login', {
      email: 'bypass@bypass.com',
      password: '123'
    });
    const token = loginRes.data.token;

    const reqData = {
      title: 'test',
      category: 'test',
      url: 'https://api.belmirah.in/uploads/test.jpg'
    };

    const res = await axios.post('https://api.belmirah.in/api/gallery', reqData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(res.data);
  } catch (err) {
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testGallery();
