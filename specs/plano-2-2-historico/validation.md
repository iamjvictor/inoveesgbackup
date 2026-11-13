# Validação

AC-001–003: painel de histórico e vigência implementado na tela de evidências. API autenticada retorna 4 janelas para a conta de demonstração; agosto 3/1 e 62 pontos, setembro 4/1 e 68 pontos, outubro 5/1 e 74 pontos, novembro 2 pendentes e pontuação em análise. Novembro abre de 1 a 15/11/2026 no fuso São Paulo.

AC-004: rota resolve organizationId pela sessão e consulta pedidos/evidências/snapshots somente dessa organização. Login e GET da rota testados via HTTP: 200/200.

AC-005: conta criada em Supabase Auth e banco; senha fornecida pelo usuário validada via login. Evidências de demonstração armazenadas no bucket `diagnostic-evidences`, com datas históricas no banco. Pedido e assinatura anuais marcados ativos; pagamento MANUAL de demonstração registrado.

Verificação: 38 testes de backend passaram; TypeScript de backend e frontend passou. O fluxo de revisão do admin agora grava um snapshot quando todas as evidências de uma janela encerrada são avaliadas. As três pontuações anteriores da demonstração foram semeadas, pois a conta foi criada depois do encerramento dessas janelas. A revisão independente foi solicitada, mas o subagente não conseguiu concluir.
