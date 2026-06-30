/**
 * Aplica tema antes del primer paint (evita flash).
 * Sincronizado con winbeach-theme.js
 */
(function () {
  var KEY = 'winbeach_theme';
  var stored = localStorage.getItem(KEY);
  var theme = stored === 'dark' || stored === 'light'
    ? stored
    : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();