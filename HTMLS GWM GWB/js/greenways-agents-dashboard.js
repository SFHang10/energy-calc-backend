(function () {
  'use strict';

  var DESK_KEY = 'greenways-organisation-desk-v1';
  var SHORTLIST_KEY = 'greenways-product-shortlist';
  var LOCAL_SAVED_KEY = 'gw_saved_products';
  var CALENDAR_KEY = 'gw_personal_calendar_events';
  var MEMBER_CTX_KEY = 'greenways_member_context_v1';

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isDemo() {
    return /(?:^|\/)agents-dashboard-demo\/?$/i.test(String(location.pathname || ''));
  }

  function readJson(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function getAuthToken() {
    return localStorage.getItem('energy_calc_membership_token') || '';
  }

  function apiBase() {
    if (location.origin && location.origin !== 'null') return '';
    return 'https://energy-calc-backend.onrender.com';
  }

  function agentPortrait(agents, slug) {
    return (agents || []).find(function (a) {
      return a.slug === slug || a.id === slug;
    });
  }

  function portraitBadge(agents, slug, label) {
    var ag = agentPortrait(agents, slug);
    if (!ag || !ag.imageUrl) return label ? escapeHtml(label) : '';
    var style = ag.imageObjectPosition ? ' style="object-position:' + escapeHtml(ag.imageObjectPosition) + '"' : '';
    return (
      '<span class="ad-agent-badge">' +
      '<img src="' + escapeHtml(ag.imageUrl) + '" alt=""' + style + '>' +
      escapeHtml(label || ag.name) +
      '</span>'
    );
  }

  function renderTablet(tablet) {
    if (!tablet) return '';
    var laneClass = /watch/i.test(tablet.lane) ? 'lane-watch' : 'lane-close';
    var tagClass = /watch/i.test(tablet.tag) ? ' tag-watch' : '';
    var meta =
      tablet.dateLabel || tablet.daysLeft != null
        ? '<div class="ad-tablet-meta">' +
          escapeHtml(tablet.dateLabel || '') +
          (tablet.daysLeft != null ? ' · ' + escapeHtml(String(tablet.daysLeft)) + 'd' : '') +
          '</div>'
        : '';
    return (
      '<article class="ad-tablet">' +
      '<div class="ad-tablet-lane ' + laneClass + '">' + escapeHtml(tablet.lane) + '</div>' +
      '<div class="ad-tablet-tagrow"><span class="ad-tag' + tagClass + '">' + escapeHtml(tablet.tag || '') + '</span></div>' +
      '<h4>' + escapeHtml(tablet.title) + '</h4>' +
      '<p>' + escapeHtml(tablet.body) + '</p>' +
      meta +
      '</article>'
    );
  }

  function renderAgentBlock(agent) {
    var tabletList = agent.tablets || [];
    var tablets = tabletList.map(renderTablet).join('');
    var layoutClass = 'ad-tablets--full';
    if (!tablets) {
      tablets = '<article class="ad-tablet"><p>No highlight this week — open chat to ask.</p></article>';
    } else if (tabletList.length >= 2) {
      layoutClass = 'ad-tablets--split';
    }
    var pos = agent.imageObjectPosition
      ? ' style="object-position:' + escapeHtml(agent.imageObjectPosition) + '"'
      : '';
    return (
      '<section class="ad-agent-block" style="border-color:' + escapeHtml(agent.accent || '#3dcf7a') + '33">' +
      '<header class="ad-agent-head">' +
      '<img src="' + escapeHtml(agent.imageUrl) + '" alt=""' + pos + '>' +
      '<div><h3>' + escapeHtml(agent.name) + '</h3><p>' + escapeHtml(agent.roleLine) + '</p></div>' +
      '<div class="ad-agent-actions">' +
      '<a href="' + escapeHtml(agent.chatHref || agent.path) + '">Open chat</a>' +
      '</div></header>' +
      '<div class="ad-tablets ' + layoutClass + '">' + tablets + '</div></section>'
    );
  }

  function renderWeeklyHighlights(agents, weekLabel) {
    if (!agents || !agents.length) {
      return '<p class="ad-hl-empty">Highlights load with the weekly agent snapshot.</p>';
    }
    var weekChip = weekLabel ? String(weekLabel).trim() : 'This week';
    var items = agents
      .map(function (a) {
        var hl = a.highlight;
        var tablet = (a.tablets && a.tablets[0]) || {};
        var title = (hl && hl.question) || tablet.title || a.name;
        var line = (hl && hl.teaser) || tablet.body || a.roleLine || '';
        var chip = (a.shortLabel || a.name || 'Agent').split(/\s+/)[0].toUpperCase();
        if (chip.length > 14) chip = chip.slice(0, 14);
        var lane = tablet.lane || 'HIGHLIGHT';
        var href = a.chatHref || a.path || '/greenways/agents-highlights';
        var chipClass = /price|finance|deal|grant|news|product|system|equip/i.test(lane + chip)
          ? 'ad-chip-gold'
          : 'ad-chip-blue';
        return (
          '<li class="ad-hl-item">' +
          '<span class="ad-hl-square" aria-hidden="true"></span>' +
          '<div class="ad-hl-body">' +
          '<div class="ad-hl-meta">' +
          '<span class="ad-chip ' + chipClass + '">' + escapeHtml(chip) + '</span>' +
          '<span class="ad-hl-cat">' + escapeHtml(lane) + '</span>' +
          '</div>' +
          '<a class="ad-hl-title" href="' + escapeHtml(href) + '" target="_top">' + escapeHtml(title) + '</a>' +
          (line ? '<p class="ad-hl-line">' + escapeHtml(line) + '</p>' : '') +
          '</div></li>'
        );
      })
      .join('');

    return (
      '<div class="ad-hl-head">' +
      '<span class="ad-chip ad-chip-blue">' + escapeHtml(weekChip) + '</span>' +
      '<span class="ad-hl-cat">Agents · highlights</span>' +
      '</div>' +
      '<ul class="ad-highlights-list">' +
      items +
      '</ul>' +
      '<a class="ad-hl-more" href="/greenways/agents-highlights" target="_top">Full portal highlights →</a>'
    );
  }

  function renderGallery(gallery, agents) {
    if (!gallery || !gallery.length) return '<div class="ad-empty">Gallery fills when deals feed and agent portraits load.</div>';
    return gallery
      .slice(0, 6)
      .map(function (card) {
        var badge = portraitBadge(agents, card.agentSlug, card.kind === 'agent' ? card.title : '');
        return (
          '<a class="ad-gallery-card" href="' + escapeHtml(card.href) + '" target="_top">' +
          '<img src="' + escapeHtml(card.imageUrl) + '" alt="">' +
          '<div class="ad-gallery-body"><strong>' + escapeHtml(card.title) + '</strong>' +
          '<span>' + escapeHtml(card.line || '') + '</span>' + badge + '</div></a>'
        );
      })
      .join('');
  }

  function inferAgentSlug(row, agents) {
    if (row.sourceAgent && row.sourceAgent.slug) return row.sourceAgent.slug;
    if (row.fromSlug) return row.fromSlug;
    var name = String(row.fromName || row.line || '').toLowerCase();
    if (/grant|andrieus|scheme/.test(name)) return 'grants-agent';
    if (/vincent|finance|price/.test(name)) return 'finance-agent';
    if (/zara|deal/.test(name)) return 'deals-agent';
    if (/artemis|equipment/.test(name)) return 'equipment-agent';
    if (/zyanne|product/.test(name)) return 'sustainable-products-agent';
    if (/cheryce|news/.test(name)) return 'media-agent';
    return 'equipment-agent';
  }

  async function fetchMemberSaved() {
    if (isDemo() || !getAuthToken()) return [];
    try {
      var res = await fetch(apiBase() + '/api/members/saved-items', {
        headers: { Authorization: 'Bearer ' + getAuthToken() }
      });
      if (!res.ok) return [];
      var data = await res.json();
      return Array.isArray(data.saved && data.saved.products) ? data.saved.products : [];
    } catch (_) {
      return [];
    }
  }

  function readShortlist() {
    var data = readJson(SHORTLIST_KEY);
    return Array.isArray(data) ? data : Array.isArray(data && data.items) ? data.items : [];
  }

  function mergeSavedCards(shortlist, profile, localSaved, agents) {
    var out = [];
    var seen = new Set();
    function push(row, source) {
      if (!row || !row.id || seen.has(row.id)) return;
      seen.add(row.id);
      var slug = inferAgentSlug(row, agents);
      out.push({
        id: row.id,
        title: row.title || row.name || row.id,
        line: row.description || row.line || source,
        href:
          row.href ||
          (String(row.id).match(/^(etl_|sust_)/i)
            ? '/product-page-v2-marketplace.html?product=' + encodeURIComponent(row.id) + '&fromPopup=true'
            : '/greenways/customer-hub'),
        agentSlug: slug
      });
    }
    shortlist.forEach(function (r) {
      push(r, 'Session shortlist');
    });
    profile.forEach(function (r) {
      push(r, 'Saved to profile');
    });
    (localSaved || []).forEach(function (r) {
      push(r, 'Saved locally');
    });
    return out.slice(0, 12);
  }

  function readDeskCards() {
    var data = readJson(DESK_KEY);
    var cards = Array.isArray(data && data.cards) ? data.cards : Array.isArray(data) ? data : [];
    return cards.filter(function (c) {
      return c && c.status !== 'done';
    });
  }

  function readReminders(seeds, agents) {
    var personal = readJson(CALENDAR_KEY);
    var list = Array.isArray(personal) ? personal : [];
    var merged = list
      .concat(seeds || [])
      .filter(function (ev) {
        return ev && ev.date;
      })
      .sort(function (a, b) {
        return String(a.date).localeCompare(String(b.date));
      })
      .slice(0, 8);
    return merged.map(function (ev) {
      return {
        id: ev.id,
        date: ev.date,
        title: ev.title,
        summary: ev.summary || '',
        agentSlug: ev.askAgent ? ev.askAgent.replace(/-agent$/, '') + '-agent' : 'grants-agent',
        href: ev.askAgent
          ? '/greenways/' + ev.askAgent + (ev.askPrompt ? '?q=' + encodeURIComponent(ev.askPrompt) : '')
          : '/greenways/calendar'
      };
    });
  }

  function renderSaved(cards, agents) {
    if (!cards.length) {
      return (
        '<div class="ad-empty">Nothing saved yet — shortlist from agent chats or save from the marketplace. ' +
        '<a href="/greenways/customer-hub">Your Hub</a> · <a href="/greenways/equipment-agent">Ask Artemis</a></div>'
      );
    }
    return cards
      .map(function (card) {
        return (
          '<a class="ad-save-card" href="' + escapeHtml(card.href) + '" target="_top">' +
          '<h4>' + escapeHtml(card.title) + '</h4>' +
          '<p>' + escapeHtml(card.line) + '</p>' +
          portraitBadge(agents, card.agentSlug) +
          '</a>'
        );
      })
      .join('');
  }

  function renderReminders(items, agents) {
    if (!items.length) {
      return '<div class="ad-empty">No reminders — add from <a href="/greenways/calendar">calendar</a> or scheme tablets in chat.</div>';
    }
    return items
      .map(function (item) {
        return (
          '<a class="ad-reminder-card" href="' + escapeHtml(item.href) + '" target="_top">' +
          '<h4>' + escapeHtml(item.title) + '</h4>' +
          '<p>' + escapeHtml(item.summary) + '</p>' +
          '<div class="ad-card-meta">' + escapeHtml(item.date) + '</div>' +
          portraitBadge(agents, item.agentSlug) +
          '</a>'
        );
      })
      .join('');
  }

  function renderProjects(cards, agents) {
    var active = cards.filter(function (c) {
      return c.status === 'inbox' || c.status === 'planned';
    });
    if (!active.length) {
      return (
        '<div class="ad-empty">No desk cards yet — use <strong>Add to desk</strong> in agent chats or open ' +
        '<a href="/greenways/organisation-desk">Organisation Desk</a>.</div>'
      );
    }
    return active
      .slice(0, 8)
      .map(function (card) {
        var slug = (card.sourceAgent && card.sourceAgent.slug) || 'equipment-agent';
        return (
          '<a class="ad-project-card" href="/greenways/organisation-desk" target="_top">' +
          '<h4>' + escapeHtml(card.title) + '</h4>' +
          '<p>' + escapeHtml(card.note || card.type || 'Desk card') + ' · ' + escapeHtml(card.status) + '</p>' +
          portraitBadge(agents, slug, (card.sourceAgent && card.sourceAgent.name) || '') +
          '</a>'
        );
      })
      .join('');
  }

  async function boot() {
    var root = document.getElementById('ad-root');
    if (!root) return;
    root.innerHTML = '<div class="ad-loading">Loading your agents dashboard…</div>';

    try {
      var res = await fetch(apiBase() + '/api/agents-dashboard/overview');
      if (!res.ok) throw new Error('overview failed');
      var data = await res.json();
      var agents = data.agents || [];

      var profileSaved = await fetchMemberSaved();
      var savedCards = mergeSavedCards(readShortlist(), profileSaved, readJson(LOCAL_SAVED_KEY), agents);
      var deskCards = readDeskCards();
      var reminders = readReminders(data.reminderSeeds, agents);

      var ctx = readJson(MEMBER_CTX_KEY) || readJson('gw-team-profile-v1') || {};
      var region = ctx.region || ctx.country || (isDemo() ? 'Demo · Wok Restaurant' : 'Set region in Your Hub');

      root.innerHTML =
        '<header class="ad-hero">' +
        '<p class="ad-kicker">Transition Agents · your team desk</p>' +
        '<h1>Agents Dashboard</h1>' +
        '<p>Wire-style updates from each specialist, plus saves, reminders, and desk projects — a quick return path between chats. Your Hub stays home for the full scroll.</p>' +
        '<div class="ad-hero-meta">' +
        escapeHtml(data.meta && data.meta.weekLabel ? data.meta.weekLabel : '') +
        (region ? ' · ' + escapeHtml(region) : '') +
        '</div>' +
        '<nav class="ad-nav-row">' +
        '<a href="/greenways/customer-hub">Your Hub</a>' +
        '<a href="/greenways/orchestra-hub">Orchestra</a>' +
        '<a class="ad-nav-gold" href="/greenways/organisation-desk">Organisation Desk</a>' +
        '<a href="/greenways/agents-highlights">Weekly highlights</a>' +
        '</nav></header>' +
        '<section class="ad-section"><div class="ad-section-head"><h2>Agents · this week</h2>' +
        '<span>Tablet updates · open chat for detail</span></div>' +
        '<div class="ad-agent-grid">' +
        agents.map(renderAgentBlock).join('') +
        '</div></section>' +
        '<section class="ad-section ad-section-spotlight"><div class="ad-section-head"><h2>Spotlight gallery</h2>' +
        '<span>Deals &amp; faces · music-finder rhythm</span></div>' +
        '<div class="ad-spotlight-wrap">' +
        '<div class="ad-gallery">' +
        renderGallery(data.gallery, agents) +
        '</div>' +
        '<aside class="ad-highlights-panel" aria-labelledby="ad-hl-heading">' +
        '<h3 id="ad-hl-heading">Agents highlights</h3>' +
        renderWeeklyHighlights(agents, data.meta && data.meta.weekLabel) +
        '</aside></div></section>' +
        '<section class="ad-section"><div class="ad-section-head"><h2>Saved for you</h2>' +
        '<span>Shortlist + profile</span></div>' +
        '<div class="ad-lane-cards">' +
        renderSaved(savedCards, agents) +
        '</div></section>' +
        '<section class="ad-section"><div class="ad-section-head"><h2>Reminders</h2>' +
        '<span>Calendar + agent nudges</span></div>' +
        '<div class="ad-lane-cards">' +
        renderReminders(reminders, agents) +
        '</div></section>' +
        '<section class="ad-section"><div class="ad-section-head"><h2>Projects in progress</h2>' +
        '<span>Organisation Desk</span></div>' +
        '<div class="ad-lane-cards">' +
        renderProjects(deskCards, agents) +
        '</div></section>';
    } catch (err) {
      root.innerHTML =
        '<div class="ad-empty">Could not load dashboard — try again in a moment or open <a href="/greenways/customer-hub">Your Hub</a>.</div>';
      console.error(err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
