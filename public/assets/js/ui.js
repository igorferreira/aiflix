export function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

export function link(text, href) {
  const node = el('a', text);
  node.href = href;
  return node;
}

export function button(text, action) {
  const node = el('button', text);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}
