const { chromium } = require('playwright');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  const api = [];
  page.on('response', (response) => {
    if (response.url().includes('/api/')) api.push({ status: response.status(), url: new URL(response.url()).pathname });
  });
  await page.goto('http://localhost:3000/?auth=true', { waitUntil: 'domcontentloaded' });
  await page.locator('#email').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('#email').fill(process.env.QA_EMAIL);
  await page.locator('#password').fill(process.env.QA_PASSWORD);
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/auth/login'), { timeout: 15000 }),
    page.getByRole('button', { name: 'Entrar', exact: true }).click(),
  ]);
  await page.waitForTimeout(1000);
  const loginUrl = page.url();
  await page.goto('http://localhost:3000/app/diagnostico', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const viewports = [
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1365, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ];
  const measurements = [];
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(250);
    const measurement = await page.evaluate(() => {
      const describe = (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          text: (element.innerText || '').trim().slice(0, 120),
          rect: { x: rect.x, y: rect.y, left: rect.left, right: rect.right, width: rect.width, height: rect.height },
          clippedAtViewport: rect.left < 0 || rect.right > innerWidth,
          display: style.display,
          overflowX: style.overflowX,
        };
      };
      const button = [...document.querySelectorAll('button')].find((element) => /Baixar Relatório PDF/.test(element.innerText));
      const banner = button?.closest('section') || button?.parentElement?.parentElement?.parentElement;
      return {
        url: location.href,
        viewport: { width: innerWidth, height: innerHeight },
        documentWidth: document.documentElement.scrollWidth,
        bodyStart: document.body.innerText.slice(0, 500),
        button: button ? describe(button) : null,
        banner: banner ? describe(banner) : null,
        cards: [...document.querySelectorAll('.grid > *')].map(describe),
      };
    });
    measurements.push({ name: viewport.name, ...measurement });
    await page.screenshot({ path: `qa/artifacts/diagnostic-fix-20261105/diagnostico-${viewport.name}-retest-20261105.png`, fullPage: true });
  }
  const result = { capturedAt: new Date().toISOString(), loginUrl, api, measurements };
  fs.writeFileSync('qa/artifacts/diagnostic-fix-20261105/tablet-retest-20261105.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
  await browser.close();
})().catch((error) => { console.error(error.message); process.exit(1); });
