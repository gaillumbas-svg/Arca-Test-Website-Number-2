#!/usr/bin/env node
// kie.ai image generation via 4o Image API
// Usage: node kie-generate.mjs "prompt" output.png [1:1|3:2|2:3]

import https from 'https';
import fs from 'fs';
import path from 'path';

const API_KEY = '554a9d0bc010adff09e15f31cd12c749';
const [,, prompt, outputPath, size = '1:1'] = process.argv;

if (!prompt || !outputPath) {
  console.error('Usage: node kie-generate.mjs "prompt" output.png [1:1|3:2|2:3]');
  process.exit(1);
}

function request(method, url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
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
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function generate() {
  console.log(`Generating: ${path.basename(outputPath)} (${size})`);

  const res = await request('POST', 'https://api.kie.ai/api/v1/gpt4o-image/generate', {
    prompt,
    size,
    isEnhance: false,
    enableFallback: false,
  });

  if (res.code !== 200 || !res.data?.taskId) {
    console.error('Failed to create task:', JSON.stringify(res));
    process.exit(1);
  }

  const taskId = res.data.taskId;
  console.log(`Task: ${taskId}`);

  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    const status = await request('GET', `https://api.kie.ai/api/v1/gpt4o-image/record-info?taskId=${taskId}`);
    const d = status.data;
    process.stdout.write(`  [${i + 1}] ${d?.status || 'waiting'}\r`);

    if (d?.successFlag === 1) {
      const imageUrl = d.response?.resultUrls?.[0];
      if (!imageUrl) { console.error('\nNo image URL in response:', JSON.stringify(d)); process.exit(1); }
      console.log(`\nDownloading...`);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      await downloadFile(imageUrl, outputPath);
      console.log(`Saved: ${outputPath}`);
      return;
    }
    if (d?.successFlag === 2) {
      console.error('\nGeneration failed:', d.errorMessage);
      process.exit(1);
    }
  }
  console.error('\nTimed out');
  process.exit(1);
}

generate().catch(err => { console.error(err); process.exit(1); });
