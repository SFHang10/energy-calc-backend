/**
 * Vincent finance prices board — fetches /api/energy-ticker, KPI cards + hub table.
 * Mount: GreenwaysFinancePricesBoard.mount('#el', { region: 'nl' })
 */
(function (global) {
  const REGION_TO_CODE = {
    nl: 'NL',
    de: 'DE',
    fr: 'FR',
    es: 'ES',
    pt: 'PT',
    it: 'IT',
    pl: 'PL',
    uk: 'NL',
    eu: 'NL'
  };

  function origin() {
    const h = (global.location && global.location.hostname) || '';
    if (h === 'localhost' || h === '127.0.0.1' || h.indexOf('energy-calc-backend') !== -1) {
      return (global.location && global.location.origin) || '';
    }
    return 'https://energy-calc-backend.onrender.com';
  }

  function readProfileRegion() {
    try {
      const params = new URLSearchParams(global.location.search);
      if (params.get('region')) return String(params.get('region')).toLowerCase();
      if (global.GreenwaysAgentTeam && typeof global.GreenwaysAgentTeam.readSharedProfile === 'function') {
        const p = global.GreenwaysAgentTeam.readSharedProfile() || {};
        if (p.region) return String(p.region).toLowerCase();
      }
      const raw = global.sessionStorage.getItem('gw-team-profile-v1');
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.region) return String(p.region).toLowerCase();
      }
    } catch (_) { /* ignore */ }
    return 'nl';
  }

  function fmtChange(pct) {
    const n = Number(pct);
    if (!Number.isFinite(n) || n === 0) return { text: 'flat', cls: 'flat' };
    if (n > 0) return { text: `+${n.toFixed(1)}%`, cls: 'up' };
    return { text: `${n.toFixed(1)}%`, cls: 'down' };
  }

  function sparkPath(values, w, h) {
    if (!values.length) return '';
    const min = Math.min.apply(null, values);
    const max = Math.max.apply(null, values);
    const span = max - min || 1;
    const step = w / Math.max(values.length - 1, 1);
    const pts = values.map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `M ${pts.join(' L ')}`;
  }

  function syntheticSpark(base, changePct) {
    const b = Number(base) || 100;
    const c = Number(changePct) || 0;
    return [b * 1.04, b * 1.02, b * 1.01, b * (1 + c / 200), b * (1 + c / 100), b];
  }

  function renderSpark(svg, values, stroke) {
    const path = sparkPath(values, 120, 28);
    svg.innerHTML =
      `<path d="${path}" fill="none" stroke="${stroke || '#38bdf8'}" stroke-width="1.5" stroke-linecap="round" />`;
  }

  function renderBoard(root, payload, regionKey) {
    const code = REGION_TO_CODE[regionKey] || 'NL';
    const rows = payload.allEnergy || [];
    const renew = payload.renewableShare || [];
    const focus = rows.find((r) => r.code === code) || rows[0];
    const renewRow = renew.find((r) => r.code === code) || renew[0];
    const updated = payload.updatedAt ? new Date(payload.updatedAt).toLocaleString() : '—';
    const live = payload.isLive ? 'Live' : 'Guide';

    const price = focus ? Number(focus.priceEurMwh) : NaN;
    const ch = focus ? fmtChange(focus.changePct) : { text: '—', cls: 'flat' };
    const eurKwh = Number.isFinite(price) ? (price / 1000).toFixed(3) : '—';
    const renewPct = renewRow ? Number(renewRow.sharePct).toFixed(1) : '—';
    const renewCh = renewRow ? fmtChange(renewRow.changePct) : { text: '—', cls: 'flat' };

    root.innerHTML =
      `<div class="vp-kpi-row">
        <div class="vp-kpi">
          <div class="vp-kpi-label">${focus ? focus.name : 'Hub'} wholesale</div>
          <div class="vp-kpi-value">${Number.isFinite(price) ? '€' + price.toFixed(2) : '—'}<span style="font-size:0.65em;font-weight:500"> /MWh</span></div>
          <div class="vp-kpi-sub"><span class="vp-change ${ch.cls}">${ch.text}</span> · ~€${eurKwh}/kWh guide</div>
          <svg class="vp-spark" viewBox="0 0 120 28" aria-hidden="true"></svg>
        </div>
        <div class="vp-kpi">
          <div class="vp-kpi-label">Renewable share</div>
          <div class="vp-kpi-value">${renewPct}%</div>
          <div class="vp-kpi-sub"><span class="vp-change ${renewCh.cls}">${renewCh.text}</span> on grid mix</div>
        </div>
        <div class="vp-kpi">
          <div class="vp-kpi-label">Kitchen signal</div>
          <div class="vp-kpi-value" style="font-size:0.95rem">${Number(focus.changePct) > 1 ? 'Upgrade sooner' : 'Still worth kWh cuts'}</div>
          <div class="vp-kpi-sub">Wholesale ≠ your retail bill</div>
        </div>
      </div>
      <div class="vp-table-wrap">
        <table>
          <thead><tr><th>Hub</th><th>€/MWh</th><th>24h</th><th>~€/kWh</th></tr></thead>
          <tbody>${rows
            .slice(0, 8)
            .map((r) => {
              const p = Number(r.priceEurMwh);
              const fc = fmtChange(r.changePct);
              const focusCls = r.code === code ? ' class="vp-row-focus"' : '';
              return `<tr${focusCls}><td>${r.name}</td><td>${Number.isFinite(p) ? p.toFixed(2) : '—'}</td><td class="vp-change ${fc.cls}">${fc.text}</td><td>${Number.isFinite(p) ? (p / 1000).toFixed(3) : '—'}</td></tr>`;
            })
            .join('')}</tbody>
        </table>
      </div>
      <p class="vp-note">Wholesale day-ahead guide only—your supplier contract, pass-through clauses, and peak/off-peak bands set the bill Vincent models with Finance Finder and savings projection.</p>
      <div class="vp-meta">${live} · ${payload.source || 'ticker'} · updated ${updated}</div>`;

    const spark = root.querySelector('.vp-spark');
    if (spark && focus) renderSpark(spark, syntheticSpark(focus.priceEurMwh, focus.changePct));
  }

  async function mount(selector, opts) {
    opts = opts || {};
    const root = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!root) return;
    root.classList.add('vincent-prices-board');
    root.innerHTML = '<div class="vp-loading">Loading market board…</div>';
    const region = opts.region || readProfileRegion();
    try {
      const res = await fetch(origin() + '/api/energy-ticker');
      const data = res.ok ? await res.json() : null;
      if (!data || !data.allEnergy) throw new Error('no data');
      renderBoard(root, data, region);
    } catch (_) {
      root.innerHTML = '<div class="vp-note">Could not load ticker — open the full energy ticker module or try again shortly.</div>';
    }
  }

  global.GreenwaysFinancePricesBoard = { mount: mount, readProfileRegion: readProfileRegion };
})(typeof window !== 'undefined' ? window : global);
