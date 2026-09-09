/**
 * Greenways Organisation Desk — local card store for plan / board / calendar.
 * Storage: localStorage greenways-organisation-desk-v1
 *
 * GOTCHA (Sep 2026): Agent banner decoration uses MutationObserver.
 * Never re-introduce observe(..., { childList: true, subtree: true }) that re-runs
 * decorate on every button textContent/class change — that freezes agent pages
 * (Chrome "Page Unresponsive") and product images never paint.
 * Safe pattern: decorating guard, disconnect while mutating, debounce, subtree:false
 * on the banner root, only write textContent/attrs when values actually change.
 * Smoke after desk/agent banner edits: /greenways/grants-agent must stay interactive
 * with ETL product images visible.
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "greenways-organisation-desk-v1";
  var SHORTLIST_KEY = "greenways-product-shortlist";
  var MAX_CARDS = 80;
  var TYPES = ["product", "news", "deal", "scheme", "module", "note", "suggestion"];
  var STATUSES = ["inbox", "planned", "later", "done"];

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function uid() {
    return "desk_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function normalizeStatus(s) {
    var v = String(s || "inbox").toLowerCase();
    return STATUSES.indexOf(v) >= 0 ? v : "inbox";
  }

  function normalizeType(t) {
    var v = String(t || "note").toLowerCase();
    return TYPES.indexOf(v) >= 0 ? v : "note";
  }

  function normalizeCard(raw) {
    if (!raw || typeof raw !== "object") return null;
    var title = String(raw.title || "").trim();
    if (!title) return null;
    var agent = raw.sourceAgent && typeof raw.sourceAgent === "object" ? raw.sourceAgent : {};
    var date = raw.date ? String(raw.date).slice(0, 10) : null;
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) date = null;
    var card = {
      id: String(raw.id || uid()),
      type: normalizeType(raw.type),
      title: title.slice(0, 160),
      href: String(raw.href || "").trim(),
      refId: String(raw.refId || "").trim(),
      sourceAgent: {
        slug: String(agent.slug || raw.fromSlug || "").trim(),
        name: String(agent.name || raw.fromName || "").trim()
      },
      status: normalizeStatus(raw.status),
      date: date,
      note: String(raw.note || "").slice(0, 500),
      addedAt: String(raw.addedAt || new Date().toISOString())
    };
    if (raw.suggestionMeta && typeof raw.suggestionMeta === "object") {
      card.suggestionMeta = {
        toSlug: String(raw.suggestionMeta.toSlug || "").trim(),
        toName: String(raw.suggestionMeta.toName || "").trim(),
        question: String(raw.suggestionMeta.question || "").trim(),
        handoffKey: String(raw.suggestionMeta.handoffKey || "").trim()
      };
    }
    return card;
  }

  function readCards() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeCard).filter(Boolean);
    } catch (_) {
      return [];
    }
  }

  function writeCards(cards) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify((cards || []).slice(0, MAX_CARDS)));
    } catch (_) {
      /* quota */
    }
    dispatchChange();
    scheduleRemotePush();
  }

  function getAuthToken() {
    try {
      return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("jwt") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("authToken") ||
        ""
      );
    } catch (_) {
      return "";
    }
  }

  function apiBase() {
    try {
      if (global.location && global.location.origin && /^https?:/i.test(global.location.origin)) {
        return global.location.origin;
      }
    } catch (_) {}
    return "";
  }

  function mergeCardLists(localCards, remoteCards) {
    var map = {};
    (remoteCards || []).forEach(function (c) {
      var n = normalizeCard(c);
      if (n) map[n.id] = n;
    });
    (localCards || []).forEach(function (c) {
      var n = normalizeCard(c);
      if (!n) return;
      if (!map[n.id]) {
        map[n.id] = n;
        return;
      }
      var localTs = Date.parse(n.addedAt || 0) || 0;
      var remoteTs = Date.parse(map[n.id].addedAt || 0) || 0;
      if (localTs >= remoteTs) map[n.id] = n;
    });
    return Object.keys(map)
      .map(function (k) {
        return map[k];
      })
      .slice(0, MAX_CARDS);
  }

  var pushTimer = null;
  var syncState = { status: "local", lastError: "", updatedAt: null };

  function getSyncState() {
    return {
      status: syncState.status,
      lastError: syncState.lastError,
      updatedAt: syncState.updatedAt,
      hasToken: !!getAuthToken()
    };
  }

  function scheduleRemotePush() {
    if (!getAuthToken()) {
      syncState.status = "local";
      return;
    }
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(function () {
      pushTimer = null;
      pushRemoteDesk();
    }, 900);
  }

  function pushRemoteDesk() {
    var token = getAuthToken();
    if (!token) {
      syncState.status = "local";
      return Promise.resolve({ ok: false, reason: "no-token" });
    }
    syncState.status = "saving";
    return fetch(apiBase() + "/api/members/organisation-desk", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ cards: readCards() })
    })
      .then(function (res) {
        if (res.status === 401 || res.status === 403) {
          syncState.status = "local";
          syncState.lastError = "auth";
          return { ok: false, reason: "auth" };
        }
        if (!res.ok) throw new Error("save " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data || data.ok === false) return data;
        syncState.status = "synced";
        syncState.lastError = "";
        syncState.updatedAt = data.updatedAt || new Date().toISOString();
        try {
          global.dispatchEvent(new CustomEvent("gw-desk-sync", { detail: getSyncState() }));
        } catch (_) {}
        return data;
      })
      .catch(function (err) {
        syncState.status = "error";
        syncState.lastError = String((err && err.message) || "save-failed");
        try {
          global.dispatchEvent(new CustomEvent("gw-desk-sync", { detail: getSyncState() }));
        } catch (_) {}
        return { ok: false, reason: "error" };
      });
  }

  /** Pull member desk and merge into localStorage. Never wipes local on failure. */
  function pullRemoteDesk() {
    var token = getAuthToken();
    if (!token) {
      syncState.status = "local";
      return Promise.resolve({ ok: false, reason: "no-token", cards: readCards() });
    }
    syncState.status = "loading";
    return fetch(apiBase() + "/api/members/organisation-desk", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(function (res) {
        if (res.status === 401 || res.status === 403) {
          syncState.status = "local";
          syncState.lastError = "auth";
          return null;
        }
        if (!res.ok) throw new Error("load " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data) return { ok: false, reason: "auth", cards: readCards() };
        var remote = Array.isArray(data.cards) ? data.cards : [];
        var merged = mergeCardLists(readCards(), remote);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged.slice(0, MAX_CARDS)));
        } catch (_) {}
        syncState.status = "synced";
        syncState.lastError = "";
        syncState.updatedAt = data.updatedAt || null;
        dispatchChange();
        try {
          global.dispatchEvent(new CustomEvent("gw-desk-sync", { detail: getSyncState() }));
        } catch (_) {}
        /* Push merge so server catches local-only or newer local cards */
        scheduleRemotePush();
        return { ok: true, cards: merged, updatedAt: data.updatedAt };
      })
      .catch(function (err) {
        syncState.status = "error";
        syncState.lastError = String((err && err.message) || "load-failed");
        try {
          global.dispatchEvent(new CustomEvent("gw-desk-sync", { detail: getSyncState() }));
        } catch (_) {}
        return { ok: false, reason: "error", cards: readCards() };
      });
  }

  function weekMailtoHref(anchorDate) {
    var body = formatWeekPlanText(anchorDate);
    var subject = "Greenways Organisation Desk — this week";
    return (
      "mailto:?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body.slice(0, 1800))
    );
  }

  function dispatchChange() {
    try {
      global.dispatchEvent(new CustomEvent("gw-desk-change", { detail: { cards: readCards() } }));
    } catch (_) {}
  }

  function findByRef(refId, type) {
    var ref = String(refId || "").trim();
    if (!ref) return null;
    return (
      readCards().find(function (c) {
        return c.refId === ref && (!type || c.type === type);
      }) || null
    );
  }

  function addCard(input) {
    var card = normalizeCard(input);
    if (!card) return null;
    var list = readCards();
    if (card.refId) {
      var existing = list.find(function (c) {
        return c.refId === card.refId && c.type === card.type;
      });
      if (existing) {
        existing.title = card.title || existing.title;
        existing.href = card.href || existing.href;
        if (card.sourceAgent.slug) existing.sourceAgent = card.sourceAgent;
        if (card.note) existing.note = card.note;
        if (card.date) existing.date = card.date;
        if (card.suggestionMeta) existing.suggestionMeta = card.suggestionMeta;
        writeCards(list);
        return existing;
      }
    }
    list.unshift(card);
    writeCards(list);
    return card;
  }

  function updateCard(id, patch) {
    var list = readCards();
    var idx = list.findIndex(function (c) {
      return c.id === String(id);
    });
    if (idx < 0) return null;
    var merged = normalizeCard(Object.assign({}, list[idx], patch || {}, { id: list[idx].id }));
    if (!merged) return null;
    list[idx] = merged;
    writeCards(list);
    return merged;
  }

  function removeCard(id) {
    writeCards(
      readCards().filter(function (c) {
        return c.id !== String(id);
      })
    );
    return true;
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

  function addProduct(item) {
    var id = String((item && item.id) || "").trim();
    if (!id) return null;
    return addCard({
      type: "product",
      title: (item && item.title) || id,
      href: marketplaceHrefFor(id, item && item.marketplaceHref),
      refId: id,
      sourceAgent: {
        slug: (item && (item.fromSlug || item.agentSlug)) || "",
        name: (item && (item.fromName || item.agentName)) || ""
      },
      status: "inbox",
      note: (item && item.note) || ""
    });
  }

  function addTypedItem(item) {
    item = item || {};
    var type = normalizeType(item.type || "note");
    if (type === "product") return addProduct(item);
    var refId = String(item.refId || item.id || "").trim();
    return addCard({
      type: type,
      title: item.title || type,
      href: item.href || item.url || "",
      refId: refId,
      sourceAgent: {
        slug: item.fromSlug || item.agentSlug || (item.sourceAgent && item.sourceAgent.slug) || "",
        name: item.fromName || item.agentName || (item.sourceAgent && item.sourceAgent.name) || ""
      },
      status: item.status || "inbox",
      date: item.date || null,
      note: item.note || ""
    });
  }

  function importShortlist() {
    var rows = [];
    try {
      var raw = sessionStorage.getItem(SHORTLIST_KEY);
      rows = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(rows)) rows = [];
    } catch (_) {
      rows = [];
    }
    var added = 0;
    rows.forEach(function (row) {
      if (!row || !row.id) return;
      var before = findByRef(row.id, "product");
      addProduct(row);
      if (!before) added += 1;
    });
    return { imported: rows.length, added: added };
  }

  function isOnDesk(refId, type) {
    return !!findByRef(refId, type || "product");
  }

  function pendingSuggestions() {
    return readCards().filter(function (c) {
      return c.type === "suggestion" && c.status === "inbox";
    });
  }

  function queueHandoffSuggestion(brief) {
    if (!brief || typeof brief !== "object") return null;
    var fromName = String(brief.fromName || "Specialist").trim();
    var toSlug = String(brief.toSlug || "").trim();
    var question = String(brief.question || "").trim();
    var summary = String(brief.summary || brief.topicSummary || "").trim();
    var createdAt = String(brief.createdAt || new Date().toISOString());
    var refId = "handoff_" + (brief.handoffKey || "") + "_" + createdAt.slice(0, 19);
    var title = fromName + (toSlug ? " → " + toSlug.replace(/-agent$/, "") : "") + (question ? ": " + question.slice(0, 80) : "");
    var href = toSlug
      ? "/greenways/" + toSlug + (question ? "?q=" + encodeURIComponent(question) : "")
      : "";
    return addCard({
      type: "suggestion",
      title: title.slice(0, 160),
      href: href,
      refId: refId,
      status: "inbox",
      note: summary.slice(0, 500),
      sourceAgent: { slug: brief.fromSlug || "", name: fromName },
      suggestionMeta: {
        toSlug: toSlug,
        toName: "",
        question: question,
        handoffKey: String(brief.handoffKey || "").trim()
      }
    });
  }

  function ingestOpenHandoff() {
    try {
      if (!global.GreenwaysAgentTeam || typeof global.GreenwaysAgentTeam.readHandoff !== "function") return null;
      var brief = global.GreenwaysAgentTeam.readHandoff();
      if (!brief || brief.deskIngested) return null;
      var card = queueHandoffSuggestion(brief);
      brief.deskIngested = true;
      if (typeof global.GreenwaysAgentTeam.writeHandoffRaw === "function") {
        global.GreenwaysAgentTeam.writeHandoffRaw(brief);
      } else if (typeof global.GreenwaysAgentTeam.writeHandoff === "function") {
        /* keep handoff for agent welcome; only mark via session if possible */
        try {
          sessionStorage.setItem("gw-team-handoff-v1", JSON.stringify(brief));
        } catch (_) {}
      }
      return card;
    } catch (_) {
      return null;
    }
  }

  function acceptSuggestion(id) {
    var card = readCards().find(function (c) {
      return c.id === String(id) && c.type === "suggestion";
    });
    if (!card) return null;
    return updateCard(id, { status: "planned" });
  }

  function dismissSuggestion(id) {
    return removeCard(id);
  }

  var toastTimer = null;
  function showToast(message, actionHref, actionLabel) {
    var el = document.getElementById("gw-desk-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "gw-desk-toast";
      el.className = "gw-desk-toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.innerHTML = "";
    var span = document.createElement("span");
    span.textContent = message;
    el.appendChild(span);
    if (actionHref) {
      var a = document.createElement("a");
      a.href = actionHref;
      a.target = "_top";
      a.rel = "noopener";
      a.textContent = actionLabel || "Open desk";
      el.appendChild(a);
    }
    el.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("is-visible");
    }, 3200);
  }

  function deskHref() {
    return "/greenways/organisation-desk";
  }

  function defaultAgentSlugForCard(card) {
    if (!card) return "equipment-agent";
    if (card.suggestionMeta && card.suggestionMeta.toSlug) return card.suggestionMeta.toSlug;
    if (card.sourceAgent && card.sourceAgent.slug) return card.sourceAgent.slug;
    var t = card.type || "note";
    if (t === "news") return "media-agent";
    if (t === "deal") return "deals-agent";
    if (t === "scheme") return "grants-agent";
    if (t === "product") return "equipment-agent";
    if (t === "module") return "media-agent";
    return "equipment-agent";
  }

  function askHrefForCard(card) {
    var slug = defaultAgentSlugForCard(card);
    var title = (card && card.title) || "this item";
    var question =
      card && card.suggestionMeta && card.suggestionMeta.question
        ? card.suggestionMeta.question
        : "Tell me more about " + title + " for my business profile";
    if (slug === "orchestra-hub" || slug === "guide-agent") {
      return "/greenways/orchestra-hub?q=" + encodeURIComponent(question);
    }
    return "/greenways/" + slug + "?q=" + encodeURIComponent(question);
  }

  function startOfWeek(d) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var day = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - day);
    return x;
  }

  function ymdLocal(d) {
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }

  function cardsForWeek(anchorDate) {
    var start = startOfWeek(anchorDate || new Date());
    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      var key = ymdLocal(d);
      days.push({
        date: key,
        label: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
        isToday: key === ymdLocal(new Date()),
        cards: readCards().filter(function (c) {
          return c.date === key;
        })
      });
    }
    return { start: ymdLocal(start), days: days };
  }

  function formatWeekPlanText(anchorDate) {
    var week = cardsForWeek(anchorDate);
    var lines = ["Greenways Organisation Desk — this week", "Week of " + week.start, ""];
    week.days.forEach(function (day) {
      lines.push(day.label + (day.isToday ? " (today)" : ""));
      if (!day.cards.length) {
        lines.push("  — none —");
      } else {
        day.cards.forEach(function (c) {
          lines.push("  • [" + c.type + "] " + c.title + (c.href ? " — " + c.href : ""));
        });
      }
      lines.push("");
    });
    var undated = readCards().filter(function (c) {
      return c.status === "planned" && !c.date;
    });
    if (undated.length) {
      lines.push("This week (no date yet)");
      undated.forEach(function (c) {
        lines.push("  • [" + c.type + "] " + c.title);
      });
    }
    return lines.join("\n");
  }

  function extractProductId(href) {
    try {
      var match = String(href || "").match(/[?&]product=([^&]+)/i);
      return match ? decodeURIComponent(match[1]) : "";
    } catch (_) {
      return "";
    }
  }

  function inferCardType(cardEl, agentSlug) {
    var forced = (cardEl.getAttribute("data-desk-type") || "").toLowerCase();
    if (forced && TYPES.indexOf(forced) >= 0) return forced;
    if (cardEl.classList.contains("is-news")) return "news";
    if (cardEl.classList.contains("is-module") && /news|sustainability-news/i.test(cardEl.innerHTML)) return "news";
    if (/deals-agent/.test(agentSlug)) return "deal";
    if (/media-agent/.test(agentSlug) && cardEl.classList.contains("is-module")) return "news";
    return "product";
  }

  function ensureDeskButton(card, meta) {
    var btn = card.querySelector(".product-desk-btn");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "product-desk-btn";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var type = btn.getAttribute("data-desk-type") || "product";
        var refId = btn.getAttribute("data-desk-id") || "";
        var title = btn.getAttribute("data-desk-title") || refId;
        var href = btn.getAttribute("data-desk-href") || "";
        var onDesk = isOnDesk(refId, type);
        if (onDesk) {
          var existing = findByRef(refId, type);
          if (existing) removeCard(existing.id);
          syncDeskButton(btn, refId, type);
          showToast("Removed from Organisation Desk");
          return;
        }
        addTypedItem({
          type: type,
          id: refId,
          refId: refId,
          title: title,
          href: href,
          fromSlug: state.agentSlug,
          fromName: state.agentName
        });
        syncDeskButton(btn, refId, type);
        showToast("Saved to Organisation Desk", deskHref(), "Open desk");
      });
      var shortBtn = card.querySelector(".product-shortlist-btn");
      var askBtn = card.querySelector(".product-ask-btn");
      if (shortBtn && shortBtn.nextSibling) card.insertBefore(btn, shortBtn.nextSibling);
      else if (askBtn) card.insertBefore(btn, askBtn);
      else card.appendChild(btn);
    }
    if (btn.getAttribute("data-desk-type") !== meta.type) btn.setAttribute("data-desk-type", meta.type);
    if (btn.getAttribute("data-desk-id") !== meta.refId) btn.setAttribute("data-desk-id", meta.refId);
    if (btn.getAttribute("data-desk-title") !== meta.title) btn.setAttribute("data-desk-title", meta.title);
    var hrefVal = meta.href || "";
    if (btn.getAttribute("data-desk-href") !== hrefVal) btn.setAttribute("data-desk-href", hrefVal);
    syncDeskButton(btn, meta.refId, meta.type);
  }

  function syncDeskButton(btn, refId, type) {
    if (!btn) return;
    var on = isOnDesk(refId, type || "product");
    var label = on ? "On desk · tap to remove" : "Add to desk";
    var pressed = on ? "true" : "false";
    if (btn.classList.contains("is-saved") !== on) {
      btn.classList.toggle("is-saved", on);
    }
    if (btn.textContent !== label) {
      btn.textContent = label;
    }
    if (btn.getAttribute("aria-pressed") !== pressed) {
      btn.setAttribute("aria-pressed", pressed);
    }
  }

  var decorating = false;

  /** Decorate banner / sample cards (products, news, deals). */
  function decorateSaveableCards(opts) {
    if (decorating) return;
    decorating = true;
    var observed = state.observer;
    if (observed) {
      try {
        observed.disconnect();
      } catch (_) {}
    }
    try {
      opts = opts || {};
      var agentSlug = opts.agentSlug || state.agentSlug || "";
      var roots = [];
      var seen = [];
      function pushRoot(el) {
        if (!el || seen.indexOf(el) >= 0) return;
        seen.push(el);
        roots.push(el);
      }
      if (opts.bannerSelector || state.bannerSelector) {
        pushRoot(document.querySelector(opts.bannerSelector || state.bannerSelector));
      }
      document.querySelectorAll(".product-samples").forEach(pushRoot);
      if (!roots.length) {
        pushRoot(document.querySelector("#top-product-samples"));
      }

      roots.forEach(function (root) {
        root.querySelectorAll(".product-sample-card").forEach(function (card) {
          var link = card.querySelector("a.product-sample-link, button.product-sample-link");
          var href = "";
          if (link) {
            href = link.getAttribute("href") || "";
            if (!href && link.getAttribute("data-module-open")) {
              href = "/greenways/organisation-desk";
            }
          }
          var titleEl = card.querySelector(".product-sample-name");
          var title = titleEl ? titleEl.textContent.trim() : "";
          var type = inferCardType(card, agentSlug);
          var productId = extractProductId(href);
          var refId =
            card.getAttribute("data-desk-id") ||
            productId ||
            (title ? type + "_" + title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 48) : "");
          if (!refId || !title) return;
          if (type === "product" && !/^(etl_|sust_)/i.test(refId) && !productId) {
            type = /media-agent/.test(agentSlug) ? "news" : /deals-agent/.test(agentSlug) ? "deal" : "note";
          }
          if (type === "product" && productId) {
            href = marketplaceHrefFor(productId, href);
            refId = productId;
          }
          ensureDeskButton(card, { type: type, refId: refId, title: title, href: href });
        });
      });
    } finally {
      decorating = false;
      if (observed) {
        var el = document.querySelector(state.bannerSelector);
        if (el) {
          try {
            observed.observe(el, { childList: true, subtree: false });
          } catch (_) {}
        }
      }
    }
  }

  function decorateSchemeTablets(root) {
    if (decorating) return;
    var scope = root || document;
    scope.querySelectorAll(".scheme-tablet-desk").forEach(function (btn) {
      var refId = btn.getAttribute("data-desk-id") || "";
      syncDeskButton(btn, refId, "scheme");
    });
  }

  var deskClickBound = false;
  function bindDeskClicks() {
    if (deskClickBound) return;
    deskClickBound = true;
    document.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest(".scheme-tablet-desk") : null;
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var refId = btn.getAttribute("data-desk-id") || "";
      var title = btn.getAttribute("data-desk-title") || "Scheme";
      var href = btn.getAttribute("data-desk-href") || "";
      var date = btn.getAttribute("data-desk-date") || null;
      if (!refId) return;
      if (isOnDesk(refId, "scheme")) {
        var existing = findByRef(refId, "scheme");
        if (existing) removeCard(existing.id);
        syncDeskButton(btn, refId, "scheme");
        showToast("Removed from Organisation Desk");
        return;
      }
      addTypedItem({
        type: "scheme",
        refId: refId,
        title: title,
        href: href,
        date: date,
        fromSlug: state.agentSlug || "grants-agent",
        fromName: state.agentName || "Andrieus"
      });
      syncDeskButton(btn, refId, "scheme");
      showToast("Scheme saved to Organisation Desk", deskHref(), "Open desk");
    });
  }

  var state = {
    agentSlug: "",
    agentName: "",
    bannerSelector: "#top-product-samples",
    observer: null,
    chatObserver: null
  };

  function observeBanner() {
    var el = document.querySelector(state.bannerSelector);
    if (!el || typeof MutationObserver === "undefined") return;
    if (state.observer) state.observer.disconnect();
    var timer = null;
    state.observer = new MutationObserver(function () {
      if (decorating) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        timer = null;
        decorateSaveableCards(state);
      }, 50);
    });
    /* childList only on the banner root — not subtree — so button text updates cannot loop */
    state.observer.observe(el, { childList: true, subtree: false });
  }

  function observeChatForSchemes() {
    var chat = document.getElementById("chat-log") || document.querySelector(".chat-log, #messages, .guide-messages");
    if (!chat || typeof MutationObserver === "undefined") return;
    if (state.chatObserver) state.chatObserver.disconnect();
    var timer = null;
    state.chatObserver = new MutationObserver(function () {
      if (decorating) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        timer = null;
        decorateSchemeTablets(chat);
      }, 80);
    });
    state.chatObserver.observe(chat, { childList: true, subtree: true });
    decorateSchemeTablets(chat);
  }

  function init(opts) {
    opts = opts || {};
    state.agentSlug = opts.agentSlug || state.agentSlug;
    state.agentName = opts.agentName || state.agentName;
    state.bannerSelector = opts.bannerSelector || state.bannerSelector;
    decorateSaveableCards(state);
    observeBanner();
    bindDeskClicks();
    if (/grants-agent|finance-agent/.test(state.agentSlug) || opts.watchSchemes) {
      observeChatForSchemes();
    }
    global.addEventListener("gw-desk-change", function () {
      decorateSaveableCards(state);
      decorateSchemeTablets(document);
    });
    return api;
  }

  var api = {
    STORAGE_KEY: STORAGE_KEY,
    SHORTLIST_KEY: SHORTLIST_KEY,
    TYPES: TYPES,
    STATUSES: STATUSES,
    readCards: readCards,
    writeCards: writeCards,
    addCard: addCard,
    addProduct: addProduct,
    addTypedItem: addTypedItem,
    updateCard: updateCard,
    removeCard: removeCard,
    findByRef: findByRef,
    isOnDesk: isOnDesk,
    importShortlist: importShortlist,
    pendingSuggestions: pendingSuggestions,
    queueHandoffSuggestion: queueHandoffSuggestion,
    ingestOpenHandoff: ingestOpenHandoff,
    acceptSuggestion: acceptSuggestion,
    dismissSuggestion: dismissSuggestion,
    decorateProductCards: decorateSaveableCards,
    decorateSaveableCards: decorateSaveableCards,
    decorateSchemeTablets: decorateSchemeTablets,
    showToast: showToast,
    deskHref: deskHref,
    escapeHtml: escapeHtml,
    defaultAgentSlugForCard: defaultAgentSlugForCard,
    askHrefForCard: askHrefForCard,
    cardsForWeek: cardsForWeek,
    formatWeekPlanText: formatWeekPlanText,
    weekMailtoHref: weekMailtoHref,
    pullRemoteDesk: pullRemoteDesk,
    pushRemoteDesk: pushRemoteDesk,
    getSyncState: getSyncState,
    getAuthToken: getAuthToken,
    ymdLocal: ymdLocal,
    startOfWeek: startOfWeek,
    init: init
  };

  global.GreenwaysOrganisationDesk = api;
})(typeof window !== "undefined" ? window : globalThis);
