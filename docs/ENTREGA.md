# Modelo de entrega — falta anexar vídeo e capturas finais

**Comprovado:** checagem TypeScript, 25 testes de domínio, exportações Web/Android e teste real Supabase com duas contas, incluindo leitura/gravação próprias e isolamento RLS.

**Ainda pendente:** demonstração em aparelho, sincronização visual entre dispositivos, teste real offline/retorno da rede, tema usado no Flutter e captura da busca. As imagens fornecidas foram incluídas como evidência visual das telas; a comprovação Supabase vem do teste automatizado com duas contas.

## Capa

Disciplina: Desenvolvimento Mobile Framework

Curso/período/turma: Sistemas de Informação — 6º período, Turma A

Data de entrega: 08/11/2026

Projeto: **Entre Episódios — Catálogo Interativo 2.0**

Tema: Séries de televisão; API TVmaze. Confirmar que não repete o tema do Somativo de Flutter.

Integrantes:

- Gastão Eduardo Santos Borges

## Seção 1 — Links

GitHub público: https://github.com/ghastsantos/catalogo-interativo

YouTube: https://www.youtube.com/watch?v=tl81xK8C9jU — confirmar visibilidade Pública e duração de 6 a 9 minutos antes do envio.

## Seção 2 — Tema e configuração

Tema: catálogo de séries. API: https://www.tvmaze.com/api.

Configuração usada: React Native + Expo, Supabase Auth e PostgreSQL com Row Level Security.

Comprovação do bônus de autenticação e isolamento: teste real com duas contas aprovado. A sincronização visual em dois dispositivos e a retomada após perda de rede ainda precisam de demonstração manual.

Configuração efetivamente usada no vídeo: [CONFERIR APÓS A GRAVAÇÃO].

## Seção 3 — Autoavaliação RF01–RF10

O estado “Parcial” é conservador: existe implementação em código, mas a execução completa ainda não foi validada. Atualizar para Sim/Não/Parcial conforme a execução real, sem confundir existência de código com comprovação de funcionamento.

| RF | Implementado | Caminho do arquivo principal |
|---|---|---|
| RF01 | Parcial | `src/screens/CatalogScreen.tsx` |
| RF02 | Parcial | `src/navigation/RootNavigator.tsx` |
| RF03 | Parcial | `src/screens/DetailsScreen.tsx` |
| RF04 | Parcial | `src/contexts/LibraryContext.tsx` |
| RF05 | Parcial | `src/screens/LibraryScreen.tsx` |
| RF06 | Parcial | `src/contexts/LibraryContext.tsx` |
| RF07 | Parcial | `src/contexts/AuthContext.tsx` |
| RF08 | Parcial | `src/screens/SearchScreen.tsx` |
| RF09 | Parcial | `src/hooks/useRequest.ts` |
| RF10 | Parcial | `src/components/Button.tsx` |

## Seção 4 — Flutter × React Native

**Texto técnico-base para adaptar à experiência real do grupo no Somativo de Flutter.**

No Flutter, o Provider pode disponibilizar um estado a uma parte da árvore de widgets, enquanto no React Native usamos Context API e hooks para compartilhar sessão e biblioteca. A decisão de arquitetura é semelhante: estado usado por várias telas precisa ter uma fonte comum. Neste projeto, campos de formulário, filtro e busca continuam locais; favoritos e sessão ficam em Providers separados. O Context não elimina automaticamente renderizações: consumidores podem renderizar novamente quando seu valor muda.

Para o catálogo, a comparação é entre GridView.builder e FlatList com numColumns. As duas abordagens permitem trabalhar com listas extensas sem criar uma tela estática com todos os elementos de uma vez. No React Native, utilizamos keyExtractor baseado no ID, onEndReached e ListFooterComponent. A paginação e a deduplicação ficam separadas da apresentação.

No assincronismo, FutureBuilder permite representar estados de um Future no Flutter. Aqui, useEffect dispara a requisição, useState representa carregamento, erro e dados, e o cleanup cancela a operação. Não são mecanismos idênticos: o efeito também precisa de dependências estáveis e proteção contra respostas antigas.

Em ferramentas, Flutter oferece hot reload; no fluxo React Native usamos Fast Refresh, Metro e Expo. O Expo facilita a abertura do projeto quando o ambiente e o dispositivo são compatíveis. A avaliação de produtividade depende da experiência efetiva do grupo, da configuração e dos problemas encontrados, não apenas da quantidade de linhas.

**Complementar antes da entrega:** [QUAL TEMA/API FOI USADO NO FLUTTER? O QUE FOI MAIS FÁCIL OU DIFÍCIL NOS DOIS TRABALHOS? INCLUIR UM EXEMPLO REAL DO GRUPO.]

## Seção 5 — Explicação técnica

Tema: Supabase Auth, Row Level Security e sincronização.

Minuto planejado: 5:30 a 8:00. [CONFIRMAR O MINUTO NO VÍDEO PUBLICADO.]

Início planejado: 5:30. Arquivos: `src/services/supabase.ts`, `src/services/cloudLibrary.ts`, `src/contexts/AuthContext.tsx`, `src/contexts/LibraryContext.tsx` e `supabase/migrations/001_library.sql`.

## Seção 6 — Screenshots

Capturas reais fornecidas pelo integrante. Elas documentam as telas; a comprovação da autenticação e do isolamento Supabase está registrada separadamente no teste automatizado.

1. Login: [INSERIR]
2. Catálogo: [INSERIR]
3. Detalhes: [INSERIR]
4. Busca: [CAPTURA PENDENTE — não veio entre as imagens fornecidas]
5. Favoritas: [INSERIR]
6. Assistidas e notas: [INSERIR]

Antes de submeter: retirar todos os campos pendentes e avisos de rascunho, manter apenas resultados comprovados, conferir nomes de todos os integrantes e enviar o único PDF pelo campo oficial da atividade.
