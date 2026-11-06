import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, test } from 'node:test';

const runtimeRoot = path.dirname(fileURLToPath(import.meta.url)).replace(`${path.sep}tests`, '');
const runtimeScript = path.join(runtimeRoot, 'server.mjs');
const children = new Set();
after(() => {
  for (const child of children) child.kill('SIGTERM');
});

async function availablePort() {
  const server = http.createServer();
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

test('proxies same-origin API requests to backend with the tenant hostname', async (t) => {
  const apiServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ host: req.headers.host, path: req.url }));
  });
  await new Promise((resolve, reject) => apiServer.once('error', reject).listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => apiServer.close(resolve)));

  const runtimePort = await availablePort();
  const apiPort = apiServer.address().port;
  const runtime = spawn(process.execPath, [runtimeScript], {
    cwd: runtimeRoot,
    env: {
      ...process.env,
      STOREFRONT_HOST: '127.0.0.1',
      STOREFRONT_PORT: String(runtimePort),
      BACKEND_API_URL: `http://127.0.0.1:${apiPort}`,
    },
    stdio: 'ignore',
  });
  children.add(runtime);
  t.after(() => {
    children.delete(runtime);
    runtime.kill('SIGTERM');
  });

  const healthUrl = `http://127.0.0.1:${runtimePort}/_runtime/health`;
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(healthUrl);
      if (response.ok) { ready = true; break; }
    } catch { /* Wait for the runtime listener. */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(ready, true, 'runtime should start before the test timeout');

  const response = await new Promise((resolve, reject) => {
    http.get({
      hostname: '127.0.0.1',
      port: runtimePort,
      path: '/api/v1/storefront/by-slug/meenu?preview=0',
      headers: { Host: 'meenu.chandraprakash.codes' },
    }, resolve).on('error', reject);
  });
  assert.equal(response.statusCode, 200);
  const payload = await new Promise((resolve, reject) => {
    let body = '';
    response.setEncoding('utf8');
    response.on('data', (chunk) => { body += chunk; });
    response.on('end', () => resolve(JSON.parse(body)));
    response.on('error', reject);
  });
  assert.deepEqual(payload, {
    host: 'meenu.chandraprakash.codes',
    path: '/api/v1/storefront/by-slug/meenu?preview=0',
  });
});
