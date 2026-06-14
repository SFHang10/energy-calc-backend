/**
 * Shared Greenways agent sidebar — quick link cards + ask helper cards.
 * GreenwaysAgentSidebar.init({ quickLinks, helpers, onAsk, onQuickLinkClick, ... })
 */
(function (global) {
  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function contentBase() {
    var h = location.hostname || "";
    if (h === "localhost" || h === "127.0.0.1" || h.indexOf("energy-calc-backend") !== -1) {
      return location.origin || "";
    }
    return "https://energy-calc-backend.onrender.com";
  }

  function gwbPageHref(filename) {
    var file = String(filename || "").replace(/^\.\//, "");
    if (location.protocol === "file:") return "./" + file;
    return contentBase() + "/HTMLS%20GWM%20GWB/" + file;
  }

  function resolveHref(link) {
    if (link.gwbFile) return gwbPageHref(link.gwbFile);
    return String(link.href || "#");
  }

  function isCompactName(name, link, compactLen) {
    if (link && link.compact) return true;
    return String(name || "").length > compactLen;
  }

  function renderQuickLinks(mount, links, opts) {
    if (!mount) return;
    mount.replaceChildren();
    (links || []).forEach(function (link) {
      var isAgent = Boolean(link.agent);
      var action = link.action || (isAgent ? "Chat" : "Open");
      var el;

      if (link.mapOpen) {
        el = document.createElement("button");
        el.type = "button";
        el.setAttribute("data-map-open", "1");
      } else {
        el = document.createElement("a");
        el.href = resolveHref(link);
        el.target = "_top";
        el.rel = "noopener";
      }

      el.className = "gw-sidebar-ql-card" + (isAgent ? " is-agent" : "");

      var icon = document.createElement("span");
      icon.className = "gw-sidebar-ql-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = link.icon || "🔗";

      var label = document.createElement("span");
      label.className = "gw-sidebar-ql-label";
      label.innerHTML =
        "<strong>" + escapeHtml(link.name) + "</strong> · <em>" + escapeHtml(link.desc) + "</em>";

      var actionEl = document.createElement("span");
      actionEl.className = "gw-sidebar-ql-action";
      actionEl.textContent = action;

      el.appendChild(icon);
      el.appendChild(label);
      el.appendChild(actionEl);

      el.addEventListener("click", function (e) {
        if (link.mapOpen && typeof opts.onQuickLinkClick === "function") {
          e.preventDefault();
          opts.onQuickLinkClick(link, el, e);
          return;
        }
        if (typeof opts.onQuickLinkClick === "function") {
          opts.onQuickLinkClick(link, el, e);
        }
      });

      mount.appendChild(el);
    });
  }

  function renderHelpers(mount, helpers, opts) {
    if (!mount || !Array.isArray(helpers)) return;
    var compactLen = Number(opts.compactNameLen) || 16;
    mount.replaceChildren();

    helpers.forEach(function (h) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "helper-card";

      var icon = document.createElement("span");
      icon.className = "helper-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = h.icon || "💬";

      var body = document.createElement("div");
      body.className = "helper-card-body";

      var name = document.createElement("div");
      name.className =
        "helper-card-name" + (isCompactName(h.name, h, compactLen) ? " is-compact" : "");
      name.textContent = h.name || "";

      var desc = document.createElement("div");
      desc.className = "helper-card-desc";
      desc.textContent = h.desc || "";

      body.appendChild(name);
      body.appendChild(desc);

      var ask = document.createElement("span");
      ask.className = "helper-ask-btn";
      ask.textContent = "Ask";

      card.appendChild(icon);
      card.appendChild(body);
      card.appendChild(ask);

      card.addEventListener("click", function (e) {
        e.preventDefault();
        if (typeof opts.onAsk === "function") opts.onAsk(h.prompt, h, e);
      });

      mount.appendChild(card);
    });
  }

  function init(opts) {
    opts = opts || {};
    var linksMount =
      opts.quickLinksMount ||
      document.getElementById(opts.quickLinksMountId || "gw-agent-quick-links");
    var helpersMount =
      opts.helpersMount || document.getElementById(opts.helpersMountId || "helper-list");

    var linksHint = document.getElementById("gw-sidebar-links-hint");
    if (linksHint && opts.linksHint) linksHint.textContent = opts.linksHint;

    var helpersHint = document.getElementById("gw-sidebar-helpers-hint");
    if (helpersHint && opts.helpersHint) helpersHint.textContent = opts.helpersHint;

    renderQuickLinks(linksMount, opts.quickLinks, opts);

    if (opts.helpers && opts.helpers.length) {
      renderHelpers(helpersMount, opts.helpers, opts);
    }

    return { linksMount: linksMount, helpersMount: helpersMount };
  }

  global.GreenwaysAgentSidebar = {
    init: init,
    renderQuickLinks: renderQuickLinks,
    renderHelpers: renderHelpers,
    contentBase: contentBase,
    gwbPageHref: gwbPageHref,
    escapeHtml: escapeHtml
  };
})(typeof window !== "undefined" ? window : globalThis);
