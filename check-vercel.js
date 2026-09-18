const axios = require('axios');

async function checkVercelUrl() {
  try {
    const htmlRes = await axios.get('https://www.belmirah.in');
    const html = htmlRes.data;
    
    const match = html.match(/src="(\/assets\/index-[a-zA-Z0-9]*\.js)"/);
    if (!match) {
      console.log('No JS bundle found in HTML');
      return;
    }
    
    const jsUrl = 'https://www.belmirah.in' + match[1];
    const jsRes = await axios.get(jsUrl);
    const js = jsRes.data;
    
    const localhostMatch = js.match(/http:\/\/localhost:5000[^\s"']*/);
    console.log('Localhost URL in JS bundle:', localhostMatch ? localhostMatch[0] : 'NONE');

    // Find anything that looks like an API URL starting with http
    const allUrls = js.match(/https?:\/\/[^\s"']+/g) || [];
    const uniqueUrls = [...new Set(allUrls)];
    console.log('All unique URLs in bundle:', uniqueUrls.filter(u => !u.includes('w3.org') && !u.includes('react')));

  } catch (err) {
    console.error(err.message);
  }
}

checkVercelUrl();
