# Entre Episódios

Catálogo de séries em React Native + Expo + TypeScript, desenvolvido para o **Catálogo Interativo 2.0**. API: TVmaze. Favoritas e séries assistidas com notas de 1 a 5, login obrigatório, persistência local e integração opcional com Supabase.

> **Estado em 02/11/2026:** código preparado; 25 testes de domínio aprovados; sintaxe de 31 arquivos TypeScript verificada. A instalação de dependências não pôde ser concluída no ambiente de preparação por falta de resolução de rede. **Build completo, execução Android/iOS, acessibilidade com leitor de tela e Supabase real ainda precisam ser validados.** O tema é provisório até confirmar que séries/TVmaze não foram usados no Somativo de Flutter. Não considerar os bônus comprovados antes dessa validação.

## Rodar

Node.js 22.13 ou superior. As versões nativas seguem o conjunto do Expo SDK 57.

```bash
npm install
npx expo install --check
cp .env.example .env
npm run check
npx expo start
```

O modo padrão é local e não requer chave de API. Cadastre uma conta na tela inicial. Não há usuário ou senha de demonstração embutidos.

Para navegador: `npm run web`. Para usar um celular fora da rede do computador: `npx expo start --tunnel`. No iOS, confira a compatibilidade do Expo Go com o SDK e entre na mesma conta Expo na CLI e no aplicativo, quando solicitado. Consulte `docs/EXECUTAR-PELO-CELULAR.md` para Codespaces.

**Lockfile:** não foi inventado um `package-lock.json` sem instalar as dependências. Após a primeira instalação bem-sucedida, execute as verificações e faça commit do lockfile. Daí em diante use `npm ci`. Se o Expo identificar divergência de versões, rode `npx expo install --fix`, teste novamente e registre as mudanças no lockfile.

## Estrutura

```text
App.tsx                       Providers e ponto de entrada
src/components/               Cards, grade, botões, feedback e filtros
src/contexts/                 Sessão e biblioteca global
src/domain/                   Regras puras e validação dos dados
src/hooks/                    Paginação e requisições canceláveis
src/navigation/               Native Stack e tipos das rotas
src/screens/                  Login, catálogo, busca, detalhes e biblioteca
src/services/                 Axios, autenticação, storage e sincronização
src/theme/                    Cores e estilos compartilhados
supabase/migrations/          Tabela, restrições e políticas de acesso
scripts/                      Execução dos testes
tests/                        25 testes de domínio
.github/workflows/check.yml   Pipeline preparado; ainda não executado remotamente
.devcontainer/                Ambiente de desenvolvimento no navegador
```

## Requisitos no código

| RF | Implementação principal | O que conferir no aparelho |
|---|---|---|
| RF01 | `src/screens/CatalogScreen.tsx`; `src/hooks/useCatalog.ts`; `src/components/ShowGrid.tsx` | Grade, rolagem infinita, atualização por gesto e placeholder |
| RF02 | `src/navigation/RootNavigator.tsx`; `src/screens/DetailsScreen.tsx` | ID na rota, header dinâmico e logout sem voltar ao catálogo |
| RF03 | `src/services/tvmaze.ts`; `src/screens/DetailsScreen.tsx` | Segunda requisição, dados completos, sinopse sem tags |
| RF04 | `src/contexts/LibraryContext.tsx`; `src/components/ItemCard.tsx` | Coração sincronizado entre telas |
| RF05 | `src/screens/LibraryScreen.tsx` | Favoritas atualizadas e mensagem de lista vazia |
| RF06 | `src/services/libraryStorage.ts`; `src/contexts/LibraryContext.tsx` | Reabrir aplicativo e manter dados; não sobrescrever durante hidratação |
| RF07 | `src/contexts/AuthContext.tsx`; `src/services/localAuth.ts`; `src/screens/DetailsScreen.tsx` | Cadastro, login, sessão, logout, assistidas e notas |
| RF08 | `src/screens/SearchScreen.tsx` | Campo controlado, botão Buscar, lista de resultados e busca vazia |
| RF09 | `src/hooks/useRequest.ts`; `src/hooks/useCatalog.ts`; `src/components/Feedback.tsx` | Indicadores e erros com tentativa novamente |
| RF10 | `src/components/Button.tsx`; `src/components/ItemCard.tsx`; `src/screens/DetailsScreen.tsx` | TalkBack/VoiceOver, fonte ampliada, estados e área de toque |

A tela de biblioteca é reutilizada nas rotas **Favoritas** e **Assistidas**. O estado global é deliberadamente dividido entre sessão e biblioteca; busca, filtro, senha digitada e requisições pertencem ao estado local.

## API e paginação

- Catálogo: `GET https://api.tvmaze.com/shows?page=0` e páginas seguintes.
- Busca: `GET https://api.tvmaze.com/search/shows?q=dark`.
- Detalhes: `GET https://api.tvmaze.com/shows/:id`.

A TVmaze entrega até 250 séries por página. Uma página menor **não significa fim**: a API usa 404 para indicar o fim do índice. A próxima página só avança quando a requisição termina com sucesso. Requisições concorrentes são bloqueadas, IDs repetidos são deduplicados e o refresh cancela a requisição anterior. Uma falha na paginação mantém os itens existentes e permite tentar a mesma página novamente.

O filtro de gênero atua somente nos itens já carregados ou nos resultados da busca; isso está escrito na interface. Com filtro ativo, o botão “Carregar próxima página” permite continuar buscando outros itens. A busca usa o endpoint de busca, não filtra apenas o catálogo local. O catálogo remoto completo não é disponibilizado offline.

## Persistência e segurança

**Local:** AsyncStorage recebe a biblioteca e eventuais alterações pendentes, com chave separada por provedor e ID de usuário. As gravações são serializadas e o estado visual só é atualizado depois de salvar. Dados locais inválidos causam uma mensagem; não são silenciosamente substituídos por uma biblioteca vazia.

**Credenciais:** PBKDF2-HMAC-SHA256, salt aleatório de 16 bytes e 600 mil iterações; não há senha em texto puro. A implementação usa `@noble/hashes` com processamento assíncrono. Conta local e sessão usam SecureStore no Android/iOS. O adaptador divide valores grandes em partes e só publica a nova referência após salvar todas as partes.

**Web:** SecureStore não está disponível no navegador; o adaptador utiliza AsyncStorage/localStorage. O hash da senha continua protegido contra armazenamento em texto puro, mas tokens ficam sujeitos ao modelo de segurança do navegador. Login local é um baseline didático, não autenticação confiável de um backend nem proteção contra um aparelho comprometido.

**Supabase:** ver `docs/SUPABASE.md`. A biblioteca continua salva localmente e pendências são reenviadas. A RLS restringe cada registro a `auth.uid()`. Tokens usam o mesmo adaptador de sessão. O código usa apenas a chave **publicável/anon**; nunca `service_role`, secret key ou senha de banco. Variáveis `EXPO_PUBLIC_*` entram no bundle: `.env` evita commit acidental, mas não torna o valor secreto no aplicativo.

A sincronização usa a última gravação recebida pelo servidor por série. Edições pendentes neste aparelho prevalecem sobre uma leitura remota até seu envio. Não é um mecanismo de resolução colaborativa de conflitos; não há Realtime. Registros totalmente desmarcados permanecem como tombstones para propagar remoções. Contas locais e contas Supabase são separadas e não migram automaticamente.

## Testes

```bash
npm test                 # Compila e testa o domínio, sem rede
npm run typecheck        # Tipagem completa, exige dependências instaladas
npm run export:web       # Bundle web real
npx expo export --platform android
npm run test:cloud       # Integração real, exige projeto e contas de teste
```

O relatório de execução e a distinção entre o que foi executado e o que está pendente estão em `docs/VALIDACAO.md`. A CI preparada executa a tipagem, os testes e os bundles; um bundle Android não equivale a abrir o aplicativo num aparelho.

## Entrega acadêmica

- `docs/ROTEIRO-VIDEO.md`: falas, ações na tela e divisão de 8 minutos.
- `docs/ENTREGA.md`: estrutura exigida para o PDF, ainda com campos pendentes.
- `docs/CHECKLIST.md`: verificação funcional e administrativa.
- Os PDFs anexados são **roteiro** e **rascunho de entrega**, não comprovação de testes móveis.

Confirmar os nomes completos de **todos** os integrantes, disciplina, turma, tema do Flutter, URL pública do repositório e URL pública do vídeo. Fotografias/screenhots de telas precisam vir do aplicativo executado; não foram fabricadas capturas de tela.

## Fontes técnicas

Consultadas em 02/11/2026:

- TVmaze: https://www.tvmaze.com/api
- Conjunto oficial de versões SDK 57: https://github.com/expo/expo/blob/sdk-57/packages/expo/bundledNativeModules.json
- Template TypeScript: https://github.com/expo/expo/blob/sdk-57/templates/expo-template-blank-typescript/package.json
- Expo, executar no aparelho: https://docs.expo.dev/get-started/start-developing/
- React Navigation, fluxo de autenticação: https://reactnavigation.org/docs/auth-flow/
- Supabase, React Native: https://supabase.com/docs/guides/auth/quickstarts/react-native
- Supabase, RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Expo SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/
- Flutter, estado global: https://docs.flutter.dev/data-and-backend/state-mgmt/simple
- Flutter, GridView.builder: https://api.flutter.dev/flutter/widgets/GridView/GridView.builder.html
- Flutter, FutureBuilder: https://api.flutter.dev/flutter/widgets/FutureBuilder-class.html
- Noble PBKDF2: https://github.com/paulmillr/noble-hashes/blob/2.0.1/src/pbkdf2.ts

Os dados e imagens do catálogo são fornecidos pela TVmaze, cuja API indica licença CC BY-SA; a atribuição está presente na interface. Nomes e cartazes pertencem aos respectivos titulares. O projeto não hospeda nem reproduz episódios.
