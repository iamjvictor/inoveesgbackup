# Mapeamento de Relações (Proposta Inicial)

## 1) O que já existe no projeto

Com base em `../PROJECT.md`, `arquitetura_e_modelagem.md`, `../produto/servicos.md` e estrutura do front:

- O domínio é multitenant, com uma conta principal ligada a empresa.
- Existe jornada de diagnóstico ESG, evidências, resultados e cadeia de fornecedores.
- Há monetização mista:
  - Assinaturas (plano anual/semestral)
  - Serviços pontuais (avulsos)
  - Pacotes de convites (para fornecedores)
- Existe área administrativa (admin global) já prevista no front.

## 2) Decisão de modelagem para Empresa x Fornecedor

Para suportar sua regra de negócio sem duplicar cadastro:

- Vamos ter **uma entidade canônica `organizations`** (cadastro único de CNPJ).
- O papel de negócio vem de **`organization_roles`**.
- O acesso efetivo vem de **contratações e permissões ativas**, nao apenas do papel.

Regras:

- Uma `organization` pode ter papel `COMPANY` e também `SUPPLIER` ao mesmo tempo.
- Uma `organization` que nasceu como `SUPPLIER` convidado não ganha acesso de `COMPANY` automaticamente.
- O "upgrade" para empresa pagante acontece quando houver contratação válida (assinatura/serviço que habilite acesso), e então adicionamos papel `COMPANY`.
- Se essa organização parar de pagar, ela **não perde o cadastro nem o papel `SUPPLIER`**.
- No downgrade, ela perde apenas os acessos premium vinculados a assinatura/serviço, mantendo o acesso free de fornecedor se tiver relacionamento com outras empresas.

Isso resolve o requisito: "empresa pode ser fornecedora; fornecedor não vira empresa por padrão".

## 3) Estrutura de tabelas proposta

## 3.1 Identidade e acesso

### `users`
- Usuário humano (login no Supabase Auth)
- Campos-chave: `id`, `supabase_user_id`, `email`, `full_name`, `status`, `created_at`

### `organizations`
- Entidade jurídica (empresa/fornecedor)
- Campos-chave: `id`, `legal_name`, `trade_name`, `cnpj` (unique), `status`, `created_at`

### `organization_roles`
- Papéis da organização
- Campos-chave: `id`, `organization_id`, `role` (`COMPANY`, `SUPPLIER`), `source` (`SELF_SIGNUP`, `INVITE`, `UPGRADE`)
- Constraint: unique (`organization_id`, `role`)

Observacao:
- `organization_roles` modela identidade de negocio, nao billing.
- O papel `SUPPLIER` tende a ser persistente enquanto existir ao menos um vinculo na cadeia.
- O papel `COMPANY` pode continuar registrado historicamente mesmo sem plano ativo; o que muda é o entitlement de acesso.

### `organization_users`
- Vincula usuário à organização com função interna
- Campos-chave: `id`, `organization_id`, `user_id`, `membership_role` (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`)
- Constraint: unique (`organization_id`, `user_id`)

### `admin_users`
- Admin global da plataforma (backoffice)
- Campos-chave: `id`, `user_id`, `admin_role` (`SUPER_ADMIN`, `OPS`, `FINANCE`)

## 3.2 Catálogo de oferta comercial

### `products`
- Unidade comercial vendável
- Exemplos: "Diagnóstico Estratégico", "Plano Bioimpacto Empresarial", "Pacote Convites 50"
- Campos: `id`, `name`, `product_kind` (`SUBSCRIPTION`, `ONE_TIME`, `INVITE_PACK`), `active`

### `plans`
- Regras de assinatura recorrente (quando `product_kind=SUBSCRIPTION`)
- Campos: `id`, `product_id`, `billing_period` (`MONTH`, `SEMESTER`, `YEAR`), `price_cents`, `currency`, `trial_days`

### `services`
- Serviços avulsos (quando `product_kind=ONE_TIME`)
- Campos: `id`, `product_id`, `pricing_type` (`FIXED`, `QUOTE`), `base_price_cents` nullable

### `feature_flags`
- Recursos da plataforma (ex.: `DIAGNOSTIC_FULL`, `SUPPLIER_MONITORING`, `REPORT_FULL`)

### `product_features`
- Mapeia o que cada produto libera
- Campos: `product_id`, `feature_flag_id`, `limit_value` (nullable)

### `organization_entitlements`
- Snapshot operacional dos acessos atualmente liberados para a organizacao
- Campos: `id`, `organization_id`, `feature_flag_id`, `source_type` (`SUBSCRIPTION`, `ORDER`, `MANUAL`), `source_id`, `status`, `starts_at`, `ends_at`

Motivo:
- Evita acoplar autorizacao diretamente ao papel `COMPANY`
- Permite ativar e remover acessos quando assinatura inicia, expira ou e cancelada
- Resolve o caso de downgrade sem apagar historico de papel

## 3.3 Contratação, billing e pagamento

### `subscriptions`
- Assinaturas ativas/histórico
- Campos: `id`, `organization_id`, `plan_id`, `status`, `starts_at`, `ends_at`, `renewal_at`, `cancelled_at`

### `orders`
- Pedido comercial unificado (assinatura, serviço avulso, convite)
- Campos: `id`, `organization_id`, `order_type` (`SUBSCRIPTION`, `ONE_TIME`, `INVITE_PACK`), `status`, `total_cents`, `currency`

### `order_items`
- Itens do pedido
- Campos: `id`, `order_id`, `product_id`, `quantity`, `unit_price_cents`, `metadata`

### `payments`
- Controle de pagamento (gateway virá depois)
- Campos: `id`, `order_id`, `provider` (nullable), `provider_reference` (nullable), `method` (`PIX`, `CARD`, `BOLETO`, `MANUAL`), `status`, `amount_cents`, `paid_at`

### `invoices` (opcional já deixar previsto)
- Fiscal/documental
- Campos: `id`, `order_id`, `number`, `status`, `issued_at`, `due_at`

## 3.4 Cadeia de fornecedores

### `supplier_links`
- Relação entre empresa contratante e fornecedor convidado
- Campos: `id`, `buyer_organization_id`, `supplier_organization_id`, `status` (`INVITED`, `IN_PROGRESS`, `COMPLETED`, `EXPIRED`), `invited_at`
- Constraint: unique (`buyer_organization_id`, `supplier_organization_id`)

### `invites`
- Convites emitidos
- Campos: `id`, `buyer_organization_id`, `supplier_email`, `token`, `status`, `expires_at`, `accepted_at`

### `invite_wallets`
- Saldo de convites por empresa
- Campos: `id`, `organization_id` unique, `balance`

### `invite_transactions`
- Extrato de convites (compra, consumo, estorno)
- Campos: `id`, `organization_id`, `type`, `amount`, `reference_type`, `reference_id`, `created_at`

## 3.5 Diagnóstico ESG

### `diagnostics`
- Execução de diagnóstico por organização

### `diagnostic_responses`
- Respostas

### `evidences`
- Evidências anexadas

### `diagnostic_scores`
- Scores consolidados

### `diagnostic_reports`
- Relatórios gerados

(essas já estão bem detalhadas em `arquitetura_e_modelagem.md`; manteremos, ajustando chaves para `organization_id`.)

## 4) Relações principais (cardinalidade)

- `users` N:N `organizations` via `organization_users`
- `organizations` 1:N `organization_roles`
- `organizations` 1:N `organization_entitlements`
- `organizations` 1:N `orders`
- `orders` 1:N `order_items`
- `orders` 1:N `payments`
- `products` 1:1 `plans` (quando assinatura) ou 1:1 `services` (quando avulso)
- `products` N:N `feature_flags` via `product_features`
- `organizations` 1:N `subscriptions`
- `organizations (buyer)` N:N `organizations (supplier)` via `supplier_links`
- `organizations` 1:N `diagnostics`

## 5) Regras de acesso (resumo)

- Acesso de área `/app` depende de:
  - usuário vinculado em `organization_users`
  - organização com contexto permitido para a rota acessada
  - feature liberada por assinatura/serviço em `organization_entitlements`, quando a funcionalidade for paga
- Organização apenas `SUPPLIER`:
  - acessa fluxo convidado e diagnóstico restrito
  - sem recursos premium até upgrade
- Upgrade de fornecedor para empresa:
  - cria/ativa papel `COMPANY` em `organization_roles`
  - cria contrato/pedido/assinatura conforme compra
  - ativa `organization_entitlements` conforme o produto contratado
- Downgrade por cancelamento ou inadimplencia:
  - encerra `subscriptions` e `organization_entitlements`
  - preserva `organization`, `users`, historico de `orders/payments` e vinculos em `supplier_links`
  - se houver papel `SUPPLIER`, a organizacao continua acessando apenas a experiencia free de fornecedor

Exemplo do caso que voce levantou:
- Fornecedor convidado entra com papel `SUPPLIER`
- Depois contrata um plano e ganha papel `COMPANY` + entitlements pagos
- Se cancelar ou parar de pagar, os entitlements expiram
- O acesso premium sai, mas o papel `SUPPLIER` e os vinculos com empresas compradoras continuam

## 6) Boas práticas para implementação

- Separar domínios no backend: `identity`, `catalog`, `billing`, `supplier-network`, `diagnostics`.
- Usar adapters desde já para pagamentos:
  - `PaymentProviderAdapter` com implementação inicial `ManualPaymentAdapter`.
  - depois plugamos gateway real (PIX/cartão/boleto) sem quebrar domínio.
- Persistir valores monetários em `*_cents` + `currency`.
- Idempotência em webhooks/pagamentos (`provider_reference` unique quando aplicável).
- Auditoria: `created_at`, `updated_at`, `deleted_at`/`archived_at` nas tabelas críticas.

## 7) Ordem sugerida de evolução

1. Fechar `identity` (`users`, `organizations`, `organization_users`, `organization_roles`).
2. Fechar `catalog` (`products`, `plans`, `services`, `feature_flags`).
3. Fechar `orders/payments` (sem gateway real ainda).
4. Fechar `supplier-network` (`invites`, `supplier_links`, `invite_wallets`).
5. Integrar `diagnostics` ao modelo novo.
6. Aplicar controle de autorização por feature no backend.

## 8) Resumo executivo

- O cadastro será único por organização (sem duplicar empresa/fornecedor).
- Papel e acesso nao sao a mesma coisa.
- `organization_roles` define quem a organização pode ser no negocio.
- `organization_entitlements` define o que ela pode usar naquele momento.
- Assinaturas anuais e serviços pontuais coexistem no mesmo fluxo comercial via `orders` + `payments`.
- O caso `fornecedor -> empresa pagante -> fornecedor free` fica coberto sem perder historico nem quebrar relacoes da cadeia.
- A estrutura já nasce pronta para gateway de pagamento e expansão sem retrabalho estrutural.
