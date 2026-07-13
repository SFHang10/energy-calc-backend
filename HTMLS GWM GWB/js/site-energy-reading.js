/**
 * Site energy reading — UK + EU (NL, ES, PT) via /api/site-energy-reading/lookup
 */
(function () {
  'use strict';

  var COUNTRIES = {
    uk: { label: 'United Kingdom', flag: '🇬🇧', mode: 'uk' },
    nl: { label: 'Netherlands', flag: '🇳🇱', mode: 'eu' },
    es: { label: 'Spain', flag: '🇪🇸', mode: 'eu' },
    pt: { label: 'Portugal', flag: '🇵🇹', mode: 'eu' }
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

  var state = { country: 'uk' };

  function params() {
    return new URLSearchParams(window.location.search || '');
  }

  function isEmbed() {
    var p = params();
    return p.get('embed') === '1' || p.get('popup') === '1';
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

  function countryFromProfile() {
    try {
      var raw = sessionStorage.getItem('gw-team-profile-v1');
      if (!raw) return '';
      return profileCountryFromRegion(JSON.parse(raw).region);
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

  var MODULE_HREFS = {
    'european-energy': './european_energy_deals_portal.html',
    'utility-detail': './utility-detail.html'
  };

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
    var href = MODULE_HREFS[moduleId] || '';
    if (!href) return;
    if (query) href += (href.indexOf('?') >= 0 ? '&' : '?') + query;
    window.location.href = href;
  }

  function applyEmbedMode() {
    if (!isEmbed()) return;
    document.body.classList.add('embed-mode');
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
          ? 'Enter a UK postcode for live grid carbon intensity, generation mix, network operator, and 24-hour forecast — plus kitchen timing tips.'
          : 'Enter a ' +
            cfg.label +
            ' postal code for grid carbon reading, generation mix, and kitchen timing tips (live when ENTSO-E or Electricity Maps is configured on Render).';
    }
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
    if (resultLinks) resultLinks.hidden = false;

    var idx = (data.intensity.index || 'moderate').toLowerCase();
    if (needle) needle.setAttribute('transform', 'rotate(' + (INDEX_ANGLES[idx] || 0) + ' 120 130)');
    if (indexLabel) indexLabel.textContent = idx.charAt(0).toUpperCase() + idx.slice(1);
    if (gco2Label) {
      gco2Label.innerHTML =
        'Carbon intensity: <span>' +
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
        .map(function (p, i) {
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
        forecastAxis.innerHTML = labels.map(function (l) {
          return '<span>' + escapeHtml(l) + '</span>';
        }).join('');
      }
    } else if (forecastChart) {
      forecastChart.innerHTML = '';
      if (forecastAxis) forecastAxis.innerHTML = '';
    }

    if (resultsEl) resultsEl.classList.add('show');
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
    if (resultsEl) resultsEl.classList.remove('show');
    if (liveBadge) liveBadge.hidden = true;
    if (resultLinks) resultLinks.hidden = true;

    try {
      var q = new URLSearchParams({ country: state.country, postcode: raw });
      var res = await fetch(apiBase() + '/api/site-energy-reading/lookup?' + q);
      var data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Lookup failed.');
      renderResults(data);
      setStatus('');
    } catch (err) {
      setStatus(err.message || 'Something went wrong.', true);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyEmbedMode();
    document.querySelectorAll('.country-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setCountry(btn.getAttribute('data-country'));
      });
    });
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
    var input = document.getElementById('postcode');
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') lookup();
      });
    }
    document.querySelectorAll('.result-chip[data-module-id]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        openRelatedModule(chip.getAttribute('data-module-id'), chip.getAttribute('data-module-query') || '');
      });
    });
  });
})();
