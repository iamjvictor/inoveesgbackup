# 🔍 Análise do Sistema de Cache & Consultas — InoveESG Backend

## Estado Atual: O Que Existe

### ✅ O Que Está Bem

O projeto já possui uma **base sólida e bem arquitetada**:

1. **`CacheProvider` interface** com adapter pattern pronto para Redis — design correto.
2. **`InMemoryCacheProvider`** com TTL nativo via `expiresAt` — funcional para dev/single-instance.
3. **Cache no middleware de auth** (`auth:token:<jwt>`) com 5 min TTL evita roundtrips ao Supabase.
4. **`findOrganizationIdBySupabaseUserId`** com TTL de 1h — dado estático, TTL correto.
5. **Invalidação explícita** de cache após mutações críticas (pagamento, respostas, etc.).
6. **`Promise.all`** no `inviteRepository.getStats` para paralelizar queries independentes.
7. **`warmPrismaPool`** no startup evita cold-start na primeira requisição.

---

## ❌ Problemas Identificados

### Problema 1 — `listInvites` sem cache (causa dos lentos 3–4s)

```
[inviteRepo.listInvites] org=f88b63c2... count=1 → 4376ms
[HTTP] ⚠ SLOW GET /api/invite → 304 (4377ms)
```

O método `listInvites` executa **2 queries pesadas a cada chamada** e não tem cache:
- `prisma.invite.findMany` com joins (supplierOrganization, requestedDiagnostics, score)
- `prisma.supplierLink.findMany` com mais joins

E pior: **é chamado dentro do `getStats`**, então toda chamada a `/api/invite/stats` também dispara o `listInvites` internamente.

```
getStats → listInvites (2 queries pesadas)
         → 3 queries paralelas (aggregate, wallet, diagnostics)
Total: 5 queries por chamada a /stats
```

### Problema 2 — `auth:profile` com TTL muito curto (30s)

```ts
await cache.set(cacheKey, user, 30 * 1000); // 30 seconds TTL
```

`findBySupabaseUserId` retorna um objeto enorme com organizações, roles, subscriptions, orders, wallet, diagnostics — uma das queries mais pesadas do sistema. Com apenas **30 segundos de TTL**, ele recacha constantemente em usuários ativos.

O log confirma:
```
[auth.getMe] Fetching profile from database → 9019ms
[HTTP] ⚠ SLOW GET /api/auth/me → 304 (9019ms)
```

### Problema 3 — Supabase token validation ainda aparece lento (~500ms–1s)

```
[authMiddleware] Supabase token validation → 1207ms
[authMiddleware] Supabase token validation → 923ms
```

O cache do token funciona, mas tokens novos (pós-refresh do JWT) pagam o roundtrip toda vez. O problema: **o frontend faz refresh do token com frequência**, gerando novos JWTs que invalidam o cache existente.

### Problema 4 — `saveResponses` busca o perfil completo desnecessariamente

```ts
// diagnosticService.ts linha 195
const user = await authRepository.findBySupabaseUserId(supabaseUserId);
const organization = user?.organizationUsers?.[0]?.organization;
```

Aqui só se precisa do `organizationId`. Mas o código usa `findBySupabaseUserId` — a query pesada com todos os joins — em vez de `findOrganizationIdBySupabaseUserId` — a query leve.

### Problema 5 — `InMemoryCacheProvider` sem limpeza periódica (memory leak)

```ts
async get<T>(key: string): Promise<T | undefined> {
  const entry = this.store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    this.store.delete(key); // limpa APENAS no get
    return undefined;
  }
  return entry.value;
}
```

Entradas expiradas só são limpas quando consultadas. Se uma chave nunca for acessada após expirar, ela permanece na memória indefinidamente.

### Problema 6 — Sem cache no `listInvites` individual

`GET /api/invite` (listagem para a tela de fornecedores) executa as mesmas 2 queries pesadas sem cache algum.

---

## 🎯 Recomendações de Melhoria

### Fix 1 — Cache para `listInvites` (impacto ALTO)

```ts
// inviteService.ts
async listInvites(supabaseUserId: string) {
  const organizationId = await resolveOrganizationId(supabaseUserId);
  
  const cacheKey = `invite:list:${organizationId}`;
  const cached = await cache.get<Awaited<ReturnType<InviteRepository["listInvites"]>>>(cacheKey);
  if (cached) return cached;

  const list = await inviteRepository.listInvites(organizationId);
  await cache.set(cacheKey, list, 30_000); // 30s TTL
  return list;
}
```

E invalidar junto com `invite:stats` sempre que houver mutações:

```ts
private async invalidateInviteCache(organizationId: string) {
  await Promise.all([
    cache.delete(`invite:stats:${organizationId}`),
    cache.delete(`invite:list:${organizationId}`),
  ]);
}
```

### Fix 2 — Aumentar TTL do `auth:profile` (impacto ALTO)

Dados de perfil (roles, planos, wallet) mudam raramente. 30s é muito conservador:

```ts
// authRepository.ts
await cache.set(cacheKey, user, 5 * 60 * 1000); // 5 minutos em vez de 30s
```

Continua com invalidação explícita após mutações (já existe nos lugares certos).

### Fix 3 — Usar `findOrganizationIdBySupabaseUserId` onde só precisa do orgId (impacto MÉDIO)

Em `saveResponses` e `createCheckoutSession`:

```ts
// Antes (query pesada):
const user = await authRepository.findBySupabaseUserId(supabaseUserId);
const organization = user?.organizationUsers?.[0]?.organization;
if (!organization) throw new Error("...");

// Depois (query leve, já cacheada com 1h TTL):
const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(supabaseUserId);
if (!organizationId) throw new Error("...");
```

### Fix 4 — Limpeza periódica do `InMemoryCacheProvider` (impacto BAIXO/MÉDIO a longo prazo)

```ts
class InMemoryCacheProvider implements CacheProvider {
  private store = new Map<string, CacheEntry<any>>();
  private sweepInterval: NodeJS.Timeout;

  constructor() {
    // Varre entradas expiradas a cada 5 minutos
    this.sweepInterval = setInterval(() => this.sweep(), 5 * 60 * 1000);
    this.sweepInterval.unref(); // não mantém o processo vivo
  }

  private sweep() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
  
  // ... resto igual
}
```

### Fix 5 — Separar `getStats` de `listInvites` internamente (refactor leve)

Atualmente `getStats` chama `listInvites` para calcular `registeredCount`. Em vez disso, pode usar uma query agregada direta:

```ts
// Em vez de carregar todos os invites para contar:
const registeredCount = invitesList.filter(
  (i) => i.status === "ACCEPTED" || i.supplierOrganizationId !== null
).length;

// Query direta (mais eficiente):
const registeredCount = await prisma.invite.count({
  where: {
    buyerOrganizationId: organizationId,
    OR: [
      { status: "ACCEPTED" },
      { supplierOrganizationId: { not: null } },
    ],
  },
});
```

Isso permite cachear `stats` e `list` independentemente com TTLs diferentes.

---

## 🗺️ Visão Geral: Cache Keys do Sistema

| Chave | TTL Atual | TTL Recomendado | Invalidação |
|---|---|---|---|
| `auth:token:<jwt>` | 5 min | 5 min ✅ | Automático (TTL) |
| `auth:org-id:<uid>` | 1h | 1h ✅ | Criação de org |
| `auth:profile:<uid>` | **30s** | **5 min** | Pós-mutações de plano/diagnóstico |
| `diagnostic:current:<orgId>` | 60s | 60s ✅ | Pós-pagamento/respostas |
| `invite:stats:<orgId>` | 30s | 30s ✅ | Pós-criação/pagamento de convite |
| `invite:list:<orgId>` | ❌ sem cache | **30s** | Pós-criação/aceitação de convite |

---

## 🚀 Caminho para Redis (quando necessário)

A interface `CacheProvider` já está perfeita. Para migrar:

```ts
// src/lib/cache.ts
import { createClient } from "redis";

class RedisCacheProvider implements CacheProvider {
  private client = createClient({ url: process.env.REDIS_URL });
  
  async get<T>(key: string): Promise<T | undefined> {
    const raw = await this.client.get(key);
    return raw ? JSON.parse(raw) : undefined;
  }
  
  async set<T>(key: string, value: T, ttlMs = 5 * 60 * 1000): Promise<void> {
    await this.client.setEx(key, Math.floor(ttlMs / 1000), JSON.stringify(value));
  }
  
  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
  
  async clear(): Promise<void> {
    await this.client.flushDb();
  }
}

// Troca com 1 linha:
export const cache: CacheProvider = process.env.REDIS_URL
  ? new RedisCacheProvider()
  : new InMemoryCacheProvider();
```

Isso já está arquitetado para ser uma troca de **1 linha** sem alterar nenhum service.

---

## 📊 Prioridade de Implementação

| Prioridade | Fix | Impacto esperado |
|---|---|---|
| 🔴 Alta | Cache `listInvites` + invalidação unificada | Elimina os lentos de 3–4s no `/api/invite` |
| 🔴 Alta | `auth:profile` TTL 30s → 5min | Reduz 70%+ dos hits ao banco em `/api/auth/me` |
| 🟡 Média | Substituir `findBySupabaseUserId` por `findOrganizationIdBySupabaseUserId` onde só precisa do orgId | Queries mais leves em saveResponses/checkout |
| 🟢 Baixa | Sweep periódico do InMemoryCache | Previne memory leak em produção de longo prazo |
| 🟢 Baixa | Separar aggregate de `getStats` de `listInvites` | Independência de cache entre stats e listagem |
