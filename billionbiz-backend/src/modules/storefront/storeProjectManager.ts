import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../../db/pool.js';

interface StoreRow {
  id: string;
  slug: string;
  name: string;
}

interface RunningProject {
  process: ChildProcess;
  port: number;
}

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(moduleDir, '../../../..');
const frontendRoot = process.env.BILLIONBIZ_FRONTEND_ROOT
  ? path.resolve(process.env.BILLIONBIZ_FRONTEND_ROOT)
  : path.join(repositoryRoot, 'billionbiz-frontend');
const projectsRoot = process.env.BILLIONBIZ_STORE_PROJECTS_DIR
  ? path.resolve(process.env.BILLIONBIZ_STORE_PROJECTS_DIR)
  : path.resolve(moduleDir, '../../../store-projects');
const runningProjects = new Map<string, RunningProject>();
const syncIntervalMs = Number(process.env.BILLIONBIZ_STORE_PROJECT_SYNC_MS || 10_000);
let syncTimer: NodeJS.Timeout | undefined;
let syncInProgress = false;

export function getStoreProjectPort(slug: string): number {
  let hash = 2166136261;
  for (const character of slug) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return 20_000 + ((hash >>> 0) % 20_000);
}

function safeProjectName(slug: string): string {
  return `billionbiz-store-${slug}`;
}

async function writeProjectFiles(store: StoreRow, port: number): Promise<string> {
  const projectDir = path.join(projectsRoot, `${safeProjectName(store.slug)}-${store.id}`);
  const sourceDir = path.join(projectDir, 'src');
  await fs.mkdir(sourceDir, { recursive: true });

  const project = {
    name: safeProjectName(store.slug),
    private: true,
    version: '1.0.0',
    type: 'module',
    description: `Independent BillionBiz storefront project for ${store.name}`,
    storeId: store.id,
    storeSlug: store.slug,
    port,
    runtime: 'React + TypeScript + Vite',
    managedBy: 'BillionBiz backend',
  };

  const files: Record<string, string> = {
    'package.json': `${JSON.stringify({
      name: safeProjectName(store.slug),
      private: true,
      version: '1.0.0',
      type: 'module',
      scripts: { dev: 'vite --host 0.0.0.0 --strictPort', build: 'vite build' },
      dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
      devDependencies: { '@tailwindcss/vite': '^4.0.0', '@vitejs/plugin-react': '^6.0.0', tailwindcss: '^4.0.0', typescript: '^5.7.0', vite: '^8.0.0' },
    }, null, 2)}\n`,
    'store-project.json': `${JSON.stringify(project, null, 2)}\n`,
    'index.html': `<!doctype html>\n<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="theme-color" content="#ffffff" /><title>${store.name.replace(/[<>"']/g, '')}</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n`,
    'vite.config.ts': `import path from 'node:path';\nimport { createRequire } from 'node:module';\n\nconst frontendRoot = process.env.BILLIONBIZ_FRONTEND_ROOT!;\nconst frontendRequire = createRequire(path.join(frontendRoot, 'package.json'));\nconst react = frontendRequire('@vitejs/plugin-react').default;\nconst tailwind = frontendRequire('@tailwindcss/vite').default;\nconst frontendModules = path.join(frontendRoot, 'node_modules');\n\nexport default {\n  plugins: [react(), tailwind()],\n  resolve: {\n    alias: [\n      { find: 'react-dom/client', replacement: path.join(frontendModules, 'react-dom/client.js') },\n      { find: 'react-dom', replacement: path.join(frontendModules, 'react-dom/index.js') },\n      { find: 'react', replacement: path.join(frontendModules, 'react/index.js') },\n    ],\n  },\n  server: {\n    host: '0.0.0.0',\n    port: Number(process.env.PORT),\n    strictPort: true,\n    allowedHosts: ['.localhost'],\n    fs: { allow: [frontendRoot, process.cwd()] },\n  },\n};\n`,
    'src/main.tsx': `import React, { useCallback, useEffect, useState } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport { StorefrontRenderer } from '../../../../billionbiz-frontend/src/components/storefront/StorefrontRenderer';\nimport { PasswordGateView } from '../../../../billionbiz-frontend/src/components/storefront/pages/PasswordGateView';\nimport '../../../../billionbiz-frontend/src/index.css';\n\nconst slug = import.meta.env.VITE_STORE_SLUG as string;\nconst apiBase = (import.meta.env.VITE_API_BASE_URL as string || 'http://localhost:8080/api/v1').replace(/\\/$/, '');\n\nfunction App() {\n  const [data, setData] = useState<any>(null);\n  const [error, setError] = useState('');\n  const [loading, setLoading] = useState(true);\n  const [path, setPath] = useState(window.location.pathname);\n  const [accessToken, setAccessToken] = useState(sessionStorage.getItem('billionbiz_storefront_access:' + slug));\n\n  const loadStore = useCallback(async (token = accessToken) => {\n    setLoading(true);\n    setError('');\n    try {\n      const response = await fetch(apiBase + '/storefront/by-slug/' + encodeURIComponent(slug), {\n        headers: token ? { 'x-storefront-access-token': token } : {},\n      });\n      if (!response.ok) throw new Error('This storefront could not be loaded.');\n      const result = await response.json();\n      if (!result?.store) throw new Error('The server returned no storefront for this project.');\n      setData(result);\n    } catch (reason) {\n      setData(null);\n      setError(reason instanceof Error ? reason.message : 'This storefront could not be loaded.');\n    } finally {\n      setLoading(false);\n    }\n  }, [accessToken]);\n\n  useEffect(() => { void loadStore(); }, [loadStore]);\n  useEffect(() => {\n    const onPopState = () => setPath(window.location.pathname);\n    window.addEventListener('popstate', onPopState);\n    const updates = new EventSource(apiBase + '/storefront/by-slug/' + encodeURIComponent(slug) + '/updates');\n    updates.onmessage = (event) => {\n      try { if (JSON.parse(event.data)?.data?.type === 'STOREFRONT_RELEASE_PUBLISHED') void loadStore(); } catch { /* Ignore malformed update frames. */ }\n    };\n    return () => { window.removeEventListener('popstate', onPopState); updates.close(); };\n  }, [loadStore]);\n\n  if (loading) return <main className="min-h-screen animate-pulse bg-slate-50 p-8"><div className="mx-auto max-w-6xl space-y-6"><div className="h-12 rounded-xl bg-slate-200" /><div className="h-72 rounded-2xl bg-slate-200" /><div className="grid grid-cols-4 gap-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-64 rounded-xl bg-slate-200" />)}</div></div></main>;\n  if (error || !data?.store) return <main className="grid min-h-screen place-items-center p-8 text-center"><div><h1 className="text-2xl font-bold">Storefront unavailable</h1><p className="mt-2 text-slate-500">{error || 'Store data is unavailable.'}</p><button className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white" onClick={() => void loadStore()}>Try again</button></div></main>;\n  if (data.passwordRequired) return <PasswordGateView brandName={data.brand?.name || data.store.name} tagline={data.brand?.tagline} onUnlock={async (password: string) => {\n    try {\n      const response = await fetch(apiBase + '/storefront/by-slug/' + encodeURIComponent(slug) + '/password/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });\n      const result = await response.json();\n      if (!result.verified || !result.accessToken) return false;\n      sessionStorage.setItem('billionbiz_storefront_access:' + slug, result.accessToken);\n      setAccessToken(result.accessToken);\n      await loadStore(result.accessToken);\n      return true;\n    } catch { return false; }\n  }} />;\n\n  return <StorefrontRenderer store={data.store} brand={data.brand} themeTokens={data.theme} settings={data.settings} pages={data.pages} products={data.products} offerings={data.offerings} categories={data.categories} currentPath={path} previewMode={false} onNavigate={(nextPath: string) => { window.history.pushState({}, '', nextPath); setPath(nextPath); window.scrollTo(0, 0); }} />;\n}\n\ncreateRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);\n`,
  };

  for (const [relativePath, content] of Object.entries(files)) {
    const destination = path.join(projectDir, relativePath);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, content, 'utf8');
  }

  return projectDir;
}

async function startProject(store: StoreRow, projectDir: string, port: number): Promise<void> {
  const viteEntrypoint = path.join(frontendRoot, 'node_modules', 'vite', 'bin', 'vite.js');
  const child = spawn(process.execPath, [viteEntrypoint, '--config', path.join(projectDir, 'vite.config.ts')], {
    cwd: projectDir,
    env: {
      ...process.env,
      BILLIONBIZ_FRONTEND_ROOT: frontendRoot,
      PORT: String(port),
      VITE_STORE_SLUG: store.slug,
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || `http://localhost:${process.env.PORT || 8080}/api/v1`,
    },
    stdio: 'inherit',
    windowsHide: true,
  });

  child.on('error', (error) => console.error(`[Store Project ${store.slug}] Could not start: ${error.message}`));
  child.on('exit', (code, signal) => {
    const active = runningProjects.get(store.id);
    if (active?.process === child) runningProjects.delete(store.id);
    if (code !== 0 && code !== null) {
      console.warn(`[Store Project ${store.slug}] Vite exited with code ${code}${signal ? ` (${signal})` : ''}.`);
    }
  });

  runningProjects.set(store.id, { process: child, port });
  console.log(`[Store Project ${store.slug}] Starting React storefront at http://${store.slug}.localhost:${port}`);

  // A spawned process is not a ready preview. Wait until Vite serves the generated
  // app, and fail provisioning if it exits or never begins listening.
  const deadline = Date.now() + 30_000;
  let lastError = 'The storefront preview did not start listening.';
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.killed) {
      runningProjects.delete(store.id);
      throw new Error(`The storefront preview exited before becoming ready (code ${child.exitCode ?? 'unknown'}).`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1500) });
      if (response.ok) return;
      lastError = `The storefront preview returned HTTP ${response.status}.`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  child.kill();
  runningProjects.delete(store.id);
  throw new Error(`The storefront preview did not become ready: ${lastError}`);
}

export async function syncStoreProjects(): Promise<void> {
  if (syncInProgress || process.env.NODE_ENV !== 'development') return;
  syncInProgress = true;
  try {
    const result = await pool.query<StoreRow>(
      `SELECT id, slug, name FROM stores WHERE status = 'ACTIVE' ORDER BY slug ASC`
    );
    const activeIds = new Set(result.rows.map((store) => store.id));

    for (const [storeId, running] of runningProjects) {
      if (!activeIds.has(storeId)) {
        running.process.kill();
        runningProjects.delete(storeId);
      }
    }

    await fs.mkdir(projectsRoot, { recursive: true });
    for (const store of result.rows) {
      if (runningProjects.has(store.id)) continue;
      const port = getStoreProjectPort(store.slug);
      try {
        const projectDir = await writeProjectFiles(store, port);
        await startProject(store, projectDir, port);
        await pool.query(
          `INSERT INTO storefront_provisioning (store_id, plan_code, status, project_name, local_project_path, attempts)
           VALUES ($1, 'FREE_TRIAL', 'LOCAL_READY', $2, $3, 1)
           ON CONFLICT (store_id) DO UPDATE SET status = CASE WHEN storefront_provisioning.status = 'LIVE' THEN 'LIVE' ELSE 'LOCAL_READY' END,
             project_name = EXCLUDED.project_name, local_project_path = EXCLUDED.local_project_path,
             attempts = storefront_provisioning.attempts + 1, last_error = NULL, updated_at = NOW()`,
          [store.id, safeProjectName(store.slug), projectDir]
        );
      } catch (error) {
        await pool.query(
          `INSERT INTO storefront_provisioning (store_id, plan_code, status, project_name, last_error, attempts)
           VALUES ($1, 'FREE_TRIAL', 'FAILED', $2, $3, 1)
           ON CONFLICT (store_id) DO UPDATE SET status = 'FAILED', last_error = EXCLUDED.last_error,
             attempts = storefront_provisioning.attempts + 1, updated_at = NOW()`,
          [store.id, safeProjectName(store.slug), error instanceof Error ? error.message : String(error)]
        ).catch(() => undefined);
        console.error(`[Store Project ${store.slug}] Provisioning failed:`, error);
      }
    }
  } catch (error) {
    console.error('[Store Project Manager] Could not reconcile store projects:', error);
  } finally {
    syncInProgress = false;
  }
}

export function startStoreProjectManager(): void {
  if (process.env.NODE_ENV !== 'development' || syncTimer) return;
  void syncStoreProjects();
  syncTimer = setInterval(() => void syncStoreProjects(), syncIntervalMs);
  syncTimer.unref();
}

export function stopStoreProjectManager(): void {
  if (syncTimer) clearInterval(syncTimer);
  syncTimer = undefined;
  for (const { process: child } of runningProjects.values()) child.kill();
  runningProjects.clear();
}
