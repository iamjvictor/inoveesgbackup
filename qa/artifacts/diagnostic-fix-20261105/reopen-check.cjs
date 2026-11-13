const { chromium } = require('playwright');
const readline = require('node:readline');
const fs = require('node:fs');
const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
input.once('line', async (line) => {
  const { email, password } = JSON.parse(line);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const api = [];
  page.on('request', req => { const u = new URL(req.url()); if (u.pathname.startsWith('/api/')) api.push({ event: 'request', method: req.method(), path: u.pathname }); });
  page.on('response', res => { const u = new URL(res.url()); if (u.pathname.startsWith('/api/')) api.push({ event: 'response', method: res.request().method(), path: u.pathname, status: res.status() }); });
  const out = { loginStatus: null, before: null, checks: [], reload: null, api };
  try {
    await page.goto('http://localhost:3000/?auth=true', { waitUntil: 'domcontentloaded' });
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    const loginWait = page.waitForResponse(r => r.url().includes('/api/auth/login'), { timeout: 15000 });
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    out.loginStatus = (await loginWait).status();
    const current = await page.evaluate(async () => { const r=await fetch('/api/diagnostic/current',{credentials:'include'}); return {status:r.status, data:await r.json()}; });
    out.before = { status: current.status, diagnosticStatus: current.data.diagnostic?.status, responseCount: current.data.diagnostic?._count?.responses, axisResponses: current.data.diagnostic?.responses?.filter(r=>r.axis==='ENVIRONMENTAL').map(r=>({order:r.questionOrder,answer:r.answerText})), questionCount: current.data.questions?.filter(q=>q.axis==='ENVIRONMENTAL').length };
    if(current.status!==200 || current.data.diagnostic?.status!=='ACTIVE') throw new Error('Unexpected precondition; no write performed');
    await page.goto('http://localhost:3000/app/diagnostico/preencher?axis=E',{waitUntil:'domcontentloaded'});
    await page.getByText(current.data.questions.find(q=>q.axis==='ENVIRONMENTAL')?.prompt,{exact:true}).waitFor({timeout:15000});
    for(let order=1;order<=out.before.questionCount;order++){
      const expected=out.before.axisResponses.find(a=>a.order===order)?.answer;
      const displayed=await page.locator('input[type=radio]:checked').first().getAttribute('value').catch(()=>null);
      const body=(await page.locator('body').innerText()).slice(0,1800);
      out.checks.push({order,expected,displayed,selectedMatches:displayed===expected,progress:body.match(/\d+\s*\/\s*\d+/)?.[0]??null});
      if(order<out.before.questionCount){
        const buttons=await page.getByRole('button').allTextContents();
        const nextIndex=buttons.findIndex(t=>/próxima|pr[oó]ximo|continuar/i.test(t));
        if(nextIndex<0) break;
        await page.getByRole('button').nth(nextIndex).click();
      }
    }
    await page.evaluate(id=>sessionStorage.removeItem(`inoveesg:diagnostic-answers-${id}`),current.data.diagnostic.id);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.getByText(current.data.questions.find(q=>q.axis==='ENVIRONMENTAL')?.prompt,{exact:true}).waitFor({timeout:15000});
    out.reloadChecks=[];
    for(let order=1;order<=out.before.questionCount;order++){
      const expected=out.before.axisResponses.find(a=>a.order===order)?.answer;
      const displayed=await page.locator('input[type=radio]:checked').first().getAttribute('value').catch(()=>null);
      out.reloadChecks.push({order,selectedMatches:displayed===expected});
      if(order<out.before.questionCount){const buttons=await page.getByRole('button').allTextContents();const nextIndex=buttons.findIndex(t=>/próxima|pr[oó]ximo|continuar/i.test(t));if(nextIndex<0)break;await page.getByRole('button').nth(nextIndex).click();}
    }
    const after=await page.evaluate(async()=>{const r=await fetch('/api/diagnostic/current',{credentials:'include'}); const j=await r.json(); return {status:r.status,diagnosticStatus:j.diagnostic?.status,responseCount:j.diagnostic?._count?.responses,axisResponses:j.diagnostic?.responses?.filter(x=>x.axis==='ENVIRONMENTAL').map(x=>({order:x.questionOrder,answer:x.answerText}))}});
    const checked=await page.locator('input[type=radio]:checked').first().getAttribute('value').catch(()=>null);
    out.reload={...after,firstDisplayed:checked,firstExpected:out.before.axisResponses.find(x=>x.order===1)?.answer};
    await page.screenshot({path:'qa/artifacts/diagnostic-fix-20261105/reopen-first-question.png',fullPage:true});
  } catch(e) { out.error=e.message; }
  fs.writeFileSync('qa/artifacts/diagnostic-fix-20261105/reopen-check.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify({loginStatus:out.loginStatus,before:{status:out.before?.status,diagnosticStatus:out.before?.diagnosticStatus,responseCount:out.before?.responseCount,questionCount:out.before?.questionCount},checks:out.checks.map(({order,selectedMatches})=>({order,selectedMatches})),reloadChecks:out.reloadChecks,reload:out.reload,error:out.error,writeRequests:out.api.filter(x=>x.event==='request'&&x.method==='POST')}));
  await browser.close();
});
