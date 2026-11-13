const { chromium } = require('playwright');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const backend = path.resolve(__dirname, '../../../backend');
require(path.join(backend, 'node_modules/dotenv')).config({ path: path.join(backend, '.env') });
const { PrismaClient } = require(path.join(backend, 'node_modules/@prisma/client'));
const prisma = new PrismaClient();
const hash = (s) => createHash('sha256').update(s || '').digest('hex');
const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.once('line', async (line) => {
  const { email, password } = JSON.parse(line);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const events = [];
  let submitClickedAt = null;
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith('/api/')) events.push({ kind: 'request', ms: submitClickedAt === null ? null : Date.now() - submitClickedAt, method: request.method(), path: url.pathname });
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.pathname.startsWith('/api/')) events.push({ kind: 'response', ms: submitClickedAt === null ? null : Date.now() - submitClickedAt, method: response.request().method(), path: url.pathname, status: response.status() });
  });
  const result = {};
  try {
    await page.goto('http://localhost:3000/?auth=true');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    const loginPromise = page.waitForResponse((response) => response.url().includes('/api/auth/login'));
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    result.loginStatus = (await loginPromise).status();

    const currentResponse = await page.evaluate(async () => {
      const response = await fetch('/api/diagnostic/current', { credentials: 'include' });
      return { status: response.status, body: await response.json() };
    });
    const diagnostic = currentResponse.body.diagnostic;
    if (currentResponse.status !== 200 || diagnostic.status !== 'ACTIVE' || diagnostic._count.responses !== 17) throw new Error('Precondição não corresponde a diagnóstico ativo com 17 respostas; nenhum submit foi feito.');
    const before = await prisma.diagnosticResponse.findMany({ where: { diagnosticId: diagnostic.id, axis: 'ENVIRONMENTAL' }, orderBy: { questionOrder: 'asc' } });
    if (before.length !== 17) throw new Error('Banco não tem exatamente 17 respostas ambientais; nenhum submit foi feito.');
    const originalHashes = before.map((row) => ({ order: row.questionOrder, hash: hash(row.answerText) }));

    await page.goto('http://localhost:3000/app/diagnostico/preencher?axis=E');
    for (let order = 1; order <= 17; order += 1) {
      const checked = page.locator(`input[type="radio"][name="q-${order}"]:checked`);
      await checked.waitFor({ state: 'attached', timeout: 8000 });
      const uiValue = await checked.getAttribute('value');
      const dbValue = before.find((row) => row.questionOrder === order)?.answerText;
      if (uiValue !== dbValue) throw new Error(`Resposta da ordem ${order} difere do banco; submit abortado sem escrita.`);
      if (order < 17) {
        await page.getByRole('button', { name: 'Próxima pergunta', exact: true }).click();
        await page.locator(`input[type="radio"][name="q-${order + 1}"]`).first().waitFor({ state: 'attached', timeout: 8000 });
      }
    }

    await page.getByRole('button', { name: 'Finalizar Diagnóstico', exact: true }).click();
    await page.getByRole('heading', { name: 'Prova Concluída!' }).waitFor({ timeout: 8000 });
    result.preSave = { status: diagnostic.status, responseCount: diagnostic._count.responses, uiAnswersMatchDatabase: true, noQuestionAnswerWasChanged: true };
    await page.screenshot({ path: 'qa/artifacts/diagnostic-fix-20261105/save-identical-ready.png', fullPage: true });

    submitClickedAt = Date.now();
    const savePromise = page.waitForResponse((response) => response.url().includes(`/api/diagnostic/${diagnostic.id}/submit`) && response.request().method() === 'POST', { timeout: 30000 });
    await page.getByRole('button', { name: 'Finalizar e voltar ao painel', exact: true }).click();
    const saveResponse = await savePromise;
    result.saveStatus = saveResponse.status();
    result.saveMs = Date.now() - submitClickedAt;
    result.saveResponse = await saveResponse.json().catch(() => null);
    await page.waitForURL('**/app/diagnostico', { timeout: 30000 });
    result.navigationMs = Date.now() - submitClickedAt;

    const after = await prisma.diagnosticResponse.findMany({ where: { diagnosticId: diagnostic.id, axis: 'ENVIRONMENTAL' }, orderBy: { questionOrder: 'asc' } });
    const finalState = await prisma.diagnostic.findUnique({ where: { id: diagnostic.id }, select: { status: true } });
    result.after = {
      status: finalState.status,
      responseCount: after.length,
      answerHashesUnchanged: JSON.stringify(originalHashes) === JSON.stringify(after.map((row) => ({ order: row.questionOrder, hash: hash(row.answerText) }))),
    };
    result.network = events;
  } catch (error) {
    result.error = error.message;
    result.network = events;
  } finally {
    fs.writeFileSync('qa/artifacts/diagnostic-fix-20261105/save-identical-safe.json', JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
    await browser.close();
    await prisma.$disconnect();
  }
});
