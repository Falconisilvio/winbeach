/**
 * Aplica tema antes del primer paint + sync (parent iframe, storage, sistema).
 */
(function () {
  var KEY = 'winbeach_theme';

  function resolveTheme(stored) {
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  }

  apply(resolveTheme(localStorage.getItem(KEY)));

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'winbeach-theme-change') apply(e.data.theme);
  });

  window.addEventListener('storage', function (e) {
    if (e.key === KEY) apply(resolveTheme(e.newValue));
  });
})();