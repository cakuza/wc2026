const https = require('https');
const getBuildId = (url) => {
  return new Promise(resolve => {
    https.get(url, { headers: { 'Cache-Control': 'no-cache' } }, (res) => {
      let data = '';
      res.on('data', c => data+=c);
      res.on('end', () => {
        const match = data.match(/buildId":"([^"]+)"/);
        resolve(match ? match[1] : 'not found');
      });
    });
  });
};
Promise.all([
  getBuildId('https://www.worldcupmatchday.com/stats'),
  getBuildId('https://www.worldcupmatchday.com/stats/top-scorers'),
  getBuildId('https://www.worldcupmatchday.com/stats/players')
]).then(res => {
  console.log('/stats Build ID:', res[0]);
  console.log('/stats/top-scorers Build ID:', res[1]);
  console.log('/stats/players Build ID:', res[2]);
});
