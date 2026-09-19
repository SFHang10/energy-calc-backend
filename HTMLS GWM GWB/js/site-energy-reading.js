/**
 * Site energy reading — UK + EU (NL, ES, PT) via /api/site-energy-reading/lookup
 * Site connections (electricity / gas / water) + grid carbon intensity.
 */
(function () {
  'use strict';

  var PROFILE_KEY = 'gw-team-profile-v1';
  var CONNECTIONS_KEY = 'gw-site-energy-connections-v1';

  var COUNTRIES = {
    uk: { label: 'United Kingdom', flag: '🇬🇧', mode: 'uk' },
    nl: { label: 'Netherlands', flag: '🇳🇱', mode: 'eu' },
    es: { label: 'Spain', flag: '🇪🇸', mode: 'eu' },
    pt: { label: 'Portugal', flag: '🇵🇹', mode: 'eu' }
  };

  /** Hospitality defaults: restaurant demo typically has all three. */
  var HOSPITALITY_DEFAULTS = {
    uk: { electricity: true, gas: true, water: true },
    nl: { electricity: true, gas: true, water: true },
    es: { electricity: true, gas: true, water: true },
    pt: { electricity: true, gas: true, water: true }
  };

  var INDEX_COLORS = {
    'very low': '#4fa097',
    low: '#7fae5e',
    moderate: '#e8a33d',
    high: '#cf7a3d',
    'very high': '#c1544c'
  };

  var INDEX_ANGLES = {
    'very low': -90,
    low: -45,
    moderate: 0,
    high: 45,
    'very high': 90
  };

  var INDEX_COPY = {
    'very low':
      'The grid right now is about as clean as it gets for this area. A strong window to run energy-heavy kitchen tasks.',
    low: 'Cleaner than average right now. Good time for intensive prep or equipment cycles without adding much carbon load.',
    moderate: 'A middling reading. Nothing urgent, but not the moment to stack every high-draw appliance at once.',
    high: 'The grid is leaning on higher-carbon generation. Push non-urgent high-draw tasks later if service allows.',
    'very high':
      'Carbon-heavy stretch for the local grid. Delay energy-intensive processes a few hours if you can without affecting service.'
  };

  var state = {
    country: 'uk',
    postcode: '',
    connections: { electricity: true, gas: true, water: true },
    lastLookup: null,
    connectionHint: null
  };

  function params() {
    return new URLSearchParams(window.location.search || '');
  }

  function isEmbed() {
    var p = params();
    return p.get('embed') === '1' || p.get('popup') === '1';
  }

  function isLightTheme() {
    return String(params().get('theme') || '').toLowerCase() === 'light';
  }

  function isDisplayMode() {
    return params().get('display') === '1';
  }

  function apiBase() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '';
    }
    if (/onrender\.com/i.test(window.location.hostname)) {
      return '';
    }
    return 'https://energy-calc-backend.onrender.com';
  }

  function profileCountryFromRegion(region) {
    var r = String(region || '').toLowerCase();
    if (!r) return '';
    if (r.indexOf('uk') === 0 || r.indexOf('united kingdom') >= 0) return 'uk';
    if (r.indexOf('netherlands') >= 0 || r === 'nl') return 'nl';
    if (r.indexOf('spain') >= 0 || r === 'es') return 'es';
    if (r.indexOf('portugal') >= 0 || r === 'pt') return 'pt';
    if (r === 'eu' || r.indexOf('europe') >= 0) return 'nl';
    return '';
  }

  function readJsonStorage(storage, key) {
    try {
      var raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function writeJsonBoth(key, value) {
    var json = JSON.stringify(value);
    try {
      localStorage.setItem(key, json);
    } catch (_) {}
    try {
      sessionStorage.setItem(key, json);
    } catch (_) {}
  }

  /** Prefer localStorage (durable), fall back to sessionStorage (agents). */
  function readTeamProfile() {
    var local = readJsonStorage(localStorage, PROFILE_KEY);
    var sess = readJsonStorage(sessionStorage, PROFILE_KEY);
    if (local && typeof local === 'object' && sess && typeof sess === 'object') {
      return Object.assign({}, sess, local);
    }
    return local || sess || {};
  }

  function countryFromProfile() {
    try {
      return profileCountryFromRegion(readTeamProfile().region);
    } catch (_) {
      return '';
    }
  }

  function normalizeCountryFromQuery() {
    var p = params();
    if (p.has('country') || p.has('region')) {
      return profileCountryFromRegion(p.get('country') || p.get('region')) || 'uk';
    }
    return countryFromProfile() || 'uk';
  }

  function defaultConnectionsFor(country) {
    var d = HOSPITALITY_DEFAULTS[country] || HOSPITALITY_DEFAULTS.uk;
    return {
      electricity: !!d.electricity,
      gas: !!d.gas,
      water: !!d.water
    };
  }

  function loadSavedConnections(country) {
    var saved = readJsonStorage(localStorage, CONNECTIONS_KEY);
    if (saved && saved.connections && String(saved.country || '') === country) {
      return {
        electricity: !!saved.connections.electricity,
        gas: !!saved.connections.gas,
        water: !!saved.connections.water
      };
    }
    var profile = readTeamProfile();
    if (profile.siteConnections && typeof profile.siteConnections === 'object') {
      return {
        electricity: !!profile.siteConnections.electricity,
        gas: !!profile.siteConnections.gas,
        water: !!profile.siteConnections.water
      };
    }
    return defaultConnectionsFor(country);
  }

  var MODULE_HREFS = {
    'european-energy': './european_energy_deals_portal.html',
    'utility-detail': './utility-detail.html',
    'water-saving-finder': './water-saving-finder.html',
    'energy-prices-ticker': '../content-ops/drafts/energy-ticker/energy-ticker-colour-swap.html',
    'equipment-deep-dive': './restaurant-equipment-deep-dive.html'
  };

  var GREENWAYS_MODULE_HREFS = {
    'water-saving-finder': '/greenways/water-saving-finder',
    'energy-prices-ticker': '/greenways/energy-ticker',
    'equipment-deep-dive': '/greenways/equipment-deep-dive'
  };

  function resolveModuleHref(moduleId) {
    var onGw = /\/greenways(\/|$)/i.test(window.location.pathname || '');
    if (onGw && GREENWAYS_MODULE_HREFS[moduleId]) return GREENWAYS_MODULE_HREFS[moduleId];
    return MODULE_HREFS[moduleId] || '';
  }

  function openRelatedModule(moduleId, query) {
    if (isEmbed() && window.parent && window.parent !== window) {
      try {
        window.parent.postMessage(
          {
            type: 'gw-module-open',
            moduleId: moduleId,
            overrides: query ? { query: query } : {}
          },
          '*'
        );
        return;
      } catch (_) {}
    }
    var href = resolveModuleHref(moduleId);
    if (!href) return;
    if (query) href += (href.indexOf('?') >= 0 ? '&' : '?') + query;
    window.location.href = href;
  }

  function applyThemeModes() {
    if (isEmbed()) document.body.classList.add('embed-mode');
    if (isLightTheme()) {
      document.documentElement.classList.add('theme-light');
      document.body.classList.add('theme-light');
    }
    if (isDisplayMode()) {
      document.documentElement.classList.add('display-mode');
      document.body.classList.add('display-mode');
    }
  }

  function syncConnChips() {
    document.querySelectorAll('.conn-chip[data-conn]').forEach(function (chip) {
      var key = chip.getAttribute('data-conn');
      var on = !!state.connections[key];
      chip.classList.toggle('is-on', on);
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function setConnections(partial) {
    state.connections = Object.assign({}, state.connections, partial || {});
    syncConnChips();
    var note = document.getElementById('connSaveNote');
    if (note) {
      note.textContent = '';
      note.classList.remove('ok');
    }
    renderUtilityLanes();
  }

  function hideUtilityLanes() {
    var lanes = document.getElementById('utilityLanes');
    var grid = document.getElementById('utilityLanesGrid');
    if (lanes) lanes.hidden = true;
    if (grid) grid.innerHTML = '';
  }

  function laneChipHtml(label, moduleId, query) {
    return (
      '<button type="button" class="result-chip" data-module-id="' +
      escapeHtml(moduleId) +
      '"' +
      (query ? ' data-module-query="' + escapeHtml(query) + '"' : '') +
      '>' +
      escapeHtml(label) +
      '</button>'
    );
  }

  function renderUtilityLanes() {
    var lanes = document.getElementById('utilityLanes');
    var grid = document.getElementById('utilityLanesGrid');
    var resultsEl = document.getElementById('results');
    if (!lanes || !grid) return;

    var resultsVisible = !!(resultsEl && resultsEl.classList.contains('show') && state.lastLookup);
    var conn = state.connections || {};
    var cards = [];

    if (conn.electricity) {
      cards.push(
        '<article class="lane-card" data-lane="electricity">' +
          '<h3>⚡ Electricity</h3>' +
          '<p class="lane-tip">Use the grid carbon gauge on this page for cleaner kitchen timing, then check the site utility view and compare tariffs.</p>' +
          '<div class="lane-actions">' +
          laneChipHtml('Site utility view →', 'utility-detail', 'type=electricity') +
          laneChipHtml('Compare tariffs →', 'european-energy', '') +
          laneChipHtml('Energy prices →', 'energy-prices-ticker', '') +
          '</div></article>'
      );
    }
    if (conn.gas) {
      cards.push(
        '<article class="lane-card" data-lane="gas">' +
          '<h3>🔥 Gas</h3>' +
          '<p class="lane-tip">Gas often dominates kitchen heat — open the gas utility view, then browse equipment upgrades when you are ready to cut load.</p>' +
          '<div class="lane-actions">' +
          laneChipHtml('Site utility view →', 'utility-detail', 'type=gas') +
          laneChipHtml('Equipment deep dive →', 'equipment-deep-dive', '') +
          '</div></article>'
      );
    }
    if (conn.water) {
      cards.push(
        '<article class="lane-card" data-lane="water">' +
          '<h3>💧 Water</h3>' +
          '<p class="lane-tip">Water is usually on for an occupied kitchen — use the utility view for bills context, then the finder for saving options.</p>' +
          '<div class="lane-actions">' +
          laneChipHtml('Site utility view →', 'utility-detail', 'type=water') +
          laneChipHtml('Water saving finder →', 'water-saving-finder', '') +
          '</div></article>'
      );
    }

    if (!resultsVisible || !cards.length) {
      lanes.hidden = true;
      grid.innerHTML = '';
      return;
    }

    grid.innerHTML = cards.join('');
    lanes.hidden = false;
  }

  function showConnectionsPanel() {
    var panel = document.getElementById('connectionsPanel');
    if (panel) panel.classList.add('show');
    syncConnChips();
  }

  function hideEpcHintBox() {
    var box = document.getElementById('epcHintBox');
    if (box) {
      box.hidden = true;
      box.classList.remove('show');
    }
    state.connectionHint = null;
  }

  function updateEpcHintBox(data) {
    var box = document.getElementById('epcHintBox');
    var summaryEl = document.getElementById('epcHintSummary');
    var noteEl = document.getElementById('epcHintNote');
    var hint = data && data.connectionHint ? data.connectionHint : null;
    state.connectionHint = hint;
    if (!box) return;
    if (hint) {
      box.hidden = false;
      box.classList.add('show');
      if (summaryEl) summaryEl.textContent = hint.summary || '';
      if (noteEl) noteEl.textContent = hint.note || 'Hint from open EPC data for this postcode — not a live meter check. Confirm with bills.';
    } else {
      box.hidden = true;
      box.classList.remove('show');
      if (summaryEl) summaryEl.textContent = '';
    }
  }

  function applyEpcHint() {
    var hint = state.connectionHint;
    if (!hint || !hint.suggested) return;
    setConnections({
      electricity: !!hint.suggested.electricity,
      gas: !!hint.suggested.gas,
      water: hint.suggested.water !== false
    });
    var note = document.getElementById('connSaveNote');
    if (note) {
      note.textContent = 'Applied EPC hint — review chips then Save for agents.';
      note.classList.add('ok');
    }
  }

  function setCountry(country, pushUrl) {
    state.country = COUNTRIES[country] ? country : 'uk';
    document.querySelectorAll('.country-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-country') === state.country);
    });
    var cfg = COUNTRIES[state.country];
    var plug = document.getElementById('postcodeLabel');
    var input = document.getElementById('postcode');
    if (plug) plug.textContent = state.country === 'uk' ? 'POSTCODE' : 'POSTAL CODE';
    if (input) {
      input.placeholder =
        state.country === 'uk'
          ? 'e.g. SW1A 1AA'
          : state.country === 'nl'
            ? 'e.g. 1012 AB'
            : state.country === 'es'
              ? 'e.g. 28013'
              : 'e.g. 1100-148';
      input.maxLength = state.country === 'uk' ? 8 : 12;
    }
    var lede = document.getElementById('heroLede');
    if (lede) {
      lede.textContent =
        state.country === 'uk'
          ? 'Two layers for a UK site: which utilities the premises is connected to (electricity, gas, water — illustrative until you confirm with bills), and live grid carbon intensity / mix / forecast for kitchen timing — not a substitute for your meter bills.'
          : 'Two layers for a ' +
            cfg.label +
            ' site: which utilities this premises typically has on supply, and grid carbon / generation mix for timing high-draw tasks (live when ENTSO-E or Electricity Maps is configured on Render). Confirm connections with bills.';
    }
    state.connections = loadSavedConnections(state.country);
    syncConnChips();
    if (pushUrl !== false && window.history && window.history.replaceState) {
      var p = params();
      p.set('country', state.country);
      var q = p.toString();
      window.history.replaceState({}, '', window.location.pathname + (q ? '?' + q : ''));
    }
  }

  function setStatus(msg, isErr) {
    var el = document.getElementById('status');
    if (!el) return;
    el.textContent = msg || '';
    el.classList.toggle('err', !!isErr);
  }

  function saveConnectionsForAgents() {
    var postcode =
      state.postcode ||
      (document.getElementById('postcode') && document.getElementById('postcode').value.trim()) ||
      '';
    var connections = {
      electricity: !!state.connections.electricity,
      gas: !!state.connections.gas,
      water: !!state.connections.water
    };
    var updatedAt = new Date().toISOString();

    var modulePayload = {
      country: state.country,
      postcode: postcode,
      connections: connections,
      updatedAt: updatedAt
    };
    try {
      localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(modulePayload));
    } catch (_) {}

    var existing = readTeamProfile();
    if (!existing || typeof existing !== 'object') existing = {};
    var merged = Object.assign({}, existing, {
      region: existing.region || state.country,
      sitePostcode: postcode || existing.sitePostcode || '',
      siteConnections: connections,
      siteEnergyUpdatedAt: updatedAt
    });
    writeJsonBoth(PROFILE_KEY, merged);
    try {
      window.dispatchEvent(new CustomEvent('gw-profile-changed', { detail: merged }));
    } catch (_) {}

    var note = document.getElementById('connSaveNote');
    if (note) {
      note.textContent = 'Saved for agents — connections + postcode on shared profile.';
      note.classList.add('ok');
    }
  }

  function renderResults(data) {
    var resultsEl = document.getElementById('results');
    var localityEl = document.getElementById('locality');
    var needle = document.getElementById('needle');
    var indexLabel = document.getElementById('indexLabel');
    var gco2Label = document.getElementById('gco2Label');
    var indexNote = document.getElementById('indexNote');
    var mixList = document.getElementById('mixList');
    var areaList = document.getElementById('areaList');
    var recList = document.getElementById('recList');
    var forecastCallout = document.getElementById('forecastCallout');
    var forecastChart = document.getElementById('forecastChart');
    var forecastAxis = document.getElementById('forecastAxis');
    var sourceNote = document.getElementById('sourceNote');
    var liveBadge = document.getElementById('liveBadge');
    var resultLinks = document.getElementById('resultLinks');

    state.lastLookup = data;
    state.postcode =
      (data.locality && (data.locality.postcode || data.locality.label)) ||
      (document.getElementById('postcode') && document.getElementById('postcode').value.trim()) ||
      '';

    if (localityEl) localityEl.innerHTML = '<b>' + escapeHtml(data.locality.label) + '</b>';

    if (liveBadge) {
      liveBadge.hidden = false;
      if (data.live) {
        liveBadge.className = 'live-badge is-live';
        liveBadge.textContent = '● Live grid data';
      } else {
        liveBadge.className = 'live-badge is-benchmark';
        liveBadge.textContent = 'Zone benchmark — not live grid';
      }
    }
    if (resultLinks) resultLinks.hidden = true;

    state.connections = loadSavedConnections(state.country);
    showConnectionsPanel();
    updateEpcHintBox(data);

    var idx = (data.intensity.index || 'moderate').toLowerCase();
    if (needle) needle.setAttribute('transform', 'rotate(' + (INDEX_ANGLES[idx] || 0) + ' 120 130)');
    if (indexLabel) indexLabel.textContent = idx.charAt(0).toUpperCase() + idx.slice(1);
    if (gco2Label) {
      gco2Label.innerHTML =
        'Grid carbon intensity: <span>' +
        (data.intensity.forecast != null ? data.intensity.forecast + ' gCO₂/kWh' : '—') +
        '</span>';
    }
    if (indexNote) indexNote.textContent = INDEX_COPY[idx] || INDEX_COPY.moderate;

    if (mixList) {
      mixList.innerHTML = (data.generationMix || [])
        .map(function (m) {
          return (
            '<div class="mix-row"><span class="mix-fuel">' +
            escapeHtml(m.fuel) +
            '</span><span class="mix-bar-track"><span class="mix-bar-fill" style="width:' +
            Math.max(m.perc, 1) +
            '%;background:' +
            (m.color || '#4fa097') +
            ';"></span></span><span class="mix-pct">' +
            Math.round(m.perc) +
            '%</span></div>'
          );
        })
        .join('');
    }

    if (areaList) {
      areaList.innerHTML =
        '<div class="kv"><span class="k">Network operator</span><span class="v">' +
        escapeHtml(data.grid.operator) +
        '</span></div>' +
        '<div class="kv"><span class="k">Grid zone</span><span class="v">' +
        escapeHtml(data.grid.zone) +
        '</span></div>' +
        '<div class="kv"><span class="k">Local area</span><span class="v">' +
        escapeHtml(data.locality.adminDistrict || data.locality.region) +
        '</span></div>' +
        '<div class="kv"><span class="k">Power cuts</span><span class="v">' +
        escapeHtml(data.grid.powerCutLine) +
        '</span></div>';
    }

    if (recList) {
      recList.innerHTML = (data.recommendations || [])
        .map(function (r) {
          return '<li><b>' + escapeHtml(r.title) + '</b>' + escapeHtml(r.body) + '</li>';
        })
        .join('');
    }

    if (sourceNote) {
      sourceNote.textContent =
        (data.live ? 'Live' : 'Illustrative') +
        ' · Source: ' +
        (data.source || 'unknown') +
        (data.note ? ' — ' + data.note : '');
    }

    var periods = (data.forecast && data.forecast.periods) || [];
    var best = data.forecast && data.forecast.bestWindow;
    if (forecastCallout) {
      if (best && best.avgForecast != null) {
        forecastCallout.innerHTML =
          'Cleanest 2-hour window in the next 24h: <b>' +
          escapeHtml(best.startLabel) +
          '–' +
          escapeHtml(best.endLabel) +
          '</b> (avg. ~' +
          best.avgForecast +
          ' gCO₂/kWh). Worth scheduling defrosts, batch prep or big equipment cycles here where service allows.';
      } else if (!periods.length) {
        forecastCallout.textContent =
          data.region === 'eu' && !data.live
            ? '24-hour forecast needs live EU grid data on Render — current reading uses zone benchmark.'
            : 'Forecast unavailable for this lookup right now.';
      } else {
        forecastCallout.textContent = 'Forecast loaded — hover bars for half-hour values.';
      }
    }

    if (forecastChart && periods.length) {
      var values = periods
        .map(function (p) {
          return p.intensity.forecast;
        })
        .filter(function (v) {
          return v != null;
        });
      var min = Math.min.apply(null, values);
      var max = Math.max.apply(null, values);
      var range = Math.max(max - min, 1);
      forecastChart.innerHTML = periods
        .map(function (p) {
          var idx2 = (p.intensity.index || 'moderate').toLowerCase();
          var color = INDEX_COLORS[idx2] || '#93a099';
          var val = p.intensity.forecast;
          var heightPct = val != null ? 15 + ((val - min) / range) * 85 : 8;
          var t = new Date(p.from).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: state.country === 'uk' ? 'Europe/London' : 'Europe/Amsterdam'
          });
          return (
            '<div class="fbar" style="height:' +
            heightPct +
            '%;background:' +
            color +
            ';" title="' +
            escapeHtml(t) +
            ' — ' +
            (val != null ? val + ' gCO₂/kWh' : 'n/a') +
            '"></div>'
          );
        })
        .join('');
      if (forecastAxis) {
        var labels = [];
        for (var j = 0; j < periods.length; j += Math.max(1, Math.floor(periods.length / 6))) {
          labels.push(
            new Date(periods[j].from).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: state.country === 'uk' ? 'Europe/London' : 'Europe/Amsterdam'
            })
          );
        }
        forecastAxis.innerHTML = labels
          .map(function (l) {
            return '<span>' + escapeHtml(l) + '</span>';
          })
          .join('');
      }
    } else if (forecastChart) {
      forecastChart.innerHTML = '';
      if (forecastAxis) forecastAxis.innerHTML = '';
    }

    if (resultsEl) resultsEl.classList.add('show');
    renderUtilityLanes();
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function lookup() {
    var input = document.getElementById('postcode');
    var btn = document.getElementById('lookupBtn');
    var raw = input ? input.value.trim() : '';
    if (!raw) {
      setStatus('Enter a postcode or postal code first.', true);
      return;
    }
    if (btn) btn.disabled = true;
    setStatus('Reading site…');
    var resultsEl = document.getElementById('results');
    var liveBadge = document.getElementById('liveBadge');
    var resultLinks = document.getElementById('resultLinks');
    var connPanel = document.getElementById('connectionsPanel');
    if (resultsEl) resultsEl.classList.remove('show');
    if (liveBadge) liveBadge.hidden = true;
    if (resultLinks) resultLinks.hidden = true;
    if (connPanel) connPanel.classList.remove('show');
    hideEpcHintBox();
    hideUtilityLanes();
    state.lastLookup = null;

    try {
      var q = new URLSearchParams({ country: state.country, postcode: raw });
      var res = await fetch(apiBase() + '/api/site-energy-reading/lookup?' + q);
      var data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Lookup failed.');
      state.postcode = raw;
      renderResults(data);
      setStatus('');
    } catch (err) {
      setStatus(err.message || 'Something went wrong.', true);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyThemeModes();
    initInfoTips();
    document.querySelectorAll('.country-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setCountry(btn.getAttribute('data-country'));
      });
    });
    document.querySelectorAll('.conn-chip[data-conn]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var key = chip.getAttribute('data-conn');
        var next = {};
        next[key] = !state.connections[key];
        setConnections(next);
      });
    });
    var saveBtn = document.getElementById('saveConnectionsBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveConnectionsForAgents);
    var applyEpcBtn = document.getElementById('applyEpcHintBtn');
    if (applyEpcBtn) applyEpcBtn.addEventListener('click', applyEpcHint);

    var initial = normalizeCountryFromQuery();
    setCountry(initial, false);
    var prefill = params().get('postcode') || params().get('postal');
    if (prefill) {
      var input = document.getElementById('postcode');
      if (input) input.value = prefill;
      lookup();
    }
    var btn = document.getElementById('lookupBtn');
    if (btn) btn.addEventListener('click', lookup);
    var inputEl = document.getElementById('postcode');
    if (inputEl) {
      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') lookup();
      });
    }
    document.querySelectorAll('.result-chip[data-module-id]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        openRelatedModule(chip.getAttribute('data-module-id'), chip.getAttribute('data-module-query') || '');
      });
    });
    var lanesGrid = document.getElementById('utilityLanesGrid');
    if (lanesGrid) {
      lanesGrid.addEventListener('click', function (e) {
        var chip = e.target && e.target.closest ? e.target.closest('[data-module-id]') : null;
        if (!chip || !lanesGrid.contains(chip)) return;
        openRelatedModule(chip.getAttribute('data-module-id'), chip.getAttribute('data-module-query') || '');
      });
    }
  });

  function initInfoTips() {
    var tips = document.querySelectorAll('[data-info-tip]');
    if (!tips.length) return;

    function closeAll(except) {
      tips.forEach(function (tip) {
        if (except && tip === except) return;
        tip.classList.remove('is-open');
        var b = tip.querySelector('.info-tip-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }

    tips.forEach(function (tip) {
      var btn = tip.querySelector('.info-tip-btn');
      var panel = tip.querySelector('.info-tip-panel');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var open = tip.classList.contains('is-open');
        closeAll();
        if (!open) {
          tip.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
      if (panel) {
        panel.addEventListener('click', function (e) { e.stopPropagation(); });
      }
    });

    document.addEventListener('click', function () { closeAll(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
  }
})();
