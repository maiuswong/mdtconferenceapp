/* Service Worker for INCOSE HWGC 2026 Schedule PWA */
const VERSION = 'v1.0.2';
const CACHE_NAME = `hwgc2026-${VERSION}`;

// Resolve URLs relative to the SW's scope so this works on GitHub Pages
// project sites (e.g. https://user.github.io/conference-schedule/).
const SCOPE = self.registration ? self.registration.scope : self.location.href;
const asScoped = (path) => new URL(path, SCOPE).toString();

const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './schedule-data.js',
  './app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
  // External assets used by the page. Cached opaquely; updated when network
  // is available.
  'https://fonts.googleapis.com/css2?family=Google+Sans:wght@300;400;500;600;700;900&family=DM+Mono:wght@400;500&display=swap',
  'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js',
].map((u) => (u.startsWith('http') ? u : asScoped(u)));

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Best-effort precache; don't fail install if a single resource fails.
    await Promise.all(
      PRECACHE_URLS.map((url) =>
        cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
      )
    );
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// Strategy:
// - Navigation/HTML requests: network-first, fall back to cached HTML (offline).
// - Same-origin static assets: cache-first, then network, populate cache.
// - Cross-origin (fonts, CDN script): stale-while-revalidate.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isNavigate =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isNavigate) {
    event.respondWith(networkFirst(req));
    return;
  }

  if (sameOrigin) {
    event.respondWith(cacheFirst(req));
    return;
  }

  event.respondWith(staleWhileRevalidate(req));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    // Fallback to the main app shell.
    const shell = await cache.match(asScoped('./index.html'))
      || await cache.match(asScoped('./'));
    if (shell) return shell;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch {
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}
