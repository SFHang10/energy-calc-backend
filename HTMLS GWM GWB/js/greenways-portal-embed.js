/**
 * Shared portal embed mode for Wix iframes.
 * Activates when ?embed=1 is present, the path ends with -embed,
 * or the path ends with -demo (website sample pages without portal menus).
 * Hides .gw-portal-nav via body.embed-mode (see greenways-portal-nav.css).
 *
 * Also exposes height / chrome reporting so a parent host (local preview or
 * custom Wix HTML) can grow the iframe for long story pages and shrink it
 * again when a near-full chat/module overlay opens.
 */
(function (global) {
  function isEmbed() {
    try {
      var q = /[?&]embed=1(?:&|$)/.test(location.search || "");
      var path = String(location.pathname || "");
      var pathEmbed = /(?:^|\/)[a-z0-9-]+-(?:embed|demo)\/?$/i.test(path);
      return q || pathEmbed;
    } catch (_) {
      return false;
    }
  }

  function applyEmbedClass() {
    if (!isEmbed()) return false;
    document.documentElement.classList.add("embed-mode");
    if (document.body) document.body.classList.add("embed-mode");
    else {
      document.addEventListener("DOMContentLoaded", function () {
        document.body.classList.add("embed-mode");
      });
    }
    return true;
  }

  function measureHeight() {
    var body = document.body;
    var html = document.documentElement;
    return Math.max(
      body ? body.scrollHeight : 0,
      body ? body.offsetHeight : 0,
      html ? html.scrollHeight : 0,
      html ? html.offsetHeight : 0,
      600
    );
  }

  function post(payload) {
    if (!isEmbed()) return;
    if (!global.parent || global.parent === global) return;
    try {
      global.parent.postMessage(payload, "*");
    } catch (_) { /* ignore */ }
  }

  function reportHeight(extra) {
    var height = measureHeight();
    var msg = Object.assign(
      {
        type: "gw-embed-height",
        height: height,
        source: "greenways-portal-embed"
      },
      extra || {}
    );
    post(msg);
    return height;
  }

  /**
   * mode: "story" | "module" (chat or tool overlay)
   * preferredHeight: optional px when mode is module
   */
  function reportChrome(mode, preferredHeight) {
    var height = measureHeight();
    post({
      type: "gw-embed-chrome",
      mode: mode || "story",
      height: height,
      preferredHeight:
        preferredHeight != null
          ? preferredHeight
          : mode === "module"
            ? 800
            : null,
      source: "greenways-portal-embed"
    });
    return height;
  }

  applyEmbedClass();

  global.GreenwaysPortalEmbed = {
    isEmbed: isEmbed,
    reportHeight: reportHeight,
    reportChrome: reportChrome,
    measureHeight: measureHeight
  };
})(window);
