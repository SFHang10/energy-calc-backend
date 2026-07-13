/**
 * Marketplace bridge pages — keep navigation inside the agent module when ?embed=1.
 * Wix shop URLs and Greenways tool links ask the parent chat shell to open the right module.
 */
(function () {
  "use strict";

  var WIX_TO_MODULE = [
    [/greenwaysmarket\.com\/about-us/i, "marketplace-about"],
    [/greenwaysmarket\.com\/new-air-and-ventilation/i, "marketplace-hvac"],
    [/greenwaysmarket\.com\/?(\?|#|$)/i, "marketplace-home"]
  ];

  var PATH_TO_MODULE = [
    ["sustainable_product_deal_finder_portal", "sustainable-product-finder"],
    ["restaurant-equipment-deep-dive", "equipment-deep-dive"],
    ["deals-ticker-hub", "deals-ticker"],
    ["european_energy_deals_portal", "european-energy"],
    ["utility-detail", "utility-detail"],
    ["site-energy-reading", "site-energy-reading"],
    ["marketplace-about", "marketplace-about"],
    ["marketplace-home", "marketplace-home"],
    ["marketplace-hvac", "marketplace-hvac"]
  ];

  function isEmbedMode() {
    try {
      return new URLSearchParams(window.location.search).get("embed") === "1";
    } catch (_) {
      return false;
    }
  }

  function moduleIdForHref(href) {
    var raw = String(href || "").trim();
    if (!raw) return "";
    var i;
    for (i = 0; i < WIX_TO_MODULE.length; i++) {
      if (WIX_TO_MODULE[i][0].test(raw)) return WIX_TO_MODULE[i][1];
    }
    var low = raw.toLowerCase();
    for (i = 0; i < PATH_TO_MODULE.length; i++) {
      if (low.indexOf(PATH_TO_MODULE[i][0]) >= 0) return PATH_TO_MODULE[i][1];
    }
    return "";
  }

  function askParentOpen(moduleId) {
    if (!moduleId || !window.parent || window.parent === window) return false;
    try {
      window.parent.postMessage({ type: "gw-module-open", moduleId: moduleId }, "*");
      return true;
    } catch (_) {
      return false;
    }
  }

  function onDocumentClick(e) {
    if (!isEmbedMode()) return;
    var link = e.target.closest("a[href]");
    if (!link || link.getAttribute("data-allow-external") === "1") return;
    var href = link.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || /^mailto:/i.test(href)) return;
    var moduleId = moduleIdForHref(href);
    if (!moduleId) return;
    e.preventDefault();
    e.stopPropagation();
    if (!askParentOpen(moduleId) && /^\.\//.test(href)) {
      window.location.href = href;
    }
  }

  if (isEmbedMode()) {
    document.documentElement.classList.add("embed-mode");
  }
  document.addEventListener("click", onDocumentClick, true);
})();
