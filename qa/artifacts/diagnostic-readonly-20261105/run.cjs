const { chromium } = require('playwright');
const fs = require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true}); const context=await browser.newContext({viewport:{width:1365,height:900}}); const page=await context.newPage();
 const responses=[]; const blockedWrites=[]; const consoleErrors=[]; const pageErrors=[];
 page.on('console',m=>{if(m.type()==='error') consoleErrors.push(m.text().slice(0,300));});
 page.on('pageerror',e=>pageErrors.push(String(e).slice(0,300)));
 page.on('response',async r=>{let u=new URL(r.url()); if(u.hostname==='localhost' && u.pathname.startsWith('/api/')) {const row={method:r.request().method(),path:u.pathname,status:r.status()}; if(u.pathname==='/api/diagnostic/current'){try{const j=await r.json();row.data={hasDiagnostic:j.hasDiagnostic,kind:j.diagnostic?.kind,status:j.diagnostic?.status,responses:j.diagnostic?._count?.responses,questions:j.questions?.length,industrySegment:j.industrySegment,message:j.message?String(j.message).slice(0,300):undefined}}catch{}} responses.push(row);}});
 await page.route('**/api/**',async route=>{const req=route.request(),u=new URL(req.url()),method=req.method(); if(u.pathname==='/api/diagnostic/start'&&method==='POST'){blockedWrites.push({method,path:u.pathname});return route.abort('blockedbyclient');} return route.continue();});
 const shots=[];
 try {
  await page.goto('http://localhost:3000/?auth=true',{waitUntil:'domcontentloaded'}); await page.waitForTimeout(1000);
  if (!(await page.locator('#email').count())) { await page.getByLabel('Login').click(); await page.locator('#email').waitFor({state:'visible',timeout:10000}); }
  const snap=await page.locator('body').ariaSnapshot(); fs.writeFileSync('qa/artifacts/diagnostic-readonly-20261105/01-login-snapshot.txt',snap.slice(0,8000));
  const email=process.env.QA_EMAIL, password=process.env.QA_PASSWORD;
  let emailInput=page.locator('#email');
  if(await emailInput.count()){await emailInput.fill(email); await page.locator('#password').fill(password); await page.getByRole('button',{name:'Entrar', exact:true}).click(); await page.waitForURL('**/app', {timeout:12000}).catch(()=>{}); await page.waitForTimeout(1500);}
  await page.waitForTimeout(1800); await page.goto('http://localhost:3000/app/diagnostico',{waitUntil:'domcontentloaded'}); await page.waitForTimeout(8000);
  shots.push('02-diagnostico-desktop.png'); await page.screenshot({path:'qa/artifacts/diagnostic-readonly-20261105/02-diagnostico-desktop.png',fullPage:true});
  const text=await page.locator('body').innerText();
  const current=responses.filter(x=>x.path==='/api/diagnostic/current').at(-1); const start=responses.filter(x=>x.path==='/api/diagnostic/start');
  await page.goto('http://localhost:3000/app/diagnostico/preencher',{waitUntil:'domcontentloaded'}); await page.waitForTimeout(2500);
  shots.push('03-preencher.png'); await page.screenshot({path:'qa/artifacts/diagnostic-readonly-20261105/03-preencher.png',fullPage:true});
  const fillText=await page.locator('body').innerText();
  const snap2=await page.locator('body').ariaSnapshot(); fs.writeFileSync('qa/artifacts/diagnostic-readonly-20261105/04-preencher-snapshot.txt',snap2.slice(0,8000));
  const result={front:'http://localhost:3000',backendHealth:await (await fetch('http://localhost:4000/api/health')).status,finalUrl:page.url(),loginAuthenticated:responses.some(x=>x.path==='/api/auth/me'&&x.status===200),diagnosticVisible:/diagn[oó]stico/i.test(text),diagnosticText:text.slice(0,1800),fillRouteText:fillText.slice(0,1800),currentCalls:responses.filter(x=>x.path==='/api/diagnostic/current'),startCalls:start,blockedWrites,consoleErrors,pageErrors,responses,screenshots:shots};
  fs.writeFileSync('qa/artifacts/diagnostic-readonly-20261105/network-summary.json',JSON.stringify(result,null,2));
 } catch(e){fs.writeFileSync('qa/artifacts/diagnostic-readonly-20261105/failure.txt',String(e));}
 await browser.close();
})();
