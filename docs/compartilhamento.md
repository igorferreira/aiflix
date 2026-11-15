# Compartilhamento direto de cursos

> Versão: v1 · Data: 15/11/2026 · Responsável: course_sharing.

## Decisão

Cada curso possui uma página pública em `https://iaflix.vercel.app/cursos/<id>/`. Os fragmentos `#/curso/<id>` continuam funcionando para navegação no aplicativo, mas não identificam páginas diferentes para quem busca metadados de compartilhamento. Por isso a página compartilhável contém HTML completo, título, descrição, canonical, Open Graph e Twitter Card antes de executar qualquer JavaScript.

A página apresenta capa, descrição, estado real e aulas disponíveis; “Abrir curso” leva à interface interativa. O botão de WhatsApp abre o compositor com título e link já preenchidos. Não envia mensagem automaticamente. Cursos em preparação continuam identificados como sem aulas; nenhuma página anuncia conteúdo inexistente.

## Arquivos e operação

- `public/assets/js/share.js`: `courseShareUrl(id)` e `whatsappUrl(course)`, usados também pela interface principal.
- `scripts/generate-course-pages.mjs`: valida e lê `public/data/catalog.json`, escapa dados editoriais e gera `public/cursos/<id>/index.html`.
- `npm run build`: regenera as páginas. Vercel executa esse comando mantendo saída em `public/`.
- Cada imagem social é PNG de 1200 × 630 em `public/assets/images/course-<id>.png`; a URL é HTTPS absoluta nos metadados.
- Logo e CSS continuam locais, sem código inline ou dependências novas de produção.

Ao editar título, descrição ou estado de um curso, regenere e publique. Novos cursos exigem também sua capa social nesse padrão de nome. O build lê o catálogo versionado de bootstrap; após ativar persistência editorial remota, alterações de metadados de cursos exigirão sincronizar esse catálogo e reconstruir as páginas. A administração atual edita caminhos de aprendizagem, não cursos.

## Links preparados

- https://iaflix.vercel.app/cursos/introducao-ia/
- https://iaflix.vercel.app/cursos/regressao-linear/
- https://iaflix.vercel.app/cursos/arvore-decisao/
- https://iaflix.vercel.app/cursos/harness/
- https://iaflix.vercel.app/cursos/gerencia-contexto/
- https://iaflix.vercel.app/cursos/memoria-ia/
- https://iaflix.vercel.app/cursos/agentes-ia/

## Validação e limites

Testes automatizados verificam URLs sem hash, encoding do compositor, sete páginas com metadados, títulos editoriais escapados, cursos em preparação sem links fictícios de aula e resposta HTML no servidor local. `npm test`: 24 testes aprovados nesta etapa. A existência dos arquivos PNG e a publicação serão verificadas pela raiz após concluir as capas.

Não foi enviada mensagem nem executada prévia dentro do WhatsApp. A renderização final e o cache de prévias dependem do cliente WhatsApp; uma atualização pode não aparecer imediatamente para links já compartilhados. A página e a imagem precisam responder publicamente sem login. Não afirmar que o cache do WhatsApp foi limpo apenas por publicar metadados.

Documentação de build consultada via Context7: https://vercel.com/docs/project-configuration/vercel-json e https://vercel.com/docs/builds/configure-a-build.

## Capas finais e revisão

As sete capas finais são ilustrações originais geradas com imagegen, com título e marca vetorial aplicados na exportação PNG1200x630. A atribuição a Diogo Cortiz nas três aulas é mantida no catálogo e nas capas; não indica autoria das ilustrações nem parceria com o autor. Os quatro cursos restantes continuam em preparação. O snapshot editorial privado foi sincronizado com as capas finais.

Teste adicional confirma assinatura PNG, dimensões reais e vínculo da capa para cada curso. Resultado final: 25 testes Node aprovados; UX registrou 56 verificações de navegador e review independente aprovou sem bloqueantes.

## Validação de produção — 15/11/2026

Commit `d013294f96be2eb4e8cb4f901366d683d1941e3b`, deployment `dpl_8Vv1L2SvRzgmMk643Jv8KcXvhVRy` READY. Alias https://iaflix.vercel.app atualizado. As sete páginas responderam HTTP200, com título, URL canônica social e PNG público1200x630 corretos. Verificadas assinatura, MIME e dimensões de cada imagem remota. O endereço /cursos/harness/ no alias também respondeu ao user-agent facebookexternalhit com OpenGraph estático correto, sem login nem execução de JavaScript.

Não houve envio de mensagem ou validação dentro do aplicativo WhatsApp. O user-agent não substitui esse aceite; a prévia final e seu cache dependem do cliente. Histórico pessoal do YouTube continua no backlog por decisão de Igor.
