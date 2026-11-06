import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeHostname } from './src/resolveStoreHost.mjs';

const runtimeRoot = path.dirname(fileURLToPath(import.meta.url));
const distRoot = path.join(runtimeRoot, 'dist');
const indexPath = path.join(distRoot, 'index.html');
const port = Number(process.env.STOREFRONT_PORT || process.env.PORT || 3000);
const host = process.env.STOREFRONT_HOST || '0.0.0.0';
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const hostname = normalizeHostname(req.headers.host || '');
  if (!hostname) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Invalid Host header');
    return;
  }

  const requestPath = new URL(req.url || '/', 'http://runtime.invalid').pathname;
  if (requestPath === '/_runtime/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ status: 'ok', service: 'billionbiz-storefront-runtime' }));
    return;
  }

  const decodedPath = decodeURIComponent(requestPath);
  const resolvedPath = path.resolve(distRoot, `.${decodedPath}`);
  const relativePath = path.relative(distRoot, resolvedPath);
  if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Invalid path');
    return;
  }

  const filePath = fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile() ? resolvedPath : indexPath;
  fs.readFile(filePath, (error, body) => {
    if (error) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end('Storefront runtime is not built. Run npm run build first.');
      return;
    }
    const isIndex = filePath === indexPath;
    res.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': isIndex ? 'no-cache, no-store, must-revalidate' : 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });
    if (req.method === 'HEAD') res.end();
    else res.end(body);
  });
});

server.listen(port, host, () => console.log(`[BillionBiz Storefront Runtime] Listening on http://${host}:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
