/**
 * In-module demo banner + URL param helpers for agent-primed tools.
 * Pair with services/greenways-module-demo.js on the server.
 */
(function (global) {
  "use strict";

  function params() {
    try {
      return new URLSearchParams(global.location.search);
    } catch (_) {
      return new URLSearchParams();
    }
  }

  function isDemo(p) {
    p = p || params();
    return (
      p.get("demo") === "1" ||
      !!(p.get("demoNote") || p.get("demoLabel") || p.get("fromLabel"))
    );
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * Mount a sticky “agent primed this tool” banner at the top of the page.
   * @param {object} opts
   * @param {string} [opts.label]
   * @param {string} [opts.note]
   * @param {Element|string} [opts.before] — insert before this node (or selector)
   * @param {string} [opts.id]
   */
  function mountBanner(opts) {
    opts = opts || {};
    var p = params();
    var label =
      opts.label ||
      p.get("demoLabel") ||
      p.get("fromLabel") ||
      "Agent demonstration";
    var note =
      opts.note ||
      p.get("demoNote") ||
      "Values below were primed from chat — adjust anything before you decide.";
    if (!isDemo(p) && !opts.force) return null;

    var existing = document.getElementById(opts.id || "gw-module-demo-banner");
    if (existing) existing.remove();

    var bar = document.createElement("div");
    bar.id = opts.id || "gw-module-demo-banner";
    bar.className = "gw-module-demo-banner";
    bar.setAttribute("role", "status");
    bar.innerHTML =
      '<strong class="gw-module-demo-label">' +
      escapeHtml(label) +
      "</strong>" +
      '<span class="gw-module-demo-note">' +
      escapeHtml(note) +
      "</span>";

    if (!document.getElementById("gw-module-demo-banner-style")) {
      var style = document.createElement("style");
      style.id = "gw-module-demo-banner-style";
      style.textContent =
        ".gw-module-demo-banner{display:flex;flex-wrap:wrap;align-items:flex-start;gap:8px 14px;" +
        "margin:0 0 14px;padding:10px 14px;border-radius:12px;" +
        "border:1px solid rgba(201,169,97,0.45);background:rgba(201,169,97,0.12);" +
        "color:inherit;font-size:0.86rem;line-height:1.4;}" +
        ".gw-module-demo-label{color:#c9a961;font-weight:700;white-space:nowrap;}" +
        ".gw-module-demo-note{opacity:0.92;flex:1;min-width:12rem;}";
      document.head.appendChild(style);
    }

    var before = opts.before;
    if (typeof before === "string") before = document.querySelector(before);
    if (before && before.parentNode) {
      before.parentNode.insertBefore(bar, before);
    } else {
      var main = document.querySelector("main") || document.body;
      main.insertBefore(bar, main.firstChild);
    }
    return bar;
  }

  function countryFromParam(raw) {
    var r = String(raw || "").trim().toLowerCase();
    if (!r) return "";
    if (r === "nl" || r.indexOf("netherland") >= 0) return "Netherlands";
    if (r === "uk" || r === "gb" || r.indexOf("united kingdom") >= 0) return "United Kingdom";
    if (r === "de" || r.indexOf("german") >= 0) return "Germany";
    if (r === "be" || r.indexOf("belgium") >= 0) return "Belgium";
    if (r === "fr" || r.indexOf("france") >= 0) return "France";
    if (r === "es" || r.indexOf("spain") >= 0) return "Spain";
    if (r === "pt" || r.indexOf("portugal") >= 0) return "Portugal";
    if (r === "it" || r.indexOf("italy") >= 0) return "Italy";
    if (r.charAt(0) === r.charAt(0).toUpperCase()) return String(raw).trim();
    return "";
  }

  global.GreenwaysModuleDemo = {
    params: params,
    isDemo: isDemo,
    mountBanner: mountBanner,
    countryFromParam: countryFromParam,
    escapeHtml: escapeHtml
  };
})(window);
