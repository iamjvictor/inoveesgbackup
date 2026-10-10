# 🗺️ Roadmap & Todo List — InoveESG

Este documento apresenta a lista de tarefas pendentes para a transição dos fluxos simulados e mockados da plataforma InoveESG para integrações reais em produção.

---

## 📋 Lista de Tarefas (Todo List)

### 1. 📄 Relatório PDF Real (Fim dos Mocks)
* [ ] **Backend**: Desenvolver serviço de geração dinâmica de PDF (utilizando bibliotecas como `pdfkit` ou `puppeteer`).
* [ ] **Dados Reais**: Consumir a nota consolidada (E, S, G), respostas das perguntas e dados cadastrais da organização para preencher a arte do relatório.
* [ ] **Frontend**: Habilitar a rota para download do arquivo PDF direto do storage (ex: S3/Supabase Storage) ou via stream HTTP do backend.

### 2. 📝 Questionários Dinâmicos
* [ ] **Modelagem no Banco**: Estruturar tabelas para perguntas, opções de resposta, seções (Ambiental, Social, Governança) e pesos no Prisma.
* [ ] **API de Questões**: Implementar rotas para busca estruturada do questionário ativo e envio de respostas (`POST /diagnostic/submit`).
* [ ] **Frontend**: Substituir os dados fixos da tela `/app/diagnostico` pelo formulário gerado a partir da chamada à API.

### 3. 🧮 Cálculo Consolidado de Pontuação e Pesos
* [ ] **Algoritmo de Scoring**: Desenvolver no backend a fórmula de cálculo ponderada levando em consideração:
  * O peso individual de cada questão.
  * O status das evidências associadas (ex: bônus por evidências validadas).
  * A média ponderada de maturidade da cadeia de fornecedores vinculada.
* [ ] **Cadeia de Suprimentos**: Atualizar a nota global da organização compradora com base na nota ponderada dos seus fornecedores.

### 4. 📎 Fluxo de Evidências ESG
* [ ] **Upload Seguro**: Integrar biblioteca de upload (ex: `multer` com Supabase Client/AWS S3) para anexação de documentos probatórios.
* [ ] **Status de Validação**: Criar estados de revisão para cada evidência (`PENDENTE`, `APROVADO`, `REJEITADO`).
* [ ] **Histórico e Notas**: Permitir que o auditor insira comentários justificando a rejeição ou aprovação de uma evidência.

### 5. 💰 Fluxo de Orçamentos (Budget Flow)
* [ ] **Registro de Propostas**: Criar tabela `BudgetRequest` no banco de dados para consolidar as solicitações feitas no frontend.
* [ ] **Notificações**: Implementar disparos de e-mail automatizados (via Nodemailer/SendGrid) notificando a equipe de vendas do InoveESG quando uma nova proposta for solicitada.
* [ ] **Acompanhamento**: Atualizar a aba "Acompanhar Orçamentos" na tela "Meus Serviços" para listar dados atualizados em tempo real.

### 6. 👑 Plataforma Administrativa (Admin Backoffice)
* [ ] **Painel Admin**: Criar uma área restrita para os administradores da InoveESG.
* [ ] **Auditoria**: Interface para listar diagnósticos pendentes de homologação e validar as evidências enviadas pelas empresas.
* [ ] **Gestão Comercial**: Permitir aprovação de orçamentos e edição de limites de convites de fornecedores por empresa.

### 7. 💳 Gateway de Pagamento Real (Mercado Pago Produção)
* [ ] **Integração de SDK**: Substituir as rotas simuladas pela SDK oficial do Mercado Pago no backend.
* [ ] **Checkout Transparente / Pro**: Gerar preferências de pagamento reais via Pix e Cartão de Crédito.
* [ ] **Webhooks**: Implementar tratamento seguro de notificações de pagamento (`IPN`) para atualizar automaticamente o status dos pedidos para `PAID` no banco de dados de produção.

---

> **Nota:** Este planejamento visa guiar as próximas fases de engenharia de software para tornar o sistema comercializável e integrado de ponta a ponta.

---

## 🛡️ Segurança & Qualidade da API — Plano por Fases

### 🔴 Fase 1 — Segurança Básica (Urgente — Antes de divulgar publicamente)

* [ ] **Rate Limiting**: Instalar `express-rate-limit` e aplicar limites nas rotas `POST /auth/login` (10 req/15min) e `POST /auth/register`, além de um limite global de 100 req/min para toda a API.
* [ ] **Limite de body JSON**: Alterar `express.json()` para `express.json({ limit: '10kb' })` em `src/app.ts` para prevenir ataques de payload gigante (DoS).
* [ ] **Helmet.js**: Instalar `helmet` e adicionar `app.use(helmet())` em `src/app.ts` para ativar headers de segurança HTTP automáticos (XSS, HSTS, MIME sniffing, clickjacking).
* [ ] **Corrigir rota `confirmPayment` sem auth**: Adicionar `authMiddleware` na rota `POST /invite/confirm-payment` em `invite.routes.ts` e validar que o `orderId` pertence ao usuário autenticado.
* [ ] **Validação Zod universal**: Adicionar schemas de validação Zod nos controllers `inviteController`, `diagnosticController` e `budgetController` (hoje só `authController` valida).

---

### 🟡 Fase 2 — Robustez e Observabilidade (Médio Prazo)

* [ ] **Health Check enriquecido**: Melhorar o endpoint `GET /api/health` para verificar e reportar o status real do banco de dados PostgreSQL, retornando `503` quando degradado.
* [ ] **Error Handler centralizado**: Criar `src/middlewares/errorHandler.ts` com tratamento global de erros (incluindo `ZodError`) para eliminar os `try/catch` duplicados em cada controller.
* [ ] **Padronização de respostas**: Criar utilitário `src/lib/response.ts` com funções `ok()` e `fail()` para garantir formato consistente em todas as respostas da API.
* [ ] **Logs estruturados**: Substituir `console.log/error` por `pino` (logger com formato JSON e níveis de log) para facilitar a ingestão em ferramentas de observabilidade em produção.
* [ ] **Proteção contra enumeração**: Adicionar rate limit específico e/ou exigir `token` de convite válido (em vez de `ref` livre de organização) no endpoint público `GET /invite/public-info`.

---

### 🔵 Fase 3 — Arquitetura e Escalabilidade (Longo Prazo)

* [ ] **Versionamento da API**: Prefixar todas as rotas com `/api/v1/` para permitir evolução sem quebrar clientes existentes.
* [ ] **Cache Redis compartilhado**: Migrar o cache em memória (`src/lib/cache.ts`) para Redis (add-on disponível no Railway) para suportar múltiplas instâncias do servidor.
* [ ] **Migrations automáticas no deploy**: Alterar o `start` script do `package.json` para `prisma migrate deploy && node dist/server.js`, garantindo que o banco esteja sempre sincronizado com o schema ao subir uma nova versão.
* [ ] **Testes automatizados**: Criar suíte de testes de integração com `vitest` + `supertest` cobrindo as rotas críticas (auth, diagnostic, invite e pagamentos).

---

### ⚫ Fase 4 — Monetização e Crescimento (Futuro)

* [ ] **Gateway de pagamento com webhook assinado**: Ao integrar Stripe ou Pagar.me, implementar verificação de assinatura HMAC nos webhooks para garantir que apenas o gateway pode confirmar pagamentos (substituindo o fluxo simulado atual).
* [ ] **Filas assíncronas**: Processar envio de e-mails e notificações em background com **BullMQ** (Redis-based), retirando essas operações do fluxo síncrono do request.
* [ ] **RBAC (Role-Based Access Control)**: Implementar verificação de papéis (`ADMIN`, `COMPANY_USER`, `SUPPLIER`) diretamente nas rotas para garantir que cada perfil só acesse o que lhe é permitido.
