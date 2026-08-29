/**
 * Shared Agent Wire + Desk hub shell (v2).
 * Per-agent theme, tabs, and copy live in /data/greenways-wire-config.json.
 */
(function (global) {
  'use strict';

  var RENDER = 'https://energy-calc-backend.onrender.com';
  var CONFIG_URL = '/data/greenways-wire-config.json';
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

  function escHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function applyTheme(theme) {
    if (!theme) return;
    var root = document.documentElement;
    var baseOverlay =
      'linear-gradient(180deg, rgba(5, 9, 14, 0.62) 0%, rgba(8, 12, 18, 0.72) 45%, rgba(4, 7, 12, 0.82) 100%)';
    var layers = (theme.backdropLayers || []).slice();
    root.style.setProperty('--accent', theme.accent || '#4da6ff');
    root.style.setProperty('--accent-dim', theme.accentDim || 'rgba(77, 166, 255, 0.12)');
    root.style.setProperty('--accent-hot', theme.accentHot || 'rgba(77, 166, 255, 0.28)');
    root.style.setProperty('--border', theme.border || 'rgba(77, 166, 255, 0.22)');
    root.style.setProperty('--wire-backdrop-image', theme.backdropImage ? 'url("' + theme.backdropImage + '")' : 'none');
    root.style.setProperty('--wire-backdrop-overlay', [baseOverlay].concat(layers).join(', '));
    root.style.setProperty('--wire-logo-gradient', theme.logoGradient || 'linear-gradient(135deg, #16a34a 0%, #60a5fa 55%, #c9a961 100%)');
    root.style.setProperty('--wire-tab-hover-bg', theme.tabHoverBg || 'rgba(0, 123, 255, 0.06)');
  }

  function fetchConfig() {
    if (configCache) return Promise.resolve(configCache);
    return fetch(CONFIG_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Wire config HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        configCache = data;
        return data;
      });
  }

  function buildMarkup(cfg) {
    var ask = cfg.askPanel || {};
    var panelId = ask.id || 'agent';
    return (
      '<div class="wire-backdrop" aria-hidden="true"></div>' +
      '<div class="shell">' +
        '<div class="page-pad">' +
          '<div class="back-row">' +
            '<a href="' + escHtml(abs(cfg.paths.agent)) + '">← ' + escHtml(cfg.agentName) + '</a>' +
            '<a href="' + escHtml(abs(cfg.paths.desk)) + '">' + escHtml(cfg.deskTitle) + '</a>' +
          '</div>' +
          '<header>' +
            '<div class="logo">' +
              '<div class="logo-icon" aria-hidden="true">' + escHtml(cfg.logoIcon) + '</div>' +
              '<div>' +
                '<div class="logo-text">' + escHtml(cfg.domain) + ' <span>Wire</span></div>' +
                '<div class="logo-sub">' + escHtml(cfg.logoSub) + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="header-actions">' +
              '<button type="button" class="btn-header" id="btnRefresh">Refresh panel</button>' +
              '<a class="btn-header primary" id="btnOpenTab" href="' + escHtml(abs(cfg.paths.wire)) + '" target="_blank" rel="noopener">Full page ↗</a>' +
            '</div>' +
          '</header>' +
        '</div>' +
        '<div class="hub-scan-block">' +
          '<div class="mobile-tabs" id="mobileTabs" aria-label="Sections"></div>' +
          '<div class="app">' +
            '<aside>' +
              '<div class="sidebar-section">' +
                '<div class="sidebar-label">' + escHtml(cfg.sidebarLabel) + '</div>' +
                '<div class="nav-tabs" id="navTabs"></div>' +
                '<p class="sidebar-note">' + cfg.sidebarNote + '</p>' +
              '</div>' +
            '</aside>' +
            '<main>' +
              '<div class="main-toolbar"><span id="toolbarLabel">' + escHtml(cfg.defaultToolbar) + '</span></div>' +
              '<div class="frame-wrap">' +
                '<iframe id="hubFrame" title="' + escHtml(cfg.wireFrameTitle) + '" src="' + escHtml(abs(cfg.paths.wireMain)) + '"></iframe>' +
                '<div class="placeholder-panel" id="' + escHtml(panelId) + 'Panel" aria-hidden="true">' +
                  '<div class="placeholder-card">' +
                    '<h2>' + escHtml(ask.heading) + '</h2>' +
                    '<p>' + escHtml(ask.body) + '</p>' +
                    '<a class="placeholder-btn" href="' + escHtml(abs(cfg.paths.agent)) + '" target="_top" rel="noopener">' + escHtml(ask.button) + '</a>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</main>' +
          '</div>' +
        '</div>' +
        '<div class="hub-scroll-separator" role="region" aria-label="' + escHtml(cfg.scrollSeparatorAria) + '">' +
          '<span aria-hidden="true">···</span>' +
          '<span>' + escHtml(cfg.scrollSeparator) + '</span>' +
          '<span class="hub-scroll-separator-chevron" aria-hidden="true">↓</span>' +
        '</div>' +
        '<section class="hub-desk-section" id="deskSection">' +
          '<div class="desk-toolbar">' +
            '<div class="desk-toolbar-title">' +
              '<span>' + escHtml(cfg.deskTitle) + '</span>' +
              '<span class="desk-preview-badge">In this hub</span>' +
            '</div>' +
            '<a class="desk-full-link" id="deskFullLink" href="' + escHtml(abs(cfg.paths.desk)) + '" target="_top" rel="noopener">Open full desk →</a>' +
          '</div>' +
          '<div class="desk-frame-wrap">' +
            '<iframe id="deskFrame" title="' + escHtml(cfg.deskFrameTitle) + '" data-desk-src="' + escHtml(cfg.paths.deskEmbed) + '"></iframe>' +
          '</div>' +
        '</section>' +
        '<p class="wix-embed-footer">' + escHtml(cfg.footer) + '</p>' +
      '</div>'
    );
  }

  function wireHub(cfg) {
    var tabs = cfg.tabs || [];
    var askPanelId = (cfg.askPanel && cfg.askPanel.id) || 'agent';
    var activeTab = cfg.defaultTab || (tabs[0] && tabs[0].id) || 'wire';
    var syncDeskOnTab = cfg.syncDeskOnTab !== false;
    var postMessageType = cfg.postMessageType;

    var frame = document.getElementById('hubFrame');
    var askPanel = document.getElementById(askPanelId + 'Panel');
    var toolbarLabel = document.getElementById('toolbarLabel');
    var btnOpenTab = document.getElementById('btnOpenTab');
    var navTabs = document.getElementById('navTabs');
    var mobileTabs = document.getElementById('mobileTabs');
    var deskFrame = document.getElementById('deskFrame');
    var deskFullLink = document.getElementById('deskFullLink');

    function findTab(id) {
      for (var i = 0; i < tabs.length; i++) if (tabs[i].id === id) return tabs[i];
      return tabs[0];
    }

    function setDeskTab(tabId) {
      if (!deskFrame || !tabId) return;
      deskFrame.src = abs(cfg.paths.deskEmbed + '?tab=' + encodeURIComponent(tabId));
    }

    function tabIconMarkup(tab) {
      if (tab.thumb) {
        return (
          '<span class="tab-icon" aria-hidden="true">' +
          '<img src="' + escHtml(tab.thumb) + '" alt="" loading="lazy" decoding="async">' +
          '</span>'
        );
      }
      return '<span class="tab-icon" aria-hidden="true">' + escHtml(tab.icon || '•') + '</span>';
    }

    function setActive(id) {
      activeTab = id;
      var tab = findTab(id);
      if (!tab) return;
      toolbarLabel.textContent = tab.toolbar;

      document.querySelectorAll('.tab-btn, .mobile-tabs button').forEach(function (el) {
        el.classList.toggle('active', el.getAttribute('data-tab') === id);
      });

      if (tab.openFull && tab.openHref) {
        var full = abs(tab.openHref);
        try {
          if (window.top && window.top !== window) window.top.location.href = full;
          else window.location.href = full;
        } catch (_) {
          window.location.href = full;
        }
        return;
      }

      if (tab.panel === askPanelId) {
        frame.style.display = 'none';
        if (askPanel) {
          askPanel.classList.add('active');
          askPanel.setAttribute('aria-hidden', 'false');
        }
        btnOpenTab.href = abs(cfg.paths.agent);
        return;
      }

      if (askPanel) {
        askPanel.classList.remove('active');
        askPanel.setAttribute('aria-hidden', 'true');
      }
      frame.style.display = 'block';
      frame.src = abs(tab.src);
      btnOpenTab.href = abs(tab.openHref || tab.src);
      if (syncDeskOnTab && tab.deskTab) setDeskTab(tab.deskTab);
    }

    function renderTabs() {
      navTabs.innerHTML = '';
      mobileTabs.innerHTML = '';
      tabs.forEach(function (tab) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tab-btn' + (tab.id === activeTab ? ' active' : '');
        btn.setAttribute('data-tab', tab.id);
        btn.innerHTML =
          tabIconMarkup(tab) +
          '<span><strong>' + escHtml(tab.title) + '</strong><span class="tab-desc">' + escHtml(tab.desc) + '</span></span>';
        btn.addEventListener('click', function () { setActive(tab.id); });
        navTabs.appendChild(btn);

        var m = document.createElement('button');
        m.type = 'button';
        m.setAttribute('data-tab', tab.id);
        m.className = tab.id === activeTab ? 'active' : '';
        m.textContent = tab.title;
        m.addEventListener('click', function () { setActive(tab.id); });
        mobileTabs.appendChild(m);
      });
    }

    function initDeskPreview(deskTab) {
      if (deskFullLink) deskFullLink.href = abs(cfg.paths.desk);
      if (!deskFrame || deskFrame.getAttribute('src')) return;
      var base = deskFrame.getAttribute('data-desk-src') || cfg.paths.deskEmbed;
      var q = deskTab ? '?tab=' + encodeURIComponent(deskTab) : '';
      deskFrame.src = abs(base + q);
    }

    function scrollToDesk() {
      var el = document.getElementById('deskSection');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    document.getElementById('btnRefresh').addEventListener('click', function () {
      var tab = findTab(activeTab);
      if (tab.panel === askPanelId) return;
      if (tab.openFull) return;
      frame.src = abs(tab.src);
    });

    if (postMessageType) {
      window.addEventListener('message', function (ev) {
        var data = ev.data || {};
        if (data.type === postMessageType && data.tab) {
          setDeskTab(data.tab);
          scrollToDesk();
        }
      });
    }

    renderTabs();

    var params = new URLSearchParams(location.search);
    var tabParam = params.get('tab');
    var deskTabParam = params.get('deskTab');

    if (tabParam && findTab(tabParam).id === tabParam) {
      setActive(tabParam);
    } else {
      setActive(activeTab);
    }

    initDeskPreview(deskTabParam);
    if (deskTabParam) {
      setTimeout(scrollToDesk, 450);
    }
  }

  function mount(cfg, root) {
    document.title = cfg.pageTitle || (cfg.agentName + ' — ' + cfg.domain + ' wire');
    applyTheme(cfg.theme);
    root.className = '';
    root.innerHTML = buildMarkup(cfg);
    wireHub(cfg);
  }

  function showError(root, message) {
    root.className = 'gw-wire-error';
    root.textContent = message;
  }

  function init(wireId, rootEl) {
    var root = rootEl || document.getElementById('gw-wire-root');
    if (!root) return Promise.reject(new Error('Missing #gw-wire-root'));
    if (!wireId) wireId = document.body && document.body.getAttribute('data-wire-id');
    if (!wireId) return Promise.reject(new Error('Missing wire id'));

    return fetchConfig()
      .then(function (data) {
        var cfg = data.wires && data.wires[wireId];
        if (!cfg) throw new Error('Unknown wire id: ' + wireId);
        mount(cfg, root);
      })
      .catch(function (err) {
        console.error('[GreenwaysWireHub]', err);
        showError(root, 'Could not load wire hub. ' + (err && err.message ? err.message : ''));
      });
  }

  global.GreenwaysWireHub = { init: init };

  document.addEventListener('DOMContentLoaded', function () {
    var wireId = document.body && document.body.getAttribute('data-wire-id');
    if (wireId && document.getElementById('gw-wire-root')) {
      init(wireId);
    }
  });
})(window);
