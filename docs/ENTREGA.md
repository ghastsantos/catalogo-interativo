# Entrega — Entre Episódios

**Comprovado:** checagem TypeScript, 25 testes de domínio, exportações Web/Android e teste real Supabase com duas contas, incluindo leitura/gravação próprias e isolamento RLS.

**Comprovado:** requisitos implementados no código; TypeScript, 25 testes de domínio, exportações Web/Android e teste real Supabase com duas contas. As capturas fornecidas documentam as telas; a comprovação Supabase vem do teste automatizado.

**Capturas:** as seis telas exigidas estão incluídas no PDF.

## Capa

Disciplina: Desenvolvimento Mobile Framework

Curso/período/turma: Sistemas de Informação — 6º período, Turma A

Data de entrega: 08/11/2026

Projeto: **Entre Episódios — Catálogo Interativo 2.0**

Tema: catálogo de séries de televisão; API TVmaze. O Somativo de Flutter foi um catálogo de personagens de Hora de Aventura, com dados da Wiki Hora de Aventura (Fandom). Os temas e as APIs são diferentes.

Integrantes:

- Gastão Eduardo Santos Borges

## Seção 1 — Links

GitHub público: https://github.com/ghastsantos/catalogo-interativo

Vídeo: https://www.youtube.com/watch?v=tl81xK8C9jU — apresentação com duração de 6 a 9 minutos.

## Seção 2 — Tema e configuração

Tema: catálogo de séries. API: https://www.tvmaze.com/api.

Configuração usada: React Native + Expo, Supabase Auth e PostgreSQL com Row Level Security.

Comprovação do bônus de autenticação e isolamento: teste real com duas contas aprovado. A validação manual em aparelho, com TalkBack/VoiceOver e fonte ampliada, foi concluída. O vídeo apresenta o funcionamento do app.



## Seção 3 — Autoavaliação RF01–RF10

“Sim” indica que o requisito está implementado no código. Os testes de domínio, exportações, capturas e teste Supabase registram a validação disponível.

| RF | Implementado | Caminho do arquivo principal |
|---|---|---|
| RF01 | Sim | `src/screens/CatalogScreen.tsx` |
| RF02 | Sim | `src/navigation/RootNavigator.tsx` |
| RF03 | Sim | `src/screens/DetailsScreen.tsx` |
| RF04 | Sim | `src/contexts/LibraryContext.tsx` |
| RF05 | Sim | `src/screens/LibraryScreen.tsx` |
| RF06 | Sim | `src/contexts/LibraryContext.tsx` |
| RF07 | Sim | `src/contexts/AuthContext.tsx` |
| RF08 | Sim | `src/screens/SearchScreen.tsx` |
| RF09 | Sim | `src/hooks/useRequest.ts` |
| RF10 | Sim | `src/components/Button.tsx` |

## Seção 4 — Flutter × React Native

O Somativo de Flutter, [Ooo Catalog](https://github.com/ghastsantos/ooo-catalog), é um catálogo de personagens de Hora de Aventura. Ele usa Flutter, Provider, a API MediaWiki da Wiki Hora de Aventura, Firebase Authentication e Cloud Firestore. Este projeto, Entre Episódios, é um catálogo de séries: usa React Native com Expo, Context API e hooks, TVmaze e Supabase Auth com PostgreSQL e políticas RLS.

As duas aplicações compartilham a ideia de carregar um catálogo paginado, abrir detalhes e manter coleções por conta. No Flutter, o estado compartilhado fica no `AppProvider`, e a API MediaWiki trata listagem, busca e detalhes. No React Native, `useCatalog` e `LibraryContext` organizam o catálogo e a biblioteca, enquanto `useRequest` gerencia requisições e estados de carregamento e erro. A lista Flutter é construída com widgets do Flutter; a versão Expo usa `FlatList` para renderizar a grade e carregar mais resultados.

A comparação de persistência também mostra duas integrações de nuvem: o Ooo Catalog autentica com Firebase e guarda as listas no Firestore, com regras por usuário; Entre Episódios autentica com Supabase e protege as linhas no PostgreSQL com RLS. Assim, a diferença principal está nas ferramentas e nos serviços escolhidos para atender ao mesmo fluxo de catálogo e biblioteca pessoal.

## Seção 5 — Explicação técnica

Tema: Supabase Auth, Row Level Security e sincronização.

Minuto: 5:30 a 8:00, conforme o roteiro.

Início planejado: 5:30. Arquivos: `src/services/supabase.ts`, `src/services/cloudLibrary.ts`, `src/contexts/AuthContext.tsx`, `src/contexts/LibraryContext.tsx` e `supabase/migrations/001_library.sql`.

## Seção 6 — Screenshots

Capturas reais fornecidas pelo integrante. Elas documentam as telas; a comprovação da autenticação e do isolamento Supabase está registrada separadamente no teste automatizado.

1. Login: `docs/capturas-entrega/02-login.png`
2. Catálogo: `docs/capturas-entrega/06-catalogo.png`
3. Detalhes: `docs/capturas-entrega/03-detalhes.png`
4. Busca: `docs/capturas-entrega/07-busca.png`
5. Favoritas: `docs/capturas-entrega/05-favoritas.png`
6. Assistidas e notas: `docs/capturas-entrega/04-assistidas.png`

Entrega preparada por Gastão Eduardo Santos Borges.
