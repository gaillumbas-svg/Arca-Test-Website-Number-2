import https from 'https';
import fs from 'fs';
import path from 'path';

const API_KEY = '278511cac8f49770b6f74b3ce64e53cc';
const ASSETS_DIR = './assets';

const images = [
  {
    file: 'sight-sagrada.png',
    prompt: 'La Sagrada Família basilica in Barcelona at golden hour dusk, dramatic gothic spires piercing a deep purple sky, Gaudí architecture, cinematic wide angle, moody dramatic lighting, dark atmospheric, photorealistic'
  },
  {
    file: 'sight-rhodes.png',
    prompt: 'The Colossus of Rhodes, an enormous ancient bronze statue straddling the harbor entrance at sunset, ancient Greek wonder of the world, dramatic red sky, ships sailing below, cinematic epic scale, photorealistic dramatic lighting'
  },
  {
    file: 'sight-babylon.png',
    prompt: 'The Hanging Gardens of Babylon, lush cascading terraces of tropical vegetation on a massive ancient Mesopotamian ziggurat, moonlit night sky, mystical ancient wonder, dramatic atmospheric lighting, photorealistic'
  },
  {
    file: 'sight-alexandria.png',
    prompt: 'The Great Library of Alexandria in ancient Egypt, grand columned hall with thousands of papyrus scrolls, golden torchlight, scholars studying, epic scale architecture, cinematic dramatic lighting, photorealistic'
  }
];

function httpReq(url, method, body, headers) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const opts = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: { 'Authorization': `Bearer ${API_KEY}`, ...headers }
    };
    if (body) {
      const b = JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(b);
    }
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
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
    }).on('error', err => {
      try { fs.unlinkSync(dest); } catch {}
      reject(err);
    });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function pollForResult(taskId, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(5000);
    const res = await httpReq(`https://api.kie.ai/api/v1/flux/kontext/record-info?taskId=${taskId}`, 'GET');
    const data = res.body?.data;
    const imageUrl = data?.response?.resultImageUrl;
    console.log(`  Poll ${i+1}: successFlag=${data?.successFlag} imageUrl=${imageUrl ? 'YES' : 'no'}`);
    if (imageUrl) return imageUrl;
    if (data?.successFlag === -1 || data?.errorCode) throw new Error(`Generation failed: ${data?.errorMessage}`);
  }
  throw new Error('Timed out waiting for image');
}

async function main() {
  if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

  for (const img of images) {
    const dest = path.join(ASSETS_DIR, img.file);
    if (fs.existsSync(dest)) {
      console.log(`✓ ${img.file} already exists, skipping`);
      continue;
    }
    console.log(`\nGenerating ${img.file}...`);
    const res = await httpReq('https://api.kie.ai/api/v1/flux/kontext/generate', 'POST', {
      prompt: img.prompt,
      aspectRatio: '16:9',
      outputFormat: 'jpeg'
    });
    console.log(`  Response: ${res.status}`, JSON.stringify(res.body).slice(0, 200));

    const taskId = res.body?.data?.taskId;
    if (!taskId) {
      console.error(`  ERROR: No taskId for ${img.file}`);
      continue;
    }
    console.log(`  taskId: ${taskId}`);

    try {
      const imageUrl = await pollForResult(taskId);
      console.log(`  Downloading: ${imageUrl}`);
      await downloadFile(imageUrl, dest);
      console.log(`  ✓ Saved to ${dest}`);
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
    }

    await sleep(2000);
  }

  console.log('\nDone!');
}

main().catch(console.error);
