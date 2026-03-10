import puppeteer from 'C:/Users/nateh/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import fs from 'fs';
import path from 'path';

const videoPath = 'C:/Users/gaill/OneDrive/Arca/Smart Watch Dissection.mp4';
const outDir = 'C:/Users/gaill/OneDrive/Arca/temporary screenshots';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720 });

const fileUrl = 'file:///' + videoPath.replace(/\\/g, '/');

const html = `<!DOCTYPE html><html><body style="margin:0;background:#000;"><video id="v" src="${fileUrl}" style="width:100%;height:auto;" muted></video></body></html>`;

await page.setContent(html);
await page.waitForSelector('#v');

const duration = await page.evaluate(() => new Promise(resolve => {
  const v = document.getElementById('v');
  v.addEventListener('loadedmetadata', () => resolve(v.duration));
  v.load();
}));

console.log('Duration:', duration);

const times = [0, duration * 0.1, duration * 0.25, duration * 0.4, duration * 0.6, duration * 0.75, duration * 0.9];

for (let i = 0; i < times.length; i++) {
  const t = times[i];
  await page.evaluate((time) => new Promise(resolve => {
    const v = document.getElementById('v');
    v.currentTime = time;
    v.addEventListener('seeked', resolve, { once: true });
  }), t);
  await new Promise(r => setTimeout(r, 500));
  const fname = path.join(outDir, `frame-${i}.png`);
  await page.screenshot({ path: fname });
  console.log('Saved:', fname);
}

await browser.close();
console.log('Done');
