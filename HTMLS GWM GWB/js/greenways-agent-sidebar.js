/**
 * Shared Greenways agent sidebar — quick link cards + ask helper cards + proactive nudges (W6).
 * GreenwaysAgentSidebar.init({ quickLinks, helpers, agentSlug, onAsk, onQuickLinkClick, ... })
 */
(function (global) {
  var highlightsCache = null;

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
    var href = String(link.href || "#").trim();
    if (/^\.\//.test(href)) return gwbPageHref(href.replace(/^\.\//, ""));
    return href;
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

      if (link.mapOpen || link.moduleOpen) {
        el = document.createElement("button");
        el.type = "button";
        if (link.mapOpen) el.setAttribute("data-map-open", "1");
        if (link.moduleOpen) {
          el.setAttribute("data-module-open", link.moduleId || link.id || "");
          if (link.href) el.setAttribute("data-module-href", resolveHref(link));
          if (link.moduleQuery) el.setAttribute("data-module-query", link.moduleQuery);
        }
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
        if (link.moduleOpen && global.GreenwaysAgentContentModule) {
          e.preventDefault();
          if (typeof opts.onQuickLinkClick === "function") {
            opts.onQuickLinkClick(link, el, e);
          } else {
            GreenwaysAgentContentModule.openFromTrigger(el);
          }
          return;
        }
        if (typeof opts.onQuickLinkClick === "function") {
          opts.onQuickLinkClick(link, el, e);
        }
      });

      mount.appendChild(el);
    });
  }

  function helperDisplayName(name) {
    return String(name || "").replace(/ /g, "\u00a0");
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
      name.textContent = helperDisplayName(h.name);

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

  function detectAgentSlug(opts) {
    if (opts && opts.agentSlug) return String(opts.agentSlug).trim();
    try {
      var m = (global.location.pathname || "").match(/\/greenways\/([^/?]+)/);
      return m ? m[1] : "";
    } catch (_) {
      return "";
    }
  }

  function readSharedProfile() {
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

  function stripMarkdown(text) {
    return String(text || "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      .replace(/\n+/g, " ")
      .trim();
  }

  function teaserFromAnswer(answer) {
    var plain = stripMarkdown(answer);
    if (!plain) return "";
    var sentence = plain.split(/(?<=[.!?])\s+/)[0] || plain;
    if (sentence.length > 150) sentence = sentence.slice(0, 147) + "…";
    return sentence;
  }

  function pickModuleItem(highlight) {
    var blocks = highlight && highlight.blocks;
    if (!Array.isArray(blocks)) return null;
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      if (block && block.type === "module" && Array.isArray(block.items) && block.items[0]) {
        return block.items[0];
      }
    }
    return null;
  }

  function pickHighlightTitle(highlight) {
    var mod = pickModuleItem(highlight);
    if (mod && mod.title) return mod.title;
    if (highlight.suggestions && highlight.suggestions[0] && highlight.suggestions[0].title) {
      return highlight.suggestions[0].title;
    }
    if (highlight.question) return highlight.question;
    return "This week";
  }

  function highlightsUrl() {
    return contentBase() + "/data/greenways-agent-highlights.json";
  }

  function loadHighlightsData() {
    if (highlightsCache) return Promise.resolve(highlightsCache);
    return fetch(highlightsUrl())
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        highlightsCache = data && Array.isArray(data.agents) ? data : null;
        return highlightsCache;
      })
      .catch(function () {
        return null;
      });
  }

  function findAgentHighlight(data, slug) {
    if (!data || !slug) return null;
    return (
      data.agents.find(function (row) {
        return row.slug === slug;
      }) || null
    );
  }

  function ensureHighlightSection(sidebar, slug) {
    if (!sidebar) return null;
    var existing = document.getElementById("gw-sidebar-highlight-section");
    if (existing) return existing;

    var section = document.createElement("div");
    section.id = "gw-sidebar-highlight-section";
    section.className = "sidebar-section sidebar-section--highlight";
    section.hidden = true;
    section.innerHTML =
      '<div class="sidebar-label">This week <span class="gw-highlight-week" id="gw-highlight-week"></span></div>' +
      '<div id="gw-sidebar-highlight-mount"></div>';

    var opsSection = sidebar.querySelector(".sidebar-section:not(.sidebar-section--helpers):not(.sidebar-section--links):not(.sidebar-section--shortlist)");
    var insertBefore =
      slug === "systems-agent" && opsSection
        ? opsSection.nextElementSibling
        : sidebar.firstElementChild;

    if (insertBefore) sidebar.insertBefore(section, insertBefore);
    else sidebar.appendChild(section);
    return section;
  }

  function renderWeeklyHighlight(slug, opts) {
    var sidebar = document.querySelector(".guide-sidebar");
    var section = ensureHighlightSection(sidebar, slug);
    var mount = document.getElementById("gw-sidebar-highlight-mount");
    var weekEl = document.getElementById("gw-highlight-week");
    if (!section || !mount) return;

    loadHighlightsData().then(function (data) {
      var row = findAgentHighlight(data, slug);
      var highlight = row && row.highlight;
      if (!highlight || !highlight.answer) {
        section.hidden = true;
        return;
      }

      if (weekEl && data.meta && data.meta.weekLabel) {
        weekEl.textContent = "· " + data.meta.weekLabel.replace(/^Week snapshot\s*·\s*/i, "");
      }

      var title = pickHighlightTitle(highlight);
      var teaser = teaserFromAnswer(highlight.answer);
      var mod = pickModuleItem(highlight);
      var question = highlight.question || "";

      mount.replaceChildren();

      var card = document.createElement("article");
      card.className = "gw-sidebar-highlight-card";

      var titleEl = document.createElement("h3");
      titleEl.className = "gw-sidebar-highlight-title";
      titleEl.textContent = title;

      var teaserEl = document.createElement("p");
      teaserEl.className = "gw-sidebar-highlight-teaser";
      teaserEl.textContent = teaser;

      var actions = document.createElement("div");
      actions.className = "gw-sidebar-highlight-actions";

      if (question && typeof opts.onAsk === "function") {
        var askBtn = document.createElement("button");
        askBtn.type = "button";
        askBtn.className = "gw-sidebar-highlight-ask";
        askBtn.textContent = "Ask this";
        askBtn.addEventListener("click", function () {
          opts.onAsk(question, { source: "weekly-highlight" });
        });
        actions.appendChild(askBtn);
      }

      if (mod && mod.moduleId) {
        var openBtn = document.createElement("button");
        openBtn.type = "button";
        openBtn.className = "gw-sidebar-highlight-open";
        openBtn.textContent = "Open";
        openBtn.setAttribute("data-module-open", mod.moduleId);
        if (mod.href) openBtn.setAttribute("data-module-href", mod.href);
        openBtn.addEventListener("click", function (e) {
          e.preventDefault();
          if (global.GreenwaysAgentContentModule) {
            global.GreenwaysAgentContentModule.openFromTrigger(openBtn);
          }
        });
        actions.appendChild(openBtn);
      }

      card.appendChild(titleEl);
      card.appendChild(teaserEl);
      if (actions.childNodes.length) card.appendChild(actions);
      mount.appendChild(card);

      section.hidden = false;
    });
  }

  function parseSchemeDeadline(raw) {
    var s = String(raw || "").trim();
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + "T12:00:00");
    if (/^\d{4}$/.test(s)) return new Date(s + "-12-31T12:00:00");
    return null;
  }

  function regionMatchesScheme(profileRegion, schemeRegion) {
    var p = String(profileRegion || "").toLowerCase();
    var r = String(schemeRegion || "eu").toLowerCase();
    if (!p || p === "eu") return true;
    if (p === r) return true;
    if (p.indexOf("uk") === 0 && r.indexOf("uk") === 0) return true;
    if (p === "netherlands" && r === "nl") return true;
    return r === "eu";
  }

  function loadSchemes() {
    return fetch(contentBase() + "/api/schemes")
      .then(function (res) {
        if (res.ok) return res.json();
        return fetch(contentBase() + "/schemes.json").then(function (r2) {
          return r2.ok ? r2.json() : [];
        });
      })
      .then(function (data) {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.schemes)) return data.schemes;
        return [];
      })
      .catch(function () {
        return [];
      });
  }

  function findUpcomingGrantDeadline(schemes, profileRegion) {
    var now = new Date();
    var horizon = new Date(now.getTime());
    horizon.setDate(horizon.getDate() + 90);
    var best = null;

    schemes.forEach(function (scheme) {
      if (!scheme || !scheme.deadline) return;
      if (!regionMatchesScheme(profileRegion, scheme.region)) return;
      var when = parseSchemeDeadline(scheme.deadline);
      if (!when || when < now || when > horizon) return;
      if (!best || when < best.when) {
        best = { scheme: scheme, when: when };
      }
    });

    return best;
  }

  function formatDeadlineDate(date) {
    try {
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch (_) {
      return String(date).slice(0, 10);
    }
  }

  function renderGrantDeadlineChip(slug, opts) {
    if (slug !== "grants-agent") return;
    var mount = document.getElementById("gw-sidebar-highlight-mount");
    var section = document.getElementById("gw-sidebar-highlight-section");
    if (!mount) return;

    mount.querySelectorAll(".gw-sidebar-deadline-chip").forEach(function (chip) {
      chip.remove();
    });

    var profile = readSharedProfile();
    var region =
      profile.region ||
      (document.getElementById("profile-region") && document.getElementById("profile-region").value) ||
      "";

    loadSchemes().then(function (schemes) {
      var hit = findUpcomingGrantDeadline(schemes, region);
      if (!hit) return;

      var chip = document.createElement("div");
      chip.className = "gw-sidebar-deadline-chip";
      chip.innerHTML =
        '<span class="gw-sidebar-deadline-label">Upcoming deadline</span>' +
        '<strong class="gw-sidebar-deadline-title">' +
        escapeHtml(hit.scheme.title || "Scheme") +
        "</strong>" +
        '<span class="gw-sidebar-deadline-date">' +
        escapeHtml(formatDeadlineDate(hit.when)) +
        "</span>";

      var openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "gw-sidebar-deadline-open";
      openBtn.textContent = "Schemes portal";
      var moduleId =
        String(region || "").toLowerCase() === "uk" ? "schemes-portal-eu" : "schemes-portal-restaurant";
      openBtn.setAttribute("data-module-open", moduleId);
      openBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (global.GreenwaysAgentContentModule) {
          global.GreenwaysAgentContentModule.openById(moduleId);
        }
      });
      chip.appendChild(openBtn);
      mount.appendChild(chip);
      if (section) section.hidden = false;
    });
  }

  function refreshProactiveNudges(slug, opts) {
    if (!slug) slug = detectAgentSlug(opts);
    if (!slug) return;
    renderWeeklyHighlight(slug, opts);
    renderGrantDeadlineChip(slug, opts);
    if (typeof opts.onProfileRegionChange === "function") {
      opts.onProfileRegionChange(readSharedProfile());
    }
  }

  function bindProfileRefresh(slug, opts) {
    var refresh = function () {
      refreshProactiveNudges(slug, opts);
    };
    var regionEl = document.getElementById("profile-region");
    if (regionEl) regionEl.addEventListener("change", refresh);
    global.addEventListener("storage", function (e) {
      if (e.key === "gw-team-profile-v1") refresh();
    });
    global.addEventListener("gw-profile-changed", refresh);
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

    var slug = detectAgentSlug(opts);
    if (slug) {
      renderWeeklyHighlight(slug, opts);
      renderGrantDeadlineChip(slug, opts);
      bindProfileRefresh(slug, opts);
    }

    return { linksMount: linksMount, helpersMount: helpersMount };
  }

  global.GreenwaysAgentSidebar = {
    init: init,
    renderQuickLinks: renderQuickLinks,
    renderHelpers: renderHelpers,
    renderWeeklyHighlight: renderWeeklyHighlight,
    renderGrantDeadlineChip: renderGrantDeadlineChip,
    refreshProactiveNudges: refreshProactiveNudges,
    contentBase: contentBase,
    gwbPageHref: gwbPageHref,
    escapeHtml: escapeHtml
  };
})(typeof window !== "undefined" ? window : globalThis);
