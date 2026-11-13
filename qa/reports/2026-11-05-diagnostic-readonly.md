# QA Playwright — leitura segura do diagnóstico

- **Rodada:** `diagnostic-readonly-20261105`
- **Janela:** 2026-11-05 (America/Sao_Paulo)
- **Ambiente:** Frontend `http://localhost:3000` HTTP 200; API `http://localhost:4000/api/health` HTTP 200.
- **Navegador:** Playwright + Chromium headless.
- **Conta:** Bioimpacto sintética `qa.b***@example.com`; autenticação aceita.
- **Segurança:** Só login e GETs. Nenhum `POST /api/diagnostic/start`, resposta, submissão, checkout ou alteração de diagnóstico.

## Cenários

| Cenário | Estado | Evidência |
|---|---|---|
| Login | PASS | `POST /api/auth/login` 200; `GET /api/auth/me` e `/api/auth/me/access` 200. |
| Abrir `/app/diagnostico` | FAIL / bloqueado por API | Sem POST start; seis `GET /api/diagnostic/current` responderam 400 com `Cannot read properties of undefined (reading 'service')`. A UI mostrou “Status: Não Iniciado” e erro ao carregar, portanto o diagnóstico concluído e perguntas não puderam ser conferidos. |
| Abrir `/app/diagnostico/preencher` | FAIL / bloqueado por API | Sem POST start ou submit; GET current falhou com o mesmo 400; UI exibiu “Não foi possível abrir o diagnóstico”. Nenhuma resposta foi alterada. |
| Console e erros da página | FAIL | Console registrou erros de recurso HTTP 400 e carregamento do diagnóstico/perguntas. Sem `pageerror` fatal. |

## Falha reproduzível

**Severidade alta — `GET /diagnostic/current` perde o contexto do controller.**

1. Autenticar pela UI com a conta sintética.
2. Abrir `/app/diagnostico`.
3. Observar `GET /api/diagnostic/current` retornar 400; corpo sanitizado: `Cannot read properties of undefined (reading 'service')`.
4. Abrir `/app/diagnostico/preencher`; mesma falha de leitura.

A inspeção do código aponta `DiagnosticController.getCurrentDiagnostic` acessando `this.service`, enquanto `diagnostic.routes.ts` registra o método diretamente como callback Express, sem bind. O callback perde o `this`. Esse diagnóstico da causa é corroborado pela mensagem observada, mas a correção ainda precisa ser aplicada e retestada.

## Artefatos

- Captura: `qa/artifacts/diagnostic-readonly-20261105/02-diagnostico-desktop.png`
- Captura: `qa/artifacts/diagnostic-readonly-20261105/03-preencher.png`
- Rede: `qa/artifacts/diagnostic-readonly-20261105/network-summary.json`
- Snapshot: `qa/artifacts/diagnostic-readonly-20261105/04-preencher-snapshot.txt`

## Limitações e próximos passos

A falha do GET impediu validar a exibição do diagnóstico concluído e perguntas. Não clicar em “Iniciar Diagnóstico” foi intencional: com o GET falhando, isso poderia criar novo estado ou afetar o registro concluído. Após corrigir o binding e testar a rota pelo router, repetir estes dois passos e confirmar que a navegação não envia POST start.

## Revalidação após corrigir o binding da rota

- Login Bioimpacto: PASS; endpoints de perfil/acesso HTTP 200.
- GET `/api/diagnostic/current`: **6 respostas 200**, sempre com `hasDiagnostic=true`, `kind=FULL_DIAGNOSTIC`, `status=COMPLETED`, 75 respostas, 75 perguntas e segmento Agronegócio.
- `/app/diagnostico`: PASS; renderizou score geral 93%, eixos 99%, 88%, 95%, 91% e quatro eixos finalizados. Nenhum erro de console. Nenhum POST start foi feito.
- `/app/diagnostico/preencher`: falha de comportamento: mostra 0/75 respostas apesar do GET trazer 75 respostas persistidas. A tela reconstrói respostas apenas do `sessionStorage`, ignorando as respostas retornadas pelo servidor. Não escolhi nem salvei respostas na conta concluída.

### Achado adicional — preenchimento de diagnóstico concluído

**Severidade alta / risco confirmado no código, preservado sem tentativa destrutiva.** A rota preencher permite abrir o diagnóstico concluído e renderiza um questionário vazio. Em `DiagnosticService.saveResponses`, o código verifica existência e propriedade da empresa, mas não recusa status `COMPLETED`; depois faz `INSERT ... ON CONFLICT DO UPDATE` por diagnóstico/pergunta. Já `calculateScore` recusa diagnóstico concluído. Assim, há evidência concreta de que o endpoint de salvamento parcial poderia sobrescrever respostas de uma avaliação concluída. Não testei esse endpoint contra a conta Bioimpacto para preservar as 75 respostas.

## Teste de uma resposta na conta Estratégica

A consulta anterior ao teste confirmou diagnóstico `FULL_DIAGNOSTIC` `ACTIVE` com zero respostas. No navegador, `/app/diagnostico/preencher?axis=E` mostrou questão 1 de 17; selecionei a primeira alternativa (“Inexistente”) e enviei apenas essa resposta usando o mesmo endpoint de salvamento parcial, com `finalize=false`. A API respondeu HTTP 200 (`savedOnly=true`). Consulta de verificação posterior confirmou o diagnóstico ainda `ACTIVE`, com exatamente 1 resposta em ordem 1; não houve outras linhas, a avaliação não foi finalizada e nenhum dado pré-existente foi sobrescrito. Não cliquei em confirmação final.

Evidências adicionais: `qa/artifacts/diagnostic-readonly-20261105/strategic-single-answer.json`, `strategic-fill-before.png` e `strategic-fill-after.png`.
