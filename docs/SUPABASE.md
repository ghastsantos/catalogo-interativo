# Supabase: configuração e comprovação

## Estado

- Migração `supabase/migrations/001_library.sql` aplicada ao projeto de entrega.
- App configurado para `EXPO_PUBLIC_AUTH_MODE=supabase`.
- `npm run test:cloud` aprovado com duas contas: autenticação, gravação e leitura próprias, bloqueio de leitura/escrita entre usuários e acesso anônimo negado.
- A verificação automatizada remove a entrada sintética que cria.
- A demonstração visual entre dispositivos e o ciclo de falha de rede/reenvio ainda precisam ser gravados.

## Variáveis

Configure no arquivo `.env`, que permanece ignorado pelo Git:

```dotenv
EXPO_PUBLIC_AUTH_MODE=supabase
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICAVEL
```

Para executar o teste de isolamento, acrescente duas contas confirmadas:

```dotenv
TEST_USER_A_EMAIL=
TEST_USER_A_PASSWORD=
TEST_USER_B_EMAIL=
TEST_USER_B_PASSWORD=
```

Nunca use chave `service_role`, secret key ou senha do banco no app. Variáveis `EXPO_PUBLIC_*` são incluídas no bundle; a chave publicável não substitui a proteção RLS.

Depois de mudar o `.env`, reinicie com `npx expo start --clear`.

## Banco e segurança

A tabela `public.library_entries` usa a chave composta `(user_id, show_id)`, exige nota inteira de 1 a 5 para séries assistidas e ativa Row Level Security. As políticas de leitura, inserção, atualização e remoção verificam `auth.uid() = user_id`. A tabela não concede acesso ao papel anônimo.

## Sincronização

Favoritos, séries assistidas e notas são sincronizados com a conta autenticada. Alterações feitas sem conexão entram numa fila e são reenviadas automaticamente quando a conexão volta ou o app retorna ao primeiro plano. Em falhas, o app tenta novamente com intervalos crescentes. A reconciliação preserva uma alteração que aconteça enquanto outra sincronização está em andamento.

Entre dispositivos, vence a última gravação recebida pelo servidor para cada série. Não há edição colaborativa em tempo real. O catálogo TVmaze exige conexão.

## Teste real de RLS

```bash
npm run test:cloud
```

O script entra com as duas contas, grava uma linha sintética sob a conta A, verifica que A pode ler seus dados, B não pode ler nem gravar em nome de A e o acesso anônimo é negado. Ao terminar, tenta remover a linha que criou.

## Demonstração visual ainda necessária

1. Entre com A, favorite uma série e marque outra como assistida com nota.
2. Aguarde a sincronização automática.
3. Entre com A em outro aparelho/navegador e confirme que os dados aparecem.
4. Entre com B e confirme que a biblioteca de A não aparece.
5. Faça uma alteração sem rede, retorne à conexão e confirme que ela é sincronizada automaticamente.

Grave esses fluxos sem mostrar `.env`, senhas, tokens ou endereço de e-mail pessoal.
