# Revisão PWA — IAFLIX

Versão v1 · 16/11/2026 · Responsável efetivo: root / DevSquad.

## Resultado

O IAFLIX publicado em https://iaflix.vercel.app/ não possui configuração PWA. A revisão não implementou nem publicou alterações de aplicação.

## Evidências

- Home em HTTPS retorna HTTP 200, mas não contém link de manifest.
- `/manifest.webmanifest`, `/manifest.json` e `/sw.js` retornam HTTP 404.
- Busca no código público e scripts não encontrou manifest, registro de service worker, `beforeinstallprompt` ou `apple-touch-icon`.
- `public/index.html` possui apenas favicon SVG; faltam ícones de instalação e metadados próprios de aplicativo.

## Interpretação

HTTPS atende um requisito, mas o site não oferece o manifest necessário para promoção de instalação como PWA. Alguns navegadores permitem adicionar qualquer site à tela inicial; isso não comprova configuração PWA. Service worker não é requisito universal de instalação e sua ausência, isoladamente, não determina o resultado.

Fonte consultada via Context7: [MDN — Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

## Trabalho pendente

PWA-02: definir e implementar manifest com nome IAFLIX, identificador estável, start_url, scope, display standalone e ícones adequados; integrar HTML e páginas compartilháveis conforme necessário. Definir comportamento offline antes de adicionar service worker: não armazenar respostas administrativas nem prometer vídeos YouTube offline. Validar instalação e abertura em Android e iOS reais. A instalação web não exige aplicativo móvel nativo.

## Limites

Inspeção de código e respostas HTTP em produção. Nenhuma instalação em aparelho físico, inspeção de registros antigos em navegadores de usuários ou teste de uso offline foi realizada.
