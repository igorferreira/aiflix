# ADR 0003 — Administração com Vercel Functions e armazenamento editorial privado

> Versão: v1 · Data: 14/11/2026 · Status: decisão para implementação; provisionamento e validação de produção pendentes.

## Contexto

Specs 001 e 007 exigem cursos públicos independentes e publicação administrativa compartilhada, sem expor rascunhos. O GitHub do projeto é público. O frontend permanece HTML/CSS/JavaScript vanilla. Não há necessidade de framework, banco relacional ou SDK para os poucos caminhos editoriais do MVP.

## Decisão

Executar endpoints JavaScript em Vercel Functions, usando Node.js e `fetch` nativo. Arquivos: `api/session.js`, `api/catalog.js` e `api/admin/[...segments].js`; código compartilhado de servidor em `lib/`. Persistir estado editorial em **um repositório privado separado**, proposto `igorferreira/aiflix-editorial`, arquivo `state.json`, branch `main`. Esse repositório precisa ser provisionado antes da ativação. Nunca armazenar rascunhos, auditoria, hashes de senha ou credenciais no repositório público do aplicativo.

Servidor consulta metadados do repositório e recusa armazenamento que não seja privado. O token deve ser fine-grained, limitado ao repositório editorial, com Contents read/write e Metadata read. Não reutilizar token pessoal amplo, token do CLI ou token de conector. Não registrar headers de autenticação nem corpos contendo senha. Segredos configurados somente nas variáveis de ambiente do servidor.

Estado único: `{schemaVersion:1, paths:[], publishedCatalog:<schema2>, audit:[]}`. `paths` guarda versões editoriais/rascunhos; `publishedCatalog` é o snapshot integral validado da Spec 001. O arquivo é atualizado pela GitHub Contents API enviando o SHA lido, evitando sobrescrita concorrente. `409` ou conflito de SHA não causam retry cego: cliente precisa recarregar e reconciliar. Falha de escrita preserva estado público anterior. Validar todo estado na leitura, inclusive snapshot; arquivo inválido gera 503, nunca inicialização silenciosa sobre dados existentes.

Uma publicação valida referências e revisão esperada, troca o learn path correspondente em `publishedCatalog.learnPaths`, incrementa revisão editorial, marca `published` e grava estado inteiro em uma única operação CAS. Apenas após persistência confirmada retornar 200. Editar caminho publicado cria rascunho, mas mantém snapshot anterior. Repetir publicação com revisão antiga retorna 409. Publicação não depende de commit no repositório do aplicativo nem de novo deploy.

GET `/api/catalog` retorna exclusivamente `publishedCatalog`. A URL pública canônica `data/catalog.json` é encaminhada para esse endpoint por rewrite da Vercel, preservando contrato do leitor. Sem armazenamento configurado, o endpoint pode servir catálogo bootstrap lido do artefato `public/data/catalog.json`. Com armazenamento configurado, falha de acesso não pode cair silenciosamente no bootstrap e esconder conteúdo publicado. Em servidor estático local, catálogo bootstrap continua diretamente acessível. Respostas públicas e administrativas usam `Cache-Control: no-store` no MVP para evitar rascunhos em cache e atraso de publicação. Nunca incluir `paths`, auditoria ou metadados de autenticação na resposta pública.

## Autenticação e autorização

MVP tem um único operador administrativo pré-autorizado. Não oferece cadastro nem contas de alunos. Login recebe senha apenas em HTTPS; servidor compara hash scrypt com `timingSafeEqual`, nunca senha em texto claro de configuração. Provisionar senha aleatória de pelo menos 32 bytes, entregue ao operador por canal de segredo, e armazenar somente `ADMIN_PASSWORD_HASH=scrypt$saltHex$hashHex`. A senha não deve ser curta ou reutilizada. Parâmetros de scrypt precisam ser fixados na implementação e no script de configuração; proposta Node defaults N=16384,r=8,p=1, salt aleatório 16 bytes e derivação de 64 bytes. Limitar senha recebida a 1024 caracteres e login JSON a 16 KiB; demais mutações aceitam no máximo 256 KiB.

Sessão assinada com HMAC-SHA256 usando `ADMIN_SESSION_SECRET` aleatório de pelo menos 32 bytes. Payload possui `role:admin`, emissão e expiração de 8 horas. Cookie `aiflix_admin`, Path=/api, HttpOnly, Secure, SameSite=Strict. Não retornar token de sessão em JSON nem persistir em localStorage. DELETE de sessão expira cookie; rotação do segredo revoga todas as sessões. Logout não revoga individualmente cópia roubada do cookie antes da expiração; esta limitação exige sessões persistidas se houver múltiplos operadores ou requisito de revogação imediata.

Toda operação administrativa exige sessão válida e papel admin. Ausência/invalidez gera 401; papel diferente gera 403. Mutação, incluindo login/logout, exige `Origin` exatamente igual a `ADMIN_ORIGIN`; negar origem ausente ou divergente com 403. Não habilitar CORS. Erros de configuração negam acesso com 503 e mensagem genérica. Para desenvolvimento local, permitir cookies sem Secure somente no runner local explícito; produção nunca deriva essa decisão de header enviado pelo cliente.

A senha de alta entropia reduz risco de adivinhação; configurar rate limiting de login antes de expor produção. Rate limit só em memória de Function não constitui proteção distribuída. Não expor login público com senha humana fraca enquanto esse controle estiver pendente. Métodos não suportados retornam 405 com Allow.

## Auditoria e limites

Gravar junto da publicação data ISO, ator lógico `admin`, ID, revisão e resultado confirmado; sem senha, IP, e-mail ou token. Manter as últimas 100 publicações no estado corrente. Git preserva histórico anterior: isso não representa exclusão física por prazo. Exclusão de histórico exige procedimento separado se dados pessoais forem introduzidos. Falhas podem ser registradas em logs operacionais sem conteúdo sensível; nenhuma falha responde sucesso de publicação.

Armazenamento adequado a um editor e catálogo pequeno (limite de estado 500 KiB). Sem banco, SDK ou custo contratado novo nesta decisão. Operação está sujeita aos limites e termos dos planos GitHub/Vercel existentes; verificar disponibilidade antes da ativação. Reavaliar banco transacional e autenticação gerenciada quando houver múltiplos editores, alto volume, necessidade de papéis ou revogação individual. Não acrescentar criptografia própria de rascunhos em Git público: repositório privado evita complexidade de rotação e exposição permanente de ciphertext.

## Variáveis de ambiente e dependências

- `ADMIN_PASSWORD_HASH`: hash scrypt no formato acima, segredo.
- `ADMIN_SESSION_SECRET`: segredo HMAC aleatório.
- `ADMIN_ORIGIN`: origem HTTPS exata da publicação pública, sem caminho ou barra final.
- `EDITORIAL_GITHUB_TOKEN`: token fine-grained exclusivo do repositório privado.
- `EDITORIAL_GITHUB_REPOSITORY`: `owner/repository`, configuração de servidor.
- `EDITORIAL_GITHUB_BRANCH`: branch; padrão `main`.

Sem esses insumos, UI pode ser desenvolvida e contratos testados com substitutos, mas gravação administrativa real deve permanecer indisponível. Bootstrap editorial inicial contém catálogo validado e arrays vazios; não presumir que arquivo 404 é permissão para sobrescrever estado. Inicialização deve ser ação explícita de provisionamento.

## Referências consultadas via Context7

- https://docs.github.com/en/rest/repos/contents — GET e PUT com SHA, conflitos e token restrito.
- https://vercel.com/docs/project-configuration/vercel-json — rewrites e outputDirectory.
- https://vercel.com/docs/frameworks/frontend/gatsby — forma básica de handler request/response; a implantação sem framework deverá ser validada no host real.

Contrato: `specs/openapi-admin.json`. Decisão não comprova provisionamento, funcionamento dos endpoints ou aceite de QA.
