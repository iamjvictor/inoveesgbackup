# Testes
- AC-001: abrir rota preencher com diagnóstico concluído e verificar encaminhamento.
- AC-002: testar rejeição de atualização de concluído, e condição de concorrência, sem gravar no banco remoto.
- AC-003: diagnóstico ativo continua podendo responder e salvar módulo; ao reabrir, UI deve hidratar as respostas persistidas por ordem. Testar reabertura, reload sem cache local e precedence de rascunho local, comparando valores e monitorando POSTs.
- AC-004: conferir cartões inteiros, ações e ausência de recorte em 768×1024, desktop e celular.

## Execução independente de reabertura
1. GET autenticado deve mostrar ACTIVE e 17 respostas Environmental.
2. Abrir `/app/diagnostico/preencher?axis=E`; verificar respostas selecionadas em ordens 1–17 contra GET current.
3. Remover somente cache de rascunho no contexto de navegador isolado, recarregar; verificar novamente 17/17 selecionadas e nenhuma chamada POST submit/start.
4. Em contexto isolado, alterar uma opção sem submeter, recarregar e confirmar o valor temporário prevalece; conferir nenhuma escrita no servidor.
5. Inspecionar requests de rede e registrar rotas, status, erro, duração, screenshots e dados sanitizados.

## Continuação: salvamento em lote e cache antigo
- Aguardar implementação do lote e correção de merge de respostas antes de julgar alteração.
- Cache antigo: com ACTIVE 17/17 no servidor e sessionStorage contendo strings vazias, abrir/recarregar; UI deve exibir 17/17 conforme servidor. Cache versionado: editedQuestionIds controla edições locais intencionais, inclusive valor vazio.
- Rascunho local: sobrepor uma resposta local não vazia, recarregar; valor local deve continuar visível até sincronizar, sem POST apenas ao abrir.
- Persistência: antes e depois do POST, calcular hashes por questionOrder; enviar os mesmos 17 valores pela UI, finalize=false; status deve permanecer ACTIVE e todas respostas/hashes iguais.
- Lote: confirmar uma gravação parametrizada/batch por módulo, nenhuma escrita parcial em falha simulada e idempotência de retry; executar testes unitários/DB simulada sem concorrência real remota.
- Desempenho: comparar duração de POST ao baseline browser 10,732s. Registrar POST e perfil/navegação separadamente; sem afirmar ganho se ambiente ou latência variar.
- Preservar conta: não finalizar diagnóstico, não testar sobre COMPLETED, não apagar respostas; somente regravar exatamente os mesmos valores existentes.
