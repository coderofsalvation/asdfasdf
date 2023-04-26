const CACHE_ID="v1"

const addResourcesToCache = async (resources) => {
    const cache = await caches.open(CACHE_ID);
    await cache.addAll(resources);
};

self.addEventListener("install",  (event) => {
  event.waitUntil(
    addResourcesToCache([
      './index.html'
    ])
  );
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
  event.waitUntil(
    (async () => {
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {

        const response = await event.preloadResponse;
        if (response) {
          return response;
        }
        return fetch(event.request);
      } catch {
        const cache = await caches.open(CACHE_ID)
        cache.match(event.request).then(async response => {
          if (response) return response; // get cached
          else new Response(`could not find ${event.request} in cache`);
        })
      }
    })(),
  );
});
