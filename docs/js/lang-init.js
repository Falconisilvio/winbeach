/**
 * Idioma inicial + sync con dashboard (iframe).
 */
(function () {
  var KEY = 'winbeach-app-lang';
  var SUPPORTED = { it: 1, en: 1, es: 1, fr: 1, de: 1 };

  function apply(code) {
    var lang = SUPPORTED[code] ? code : 'it';
    document.documentElement.lang = lang;
  }

  apply(localStorage.getItem(KEY) || 'it');

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'winbeach-lang-change') apply(e.data.lang);
  });

  window.addEventListener('storage', function (e) {
    if (e.key === KEY) apply(e.newValue);
  });
})();