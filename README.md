# Entre Episódios

Catálogo de séries feito com React Native, Expo e TypeScript para o **Catálogo Interativo 2.0**. A API TVmaze fornece catálogo, busca e detalhes. O Supabase Auth autentica as contas; PostgreSQL com Row Level Security guarda favoritos, séries assistidas e notas de 1 a 5.

## Estado do projeto — 08/11/2026

- TypeScript completo e 25 testes de domínio aprovados.
- Exportações Web e Android aprovadas.
- Teste real do Supabase aprovado com duas contas: login, leitura e gravação próprias e isolamento entre usuários pelas políticas RLS.
- A apresentação em aparelho, o teste visual de sincronização entre dispositivos, a fila sem rede, TalkBack/VoiceOver e a comparação com o trabalho de Flutter ainda precisam de comprovação manual.
- Tema do app: séries de televisão, API TVmaze. Confirmar que esse tema não repetiu o do trabalho de Flutter.

## Executar

Requisitos: Node.js 22.13 ou superior e um projeto Supabase configurado com `supabase/migrations/001_library.sql`.

```bash
npm ci
Copy-Item .env.example .env
```

No `.env`, configure `EXPO_PUBLIC_AUTH_MODE=supabase`, a URL do projeto e a chave publicável. Não use chave secreta ou `service_role` no aplicativo. Depois:

```bash
npm run check
npx expo start --clear
```

Para abrir no navegador, pressione `w` no terminal do Expo ou execute `npm run web`. Para usar um celular fora da rede do computador, execute `npx expo start --tunnel`. Consulte `docs/EXECUTAR-PELO-CELULAR.md` para usar Codespaces.

O script de verificação do Supabase precisa de duas contas de teste confirmadas configuradas somente no `.env`:

```dotenv
TEST_USER_A_EMAIL=
TEST_USER_A_PASSWORD=
TEST_USER_B_EMAIL=
TEST_USER_B_PASSWORD=
```

## Funcionalidades

| Requisito | Implementação |
|---|---|
| RF01 | Catálogo paginado, refresh e placeholders |
| RF02 | Navegação protegida por sessão e logout |
| RF03 | Detalhes da série consultados pelo ID |
| RF04–RF05 | Favoritas sincronizadas e lista vazia |
| RF06 | Biblioteca restaurada ao abrir o app |
| RF07 | Cadastro, login, sessão, logout, assistidas e notas via Supabase Auth |
| RF08 | Busca TVmaze com resultados e filtro por gênero |
| RF09 | Carregamento, erros e novas tentativas |
| RF10 | Rótulos, estados e alvos de acessibilidade |

## Arquitetura

```text
App.tsx                       Providers e entrada
src/components/               Cards, grade, botões e feedback
src/contexts/                 Sessão e biblioteca global
src/domain/                   Regras de negócio e validações
src/hooks/                    Paginação e requisições canceláveis
src/navigation/               Rotas e tipos
src/screens/                  Login, catálogo, busca, detalhes e biblioteca
src/services/                 TVmaze, Supabase Auth, sincronização e sessão
supabase/migrations/          Tabela, restrições e políticas RLS
scripts/                      Testes de domínio e de nuvem
tests/                        Testes de domínio
```

## Autenticação, dados e sincronização

O Supabase Auth mantém a sessão e associa cada registro ao `user_id`. A tabela `library_entries` usa a chave composta `(user_id, show_id)`. As políticas RLS limitam leitura, gravação, atualização e remoção ao usuário autenticado. A chave publicável pode estar no aplicativo; a proteção vem das políticas do banco. Nenhuma chave administrativa deve ser compilada no app.

As alterações feitas sem conexão entram numa fila e são enviadas automaticamente quando a rede volta ou quando o app retorna ao primeiro plano. Falhas geram novas tentativas automáticas, com espera crescente. A conciliação preserva alterações feitas durante uma requisição. Entre dispositivos, vence a última gravação recebida pelo servidor para cada série; não há edição colaborativa em tempo real.

## Verificações

```bash
npm run check
npm run export:web
npx expo export --platform android
npm run test:cloud
```

`npm run test:cloud` autentica duas contas de teste, verifica leitura e gravação próprias, confirma o isolamento RLS e remove o registro sintético criado pelo teste.

## Referências

- TVmaze API: https://www.tvmaze.com/api
- Supabase Auth para React Native: https://supabase.com/docs/guides/auth/quickstarts/react-native
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Expo SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/
