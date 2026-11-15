# Aceite da implementação — catálogo, cursos e administração

> Versão: v1 · Data: 14/11/2026 · Responsável: devsquad-po.
> Fontes: PRD v0.3, Spec 001 v2, Spec 007 v1 e pedido de implementação de Igor.

## Objetivo e escopo do MVP

Permitir que qualquer pessoa encontre e assista gratuitamente a cursos independentes de IA, enquanto administradores organizam caminhos de aprendizagem opcionais. A entrega técnica e a disponibilidade de conteúdo real são gates separados.

Dentro: catálogo por dados, seis trilhas previstas, cursos e aulas, player YouTube com fallback, conclusão manual local, learn paths publicados e administração autenticada para criar, editar, ordenar, pré-visualizar e publicar caminhos compartilhados. Três módulos reais são a meta de conteúdo inicial; não significam três cursos nem substituem a cobertura original de seis trilhas.

Fora: contas de alunos, pagamento, progresso em nuvem, retomada por timestamp, certificados, busca avançada, gamificação, aplicativo móvel, hospedagem própria de vídeo e formulário administrativo de edição de cursos. Cursos continuam cadastrados pelo contrato JSON.

## Histórias prioritárias e BDD

Todas são P0 para a entrega solicitada. Os IDs abaixo agrupam os critérios das specs sem substituí-los.

| ID | História | Critérios de aceite |
|---|---|---|
| AC-01 | Como aluno, quero descobrir cursos para escolher o que aprender. | Dado catálogo válido, quando abrir a home, então verei cursos independentes e agrupamentos na ordem editorial. Dado curso sem agrupamento, quando abrir seu link, então ele estará acessível gratuitamente e sem conta. |
| AC-02 | Como aluno, quero assistir às aulas para acompanhar um curso. | Dado curso válido, quando selecionar aula, então título, descrição, duração e materiais corresponderão ao catálogo; player permitirá reprodução e tela cheia, sem autoplay, e manterá link para YouTube. Dada rota inválida, quando acessá-la, então haverá estado não encontrado e retorno ao catálogo. |
| AC-03 | Como aluno, quero marcar conclusão para acompanhar meu avanço. | Dada uma aula, quando marcar ou desmarcar e recarregar, então o estado persistirá no mesmo navegador quando armazenamento funcionar. Dado armazenamento bloqueado ou corrompido, quando usar o curso, então navegação e player continuarão disponíveis com aviso de progresso temporário. |
| AC-04 | Como aluno, quero seguir caminhos sem perder liberdade de escolha. | Dado curso presente em dois caminhos, quando acessá-lo por qualquer um, então URL, conteúdo e progresso serão os mesmos. Dada ordem recomendada, quando abrir qualquer curso diretamente, então nenhuma conclusão anterior será exigida. |
| AC-05 | Como administrador, quero preparar caminhos para organizar cursos existentes. | Dado acesso administrativo autorizado, quando criar, editar e reordenar um rascunho e recarregar, então a versão persistida será recuperada. Dado visitante anônimo, quando consultar ou alterar rascunhos, então o serviço negará acesso. Dado autenticado sem permissão administrativa, quando tentar mutação, então o serviço negará acesso. |
| AC-06 | Como administrador, quero publicar caminhos para disponibilizá-los a todos. | Dado rascunho válido, quando publicar com sucesso, então outro navegador anônimo verá somente a versão publicada. Dada edição concorrente, quando salvar revisão antiga, então haverá conflito sem sobrescrever dados recentes. Dada falha de publicação, quando consultar catálogo público, então a versão anterior permanecerá íntegra. |
| AC-07 | Como usuário, quero usar os fluxos com segurança e acessibilidade. | Dado teclado como entrada, quando navegar, selecionar aulas, concluir e ordenar cursos no admin, então controles estarão rotulados e foco permanecerá previsível. Dadas larguras 320, 768 e 1440px, quando percorrer fluxos, então não haverá overflow global. Dados ou URLs inválidos não executarão HTML nem código. |
| AC-08 | Como responsável editorial, quero publicar conteúdo real para oferecer aprendizado confiável. | Dados os três módulos candidatos, quando aprovar o lançamento, então cada módulo terá curso de destino, objetivos, aulas, autoria, URLs reais e reprodução verificada. Dadas referências iBest, quando citadas, então ano, categoria e modalidade serão comprovados sem inventar ranking. |

Rastreabilidade: AC-01–04 cobrem CA01–CA06 e CA13–CA14; AC-05–06 cobrem LP01–LP07; AC-07 cobre CA07–CA09, CA12 e LP08; AC-08 cobre CA10, CA15 e curadoria do PRD. CA11 (oito pilotos) e CA16 (infraestrutura real) continuam gates separados.

## Dependências e bloqueios reais

- Conteúdo externo: Igor autorizou explicitamente vídeos externos com autoria e links. O catálogo inicial contém três recortes da sequência de Diogo Cortiz, com metadados verificados pela raiz. Não apresentar autoria de terceiros como própria nem afirmar reprodução integral validada.
- Curadoria: confirmar canais oficiais, aulas gratuitas, sequência, metadados, atribuição e disponibilidade de embed. TOP10 iBest não comprova qualidade pedagógica nem autorização de reutilização.
- Administração: arquiteto deve definir autenticação, persistência compartilhada, publicação e administrador inicial antes da escrita. Interface local ou armazenamento em navegador não comprovam administração funcional.
- Publicação: acesso público efetivo e associação permanente do alias `iaflix.vercel.app` precisam ser validados pela raiz. Criação de alias não comprova acesso anônimo.

Essas dependências não impedem implementar e testar catálogo, navegação, progresso e contratos usando fixtures isoladas. Catálogo de produção vazio deve exibir estado honesto enquanto conteúdo não for aprovado.

## Regra de conclusão

QA deve emitir APROVADO ou REPROVADO com evidências por critério e escopo testado; review vem depois do QA. Não chamar produto completo se cursos reais, administração compartilhada ou acesso público permanecerem bloqueados. Registrar testes técnicos, conteúdo, deploy e feedback dos pilotos separadamente.
