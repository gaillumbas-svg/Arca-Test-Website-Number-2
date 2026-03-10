import https from 'https';
import fs from 'fs';

const API_KEY = '278511cac8f49770b6f74b3ce64e53cc';

const images = [
  {
    file: 'assets/highlight-summit.jpg',
    prompt: 'Filipino tech community annual summit, large modern auditorium filled with young Filipino professionals and entrepreneurs, dynamic speaker on stage with vivid blue screen displays, crowd excitement, cinematic wide shot, professional event photography, photorealistic'
  },
  {
    file: 'assets/highlight-workshop.jpg',
    prompt: 'Filipino creatives and tech professionals collaborative workshop, diverse young Filipinos working together at tables with laptops, bright modern open studio, natural light, photorealistic candid photography'
  }
];

function httpReq(url, method, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const b = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
    };
    if (b) opts.headers['Content-Length'] = Buffer.byteLength(b);
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, body: d }); } });
    });
    req.on('error', reject);
    if (b) req.write(b);
    req.end();
  });
}

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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function pollForResult(taskId, label) {
  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    const res = await httpReq(`https://api.kie.ai/api/v1/flux/kontext/record-info?taskId=${taskId}`, 'GET');
    const imageUrl = res.body?.data?.response?.resultImageUrl;
    if (imageUrl) return imageUrl;
    if (res.body?.data?.successFlag === -1) throw new Error('Generation failed');
    process.stdout.write(`  [${label}] poll ${i + 1}...\r`);
  }
  throw new Error('Timed out');
}

async function generateOne(img) {
  // Remove empty file if it exists
  if (fs.existsSync(img.file) && fs.statSync(img.file).size === 0) {
    fs.unlinkSync(img.file);
  }
  if (fs.existsSync(img.file)) { console.log(`✓ ${img.file} already exists`); return; }
  const res = await httpReq('https://api.kie.ai/api/v1/flux/kontext/generate', 'POST', {
    prompt: img.prompt, aspectRatio: '16:9', outputFormat: 'jpeg'
  });
  const taskId = res.body?.data?.taskId;
  if (!taskId) { console.error(`No taskId for ${img.file}:`, JSON.stringify(res.body)); return; }
  console.log(`Started ${img.file} → ${taskId}`);
  const imageUrl = await pollForResult(taskId, img.file.split('/').pop());
  console.log(`\nDownloading ${img.file}...`);
  await downloadFile(imageUrl, img.file);
  console.log(`✓ Saved ${img.file}`);
}

for (const img of images) {
  await generateOne(img);
}
console.log('\nDone!');
