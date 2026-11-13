# QA exploratório — Diagnóstico Estratégico ESG

- **Rodada:** `qa-estrategico-20261104`
- **Janela:** 04/11/2026 21:20–21:34 (America/Sao_Paulo)
- **Status:** Parcial; serviços disponíveis; compra fora do escopo e não validada nesta rodada.
- **Alvos:** `http://localhost:3000` e `http://localhost:4000/api`.
- **Ferramenta:** Playwright 1.64.1 com Chromium headless.
- **Ambiente:** front e API locais responderam; `/api/health` respondeu 200. Configuração do backend indica DATABASE_URL e SUPABASE_URL remotos. A flag sandbox do Mercado Pago estava ligada, mas a chave pública não tinha prefixo `TEST-`; checkout não foi acessado.
- **Conta:** conta sintética `qa.estrategico.***@example.com`; login confirmado por POST `/api/auth/login` 200 e leituras autenticadas 200. Senha, cookies e tokens não foram registrados.

## Resultados

| Caso | Estado | Resultado |
|---|---|---|
| QA-001 — Login | PASS | Autenticação aceita; `/api/auth/me` e `/api/auth/me/access` responderam 200. |
| QA-002 — Painel | PASS | `/app` abriu autenticado e exibiu dados da conta e serviços. Captura `dashboard-desktop.png`. |
| QA-003 — Meus Serviços | PASS | `/app/meus-servicos` mostrou 1 serviço ativo: Diagnóstico Estratégico ESG, adquirido em 04/11/2026, com ação “Acessar”. A compra não foi reexecutada nem verificada no provedor. Captura `app-meus-servicos-desktop.png`. |
| QA-004 — Diagnóstico | PARTIAL / BUG | A página mostrou 0 de 75 respostas, 0%, com quatro eixos pendentes. Sem clicar em “Iniciar Prova”, ocorreram dois POST `/api/diagnostic/start`, ambos 200. Não foram respondidas perguntas. |
| QA-005 — Evidências | BLOCKED | A navegação direta redirecionou para `/app/diagnostico`. O guard interceptou duas novas tentativas POST `/api/diagnostic/start`; ambas foram abortadas antes da API. A tela exibiu erro de carregamento após o bloqueio. |
| QA-006 — Resultados | BLOCKED | Não acessado: o código redireciona para `/app/diagnostico` quando não há diagnóstico concluído, rota que pode iniciar o POST observado. |
| QA-007 — Serviços responsivos autenticados | BLOCKED | Há captura autenticada desktop. Tentativas posteriores de reautenticação não produziram requisição de login e ficaram no modal; capturas com modal foram descartadas. Meus Serviços não foi confirmado em tablet/mobile. |
| QA-008 — Responsividade do diagnóstico | FAIL em tablet; PASS parcial em mobile/desktop | Em 1365×768 os cartões cabem. Em 768×1024 o painel lateral reduz a área principal, mas os cartões permanecem em duas colunas e ficam cortados à direita. Em 390×844 os cartões empilham e não há overflow horizontal do documento. |
| QA-009 — Teclado/foco | PARTIAL | Tab percorreu navegação, links e ações do diagnóstico; não foi feita auditoria completa de acessibilidade. |

## Achados reproduzíveis

### BUG-001 — Montagem da página do diagnóstico envia POST e pode criar rascunho

- **Severidade:** Alta (alteração de estado sem ação explícita; impacto final não confirmado).
- **Classificação:** Bug de produto.
- **Passos:** autenticar → abrir `/app/diagnostico` sem clicar em qualquer botão de prova.
- **Esperado:** consultar e renderizar estado sem mutação até ação explícita.
- **Obtido:** duas chamadas POST `/api/diagnostic/start`, ambas 200. Em navegação posterior, um guard interceptou duas chamadas equivalentes.
- **Evidência:** `network-evidence.json`, `app-diagnostico-desktop.png`, `tablet-final.png`, `mobile-final.png`.
- **Hipótese técnica:** `DiagnosticOverviewView` chama `diagnosticService.startDiagnostic()` em `useEffect`; o endpoint pode criar draft se não houver diagnóstico aberto. Estado criado/reutilizado não foi confirmado e não houve rollback.
- **Próximo passo:** confirmar o estado da conta no banco e substituir o carregamento por leitura não mutável/idempotente.

### BUG-002 — Cartões do diagnóstico ficam cortados em tablet

- **Severidade:** Média.
- **Classificação:** Bug responsivo de produto.
- **Passos:** autenticar → abrir Diagnóstico → definir viewport 768×1024.
- **Esperado:** cartões, status e ações cabem na área disponível após a navegação lateral.
- **Obtido:** a grade de duas colunas excede a largura interna e a segunda coluna fica recortada. `document.scrollWidth` não mostra overflow horizontal, embora o conteúdo interno esteja cortado.
- **Evidência:** `tablet-final.png`.
- **Hipótese técnica:** o breakpoint mantém duas colunas com sidebar aberta apesar da largura interna insuficiente.

## Bloqueios, limites e segurança

- Nenhum checkout, compra, webhook, upload, resposta de diagnóstico, exclusão ou alteração de perfil foi acionado intencionalmente.
- **Incidente controlado:** o primeiro acesso ao diagnóstico iniciou dois POSTs inesperados. A exploração foi interrompida e o orquestrador avisado. Capturas posteriores usaram guard para bloquear mutações, exceto login.
- Evidências foi redirecionada; Resultados não foi aberta. Acesso ao conteúdo de evidências e resultados permanece não validado.
- A tentativa final de reautenticação para capturar Meus Serviços em tablet/mobile não iniciou sessão; capturas inválidas foram descartadas.
- Não houve carga. Nenhum segredo foi salvo nos artefatos.

## Próximos testes

1. Verificar no banco o efeito dos dois POSTs já observados antes de retomar a conta sintética.
2. Tornar seguro o carregamento do diagnóstico e repetir Evidências/Resultados por navegação somente leitura.
3. Ajustar a grade no breakpoint tablet e repetir em 768×1024.
4. Capturar Meus Serviços em tablet e mobile com sessão já autenticada.
5. Manter checkout bloqueado enquanto as credenciais não forem classificadas `TEST-`.

## Evidências

Capturas e resumo de rede sanitizado: `qa/artifacts/qa-estrategico-20261104/`.

## Continuação 1 — navegação segura em Painel e Meus Serviços

- **Janela:** 04/11/2026 21:38–21:39 (America/Sao_Paulo); limite solicitado: 15 min.
- **Status:** BLOCKED antes de abrir páginas autenticadas.
- **Sessão:** browser Playwright isolado; não havia contexto/cookies autenticados da rodada anterior disponíveis.
- **Tentativa:** um login na conta sintética, permitindo apenas o POST `/api/auth/login`; o browser não emitiu chamada API (`loginStatus` ausente, sem `/api/auth/me`) e terminou em `/` sem sessão autenticada.
- **Proteção:** guard permaneceu ativo e registrou zero mutações não relacionadas a login. Nenhuma rota protegida foi aberta; nenhuma captura nova foi gerada.
- **Casos não executados:** reload/navegação repetida de Painel e Meus Serviços em desktop/tablet/mobile.
- **Próximo passo:** retomar somente quando houver contexto autenticado persistente disponível; não repetir login nesta continuação.
