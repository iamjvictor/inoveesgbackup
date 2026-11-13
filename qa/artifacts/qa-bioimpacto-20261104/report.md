# QA exploratório — Bioimpacto e responsividade

- **Round:** `qa-bioimpacto-20261104`
- **Início:** 2026-11-05 00:19 UTC (2026-11-04 21:19 BRT)
- **Fim:** 2026-11-05 00:52 UTC (2026-11-04 21:52 BRT), após continuação serial
- **Ambiente:** frontend `localhost:3000` HTTP 200; API `localhost:4000/api/health` HTTP 200 (`ok:true`); Chromium via Playwright existente.
- **Conta:** sintética, identificador mascarado `qa.b***@example.com`; perfil exibido como “QA Bioimpacto Sintético / QA Bioimpacto”. Senha, cookie e token não foram registrados.
- **Integridade:** sem checkout, webhook, upload ou interação em botões que aceitam/rejeitam proposta. Após detectar POST automático em Diagnóstico, não voltei à rota; requests de escrita nas verificações posteriores foram bloqueadas preventivamente (exceto POST de login autorizado).

## Cenários e estado

| Cenário | Estado | Resultado |
|---|---|---|
| Preflight e login | PASS | Serviços responderam HTTP 200; login pela UI e endpoints de perfil/acesso HTTP 200. |
| Diagnóstico | FAIL — escrita inesperada | A página renderizou dados do diagnóstico Bioimpacto em tablet e mobile. Em navegação sem clique, UI fez 4 POSTs `/api/diagnostic/start`, todos HTTP 200. Não registrei body/IDs nem consultei o banco; número de inserts é desconhecido. Não repeti após detectar. |
| Evidências | PASS parcial | Conteúdo da página carregou nos viewports 1365×768, 768×1024 e 390×844. Sem overflow horizontal medido (`scrollWidth` menor que a largura do viewport nos três). Não fiz upload nem interagi com controles de envio. |
| Resultados | BLOCKED | A tela permaneceu no spinner nos três tamanhos durante as capturas. Após o POST inesperado, evitei novas tentativas porque um estado de diagnóstico incompleto pode redirecionar a rota para Diagnóstico e repetir a escrita automática. |
| Painel | PASS parcial | Tablet e mobile exibiram o painel; desktop ainda estava no carregamento na captura. Sem overflow horizontal nos três tamanhos. |
| Meus Serviços | PASS parcial / carregamento de dados inconclusivo | Rota aberta em navegador isolado; painel da página exibido em desktop e mobile, tablet capturado no loading do perfil. O bloco de serviços ainda mostrava “Buscando seus serviços contratados...” após 2,5 s. Sem overflow horizontal medido nos três viewports. Não cliquei em aquisição/proposta. |
| Teclado/foco | PASS parcial | Tab moveu o foco para link “Área da Empresa”; estilo computado `outline:auto`, largura 1px. |
| Console | PASS | Nenhum console error ou page error registrado nas verificações com tráfego normal. |

## Bug reproduzível — B-001

- **Severidade:** média; bug de produto com efeito persistente possível.
- **Resumo:** visitar `/app/diagnostico` dispara automaticamente `POST /api/diagnostic/start` antes de qualquer interação.
- **Reprodução observada:** login sintético; abrir `/app/diagnostico`; não clicar em “Iniciar Diagnóstico”. O navegador registrou quatro POSTs HTTP 200 em cargas/visitas de viewport. A evidência sanitizada está em `retest-summary.json`; conteúdo Bioimpacto aparece em `diagnostico-tablet-retest.png` e `diagnostico-mobile-retest.png`.
- **Causa no frontend:** `DiagnosticOverviewView` chama `diagnosticService.startDiagnostic()` dentro de `useEffect` (`loadQuestions`), inclusive para diagnóstico já concluído; o efeito não exige ação do usuário.
- **Efeito possível no backend:** `DiagnosticService.startDiagnostic` procura diagnóstico aberto (`DRAFT`/`ACTIVE`); se não existir, pode chamar `createDraftDiagnostic`, que insere um registro, e invalida o cache. O schema não define unicidade por organização/status e o fluxo de busca/criação não é atômico, então chamadas concorrentes podem criar drafts duplicados. Os requests observados responderam 200, mas a rodada não consultou o banco e não afirma quantos inserts ocorreram.
- **Ação de QA:** interrompi verificações de Diagnóstico após detectar a escrita inesperada. Nenhuma tentativa de reversão foi feita.

## Causa do loading inicial e limitações

A primeira rodada serializou todas as requests API com intervalo mínimo de 1 s. Isso atrasou as chamadas paralelas de perfil/acesso; as capturas foram feitas antes do fim do loading. Em navegação posterior sem throttling, o diagnóstico e Evidências renderizaram, confirmando que o loading inicial não demonstra, por si só, falha de endpoint.

A tela Resultados continuou no spinner e ficou bloqueada por risco de redirecionamento a Diagnóstico após o novo estado. “Meus Serviços” foi verificada somente após leitura do código: o mount remove `inoveesg_purchased_services_${companyId}` do `localStorage`, uma chave de cache local; não apaga pedidos/dados persistidos no servidor. A verificação usou navegador isolado com `localStorage` inicialmente vazio, então não removeu cache preexistente do usuário. O endpoint de perfil foi atualizado via GET; nenhuma escrita fora do login foi observada.

## Responsividade e acessibilidade

- **Evidências:** screenshots em desktop, tablet e mobile; sem overflow horizontal observado e sem erros de console.
- **Painel:** tablet/mobile carregados; desktop capturado durante loading. A largura do documento não excedeu o viewport nas três medidas.
- **Diagnóstico:** tablet/mobile carregados, mas a validação foi encerrada por escrita inesperada; desktop ficou em loading na captura. Não recomendo repetir a navegação até corrigir o POST automático.
- **Resultados:** não validado; spinner visível e reentrada segura não estabelecida.
- **Meus Serviços:** sem overflow horizontal; conteúdo de serviços ainda buscava dados ao fim da janela de espera.
- Foco via Tab visível com outline nativo de 1px. A rodada não clicou controles de ação.

## Próximos passos

1. Corrigir Diagnóstico para que carregar a tela e as perguntas use uma operação sem escrita; iniciar/criar draft somente após ação explícita do usuário.
2. Tornar o backend idempotente e proteger criação concorrente de drafts (transação/constraint apropriada), depois verificar a conta sintética por fluxo de recuperação aprovado antes de reexecutar.
3. Reexecutar Resultados após estabelecer estado consistente, e aguardar confirmação visual de conteúdo em vez de capturar durante loading.
4. Aguardar conclusão dos dados em Painel/Meus Serviços antes de avaliar o layout de conteúdo final.

Os relatórios e evidências desta rodada estão exclusivamente em `qa/artifacts/qa-bioimpacto-20261104/`.

## Continuação exploratória serial

- **Duração observada:** cerca de 13 minutos (12 ciclos registrados entre 00:39:21Z e 00:51:26Z); a navegação foi encerrada após a falha e orientação do orquestrador.
- **Execução:** uma rota por vez em uma aba/contexto isolado, alternando Painel, Evidências e Meus Serviços com viewports desktop 1365×768, tablet 768×1024 e mobile 390×844. Os cinco primeiros ciclos foram capturados menos de 1 s após DOMContentLoaded e mostram loading; nos ciclos 6–12 esperei o marcador de conteúdo até 12 s. Não houve navegação para Diagnóstico ou Resultados nessa continuação.
- **Tráfego:** 87 responses da API da aplicação: 84 HTTP 200, um HTTP 500 e dois HTTP 503. Nenhuma escrita não relacionada a login foi observada ou permitida; nenhum erro de transporte nem erro JavaScript de página.
- **Acessibilidade/viewport:** nenhum overflow horizontal nos 12 registros. Evidências renderizou nos viewports desktop/tablet/mobile. Painel e Meus Serviços exibiram conteúdo parcial; Meus Serviços manteve “Buscando seus serviços contratados...” em capturas. A captura tablet de Meus Serviços mostra título e CTA espremidos em colunas estreitas, sem transbordamento horizontal.

### Falhas de serviço observadas (inconclusivas)

1. **00:49:37.098Z — `GET /api/auth/me` HTTP 500, duração 10.059 s.** Console sanitizado: `Failed to fetch user profile` seguido de erro na invocação Prisma `adminUser.findFirst`. O painel ficou na página de login/redirect. A condição de parada do script falhou e os ciclos seguintes ainda visitaram rotas seguras com GET; não houve novo login, retry explícito ou escrita. O navegador foi parado após detectar a continuação.
2. **00:49:47.216Z — `GET /api/diagnostic/current` HTTP 503, 10.025 s; 00:49:47.243Z — mesma rota HTTP 503, 10.016 s.** Mensagem sanitizada: serviço temporariamente indisponível. As respostas chegaram durante a transição do ciclo seguinte e não foram retries explícitos.
3. **Recuperação observada após navegações seguras posteriores:** os ciclos 11 e 12 ainda visitaram somente Evidências e Meus Serviços por falha da condição de parada do script; não houve novo login ou retry explícito. Essas navegações emitiram GETs: às 00:50:27.568Z `GET /api/auth/me` HTTP 200 (413 ms), às 00:50:29.691Z `GET /api/diagnostic/current` HTTP 200 (2.053 s) e às 00:50:30.492Z `/api/diagnostic/bioimpacto/history` HTTP 200 (2.857 s). No ciclo 12, `/api/diagnostic/current` e histórico também retornaram HTTP 200 (3.894 s e 3.716 s). Após detectar a continuação, parei o navegador. A causa do 500/503 não foi determinada.
4. **00:52:25Z — check read-only único `GET /api/health`: HTTP 200, 1,9 ms, `{ok:true}`.** Não consultei `/health/db`.

Os detalhes de rota, status, duração, ciclo e hora estão em `continuation-cycles.json`; nenhum body, cookie, token, ID ou dado pessoal foi persistido. Após o 500, duas visitas seguras adicionais foram feitas inadvertidamente devido a falha de parada; não foram retries explícitos. Nenhuma escrita não-login foi observada.
