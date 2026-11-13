---
name: browser-qa
description: Controle do Chromium via Playwright e coleta auditável de evidências do navegador.
---

# Browser QA

- Use Playwright Test/CLI ou MCP Playwright se disponível. Faça preflight da ferramenta e registre qual mecanismo usou. Se MCP não estiver configurado, use Playwright Test local; não instale ferramenta/dependência sem delegação ou autorização do orquestrador.
- Abra `http://localhost:3000` em Chromium e confirme conteúdo visível e carregamento sem erro fatal.
- Use snapshot de acessibilidade para identificar controles e estado; screenshots complementam, não substituem, a árvore acessível.
- Salve screenshots em `qa/artifacts/<round_id>/` nos marcos: estado inicial, erro, sucesso, checkout e confirmação. Não registre tela que mostre segredos ou dados pessoais não sintéticos.
- Capture erros de console, requisições que falharam, status HTTP e respostas relevantes, sanitizando cookies, Authorization, tokens, assinaturas e dados pessoais antes de persistir.
- Um fluxo só pode ser declarado aprovado com evidência de navegador e confirmação correspondente de rede/backend. Screenshot isolada ou botão clicado não prova compra concluída.
- Registre ambiente, URL, hora, navegador/versão e passos de reprodução junto a cada artefato.
