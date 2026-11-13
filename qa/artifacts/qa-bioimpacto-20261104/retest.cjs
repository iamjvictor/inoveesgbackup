const {chromium}=require('playwright'); const fs=require('fs'); const path=require('path');
const out=__dirname, base='http://localhost:3000', email=process.env.QA_LOGIN_EMAIL, password=process.env.QA_LOGIN_PASSWORD;
(async()=>{
 const browser=await chromium.launch({headless:true}); const context=await browser.newContext({viewport:{width:1365,height:768}}); const page=await context.newPage();
 const log={responses:[],consoleErrors:[],pageErrors:[],navigations:[],storageKeyNames:[],cookieNames:[]};
 page.on('response',r=>{let u;try{u=new URL(r.url())}catch{return};if(u.hostname==='localhost'&&u.port==='4000')log.responses.push({atMs:Date.now(),method:r.request().method(),path:u.pathname,status:r.status()})});
 page.on('console',m=>{if(m.type()==='error')log.consoleErrors.push(m.text().slice(0,200))}); page.on('pageerror',e=>log.pageErrors.push(String(e).slice(0,200)));
 await page.goto(base+'/?auth=true',{waitUntil:'domcontentloaded'}); await page.locator('#email').fill(email); await page.locator('#password').fill(password); await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await page.waitForURL(/\/app(?:\/|$)/,{timeout:30000}); await page.waitForFunction(()=>!document.body.innerText.includes('Carregando seu perfil...'),null,{timeout:30000}).catch(()=>{});
 log.storageKeyNames=await page.evaluate(()=>Object.keys(localStorage).concat(Object.keys(sessionStorage).map(k=>'session:'+k)));
 log.cookieNames=(await context.cookies(base)).map(c=>c.name);
 const captures=[['/app/diagnostico','diagnostico'],['/app/evidencias','evidencias'],['/app/resultados','resultados']];
 const viewports=[['desktop',1365,768],['tablet',768,1024],['mobile',390,844]];
 for(const [route,name] of captures){for(const [v,w,h] of viewports){await page.setViewportSize({width:w,height:h}); await page.goto(base+route,{waitUntil:'domcontentloaded'}); await page.waitForFunction(()=>!document.body.innerText.includes('Carregando seu perfil...'),null,{timeout:30000}).catch(()=>{}); await page.waitForTimeout(500); const state=await page.evaluate(()=>({url:location.pathname,title:document.title,text:document.body.innerText.slice(0,1800),viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,activeTag:document.activeElement?.tagName,bodyScrollHeight:document.body.scrollHeight})); log.navigations.push({name,viewport:v,...state}); await page.screenshot({path:path.join(out,`${name}-${v}-retest.png`),fullPage:true});}}
 await page.goto(base+'/app/diagnostico',{waitUntil:'domcontentloaded'}); await page.waitForFunction(()=>!document.body.innerText.includes('Carregando seu perfil...'),null,{timeout:30000}).catch(()=>{}); await page.keyboard.press('Tab'); log.focus=await page.evaluate(()=>({tag:document.activeElement.tagName,label:(document.activeElement.getAttribute('aria-label')||document.activeElement.innerText||'').slice(0,80),outline:getComputedStyle(document.activeElement).outlineStyle,width:getComputedStyle(document.activeElement).outlineWidth}));
 await fs.promises.writeFile(path.join(out,'retest-summary.json'),JSON.stringify(log,null,2)); await browser.close();
})().catch(e=>{console.error('RETEST_ERROR',String(e).slice(0,300));process.exitCode=1});
