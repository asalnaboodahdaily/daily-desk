// Daily Desk service worker: network first, cache fallback, so the last good page and data open offline.
const CACHE='dd-v2';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg','./data/feeds.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin)return; // fonts etc. go straight to the network
  const key=url.pathname; // ignore ?t= cache busters
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(key,c))}return r})
    .catch(()=>caches.match(key).then(r=>r||caches.match('./index.html'))));
});
