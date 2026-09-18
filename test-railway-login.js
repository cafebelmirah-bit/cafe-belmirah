const axios = require('axios');

async function testRailwayLogin() {
  try {
    const res = await axios.post('https://cafe-belmirah-production-72a4.up.railway.app/api/admin/login', {
      email: 'admin@cafebelmirah.com',
      password: 'adminpassword123'
    });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('SERVER ERROR:', err.response.status, err.response.data);
    } else {
      console.error('NETWORK ERROR:', err.message);
    }
  }
}

testRailwayLogin();
