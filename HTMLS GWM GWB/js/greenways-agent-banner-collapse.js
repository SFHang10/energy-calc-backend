/**
 * Collapse product showcase banner after conversation starts — more room for chat turns.
 * Optional expand via slim strip. Resets when welcome card returns (new chat).
 */
(function (global) {
  "use strict";

  var observer = null;

  function mainEl() {
    return document.querySelector(".guide-main");
  }

  function bannerEl() {
    return document.getElementById("product-showcase-banner");
  }

  function threadEl() {
    return document.getElementById("chat-thread");
  }

  function hasWelcomeOnly(thread) {
    if (!thread) return true;
    if (thread.querySelector(".msg-row")) return false;
    return !!thread.querySelector("#welcome-card");
  }

  function escapeHtml(text) {
    var d = document.createElement("div");
    d.textContent = String(text || "");
    return d.innerHTML;
  }

  function syncToggleLabel() {
    var btn = document.querySelector(".gw-banner-expand-btn");
    var main = mainEl();
    if (!btn || !main) return;
    btn.textContent = main.classList.contains("is-banner-expanded")
      ? "Hide spotlight"
      : "Show spotlight";
  }

  function setConversation(active) {
    var main = mainEl();
    if (!main) return;
    main.classList.toggle("has-conversation", !!active);
    if (!active) main.classList.remove("is-banner-expanded");
    syncToggleLabel();
  }

  function ensureToggleBar(banner) {
    if (!banner || banner.querySelector(".gw-banner-collapse-bar")) return;

    var labelEl = banner.querySelector(".product-showcase-label");
    var hintEl = banner.querySelector(".product-showcase-hint");
    var labelText = labelEl ? labelEl.textContent.trim() : "Spotlight";
    var hintText = hintEl ? hintEl.textContent.trim() : "";

    var bar = document.createElement("div");
    bar.className = "gw-banner-collapse-bar";
    bar.innerHTML =
      '<span class="gw-banner-collapse-copy">' +
      '<span class="gw-banner-collapse-label">' +
      escapeHtml(labelText) +
      "</span>" +
      (hintText
        ? '<span class="gw-banner-collapse-hint">' + escapeHtml(hintText) + "</span>"
        : "") +
      "</span>" +
      '<button type="button" class="gw-banner-expand-btn">Show spotlight</button>';
    banner.insertBefore(bar, banner.firstChild);

    bar.querySelector(".gw-banner-expand-btn").addEventListener("click", function () {
      var main = mainEl();
      if (!main) return;
      main.classList.toggle("is-banner-expanded");
      syncToggleLabel();
    });
  }

  function refresh() {
    setConversation(!hasWelcomeOnly(threadEl()));
  }

  function init() {
    var banner = bannerEl();
    var thread = threadEl();
    if (!banner || !thread) return;

    ensureToggleBar(banner);
    refresh();

    if (observer) return;
    observer = new MutationObserver(refresh);
    observer.observe(thread, { childList: true });
  }

  global.GreenwaysAgentBannerCollapse = {
    init: init,
    refresh: refresh,
    reset: function () {
      setConversation(false);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
