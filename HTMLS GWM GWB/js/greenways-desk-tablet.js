/**
 * Greenways desk tablet — panel rail, gauges, iframe preview toggles.
 * GreenwaysDeskTablet.init({ validPanels, defaultPanel, backAgentPath })
 */
(function (global) {
  'use strict';

  var ARC_LEN = Math.PI * 60;

  function origin() {
    var h = (global.location && global.location.hostname) || '';
    if (h === 'localhost' || h === '127.0.0.1' || h.indexOf('energy-calc-backend') !== -1) {
      return global.location.origin || 'https://energy-calc-backend.onrender.com';
    }
    return 'https://energy-calc-backend.onrender.com';
  }

  function abs(path) {
    var p = String(path || '').trim();
    if (!p || /^https?:\/\//i.test(p)) return p;
    return origin() + (p.charAt(0) === '/' ? p : '/' + p);
  }

  function needleDeg(pct) {
    var p = Math.max(0, Math.min(100, Number(pct)));
    if (Number.isNaN(p)) return -35;
    return -90 + p * (55 / 65);
  }

  function syncGauge(fig) {
    if (!fig) return;
    var pct = Number(fig.getAttribute('data-pct'));
    var fill = fig.querySelector('.gw-desk-gauge-fill');
    var pctText = fig.querySelector('.gw-desk-gauge-pct');
    if (pctText && !Number.isNaN(pct)) pctText.textContent = Math.round(pct) + '%';
    fig.style.setProperty('--needle', needleDeg(pct) + 'deg');
    if (fill && !Number.isNaN(pct)) {
      fill.setAttribute('stroke-dasharray', String(ARC_LEN));
      fill.setAttribute('stroke-dashoffset', String(ARC_LEN));
      global.requestAnimationFrame(function () {
        global.requestAnimationFrame(function () {
          fill.setAttribute('stroke-dashoffset', String(ARC_LEN * (1 - pct / 100)));
        });
      });
    }
  }

  function ensureIframeSrc(wrap) {
    if (!wrap) return;
    var iframe = wrap.querySelector('iframe[data-gw-iframe]');
    if (!iframe || iframe.getAttribute('src')) return;
    iframe.setAttribute('src', abs(iframe.getAttribute('data-gw-iframe')));
  }

  function init(opts) {
    opts = opts || {};
    var validPanels = opts.validPanels || [];
    var defaultPanel = opts.defaultPanel || validPanels[0] || '';
    var isEmbed = /[?&]embed=1/.test(global.location.search || '');
    if (isEmbed) document.body.classList.add('embed-mode');

    document.querySelectorAll('[data-gw-tool-path]').forEach(function (a) {
      a.setAttribute('href', abs(a.getAttribute('data-gw-tool-path')));
      if (isEmbed) a.setAttribute('target', '_top');
    });

    document.querySelectorAll('a[href^="/greenways/"]').forEach(function (a) {
      if (a.hasAttribute('data-gw-tool-path')) return;
      a.setAttribute('href', abs(a.getAttribute('href')));
      if (isEmbed) a.setAttribute('target', '_top');
    });

    var buttons = Array.prototype.slice.call(document.querySelectorAll('.gw-desk-rail-btn[data-panel]'));
    var panels = {};
    validPanels.forEach(function (key) {
      panels[key] = document.getElementById('panel-' + key);
    });

    function showPanel(key) {
      if (validPanels.indexOf(key) === -1) key = defaultPanel;
      Object.keys(panels).forEach(function (k) {
        var el = panels[k];
        if (el) el.classList.toggle('active', k === key);
      });
      buttons.forEach(function (btn) {
        var on = btn.getAttribute('data-panel') === key;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var activeEl = panels[key];
      if (activeEl) {
        activeEl.querySelectorAll('.gw-desk-gauge').forEach(syncGauge);
      }
      try {
        var url = new URL(global.location.href);
        if (key === defaultPanel) url.searchParams.delete('tab');
        else url.searchParams.set('tab', key);
        global.history.replaceState(null, '', url.pathname + url.search + url.hash);
      } catch (_) { /* ignore */ }
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        showPanel(btn.getAttribute('data-panel'));
      });
    });

    document.querySelectorAll('.gw-desk-gauge').forEach(syncGauge);

    document.querySelectorAll('[data-toggle-iframe]').forEach(function (btn) {
      var id = btn.getAttribute('data-toggle-iframe');
      var wrap = document.getElementById('iframe-' + id);
      if (!wrap) return;
      var openLabel = btn.getAttribute('data-open-label') || 'Preview inside tablet';
      btn.addEventListener('click', function () {
        if (wrap.hasAttribute('hidden')) {
          wrap.removeAttribute('hidden');
          ensureIframeSrc(wrap);
          btn.textContent = 'Hide preview';
        } else {
          wrap.setAttribute('hidden', '');
          btn.textContent = openLabel;
        }
      });
    });

    function goBack() {
      if (global.history.length > 1) global.history.back();
      else global.location.href = abs(opts.backAgentPath || '/greenways/grants-agent');
    }

    var backBtn = document.getElementById('gwDeskBackBtn');
    var railBackBtn = document.getElementById('gwDeskRailBackBtn');
    if (backBtn) backBtn.addEventListener('click', goBack);
    if (railBackBtn) railBackBtn.addEventListener('click', goBack);

    var tabParam = new URLSearchParams(global.location.search).get('tab');
    if (tabParam && validPanels.indexOf(tabParam) !== -1) showPanel(tabParam);
    else showPanel(defaultPanel);

    return { showPanel: showPanel, abs: abs };
  }

  global.GreenwaysDeskTablet = {
    init: init,
    abs: abs,
    syncGauge: syncGauge
  };
})(typeof window !== 'undefined' ? window : global);
