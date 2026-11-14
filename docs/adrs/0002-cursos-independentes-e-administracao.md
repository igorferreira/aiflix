# ADR 0002 — Cursos independentes e publicação administrativa

> Versão: v1 · Data: 14/11/2026 · Status: desenho proposto para atender requisitos solicitados; provedor de backend pendente.

## Contexto

Igor ampliou escopo para cursos gratuitos independentes e administração de learn paths. A estrutura aninhada trilha → cursos dificulta reutilizar curso em múltiplos caminhos. Um editor apenas em navegador não publica dados compartilhados com autorização confiável.

## Decisão

Normalizar catálogo para `schemaVersion: 2`: raiz possui `courses`, `tracks` e `learnPaths`. Trilhas e caminhos referenciam cursos por `courseIds` ordenados. Alunos acessam qualquer curso sem conta e sem pré-requisito. Progresso permanece por ID estável de aula.

Manter HTML/CSS/JavaScript vanilla na interface. Separar leitura pública estática de escrita administrativa confiável. Serviço autenticado e autorizado valida e persiste rascunhos, resolve concorrência por revisão e publica atomicamente o snapshot público. Definir serviço e fluxo de geração do artefato antes da implementação; nenhuma escolha de provedor ou framework é inferida desta decisão.

Frontend será publicado na conta Vercel de Igor, com endereço solicitado `https://aiflix.vercel.app`, condicionado à disponibilidade e verificação real. Repositório GitHub será público, com checkout Git fora do Drive. Esses destinos foram solicitados, não comprovados por esta ADR.

## Alternativas

- Duplicar cursos dentro de cada trilha: rejeitado por inconsistência e duplicação de progresso.
- Admin com senha no JavaScript e dados em localStorage: rejeitado; não autoriza nem publica globalmente.
- Editor que exporta JSON: pode ser ferramenta manual futura, mas não atende publicação administrativa compartilhada.
- Migrar tudo para framework/backend: não há necessidade demonstrada para o leitor público; decidir somente o serviço de escrita necessário.

## Consequências e revisão

Schema v1 deixa de ser contrato alvo; preservar IDs em eventual conversão. Rascunhos ficam fora do snapshot público. Serviço e secrets não podem ser publicados no repositório ou nos assets. Custos de operação precisam ser avaliados: gratuito para aluno não implica custo zero de hospedagem.

ADR 0001 continua válida para leitor público e stack; sua restrição sem backend fica limitada à Spec 001. Spec 007 necessita serviço de escrita; antes de construir, ADR complementar deve escolher autenticação, armazenamento e executor de publicação, com testes de autorização e evidência em dois navegadores.
