const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
 const browser=await chromium.launch({headless:true}); const context=await browser.newContext({viewport:{width:1365,height:900}}); const page=await context.newPage();
 const events=[], blocked=[]; let moduleSubmit=null, before=null, after=null;
 page.on('request', req=>{const u=new URL(req.url());if(u.pathname.startsWith('/api/'))events.push({method:req.method(),path:u.pathname});});
 page.on('response', async res=>{const u=new URL(res.url());if(u.pathname==='/api/diagnostic/current'){try{const j=await res.json();const axisCount={};for(const q of j.questions||[])axisCount[q.axis]=(axisCount[q.axis]||0)+1;const row={status:res.status(),hasDiagnostic:j.hasDiagnostic,diagnosticStatus:j.diagnostic?.status,responseCount:j.diagnostic?._count?.responses,questionCount:j.questions?.length,byAxis:axisCount};if(!before)before=row;else after=row;}catch{}}if(u.pathname.endsWith('/submit')){try{moduleSubmit=moduleSubmit||{};moduleSubmit.responseStatus=res.status();moduleSubmit.responseBody=await res.json()}catch{}}});
 await page.route('**/api/**',async route=>{const req=route.request(),u=new URL(req.url()),m=req.method();if(m==='POST'&&u.pathname==='/api/auth/login')return route.continue();if(m==='POST'&&/^\/api\/diagnostic\/[^/]+\/submit$/.test(u.pathname)){let b;try{b=req.postDataJSON()}catch{};const orders=(b?.responses||[]).map(x=>x.questionOrder);if(b?.finalize===false&&b?.responsibilityDeclarationAccepted===false&&orders.length===17&&orders.every((n,i)=>n===i+1)&&b.responses.every(x=>x.axis==='ENVIRONMENTAL')){moduleSubmit={request:{finalize:b.finalize,answerCount:orders.length,orders,axis:'ENVIRONMENTAL'},responseStatus:null};const res=await route.fetch();moduleSubmit.responseStatus=res.status();let resultBody;try{resultBody=await res.json();moduleSubmit.responseBody=resultBody}catch{};return route.fulfill({status:res.status(),contentType:'application/json',body:JSON.stringify(resultBody||{})});}blocked.push({method:m,path:u.pathname});return route.abort('blockedbyclient');}if(!['GET','HEAD','OPTIONS'].includes(m)){blocked.push({method:m,path:u.pathname});return route.abort('blockedbyclient');}return route.continue();});
 try{
  await page.goto('http://localhost:3000/?auth=true',{waitUntil:'domcontentloaded'});await page.locator('#email').waitFor({state:'visible',timeout:10000});await page.locator('#email').fill(process.env.QA_EMAIL);await page.locator('#password').fill(process.env.QA_PASSWORD);await Promise.all([page.waitForResponse(r=>r.url().includes('/api/auth/login')&&r.status()===200,{timeout:15000}),page.getByRole('button',{name:'Entrar',exact:true}).click()]);await page.waitForTimeout(900);
  const current=await page.evaluate(async()=>{const r=await fetch('/api/diagnostic/current',{credentials:'include'});const j=await r.json();return {status:r.status,hasDiagnostic:j.hasDiagnostic,id:j.diagnostic?.id,diagnosticStatus:j.diagnostic?.status,count:j.diagnostic?._count?.responses,questions:j.questions||[]}});
  if(current.status!==200||current.diagnosticStatus!=='ACTIVE'||current.count!==1)throw Error('Precondition mismatch: active diagnostic must have exactly one existing response; nothing submitted.');
  const qE=current.questions.filter(q=>q.axis==='ENVIRONMENTAL');if(qE.length!==17)throw Error(`Expected E module 17 questions; received ${qE.length}.`);
  await page.goto('http://localhost:3000/app/diagnostico/preencher?axis=E',{waitUntil:'domcontentloaded'});await page.waitForTimeout(1500);await page.screenshot({path:'qa/artifacts/diagnostic-fix-20261105/strategic-module-start.png',fullPage:true});
  let selected=[];
  for(let i=0;i<17;i++){
    const prompt=qE[i].prompt; await page.getByText(prompt,{exact:true}).waitFor({state:'visible',timeout:10000});
    const value=i===0?'Inexistente (A prática não existe, não é discutida ou nunca foi implementada)':(await page.locator('input[type=radio]').first().getAttribute('value'));
    const radio=page.locator(`input[type="radio"][name="q-${qE[i].number}"]`).filter({has:page.locator('')});
    const all=page.locator(`input[type="radio"][name="q-${qE[i].number}"]`);
    let choice=all.locator(`input[value="${value.replaceAll('"','\\"')}"]`);
    if(i===0){choice=all.locator('');}
    // Locate the answer by its associated label; preserve the existing E1 answer exactly.
    const label=page.locator('label').filter({has:all}).filter({hasText:value}).first();
    if(await label.count()) await label.click(); else await all.first().check({force:true});
    selected.push({order:qE[i].number,keptExisting:i===0});
    await page.waitForTimeout(520);
  }
  await page.getByRole('heading',{name:'Prova Concluída!'}).waitFor({timeout:10000});
  await page.screenshot({path:'qa/artifacts/diagnostic-fix-20261105/strategic-module-complete-unsaved.png',fullPage:true});
  await page.getByRole('button',{name:'Finalizar e voltar ao painel'}).click();
  await page.waitForTimeout(2000);
  const text=await page.locator('body').innerText();
  await page.screenshot({path:'qa/artifacts/diagnostic-fix-20261105/strategic-module-after-save.png',fullPage:true});
  const verify=await page.evaluate(async()=>{const r=await fetch('/api/diagnostic/current',{credentials:'include'});const j=await r.json();return {status:r.status,diagnosticStatus:j.diagnostic?.status,responseCount:j.diagnostic?._count?.responses,questionCount:j.questions?.length}});
  const out={loginSucceeded:events.some(e=>e.path==='/api/auth/login'),precondition:{status:current.status,diagnosticStatus:current.diagnosticStatus,responseCount:current.count,moduleQuestionCount:qE.length},selected,submit:moduleSubmit,verify,blocked,events,text:text.slice(0,700)};
  fs.writeFileSync('qa/artifacts/diagnostic-fix-20261105/strategic-module.json',JSON.stringify(out,null,2));
 }catch(e){fs.writeFileSync('qa/artifacts/diagnostic-fix-20261105/strategic-module.json',JSON.stringify({error:String(e).slice(0,500),before,submit:moduleSubmit,blocked,events},null,2));}
 await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
