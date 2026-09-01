/* Steward service worker — network-first for HTML, cache-first for static assets. */
const CACHE = "steward-v1"
const APP_SHELL = [
  "/",
  "/home",
  "/ask",
  "/learn",
  "/settings",
  "/todos",
  "/agents",
  "/manifest.webmanifest",
  "/icons/icon.svg",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.allSettled(APP_SHELL.map((url) => cache.add(url).catch(() => null))),
      ),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // API calls: network first, no caching (except health)
  if (url.pathname.startsWith("/api/")) {
    if (url.pathname === "/api/health") {
      event.respondWith(networkFirst(req))
    }
    return
  }

  // HTML documents: network first, fall back to cache
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(networkFirst(req))
    return
  }

  // Static assets (JS/CSS/images): cache first
  event.respondWith(cacheFirst(req))
})

async function networkFirst(req) {
  try {
    const res = await fetch(req)
    const cache = await caches.open(CACHE)
    cache.put(req, res.clone())
    return res
  } catch {
    const cached = await caches.match(req)
    if (cached) return cached
    return caches.match("/home")
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req)
  if (cached) return cached
  try {
    const res = await fetch(req)
    if (res.ok && res.type === "basic") {
      const cache = await caches.open(CACHE)
      cache.put(req, res.clone())
    }
    return res
  } catch {
    return new Response("Offline", { status: 503 })
  }
}
