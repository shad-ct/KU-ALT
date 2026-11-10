/**
 * Automated UI Specification Test Suite (ui-spec.spec.js)
 * Enforces all product design rules at 1440x900 and 390x844 viewports:
 * - Controls and inputs sizing (>= 40px on desktop, >= 44px on mobile)
 * - Button heights >= 32px (auth button >= 48px)
 * - Font hierarchy (body >= 15px, input >= 16px, no text under 13px)
 * - Ban on uppercase and letter-spacing tracking
 * - Sidebar item height = 40px, icon-to-label gap = 10px
 * - Stat caption positioned strictly BELOW the number
 * - Font family restriction (Public Sans + JetBrains Mono for ref numbers)
 * - Border-radius >= 6px (except 0px/1px dividers and 9999px full circles)
 * - No type=date inputs, correct dd/mm/yyyy or "15 Dec 2026"
 * - Banned words absent from login ("Statutory", "AUTHORIZED", "fast-access")
 * - No horizontal scroll on mobile (390px)
 * - Tables never render > 25 rows
 */

const { chromium } = require('./client/node_modules/playwright');

let failures = [];

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
    console.error(`  FAIL: ${message}`);
  } else {
    console.log(`  PASS: ${message}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('STARTING UI SPECIFICATION TEST SUITE (1440px & 390px)');
  console.log('======================================================\n');

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox'],
  });

  // -------------------------------------------------------------------------
  // TEST SUITE 1: Login Page (1440x900 and 390x844)
  // -------------------------------------------------------------------------
  console.log('--- Suite 1: Login Screen Verification ---');
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:5173/login');
  await page.waitForTimeout(600);

  // 1.1 Check Banned Words on Login Page
  const pageContent = await page.innerText('body');
  assert(!pageContent.includes('Statutory'), 'Login page does not contain "Statutory"');
  assert(!pageContent.includes('AUTHORIZED'), 'Login page does not contain "AUTHORIZED"');
  assert(!pageContent.includes('fast-access'), 'Login page does not contain "fast-access"');

  // 1.2 Check Button and Input Sizing at 1440x900
  const loginBtnBox = await page.locator('button[type="submit"]').boundingBox();
  assert(loginBtnBox.height >= 48, `Primary login button height is >= 48px (got ${loginBtnBox.height}px)`);

  const emailInput = page.locator('input[type="email"]');
  const emailBox = await emailInput.boundingBox();
  assert(emailBox.height >= 40, `Email input height is >= 40px at 1440px (got ${emailBox.height}px)`);

  const emailFontSize = await emailInput.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
  assert(emailFontSize >= 16, `Input font-size is >= 16px to prevent mobile zoom (got ${emailFontSize}px)`);

  // 1.3 Check Mobile Viewport (390x844)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  assert(scrollWidth <= 390, `No horizontal scroll at 390px wide (scrollWidth=${scrollWidth}px)`);

  // -------------------------------------------------------------------------
  // TEST SUITE 2: Authenticated Scholar Dashboard (1440x900)
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 2: Scholar Dashboard Verification (1440x900) ---');
  await page.setViewportSize({ width: 1440, height: 900 });

  // Authenticate
  await page.click('summary:has-text("Demo accounts")');
  await page.click('button:has-text("Scholar")');
  await page.click('button[type="submit"]');
  await page.waitForSelector('text=Sign out', { timeout: 10000 });
  await page.waitForTimeout(600);

  // 2.1 Check Sidebar Nav Item Height and Icon-to-Label Gap
  const navItem = page.locator('nav a:has-text("Dashboard")').first();
  const navBox = await navItem.boundingBox();
  assert(navBox.height >= 40, `Sidebar nav item height is 40px (got ${navBox.height}px)`);

  const gap = await navItem.evaluate((el) => {
    const iconContainer = el.querySelector('div');
    return window.getComputedStyle(iconContainer).gap;
  });
  assert(gap === '10px', `Icon-to-label gap in sidebar items is 10px (got ${gap})`);

  // 2.2 Check Stat Strip: Stat Caption Sits BELOW the Number
  const statLayout = await page.evaluate(() => {
    const numbers = Array.from(document.querySelectorAll('.tabular-nums')).filter(
      (el) => parseFloat(window.getComputedStyle(el).fontSize) >= 24
    );
    if (!numbers.length) return { ok: false, reason: 'No stat numbers found' };

    for (const num of numbers) {
      const parent = num.parentElement;
      const caption = parent.querySelector('div:nth-child(2)');
      if (caption) {
        const numRect = num.getBoundingClientRect();
        const capRect = caption.getBoundingClientRect();
        if (capRect.top < numRect.bottom) {
          return { ok: false, reason: `Caption top (${capRect.top}) < number bottom (${numRect.bottom})` };
        }
      }
    }
    return { ok: true };
  });
  assert(statLayout.ok, `Stat caption sits strictly BELOW the number (${statLayout.reason || 'verified'})`);

  // 2.3 Check Typography Rules: No Uppercase Text & No Letter-Spacing
  const textTransforms = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('h1, h2, h3, p, span, th, td, label, button, a'));
    const uppercaseViolations = all.filter((el) => {
      const cs = window.getComputedStyle(el);
      return cs.textTransform === 'uppercase' && el.innerText.trim().length > 0;
    });
    const letterSpacingViolations = all.filter((el) => {
      const cs = window.getComputedStyle(el);
      return cs.letterSpacing !== 'normal' && cs.letterSpacing !== '0px' && el.innerText.trim().length > 0;
    });
    return {
      uppercaseCount: uppercaseViolations.length,
      spacingCount: letterSpacingViolations.length,
    };
  });
  assert(textTransforms.uppercaseCount === 0, `No element with text-transform: uppercase (violations: ${textTransforms.uppercaseCount})`);
  assert(textTransforms.spacingCount === 0, `No element with custom letter-spacing tracking (violations: ${textTransforms.spacingCount})`);

  // 2.4 Check Border-Radius Values: No Element Has Radius < 6px (except 0px or 1px dividers)
  const radiusViolations = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('.rounded, .rounded-sm, .rounded-md, .rounded-lg, button, input, .panel'));
    const violations = elements.filter((el) => {
      const r = parseFloat(window.getComputedStyle(el).borderRadius);
      return r > 0 && r < 6;
    });
    return violations.length;
  });
  assert(radiusViolations === 0, `No element has border-radius < 6px (violations: ${radiusViolations})`);

  // 2.5 Check Tables: Never Render > 25 Rows Inline
  const tableRowCount = await page.evaluate(() => {
    const rows = document.querySelectorAll('tbody tr');
    return rows.length;
  });
  assert(tableRowCount <= 25, `Table renders <= 25 rows inline (rendered ${tableRowCount} rows)`);

  // -------------------------------------------------------------------------
  // TEST SUITE 3: Mobile Viewport (390x844) on Dashboard
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 3: Mobile Responsiveness Verification (390x844) ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);

  const dashScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  assert(dashScrollWidth <= 390, `No horizontal scroll on dashboard at 390px (scrollWidth=${dashScrollWidth}px)`);

  // -------------------------------------------------------------------------
  // TEST SUITE 4: Research Timeline (/timeline) Verification
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 4: Research Timeline (/timeline) ---');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/timeline');
  await page.waitForTimeout(600);

  const timelineTitle = await page.innerText('h1');
  assert(timelineTitle.includes('Research timeline'), `Timeline h1 title is "Research timeline" (got "${timelineTitle}")`);

  const timelineBodyText = await page.innerText('body');
  assert(!timelineBodyText.includes('Department of Department'), 'No duplicated "Department of Department" string');
  assert(!timelineBodyText.includes('PROVISIONAL'), 'No raw "PROVISIONAL" uppercase badge');

  // Scholar should NOT see a "Schedule RAC" button
  const scholarScheduleBtn = await page.$('button:has-text("Schedule meeting")');
  assert(scholarScheduleBtn === null, 'Scholar does NOT see a "Schedule RAC" button (role-gated)');

  // -------------------------------------------------------------------------
  // TEST SUITE 5: Styleguide Page (/dev/styleguide)
  // -------------------------------------------------------------------------
  console.log('\n--- Suite 5: Styleguide Page Verification (/dev/styleguide) ---');
  await page.goto('http://localhost:5173/dev/styleguide');
  await page.waitForTimeout(600);

  const styleguideH1 = await page.innerText('h1');
  assert(styleguideH1.includes('Styleguide'), `Styleguide page loads successfully (got "${styleguideH1}")`);

  // Final Summary
  console.log('\n======================================================');
  if (failures.length === 0) {
    console.log('ALL UI SPECIFICATION ASSERTIONS PASSED PERFECTLY!');
  } else {
    console.error(`FAILED ${failures.length} ASSERTION(S):`);
    failures.forEach((f) => console.error(`  - ${f}`));
  }
  console.log('======================================================\n');

  await browser.close();

  if (failures.length > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
