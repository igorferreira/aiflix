# Instruções para agentes — aiflix

## Fonte de verdade

- Leia `PRD.md` antes de alterar produto, arquitetura ou escopo.
- O nome oficial é `aiflix`. O PRD v0.3 incorpora a ampliação de escopo solicitada em 14/11/2026.
- Trabalhe e escreva documentação em português brasileiro.
- Preserve alterações existentes. Não invente requisitos, conteúdo publicado ou resultados de validação.

## Produto e escopo

O aiflix oferece cursos e curadoria de aulas externas de IA gratuitamente a qualquer pessoa, com experiência de streaming e vídeos hospedados no YouTube.

O MVP (Spec 001) inclui:

- Home com carrosséis por trilha.
- Página de curso com módulos e aulas.
- Player de aula com embed do YouTube e acesso em tela cheia.
- Progresso local em `localStorage`.
- Catálogo editável em JSON, sem alterações de código para publicar cursos ou trilhas.
- Frontend estático na conta Vercel de Igor, com endereço solicitado `https://aiflix.vercel.app`, e repositório público no GitHub.
- Cursos independentes e learn paths opcionais com cursos ordenados, sem pré-requisito de acesso.
- Administração de learn paths na Spec 007; publicação compartilhada exige autorização no servidor.

Não inclua no MVP login ou contas de alunos, progresso em nuvem, certificados, streaming próprio, busca avançada, gamificação, aplicativo móvel ou cobrança.

O PRD inclui progresso local no MVP e reserva progresso e continuação para a fase 002. Mantenha o registro local básico na Spec 001; detalhe retomada e evolução na Spec 002 antes de ampliar esse comportamento.

## Arquitetura e dados

- Prefira HTML, CSS e JavaScript estáticos. Uma SPA leve é permitida pelo PRD, mas nenhum framework está definido.
- Não introduza backend ou dependências no catálogo público sem necessidade. A administração tem necessidade de publicação compartilhada; definir persistência e autorização server-side antes de implementá-la, conforme Spec 007.
- Use `data/catalog.json` como fonte única do catálogo. A referência abreviada a `catalog.json` no PRD corresponde a esse arquivo.
- Represente trilhas e learn paths como referências a cursos independentes. Cada curso contém módulos e aulas; cada aula possui URL do YouTube, título, duração, descrição e material complementar.
- Use identificadores estáveis para relacionar conteúdo e progresso. Alterações editoriais não devem apagar o progresso salvo.
- Valide dados do catálogo e URLs antes de renderizar. Trate conteúdo como dados, sem injetar HTML não confiável.
- Trate ausência, corrupção ou indisponibilidade do `localStorage` sem impedir acesso aos cursos.
- Use o player incorporado do YouTube. Ofereça link para abrir a aula no YouTube quando o embed estiver indisponível.
- Não baixe nem hospede os vídeos. Inclua no catálogo vídeos próprios ou externos gratuitos já disponíveis no YouTube, com autoria e links originais.
- Mantenha compatibilidade com hospedagem estática, inclusive caminhos de assets e navegação em subdiretórios.

## Catálogo inicial

Preserve as seis trilhas previstas:

1. Nivelamento.
2. Iniciantes.
3. IA para Gestores.
4. IA para Devs.
5. IA para Gerentes de Produto.
6. IA para CIOs e CTOs.

Preserve a meta original de um curso real por trilha até decisão explícita. A nova meta de três módulos exige conteúdo e associação a cursos; não equivale a três cursos nem substitui seis trilhas. Não apresente dados fictícios como conteúdo publicado. A publicação de um curso deve exigir somente edição do JSON e levar menos de 30 minutos.

## Forma de trabalhar

- Faça a menor alteração completa que atende ao pedido e reutilize padrões existentes.
- Registre todos os pedidos em `TASKS.md`, com ID, requisito, status, agente responsável, dependência e evidência. Diferencie responsável planejado de agente efetivamente em execução. Registre decisões relevantes em `docs/adrs/`.
- Organize a evolução pelas fases SDD do PRD: 001 catálogo e player; 002 progresso e continuação; 003 busca e filtros; 004 landing por trilha e SEO; 005 contas e progresso em nuvem; 006 certificados e gamificação; 007 administração e learn paths, priorizada pelo novo pedido.
- Versione specs por `vN` no nome ou cabeçalho.
- Esta pasta é sincronizada pelo Insync/Google Drive e deve permanecer sem `.git`. Não execute `git init` aqui. Versionamento Git deve ficar fora do Drive.
- Vercel e GitHub público foram solicitados. Verifique disponibilidade de `aiflix.vercel.app` e registre URL real; não alegue criação ou deploy só por especificá-los. Identidade visual e persistência administrativa continuam pendentes.

## Qualidade e validação

- Preserve acessibilidade: navegação por teclado, foco visível, rótulos claros e título acessível no iframe.
- Verifique home, curso, seleção de aula, player, fallback para YouTube e persistência de progresso após recarregar.
- Verifique layout em telas pequenas e grandes e erros de catálogo ou armazenamento.
- Para lógica nova não trivial, adicione um teste pequeno que verifique o comportamento.
- Informe o que foi validado e quais verificações ficaram pendentes. Build ou teste local não comprovam deploy nem aceitação dos oito clientes-piloto.

## Documentação técnica atualizada — Context7

Ao consultar uso, sintaxe, configuração, instalação, migração ou problemas específicos de bibliotecas, frameworks, SDKs, APIs, CLIs ou serviços de nuvem, use Context7 MCP, mesmo para tecnologias conhecidas.

1. Comece com `resolve-library-id`, informando a tecnologia e a dúvida. Pule esta etapa somente quando houver um ID exato no formato `/org/project`.
2. Escolha o resultado por correspondência do nome, relevância, quantidade de exemplos, reputação da fonte e pontuação. Use ID de versão quando aplicável; refine a busca se os resultados forem inadequados.
3. Execute `query-docs` com uma pergunta específica por conceito. Combine conceitos somente quando a dúvida for sobre sua interação.
4. Baseie a resposta e as decisões nos documentos recuperados. Prefira Context7 à busca web para documentação de bibliotecas.

Não use Context7 apenas para refatoração, scripts escritos do zero, depuração de regras de negócio, revisão de código ou conceitos gerais de programação. Se estiver indisponível, informe a limitação sem alegar consulta realizada.

## Estado da publicação inicial — 14/11/2026

Repositório público criado: https://github.com/igorferreira/aiflix. Landing de apresentação publicada na conta Vercel de Igor em https://aiflix-topaz-nine.vercel.app. O endereço solicitado aiflix.vercel.app permanece meta bloqueada: Vercel retornou HTTP 400 `alias_in_use`. Somente `public/` é servido; arquivos de documentação ficam fora da saída estática. Esta publicação não implementa nem valida cursos, player, três módulos, progresso ou administração. Evidências: `docs/publicacao-2026-11-14.md`.

## Curadoria de conteúdo

Pesquisa de canais de referência de IA no iBest Brasil integra o pedido atual; registrar fontes em `docs/pesquisa-ibest-2026.md`. Distinguir ano, indicação/TOP10, voto popular e academia; não inventar ranking nem tratar popularidade como qualidade didática comprovada. Confirmar canais YouTube e decidir com Igor se as referências orientam produção própria ou embed de terceiros. Não assumir permissão de reutilização ou substituir silenciosamente a premissa de conteúdo próprio. Preparação dos três módulos depende de pesquisa e curadoria, não apenas de URLs fornecidas por Igor.

## Decisão editorial aprovada — 14/11/2026

Igor autorizou explicitamente: “Sim, usar vídeos externos com autoria e links”. O catálogo pode incorporar vídeos gratuitos de terceiros disponíveis no YouTube, com atribuição clara ao autor e links originais. O aiflix organiza a sequência; não reivindica autoria dos vídeos. Não baixar, republicar arquivos ou contornar bloqueio de incorporação. Fontes e metadados devem ser verificáveis; popularidade no iBest não comprova qualidade pedagógica. Esta decisão substitui as restrições anteriores a conteúdo exclusivamente próprio e resolve CUR-02; mantém curadoria, disponibilidade e atribuição como gates de publicação.
