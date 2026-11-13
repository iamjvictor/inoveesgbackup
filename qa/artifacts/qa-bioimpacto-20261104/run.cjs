const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const out = __dirname;
const base = 'http://localhost:3000';
const email = process.env.QA_LOGIN_EMAIL;
const password = process.env.QA_LOGIN_PASSWORD;
let lastApiAt = 0;
const logs = { consoleErrors: [], pageErrors: [], requests: [], visits: [], checks: [] };
(async () => {
  const browser = await chromium.launch({headless:true});
  const context = await browser.newContext({viewport:{width:1365,height:768}, deviceScaleFactor:1});
  const page = await context.newPage();
  await page.route('http://localhost:4000/api/**', async route => {
    const now = Date.now(); const wait = Math.max(0, 1000 - (now-lastApiAt));
    if (wait) await new Promise(r => setTimeout(r, wait));
    lastApiAt = Date.now();
    const req=route.request();
    const rec={method:req.method(), path:new URL(req.url()).pathname, status:null};
    logs.requests.push(rec);
    try { const response=await route.fetch(); rec.status=response.status(); await route.fulfill({response}); }
    catch(e) { rec.error=String(e).slice(0,150); await route.abort(); }
  });
  page.on('console', msg => { if(msg.type()==='error') logs.consoleErrors.push(msg.text().replace(/https?:\/\/[^\s)]+/g,'[url]').slice(0,250)); });
  page.on('pageerror', e => logs.pageErrors.push(String(e).slice(0,250)));
  page.on('requestfailed', req => { if(req.url().includes('localhost:4000')) logs.requests.push({method:req.method(),path:new URL(req.url()).pathname,failed:true}); });
  const visit = async (url, name, shot) => {
    await page.goto(base+url,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(1800);
    const text=(await page.locator('body').innerText().catch(()=>'' )).slice(0,1800);
    const overflow=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth, innerWidth, overflow:document.documentElement.scrollWidth>innerWidth}));
    logs.visits.push({name,url,finalUrl:new URL(page.url()).pathname, title:await page.title(), text, ...overflow});
    if(shot) await page.screenshot({path:path.join(out,shot),fullPage:true});
  };
  await visit('/?auth=true','login','01-login.png');
  const emailInput=page.locator('#email'); const passInput=page.locator('#password');
  await emailInput.fill(email); await passInput.fill(password);
  await page.screenshot({path:path.join(out,'02-login-ready.png'),fullPage:true});
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await page.waitForURL(/\/app(?:\/|$)/,{timeout:30000}).catch(()=>{});
  await page.waitForTimeout(2500);
  const afterLogin = {path:new URL(page.url()).pathname, visibleText:(await page.locator('body').innerText().catch(()=>'' )).slice(0,1200)};
  logs.login=afterLogin;
  if(afterLogin.path.startsWith('/app')) await page.screenshot({path:path.join(out,'03-dashboard.png'),fullPage:true});
  const routes=[['/app/diagnostico','diagnostico'],['/app/evidencias','evidencias'],['/app/resultados','resultados']];
  const viewports=[['desktop',1365,768],['tablet',768,1024],['mobile',390,844]];
  for(const [route,name] of routes){
    for(const [v,w,h] of viewports){
      await page.setViewportSize({width:w,height:h});
      await visit(route,`${name}-${v}`,`${name}-${v}.png`);
    }
  }
  // Keyboard/focus sample on diagnostic page; use only traversal, no activation.
  await page.setViewportSize({width:1365,height:768});
  await page.goto(base+'/app/diagnostico',{waitUntil:'domcontentloaded'}); await page.waitForTimeout(1500);
  await page.keyboard.press('Tab');
  logs.keyboard=await page.evaluate(()=>({activeTag:document.activeElement?.tagName, activeRole:document.activeElement?.getAttribute('role'), activeLabel:document.activeElement?.getAttribute('aria-label')||document.activeElement?.innerText?.slice(0,100), outline:getComputedStyle(document.activeElement).outlineStyle, outlineWidth:getComputedStyle(document.activeElement).outlineWidth}));
  await page.screenshot({path:path.join(out,'keyboard-focus.png'),fullPage:true});
  await fs.promises.writeFile(path.join(out,'browser-summary.json'),JSON.stringify(logs,null,2));
  await browser.close();
})().catch(async e=>{ console.error('RUN_ERROR',String(e).slice(0,300)); process.exitCode=1; });
