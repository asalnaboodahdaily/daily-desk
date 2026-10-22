// Daily Desk service worker: always ask the server first (bypassing the browser's HTTP cache),
// fall back to the last good copy only when offline.
const CACHE='dd-v3';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg','./data/feeds.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin)return; // fonts etc. go straight to the network
  const key=url.pathname; // ignore ?t= cache busters
  const fresh=new Request(e.request.url,{cache:'no-cache',credentials:'same-origin',headers:e.request.headers,mode:'same-origin'});
  e.respondWith(fetch(fresh).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(key,c))}return r})
    .catch(()=>caches.match(key).then(r=>r||caches.match('./index.html'))));
});
