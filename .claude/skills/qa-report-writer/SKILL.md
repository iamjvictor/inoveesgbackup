---
name: qa-report-writer
description: Geração de relatório Markdown, JSON e evidências por rodada QA.
---

# QA report writer

Ao final de toda rodada, crie `qa/reports/YYYY-MM-DD-HHmm.md` e `.json`, com timestamps e timezone. Salve evidências sob `qa/artifacts/<round_id>/`. Se nenhum cenário puder executar, produza relatório de bloqueio; não omita rodada.

Markdown deve conter: status do ambiente, cenários executados (PASS/FAIL/BLOCKED), contas sintéticas criadas (identificadores mascarados), resultado checkout, bugs reproduzíveis com severidade/passos/evidências/hipótese técnica, bloqueios e tentativas, melhorias priorizadas e próximos testes.

JSON válido deve conter as chaves `round_id`, `started_at`, `finished_at`, `environment`, `scenarios`, `bugs`, `blocked_items`, `synthetic_accounts`, `artifacts`, `improvements`, `next_actions`. Inclua classificação sandbox, hosts sanitizados, comando executado e resultado. Preserve evidências por referência de arquivo.

Nunca grave senhas, tokens, chaves, cookies, Authorization, número/CVV de cartão, assinatura webhook, dados pessoais reais ou payloads não sanitizados. Não invente resultados nem converta bloqueio em aprovação. A aceitação pelo provedor não equivale a entrega de e-mail ou liquidação financeira.
