# Registro de validação — 08/11/2026

## Aprovado neste ambiente

- `npm run check`: TypeScript completo aprovado; 25 testes de domínio aprovados.
- `npm run export:web`: bundle Web gerado.
- `npx expo export --platform android`: bundle Android gerado anteriormente, antes da última alteração visual e de retry automático.
- `npm run test:cloud`: aprovado com duas contas. A conta A autenticou, gravou e leu sua linha; a conta B não leu nem alterou a linha de A; o acesso anônimo foi negado. O script remove a linha sintética de teste.
- Repositório GitHub público confirmado: `https://github.com/ghastsantos/catalogo-interativo`.
- Testes de domínio cobrem paginação, busca, validação, favoritos, notas, serialização e conciliação de alterações concorrentes.

## Implementado, falta conferir visualmente

- Login Supabase como configuração padrão do app.
- Sincronização automática da biblioteca e novas tentativas com espera crescente após falhas.
- Removido o botão manual de sincronização.
- Textos da tela de login e status atualizados para a experiência Supabase.

## Ainda depende de demonstração pelo usuário

- Abrir o app no aparelho/navegador com a conta Supabase e validar os fluxos de catálogo, busca, detalhes, favoritas e assistidas.
- Confirmar a mesma conta em dois aparelhos e demonstrar a biblioteca sincronizada.
- Testar uma alteração sem rede e confirmar o reenvio automático depois de reconectar.
- TalkBack/VoiceOver, fonte ampliada e leitor de tela.
- Capturas finais no modo Supabase; as imagens anteriores mostram a versão local e incluem endereço de e-mail pessoal.
- Link público do vídeo e sua duração real.
- Comparação com o Somativo de Flutter, que depende de confirmar o tema e a experiência do grupo.

## Limites das verificações

Bundle Web e bundle Android aprovam compilação; não substituem a abertura e navegação em aparelho real. O teste RLS prova autenticação e isolamento de linhas; não prova a experiência visual de sincronização entre dispositivos nem o comportamento sem rede.
