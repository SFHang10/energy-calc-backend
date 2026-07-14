(function (global) {
  'use strict';

  var ROSTER_URL = '/data/greenways-agent-roster.json';
  var HANDOFF_KEY = 'gw-team-handoff-v1';
  var PROFILE_KEY = 'gw-team-profile-v1';
  var JOURNEY_KEY = 'gw-team-journey-v1';
  var JOURNEY_PLAN_KEY = 'gw-team-journey-plan-v1';
  var JOURNEY_MAX = 24;
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
    base = mergeMemberContext(base);
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

  function readMemberContext() {
    return readJson('greenways_member_context_v1');
  }

  function mergeMemberContext(profile) {
    var ctx = readMemberContext();
    if (!ctx || typeof ctx !== 'object') return profile || {};
    var out = {};
    Object.keys(profile || {}).forEach(function (k) {
      out[k] = profile[k];
    });
    if (!out.tier && ctx.tier) out.tier = String(ctx.tier);
    if (!out.memberId && ctx.memberId != null) out.memberId = String(ctx.memberId);
    if (!out.siteId && ctx.siteId) out.siteId = String(ctx.siteId);
    return out;
  }

  function writeSharedProfile(profile) {
    if (!profile || typeof profile !== 'object') return;
    var row = {
      region: profile.region != null ? String(profile.region) : '',
      sector: profile.sector != null ? String(profile.sector) : '',
      focus: profile.focus != null ? String(profile.focus) : '',
      lane: profile.lane != null ? String(profile.lane) : '',
      tier: profile.tier != null ? String(profile.tier) : '',
      memberId: profile.memberId != null ? String(profile.memberId) : '',
      siteId: profile.siteId != null ? String(profile.siteId) : ''
    };
    writeJson(PROFILE_KEY, row);
    try {
      global.dispatchEvent(new CustomEvent('gw-profile-changed', { detail: row }));
    } catch (_) {
      /* ignore */
    }
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

  function stripMarkdown(text) {
    return String(text || '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/\n+/g, ' ')
      .trim();
  }

  /** Fallback when stored highlights lack moduleId (older journey entries). */
  var HIGHLIGHT_LABEL_MODULE_ALIASES = {
    'equipment savings projection': 'savings-projection',
    'energy savings trajectory': 'savings-trajectory',
    'water saving finder': 'water-saving-finder',
    'water product compare': 'water-saving-finder',
    'finance finder': 'finance-finder',
    'energy prices ticker': 'energy-prices-ticker',
    'energy audit': 'energy-audit',
    'deals ticker hub': 'deals-ticker',
    'full deals page': 'deals-full-page',
    'sensor intelligence dashboard': 'sensor-dashboard',
    'greenways buildings dashboard': 'greenways-dashboard',
    'importance of energy monitoring': 'energy-monitoring',
    'restaurant energy monitoring guide': 'restaurant-energy-monitoring-guide',
    'restaurant monitoring guide': 'restaurant-energy-monitoring-guide',
    'site energy reading': 'site-energy-reading',
    'grid carbon postcode': 'site-energy-reading',
    'postcode grid carbon': 'site-energy-reading',
    'equipment deep dive': 'equipment-deep-dive',
    'sustainability map': 'sustainability-map'
  };

  function resolveHighlightModuleId(highlight) {
    if (!highlight) return '';
    var moduleId = String(highlight.moduleId || '').trim();
    if (!moduleId && highlight.label) {
      moduleId = HIGHLIGHT_LABEL_MODULE_ALIASES[String(highlight.label).trim().toLowerCase()] || '';
    }
    if (!moduleId && highlight.href) {
      var CM = global.GreenwaysAgentContentModule;
      if (CM && typeof CM.findModuleIdForHref === 'function') {
        moduleId = CM.findModuleIdForHref(highlight.href) || '';
      }
    }
    return moduleId;
  }

  function resolveHighlightHref(highlight) {
    if (!highlight) return '';
    var href = String(highlight.href || '').trim();
    var CM = global.GreenwaysAgentContentModule;
    if (href) {
      if (CM && typeof CM.stripEmbedParams === 'function') return CM.stripEmbedParams(href);
      if (CM && typeof CM.resolveModuleWebHref === 'function') return CM.resolveModuleWebHref(href);
      return href;
    }
    var moduleId = String(highlight.moduleId || '').trim();
    if (!moduleId && highlight.label) {
      moduleId = HIGHLIGHT_LABEL_MODULE_ALIASES[String(highlight.label).trim().toLowerCase()] || '';
    }
    if (moduleId && CM && typeof CM.hrefForModuleId === 'function') {
      return CM.hrefForModuleId(moduleId) || '';
    }
    return '';
  }

  function renderHighlightListItem(highlight, suggesterSlug) {
    var moduleId = resolveHighlightModuleId(highlight);
    var label = escapeHtml(highlight && highlight.label ? highlight.label : '');
    if (moduleId) {
      return (
        '<li><button type="button" class="gw-journey-highlight-link" data-journey-highlight="1" data-module-id="' +
        escapeHtml(moduleId) +
        '" data-suggester-slug="' +
        escapeHtml(suggesterSlug || '') +
        '">' +
        label +
        '</button></li>'
      );
    }
    return '<li>' + label + '</li>';
  }

  function openHighlightFromJourney(highlight, suggesterSlug) {
    var moduleId = resolveHighlightModuleId(highlight);
    if (!moduleId) return;
    suggesterSlug = String(suggesterSlug || '').trim();
    var currentSlug = slugFromPath(global.location.pathname);
    var CM = global.GreenwaysAgentContentModule;
    var sameAgent =
      suggesterSlug &&
      currentSlug === suggesterSlug &&
      CM &&
      typeof CM.openById === 'function';

    closeJourneyModal();

    if (sameAgent) {
      CM.openById(moduleId, {
        returnLabel: '\u2190 Back to journey summary',
        returnToJourney: true
      });
      return;
    }

    var targetSlug = suggesterSlug || currentSlug;
    if (!targetSlug) return;
    var url =
      '/greenways/' +
      encodeURIComponent(targetSlug) +
      '?openModule=' +
      encodeURIComponent(moduleId) +
      '&fromJourney=1';
    try {
      if (global.top && global.top !== global) global.top.location.href = url;
      else global.location.href = url;
    } catch (_) {
      global.location.href = url;
    }
  }

  var journeyHighlightBound = false;

  function bindJourneyHighlightClicks() {
    if (journeyHighlightBound) return;
    journeyHighlightBound = true;
    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-journey-highlight]');
      if (!btn) return;
      ev.preventDefault();
      ev.stopPropagation();
      openHighlightFromJourney(
        {
          moduleId: btn.getAttribute('data-module-id') || '',
          label: btn.textContent || ''
        },
        btn.getAttribute('data-suggester-slug') || ''
      );
    });
  }

  function extractHighlights(blocks) {
    var items = [];
    if (!Array.isArray(blocks)) return items;
    blocks.forEach(function (block) {
      if (!block || !block.type) return;
      if (block.type === 'link' && Array.isArray(block.items)) {
        block.items.forEach(function (it) {
          if (it && it.label) {
            items.push({ kind: 'link', label: String(it.label), href: String(it.href || '') });
          }
        });
      }
      if (block.type === 'module' && Array.isArray(block.items)) {
        block.items.forEach(function (it) {
          if (it && (it.title || it.label)) {
            items.push({
              kind: 'module',
              label: String(it.title || it.label),
              moduleId: String(it.id || it.moduleId || ''),
              href: String(it.fullPageHref || it.href || '')
            });
          }
        });
      }
      if (block.type === 'stat' && Array.isArray(block.items)) {
        block.items.forEach(function (it) {
          if (it && it.label) {
            var val = it.value != null ? String(it.value) : '';
            items.push({ kind: 'stat', label: val ? it.label + ': ' + val : String(it.label) });
          }
        });
      }
    });
    return items.slice(0, 8);
  }

  function readJourney() {
    var data = readJson(JOURNEY_KEY);
    if (data && Array.isArray(data.turns)) return data;
    return { startedAt: null, turns: [] };
  }

  function journeyTurnCount() {
    return readJourney().turns.length;
  }

  function clearJourney() {
    try {
      global.sessionStorage.removeItem(JOURNEY_KEY);
      global.sessionStorage.removeItem(JOURNEY_PLAN_KEY);
    } catch (_) {}
    updateJourneyButtonBadge();
    try {
      global.dispatchEvent(new CustomEvent('gw-journey-updated', { detail: { count: 0 } }));
    } catch (_) {}
  }

  function readJourneyPlan() {
    return readJson(JOURNEY_PLAN_KEY);
  }

  function writeJourneyPlan(planPayload) {
    if (!planPayload || !planPayload.plan) return;
    writeJson(JOURNEY_PLAN_KEY, {
      plan: String(planPayload.plan),
      source: String(planPayload.source || planPayload.planSource || 'heuristic'),
      generatedAt: new Date().toISOString(),
      turnCount: planPayload.turnCount || 0,
      agentCount: planPayload.agentCount || 0
    });
  }

  function clearJourneyPlan() {
    try {
      global.sessionStorage.removeItem(JOURNEY_PLAN_KEY);
    } catch (_) {}
  }

  function apiBase() {
    var h = global.location && global.location.hostname ? global.location.hostname : '';
    if (h === 'localhost' || h === '127.0.0.1' || h.indexOf('energy-calc-backend') !== -1) {
      return global.location.origin || '';
    }
    if (global.location && global.location.protocol === 'file:') return '';
    return 'https://energy-calc-backend.onrender.com';
  }

  function simpleMarkdown(text) {
    return escapeHtml(text)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  function journeyEligibleForPlan() {
    return journeyTurnCount() >= 2;
  }

  async function requestJourneyPlan() {
    var journey = readJourney();
    if (!journeyEligibleForPlan()) {
      throw new Error('Ask at least two questions across specialists first.');
    }

    var base = apiBase();
    var url = (base || '') + '/api/guide-agent/summarize';
    var profile = readSharedProfile() || {};

    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: profile,
        startedAt: journey.startedAt || null,
        turns: journey.turns
      })
    });

    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Could not generate plan.');
    }

    writeJourneyPlan(data);
    return data;
  }

  async function requestTeamEvaluation(question, profile) {
    var q = String(question || '').trim();
    if (!q) throw new Error('Enter a project question first.');

    var base = apiBase();
    var url = (base || '') + '/api/guide-agent/evaluate';
    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: q,
        profile: profile || readSharedProfile() || {}
      })
    });

    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Could not run team evaluation.');
    }
    return data;
  }

  function seedJourneyFromEvaluation(payload) {
    if (!payload || !Array.isArray(payload.turns) || !payload.turns.length) return;

    var journey = readJourney();
    if (!journey.startedAt) journey.startedAt = new Date().toISOString();

    payload.turns.forEach(function (turn) {
      journey.turns.push({
        id: 'j-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        at: new Date().toISOString(),
        slug: String(turn.slug || ''),
        agentName: String(turn.agentName || turn.slug || 'Specialist'),
        question: String(turn.question || payload.question || '').trim(),
        summary: String(turn.summary || '').trim(),
        intentId: String(turn.intentId || '').trim(),
        highlights: Array.isArray(turn.highlights) ? turn.highlights : []
      });
    });

    if (journey.turns.length > JOURNEY_MAX) {
      journey.turns = journey.turns.slice(-JOURNEY_MAX);
    }

    writeJson(JOURNEY_KEY, journey);

    if (payload.plan) {
      writeJourneyPlan({
        plan: payload.plan,
        source: payload.planSource || 'heuristic',
        turnCount: payload.turns.length,
        agentCount: payload.laneCount || payload.turns.length
      });
    }

    updateJourneyButtonBadge();
    try {
      global.dispatchEvent(
        new CustomEvent('gw-journey-updated', {
          detail: { count: journey.turns.length, teamEvaluation: true }
        })
      );
    } catch (_) {}
  }

  function buildTeamEvaluationHtml(payload, roster, opts) {
    opts = opts || {};
    if (!payload || !Array.isArray(payload.lanes)) return '';

    var lede =
      opts.lede ||
      'A few specialists weighed in together on your question — tap a portrait to go deeper with whoever fits best.';
    var planSection = payload.plan
      ? buildJourneyPlanHtml({ plan: payload.plan, source: payload.planSource || 'heuristic' })
      : '';

    var lanesHtml = payload.lanes
      .map(function (lane) {
        var agent = findAgentInRoster(roster, lane.slug);
        var portrait = lane.imageUrl || (agent && agent.imageUrl) || '';
        var path = lane.path || (agent && agent.path) || '/greenways/' + lane.slug;
        var highlights =
          lane.highlights && lane.highlights.length
            ? '<ul class="gw-team-eval-highlights">' +
              lane.highlights.map(function (h) {
                return renderHighlightListItem(h, lane.slug);
              }).join('') +
              '</ul>'
            : '';

        return (
          '<article class="gw-team-eval-lane">' +
          '<div class="gw-team-eval-lane-head">' +
          (portrait
            ? '<img class="gw-team-eval-portrait" src="' +
              escapeHtml(portrait) +
              '" alt="" width="36" height="36">'
            : '') +
          '<div class="gw-team-eval-lane-meta">' +
          '<strong>' +
          escapeHtml(lane.agentName || lane.slug) +
          '</strong>' +
          (lane.label ? '<span>' + escapeHtml(lane.label) + '</span>' : '') +
          '</div>' +
          '<a class="gw-team-eval-open" href="' +
          escapeHtml(path + (lane.question ? '?q=' + encodeURIComponent(lane.question) : '')) +
          '" target="_top" rel="noopener">Open chat</a>' +
          '</div>' +
          '<p class="gw-team-eval-summary">' +
          escapeHtml(lane.summary || '') +
          '</p>' +
          highlights +
          '</article>'
        );
      })
      .join('');

    return (
      '<div class="gw-team-eval">' +
      '<p class="gw-team-eval-lede">' +
      simpleMarkdown(lede) +
      '</p>' +
      planSection +
      '<div class="gw-team-eval-lanes">' +
      lanesHtml +
      '</div></div>'
    );
  }

  function buildJourneyPlanHtml(planRecord) {
    if (!planRecord || !planRecord.plan) return '';
    var source =
      planRecord.source === 'llm'
        ? 'Greenways Guide · AI synthesis'
        : 'Greenways Guide · grounded summary';
    return (
      '<section class="gw-journey-plan" id="gw-journey-plan">' +
      '<div class="gw-journey-plan-head">' +
      '<h3>Your action plan</h3>' +
      '<span class="gw-journey-plan-source">' +
      escapeHtml(source) +
      '</span></div>' +
      '<div class="gw-journey-plan-body">' +
      simpleMarkdown(planRecord.plan) +
      '</div></section>'
    );
  }

  function recordJourneyTurn(entry) {
    if (!entry || !entry.slug) return;
    var journey = readJourney();
    if (!journey.startedAt) journey.startedAt = new Date().toISOString();

    var summary = String(entry.spokenSummary || '').trim();
    if (!summary) {
      summary = stripMarkdown(entry.answer || '');
      if (summary.length > 220) summary = summary.slice(0, 217) + '…';
    }

    journey.turns.push({
      id: 'j-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      at: new Date().toISOString(),
      slug: String(entry.slug),
      agentName: String(entry.agentName || entry.slug),
      question: String(entry.question || '').trim(),
      summary: summary,
      intentId: String(entry.intentId || '').trim(),
      highlights: extractHighlights(entry.blocks)
    });

    if (journey.turns.length > JOURNEY_MAX) {
      journey.turns = journey.turns.slice(-JOURNEY_MAX);
    }

    writeJson(JOURNEY_KEY, journey);
    clearJourneyPlan();
    updateJourneyButtonBadge();
    try {
      global.dispatchEvent(
        new CustomEvent('gw-journey-updated', { detail: { count: journey.turns.length } })
      );
    } catch (_) {}
  }

  function findAgentInRoster(roster, slug) {
    if (!roster || !slug) return null;
    var agents = rosterAgentsForStrip(roster);
    for (var i = 0; i < agents.length; i++) {
      if (agents[i].slug === slug) return agents[i];
    }
    return null;
  }

  function formatJourneyTime(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return '';
    }
  }

  function buildJourneyCopyText(journey) {
    var planRecord = readJourneyPlan();
    var lines = ['Greenways Transition Agents — your journey summary', ''];
    if (planRecord && planRecord.plan) {
      lines.push('--- ACTION PLAN ---');
      lines.push(planRecord.plan);
      lines.push('');
    }
    if (journey.startedAt) {
      lines.push('Started: ' + formatJourneyTime(journey.startedAt));
      lines.push('');
    }
    journey.turns.forEach(function (turn, idx) {
      lines.push((idx + 1) + '. ' + turn.agentName);
      if (turn.question) lines.push('   Q: ' + turn.question);
      lines.push('   ' + turn.summary);
      if (turn.highlights && turn.highlights.length) {
        turn.highlights.forEach(function (h) {
          var line = '   • ' + h.label;
          var href = resolveHighlightHref(h);
          if (href) line += ' — ' + href;
          lines.push(line);
        });
      }
      lines.push('');
    });
    return lines.join('\n').trim();
  }

  function buildJourneyCardsHtml(journey, roster) {
    if (!journey.turns.length) {
      return (
        '<p class="gw-journey-empty">No answers yet. Chat with a specialist — each reply is added here so you can review your visit in one place.</p>'
      );
    }

    return journey.turns
      .map(function (turn) {
        var agent = findAgentInRoster(roster, turn.slug);
        var portrait = agent && agent.imageUrl ? agent.imageUrl : '';
        var path = agent && agent.path ? agent.path : '/greenways/' + turn.slug;
        var highlights =
          turn.highlights && turn.highlights.length
            ? '<ul class="gw-journey-highlights">' +
              turn.highlights.map(function (h) {
                return renderHighlightListItem(h, turn.slug);
              }).join('') +
              '</ul>'
            : '';
        var question = turn.question
          ? '<p class="gw-journey-q">“' + escapeHtml(turn.question) + '”</p>'
          : '';

        return (
          '<article class="gw-journey-card">' +
          '<div class="gw-journey-card-head">' +
          (portrait
            ? '<img class="gw-journey-portrait" src="' +
              escapeHtml(portrait) +
              '" alt="" width="40" height="40">'
            : '') +
          '<div class="gw-journey-card-meta">' +
          '<strong class="gw-journey-agent">' +
          escapeHtml(turn.agentName) +
          '</strong>' +
          '<span class="gw-journey-time">' +
          escapeHtml(formatJourneyTime(turn.at)) +
          '</span>' +
          '</div>' +
          '<a class="gw-journey-open" href="' +
          escapeHtml(path) +
          '" target="_top" rel="noopener">Open chat</a>' +
          '</div>' +
          question +
          '<p class="gw-journey-summary">' +
          escapeHtml(turn.summary) +
          '</p>' +
          highlights +
          '</article>'
        );
      })
      .join('');
  }

  function closeJourneyModal() {
    var modal = document.getElementById('gw-journey-modal');
    if (modal) modal.hidden = true;
  }

  function bindJourneyPlanButton(btn) {
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', async function () {
      if (!journeyEligibleForPlan()) return;
      var label = btn.querySelector('.gw-journey-plan-btn-label') || btn;
      var prev = label.textContent;
      btn.disabled = true;
      label.textContent = 'Generating…';
      try {
        await requestJourneyPlan();
        await renderJourneyModalBody();
        renderInlinePanel(document.getElementById('gw-journey-inline-mount'));
      } catch (err) {
        global.alert(err.message || 'Could not generate plan.');
      } finally {
        btn.disabled = !journeyEligibleForPlan();
        label.textContent = prev;
      }
    });
  }

  function ensureJourneyPlanButton(container, id) {
    if (!container) return null;
    var btn = document.getElementById(id);
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = id;
      btn.className = 'gw-journey-btn-primary gw-journey-plan-btn';
      btn.innerHTML = '<span class="gw-journey-plan-btn-label">Generate my plan</span>';
      container.insertBefore(btn, container.firstChild);
    }
    btn.disabled = !journeyEligibleForPlan();
    btn.title = journeyEligibleForPlan()
      ? 'Synthesize your specialist answers into one action plan'
      : 'Ask at least two questions to generate a plan';
    bindJourneyPlanButton(btn);
    return btn;
  }

  async function openJourneySummary() {
    var existing = document.getElementById('gw-journey-modal');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'gw-journey-modal';
      existing.className = 'gw-journey-modal';
      existing.hidden = true;
      existing.innerHTML =
        '<div class="gw-journey-modal-backdrop" data-journey-close></div>' +
        '<div class="gw-journey-modal-panel" role="dialog" aria-labelledby="gw-journey-modal-title" aria-modal="true">' +
        '<header class="gw-journey-modal-head">' +
        '<div><h2 id="gw-journey-modal-title">Your journey summary</h2>' +
        '<p class="gw-journey-modal-sub">Answers from specialists this visit — one place to review before you act.</p></div>' +
        '<button type="button" class="gw-journey-modal-close" data-journey-close aria-label="Close">×</button>' +
        '</header>' +
        '<div class="gw-journey-modal-body" id="gw-journey-modal-body"></div>' +
        '<footer class="gw-journey-modal-foot" id="gw-journey-modal-foot">' +
        '<button type="button" class="gw-journey-btn-secondary" id="gw-journey-copy-btn">Copy summary</button>' +
        '<button type="button" class="gw-journey-btn-secondary" id="gw-journey-clear-btn">Clear journey</button>' +
        '</footer></div>';
      document.body.appendChild(existing);

      existing.addEventListener('click', function (ev) {
        if (ev.target.closest('[data-journey-close]')) closeJourneyModal();
      });

      document.getElementById('gw-journey-copy-btn').addEventListener('click', function () {
        var text = buildJourneyCopyText(readJourney());
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(function () {});
        }
      });

      document.getElementById('gw-journey-clear-btn').addEventListener('click', function () {
        if (global.confirm('Clear your journey summary for this visit?')) {
          clearJourney();
          renderJourneyModalBody();
          renderInlinePanel(document.getElementById('gw-journey-inline-mount'));
        }
      });

      ensureJourneyPlanButton(document.getElementById('gw-journey-modal-foot'), 'gw-journey-plan-btn');
    }

    await renderJourneyModalBody();
    existing.hidden = false;
  }

  async function renderJourneyModalBody() {
    var body = document.getElementById('gw-journey-modal-body');
    if (!body) return;
    var roster = await loadRoster();
    var journey = readJourney();
    var planRecord = readJourneyPlan();
    body.innerHTML =
      buildJourneyPlanHtml(planRecord) + buildJourneyCardsHtml(journey, roster);
    ensureJourneyPlanButton(document.getElementById('gw-journey-modal-foot'), 'gw-journey-plan-btn');
  }

  async function renderInlinePanel(mountEl) {
    if (!mountEl) return;
    var journey = readJourney();
    var roster = await loadRoster();
    var count = journey.turns.length;

    mountEl.innerHTML =
      '<div class="gw-journey-inline' +
      (count ? '' : ' gw-journey-inline--empty') +
      '">' +
      '<div class="gw-journey-inline-head">' +
      '<h2>Your journey so far</h2>' +
      (count
        ? '<span class="gw-journey-inline-count">' + count + ' answer' + (count === 1 ? '' : 's') + '</span>'
        : '') +
      '</div>' +
      (count
        ? '<p class="gw-journey-inline-lede">Specialists you spoke with this visit — generate one action plan or copy the full summary.</p>'
        : '<p class="gw-journey-inline-lede">Chat with any specialist below. Each answer is collected here so you can review your whole visit.</p>') +
      buildJourneyPlanHtml(readJourneyPlan()) +
      buildJourneyCardsHtml(journey, roster) +
      '<div class="gw-journey-inline-actions" id="gw-journey-inline-actions">' +
      '<button type="button" class="gw-journey-btn-primary" id="gw-journey-inline-open">Open full summary</button>' +
      (count
        ? '<button type="button" class="gw-journey-btn-secondary" id="gw-journey-inline-copy">Copy</button>'
        : '') +
      '</div></div>';

    ensureJourneyPlanButton(document.getElementById('gw-journey-inline-actions'), 'gw-journey-inline-plan');

    var openBtn = document.getElementById('gw-journey-inline-open');
    if (openBtn) openBtn.addEventListener('click', openJourneySummary);

    var copyBtn = document.getElementById('gw-journey-inline-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = buildJourneyCopyText(readJourney());
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(function () {});
        }
      });
    }
  }

  function updateJourneyButtonBadge() {
    var btn = document.getElementById('gw-journey-btn');
    if (!btn) return;
    var n = journeyTurnCount();
    btn.setAttribute('aria-label', n ? 'Your journey summary — ' + n + ' answers' : 'Your journey summary');
    var badge = btn.querySelector('.gw-journey-btn-count');
    if (badge) {
      if (n > 0) {
        badge.textContent = String(n);
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    }
  }

  function mountJourneyButton(stripMount) {
    if (!stripMount || document.getElementById('gw-journey-btn')) return;
    var parent = stripMount.parentElement;
    if (!parent) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'gw-journey-btn';
    btn.className = 'gw-journey-btn';
    btn.title = 'Summary of answers from all specialists this visit';
    btn.innerHTML =
      '<span class="gw-journey-btn-label">Journey</span><span class="gw-journey-btn-count" hidden></span>';
    btn.addEventListener('click', openJourneySummary);
    parent.insertBefore(btn, stripMount.nextSibling);
    updateJourneyButtonBadge();
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
    mountJourneyButton(opts.stripMount);

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
    slugFromPath: slugFromPath,
    readJourney: readJourney,
    recordTurn: recordJourneyTurn,
    clearJourney: clearJourney,
    requestJourneyPlan: requestJourneyPlan,
    requestTeamEvaluation: requestTeamEvaluation,
    seedFromEvaluation: seedJourneyFromEvaluation,
    buildTeamEvaluationHtml: buildTeamEvaluationHtml,
    openJourneySummary: openJourneySummary,
    openHighlightFromJourney: openHighlightFromJourney,
    renderInlinePanel: renderInlinePanel,
    buildJourneyCopyText: buildJourneyCopyText
  };

  bindJourneyHighlightClicks();
})(typeof window !== 'undefined' ? window : global);
