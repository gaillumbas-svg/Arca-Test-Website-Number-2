const puppeteer = require('./node_modules/puppeteer');
const path = require('path');

(async () => {
  const outDir = 'C:/Users/gaill/OneDrive/Arca/temporary screenshots';

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-web-security', '--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // Load via localhost (serve.mjs must be running)
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;">
    <video id="v" src="http://localhost:3000/Smart%20Watch%20Dissection.mp4" style="max-width:100%;max-height:720px;" muted playsinline crossorigin="anonymous"></video>
  </body></html>`;

  await page.goto('about:blank');
  await page.setContent(html, { waitUntil: 'load' });

  const duration = await page.evaluate(() => new Promise((resolve, reject) => {
    const v = document.getElementById('v');
    v.addEventListener('loadedmetadata', () => resolve(v.duration));
    v.addEventListener('error', () => reject('Video error: ' + (v.error?.message || 'unknown')));
    v.load();
    setTimeout(() => reject('Timeout'), 20000);
  }));

  console.log('Duration:', duration, 's');

  const fractions = [0.02, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9];

  for (let i = 0; i < fractions.length; i++) {
    const t = fractions[i] * duration;
    await page.evaluate((time) => new Promise((resolve) => {
      const v = document.getElementById('v');
      v.currentTime = time;
      v.addEventListener('seeked', resolve, { once: true });
      setTimeout(resolve, 3000);
    }), t);
    await new Promise(r => setTimeout(r, 800));
    const fname = path.join(outDir, `frame-${i}.png`);
    await page.screenshot({ path: fname });
    console.log('Saved frame', i, 'at', t.toFixed(1) + 's');
  }

  await browser.close();
  console.log('Done');
})();
