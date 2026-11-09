# Registro de validação — 08/11/2026

## Aprovado neste ambiente

- `npm run check`: TypeScript completo aprovado; 25 testes de domínio aprovados.
- `npm run export:web`: bundle Web gerado.
- `npx expo export --platform android`: bundle Android gerado anteriormente, antes da última alteração visual e de retry automático.
- `npm run test:cloud`: aprovado com duas contas. A conta A autenticou, gravou e leu sua linha; a conta B não leu nem alterou a linha de A; o acesso anônimo foi negado. O script remove a linha sintética de teste.
- Repositório GitHub público confirmado: `https://github.com/ghastsantos/catalogo-interativo`.
- Testes de domínio cobrem paginação, busca, validação, favoritos, notas, serialização e conciliação de alterações concorrentes.

## Implementado e validado manualmente

- Login Supabase como configuração padrão do app.
- Sincronização automática da biblioteca e novas tentativas com espera crescente após falhas.
- Removido o botão manual de sincronização.
- Textos da tela de login e status atualizados para a experiência Supabase.

## Validação manual

- Navegação em aparelho pelos fluxos de catálogo, busca, detalhes, favoritas e assistidas: concluída.
- TalkBack/VoiceOver e fonte ampliada: validados manualmente, conforme informado pelo autor.
- Vídeo gravado com duração dentro do intervalo exigido.
- Comparação técnica baseada no repositório Ooo Catalog: `https://github.com/ghastsantos/ooo-catalog`.

## Itens para o registro visual

- As capturas do login, catálogo, detalhes, busca, favoritas e assistidas estão incluídas no PDF.
## Limites das verificações

Bundle Web e bundle Android aprovam compilação; não substituem a abertura e navegação em aparelho real. O teste RLS prova autenticação e isolamento de linhas; não prova a experiência visual de sincronização entre dispositivos nem o comportamento sem rede.
