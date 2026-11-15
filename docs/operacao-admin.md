# Operação administrativa

> Estado inicial: implementação em andamento; produção depende de provisionamento seguro e QA.

## Execução local

Node.js 24 e nenhuma dependência de produção. Execute `npm test` para testes de contrato e `npm run dev` para servir a aplicação e as mesmas funções usadas na Vercel em `http://127.0.0.1:3000`.

Sem configuração editorial, o catálogo público usa o JSON de bootstrap. Administração retorna indisponibilidade, sem simular publicação local. Configuração parcial também não pode habilitar escrita. Com armazenamento configurado, falhas do serviço retornam erro em vez de esconder problemas com um catálogo antigo.

## Configuração de produção

Configure os nomes de `.env.example` no ambiente protegido da Vercel, nunca em arquivos públicos. O token deve ser fine-grained, restrito ao repositório privado `igorferreira/aiflix-editorial`, com leitura de metadados e leitura/escrita de conteúdo. Tokens pessoais amplos usados para desenvolvimento não são credenciais do aplicativo.

A senha administrativa é transformada em scrypt pelo utilitário `scripts/hash-admin-password.mjs`, com entrada por stdin. Não informe senha em argumento de comando nem publique seu hash. `ADMIN_SESSION_SECRET` deve ser aleatório e independente, com pelo menos 32 bytes de entropia. `ADMIN_ORIGIN` corresponde à origem HTTPS pública exata; mude-a junto ao domínio e teste novamente CSRF e sessão.

Antes de ativar login, configure limitação durável de tentativas no host para `POST /api/session`. Somente após verificar essa proteção, defina `ADMIN_LOGIN_PROTECTION=platform`. Esse valor declara uma dependência operacional; não cria a regra do firewall. Administração deve permanecer fechada enquanto o gate não estiver atendido.

O estado privado `state.json` deve ser inicializado a partir do catálogo real aprovado, com `schemaVersion: 1`, `paths: []`, `publishedCatalog` schema 2 e `audit: []`. Não copie rascunhos ou auditoria para o repositório público. O script `scripts/seed-editorial-state.mjs` prepara esse documento, sem credenciais. Valide o arquivo antes de gravar no repositório privado.

## Publicação e integridade

O GitHub Contents SHA controla concorrência. Rascunhos, versão publicada e registro de publicação compartilham um único documento gravado atomicamente. O endpoint público expõe apenas `publishedCatalog`; o navegador nunca recebe o token editorial, rascunhos ou auditoria.

Ao editar cursos manualmente, atualize a autoridade editorial privada quando ativada; o bootstrap público não substitui esse estado. A cópia de bootstrap serve somente quando não há integração editorial configurada. Cursos referenciados não podem ser removidos sem corrigir referências. Preserve IDs de aulas e progresso.

Trocar `ADMIN_SESSION_SECRET` invalida todas as sessões. Trocar somente a senha não invalida cookies já assinados, que duram até oito horas; para revogação imediata, rotacione também o segredo de sessão. Encerrar sessão remove o cookie do navegador. Não considere ambiente pronto sem teste anônimo, login autorizado, bloqueio de origem indevida, revisão concorrente, falha de armazenamento e publicação visível em outro perfil.

## Pendências externas

O repositório editorial privado foi criado e inicializado pela raiz com seed validado de três cursos e um caminho, commit `ca2b6d1bea5f9507702632eca1a1233bccd6ca81`. A credencial de operador foi usada somente para provisionamento; token restrito e credenciais administrativas do aplicativo ainda não foram fornecidos. A autorização editorial para vídeos externos com autoria e links foi concedida por Igor; a verificação de reprodução e os gates de conteúdo continuam separados da entrega técnica. Nenhuma configuração no código resolve automaticamente o bloqueio do alias Vercel ou aprova vídeos de terceiros.

## Acesso público do deployment

A raiz desativou a proteção de deployment Vercel para a plataforma gratuita e confirmou HTTP 200 em `https://iaflix.vercel.app`, sem login de visitante. O alias requer apontamento ao deployment publicado. Essa configuração de hospedagem não substitui a autenticação administrativa da aplicação: admin permanece protegido por sessão server-side e gate de configuração.
