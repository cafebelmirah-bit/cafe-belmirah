const axios = require('axios');

async function checkGallery() {
  try {
    const res = await axios.get('https://api.belmirah.in/api/gallery');
    console.log(res.data);
  } catch (err) {
    console.error(err.message);
  }
}

checkGallery();
