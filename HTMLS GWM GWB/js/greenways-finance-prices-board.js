/**
 * Vincent finance prices board — ticker KPIs + daily brief + restaurant meaning + price headlines.
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

  const PRICE_TAGS = /BRIEF|WIRE|WHOLESALE|PRICE|TARIFF|MARKET/i;

  function origin() {
    const h = (global.location && global.location.hostname) || '';
    if (h === 'localhost' || h === '127.0.0.1' || h.indexOf('energy-calc-backend') !== -1) {
      return (global.location && global.location.origin) || '';
    }
    return 'https://energy-calc-backend.onrender.com';
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function stripMd(s) {
    return String(s || '').replace(/\*\*/g, '');
  }

  function absHref(href) {
    const h = String(href || '').trim();
    if (!h) return '#';
    if (/^https?:\/\//i.test(h)) return h;
    return (h.charAt(0) === '/' ? '' : '/') + h;
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

  function hubExtremes(rows) {
    const valid = (rows || []).filter((r) => Number.isFinite(Number(r.priceEurMwh)));
    if (!valid.length) return { cheap: null, dear: null };
    let cheap = valid[0];
    let dear = valid[0];
    valid.forEach((r) => {
      if (Number(r.priceEurMwh) < Number(cheap.priceEurMwh)) cheap = r;
      if (Number(r.priceEurMwh) > Number(dear.priceEurMwh)) dear = r;
    });
    return { cheap, dear };
  }

  function meaningCopy(changePct) {
    const n = Number(changePct);
    if (Number.isFinite(n) && n > 1) {
      return {
        title: 'Rising wholesale — act on kWh and tariffs',
        body:
          'Higher day-ahead guides usually pressure retail pass-through soon. Review supplier bands, shift peak kitchen loads where you can, and bring forward efficiency upgrades while grants and green finance are still open.'
      };
    }
    if (Number.isFinite(n) && n < -1) {
      return {
        title: 'Wholesale easing — still cut consumption',
        body:
          'Softer hubs help the bill story, but tariffs rebound. Lower kWh keeps savings when prices rise again, and many grants / BNPL windows stay time-limited — use the dip to plan, not pause.'
      };
    }
    return {
      title: 'Steady hubs — focus on your contract bands',
      body:
        'Wholesale is only a guide. Your restaurant bill follows supplier tariffs, pass-through clauses, and peak/off-peak timing. Pair this board with Finance Finder and the service-hour board before supplier or capex decisions.'
    };
  }

  function pickPriceHeadlines(feed, review) {
    const out = [];
    const seen = new Set();

    function pushPick(p) {
      if (!p || !p.headline) return;
      const key = String(p.headline).slice(0, 80);
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        date: p.date || '',
        headline: p.headline,
        tag: p.tag || 'PRICE',
        detail: p.detail || '',
        href: p.href || '/greenways/finance-news',
        cta: p.cta || 'Open'
      });
    }

    const priceSection = ((feed && feed.roundup && feed.roundup.sections) || []).find(
      (s) => String(s.id || '').toLowerCase() === 'prices'
    );
    (priceSection && priceSection.picks ? priceSection.picks : []).forEach(pushPick);

    ((feed && feed.items) || []).forEach((item) => {
      const tag = String(item.tag || item.lane || item.category || '');
      const blob = `${tag} ${item.headline || item.title || ''} ${item.summary || ''}`;
      if (!PRICE_TAGS.test(blob) && !/price|wholesale|tariff|energy market/i.test(blob)) return;
      pushPick({
        date: item.date || item.publishedAt || '',
        headline: item.headline || item.title,
        tag: tag || 'NEWS',
        detail: item.detail || item.summary || item.financeAngle || '',
        href: item.href || '/greenways/finance-news',
        cta: item.cta || 'Read'
      });
    });

    if (review && review.headline) {
      pushPick({
        date: 'TODAY',
        headline: review.headline,
        tag: 'BRIEF',
        detail: stripMd((review.bullets && review.bullets[0] && review.bullets[0].text) || ''),
        href: '/greenways/finance-wire-main',
        cta: 'Open wire'
      });
    }

    return out.slice(0, 5);
  }

  function renderBriefHtml(review) {
    if (!review || !review.headline) return '';
    const bullets = (review.bullets || [])
      .slice(0, 4)
      .map((b) => `<li>${escapeHtml(stripMd(b.text || b))}</li>`)
      .join('');
    const asOf =
      (review.meta && (review.meta.briefDate || review.meta.generatedAt)) ||
      review.briefDate ||
      'today';
    return (
      `<section class="vp-brief" aria-live="polite">` +
      `<div class="vp-brief-kicker">Today's price brief · Vincent</div>` +
      `<h2 class="vp-brief-headline">${escapeHtml(review.headline)}</h2>` +
      (bullets ? `<ul class="vp-brief-list">${bullets}</ul>` : '') +
      `<p class="vp-brief-meta">As of ${escapeHtml(String(asOf).slice(0, 16))} · wholesale ≠ retail · ` +
      `<a href="/greenways/finance-news" target="_top" rel="noopener">Full finance news</a></p>` +
      `</section>`
    );
  }

  function renderMeaningHtml(focus) {
    const copy = meaningCopy(focus && focus.changePct);
    return (
      `<section class="vp-meaning">` +
      `<div class="vp-section-kicker">For restaurants</div>` +
      `<h3 class="vp-meaning-title">${escapeHtml(copy.title)}</h3>` +
      `<p class="vp-meaning-body">${escapeHtml(copy.body)}</p>` +
      `<div class="vp-cta-row">` +
      `<a class="vp-cta" href="/greenways/finance-finder" target="_top" rel="noopener">Finance Finder</a>` +
      `<a class="vp-cta" href="/greenways/service-hour-cost-board" target="_top" rel="noopener">Service-hour board</a>` +
      `<a class="vp-cta" href="/HTMLS%20GWM%20GWB/equipment-savings-projection.html" target="_top" rel="noopener">Savings projection</a>` +
      `<a class="vp-cta vp-cta--ghost" href="/greenways/finance-news" target="_top" rel="noopener">Finance news</a>` +
      `<a class="vp-cta vp-cta--ghost" href="/HTMLS%20GWM%20GWB/european_energy_deals_portal.html" target="_top" rel="noopener">Tariff compare</a>` +
      `</div></section>`
    );
  }

  function renderWorldHtml() {
    return (
      `<section class="vp-world">` +
      `<div class="vp-section-kicker">World → Europe (guide)</div>` +
      `<p class="vp-world-lead">Global fuel and FX moves often show up in EU power and gas within days to weeks — they are drivers, not your retail quote.</p>` +
      `<ul class="vp-world-list">` +
      `<li><strong>LNG &amp; TTF gas</strong> — global cargo tightness or mild weather can swing continental gas, then electricity in gas-heavy hubs.</li>` +
      `<li><strong>Oil &amp; shipping</strong> — crude and freight costs feed diesel logistics and some industrial power demand signals.</li>` +
      `<li><strong>USD / EUR &amp; policy</strong> — currency and EU market reforms change how wholesale prints translate into supplier offers.</li>` +
      `</ul>` +
      `<p class="vp-world-note">Curated context for Vincent — not live commodity quotes. Pair with Finance news for timed stories.</p>` +
      `</section>`
    );
  }

  function renderHeadlinesHtml(headlines) {
    if (!headlines.length) return '';
    const cards = headlines
      .map((h) => {
        const href = escapeHtml(absHref(h.href));
        return (
          `<a class="vp-headline" href="${href}" target="_top" rel="noopener">` +
          `<div class="vp-headline-top">` +
          `<span class="vp-headline-date">${escapeHtml(h.date)}</span>` +
          (h.tag ? `<span class="vp-headline-tag">${escapeHtml(h.tag)}</span>` : '') +
          `</div>` +
          `<div class="vp-headline-title">${escapeHtml(h.headline)}</div>` +
          (h.detail ? `<div class="vp-headline-detail">${escapeHtml(stripMd(h.detail))}</div>` : '') +
          `<span class="vp-headline-cta">${escapeHtml(h.cta)} →</span>` +
          `</a>`
        );
      })
      .join('');
    return (
      `<section class="vp-headlines">` +
      `<div class="vp-section-kicker">Price headlines</div>` +
      `<p class="vp-headlines-lead">Same Vincent finance feed as Finance news — price / wholesale lens only.</p>` +
      `<div class="vp-headline-grid">${cards}</div>` +
      `</section>`
    );
  }

  function renderBoard(root, payload, regionKey, extras) {
    extras = extras || {};
    const code = REGION_TO_CODE[regionKey] || 'NL';
    const rows = payload.allEnergy || [];
    const renew = payload.renewableShare || [];
    const focus = rows.find((r) => r.code === code) || rows[0];
    const renewRow = renew.find((r) => r.code === code) || renew[0];
    const updated = payload.updatedAt
      ? new Date(payload.updatedAt).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '—';
    const live = payload.isLive ? 'Live' : 'Guide';
    const extremes = hubExtremes(rows);

    const price = focus ? Number(focus.priceEurMwh) : NaN;
    const ch = focus ? fmtChange(focus.changePct) : { text: '—', cls: 'flat' };
    const eurKwh = Number.isFinite(price) ? (price / 1000).toFixed(3) : '—';
    const renewPct = renewRow ? Number(renewRow.sharePct).toFixed(1) : '—';
    const renewCh = renewRow ? fmtChange(renewRow.changePct) : { text: '—', cls: 'flat' };

    const rangeChips =
      extremes.cheap && extremes.dear
        ? `<div class="vp-range">` +
          `<span class="vp-chip">Lowest today · <strong>${escapeHtml(extremes.cheap.name)}</strong> €${Number(extremes.cheap.priceEurMwh).toFixed(1)}</span>` +
          `<span class="vp-chip">Highest today · <strong>${escapeHtml(extremes.dear.name)}</strong> €${Number(extremes.dear.priceEurMwh).toFixed(1)}</span>` +
          `</div>`
        : '';

    const review = extras.review || null;
    const headlines = pickPriceHeadlines(extras.feed, review);

    root.innerHTML =
      renderBriefHtml(review) +
      `<div class="vp-kpi-row">
        <div class="vp-kpi">
          <div class="vp-kpi-label">${focus ? escapeHtml(focus.name) : 'Hub'} wholesale</div>
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
          <div class="vp-kpi-value" style="font-size:0.95rem">${Number(focus && focus.changePct) > 1 ? 'Upgrade sooner' : 'Still worth kWh cuts'}</div>
          <div class="vp-kpi-sub">Wholesale ≠ your retail bill</div>
        </div>
      </div>` +
      rangeChips +
      `<div class="vp-table-wrap">
        <div class="vp-table-head">Europe hubs · day-ahead guide</div>
        <table>
          <thead><tr><th>Hub</th><th>€/MWh</th><th>24h</th><th>~€/kWh</th></tr></thead>
          <tbody>${rows
            .slice(0, 10)
            .map((r) => {
              const p = Number(r.priceEurMwh);
              const fc = fmtChange(r.changePct);
              const focusCls = r.code === code ? ' class="vp-row-focus"' : '';
              return `<tr${focusCls}><td>${escapeHtml(r.name)}</td><td>${Number.isFinite(p) ? p.toFixed(2) : '—'}</td><td class="vp-change ${fc.cls}">${fc.text}</td><td>${Number.isFinite(p) ? (p / 1000).toFixed(3) : '—'}</td></tr>`;
            })
            .join('')}</tbody>
        </table>
      </div>` +
      renderMeaningHtml(focus) +
      renderWorldHtml() +
      renderHeadlinesHtml(headlines) +
      `<p class="vp-note">Wholesale day-ahead guide only — your supplier contract, pass-through clauses, and peak/off-peak bands set the bill Vincent models with Finance Finder and savings projection.</p>` +
      `<div class="vp-meta">${live} · ${escapeHtml(payload.source || 'ticker')} · updated ${escapeHtml(updated)} · region ${escapeHtml(regionKey.toUpperCase())}</div>`;

    const spark = root.querySelector('.vp-spark');
    if (spark && focus) renderSpark(spark, syntheticSpark(focus.priceEurMwh, focus.changePct));
  }

  async function fetchJson(urls) {
    for (let i = 0; i < urls.length; i++) {
      try {
        const res = await fetch(urls[i], { cache: 'no-store' });
        if (!res.ok) continue;
        return await res.json();
      } catch (_) { /* try next */ }
    }
    return null;
  }

  async function loadExtras(base) {
    const reviewWrap = await fetchJson([base + '/api/finance-agent/daily-review']);
    const review =
      reviewWrap && reviewWrap.ok !== false && reviewWrap.review
        ? reviewWrap.review
        : reviewWrap && reviewWrap.headline
          ? reviewWrap
          : null;

    const feed = await fetchJson([
      base + '/data/finance-news-feed.json',
      '../data/finance-news-feed.json',
      '/data/finance-news-feed.json',
      'https://energy-calc-backend.onrender.com/data/finance-news-feed.json'
    ]);

    return { review, feed };
  }

  async function mount(selector, opts) {
    opts = opts || {};
    const root = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!root) return;
    root.classList.add('vincent-prices-board');
    root.innerHTML = '<div class="vp-loading">Loading market board…</div>';
    const region = opts.region || readProfileRegion();
    const base = origin();
    try {
      const [tickerRes, extras] = await Promise.all([
        fetch(base + '/api/energy-ticker', { cache: 'no-store' }),
        loadExtras(base)
      ]);
      const data = tickerRes.ok ? await tickerRes.json() : null;
      if (!data || !data.allEnergy) throw new Error('no data');
      renderBoard(root, data, region, extras);
    } catch (_) {
      root.innerHTML =
        '<div class="vp-note">Could not load ticker — open the full energy ticker module or try again shortly.</div>';
    }
  }

  global.GreenwaysFinancePricesBoard = { mount: mount, readProfileRegion: readProfileRegion };
})(typeof window !== 'undefined' ? window : global);
