# Validação
- AC-001/002: lote parametrizado e guardas revisados; reenvio real das 17 respostas pela UI retornou 200, status ACTIVE e hashes preservados. Teste de conflitos duplicados last-wins passou.
- AC-003: testes unitários validam retry limitado em erros transitórios e exclusão de erros permanentes. Falha transitória e concorrência real em PostgreSQL não foram simuladas.
- AC-004: browser confirmou gravação e navegação com feedback, sem alterar respostas.
- AC-005: QA confirmou cache legado vazio, rascunho v2 vazio intencional e rascunho não vazio em navegador.
- AC-006: POST anterior 10,732 s, novo 2,981 s; amostra única, não benchmark.
- Testes direcionados 18/18; TypeScript backend/frontend e diff --check passaram. Execução ampla encontrou falhas em testes de email de conclusão e fixture webhook; não investigadas nesta rodada.
- Relatório: qa/reports/2026-11-05-diagnostic-reopen-qa.md.
