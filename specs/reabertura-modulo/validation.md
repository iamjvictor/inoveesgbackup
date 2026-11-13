# Validação
- AC-001: QA Playwright autenticado comparou as 17 alternativas exibidas com as respostas persistidas; após limpar cache de sessão e recarregar, 17/17 coincidem.
- AC-002: QA alterou temporariamente E1 no navegador isolado e recarregou; valor temporário prevaleceu, sem POST. Isolamento por diagnosticId revisado no código.
- AC-003: nenhuma resposta foi submetida no reteste; proteção do concluído permanece no código preexistente. TypeScript frontend e git diff --check passaram.
- AC-004: POST anteriormente 10,732 s; medição read-only em transação de 17 SELECTs sequenciais 3,397 s, ou 3,778 s com abertura/commit. São leituras, não medição das gravações. Sugere-se instrumentação por etapa e upsert em lote mantendo locks.
- Evidências: qa/artifacts/diagnostic-fix-20261105/reopen-check.json e local-draft-check.json.
