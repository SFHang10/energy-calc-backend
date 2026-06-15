(function (global) {
  'use strict';

  var ROSTER_URL = '/data/greenways-agent-roster.json';
  var HANDOFF_KEY = 'gw-team-handoff-v1';
  var PROFILE_KEY = 'gw-team-profile-v1';
  var rosterCache = null;

  var FALLBACK_ROSTER = {
    agents: [
      { slug: 'grants-agent', id: 'grants', name: 'Andrieus', shortLabel: 'Grants', imageUrl: 'https://static.wixstatic.com/media/c123de_46943b6b1f8d41a59960fd8fdde4097b~mv2.png', path: '/greenways/grants-agent' },
      { slug: 'finance-agent', id: 'finance', name: 'Vincent', shortLabel: 'Finance', imageUrl: 'https://static.wixstatic.com/media/c123de_63359ab891354966aa9ff792fe998677~mv2.png', path: '/greenways/finance-agent' },
      { slug: 'equipment-agent', id: 'equipment', name: 'Artemis', shortLabel: 'Equipment', imageUrl: 'https://static.wixstatic.com/media/c123de_126830b1fc224df880dfa37ec830620e~mv2.png', path: '/greenways/equipment-agent' },
      { slug: 'deals-agent', id: 'deals', name: 'Zara', shortLabel: 'Deals', imageUrl: 'https://static.wixstatic.com/media/c123de_c7cdbed4a4ee407289677a4f0079c1e5~mv2.png', path: '/greenways/deals-agent' },
      { slug: 'media-agent', id: 'media', name: 'Cheryce', shortLabel: 'Media', imageUrl: 'https://static.wixstatic.com/media/c123de_333c90ab8930465a98b503e1d24316b4~mv2.png', path: '/greenways/media-agent' },
      { slug: 'sustainable-products-agent', id: 'products', name: 'Zyanne', shortLabel: 'Products', imageUrl: 'https://static.wixstatic.com/media/c123de_dc5b2e3e4aef4cc4b75c7b44888281bd~mv2.png', path: '/greenways/sustainable-products-agent' },
      { slug: 'systems-agent', id: 'systems', name: 'Edwardo', shortLabel: 'Systems', role: 'Systems & equipment', imageUrl: 'https://static.wixstatic.com/media/c123de_eeb61cbf84bd402eb642e28b2b457c76~mv2.png', path: '/greenways/systems-agent' }
    ]
  };

  function slugFromPath(pathname) {
    var m = String(pathname || '').match(/\/greenways\/([^/?#]+)/);
    return m ? m[1] : '';
  }

  function slugFromHref(href) {
    try {
      var url = new URL(href, global.location.origin);
      return slugFromPath(url.pathname);
    } catch (_) {
      return '';
    }
  }

  function queryFromHref(href) {
    try {
      var url = new URL(href, global.location.origin);
      return url.searchParams.get('q') || url.searchParams.get('prompt') || '';
    } catch (_) {
      return '';
    }
  }

  async function loadRoster() {
    if (rosterCache) return rosterCache;
    try {
      var res = await fetch(ROSTER_URL);
      if (res.ok) {
        var parsed = await res.json();
        if (parsed && Array.isArray(parsed.agents) && parsed.agents.length) {
          rosterCache = parsed;
          return rosterCache;
        }
      }
    } catch (_) {}
    rosterCache = FALLBACK_ROSTER;
    return rosterCache;
  }

  function readJson(key) {
    try {
      var raw = global.sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function writeJson(key, value) {
    try {
      global.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  }

  function readHandoff() {
    return readJson(HANDOFF_KEY);
  }

  function writeHandoff(brief) {
    if (!brief || !brief.toSlug) return;
    writeJson(HANDOFF_KEY, {
      fromSlug: brief.fromSlug || '',
      fromName: brief.fromName || 'Another agent',
      toSlug: brief.toSlug,
      question: String(brief.question || '').trim(),
      summary: String(brief.summary || '').trim(),
      topicSummary: String(brief.topicSummary || brief.summary || '').trim(),
      fromIntentId: String(brief.fromIntentId || '').trim(),
      handoffKey: String(brief.handoffKey || '').trim(),
      profile: brief.profile || null,
      apiConsumed: false,
      createdAt: new Date().toISOString()
    });
  }

  function consumeHandoffForSlug(currentSlug) {
    var brief = readHandoff();
    if (!brief || brief.toSlug !== currentSlug) return null;
    return brief;
  }

  function handoffPayloadForAsk(brief) {
    if (!brief) return null;
    return {
      fromSlug: brief.fromSlug || '',
      fromName: brief.fromName || 'Another specialist',
      question: String(brief.question || '').trim(),
      summary: String(brief.summary || '').trim(),
      topicSummary: String(brief.topicSummary || brief.summary || '').trim(),
      fromIntentId: String(brief.fromIntentId || '').trim(),
      handoffKey: String(brief.handoffKey || '').trim()
    };
  }

  function takeHandoffForAsk(currentSlug) {
    var brief = readHandoff();
    if (!brief || brief.toSlug !== currentSlug || brief.apiConsumed) return null;
    brief.apiConsumed = true;
    writeJson(HANDOFF_KEY, brief);
    return handoffPayloadForAsk(brief);
  }

  function profileForAsk(getProfile, currentSlug) {
    var base =
      typeof getProfile === 'function'
        ? getProfile()
        : getProfile && typeof getProfile === 'object'
          ? getProfile
          : {};
    var ho = takeHandoffForAsk(currentSlug || '');
    if (!ho) return base;
    var out = {};
    Object.keys(base).forEach(function (k) {
      out[k] = base[k];
    });
    out.handoff = ho;
    return out;
  }

  function readSharedProfile() {
    return readJson(PROFILE_KEY);
  }

  function writeSharedProfile(profile) {
    if (!profile || typeof profile !== 'object') return;
    writeJson(PROFILE_KEY, {
      region: profile.region != null ? String(profile.region) : '',
      sector: profile.sector != null ? String(profile.sector) : '',
      focus: profile.focus != null ? String(profile.focus) : '',
      lane: profile.lane != null ? String(profile.lane) : ''
    });
  }

  function applySharedProfile() {
    var profile = readSharedProfile();
    if (!profile) return;
    ['profile-region', 'profile-sector', 'profile-focus', 'profile-lane'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var key = id.replace('profile-', '');
      if (profile[key] != null && profile[key] !== '') el.value = profile[key];
    });
  }

  function bindProfileSync(getProfile) {
    ['profile-region', 'profile-sector', 'profile-focus', 'profile-lane'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', function () {
        if (typeof getProfile === 'function') writeSharedProfile(getProfile());
      });
    });
  }

  function rosterAgentsForStrip(roster) {
    var agents = (roster && roster.agents) ? roster.agents.slice() : [];
    var slugs = {};
    agents.forEach(function (a) {
      if (a && a.slug) slugs[a.slug] = true;
    });
    (roster && roster.staffOnly || []).forEach(function (a) {
      if (!a || !a.slug || slugs[a.slug]) return;
      agents.push(Object.assign({ staff: true }, a));
      slugs[a.slug] = true;
    });
    return agents;
  }

  function agentRoleLabel(agent) {
    var label = String(agent.shortLabel || agent.role || '').trim();
    if (!label) return 'Agent';
    if (/\bagent$/i.test(label)) return label;
    return label + ' Agent';
  }

  function renderTeamStrip(mount, roster, currentSlug) {
    if (!mount) return;
    var agents = rosterAgentsForStrip(roster);
    if (!agents.length) {
      mount.hidden = true;
      return;
    }

    var html =
      '<span class="gw-team-strip-label">Team</span>' +
      agents
        .map(function (agent) {
          var active = agent.slug === currentSlug;
          var isStaff = !!agent.staff;
          var memberCls = 'gw-team-member' + (active ? ' is-active' : '') + (isStaff ? ' is-staff' : '');
          var faceCls = 'gw-team-face' + (active ? ' is-active' : '');
          var roleLabel = agentRoleLabel(agent);
          var title = active
            ? agent.name + ' — ' + roleLabel + (isStaff ? ' (staff)' : '') + ' (you are here)'
            : 'Open ' + agent.name + ' — ' + roleLabel + (isStaff ? ' (staff)' : '');
          var staffBadge = isStaff ? '<span class="gw-team-staff-badge">Staff</span>' : '';
          var faceInner =
            '<span class="' +
            faceCls +
            '"><img src="' +
            escapeHtml(agent.imageUrl) +
            '" alt="' +
            escapeHtml(agent.name) +
            '"></span>' +
            '<span class="gw-team-name">' +
            escapeHtml(agent.name) +
            '</span>' +
            staffBadge;
          if (active) {
            return (
              '<span class="' +
              memberCls +
              '" title="' +
              escapeHtml(title) +
              '">' +
              faceInner +
              '</span>'
            );
          }
          return (
            '<a class="' +
            memberCls +
            '" href="' +
            escapeHtml(agent.path) +
            '" target="_top" rel="noopener" title="' +
            escapeHtml(title) +
            '">' +
            faceInner +
            '</a>'
          );
        })
        .join('');

    mount.innerHTML = html;
    mount.hidden = false;
  }

  function renderHandoffBanner(brief) {
    if (!brief) return null;
    var thread = document.getElementById('chat-thread');
    if (!thread) return null;

    var existing = document.getElementById('gw-handoff-banner');
    if (existing) existing.remove();

    var banner = document.createElement('div');
    banner.id = 'gw-handoff-banner';
    banner.className = 'gw-handoff-banner';
    banner.setAttribute('role', 'note');

    var fromName = brief.fromName || 'Another specialist';
    var topic = brief.topicSummary || brief.summary || '';
    var summary = topic
      ? '<span class="gw-handoff-banner-q">' + escapeHtml(topic) + '</span>'
      : '';
    var question = !topic && brief.question
      ? '<span class="gw-handoff-banner-q">“' + escapeHtml(brief.question) + '”</span>'
      : '';

    banner.innerHTML =
      '<strong>' +
      escapeHtml(fromName) +
      '</strong> suggested you continue here.' +
      (summary || question);

    thread.insertBefore(banner, thread.firstChild);
    return banner;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function bindHandoffChipClicks(ctx) {
    document.addEventListener('click', function (ev) {
      var link = ev.target.closest('a.agent-handoff-chip');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href) return;

      var toSlug = slugFromHref(href);
      if (!toSlug) return;

      var question =
        link.getAttribute('data-prompt') ||
        link.dataset.prompt ||
        queryFromHref(href) ||
        '';

      var summary = '';
      if (typeof ctx.getLastSummary === 'function') summary = ctx.getLastSummary() || '';
      if (!summary && typeof ctx.getLastQuestion === 'function') {
        summary = ctx.getLastQuestion() || '';
      }

      var fromIntentId =
        typeof ctx.getLastIntentId === 'function' ? String(ctx.getLastIntentId() || '').trim() : '';
      var topicSummary = '';
      if (typeof ctx.getHandoffTopicSummary === 'function') {
        topicSummary =
          ctx.getHandoffTopicSummary({
            toSlug: toSlug,
            question: question,
            intentId: fromIntentId,
            summary: summary
          }) || '';
      }
      if (!topicSummary) topicSummary = summary;

      var profile = null;
      if (typeof ctx.getProfile === 'function') profile = ctx.getProfile();

      writeHandoff({
        fromSlug: ctx.currentSlug,
        fromName: typeof ctx.getAgentName === 'function' ? ctx.getAgentName() : 'Agent',
        toSlug: toSlug,
        question: question,
        summary: summary,
        topicSummary: topicSummary,
        fromIntentId: fromIntentId,
        handoffKey: link.getAttribute('data-handoff-key') || link.dataset.handoffKey || '',
        profile: profile
      });

      if (profile) writeSharedProfile(profile);
    });
  }

  /**
   * @param {object} opts
   * @param {HTMLElement} [opts.stripMount]
   * @param {string} opts.currentSlug
   * @param {function} [opts.getProfile]
   * @param {function} [opts.getAgentName]
   * @param {function} [opts.getLastSummary]
   * @param {function} [opts.getLastQuestion]
   * @param {function} [opts.getLastIntentId]
   * @param {function} [opts.getHandoffTopicSummary]
   */
  async function init(opts) {
    opts = opts || {};
    var currentSlug = opts.currentSlug || slugFromPath(global.location.pathname);
    var roster = await loadRoster();

    applySharedProfile();
    if (typeof opts.getProfile === 'function') {
      bindProfileSync(opts.getProfile);
      writeSharedProfile(opts.getProfile());
    }

    renderTeamStrip(opts.stripMount, roster, currentSlug);

    var ctx = {
      currentSlug: currentSlug,
      getProfile: opts.getProfile,
      getAgentName: opts.getAgentName,
      getLastSummary: opts.getLastSummary,
      getLastQuestion: opts.getLastQuestion,
      getLastIntentId: opts.getLastIntentId,
      getHandoffTopicSummary: opts.getHandoffTopicSummary
    };
    bindHandoffChipClicks(ctx);

    var brief = consumeHandoffForSlug(currentSlug);
    if (brief) {
      if (brief.profile) {
        writeSharedProfile(brief.profile);
        applySharedProfile();
      }
      renderHandoffBanner(brief);
    }

    var params = new URLSearchParams(global.location.search);
    var urlPrompt = params.get('q') || params.get('prompt') || '';
    var suggestedPrompt = urlPrompt || (brief && brief.question) || '';

    var detail = {
      currentSlug: currentSlug,
      handoffBrief: brief,
      suggestedPrompt: suggestedPrompt
    };

    try {
      global.dispatchEvent(new CustomEvent('gw-team-ready', { detail: detail }));
    } catch (_) {}

    return detail;
  }

  global.GreenwaysAgentTeam = {
    init: init,
    loadRoster: loadRoster,
    readHandoff: readHandoff,
    writeHandoff: writeHandoff,
    takeHandoffForAsk: takeHandoffForAsk,
    profileForAsk: profileForAsk,
    readSharedProfile: readSharedProfile,
    writeSharedProfile: writeSharedProfile,
    slugFromPath: slugFromPath
  };
})(typeof window !== 'undefined' ? window : global);
