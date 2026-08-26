/**
 * Shared portal embed mode for Wix iframes.
 * Activates when ?embed=1 is present, the path ends with -embed,
 * or the path ends with -demo (website sample pages without portal menus).
 * Hides .gw-portal-nav via body.embed-mode (see greenways-portal-nav.css).
 */
(function () {
  try {
    var q = /[?&]embed=1(?:&|$)/.test(location.search);
    var path = String(location.pathname || '');
    var pathEmbed = /(?:^|\/)[a-z0-9-]+-(?:embed|demo)\/?$/i.test(path);
    if (q || pathEmbed) {
      document.documentElement.classList.add('embed-mode');
      if (document.body) document.body.classList.add('embed-mode');
      else {
        document.addEventListener('DOMContentLoaded', function () {
          document.body.classList.add('embed-mode');
        });
      }
    }
  } catch (_) { /* ignore */ }
})();
