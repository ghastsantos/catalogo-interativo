# Executar pelo celular

Este guia pressupõe que o código já esteja publicado em um repositório acessível à sua conta. O ambiente usado para preparar o projeto não conseguiu baixar os pacotes; estas instruções ainda precisam ser executadas e verificadas na sua conta.

## 1. Repositório

No navegador do celular, abra https://github.com/new com a conta **ghastsantos**. Crie `catalogo-interativo`, público, com um README inicial. A integração desta conversa pode enviar arquivos para repositórios autorizados, mas não expõe a ação de criar o repositório.

Se o repositório não aparecer no conector, revise quais repositórios a instalação do GitHub permite acessar. Não envie senha, token pessoal ou código de autenticação pelo chat.

## 2. Ambiente remoto

No repositório, abra **Code → Codespaces → Create codespace on main**. O navegador móvel pode exigir “Versão para computador”. O arquivo `.devcontainer/devcontainer.json` prepara Node 22 e a instalação dos pacotes.

No terminal do Codespaces:

```bash
# Execute somente se a instalação automática não terminou:
npm install
npx expo install --fix

cp .env.example .env
npm run check
npm run web
```

Na aba **Ports**, abra a porta **8081** pelo link encaminhado. Comece com a porta privada. Isso executa a versão web e permite encontrar erros iniciais, mas **não substitui o teste do app nativo**. Não feche o terminal enquanto estiver usando o servidor.

Depois da instalação, confira o `package-lock.json`, rode novamente os testes e salve-o no repositório. A primeira instalação resolve as faixas de versões; o lockfile permite repetir essa resolução.

## 3. Aplicativo nativo

Verifique o Expo Go compatível com **SDK 57** em https://expo.dev/go. Não ignore um erro de incompatibilidade de SDK: uma instalação compatível ou development build será necessária. Uma versão de Expo Go disponível na loja pode não atender ao SDK escolhido.

Pare o servidor web com Ctrl+C. Execute:

```bash
npx expo start --tunnel
```

A CLI pode pedir a instalação do componente de túnel; revise e aceite. Abra o endereço `exp://...` informado no terminal no Expo Go. Como o QR está no mesmo celular, copie o endereço em vez de tentar filmar a própria tela.

Para iOS, a documentação do Expo exige, quando aplicável, a mesma conta na CLI e no Expo Go:

```bash
npx expo login
```

Digite suas credenciais apenas na interface oficial/terminal da sua sessão, nunca no chat. O túnel é temporário e precisa do Codespace ativo. Não é uma hospedagem permanente.

## 4. Conferir antes de gravar

Cadastre uma conta de teste, navegue, favorite e marque uma série como assistida com nota. Feche e reabra o app. Faça logout e confira que o botão Voltar não abre novamente o catálogo. Teste outra conta para verificar o isolamento.

Siga `CHECKLIST.md`. Salve seis capturas reais: login, catálogo, detalhes, busca, favoritas e assistidas.

## 5. Evitar consumo desnecessário

Codespaces depende das permissões e da cota da sua conta. Confira a tela de uso/cobrança antes de contratar qualquer capacidade adicional. Ao terminar, pare o Codespace. Nenhum serviço pago foi contratado por este projeto.

Referências: https://docs.github.com/en/codespaces/developing-in-a-codespace/forwarding-ports-in-your-codespace e https://docs.expo.dev/get-started/start-developing/
