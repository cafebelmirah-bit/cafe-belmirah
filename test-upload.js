const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUploadAndFetch() {
  try {
    // 1. Login
    const loginRes = await axios.post('https://api.belmirah.in/api/admin/login', {
      email: 'bypass@bypass.com',
      password: '123'
    });
    const token = loginRes.data.token;
    console.log('Got token');

    // 2. Create dummy file
    fs.writeFileSync('dummy.jpg', 'dummy image content');

    // 3. Upload
    const form = new FormData();
    form.append('photo', fs.createReadStream('dummy.jpg'));
    
    const uploadRes = await axios.post('https://api.belmirah.in/api/upload', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    const imageUrl = uploadRes.data.url;
    console.log('Uploaded image URL:', imageUrl);

    // 4. Fetch the image
    const imageRes = await axios.get(imageUrl);
    console.log('Image fetch status:', imageRes.status);
    console.log('Image content:', imageRes.data);

  } catch (err) {
    if (err.response) {
      console.error('ERROR:', err.response.status, err.response.data);
    } else {
      console.error('ERROR:', err.message);
    }
  }
}

testUploadAndFetch();
