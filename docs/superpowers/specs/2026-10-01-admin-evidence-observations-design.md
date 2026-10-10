# Observações administrativas nas evidências

## Objetivo

Permitir que administradores registrem observações vinculadas a cada arquivo enviado como evidência. As observações ficam visíveis somente no fluxo administrativo, aparecem abaixo da linha do arquivo quando expandidas e preservam autor e data de criação.

## Estado atual

Cada arquivo é persistido individualmente em `evidences`, com organização, diagnóstico, nome, localização no Storage, tipo, estado de upload e estado de validação. O painel administrativo monta a lista de documentos no resumo da empresa e exibe cada arquivo em uma linha clicável.

Decisões de aprovação e recusa são registradas em `evidence_reviews`, com revisor, estado anterior, novo estado, comentário opcional e data. Esse comentário pertence à decisão de revisão e é preenchido no modal de pré-visualização. Não há hoje um fluxo para anotações independentes do estado da evidência.

## Desenho

Criar uma entidade `EvidenceNote` para observações administrativas, separada de `EvidenceReview`. Cada observação pertence a uma evidência e ao usuário administrador que a criou. O banco define o horário de criação. As observações são append-only no escopo desta entrega: o painel permite criar e consultar, sem editar ou excluir.

Separar os registros mantém a semântica atual de `EvidenceReview`: comentários de aprovação ou recusa continuam vinculados à mudança de status. Uma observação não altera status, pontuação, datas de validação ou qualquer dado do arquivo.

## Persistência e auditoria

`EvidenceNote` contém:

- `id`: UUID;
- `evidenceId`: chave estrangeira para `Evidence`, com exclusão em cascata;
- `authorUserId`: chave estrangeira para `User`, preservada com exclusão restrita;
- `content`: texto obrigatório, após remoção de espaços externos;
- `createdAt`: data/hora gerada pelo servidor.

Adicionar relações inversas em `Evidence` e `User`, além de índice por `evidenceId` e `createdAt` para recuperar a linha do tempo de uma evidência. O limite de conteúdo é 2.000 caracteres. Conteúdo vazio ou apenas com espaços deve ser rejeitado.

## API e autorização

Adicionar rotas sob o namespace administrativo, protegidas pela mesma verificação de administrador usada pelo painel:

- `GET /admin/evidences/:id/notes`: retorna as observações da evidência, da mais antiga para a mais recente, incluindo conteúdo, nome do autor e data ISO;
- `POST /admin/evidences/:id/notes`: recebe `{ content }`, deriva o autor da sessão autenticada, grava a observação e retorna o registro criado no mesmo formato.

As rotas validam a existência da evidência. Requisição inválida retorna `400`; evidência inexistente retorna `404`; usuário sem acesso administrativo não obtém nem cria observações. O identificador do autor e a data nunca são aceitos do cliente. Nenhuma rota de empresa/cliente expõe `EvidenceNote`.

## Painel administrativo

Na linha de cada documento, acrescentar um botão com ícone de comentário ao lado do indicador de status. O botão expande ou recolhe uma área logo abaixo da linha, sem abrir o modal de pré-visualização. O botão deve ter rótulo acessível e estado `aria-expanded`.

Ao expandir, carregar as observações daquele arquivo. Mostrar estado de carregamento, estado vazio e erro de leitura. Quando houver observações, exibir cada texto com nome do administrador e data/hora formatada em pt-BR, em ordem cronológica. Abaixo da lista, mostrar campo de texto e ação para salvar. Durante o envio, bloquear envios repetidos; após sucesso, limpar o campo e acrescentar a nova observação na lista sem alterar a linha do status. Em erro, manter o texto digitado e informar que não foi salvo.

A área expandida faz parte do cartão/linha do documento. Para habilitar botões independentes sem HTML interativo aninhado, substituir o botão que hoje envolve a linha inteira por um contêiner semântico com ações separadas: abrir pré-visualização, expandir observações e mostrar status.

O indicador visual do ícone pode mostrar a quantidade de observações já carregadas. A tela não deve baixar o histórico de todas as evidências junto com o resumo inicial da empresa; a consulta acontece quando o administrador expande cada documento.

## Acesso e privacidade

Observações são conteúdo interno administrativo por enquanto. Apenas endpoints administrativos retornam esse conteúdo; fluxos de diagnóstico e área da empresa não recebem os campos nem as relações de `EvidenceNote`. A autorização é validada no servidor em cada leitura e gravação.

Como a tabela fica no schema `public` do Supabase, habilitar RLS e revogar privilégios de `anon` e `authenticated`. O acesso ocorre pelo backend confiável, após a autorização administrativa da API.

## Fora do escopo

- Exibir observações para usuários da empresa ou fornecedores.
- Alterar ou excluir uma observação já salva.
- Usar observações para aprovar/recusar arquivos, mudar pontuação ou notificar usuários.
- Migrar comentários antigos de `EvidenceReview`: continuam registrados como comentários associados às respectivas decisões.

## Critérios de aceite

1. Administrador consegue abrir o ícone de comentário em uma linha, registrar uma observação e vê-la abaixo do documento sem mudança no status.
2. Ao recolher e expandir novamente, todas as observações persistidas aparecem com autor e data/hora.
3. Observações de uma evidência não aparecem em outra evidência.
4. Texto vazio e texto acima de 2.000 caracteres não são salvos; erros de envio preservam o texto digitado.
5. Usuário sem papel administrativo não consegue consultar nem criar observações por chamada direta à API.
6. Comentários já existentes em aprovações/recusas seguem funcionando como antes e não são tratados como observações avulsas.

## Questões resolvidas

- Visibilidade: somente administradores nesta etapa.
- Histórico: múltiplas observações independentes por arquivo, preservadas individualmente.
- Edição e exclusão: não disponíveis nesta etapa; o histórico é append-only.
