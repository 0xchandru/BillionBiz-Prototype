import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveStoreHost } from '../src/resolveStoreHost.mjs';

const reserved = ['admin', 'api', 'accounts', 'help', 'support', 'staff', 'ops', 'pos', 'www'];

test('resolves one-level merchant subdomains case-insensitively', () => {
  assert.deepEqual(resolveStoreHost('Meenu.Chandraprakash.Codes:443', '/', 'chandraprakash.codes', reserved), {
    kind: 'store', hostname: 'meenu.chandraprakash.codes', slug: 'meenu',
  });
});

test('keeps root and platform hosts out of merchant resolution', () => {
  assert.equal(resolveStoreHost('chandraprakash.codes', '/', 'chandraprakash.codes', reserved).kind, 'platform');
  assert.equal(resolveStoreHost('api.chandraprakash.codes', '/', 'chandraprakash.codes', reserved).kind, 'reserved');
});

test('rejects nested, malformed, too-short, and reserved store labels', () => {
  assert.equal(resolveStoreHost('one.two.chandraprakash.codes', '/', 'chandraprakash.codes', reserved).kind, 'invalid');
  assert.equal(resolveStoreHost('-bad.chandraprakash.codes', '/', 'chandraprakash.codes', reserved).kind, 'invalid');
  assert.equal(resolveStoreHost('ab.chandraprakash.codes', '/', 'chandraprakash.codes', reserved).kind, 'invalid');
  assert.equal(resolveStoreHost('help.chandraprakash.codes', '/', 'chandraprakash.codes', reserved).kind, 'reserved');
});

test('supports local path and *.localhost development routing', () => {
  assert.equal(resolveStoreHost('localhost:3000', '/store/meenu', 'chandraprakash.codes', reserved).slug, 'meenu');
  assert.equal(resolveStoreHost('meenu.localhost:3000', '/', 'chandraprakash.codes', reserved).slug, 'meenu');
});

test('classifies other fully qualified domains for database verification', () => {
  assert.equal(resolveStoreHost('shop.example.com', '/', 'chandraprakash.codes', reserved).kind, 'custom-domain');
});
