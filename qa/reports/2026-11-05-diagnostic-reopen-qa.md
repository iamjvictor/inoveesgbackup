# QA independente — reabertura do módulo ativo

Data: 2026-11-05. Ambiente: frontend localhost:3000, backend de teste localhost:4000. Conta sintética Estratégica; credenciais não persistidas.

## Critérios e resultados

| Critério | Resultado | Evidência |
|---|---|---|
| ACTIVE com respostas | PASS | Login 200; GET current 200; ACTIVE, 17 respostas E e 17 questões E. |
| Reabrir módulo | PASS | Na rota `/app/diagnostico/preencher?axis=E`, as 17 alternativas selecionadas corresponderam ao `answerText` retornado pela API por `questionOrder`. |
| Restaurar do servidor sem cache local | PASS | Removi a chave de rascunho somente no contexto isolado, recarreguei e confirmei novamente 17/17 seleções corretas. |
| Preservar edição temporária | PASS | Em contexto isolado alterei E1 sem submeter; após reload o valor temporário continuou exibido. Nenhum POST de diagnóstico ocorreu. |
| Integridade/persistência | PASS | Reenviei pela UI os mesmos 17 valores, após comparar cada resposta com o banco. POST respondeu 200 em 2.981 ms; diagnóstico permaneceu ACTIVE, com 17 respostas e hashes dos valores sem mudança. |
| Chamadas de rede | PASS | Durante leitura/reabertura/reload não houve POST start nem submit. Os únicos POSTs monitorados foram autenticação em sessão nova; teste de rascunho local não teve POST de diagnóstico. |

## Revisão

A página combina respostas persistidas do `GET /diagnostic/current` com o rascunho `sessionStorage`, usando o servidor como base e valores locais para sobrescrever apenas perguntas marcadas como editadas no formato v2. O cache está chaveado pelo ID do diagnóstico. A inspeção e os casos de navegador confirmaram que valores vazios de cache legado não ocultam respostas do banco, que rascunho v2 vazio intencional é respeitado e que um valor local não vazio sobrevive ao reload. Não observei mistura entre diagnósticos.

## Reproduzir

Execute `node qa/artifacts/diagnostic-fix-20261105/reopen-check.cjs`, `stale-empty-cache-check.cjs`, `local-draft-check.cjs` e `save-identical-safe.cjs` com credenciais sintéticas fornecidas por stdin, sem gravá-las em arquivos. Evidências sanitizadas ficam em `qa/artifacts/diagnostic-fix-20261105/`.

## Limitações

O salvamento foi exercitado contra o PostgreSQL configurado no backend local e confirmou retorno 200, 17 respostas, status ACTIVE e hashes idênticos antes/depois. Não executei teste concorrente real no PostgreSQL nem simulação de falha transitória integrada; esses aspectos permanecem limitados aos testes unitários.

## Salvamento do módulo e latência

Com as 17 alternativas verificadas contra o banco, salvei o módulo sem alterar respostas e sem finalizar o diagnóstico. O POST `/api/diagnostic/{id}/submit` respondeu HTTP 200 em **2.981 ms**; navegação/refresh concluíram em 3.446 ms. Antes/depois: status `ACTIVE`, 17 respostas e hashes idênticos. Evidência: `qa/artifacts/diagnostic-fix-20261105/save-identical-safe.json` e screenshot `save-identical-ready.png`. A medição anterior era 10.732 s; esta execução foi cerca de 7.75 s mais rápida, mas é uma amostra única.

**Resultado geral: PASS** para reabertura, cache legado/v2, preservação de rascunho e reenvio idempotente dos mesmos valores. Não encontrei falhas reproduzíveis pendentes neste escopo.
