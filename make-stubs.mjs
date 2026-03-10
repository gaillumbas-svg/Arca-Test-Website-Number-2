import fs from 'fs';

const pages = [
  { file: 'events.html',     tag: 'Events',     title: 'Events & Meetups',  headline: 'Connect at\nFilipino Events',       body: 'Summits, workshops, and meetups bringing the community together across the Philippines and beyond.' },
  { file: 'about.html',      tag: 'About',      title: 'About Us',          headline: 'Built by Filipinos,\nfor Filipinos', body: "We're a community-first organization dedicated to connecting and empowering Filipino professionals and creators.", anchors: ['story','team','partners'] },
  { file: 'blog.html',       tag: 'Blog',       title: 'Blog',              headline: 'Stories from\nthe Community',       body: 'Insights, stories, and updates from the arca.ph community.' },
  { file: 'join.html',       tag: 'Join',       title: 'Join arca.ph',      headline: 'Ready to Find\nYour Community?',    body: 'Join thousands of Filipinos already thriving inside arca.ph. Your next collaboration starts here.' },
  { file: 'highlights.html', tag: 'Highlights', title: 'Highlights',        headline: 'Stories of\nFilipino Excellence',  body: 'A curated look at our best moments, milestones, and community achievements.' },
  { file: 'mentorship.html', tag: 'Mentorship', title: 'Mentorship',        headline: 'Grow with\nGreat Mentors',         body: 'Connect with experienced Filipino professionals ready to guide your journey.' },
  { file: 'projects.html',   tag: 'Projects',   title: 'Projects',          headline: 'Build Things\nThat Matter',        body: 'Collaborate on meaningful projects with talented Filipinos across every industry.' },
  { file: 'resources.html',  tag: 'Resources',  title: 'Resources',         headline: 'Tools & Resources\nfor Builders',  body: 'Curated guides, tools, and templates to help you grow your skills and career.' },
  { file: 'advocacy.html',   tag: 'Advocacy',   title: 'Advocacy',          headline: 'Championing\nFilipino Talent',     body: 'We advocate for Filipino professionals, creators, and entrepreneurs on every stage.' },
  { file: 'contact.html',    tag: 'Contact',    title: 'Contact',           headline: 'Get in Touch',                     body: "Have a question or want to collaborate? We'd love to hear from you.", email: true },
  { file: 'privacy.html',    tag: 'Legal',      title: 'Privacy Policy',    headline: 'Privacy Policy',                   body: 'We respect your privacy. This policy explains how arca.ph collects, uses, and protects your data.', legal: true },
  { file: 'terms.html',      tag: 'Legal',      title: 'Terms of Service',  headline: 'Terms of Service',                 body: 'By using arca.ph, you agree to these terms. Please read them carefully.', legal: true },
];

function makeAnchor(id) {
  const label = id.charAt(0).toUpperCase() + id.slice(1);
  return `<div id="${id}" style="padding-top:80px;margin-top:-80px;"></div>
  <div style="background:rgba(41,171,226,0.04);border:1px solid rgba(41,171,226,0.1);border-radius:16px;padding:40px;margin-bottom:32px;text-align:left;">
    <h2 style="font-family:var(--font-head);font-weight:800;font-size:1.5rem;color:var(--text);margin:0 0 12px;">${label}</h2>
    <p style="font-size:15px;line-height:1.8;color:var(--text-muted);margin:0;">Content for this section coming soon.</p>
  </div>`;
}

function extras(p) {
  if (p.email) return `
  <div style="background:rgba(41,171,226,0.04);border:1px solid rgba(41,171,226,0.1);border-radius:16px;padding:40px;margin-top:0;text-align:left;max-width:480px;margin-left:auto;margin-right:auto;">
    <p style="font-size:15px;line-height:1.8;color:var(--text-muted);margin-bottom:16px;">Drop us a line and we will get back to you shortly.</p>
    <a href="mailto:hello@arca.ph" style="display:inline-flex;align-items:center;gap:8px;color:var(--brand);font-family:var(--font-head);font-weight:700;font-size:15px;text-decoration:none;">✉ hello@arca.ph</a>
  </div>`;
  if (p.legal) return `
  <div style="background:rgba(41,171,226,0.04);border:1px solid rgba(41,171,226,0.1);border-radius:16px;padding:40px;margin-top:0;text-align:left;max-width:680px;margin-left:auto;margin-right:auto;font-size:15px;line-height:1.9;color:var(--text-muted);">
    <p>The full ${p.title} document will be published here. For questions, contact <a href="mailto:hello@arca.ph" style="color:var(--brand);">hello@arca.ph</a>.</p>
  </div>`;
  return `<div class="coming-soon">🚧 &nbsp;Full page coming soon</div><br><a href="join.html" class="btn">Join the Community →</a>`;
}

function makePage(p) {
  const lines = p.headline.split('\n');
  const h1 = lines.length > 1
    ? `${lines[0]}<br><span class="grad">${lines[1]}</span>`
    : `<span class="grad">${lines[0]}</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.title} — arca.ph</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800;900&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    :root { --brand:#29ABE2; --accent:#FFCA28; --bg:#030B16; --text:#EEF6FB; --text-muted:#6B98BC; --font-head:'Montserrat',system-ui,sans-serif; --font:'Roboto',system-ui,sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--text-muted); font-family: var(--font); min-height: 100vh; }
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; background: rgba(3,11,22,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(41,171,226,0.08); padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
    .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .logo img { width: 32px; height: 32px; object-fit: contain; }
    .logo-text { font-family: var(--font-head); font-weight: 800; font-size: 18px; color: var(--text); }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a { text-decoration: none; color: var(--text-muted); font-size: 14px; font-weight: 500; transition: color 0.2s; }
    .nav-links a:hover { color: var(--brand); }
    .btn { display: inline-flex; align-items: center; background: var(--brand); color: #fff; font-family: var(--font-head); font-weight: 700; font-size: 13px; padding: 10px 22px; border-radius: 8px; text-decoration: none; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.85; }
    main { padding-top: 120px; padding-bottom: 80px; max-width: 720px; margin: 0 auto; padding-left: 24px; padding-right: 24px; text-align: center; }
    .tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(41,171,226,0.08); border: 1px solid rgba(41,171,226,0.18); border-radius: 100px; padding: 6px 16px; font-size: 12px; font-weight: 600; color: var(--brand); font-family: var(--font-head); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 24px; }
    h1 { font-family: var(--font-head); font-size: clamp(2.5rem,5vw,4rem); font-weight: 900; color: var(--text); letter-spacing: -0.03em; margin: 0 0 20px; }
    .grad { background: linear-gradient(135deg,#EEF6FB,#29ABE2,#8DD8F5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    p.body { font-size: 17px; line-height: 1.8; color: var(--text-muted); margin: 0 auto 40px; max-width: 500px; }
    .coming-soon { display: inline-flex; align-items: center; gap: 10px; background: rgba(255,202,40,0.08); border: 1px solid rgba(255,202,40,0.2); border-radius: 12px; padding: 16px 28px; color: var(--accent); font-family: var(--font-head); font-weight: 700; font-size: 14px; margin-bottom: 40px; }
    .footer-bar { text-align: center; padding: 40px 24px; font-size: 13px; color: var(--text-muted); border-top: 1px solid rgba(41,171,226,0.07); margin-top: 80px; }
  </style>
</head>
<body>
<nav>
  <a href="index.html" class="logo">
    <img src="Arca.png" alt="Arca">
    <span class="logo-text">arca.ph</span>
  </a>
  <div class="nav-links">
    <a href="community.html">Community</a>
    <a href="events.html">Events</a>
    <a href="about.html">About</a>
    <a href="blog.html">Blog</a>
  </div>
  <a href="join.html" class="btn">Join Now →</a>
</nav>
<main>
  <div class="tag">${p.tag}</div>
  <h1>${h1}</h1>
  <p class="body">${p.body}</p>
  ${extras(p)}
  ${(p.anchors || []).map(makeAnchor).join('\n')}
</main>
<div class="footer-bar">© 2026 arca.ph. All rights reserved. &nbsp;·&nbsp; <a href="index.html" style="color:var(--brand);text-decoration:none;">Back to Home</a></div>
</body>
</html>`;
}

for (const p of pages) {
  fs.writeFileSync(`c:/Users/gaill/OneDrive/Arca/${p.file}`, makePage(p));
  console.log(`Created ${p.file}`);
}
console.log('Done.');
