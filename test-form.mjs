import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'

async function run() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  // Mock external requests
  await context.route('https://script.google.com/**', route => route.fulfill({ status: 200, body: '' }))
  await context.route('https://*.supabase.co/**', route => route.fulfill({ status: 201, body: '' }))

  console.log('→ Loading page...')
  await page.goto(BASE)

  console.log('→ Filling form...')
  await page.locator('#contact-form').scrollIntoViewIfNeeded()
  await page.fill('input[name="name"]', 'Test User')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('textarea[name="comment"]', 'Test message from Playwright.')

  console.log('→ Submitting...')
  const navPromise = page.waitForURL('**/thank-you.html', { timeout: 10000 })
  await page.click('#submit-btn')
  await navPromise

  const url = page.url()
  if (url.includes('thank-you.html')) {
    console.log('✓ PASS — redirected to thank-you.html')
  } else {
    console.error('✗ FAIL — unexpected URL:', url)
    process.exitCode = 1
  }

  await browser.close()
}

run().catch(e => { console.error('✗ ERROR:', e.message); process.exit(1) })
