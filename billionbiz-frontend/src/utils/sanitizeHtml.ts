/**
 * Allowlist sanitizer for merchant-authored rich HTML rendered on public pages.
 * It intentionally strips scripts, executable embeds, inline styles and all
 * event attributes. Layout and colours must come from registered theme tokens.
 */
const ALLOWED_TAGS = new Set([
  'a', 'address', 'article', 'aside', 'blockquote', 'br', 'caption', 'code',
  'dd', 'del', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure', 'h1', 'h2',
  'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 's',
  'small', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot',
  'th', 'thead', 'tr', 'u', 'ul'
]);

const DROP_WITH_CONTENT = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea',
  'select', 'option', 'button', 'link', 'meta', 'base', 'svg', 'math', 'video',
  'audio', 'source', 'canvas', 'template', 'noscript'
]);

const SAFE_GLOBAL_ATTRIBUTES = new Set(['title', 'role', 'aria-label', 'lang', 'dir']);

const isSafeNavigationUrl = (value: string): boolean => {
  const url = value.trim();
  return /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(url) &&
    !/^[\s]*javascript:/i.test(url) &&
    !/[\u0000-\u001f]/.test(url);
};

const isSafeImageUrl = (value: string): boolean => {
  const url = value.trim();
  return /^(https?:\/\/|\/)/i.test(url) &&
    !url.startsWith('//') &&
    !/[\u0000-\u001f]/.test(url);
};

function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeHtml(value: unknown): string {
  const html = typeof value === 'string' ? value : '';
  if (!html) return '';

  // Fail closed in non-browser rendering environments.
  if (typeof document === 'undefined') return escapeText(html);

  const template = document.createElement('template');
  template.innerHTML = html;

  const sanitizeChildren = (parent: ParentNode): void => {
    Array.from(parent.childNodes).forEach((node) => {
      if (node.nodeType === Node.COMMENT_NODE) {
        node.parentNode?.removeChild(node);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const element = node as HTMLElement;
      const tag = element.tagName.toLowerCase();

      if (DROP_WITH_CONTENT.has(tag)) {
        element.remove();
        return;
      }

      sanitizeChildren(element);

      if (!ALLOWED_TAGS.has(tag)) {
        const fragment = document.createDocumentFragment();
        while (element.firstChild) fragment.appendChild(element.firstChild);
        element.replaceWith(fragment);
        return;
      }

      Array.from(element.attributes).forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const attributeValue = attribute.value;

        if (SAFE_GLOBAL_ATTRIBUTES.has(name)) return;

        if (tag === 'a' && name === 'href' && isSafeNavigationUrl(attributeValue)) return;
        if (tag === 'a' && name === 'target' && attributeValue === '_blank') return;
        if (tag === 'img' && name === 'src' && isSafeImageUrl(attributeValue)) return;
        if (tag === 'img' && ['alt', 'width', 'height'].includes(name)) return;
        if (tag === 'td' && ['colspan', 'rowspan'].includes(name) && /^\d{1,2}$/.test(attributeValue)) return;
        if (tag === 'th' && ['colspan', 'rowspan', 'scope'].includes(name)) return;
        if (tag === 'ol' && name === 'start' && /^\d{1,4}$/.test(attributeValue)) return;

        element.removeAttribute(attribute.name);
      });

      if (tag === 'a' && element.getAttribute('target') === '_blank') {
        element.setAttribute('rel', 'noopener noreferrer');
      }
      if (tag === 'img') {
        element.setAttribute('loading', 'lazy');
        element.setAttribute('decoding', 'async');
      }
    });
  };

  sanitizeChildren(template.content);
  return template.innerHTML;
}
