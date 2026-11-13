# Validação

Implementação local concluída; configuração AWS, aplicação de migração e testes de integração com banco e SES reais permanecem pendentes.

| Critérios | Pacote | Cenário e evidência | Estado |
|---|---|---|---|
| AC-001/002 | P1; QA 1 | Testes de contrato verificam eventos e destinatário na transação, chave única e guarda de concorrência | Aprovado estaticamente; transações e corrida em PostgreSQL real pendentes |
| AC-003/004 | P2; QA 2 | Templates, escape, URL, remetente, adapter SES simulado e configuração | Aprovado nos testes isolados; SES real pendente |
| AC-005/007 | P3; QA 2 | Worker simulado: lease, retry, limite e falhas; SQL com SKIP LOCKED revisado | Aprovado isoladamente; concorrência em banco real pendente |
| AC-006 | QA | `npm test`: 78 testes aprovados, zero falhas | Aprovado localmente |
| AC-004/007 | Ambiente | Conta, domínio, migration e envio em sandbox | Pendente de infraestrutura e credenciais |

`npm run build` concluído com sucesso. Revisões independentes identificaram e motivaram correções para destinatário de diagnóstico, RLS, protocolo de URL, limite de tentativas e remetente inválido. O aceite pelo SES não comprova entrega; falha após aceite pode gerar duplicação na recuperação. Nenhum e-mail real foi enviado.
