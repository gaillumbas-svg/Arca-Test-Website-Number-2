const puppeteer = require('./node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const FRAME_COUNT = 120;
  const outDir = 'C:/Users/gaill/OneDrive/Arca/product-frames';
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-web-security', '--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

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

  console.log('Duration:', duration, 's — extracting', FRAME_COUNT, 'frames...');

  for (let i = 0; i < FRAME_COUNT; i++) {
    const t = (i / (FRAME_COUNT - 1)) * duration;
    await page.evaluate((time) => new Promise((resolve) => {
      const v = document.getElementById('v');
      v.currentTime = time;
      v.addEventListener('seeked', resolve, { once: true });
      setTimeout(resolve, 3000);
    }), t);
    await new Promise(r => setTimeout(r, 150));
    const fname = path.join(outDir, `frame_${String(i + 1).padStart(4, '0')}.png`);
    await page.screenshot({ path: fname });
    if (i % 20 === 0) console.log(`  ${i + 1}/${FRAME_COUNT} t=${t.toFixed(3)}s`);
  }

  await browser.close();
  const count = fs.readdirSync(outDir).length;
  console.log(`Done! ${count} frames in product-frames/`);
})();
