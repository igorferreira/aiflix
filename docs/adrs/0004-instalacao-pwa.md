# ADR 0004 — Instalação web IAFLIX

Status: aceita · v1 · 23/11/2026

Manifest estático com identidade estável, start_url e scope relativos, display standalone, ícones PNG 192 e 512 pixels. Ícone Apple 180 pixels e metadados na home e páginas sociais. Reutiliza símbolo oficial, sem dependências e sem alterar progresso ou autenticação.

Não adicionar service worker: instalação não o exige e cache offline não foi solicitado. Catálogo, administração e vídeos exigem rede.

Fonte consultada via Context7: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable

Validar manifest, dimensões PNG, referências na home e cursos, MIME e publicação HTTPS. Aceite em aparelhos físicos permanece separado. Android: menu do Chrome, Instalar aplicativo. iPhone: Compartilhar no Safari, Adicionar à Tela de Início. Oferta e texto dependem do navegador.
