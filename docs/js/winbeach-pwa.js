if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    const swUrl = new URL('sw.js', location.href).pathname;
    const scope = swUrl.replace(/sw\.js$/, '');
    navigator.serviceWorker.register(swUrl, { scope }).catch(() => {});
  });
}