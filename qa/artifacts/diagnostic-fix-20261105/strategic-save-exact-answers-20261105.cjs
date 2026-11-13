const { chromium } = require('playwright');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const backendPath = path.resolve(__dirname, '../../../backend');
require(path.join(backendPath, 'node_modules/dotenv')).config({ path: path.join(backendPath, '.env') });
const { PrismaClient } = require(path.join(backendPath, 'node_modules/@prisma/client'));
const prisma = new PrismaClient();
const hash = (value) => createHash('sha256').update(value || '').digest('hex');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const events = [];
  const t0 = Date.now();
  const t = () => Date.now() - t0;
  let saveClickAt = null;
  page.on('request', request => {
    const url = new URL(request.url());
    if (!url.pathname.startsWith('/api/')) return;
    if (saveClickAt !== null) events.push({ kind: 'request', atMs: t() - saveClickAt, method: request.method(), path: url.pathname });
  });
  page.on('response', async response => {
    const url = new URL(response.url());
    if (saveClickAt === null || !url.pathname.startsWith('/api/')) return;
    const event = { kind: 'response', atMs: t() - saveClickAt, status: response.status(), method: response.request().method(), path: url.pathname };
    if (url.pathname.endsWith('/submit')) {
      try {
        const body = response.request().postDataJSON();
        event.payload = { responseCount: body.responses?.length, finalize: body.finalize, responsibilityDeclarationAccepted: body.responsibilityDeclarationAccepted, answerHashes: (body.responses || []).map(row => ({ order: row.questionOrder, hash: hash(row.answerText) })) };
        event.responseBody = await response.json();
      } catch {}
    }
    events.push(event);
  });

  let output;
  try {
    await page.goto('http://localhost:3000/?auth=true', { waitUntil: 'domcontentloaded' });
    await page.locator('#email').fill(process.env.QA_EMAIL);
    await page.locator('#password').fill(process.env.QA_PASSWORD);
    const loginWait = page.waitForResponse(r => r.url().includes('/api/auth/login'), { timeout: 15000 });
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    const login = await loginWait;
    if (login.status() !== 200) throw new Error(`login failed: ${login.status()}`);

    const api = await page.evaluate(async () => {
      const response = await fetch('/api/diagnostic/current', { credentials: 'include' });
      const json = await response.json();
      return { httpStatus: response.status, diagnosticId: json.diagnostic?.id, status: json.diagnostic?.status, responseCount: json.diagnostic?._count?.responses, questions: json.questions };
    });
    if (api.httpStatus !== 200 || api.status !== 'ACTIVE' || api.responseCount !== 17) throw new Error(`precondition mismatch; no save performed: ${JSON.stringify({ status: api.status, count: api.responseCount })}`);
    const before = await prisma.diagnostic.findUnique({
      where: { id: api.diagnosticId },
      include: { responses: { where: { axis: 'ENVIRONMENTAL' }, orderBy: { questionOrder: 'asc' } } },
    });
    if (!before || before.status !== 'ACTIVE' || before.responses.length !== 17 || before.responses.some(row => !row.answerText)) throw new Error('DB precondition mismatch; no save performed');
    const baseline = before.responses.map(row => ({ order: row.questionOrder, answerHash: hash(row.answerText), answerText: row.answerText }));
    const questions = api.questions.filter(question => question.axis === 'ENVIRONMENTAL').sort((a, b) => a.number - b.number);
    if (questions.length !== 17 || questions.some((question, index) => question.number !== index + 1)) throw new Error('API question list does not match E orders 1-17; no save performed');
    for (const question of questions) {
      const row = baseline.find(answer => answer.order === question.number);
      if (!row || !(question.options || []).some(option => option.text === row.answerText)) throw new Error(`Saved response ${question.number} does not match a UI option; no save performed`);
    }

    await page.goto('http://localhost:3000/app/diagnostico/preencher?axis=E', { waitUntil: 'domcontentloaded' });
    await page.getByText(questions[0].prompt, { exact: true }).waitFor({ timeout: 15000 });
    const initial = await page.locator('body').innerText();
    const initialProgress = initial.match(/(\d+)\s*\/\s*17\s*perguntas respondidas/i)?.[1] ?? null;
    await page.screenshot({ path: 'qa/artifacts/diagnostic-fix-20261105/strategic-save-form-before-20261105.png', fullPage: true });
    if (Number(initialProgress) !== 0) throw new Error(`Expected fresh UI to show zero answers; no save performed. UI progress=${initialProgress}`);

    for (const question of questions) {
      const saved = baseline.find(row => row.order === question.number);
      const currentPrompt = page.getByText(question.prompt, { exact: true });
      await currentPrompt.waitFor({ state: 'visible', timeout: 10000 });
      const selected = await page.locator('input[type="radio"]').evaluateAll((inputs, data) => {
        const input = inputs.find(node => node.name === `q-${data.order}` && node.value === data.answer);
        if (!input) return false;
        input.click();
        return true;
      }, { order: question.number, answer: saved.answerText });
      if (!selected) throw new Error(`Could not select persisted option ${question.number}; did not submit`);
      if (question.number < 17) await page.getByText(questions[question.number].prompt, { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
      else await page.getByRole('heading', { name: 'Prova Concluída!' }).waitFor({ timeout: 5000 });
    }
    await page.screenshot({ path: 'qa/artifacts/diagnostic-fix-20261105/strategic-save-ready-20261105.png', fullPage: true });

    saveClickAt = t();
    const clickPromise = page.getByRole('button', { name: 'Finalizar e voltar ao painel' }).click();
    await clickPromise;
    const buttonTimeline = [];
    let priorButtonText = null;
    const waitUntil = Date.now() + 30000;
    let navigation = false;
    while (Date.now() < waitUntil) {
      const currentUrl = page.url();
      if (currentUrl === 'http://localhost:3000/app/diagnostico' || currentUrl.endsWith('/app/diagnostico')) { navigation = true; break; }
      try {
        const text = await page.getByRole('button', { name: /Salvando|Finalizar e voltar ao painel/ }).innerText({ timeout: 150 });
        if (text !== priorButtonText) { buttonTimeline.push({ atMs: t() - saveClickAt, text }); priorButtonText = text; }
      } catch {}
      await page.waitForTimeout(100);
    }
    const finalUrl = page.url();
    const finalText = (await page.locator('body').innerText()).slice(0, 500);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'qa/artifacts/diagnostic-fix-20261105/strategic-save-after-exact-20261105.png', fullPage: true });
    const after = await prisma.diagnostic.findUnique({
      where: { id: api.diagnosticId },
      include: { responses: { where: { axis: 'ENVIRONMENTAL' }, orderBy: { questionOrder: 'asc' } } },
    });
    const afterHashes = after.responses.map(row => ({ order: row.questionOrder, answerHash: hash(row.answerText) }));
    output = {
      capturedAt: new Date().toISOString(),
      diagnosticId: api.diagnosticId,
      precondition: { apiStatus: api.status, dbStatus: before.status, apiResponseCount: api.responseCount, eResponseCount: before.responses.length, initialUiProgress: `${initialProgress}/17` },
      save: { navigation, finalUrl, buttonTimeline, finalText, apiEvents: events },
      after: { status: after.status, responseCount: after.responses.length, exactAnswersUnchanged: JSON.stringify(baseline.map(({ order, answerHash }) => ({ order, answerHash }))) === JSON.stringify(afterHashes), responseHashes: afterHashes },
    };
  } catch (error) {
    output = { capturedAt: new Date().toISOString(), error: error.message, apiEvents: events };
  } finally {
    fs.writeFileSync('qa/artifacts/diagnostic-fix-20261105/strategic-save-exact-answers-20261105.json', JSON.stringify(output, null, 2));
    console.log(JSON.stringify(output));
    await browser.close();
    await prisma.$disconnect();
  }
})().catch(error => { console.error(error.message); process.exit(1); });
