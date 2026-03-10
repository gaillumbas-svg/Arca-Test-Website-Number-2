import https from 'https';
import fs from 'fs';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => { try { fs.unlinkSync(dest); } catch {} reject(err); });
  });
}

if (!fs.existsSync('./assets')) fs.mkdirSync('./assets', { recursive: true });
await downloadFile('https://tempfile.aiquickdraw.com/images/1773075948444-rpheebwin9n.jpeg', './assets/sight-sagrada.png');
console.log('Downloaded sight-sagrada.png');
