# Evidências pertencentes à empresa

## Objetivo

Permitir que evidências aprovadas continuem válidas quando a empresa refizer o diagnóstico, sem perder os arquivos, o score comprovado ou o histórico de auditoria.

## Modelo de dados

- `evidences.organizationId` será o vínculo de propriedade obrigatório do arquivo.
- `evidences.diagnosticId` continuará como origem histórica do upload e permanecerá indexado.
- `evidence_scores.organizationId + axis` será a chave lógica do score comprovado permanente por empresa e pilar.
- `evidence_scores.diagnosticId` será removido; score comprovado não pertence a uma versão de diagnóstico.
- `evidence_requests` permanecerá ligado ao diagnóstico, pois representa uma solicitação específica daquele ciclo.
- `evidence_reviews` continuará ligado à evidência e preservará o histórico de todas as decisões.

## Regras de negócio

1. Upload autenticado grava `organizationId` a partir da empresa da sessão, nunca do payload do cliente.
2. O primeiro upload cria os quatro scores da empresa zerados com `upsert`/`createMany` idempotente.
3. Aprovar ou recusar uma evidência recalcula o score somente do pilar da evidência, usando os pontos dos requisitos da empresa.
4. Evidência aprovada permanece válida quando um novo diagnóstico é criado.
5. A nota declarada continua sendo lida do diagnóstico mais recente em `diagnostic_scores`.
6. A tela administrativa consulta evidências e scores por `organizationId`, usando o diagnóstico mais recente apenas para a nota declarada e os dados cadastrais.
7. Dados existentes serão migrados de `diagnostic.organizationId`; nenhuma evidência ou auditoria será apagada.

## Migração e compatibilidade

A migration adicionará `organizationId` inicialmente nullable, preencherá os registros existentes, criará índices e depois aplicará `NOT NULL` e a foreign key para `organizations`. O score existente será migrado para a empresa, mantendo o maior score comprovado por pilar quando houver duplicidade. A API continuará aceitando o `diagnosticId` na rota de upload para preservar compatibilidade, mas validará que ele pertence à empresa autenticada.

## Testes e segurança

- Testar backfill e unicidade por empresa/pilar.
- Testar que duas versões de diagnóstico da mesma empresa usam o mesmo score comprovado.
- Testar que uma empresa não consegue anexar evidência a diagnóstico de outra empresa.
- Testar aprovação/recusa e preservação do histórico.
- Manter RLS habilitado em `evidence_scores`; acesso de aplicação ocorre somente pelo backend com service role.
