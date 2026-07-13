/**
 * Greenways product shortlist — sessionStorage pilot for agent banner cards.
 * GreenwaysAgentProductShortlist.init({ bannerSelector, sidebarListId, sidebarSectionId })
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
    if (existing) return String(existing);
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

  function decorateBanner(listEl) {
    if (!listEl) return;
    listEl.querySelectorAll(".product-sample-card").forEach(function (card) {
      var link = card.querySelector('a.product-sample-link[href*="product="]');
      if (!link) return;
      var id = extractProductId(link.getAttribute("href") || "");
      if (!isShortlistableId(id)) return;

      var titleEl = card.querySelector(".product-sample-name");
      var title = titleEl ? titleEl.textContent.trim() : id;
      var btn = card.querySelector(".product-shortlist-btn");

      if (!btn) {
        btn = document.createElement("button");
        btn.type = "button";
        btn.className = "product-shortlist-btn";
        btn.setAttribute("data-shortlist-id", id);
        btn.setAttribute("data-shortlist-title", title);
        btn.setAttribute("data-shortlist-href", link.getAttribute("href") || "");
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          var saved = toggleItem({
            id: id,
            title: btn.getAttribute("data-shortlist-title") || title,
            marketplaceHref: btn.getAttribute("data-shortlist-href") || ""
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
        btn.setAttribute("data-shortlist-href", link.getAttribute("href") || "");
      }
      syncButton(btn);
    });
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
      open.textContent = "Open";

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "gw-shortlist-remove";
      remove.textContent = "Remove";
      remove.addEventListener("click", function () {
        removeItem(row.id);
        showToast("Removed from shortlist");
        renderSidebar();
        decorateBanner(document.querySelector(state.bannerSelector || "#top-product-samples"));
      });

      actions.appendChild(open);
      actions.appendChild(remove);
      item.appendChild(title);
      item.appendChild(actions);
      mount.appendChild(item);
    });
  }

  var state = {
    bannerSelector: "#top-product-samples",
    sidebarListId: "gw-shortlist-list",
    sidebarSectionId: "gw-sidebar-shortlist-section",
    sidebarCountId: "gw-shortlist-count"
  };

  function init(opts) {
    opts = opts || {};
    state.bannerSelector = opts.bannerSelector || state.bannerSelector;
    state.sidebarListId = opts.sidebarListId || state.sidebarListId;
    state.sidebarSectionId = opts.sidebarSectionId || state.sidebarSectionId;
    state.sidebarCountId = opts.sidebarCountId || state.sidebarCountId;

    renderSidebar();
    decorateBanner(document.querySelector(state.bannerSelector));

    global.addEventListener("gw-shortlist-change", function () {
      renderSidebar();
      decorateBanner(document.querySelector(state.bannerSelector));
    });
  }

  global.GreenwaysAgentProductShortlist = {
    STORAGE_KEY: STORAGE_KEY,
    init: init,
    readShortlist: readShortlist,
    addItem: addItem,
    removeItem: removeItem,
    toggleItem: toggleItem,
    isSaved: isSaved,
    decorateBanner: decorateBanner,
    renderSidebar: renderSidebar,
    showToast: showToast
  };
})(typeof window !== "undefined" ? window : globalThis);
