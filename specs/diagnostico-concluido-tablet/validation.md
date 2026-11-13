# Validação
- AC-001: QA Playwright autenticado confirmou diagnóstico concluído com 75 respostas; acesso direto a preencher redireciona, sem POST.
- AC-002: testes do guard recusam COMPLETED; revisão confirmou lock transacional compartilhado por save/finalização. Concorrência exercitada com mock; não houve teste de concorrência em PostgreSQL real nem tentativa de sobrescrever dados concluídos.
- AC-003: QA respondeu módulo Ambiental pela interface na conta Estratégica; banco mostrou 17 respostas e ACTIVE, E1 anterior preservada. Captura pós-clique ainda mostrava Salvando; resposta HTTP não capturada pelo harness.
- AC-004: navegador desktop 1365×900, tablet 768×1024 e mobile 390×844 sem corte; tablet medido com reteste após patch.
- TypeScript backend/frontend, testes focados e git diff --check passaram; detalhes em qa/reports/2026-11-05-diagnostico-protecao-tablet.md.
