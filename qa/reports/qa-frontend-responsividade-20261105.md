# QA de responsividade do frontend — 2026-11-05

## Resultado

Auditoria autenticada das áreas da empresa **bloqueada por falta de sessão e de canal seguro para inserir credenciais**. A conta sintética `qa.bioimpact.1793822817256@example.com` existe nos relatórios anteriores. Embora a coordenação tenha autorizado seu uso, este executor não tem browser CUA aberto/disponível; o Playwright local exigiria passar a senha por script, argumento ou stdin, o que não atende ao requisito de input seguro. Não expus nem inseri a credencial, não criei conta e não restabeleci sessão.

Foi possível avaliar a página pública com o modal de autenticação em desktop, tablet e mobile. As três renderizações retornaram HTTP 200, sem erros de JavaScript e sem overflow horizontal medido.

## Matriz executada

| Área | Desktop 1365×768 | Tablet 768×1024 | Mobile 390×844 | Estado |
|---|---|---|---|---|
| Página pública + modal de autenticação (`/?auth=true`) | PASS | PASS | PASS | HTTP 200; sem erro JS; largura do documento não excede viewport |
| Painel autenticado | — | — | — | Bloqueado: sessão não disponível |
| Diagnóstico e cartões | — | — | — | Bloqueado: exige autenticação; POST automático de `/api/diagnostic/start` documentado em rodadas anteriores |
| Evidências / Resultados | — | — | — | Bloqueado: exige autenticação e há risco conhecido de navegação iniciar diagnóstico |
| Meus Serviços | — | — | — | Bloqueado: sessão não disponível |

## Achados

- **Nenhum novo defeito confirmado na página pública** nos três tamanhos testados. Métricas: largura do documento 1350/1365, 753/768 e 375/390 (desktop/tablet/mobile).
- **Bloqueio de cobertura autenticada:** não foi possível revalidar nesta rodada o corte dos cartões do diagnóstico em tablet nem o carregamento de Painel/Meus Serviços. Permanecem válidas as evidências anteriores, que registraram corte em 768×1024.
- **Risco funcional pré-existente:** abrir `/app/diagnostico` pode disparar POST sem ação explícita. Não acessei essa rota para evitar mutação de dados.

## Integridade e método

- Ambiente acessado: `http://localhost:3000`; respostas locais de saúde observadas anteriormente em `localhost:4000`.
- O endereço do backend responde, mas a configuração disponível aponta para Supabase remoto. A identidade/isolamento do banco não foi estabelecida nesta rodada; portanto, não enviei login nem chamadas autenticadas.
- Sem checkout, pagamento, webhook, upload, cadastro ou alteração de dados.
- Sem segredos, cookies ou dados pessoais incluídos nas evidências.

## Evidências

- `qa/artifacts/qa-frontend-responsividade-20261105/desktop-public-auth.png`
- `qa/artifacts/qa-frontend-responsividade-20261105/tablet-public-auth.png`
- `qa/artifacts/qa-frontend-responsividade-20261105/mobile-public-auth.png`
- `qa/artifacts/qa-frontend-responsividade-20261105/summary.json`

## Próximo passo para fechar a cobertura

Disponibilizar uma sessão autenticada da conta sintética em browser CUA acessível ao executor, ou habilitar canal seguro de entrada de segredo. Em seguida, repetir as áreas autenticadas bloqueando POSTs mutáveis, em especial `/api/diagnostic/start`.

## Retomada autenticada e análise de intermitência do backend

Na retomada de 05/11, usei a conta sintética existente via entrada oculta de terminal; a senha não foi escrita em arquivo, linha de comando ou evidência. O Playwright permitiu somente `POST /api/auth/login` e métodos GET/HEAD/OPTIONS. Outros métodos em `/api/**` responderiam 403 pelo guard. Nenhuma escrita bloqueada foi observada.

### Execução e respostas

Desktop e mobile autenticaram e navegaram por Painel, Meus Serviços, Diagnóstico, Evidências e Resultados. Em tablet o login não avançou (nenhuma chamada de API), portanto as rotas autenticadas desse viewport ficaram bloqueadas. Não houve erros de JavaScript. `document.scrollWidth` ficou abaixo do viewport em desktop e mobile.

Na navegação autenticada foram observadas **80 respostas API, todas HTTP 200** nos viewports que autenticaram. Não reproduzi 500 nem 503. Leituras repetidas, serializadas com intervalo de ~900 ms, a `/api/auth/me` e `/api/diagnostic/current` também retornaram 200. Algumas chamadas de perfil foram lentas: `GET /api/auth/me` atingiu 8.178 ms no desktop e 7.216 ms no mobile; `GET /api/auth/me/access` atingiu 8.056 ms. As chamadas correntes de diagnóstico ficaram aproximadamente entre 10 e 1.339 ms. Não houve carga concorrente ou contínua.

Capturas e métricas: `qa/artifacts/qa-frontend-responsividade-20261105/authenticated-readonly-summary.json` e imagens `desktop-*.png` / `mobile-*.png`. O diagnóstico ficou em loading em algumas capturas breves, mas depois o endpoint respondeu 200. O guard observou zero métodos de escrita bloqueados; a tela não emitiu o POST `/api/diagnostic/start` nesta execução.

### Correlação com a rodada que apresentou erro

A evidência anterior `qa/artifacts/qa-bioimpacto-20261104/report.md` registra:

- `2026-11-05 00:49:37.098Z`: `GET /api/auth/me` → **500 em 10.059 ms**; o erro sanitizado aponta para a chamada Prisma `adminUser.findFirst`.
- `2026-11-05 00:49:47.216Z` e `00:49:47.243Z`: `GET /api/diagnostic/current` → **503 em 10.025 ms** e **10.016 ms**.
- Cerca de 40 s depois, GETs seguros voltaram a 200 sem relogin/retry explícito: `/api/auth/me` em 413 ms; `/api/diagnostic/current` em 2.053 ms; `/api/diagnostic/bioimpacto/history` em 2.857 ms.

Isso confirma falha transitória com latência próxima de 10 s e recuperação subsequente. Não foi possível atribuir causa raiz apenas às respostas. O log do backend da rodada anterior não continha query completa ou código Prisma; nesta retomada o stdout/stderr do backend atual está ligado a `/dev/pts/5`, cujo buffer não estava disponível para leitura sem interferir no terminal compartilhado.

### Código Prisma e configuração

`AuthService.resolveSessionUser` executa em paralelo `findBySupabaseUserId` e `findAdminUserBySupabaseUserId`. Esta última chama `prisma.adminUser.findFirst({ where: { user: { supabaseUserId } }, include: { user: true } })`. `User.supabaseUserId` é `@unique`, então há índice no lado da relação; a consulta busca no máximo um vínculo administrativo e inclui o registro de usuário. A falha reportada em `adminUser.findFirst` pode indicar erro de conexão/timeout no pool/servidor, indisponibilidade transitória ou erro específico da consulta; a evidência não discrimina essas opções.

`DiagnosticRepository.findCurrentByOrganizationId` usa `findFirst` por `organizationId` e status ACTIVE/DRAFT/COMPLETED, ordena por `createdAt desc` e seleciona relações/contagens de respostas, score, organization.evidenceScores e evidências com última revisão. Há índice composto `diagnostics(organizationId, status)`, mas a ordenação adicional e carregamento das relações podem elevar custo em volume. O endpoint devolveu 503 perto do limite de 10 s na rodada anterior e rápido na retomada, consistente com lentidão/intermitência do banco ou pool, sem prova isolada de qual.

O `.env` aponta `DATABASE_URL` para host Supabase pooler `aws-1-us-west-1.pooler.supabase.com:5432`, banco `postgres`; `SUPABASE_URL` e frontend apontam para o mesmo projeto Supabase identificado pelo domínio `hxrntjfaptvttjqprjxr.supabase.co`. Nenhum valor de credencial foi consultado ou registrado. A conexão é remota, não localhost. A existência da conta sintética e o histórico de QA indicam uso de dados sintéticos, mas este exame não prova que todo o projeto remoto seja isolado de produção.

### Conclusão e lacunas

- **Intermitência anterior reproduzida?** Não. No reteste houve apenas 200, com picos de latência de 7–8 s em endpoints de perfil.
- **Evidência de ocorrência anterior:** Prisma `adminUser.findFirst` em `auth/me`, 500/10.059 ms; `diagnostic/current`, dois 503 em ~10 s; recuperação sem retry explícito.
- **Hipótese mais sustentada:** dependência remota/pool do Postgres ficou lenta ou indisponível por cerca de 10 s e recuperou, causando timeout/erro no caminho de perfil e diagnóstico. É hipótese, não causa provada.
- **Limites:** não houve acesso aos logs históricos completos do processo, à mensagem Prisma completa, a métricas do pool/Supabase ou ao `EXPLAIN ANALYZE`; tablet autenticado não foi testado porque login não saiu da tela, e Resultados/Meus Serviços foram capturados sem esperar estabilização longa em todos os viewports.
