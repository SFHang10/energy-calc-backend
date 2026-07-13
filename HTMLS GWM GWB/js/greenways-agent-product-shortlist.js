/**
 * Greenways product shortlist — sessionStorage pilot for agent banner cards.
 * GreenwaysAgentProductShortlist.init({ bannerSelector, sidebarListId, agentSlug, agentName })
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "greenways-product-shortlist";
  var MAX_ITEMS = 12;

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function readShortlist() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function writeShortlist(items) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
    } catch (_) {
      /* quota or private mode */
    }
    dispatchChange();
  }

  function dispatchChange() {
    try {
      global.dispatchEvent(new CustomEvent("gw-shortlist-change", { detail: { items: readShortlist() } }));
    } catch (_) {
      /* old browsers */
    }
  }

  function isShortlistableId(id) {
    return /^(etl_|sust_)/i.test(String(id || "").trim());
  }

  function extractProductId(href) {
    try {
      var url = String(href || "");
      var match = url.match(/[?&]product=([^&]+)/i);
      return match ? decodeURIComponent(match[1]) : "";
    } catch (_) {
      return "";
    }
  }

  function marketplaceHrefFor(id, existing) {
    if (existing) {
      var href = String(existing).trim();
      if (/^https?:\/\//i.test(href)) return href;
      if (href.charAt(0) === "/") return href;
      return "/" + href.replace(/^\.\//, "");
    }
    if (!id) return "";
    return "/product-page-v2-marketplace.html?product=" + encodeURIComponent(id) + "&fromPopup=true";
  }

  function isSaved(id) {
    return readShortlist().some(function (row) {
      return String(row.id) === String(id);
    });
  }

  function addItem(item) {
    var id = String(item.id || "").trim();
    if (!isShortlistableId(id)) return false;
    var list = readShortlist().filter(function (row) {
      return String(row.id) !== id;
    });
    list.unshift({
      id: id,
      title: String(item.title || id).slice(0, 120),
      addedAt: new Date().toISOString(),
      marketplaceHref: marketplaceHrefFor(id, item.marketplaceHref)
    });
    writeShortlist(list);
    return true;
  }

  function removeItem(id) {
    var list = readShortlist().filter(function (row) {
      return String(row.id) !== String(id);
    });
    writeShortlist(list);
    return true;
  }

  function clearAll() {
    writeShortlist([]);
    return true;
  }

  function toggleItem(item) {
    if (isSaved(item.id)) {
      removeItem(item.id);
      return false;
    }
    addItem(item);
    return true;
  }

  var toastTimer = null;

  function showToast(message) {
    var el = document.getElementById("gw-shortlist-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "gw-shortlist-toast";
      el.className = "gw-shortlist-toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("is-visible");
    }, 2200);
  }

  function syncButton(btn) {
    if (!btn) return;
    var id = btn.getAttribute("data-shortlist-id") || "";
    var saved = isSaved(id);
    btn.classList.toggle("is-saved", saved);
    btn.textContent = saved ? "Saved · tap to remove" : "Save to shortlist";
    btn.setAttribute("aria-pressed", saved ? "true" : "false");
  }

  function decorateContainer(listEl) {
    if (!listEl) return;
    listEl.querySelectorAll(".product-sample-card").forEach(function (card) {
      var link = card.querySelector('a.product-sample-link[href*="product="]');
      if (!link) return;
      var id = extractProductId(link.getAttribute("href") || "");
      if (!isShortlistableId(id)) return;

      var normalizedHref = marketplaceHrefFor(id, link.getAttribute("href") || "");
      link.setAttribute("href", normalizedHref);
      link.setAttribute("target", "_top");
      link.setAttribute("rel", "noopener");
      link.setAttribute("title", "Open on marketplace with grants");

      var titleEl = card.querySelector(".product-sample-name");
      var title = titleEl ? titleEl.textContent.trim() : id;
      var btn = card.querySelector(".product-shortlist-btn");

      if (!btn) {
        btn = document.createElement("button");
        btn.type = "button";
        btn.className = "product-shortlist-btn";
        btn.setAttribute("data-shortlist-id", id);
        btn.setAttribute("data-shortlist-title", title);
        btn.setAttribute("data-shortlist-href", normalizedHref);
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          var saved = toggleItem({
            id: id,
            title: btn.getAttribute("data-shortlist-title") || title,
            marketplaceHref: btn.getAttribute("data-shortlist-href") || normalizedHref
          });
          syncButton(btn);
          showToast(saved ? "Added to your shortlist" : "Removed from shortlist");
          renderSidebar();
        });
        var askBtn = card.querySelector(".product-ask-btn");
        if (askBtn) card.insertBefore(btn, askBtn);
        else card.appendChild(btn);
      } else {
        btn.setAttribute("data-shortlist-id", id);
        btn.setAttribute("data-shortlist-title", title);
        btn.setAttribute("data-shortlist-href", normalizedHref);
      }
      syncButton(btn);
    });
  }

  function decorateAll() {
    decorateContainer(document.querySelector(state.bannerSelector || "#top-product-samples"));
    document.querySelectorAll(".product-samples .product-sample-card").forEach(function (card) {
      var parent = card.parentElement;
      if (parent) decorateContainer(parent);
    });
  }

  function readProfile() {
    try {
      if (global.GreenwaysAgentTeam && typeof global.GreenwaysAgentTeam.readSharedProfile === "function") {
        return global.GreenwaysAgentTeam.readSharedProfile() || {};
      }
      var raw = global.sessionStorage.getItem("gw-team-profile-v1");
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function openMarketplaceTop(href) {
    var url = marketplaceHrefFor("", href) || String(href || "").trim();
    if (!url) return;
    try {
      global.top.location.href = url.charAt(0) === "/" ? url : "/" + url.replace(/^\.\//, "");
    } catch (_) {
      global.location.href = url;
    }
  }

  function handoffToGrants(items) {
    if (!items.length) return;
    var names = items
      .map(function (row) {
        return row.title || row.id;
      })
      .slice(0, 4)
      .join(", ");
    var question = "Which grants apply to my shortlisted products: " + names + "?";
    var profile = readProfile();
    if (global.GreenwaysAgentTeam && typeof global.GreenwaysAgentTeam.writeHandoff === "function") {
      global.GreenwaysAgentTeam.writeHandoff({
        fromSlug: state.agentSlug || "sustainable-products-agent",
        fromName: state.agentName || "Agent",
        toSlug: "grants-agent",
        question: question,
        summary: "Shortlist: " + names,
        topicSummary: "you saved " + items.length + " product(s) to your shortlist",
        fromIntentId: "product_shortlist",
        handoffKey: "",
        profile: profile
      });
      if (profile && typeof global.GreenwaysAgentTeam.writeSharedProfile === "function") {
        global.GreenwaysAgentTeam.writeSharedProfile(profile);
      }
    }
    try {
      global.top.location.href = "/greenways/grants-agent?q=" + encodeURIComponent(question);
    } catch (_) {
      global.location.href = "/greenways/grants-agent?q=" + encodeURIComponent(question);
    }
  }

  function ensureSidebarActions(mount) {
    if (!mount) return null;
    var section = document.getElementById(state.sidebarSectionId || "gw-sidebar-shortlist-section");
    var actions = document.getElementById("gw-shortlist-actions");
    if (!actions && section) {
      actions = document.createElement("div");
      actions.id = "gw-shortlist-actions";
      actions.className = "gw-shortlist-actions";
      section.appendChild(actions);
    }
    return actions;
  }

  function renderSidebar() {
    var section = document.getElementById(state.sidebarSectionId || "gw-sidebar-shortlist-section");
    var mount = document.getElementById(state.sidebarListId || "gw-shortlist-list");
    var countEl = document.getElementById(state.sidebarCountId || "gw-shortlist-count");
    if (!mount) return;

    var items = readShortlist();
    if (section) section.hidden = !items.length;
    if (countEl) countEl.textContent = items.length ? "(" + items.length + ")" : "";

    mount.replaceChildren();
    items.forEach(function (row) {
      var item = document.createElement("div");
      item.className = "gw-shortlist-row";

      var title = document.createElement("span");
      title.className = "gw-shortlist-row-title";
      title.textContent = row.title || row.id;

      var actions = document.createElement("div");
      actions.className = "gw-shortlist-row-actions";

      var open = document.createElement("a");
      open.className = "gw-shortlist-open";
      open.href = row.marketplaceHref || marketplaceHrefFor(row.id);
      open.target = "_top";
      open.rel = "noopener";
      open.title = "Open on marketplace with grants";
      open.textContent = "Open";

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "gw-shortlist-remove";
      remove.textContent = "Remove";
      remove.addEventListener("click", function () {
        removeItem(row.id);
        showToast("Removed from shortlist");
        renderSidebar();
        decorateAll();
      });

      actions.appendChild(open);
      actions.appendChild(remove);
      item.appendChild(title);
      item.appendChild(actions);
      mount.appendChild(item);
    });

    var footer = ensureSidebarActions(mount);
    if (footer) {
      footer.replaceChildren();
      if (items.length) {
        var grantsBtn = document.createElement("button");
        grantsBtn.type = "button";
        grantsBtn.className = "gw-shortlist-grants";
        grantsBtn.textContent = "Check grants with Andrieus";
        grantsBtn.addEventListener("click", function () {
          handoffToGrants(items);
        });

        var clearBtn = document.createElement("button");
        clearBtn.type = "button";
        clearBtn.className = "gw-shortlist-clear";
        clearBtn.textContent = "Clear shortlist";
        clearBtn.addEventListener("click", function () {
          clearAll();
          showToast("Shortlist cleared");
          renderSidebar();
          decorateAll();
        });

        footer.appendChild(grantsBtn);
        footer.appendChild(clearBtn);
      }
    }
  }

  var state = {
    bannerSelector: "#top-product-samples",
    sidebarListId: "gw-shortlist-list",
    sidebarSectionId: "gw-sidebar-shortlist-section",
    sidebarCountId: "gw-shortlist-count",
    agentSlug: "sustainable-products-agent",
    agentName: "Agent"
  };

  var embedListenerBound = false;

  function bindEmbedMessages() {
    if (embedListenerBound) return;
    embedListenerBound = true;
    global.addEventListener("message", function (event) {
      var data = event && event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "gw-open-marketplace") {
        var productId = String(data.productId || data.id || "").trim();
        var href = data.marketplaceHref || (productId ? marketplaceHrefFor(productId) : "");
        if (href) openMarketplaceTop(href);
        return;
      }

      if (data.type === "gw-shortlist-toggle") {
        var id = String(data.id || "").trim();
        if (!isShortlistableId(id)) return;
        var saved = toggleItem({
          id: id,
          title: data.title || id,
          marketplaceHref: data.marketplaceHref || marketplaceHrefFor(id)
        });
        showToast(saved ? "Added to your shortlist" : "Removed from shortlist");
        renderSidebar();
        decorateAll();
      }
    });
  }

  function init(opts) {
    opts = opts || {};
    state.bannerSelector = opts.bannerSelector || state.bannerSelector;
    state.sidebarListId = opts.sidebarListId || state.sidebarListId;
    state.sidebarSectionId = opts.sidebarSectionId || state.sidebarSectionId;
    state.sidebarCountId = opts.sidebarCountId || state.sidebarCountId;
    state.agentSlug = opts.agentSlug || state.agentSlug;
    state.agentName = opts.agentName || state.agentName;

    bindEmbedMessages();
    renderSidebar();
    decorateAll();

    global.addEventListener("gw-shortlist-change", function () {
      renderSidebar();
      decorateAll();
    });
  }

  global.GreenwaysAgentProductShortlist = {
    STORAGE_KEY: STORAGE_KEY,
    init: init,
    readShortlist: readShortlist,
    addItem: addItem,
    removeItem: removeItem,
    clearAll: clearAll,
    toggleItem: toggleItem,
    isSaved: isSaved,
    decorateBanner: decorateContainer,
    decorateContainer: decorateContainer,
    decorateAll: decorateAll,
    renderSidebar: renderSidebar,
    showToast: showToast,
    marketplaceHrefFor: marketplaceHrefFor,
    openMarketplaceTop: openMarketplaceTop
  };
})(typeof window !== "undefined" ? window : globalThis);
