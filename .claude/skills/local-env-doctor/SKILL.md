---
name: local-env-doctor
description: Preflight e diagnóstico seguro dos serviços locais antes de testes QA.
---

# Local environment doctor

- Verifique `http://localhost:3000` e o health endpoint real do backend em `http://localhost:4000` (descubra rotas no código; se não houver health endpoint, registre a rota alternativa usada).
- Em porta sem resposta, confira listener/processo (`ss`, `lsof` ou equivalente), logs recentes dos processos existentes, `.env`, `.env.local` e scripts `package.json`. Nunca imprima valores de segredos; registre apenas variável presente/ausente e classificação host local/remoto.
- Inicie serviço somente por comando documentado no `package.json`/README, mantendo processo visível e logado. Não iniciar backend se configuração indicar produção, não identificada ou com efeitos externos não autorizados. Cadastro no Supabase remoto e integração de pagamento são operações externas, mesmo quando o frontend é localhost.
- Após iniciar, repita health checks e registre tentativa, comando, resultado/código de saída, hora e evidência sanitizada.
- Se não resolver, classifique `ENVIRONMENT_BLOCKED`, preserve logs pertinentes em `qa/artifacts/` e siga com testes puramente locais que não acessem sistemas externos.
