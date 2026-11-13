const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  const responses = [], blocked = [], errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text().slice(0, 220)); });
  page.on('pageerror', err => errors.push(String(err).slice(0, 220)));
  page.on('response', async res => {
    const url = new URL(res.url());
    if (url.hostname !== 'localhost' || !url.pathname.startsWith('/api/')) return;
    const item = { method: res.request().method(), path: url.pathname, status: res.status() };
    if (url.pathname === '/api/diagnostic/current') {
      try { const data = await res.json(); item.diagnostic = { hasDiagnostic: data.hasDiagnostic, idPresent: Boolean(data.diagnostic?.id), status: data.diagnostic?.status, kind: data.diagnostic?.kind, responseCount: data.diagnostic?._count?.responses, questionCount: data.questions?.length }; } catch {}
    }
    responses.push(item);
  });
  await page.route('**/api/**', async route => {
    const req = route.request(), url = new URL(req.url());
    if (req.method() === 'POST' && url.pathname.includes('/submit')) { blocked.push(url.pathname); return route.abort('blockedbyclient'); }
    if (req.method() === 'POST' && url.pathname.endsWith('/diagnostic/start')) { blocked.push(url.pathname); return route.abort('blockedbyclient'); }
    return route.continue();
  });
  await page.goto('http://localhost:3000/?auth=true', { waitUntil: 'domcontentloaded' });
  await page.locator('#email').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('#email').fill(process.env.QA_EMAIL);
  await page.locator('#password').fill(process.env.QA_PASSWORD);
  await Promise.all([page.waitForResponse(r => r.url().includes('/api/auth/login'), {timeout:10000}), page.getByRole('button', { name: 'Entrar', exact: true }).click()]);
  await page.waitForResponse(r => r.url().includes('/api/auth/me') && r.status()===200, {timeout:10000});
  await page.waitForTimeout(1000);
  await page.goto('http://localhost:3000/app/diagnostico', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const viewports = [{name:'desktop',width:1365,height:900},{name:'tablet',width:768,height:1024},{name:'mobile',width:390,height:844}];
  const visual=[];
  for (const v of viewports) {
    await page.setViewportSize({width:v.width,height:v.height}); await page.waitForTimeout(700);
    const body=await page.locator('body').innerText();
    const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,cardRects:[...document.querySelectorAll('.grid > *')].map(e=>{const r=e.getBoundingClientRect();return {left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),viewport:innerWidth}})}));
    visual.push({viewport:v.name,text:body.slice(0,1000),layout});
    await page.screenshot({path:`qa/artifacts/diagnostic-fix-20261105/diagnostico-${v.name}.png`,fullPage:true});
  }
  await page.goto('http://localhost:3000/app/diagnostico/preencher', {waitUntil:'domcontentloaded'}); await page.waitForTimeout(3000);
  const fill={url:page.url(),text:(await page.locator('body').innerText()).slice(0,1000)};
  await page.screenshot({path:'qa/artifacts/diagnostic-fix-20261105/preencher-direto.png',fullPage:true});
  const out={health:(await fetch('http://localhost:4000/api/health')).status,loginSucceeded:responses.some(r=>r.path==='/api/auth/me'&&r.status===200),current:responses.filter(r=>r.path==='/api/diagnostic/current'),startPosts:responses.filter(r=>r.path.endsWith('/diagnostic/start')&&r.method==='POST'),submitPosts:responses.filter(r=>r.path.includes('/submit')&&r.method==='POST'),blocked,errors,visual,fill};
  fs.writeFileSync('qa/artifacts/diagnostic-fix-20261105/browser-check.json',JSON.stringify(out,null,2));
  await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
