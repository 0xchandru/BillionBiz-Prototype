const DNS_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function normalizeHostname(authority = '') {
  const raw = String(authority).trim().toLowerCase().replace(/\.$/, '');
  if (!raw || raw.includes('/') || raw.includes('@')) return '';
  if (raw.startsWith('[')) return '';
  const colonCount = (raw.match(/:/g) || []).length;
  if (colonCount > 1) return '';
  const hostname = colonCount === 1 ? raw.slice(0, raw.lastIndexOf(':')) : raw;
  if (colonCount === 1) {
    const port = raw.slice(raw.lastIndexOf(':') + 1);
    if (!/^\d{1,5}$/.test(port) || Number(port) > 65_535) return '';
  }
  if (!hostname || hostname.length > 253 || hostname.split('.').some((label) => !DNS_LABEL.test(label))) return '';
  return hostname;
}

export function resolveStoreHost(authority, pathname = '/', rootDomain = 'chandraprakash.codes', reservedSubdomains = []) {
  const hostname = normalizeHostname(authority);
  const root = String(rootDomain).trim().toLowerCase().replace(/^\.+|\.+$/g, '');
  const reserved = new Set(reservedSubdomains.map((item) => String(item).trim().toLowerCase()));
  if (!hostname || !root) return { kind: 'invalid', hostname };
  if (hostname === root) {
    const localPathSlug = pathname.match(/^\/store\/([^/]+)(?:\/|$)/i)?.[1];
    if (hostname === 'localhost' && localPathSlug) return validStoreSlug(localPathSlug, reserved);
    return { kind: 'platform', hostname };
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const localPathSlug = pathname.match(/^\/store\/([^/]+)(?:\/|$)/i)?.[1];
    return localPathSlug ? validStoreSlug(localPathSlug, reserved) : { kind: 'platform', hostname };
  }

  const suffix = `.${root}`;
  if (hostname.endsWith(suffix)) {
    const label = hostname.slice(0, -suffix.length);
    if (!label || label.includes('.')) return { kind: 'invalid', hostname };
    if (reserved.has(label)) return { kind: 'reserved', hostname, subdomain: label };
    return validStoreSlug(label, reserved, hostname);
  }

  if (hostname.endsWith('.localhost')) {
    const label = hostname.slice(0, -'.localhost'.length);
    if (!label || label.includes('.')) return { kind: 'invalid', hostname };
    if (reserved.has(label)) return { kind: 'reserved', hostname, subdomain: label };
    return validStoreSlug(label, reserved, hostname);
  }

  return hostname.includes('.') ? { kind: 'custom-domain', hostname } : { kind: 'invalid', hostname };
}

function validStoreSlug(rawSlug, reserved, hostname = '') {
  const slug = String(rawSlug).trim().toLowerCase();
  if (!DNS_LABEL.test(slug) || slug.length < 3 || slug.length > 63) return { kind: 'invalid', hostname };
  if (reserved.has(slug)) return { kind: 'reserved', hostname, subdomain: slug };
  return { kind: 'store', hostname, slug };
}
