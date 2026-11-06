import React, { useEffect, useMemo, useState } from 'react';
import { StorefrontPage } from '../../src/pages/StorefrontPage';
import { getApiBaseUrl } from '../../src/api/client';
import { RESERVED_SUBDOMAINS } from '../../src/utils/reservedSubdomains';
import { resolveStoreHost } from './resolveStoreHost.mjs';

type HostResolution = ReturnType<typeof resolveStoreHost> | { kind: 'not-found'; hostname: string };

const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').toLowerCase();

export function StorefrontRuntime() {
  const hostResolution = useMemo(
    () => resolveStoreHost(window.location.host, window.location.pathname, rootDomain, [...RESERVED_SUBDOMAINS]),
    [],
  );
  const [resolved, setResolved] = useState<HostResolution | null>(
    hostResolution.kind === 'custom-domain' ? null : hostResolution,
  );

  useEffect(() => {
    if (hostResolution.kind !== 'custom-domain') return;
    let cancelled = false;
    fetch(`${getApiBaseUrl()}/storefront/resolve-host`, { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error('This domain is not connected to an active BillionBiz store.');
        return response.json();
      })
      .then((result: { slug?: string }) => {
        if (cancelled) return;
        if (result.slug) setResolved({ kind: 'store', hostname: hostResolution.hostname, slug: result.slug });
        else setResolved({ kind: 'not-found', hostname: hostResolution.hostname });
      })
      .catch(() => {
        if (!cancelled) setResolved({ kind: 'not-found', hostname: hostResolution.hostname });
      });
    return () => { cancelled = true; };
  }, [hostResolution]);

  if (!resolved) return <RuntimeLoading />;
  if (resolved.kind === 'store') return <StorefrontPage slug={resolved.slug} />;
  return <RuntimeNotFound resolution={resolved} />;
}

function RuntimeLoading() {
  return <main className="grid min-h-screen place-items-center bg-white text-slate-500" role="status"><span>Loading storefront…</span></main>;
}

function RuntimeNotFound({ resolution }: { resolution: HostResolution }) {
  const message = resolution.kind === 'reserved'
    ? `The ${resolution.subdomain} hostname belongs to BillionBiz platform services.`
    : resolution.kind === 'platform'
      ? 'This hostname is a platform address and does not host a merchant storefront.'
      : resolution.kind === 'custom-domain' || resolution.kind === 'not-found'
        ? 'No active storefront is connected to this hostname.'
        : 'This storefront hostname is invalid.';

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center text-slate-900">
      <section className="max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">BillionBiz Storefront</p>
        <h1 className="mt-4 text-3xl font-bold">Storefront unavailable</h1>
        <p className="mt-3 text-slate-600">{message}</p>
      </section>
    </main>
  );
}
