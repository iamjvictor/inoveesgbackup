# Back_esgInove
## Provisionar administradores

O provisionamento cria ou atualiza exatamente três usuários no Supabase Auth e os vincula às tabelas `users` e `admin_users` do banco. As senhas ficam somente no arquivo local de entrada, que não deve ser commitado.

```bash
cp admin-users.example.json admin-users.json
# edite os três e-mails, nomes e senhas fortes em admin-users.json
npm run admin:create -- admin-users.json
```

O script é idempotente por e-mail. Em uma execução posterior, ele atualiza a senha informada e mantém o vínculo administrativo. Os papéis aceitos são `SUPER_ADMIN`, `OPS` e `FINANCE`.
