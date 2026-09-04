# Ativar a área técnica no Netlify

O site público permanece aberto. A página `/login/` é pública; o conteúdo de `/area-tecnica` só é entregue após validação da sessão pelo Netlify Identity. Não há senha ou link privado no repositório.

## Configuração obrigatória

1. No projeto do site no Netlify, abra **Identity** e habilite o serviço.
2. Em **Registration > Registration preferences**, selecione **Invite only**. Não habilite cadastro público nem provedores externos.
3. Em **Users**, convide apenas seu próprio e-mail. Abra o convite recebido para definir uma senha exclusiva (mínimo 12 caracteres).
4. No usuário convidado, atribua a função (role) **admin**. Depois de alterar a função, saia e entre novamente.
5. Nas variáveis de ambiente do projeto, configure **ADMIN_EMAIL** com o e-mail exato da conta convidada e **INSTALLERS_DRIVE_URL** com o endereço HTTPS da pasta do Google Drive (`https://drive.google.com/drive/folders/...`). Disponibilize essas variáveis para **Functions**, no contexto de produção. A variável **URL** é fornecida pelo Netlify. Nunca coloque senhas nessas variáveis nem envie arquivos `.env` ao GitHub.
6. Faça um novo deploy após salvar as variáveis. Confirme que o build utiliza `node scripts/build.mjs`, a pasta publicada é `dist` e a versão do Node é 22.12 ou superior (o arquivo netlify.toml define Node 22).
7. No Google Drive, mantenha a pasta como **Restrito**, acessível somente pela sua conta. Um link público no Drive não passa a ser privado por estar neste painel.

Sem ADMIN_EMAIL ou configuração da hospedagem, a área responde como indisponível e não expõe o conteúdo. Sem a função admin e e-mail correspondente, a conta recebe acesso negado. Caso tenha custos ou limites no seu plano Netlify, confirme-os no painel antes de ativar serviços adicionais.

## Verificação após ativar

- Em janela anônima, abrir `/area-tecnica` e `/.netlify/functions/private-area`: deve levar ao login, sem mostrar o link do Drive.
- Entrar com sua conta confirmada e com role admin: o painel deve abrir.
- Uma conta diferente, mesmo autenticada, deve receber acesso negado.
- Testar o convite, recuperação de senha e botão Sair. Depois de sair, recarregar o painel deve exigir login.
- Abrir o link do Drive em janela anônima: os instaladores não devem estar disponíveis sem sua conta Google.

## Desenvolvimento

Instalar as dependências com pnpm e executar `pnpm test` e `pnpm build`. O build publica apenas os arquivos listados em scripts/build.mjs. O código da função, testes e documentação não são copiados para a pasta pública. A autenticação real depende do ambiente Netlify e deve ser testada após configurar Identity.

Referências: https://docs.netlify.com/manage/security/secure-access-to-sites/identity/get-started/ e https://docs.netlify.com/manage/security/secure-access-to-sites/identity/registration-login/
