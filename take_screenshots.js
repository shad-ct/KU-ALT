const { chromium } = require('./client/node_modules/playwright');

async function captureScreen(page, targetPath, name) {
  // Desktop 1440px
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`http://localhost:5173${targetPath}`);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `docs/design/screens-v2/${name}_1440px.png` });

  // Mobile 390px
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `docs/design/screens-v2/${name}_390px.png` });

  // If dashboard on mobile, also test slide drawer open
  if (name === 'dashboard') {
    try {
      const drawerBtn = await page.$('button[aria-label="Toggle navigation drawer"]');
      if (drawerBtn) {
        await drawerBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: `docs/design/screens-v2/${name}_mobile_drawer_390px.png` });
        const closeBtn = await page.$('button[aria-label="Close navigation drawer"]');
        if (closeBtn) {
          await closeBtn.click();
          await page.waitForTimeout(200);
        }
      }
    } catch (e) {}
  }

  console.log(`✓ Captured ${name} (1440px & 390px)`);
}

async function run() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  // 1. Capture public screens first
  await captureScreen(page, '/login', 'login');
  await captureScreen(page, '/signup/scholar', 'signup_scholar');

  // 2. Authenticate as scholar
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('#email-input');
  await page.fill('#email-input', 'scholar@kannur.ac.in');
  await page.fill('#password-input', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForSelector('text=Sign out', { timeout: 10000 });
  await page.waitForTimeout(600);

  // 3. Capture authenticated screens
  await captureScreen(page, '/dashboard', 'dashboard');
  await captureScreen(page, '/timeline', 'research_timeline');
  await captureScreen(page, '/applications', 'applications');

  // 4. Click first application to capture application detail page
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/applications');
  await page.waitForSelector('tbody tr');
  await page.click('tbody tr:first-child');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'docs/design/screens-v2/application_detail_1440px.png' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/design/screens-v2/application_detail_390px.png' });
  console.log('✓ Captured application_detail (1440px & 390px)');

  // 5. Capture Styleguide
  await captureScreen(page, '/dev/styleguide', 'styleguide');

  await browser.close();
  console.log('\nAll screens captured successfully in docs/design/screens-v2/ !');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
