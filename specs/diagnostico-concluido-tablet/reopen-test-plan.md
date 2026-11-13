# Test plan: reabrir módulo ativo

- AC-003 / reabertura: com conta Estratégica ACTIVE e 17 respostas persistidas no eixo Ambiental, abrir `/app/diagnostico/preencher?axis=E`; esperar a API e a tela estabilizarem; conferir progresso 17/17 e que cada pergunta mostra o valor persistido correspondente.
- AC-003 / recarregamento: recarregar a mesma rota e confirmar mesmos 17/17 valores sem POST automático de início.
- AC-003 / preservação: comparar snapshot de respostas no banco antes/depois de somente abrir e recarregar; hashes devem permanecer iguais.
- Salvamento / timing: se o QA clicar em salvar, medir `POST /submit`, refresh de perfil e navegação separadamente; reusar exatamente as respostas existentes, não finalizar diagnóstico.
- Guardas: confirmar conta concluída continua redirecionando e respostas concluídas não mudam.
- Limite: não fazer consultas ou escritas que finalizem o diagnóstico; nenhuma nova resposta deve ser inventada.
