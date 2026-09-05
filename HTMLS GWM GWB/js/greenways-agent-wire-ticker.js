/**
 * Compact live wire ticker for agent story pages and chat shells.
 * Fed by /api/*-wire/snapshot via data/greenways-agent-wire-ticker.json.
 */
(function (global) {
  'use strict';

  var RENDER = 'https://energy-calc-backend.onrender.com';
  var CONFIG_URL = '/data/greenways-agent-wire-ticker.json';
  var configCache = null;

  function origin() {
    var h = location.hostname || '';
    if (h === 'localhost' || h === '127.0.0.1' || h.indexOf('energy-calc-backend') !== -1) {
      return location.origin || RENDER;
    }
    return RENDER;
  }

  function abs(path) {
    var p = String(path || '').trim();
    if (!p) return p;
    if (/^https?:\/\//i.test(p)) return p;
    return origin() + (p.charAt(0) === '/' ? p : '/' + p);
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function truncate(text, max) {
    var hay = String(text || '').trim();
    if (hay.length <= max) return hay;
    return hay.slice(0, Math.max(0, max - 1)) + '…';
  }

  function fetchConfig() {
    if (configCache) return Promise.resolve(configCache);
    return fetch(abs(CONFIG_URL))
      .then(function (res) {
        if (!res.ok) throw new Error('ticker config');
        return res.json();
      })
      .then(function (data) {
        configCache = data;
        return data;
      });
  }

  function pill(label, value, tag) {
    return {
      label: String(label || '').trim(),
      value: String(value || '').trim(),
      tag: String(tag || '').trim()
    };
  }

  function buildPills(agentId, snapshot) {
    if (!snapshot || !snapshot.ok) return [];

    if (agentId === 'grants-agent') {
      var pills = [];
      var total = Number(snapshot.totalSchemes || 0);
      var active = Number(snapshot.activeSchemes || 0);
      if (total) pills.push(pill('Catalogue', total.toLocaleString('en-GB') + ' schemes', 'Live'));
      if (active) pills.push(pill('Active', active.toLocaleString('en-GB'), 'Live'));
      var regions = snapshot.regions || {};
      if (regions.nl) pills.push(pill('Netherlands', String(regions.nl), 'NL'));
      if (regions.uk) pills.push(pill('United Kingdom', String(regions.uk), 'UK'));
      if (regions.eu) pills.push(pill('EU-wide', String(regions.eu), 'EU'));
      var deadline = (snapshot.upcomingDeadlines || [])[0];
      if (deadline) {
        pills.push(pill('Deadline', truncate(deadline.title, 42), deadline.deadline));
      }
      var pick = (snapshot.spotlightSchemes || [])[0];
      if (pick) pills.push(pill('Featured', truncate(pick.title, 42), pick.region || 'Scheme'));
      return pills.slice(0, 6);
    }

    if (agentId === 'finance-agent') {
      var financePills = [];
      var hubCount = Number(snapshot.hubCount || 0);
      var spotlightCount = Number(snapshot.spotlightCount || 0);
      if (hubCount) financePills.push(pill('Energy markets', hubCount.toLocaleString('en-GB'), 'Live'));
      if (spotlightCount) financePills.push(pill('Finance stories', spotlightCount.toLocaleString('en-GB'), 'Live'));
      var focus = snapshot.focusMarket;
      if (focus && focus.priceEurMwh) {
        financePills.push(
          pill(
            focus.name || focus.code || 'Market',
            '€' + Number(focus.priceEurMwh).toFixed(0) + '/MWh',
            focus.changeLabel || focus.code || 'Price'
          )
        );
      }
      (snapshot.topLanes || []).slice(0, 2).forEach(function (lane) {
        financePills.push(pill(lane.name, String(lane.count), 'Lane'));
      });
      var daily = snapshot.dailyReview;
      if (daily && daily.headline) {
        financePills.push(pill('Brief', truncate(daily.headline, 44), 'News'));
      }
      return financePills.slice(0, 6);
    }

    if (agentId === 'equipment-agent') {
      var equipPills = [];
      var totalProducts = Number(snapshot.totalProducts || 0);
      var grantsEnriched = Number(snapshot.grantsEnriched || 0);
      if (totalProducts) equipPills.push(pill('ETL catalogue', totalProducts.toLocaleString('en-GB'), 'Live'));
      if (grantsEnriched) equipPills.push(pill('Grant-enriched', grantsEnriched.toLocaleString('en-GB'), 'Live'));
      var buckets = snapshot.buckets || {};
      if (buckets.cookline) equipPills.push(pill('Cookline', String(buckets.cookline), 'Lane'));
      if (buckets.refrigeration) equipPills.push(pill('Refrigeration', String(buckets.refrigeration), 'Lane'));
      var showcase = (snapshot.showcase || [])[0];
      if (showcase) equipPills.push(pill('Showcase', truncate(showcase.name || showcase.label, 42), 'ETL'));
      return equipPills.slice(0, 6);
    }

    if (agentId === 'deals-agent') {
      var dealsPills = [];
      var totalDeals = Number(snapshot.totalDeals || 0);
      var newCount = Number(snapshot.newCount || 0);
      if (totalDeals) dealsPills.push(pill('Deals feed', totalDeals.toLocaleString('en-GB'), 'Live'));
      if (newCount) dealsPills.push(pill('New this month', newCount.toLocaleString('en-GB'), 'Live'));
      (snapshot.topLanes || []).slice(0, 3).forEach(function (lane) {
        dealsPills.push(pill(lane.name, String(lane.count), 'Lane'));
      });
      var dealPick = (snapshot.newThisMonth || [])[0];
      if (dealPick) dealsPills.push(pill('Spotlight', truncate(dealPick.title, 42), dealPick.region || 'Deal'));
      return dealsPills.slice(0, 6);
    }

    if (agentId === 'media-agent') {
      var mediaPills = [];
      var news = Number(snapshot.totalNewsItems || 0);
      var mapTotal = Number(snapshot.mapTotal || 0);
      var mapCases = Number(snapshot.mapCaseStudies || 0);
      var mapDir = Number(snapshot.mapDirectory || 0);
      var videos = Number(snapshot.videoCount || 0);
      var tech = Number(snapshot.techStories || 0);
      if (news) mediaPills.push(pill('News library', news.toLocaleString('en-GB'), 'Live'));
      if (mapTotal) mediaPills.push(pill('Map profiles', mapTotal.toLocaleString('en-GB'), 'Live'));
      if (mapCases) mediaPills.push(pill('Case studies', mapCases.toLocaleString('en-GB'), 'Map'));
      if (mapDir) mediaPills.push(pill('Directory', mapDir.toLocaleString('en-GB'), 'Map'));
      if (videos) mediaPills.push(pill('Videos', videos.toLocaleString('en-GB'), 'Live'));
      if (tech) mediaPills.push(pill('New in Tech', tech.toLocaleString('en-GB'), 'Lane'));
      (snapshot.headlines || []).slice(0, 2).forEach(function (row) {
        mediaPills.push(pill('Headline', truncate(row.title, 44), row.editionType || 'news'));
      });
      return mediaPills.slice(0, 6);
    }

    if (agentId === 'sustainable-products-agent') {
      var productPills = [];
      var catalogTotal = Number(snapshot.totalProducts || 0);
      var grantsCount = Number(snapshot.grantsCount || 0);
      if (catalogTotal) productPills.push(pill('Catalogue', catalogTotal.toLocaleString('en-GB'), 'Live'));
      if (grantsCount) productPills.push(pill('With grants', grantsCount.toLocaleString('en-GB'), 'Live'));
      (snapshot.topLanes || []).slice(0, 3).forEach(function (lane) {
        productPills.push(pill(lane.name, String(lane.count), 'Lane'));
      });
      var productPick = (snapshot.newSpotlights || [])[0] || (snapshot.showcase || [])[0];
      if (productPick) {
        productPills.push(pill('Recent', truncate(productPick.title || productPick.name || productPick.label, 42), 'Catalog'));
      }
      return productPills.slice(0, 6);
    }

    return [];
  }

  function trustLine(snapshot) {
    var meta = (snapshot && snapshot.meta) || {};
    return meta.trustLine || '';
  }

  function duplicateTrack(html) {
    return html + html;
  }

  function renderPills(pills) {
    if (!pills.length) {
      return '<span class="gw-wire-ticker-pill"><strong>Wire scan</strong><span>Open hub for live counts</span></span>';
    }
    return pills
      .map(function (row) {
        return (
          '<span class="gw-wire-ticker-pill">' +
          '<strong>' + esc(row.label) + '</strong>' +
          '<span>' + esc(row.value) + '</span>' +
          (row.tag ? '<span class="tag">' + esc(row.tag) + '</span>' : '') +
          '</span>'
        );
      })
      .join('');
  }

  function renderTicker(mount, agentCfg, pills, trust, isError) {
    var theme = agentCfg.theme || 'grants';
    var html =
      '<section class="gw-wire-ticker gw-wire-ticker--' + esc(theme) + (isError ? ' gw-wire-ticker--error' : '') + '" aria-label="Live wire scan">' +
      '<div class="gw-wire-ticker-head">' +
      '<span class="gw-wire-ticker-live">Live</span>' +
      '<span class="gw-wire-ticker-scan">' + esc(agentCfg.scanLabel || 'Wire scan') + '</span>' +
      '<span class="gw-wire-ticker-trust">' + esc(trust || 'Counts from wire snapshot') + '</span>' +
      '<a class="gw-wire-ticker-cta" href="' + esc(abs(agentCfg.wireHref)) + '" target="_top" rel="noopener">' + esc(agentCfg.wireCta || 'Open wire') + ' →</a>' +
      '</div>' +
      '<div class="gw-wire-ticker-track-outer">' +
      '<div class="gw-wire-ticker-track">' + duplicateTrack(renderPills(pills)) + '</div>' +
      '</div>' +
      '</section>';
    mount.innerHTML = html;
  }

  function initMount(mount) {
    if (!mount || mount.getAttribute('data-gw-ticker-ready') === '1') return;
    var agentId = mount.getAttribute('data-agent') || '';
    if (!agentId) return;

    mount.setAttribute('data-gw-ticker-ready', '1');

    fetchConfig()
      .then(function (cfg) {
        var agentCfg = (cfg.agents || {})[agentId];
        if (!agentCfg) {
          mount.hidden = true;
          return null;
        }
        return agentCfg;
      })
      .then(function (agentCfg) {
        if (!agentCfg) return null;
        var fallback = (agentCfg.fallbackPills || []).map(function (row) {
          return pill(row.label, row.value, 'Scan');
        });
        renderTicker(mount, agentCfg, fallback, 'Loading wire snapshot…', false);
        return fetch(abs(agentCfg.snapshotApi))
          .then(function (res) {
            return res.ok ? res.json() : null;
          })
          .then(function (snapshot) {
            var pills = buildPills(agentId, snapshot);
            if (!pills.length) pills = fallback;
            var trust = trustLine(snapshot) || (snapshot && snapshot.ok ? 'Wire snapshot · live counts' : 'Wire snapshot warming up');
            renderTicker(mount, agentCfg, pills, trust, !snapshot || !snapshot.ok);
          });
      })
      .catch(function () {
        mount.hidden = true;
      });
  }

  function initAll() {
    var mounts = document.querySelectorAll(
      '#gw-wire-ticker-mount[data-agent], .gw-wire-ticker-mount[data-agent]'
    );
    mounts.forEach(initMount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  global.GreenwaysAgentWireTicker = {
    init: initAll,
    initMount: initMount
  };
})(typeof window !== 'undefined' ? window : global);
