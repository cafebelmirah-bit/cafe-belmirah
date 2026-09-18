const axios = require('axios');

async function testApi() {
  try {
    const res = await axios.post('https://api.belmirah.in/api/admin/login', {
      email: 'bypass@bypass.com',
      password: '123'
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

testApi();
