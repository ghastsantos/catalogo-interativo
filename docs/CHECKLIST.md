# Checklist antes da entrega

Os itens abaixo começam pendentes porque exigem execução real ou informação do grupo.

## Compilação

- [ ] Instalar pacotes, resolver divergências com Expo e salvar package-lock.json.
- [ ] Executar `npm run typecheck`, `npm test` e `npm run export:web`.
- [ ] Executar `npx expo export --platform android`.
- [ ] Abrir o app em Android/iOS e conferir ausência de erros na tela/console.

## RF01–RF03

- [ ] Cadastrar e entrar; visualizar grade com nomes e capas.
- [ ] Rolar até o fim: indicador de próxima página; novos itens; nenhum ID repetido.
- [ ] Puxar para atualizar: voltar à primeira página, sem duplicar itens.
- [ ] Testar capa inexistente e URL de imagem inválida: placeholder.
- [ ] Abrir detalhes de mais de uma série e conferir requisição por ID e título do header.
- [ ] Sinopse sem tags; atributos ausentes com mensagens adequadas.

## RF04–RF08

- [ ] Favoritar nos detalhes e conferir o mesmo estado no card e nas favoritas.
- [ ] Desfavoritar e conferir atualização imediata da lista.
- [ ] Assistida com nota 1, depois 5; lista própria mostra a nota correta.
- [ ] Remover de assistidas sem remover favorita e sem deixar nota residual.
- [ ] Fechar totalmente e reabrir o app: sessão e biblioteca preservadas.
- [ ] Logout: não acessar catálogo pelo botão Voltar.
- [ ] Segunda conta: não ver dados da primeira; voltar à primeira recupera sua biblioteca.
- [ ] Busca por “Dark”; lista de resultados; detalhes abrem o resultado escolhido.
- [ ] Busca inexistente e busca em branco com mensagens distintas.
- [ ] Filtro de gênero afeta apenas os itens carregados/resultados, conforme rótulo.

## RF09–RF10

- [ ] Rede desligada na carga inicial: mensagem e Tentar novamente.
- [ ] Rede desligada na próxima página: manter dados existentes e repetir página após reconectar.
- [ ] Erro de busca/detalhes: mensagem e nova tentativa.
- [ ] Login inválido e login lento: erro amigável e indicador.
- [ ] Favoritos e notas com rótulos de estado corretos no leitor de tela.
- [ ] TalkBack/VoiceOver: navegar por campo, botão, card, estrelas e retorno.
- [ ] Fonte do sistema ampliada: título, botões e descrições sem cortes; grade se adapta.
- [ ] Áreas de toque de pelo menos 44 × 44 pontos; contraste legível.

## Bônus

- [x] Projeto Supabase configurado e migração aplicada.
- [x] Duas contas autenticadas; `npm run test:cloud` aprovou autenticação, leitura/gravação próprias e isolamento RLS.
- [ ] Favoritos/assistidas sincronizados em dois dispositivos.
- [ ] Alteração offline persiste, volta à rede e sincroniza sem perda.
- [x] Sincronização automática e novas tentativas implementadas; o botão manual foi removido.
- [ ] `.env` e credenciais não aparecem em commits, prints ou vídeo.

## Entrega

- [ ] Tema/API diferentes dos usados no Flutter.
- [ ] Repositório público, código disponível e README atualizado.
- [ ] Vídeo YouTube **público**, com 6–9 minutos; todos aparecem e falam.
- [ ] Nome completo de TODOS os integrantes na capa e na apresentação.
- [ ] Disciplina, turma e data preenchidas.
- [x] Link do GitHub público confirmado.
- [x] Link recebido; duração de 6–9 minutos confirmada pelo integrante.
- [ ] Confirmar visibilidade Pública no YouTube.
- [ ] Seis seções do PDF, incluindo tabela RF e comparação real com Flutter.
- [ ] Captura da busca; as seis imagens recebidas incluem cadastro, login, catálogo, detalhes, favoritas e assistidas.
- [ ] Tema técnico e minuto do vídeo indicados.
- [ ] PDF final enviado pelo campo oficial, não por comentário.

O prazo anotado nos documentos é 02/11/2026 e já passou. Confirme com a disciplina como registrar a entrega atrasada.
