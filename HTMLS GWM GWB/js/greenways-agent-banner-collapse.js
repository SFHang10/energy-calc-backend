/**
 * Collapse product showcase + wire ticker after conversation starts — more room for chat.
 * Slim strip keeps Show/Hide spotlight. Resets when welcome card returns (new chat).
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

  function tickerEl() {
    return document.getElementById("gw-wire-ticker-mount");
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
    var expanded = main.classList.contains("is-banner-expanded");
    btn.textContent = expanded ? "Hide spotlight" : "Show spotlight";
    btn.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  function setConversation(active) {
    var main = mainEl();
    if (!main) return;
    main.classList.toggle("has-conversation", !!active);
    if (!active) main.classList.remove("is-banner-expanded");
    syncToggleLabel();
  }

  function ensureSpotlightZone() {
    var banner = bannerEl();
    if (!banner) return null;

    var zone = document.getElementById("agent-spotlight-zone");
    if (zone) return zone;

    var ticker = tickerEl();
    var parent = banner.parentNode;
    if (!parent) return null;

    zone = document.createElement("div");
    zone.id = "agent-spotlight-zone";
    zone.className = "agent-spotlight-zone";

    if (ticker && ticker.parentNode === parent) {
      parent.insertBefore(zone, ticker);
      zone.appendChild(ticker);
      zone.appendChild(banner);
    } else {
      parent.insertBefore(zone, banner);
      zone.appendChild(banner);
    }

    return zone;
  }

  function ensureToggleBar(zone) {
    var banner = bannerEl();
    if (!zone || !banner) return;

    var existing =
      zone.querySelector(".gw-banner-collapse-bar") ||
      banner.querySelector(".gw-banner-collapse-bar");
    if (existing && existing.parentNode !== zone) {
      zone.insertBefore(existing, zone.firstChild);
    }
    if (zone.querySelector(".gw-banner-collapse-bar")) return;

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
      '<button type="button" class="gw-banner-expand-btn" aria-expanded="false">Show spotlight</button>';
    zone.insertBefore(bar, zone.firstChild);

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

    var zone = ensureSpotlightZone();
    ensureToggleBar(zone);
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
