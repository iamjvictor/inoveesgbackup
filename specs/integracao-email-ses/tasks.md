# Pacotes

| Pacote | Objetivo e critérios | Arquivos previstos e limites | Dependência e verificação |
|---|---|---|---|
| P1 | Outbox e transações AC-001/002/005 | `backend/prisma/schema.prisma`, migrations aplicáveis, repositório de auth e serviço de diagnóstico; preservar fluxos existentes | Testes transacionais, repetição e concorrência; sem executar migration remota. |
| P2 | Porta, templates, SES e configuração AC-003/004 | `backend/src/modules/email/`, `backend/src/config/env.ts`, `backend/package.json` e lockfile | Testes com adaptador falso e SDK simulado; sem credenciais reais. |
| P3 | Worker e operação AC-005/007 | `backend/src/modules/email/`, script de worker, documentação de execução | Após P1/P2; testes de lease, retry, concorrência e falhas. |
| QA | Cenários AC-001–007 | Testes independentes e `validation.md`; não alterar produção | Após integração; suíte backend e revisão de privacidade. |
| Ambiente | Configurar SES e validar sandbox AC-004/007 | Console AWS, DNS e configuração do ambiente, mediante acesso e autorização apropriados | Conta, domínio, região e destinatário de teste; registrar resultado sem credenciais. |

Pacotes com arquivos compartilhados devem ser sequenciais ou ter responsabilidade particionada antes de iniciar. Até dois implementadores ativos; revisão por `revisor_qa` independente.
