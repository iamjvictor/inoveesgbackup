# QA — Proteção do diagnóstico concluído e layout tablet

- Data: 05/11/2026
- Ambiente: frontend `http://localhost:3000`, backend de teste `http://localhost:4000` (`/api/health` 200).
- Escopo: revisão independente de diagnóstico concluído, bloqueio de gravação, salvamento de módulo ativo pela interface e layout desktop/tablet/mobile.
- Nenhuma compra foi feita. O diagnóstico Bioimpacto concluído foi preservado.

## Cenários e evidências

| ID | Resultado | Evidência |
|---|---|---|
| QA-001 — abrir diagnóstico concluído | PASS | Login Bioimpacto; `GET /api/diagnostic/current` 200; UI mostra 93%, 75/75 respostas e quatro eixos concluídos. `diagnostico-desktop.png`. |
| QA-002 — acesso direto a preencher concluído | PASS | `/app/diagnostico/preencher` redirecionou à visão do diagnóstico; não houve POST de início nem submissão. `preencher-direto.png`, `browser-check.json`. |
| QA-003 — desktop 1365×900 | PASS parcial | Cards completos em duas colunas; cabeçalho e botões cabem. `diagnostico-desktop.png`. |
| QA-004 — tablet 768×1024 | PASS | Reteste após ajuste do banner: botão PDF em `x=353..688`, banner `x=320..721`, cards `x=320..721`; nenhum elemento passa dos limites do viewport. `scrollWidth=753`. Captura nova `diagnostico-tablet-retest-20261105.png`; medições completas em `tablet-retest-20261105.json`. |
| QA-005 — mobile 390×844 | PASS | Botão PDF em `x=41..334`, banner e cards em `x=16..359`; nenhum corte horizontal. `scrollWidth=375`. Captura nova `diagnostico-mobile-retest-20261105.png`. |
| QA-009 — desktop 1365×900 após ajuste | PASS | Botão PDF em `x=790..1007`, banner em `x=328..1310`, cards dentro do viewport. Captura `diagnostico-desktop-retest-20261105.png`. |
| QA-006 — salvar módulo ativo pela UI | PASS na persistência | Conta Estratégica ficou ACTIVE com 17 respostas ambientais, ordens 1–17. No reteste, os 17 valores exatos foram lidos antes e depois do salvamento, comparados por SHA-256 e permaneceram idênticos. O envio usou `finalize=false`; o diagnóstico não foi finalizado. `strategic-save-exact-answers-20261105.json`. |
| QA-007 — salvamento de COMPLETED | PASS por teste unitário/inspeção | `assertDiagnosticCanBeEdited` rejeita estado COMPLETED; não enviei escrita à conta concluída. Teste da guarda passou. |
| QA-008 — disputa salvar/finalizar | PASS simulado | Teste `serializes saves and finalization for the same diagnostic` confirma serialização usando mock de advisory lock. PostgreSQL real não foi usado. |

## Achado durante o teste e correção

A primeira tentativa de salvar o módulo retornou 400 porque Prisma não consegue desserializar a coluna `void` de `pg_advisory_xact_lock` via `$queryRaw`. Nenhuma resposta foi persistida nessa tentativa; consulta confirmou o diagnóstico ainda com apenas E1. O helper foi alterado para executar o lock e retornar uma coluna escalar. Depois disso, a interface persistiu as 17 respostas do eixo Ambiental; diagnóstico permaneceu ACTIVE.

## Validações executadas

- Backend: `npx tsc --noEmit -p tsconfig.json` e quatro arquivos direcionados de teste — **16/16 passaram**.
- Frontend: `npx tsc --noEmit` passou.
- `git diff --check` passou.
- No navegador Bioimpacto: login confirmado, GET atual 200, zero POST de start ou submit durante a leitura do concluído, sem erros de console/page capturados.

## Reteste do salvamento e tempo de resposta

Na conta Estratégica local, `GET /api/diagnostic/current` retornou status `ACTIVE` e 17 respostas no banco. Ao abrir `/app/diagnostico/preencher?axis=E`, a UI mostrou `0/17` e o endpoint não incluiu os textos de resposta nas questões. Para isolar o tempo do salvamento sem alterar conteúdo, os valores persistidos foram lidos em modo somente leitura e selecionados novamente pela interface; hashes SHA-256 antes e depois coincidiram em todas as 17 respostas.

- Clique até início do POST: 0,019 s.
- `POST /api/diagnostic/{id}/submit`: HTTP 200, `{success:true,savedOnly:true}`, resposta em 10,732 s.
- Spinner `Salvando...`: apareceu em 0,023 s e terminou em 10,986 s.
- `refreshProfile`: começou 0,003 s após a resposta do POST; `/api/auth/me/access` respondeu em aproximadamente 0,004 s e `/api/auth/me` em aproximadamente 0,202 s.
- Navegação para `/app/diagnostico` ocorreu após o refresh; a tela permaneceu no formulário até então. `GET /api/diagnostic/current` respondeu em aproximadamente 12,46 s desde o clique.
- Estado final: diagnóstico `ACTIVE`, 17 respostas, conteúdo exatamente igual ao anterior. Não houve finalização.

O spinner anterior foi capturado antes do fim do salvamento. Não ficou travado, mas o POST leva cerca de 10,7 segundos e merece investigação de desempenho. Foi reproduzido também um achado independente: o formulário abre com `0/17` apesar de 17 respostas persistidas, porque a rota monta o modelo com o `sessionStorage` e a resposta de `current` não traz os textos das respostas em `questions`. A reabertura pode levar o usuário a escolher e salvar conteúdo diferente. Evidências: `qa/artifacts/diagnostic-fix-20261105/strategic-save-form-before-20261105.png`, `strategic-save-ready-20261105.png`, `strategic-save-after-exact-20261105.png` e `strategic-save-exact-answers-20261105.json`.

## Limitações e ação recomendada

1. Investigar a latência do POST de salvamento (10,7 s) e preservar feedback ao usuário durante a operação.
2. Corrigir a leitura das respostas já salvas ao reabrir módulo: UI exibiu 0/17 apesar do banco conter 17. A medição reaplicou exatamente os valores anteriores; hash antes/depois igual.
3. A concorrência foi verificada com mock; não foi executado teste de lock contra uma instância PostgreSQL real.
4. Não tentei gravar na conta Bioimpacto COMPLETED, para preservar as 75 respostas existentes.

Artefatos: `qa/artifacts/diagnostic-fix-20261105/`.
