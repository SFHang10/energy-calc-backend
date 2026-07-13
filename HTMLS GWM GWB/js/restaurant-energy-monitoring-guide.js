/**
 * Restaurant energy monitoring guide — UK/EU region, embed mode, calculator, case studies.
 */
(function () {
  'use strict';

  var REGION_COPY = {
    uk: {
      label: 'United Kingdom',
      currency: '£',
      locale: 'en-GB',
      kwhPrice: 0.22,
      billMin: 500,
      billMax: 8000,
      billDefault: 2000,
      heroSub:
        'UK restaurants spend £12,000–£38,000 a year on energy — with much of it wasted invisibly. Energy monitoring changes that. Here is the complete picture for UK operators.',
      monthlyUtility:
        'UK restaurants: £1,000–£3,200/month on combined utilities (2026)',
      dashSite: 'The Anchor Kitchen & Bar — Shoreditch, London',
      complianceLead: 'UK & EU compliance landscape',
      complianceDesc:
        'Regulation is tightening across the UK and Europe. Monitoring positions restaurants on the right side of every framework.'
    },
    eu: {
      label: 'Europe',
      currency: '€',
      locale: 'de-DE',
      kwhPrice: 0.26,
      billMin: 600,
      billMax: 9000,
      billDefault: 2300,
      heroSub:
        'European restaurants often spend €14,000–€45,000 a year on energy — with much of it wasted invisibly. Energy monitoring changes that. Here is the complete picture for EU operators.',
      monthlyUtility:
        'EU restaurants: €1,200–€3,800/month on combined utilities (2026 est.)',
      dashSite: 'De Groene Keuken — Amsterdam Centrum',
      complianceLead: 'EU & UK compliance landscape',
      complianceDesc:
        'Regulation is tightening across Europe and the UK. Monitoring positions restaurants on the right side of EED, SECR, HACCP, and net-zero reporting.'
    }
  };

  var state = {
    region: 'uk',
    cases: [],
    caseFilter: 'all',
    dashChart: null,
    currentHour: 13
  };

  function params() {
    return new URLSearchParams(window.location.search || '');
  }

  function normalizeRegion(raw) {
    var r = String(raw || 'uk').toLowerCase().trim();
    if (!r || r === 'all') return 'uk';
    if (r.indexOf('uk') === 0) return 'uk';
    return 'eu';
  }

  function isEmbed() {
    var p = params();
    return p.get('embed') === '1' || p.get('popup') === '1';
  }

  function money(amount, region) {
    var cfg = REGION_COPY[region] || REGION_COPY.uk;
    var n = Math.round(Number(amount) || 0);
    try {
      return (
        cfg.currency +
        n.toLocaleString(cfg.locale, { maximumFractionDigits: 0 })
      );
    } catch (_) {
      return cfg.currency + n;
    }
  }

  function cfg() {
    return REGION_COPY[state.region] || REGION_COPY.uk;
  }

  function applyEmbedMode() {
    if (!isEmbed()) return;
    document.body.classList.add('embed-mode');
    var nav = document.querySelector('nav');
    if (nav) nav.classList.add('embed-nav');
  }

  function setRegion(region, pushUrl) {
    state.region = normalizeRegion(region);
    state.caseFilter = state.region;
    document.querySelectorAll('.region-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-region') === state.region);
    });
    document.body.setAttribute('data-region', state.region);
    applyRegionCopy();
    calcSavings();
    renderCases();
    updateDashCost();
    if (pushUrl !== false && window.history && window.history.replaceState) {
      var p = params();
      p.set('region', state.region);
      var q = p.toString();
      window.history.replaceState({}, '', window.location.pathname + (q ? '?' + q : ''));
    }
  }

  function applyRegionCopy() {
    var c = cfg();
    var heroSub = document.getElementById('heroSub');
    if (heroSub) heroSub.textContent = c.heroSub;
    var dashTitle = document.getElementById('dashSiteTitle');
    if (dashTitle) dashTitle.textContent = c.dashSite;
    var compLead = document.getElementById('complianceLead');
    if (compLead) compLead.textContent = c.complianceLead;
    var compDesc = document.getElementById('complianceDesc');
    if (compDesc) compDesc.textContent = c.complianceDesc;
    var bill = document.getElementById('monthlyBill');
    if (bill) {
      bill.min = String(c.billMin);
      bill.max = String(c.billMax);
      if (Number(bill.value) < c.billMin || Number(bill.value) > c.billMax) {
        bill.value = String(c.billDefault);
      }
    }
    var billMinLbl = document.getElementById('billMinLbl');
    var billMaxLbl = document.getElementById('billMaxLbl');
    if (billMinLbl) billMinLbl.textContent = money(c.billMin, state.region);
    if (billMaxLbl) billMaxLbl.textContent = money(c.billMax, state.region);
    document.querySelectorAll('[data-region-only]').forEach(function (el) {
      var want = el.getAttribute('data-region-only');
      el.style.display = want === state.region ? '' : 'none';
    });
    document.querySelectorAll('.case-filter-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === state.caseFilter);
    });
  }

  function calcSavings() {
    var billEl = document.getElementById('monthlyBill');
    var sitesEl = document.getElementById('numSites');
    var typeEl = document.getElementById('restType');
    var ageEl = document.getElementById('equipAge');
    if (!billEl || !sitesEl || !typeEl || !ageEl) return;

    var bill = parseInt(billEl.value, 10);
    var sites = parseInt(sitesEl.value, 10);
    var type = typeEl.value;
    var age = ageEl.value;
    var c = cfg();

    var billDisplay = document.getElementById('billDisplay');
    var sitesDisplay = document.getElementById('sitesDisplay');
    if (billDisplay) billDisplay.textContent = money(bill, state.region);
    if (sitesDisplay) sitesDisplay.textContent = String(sites);

    var typeRate = { casual: 0.3, qsr: 0.35, fine: 0.25, cafe: 0.28, chain: 0.38 };
    var ageBonus = { old: 0.07, mid: 0, new: -0.06 };
    var rate = Math.min(0.42, Math.max(0.1, typeRate[type] + ageBonus[age]));
    var annual = bill * 12 * sites;
    var waste = Math.round(annual * 0.4);
    var saving = Math.round(annual * rate);
    var subCost = Math.round(sites * (state.region === 'eu' ? 850 : 750));
    var net = saving - subCost;
    var co2 = (saving / 1000 * 0.233 * 4.3).toFixed(1);
    var payback =
      net > saving * 0.8 ? 'Under 4 months' : net > 0 ? 'Under 6 months' : '6–12 months';

    var resultMain = document.getElementById('resultMain');
    if (resultMain) resultMain.textContent = money(saving, state.region);
    var rAnnual = document.getElementById('rAnnual');
    if (rAnnual) rAnnual.textContent = money(annual, state.region);
    var rWaste = document.getElementById('rWaste');
    if (rWaste) rWaste.textContent = money(waste, state.region);
    var rRate = document.getElementById('rRate');
    if (rRate) rRate.textContent = Math.round(rate * 100) + '%';
    var rNet = document.getElementById('rNet');
    if (rNet) rNet.textContent = money(net, state.region);
    var rCO2 = document.getElementById('rCO2');
    if (rCO2) rCO2.textContent = co2 + ' tonnes';
    var rPayback = document.getElementById('rPayback');
    if (rPayback) rPayback.textContent = payback;
  }

  function badgeClass(badge) {
    if (badge === 'verified') return 'pill-green';
    return 'pill-amber';
  }

  function badgeLabel(badge) {
    if (badge === 'verified') return 'Verified · ' + (arguments[1] || 'published source');
    return 'Illustrative · ' + (arguments[1] || 'composite benchmark');
  }

  function renderCases() {
    var grid = document.getElementById('casesGrid');
    if (!grid || !state.cases.length) return;

    var filter = state.caseFilter;
    var list = state.cases.filter(function (item) {
      if (filter === 'all') return true;
      return item.region === filter;
    });

    grid.innerHTML = list
      .map(function (item) {
        return (
          '<div class="case-card" onclick="window.RemGuide.toggleCase(this)">' +
          '<div class="case-flag">' +
          item.flag +
          '</div>' +
          '<div class="case-brand">' +
          escapeHtml(item.brand) +
          '</div>' +
          '<div class="case-type">' +
          escapeHtml(item.type) +
          '</div>' +
          '<div class="case-stats">' +
          '<div class="case-stat"><div class="case-stat-val">' +
          escapeHtml(item.stat1Val) +
          '</div><div class="case-stat-label">' +
          escapeHtml(item.stat1Label) +
          '</div></div>' +
          '<div class="case-stat"><div class="case-stat-val">' +
          escapeHtml(item.stat2Val) +
          '</div><div class="case-stat-label">' +
          escapeHtml(item.stat2Label) +
          '</div></div>' +
          '</div>' +
          '<div class="case-desc">' +
          escapeHtml(item.summary) +
          '</div>' +
          '<div class="case-expand">' +
          formatDetail(item.detail) +
          '<br><br><span class="pill ' +
          badgeClass(item.badge) +
          '">' +
          escapeHtml(badgeLabel(item.badge, item.source)) +
          '</span></div>' +
          '<div class="case-read-more">Read more ↓</div></div>'
        );
      })
      .join('');
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDetail(text) {
    return String(text || '')
      .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:var(--white)">$1</strong>')
      .replace(/\n\n/g, '<br><br>');
  }

  function loadCases() {
    var urls = ['/data/restaurant-energy-monitoring-cases.json', '../data/restaurant-energy-monitoring-cases.json'];
    function tryFetch(i) {
      if (i >= urls.length) return Promise.resolve();
      return fetch(urls[i])
        .then(function (r) {
          if (!r.ok) throw new Error('missing');
          return r.json();
        })
        .then(function (data) {
          state.cases = data.cases || [];
          renderCases();
        })
        .catch(function () {
          return tryFetch(i + 1);
        });
    }
    return tryFetch(0);
  }

  function updateDashCost() {
    var totalEl = document.getElementById('dmKwh');
    var costEl = document.getElementById('dmCost');
    if (!totalEl || !costEl) return;
    var total = parseInt(String(totalEl.textContent).replace(/\D/g, ''), 10) || 127;
    costEl.textContent = money(Math.round(total * cfg().kwhPrice), state.region);
    var sub = document.getElementById('dashKwhSub');
    if (sub) sub.textContent = 'at ' + cfg().currency + cfg().kwhPrice.toFixed(2) + '/kWh';
  }

  function initChart() {
    var canvasEl = document.getElementById('dashChart');
    if (!canvasEl || typeof Chart === 'undefined') return;

    var hours = [];
    for (var h = 0; h < 24; h++) hours.push((h < 10 ? '0' : '') + h);
    var avgData = [8, 7, 7, 7, 7, 8, 10, 14, 18, 22, 24, 26, 25, 24, 23, 22, 23, 26, 28, 27, 24, 20, 15, 10];
    var todayData = [7, 6, 6, 6, 7, 7, 8, 12, 17, 20, 22, 21, 20, null, null, null, null, null, null, null, null, null, null, null];

    var ctx = canvasEl.getContext('2d');
    state.dashChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hours.map(function (x) {
          return x + ':00';
        }),
        datasets: [
          {
            label: '30-day avg',
            data: avgData,
            borderColor: 'rgba(93,202,165,0.4)',
            backgroundColor: 'transparent',
            borderDash: [4, 4],
            pointRadius: 0,
            borderWidth: 1.5
          },
          {
            label: 'Today',
            data: todayData,
            borderColor: '#1D9E75',
            backgroundColor: 'rgba(29,158,117,0.08)',
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#1D9E75',
            borderWidth: 2,
            spanGaps: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,20,18,0.95)',
            titleColor: '#9FE1CB',
            bodyColor: '#888780',
            borderColor: 'rgba(29,158,117,0.3)',
            borderWidth: 1,
            callbacks: {
              label: function (ctx) {
                return (
                  ctx.dataset.label +
                  ': ' +
                  (ctx.parsed.y !== null ? ctx.parsed.y + ' kWh' : 'pending')
                );
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#5F5E5A', font: { size: 10 }, maxTicksLimit: 8 },
            grid: { color: 'rgba(255,255,255,0.04)' }
          },
          y: {
            ticks: {
              color: '#5F5E5A',
              font: { size: 10 },
              callback: function (v) {
                return v + ' kWh';
              }
            },
            grid: { color: 'rgba(255,255,255,0.04)' },
            min: 0,
            max: 35
          }
        }
      }
    });

    setInterval(function () {
      if (state.currentHour >= 23 || !state.dashChart) return;
      state.currentHour++;
      var val = avgData[state.currentHour] + Math.round((Math.random() - 0.5) * 3);
      state.dashChart.data.datasets[1].data[state.currentHour] = Math.max(5, val);
      state.dashChart.update('none');
      var total = state.dashChart.data.datasets[1].data
        .filter(function (v) {
          return v !== null;
        })
        .reduce(function (a, b) {
          return a + b;
        }, 0);
      var kwhEl = document.getElementById('dmKwh');
      if (kwhEl) kwhEl.textContent = Math.round(total) + ' kWh';
      updateDashCost();
    }, 4000);
  }

  function scrollToSection() {
    var section = params().get('section') || window.location.hash.replace(/^#/, '');
    if (!section) return;
    var el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function bindUi() {
    document.querySelectorAll('.region-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setRegion(btn.getAttribute('data-region'));
      });
    });
    document.querySelectorAll('.case-filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.caseFilter = btn.getAttribute('data-filter');
        document.querySelectorAll('.case-filter-btn').forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
        renderCases();
      });
    });
    ['monthlyBill', 'numSites', 'restType', 'equipAge'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', calcSavings);
      el.addEventListener('change', calcSavings);
    });
  }

  window.RemGuide = {
    calcSavings: calcSavings,
    toggleEquip: function (card, detailId) {
      document.querySelectorAll('.equip-card').forEach(function (c) {
        c.classList.remove('active');
      });
      document.querySelectorAll('.equip-detail').forEach(function (d) {
        d.classList.remove('visible');
      });
      var detail = document.getElementById(detailId);
      if (detail) {
        card.classList.add('active');
        detail.classList.add('visible');
        detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },
    switchTab: function (btn, panelId) {
      document.querySelectorAll('.tab-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      document.querySelectorAll('.tab-panel').forEach(function (p) {
        p.classList.remove('active');
      });
      btn.classList.add('active');
      var panel = document.getElementById(panelId);
      if (panel) panel.classList.add('active');
    },
    toggleCase: function (card) {
      var expand = card.querySelector('.case-expand');
      var readMore = card.querySelector('.case-read-more');
      if (!expand) return;
      var isOpen = expand.classList.contains('visible');
      expand.classList.toggle('visible', !isOpen);
      if (readMore) readMore.textContent = isOpen ? 'Read more ↓' : 'Show less ↑';
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    applyEmbedMode();
    bindUi();
    var initial = normalizeRegion(params().get('region') || 'uk');
    setRegion(initial, false);
    loadCases().then(function () {
      renderCases();
    });
    initChart();
    updateDashCost();
    scrollToSection();
  });
})();
