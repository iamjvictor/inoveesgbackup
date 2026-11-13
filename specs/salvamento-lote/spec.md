# Salvamento de módulo em lote
AC-001: salvar respostas usa lote parametrizado, atomicidade e mesmos valores e regras de conflito.
AC-002: lock, permissão e proteção de diagnóstico concluído permanecem garantidos.
AC-003: erros transitórios de banco têm retry limitado e seguro da transação inteira; erros de validação não repetem.
AC-004: UI mantém feedback até confirmação e permite recuperar falhas sem perder respostas.
AC-005: cache antigo vazio não oculta respostas já salvas; edição temporária não vazia é preservada.
AC-006: medir tempo antes/depois com dados sintéticos, sem alterar respostas anteriores.
