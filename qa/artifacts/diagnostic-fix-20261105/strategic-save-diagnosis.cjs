const { chromium } = require('playwright');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const events = [];
  const now = () => Math.round(performance.now());
  page.on('request', request => {
    const u = new URL(request.url());
    if (u.pathname.startsWith('/api/')) events.push({ kind: 'request', atMs: now(), method: request.method(), path: u.pathname });
  });
  page.on('response', async response => {
    const u = new URL(response.url());
    if (!u.pathname.startsWith('/api/')) return;
    const event = { kind: 'response', atMs: now(), status: response.status(), method: response.request().method(), path: u.pathname };
    if (u.pathname.endsWith('/submit')) {
      try {
        const body = response.request().postDataJSON();
        event.requestPayload = { responseCount: body.responses?.length, finalize: body.finalize, responsibilityDeclarationAccepted: body.responsibilityDeclarationAccepted, orders: body.responses?.map(r => r.questionOrder), answerFingerprints: body.responses?.map(r => `${r.questionOrder}:${r.answerText?.length ?? 0}`) };
        event.responseBody = (await response.json());
      } catch {}
    }
    events.push(event);
  });

  await page.goto('http://localhost:3000/?auth=true', { waitUntil: 'domcontentloaded' });
  await page.locator('#email').fill(process.env.QA_EMAIL);
  await page.locator('#password').fill(process.env.QA_PASSWORD);
  const loginResponse = page.waitForResponse(r => r.url().includes('/api/auth/login'), { timeout: 15000 });
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  const login = await loginResponse;
  if (login.status() !== 200) throw new Error(`login failed ${login.status()}`);

  const currentResponse = await page.evaluate(async () => {
    const response = await fetch('/api/diagnostic/current', { credentials: 'include' });
    const data = await response.json();
    return {
      httpStatus: response.status,
      diagnosticId: data.diagnostic?.id,
      status: data.diagnostic?.status,
      responseCount: data.diagnostic?._count?.responses,
      questionCount: data.questions?.length,
      axisQuestions: (data.questions || []).filter(q => q.axis === 'ENVIRONMENTAL').map(q => ({ number: q.number, hasAnswerField: Object.hasOwn(q, 'answer'), answerLength: typeof q.answer === 'string' ? q.answer.length : null, hasAnswerTextField: Object.hasOwn(q, 'answerText'), answerTextLength: typeof q.answerText === 'string' ? q.answerText.length : null })),
    };
  });
  if (currentResponse.httpStatus !== 200 || currentResponse.status !== 'ACTIVE' || currentResponse.responseCount !== 17) {
    throw new Error(`precondition failed; no write performed: ${JSON.stringify({ status: currentResponse.status, count: currentResponse.responseCount })}`);
  }
  await page.goto('http://localhost:3000/app/diagnostico/preencher?axis=E', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1800);
  const initialUi = await page.locator('body').innerText();
  if (!initialUi.includes('Prova Concluída!')) {
    const report = { capturedAt: new Date().toISOString(), precondition: currentResponse, initialUi: initialUi.slice(0, 1400), currentUrl: page.url(), apiEvents: events, note: 'Stopped before any write: UI did not load completed module screen.' };
    fs.writeFileSync('qa/artifacts/diagnostic-fix-20261105/strategic-save-diagnosis-20261105.json', JSON.stringify(report, null, 2));
    await page.screenshot({ path: 'qa/artifacts/diagnostic-fix-20261105/strategic-save-initial-20261105.png', fullPage: true });
    console.log(JSON.stringify(report));
    await browser.close();
    return;
  }
  await page.screenshot({ path: 'qa/artifacts/diagnostic-fix-20261105/strategic-save-before-20261105.png', fullPage: true });
  const preSave = await page.locator('body').innerText();
  const answeredUi = preSave.match(/(\d+)\s*\/\s*17/);
  if (answeredUi && Number(answeredUi[1]) !== 17) throw new Error(`UI does not show full module; no write performed: ${answeredUi[0]}`);

  const clickedAt = now();
  const returned = page.waitForURL('**/app/diagnostico', { timeout: 30000 }).then(() => ({ result: 'navigated', atMs: now() })).catch(() => ({ result: 'timeout', atMs: now() }));
  await page.getByRole('button', { name: 'Finalizar e voltar ao painel' }).click();
  const buttonTimeline = [];
  let lastState = '';
  const poll = setInterval(async () => {
    try {
      const text = await page.getByRole('button', { name: /Salvando|Finalizar e voltar ao painel/ }).innerText({ timeout: 200 });
      if (text !== lastState) { lastState = text; buttonTimeline.push({ atMs: now(), text }); }
    } catch {}
  }, 100);
  const navigation = await returned;
  clearInterval(poll);
  await page.waitForTimeout(2500);
  const finalUrl = page.url();
  const finalText = (await page.locator('body').innerText()).slice(0, 1000);
  await page.screenshot({ path: 'qa/artifacts/diagnostic-fix-20261105/strategic-save-after-20261105.png', fullPage: true });
  const finalCurrent = await page.evaluate(async () => {
    const r = await fetch('/api/diagnostic/current', { credentials: 'include' });
    const j = await r.json();
    return { status: r.status, diagnosticStatus: j.diagnostic?.status, responseCount: j.diagnostic?._count?.responses };
  });
  const output = {
    capturedAt: new Date().toISOString(),
    clickedAtMs: clickedAt,
    precondition: currentResponse,
    uiBeforeSave: { completedHeading: preSave.includes('Prova Concluída!'), answerProgressText: answeredUi?.[0] || null },
    buttonTimeline,
    navigation,
    finalUrl,
    finalText,
    finalCurrent,
    apiEvents: events,
  };
  fs.writeFileSync('qa/artifacts/diagnostic-fix-20261105/strategic-save-diagnosis-20261105.json', JSON.stringify(output, null, 2));
  console.log(JSON.stringify(output));
  await browser.close();
})().catch(error => { console.error(error.message); process.exit(1); });
