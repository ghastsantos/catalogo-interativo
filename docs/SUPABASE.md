# Ativar e comprovar os bônus

**Situação atual:** integração e SQL preparados, mas nenhum projeto Supabase foi conectado, provisionado ou testado nesta entrega. Os bônus não estão comprovados.

## Configuração

1. Conecte o Supabase à conversa ou crie um projeto de teste pelo painel oficial. Não é necessário enviar senha do banco, token de administração ou `service_role` no chat.
2. Execute `supabase/migrations/001_library.sql` **uma única vez** no SQL Editor de um projeto novo. A migração não é um script para reaplicar repetidamente: políticas/triggers já existentes gerarão erro. Verifique o resultado antes de continuar.
3. Em Authentication, use login por e-mail/senha. Mantenha a confirmação de e-mail e confirme as contas de teste antes de gravar. Quando houver um endereço web publicado, configure o Site URL/redirecionamento adequado no painel.
4. Copie apenas a URL do projeto e a chave **publishable** (ou anon legada). No `.env` local, configure:

```dotenv
EXPO_PUBLIC_AUTH_MODE=supabase
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICAVEL
```

5. Reinicie o Expo: `npx expo start --clear`. O modo Supabase não faz fallback silencioso para login local quando uma chave está ausente; mostra o erro de configuração.

No modo local, contas e biblioteca continuam disponíveis separadamente. Mudar o provedor não copia contas locais para a nuvem.

## Segurança

A tabela tem chave `(user_id, show_id)`. A RLS está habilitada e as políticas de leitura, inserção, alteração e exclusão exigem `auth.uid() = user_id`. O papel anônimo não recebe acesso à tabela; o autenticado recebe somente as operações previstas. A restrição de nota exige um inteiro de 1 a 5 apenas em séries assistidas.

`EXPO_PUBLIC_*` é público no app compilado. A proteção dos dados vem das políticas do banco, não de esconder a chave publicável no `.env`. Nunca use chave de serviço no aplicativo. `.env` não deve ir para o GitHub nem aparecer no vídeo.

## Sincronização

Primeiro a biblioteca local é hidratada. No modo nuvem, o app tenta sincronizar antes de liberar as telas; se a rede falhar, permite usar os dados locais e informa a limitação. Favoritos e notas são salvos localmente antes de serem enviados.

O envio ocorre após alterações, ao voltar ao primeiro plano e ao tocar em Sincronizar. Falhas mantêm uma fila persistida. A conciliação usa revisões para não apagar uma alteração feita durante uma requisição. Desfavoritar/desmarcar mantém um registro vazio para enviar a remoção ao outro aparelho.

A política entre aparelhos é **última gravação recebida pelo servidor para a série**. Não há edição colaborativa nem garantia de preservar duas alterações simultâneas em campos diferentes. O catálogo remoto continua exigindo internet.

## Teste automatizado de RLS

Crie duas contas de teste confirmadas, diferentes e sem dados importantes. Acrescente apenas no `.env` ignorado pelo Git:

```dotenv
TEST_USER_A_EMAIL=conta-a-de-teste@seu-dominio.com
TEST_USER_A_PASSWORD=senha-exclusiva-da-conta-a
TEST_USER_B_EMAIL=conta-b-de-teste@seu-dominio.com
TEST_USER_B_PASSWORD=senha-exclusiva-da-conta-b
```

Execute `npm run test:cloud`. O script autentica A e B, insere uma entrada de teste de A, confirma que A a lê, verifica que B não consegue ler/escrever em nome de A e que uma conexão anônima não consegue ler a biblioteca. Ao final tenta remover somente a entrada que criou. Este teste ainda **não foi executado**.

## Comprovação visual dos bônus

Use uma conta A no aparelho, favorite uma série e atribua uma nota. Toque em Sincronizar e confira o registro no painel. Entre com A em outro navegador/aparelho, sincronize e compare os dados. Desfavorite, sincronize de novo e confira a remoção. A conta B deve começar com sua própria biblioteca.

Teste também uma mudança sem internet, reabra o app e confirme a pendência; reconecte e sincronize. Somente depois destes testes marque os dois bônus como implementados e comprovados na autoavaliação.
