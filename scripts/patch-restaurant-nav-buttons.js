const fs = require('fs');
const path = require('path');

const tag = ['d', 'i', 'v'].join('');

// --- restaurant-data.html ---
const rdPath = path.join(__dirname, '..', 'HTMLS GWM GWB', 'restaurant-data.html');
let rd = fs.readFileSync(rdPath, 'utf8');

rd = rd.replace(
  '<' + tag + ' style="display:flex;gap:8px;flex-wrap:wrap;">',
  '<' + tag + ' class="top-bar-actions">'
);

if (!rd.includes('id="deepDiveHubBtn"')) {
  rd = rd.replace(
    /(<a class="btn" id="backBtn"[^>]+>[\s\S]*?<\/a>)/,
    '$1\n        <a class="btn" id="deepDiveHubBtn" href="./restaurant-equipment-deep-dive.html">Equipment deep dives</a>'
  );
}

if (!rd.includes('function updateDeepDiveHubLink')) {
  rd = rd.replace(
    '    function restaurantDataReturnPath()',
    `    function updateDeepDiveHubLink() {
      const btn = document.getElementById('deepDiveHubBtn');
      if (!btn) return;
      const params = new URLSearchParams();
      params.set('return', restaurantDataReturnPath());
      btn.href = './restaurant-equipment-deep-dive.html?' + params.toString();
    }

    function restaurantDataReturnPath()`
  );
}

if (!rd.includes('updateDeepDiveHubLink();')) {
  rd = rd.replace(
    "document.getElementById('backBtn').href = returnUrl;",
    "document.getElementById('backBtn').href = returnUrl;\n      updateDeepDiveHubLink();"
  );
  rd = rd.replace(
    'if (b) renderBuilding(b);',
    'if (b) renderBuilding(b);\n        updateDeepDiveHubLink();'
  );
}

fs.writeFileSync(rdPath, rd);

// --- restaurant-equipment-deep-dive.html ---
const ddPath = path.join(__dirname, '..', 'HTMLS GWM GWB', 'restaurant-equipment-deep-dive.html');
let dd = fs.readFileSync(ddPath, 'utf8');

if (!dd.includes('.top-actions')) {
  dd = dd.replace(
    '.btn{border:1px solid var(--line);background:var(--surface-2);color:var(--text);padding:8px 12px;border-radius:10px;text-decoration:none;font-size:13px;cursor:pointer}',
    '.top-actions{display:flex;gap:8px;flex-wrap:wrap;flex:1 1 320px;justify-content:flex-end;max-width:100%}\n    .top-actions .btn{flex:1 1 0;min-width:118px;text-align:center}\n    .hero .cta .btn{flex:1 1 140px;text-align:center;justify-content:center}\n    .utility-btn.utility-restaurant{border-color:rgba(0,245,130,.55);color:#d4ffe8;background:rgba(0,245,130,.14)}\n    .btn{border:1px solid var(--line);background:var(--surface-2);color:var(--text);padding:8px 12px;border-radius:10px;text-decoration:none;font-size:13px;cursor:pointer}'
  );
}

dd = dd.replace(
  '<' + tag + ' style="display:flex;gap:8px;flex-wrap:wrap">',
  '<' + tag + ' class="top-actions">'
);

if (!dd.includes('id="deepDiveRestaurantDataBtn"')) {
  dd = dd.replace(
    /(<a class="btn" id="deepDiveBackLink"[^>]+>[^<]+<\/a>)/,
    '$1\n        <a class="btn utility-btn utility-restaurant" id="deepDiveRestaurantDataBtn" href="./restaurant-data.html">Restaurant data</a>'
  );
}

if (!dd.includes('id="openRestaurantDataLink"')) {
  dd = dd.replace(
    '<a class="btn utility-btn utility-electricity" href="./utility-detail.html?type=electricity">Open Electricity utility page</a>',
    '<a class="btn utility-btn utility-restaurant" id="openRestaurantDataLink" href="./restaurant-data.html">Open Restaurant data</a>\n          <a class="btn utility-btn utility-electricity" href="./utility-detail.html?type=electricity">Open Electricity utility page</a>'
  );
}

if (!dd.includes('function initDeepDiveRestaurantDataBtn')) {
  const fn = `
    function initDeepDiveRestaurantDataBtn() {
      const ret = incomingParams.get('return') || '';
      let building = incomingParams.get('building');
      if (!building) {
        const m = ret.match(/[?&]building=([^&]+)/);
        if (m) building = decodeURIComponent(m[1]);
      }
      const q = new URLSearchParams();
      if (building) q.set('building', building);
      if (/company-map/.test(ret)) q.set('return', './company-map.html');
      const qs = q.toString();
      const href = './restaurant-data.html' + (qs ? '?' + qs : '');
      ['deepDiveRestaurantDataBtn', 'openRestaurantDataLink'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.href = href;
      });
    }

    initDeepDiveRestaurantDataBtn();
`;
  dd = dd.replace('    initDeepDiveReturnNav();', '    initDeepDiveReturnNav();' + fn);
}

// Preserve return on utility detail links when opened from deep dive
if (!dd.includes('initDeepDiveUtilityLinks')) {
  const utilFn = `
    function initDeepDiveUtilityLinks() {
      const ret = encodeURIComponent(window.location.pathname + window.location.search);
      document.querySelectorAll('.utility-btn.utility-electricity, .utility-btn.utility-gas, .utility-btn.utility-water').forEach((a) => {
        if (!a.href || a.id === 'openIntelligenceLink') return;
        try {
          const u = new URL(a.getAttribute('href'), window.location.href);
          u.searchParams.set('return', ret);
          a.href = u.pathname + u.search;
        } catch (_) { /* ignore */ }
      });
    }

    initDeepDiveUtilityLinks();
`;
  dd = dd.replace('    initDeepDiveRestaurantDataBtn();', '    initDeepDiveRestaurantDataBtn();' + utilFn);
}

fs.writeFileSync(ddPath, dd);
console.log('restaurant-data hub btn:', rd.includes('deepDiveHubBtn'));
console.log('deep-dive restaurant btn:', dd.includes('deepDiveRestaurantDataBtn'));
