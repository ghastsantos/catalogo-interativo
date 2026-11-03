# Registro de validação — 02/11/2026

## Executado neste ambiente

- Compilação estrita do domínio com TypeScript 5.8.3 disponível no ambiente: **aprovada**. O projeto declara TypeScript 6.0.3, cujo pacote ainda não pôde ser instalado.
- `node scripts/test.cjs`, usando o TypeScript disponível no ambiente: **25 testes; 25 passaram; 0 falharam**.
- Análise sintática/transpilação isolada de 31 arquivos `.ts`/`.tsx`: **sem erros sintáticos**.
- Conferência de imports relativos: **nenhum arquivo ausente**.
- Cálculo de contraste de seis pares estáticos de cores: aprovados nos limites de texto (4,5:1) e borda (3:1); valores em `contraste-pares-estaticos.json`. Isso não é auditoria da interface renderizada.
- Revisão estática do SQL, isolamento por usuário, cancelamento de requisições e caminhos dos RF.

Os testes verificam deduplicação de páginas, filtro, limpeza de HTML, validação de credenciais, comparação de bytes, favoritas, assistidas, notas, serialização, validação dos dados persistidos, conciliação remota e preservação de uma edição durante a sincronização.

## Tentado, mas bloqueado

A consulta ao registro npm falhou com `Could not resolve host: registry.npmjs.org`. A ferramenta alternativa de download também falhou. Sem os pacotes, não foi possível executar Metro, a aplicação ou uma compilação completa usando os tipos reais das dependências.

## Ainda não executado

- `npm install` / geração do lockfile.
- `npm run typecheck` sobre o aplicativo completo.
- `npx expo install --check` e exportação dos bundles web/Android.
- Abertura no Expo Go, emulador ou aparelho real.
- Testes de interface, rolagem, gesto de refresh e telas com rede real.
- TalkBack, VoiceOver, auditoria do contraste na interface renderizada e fonte do sistema ampliada.
- Autenticação real, banco Supabase e teste de RLS com duas contas.
- Pipeline GitHub Actions: arquivo preparado, mas sem execução remota.

**Conclusão:** há código e testes de domínio, não uma certificação de funcionamento de ponta a ponta. Não afirmar que o app foi testado no celular nem que os bônus estão ativos. Consulte o checklist e atualize este relatório após cada teste real.
