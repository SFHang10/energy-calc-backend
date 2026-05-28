/**
 * Build HTMLS GWM GWB/live-music-finder.html from Organisation Orange template + music-venues.json
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'HTMLS GWM GWB', 'Organisation Orange Orginal .Html');
const dst = path.join(root, 'HTMLS GWM GWB', 'live-music-finder.html');
const venuesPath = path.join(root, 'data', 'music-venues.json');

let h = fs.readFileSync(src, 'utf8');
const venues = JSON.parse(fs.readFileSync(venuesPath, 'utf8'));

h = h.replace(
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<meta name="wix-html-scroll" content="no-scroll">'
);
h = h.replace(
  '<title>Greenways — European Partner Map</title>',
  '<title>Live Music Finder For Artists — Open mic &amp; jam nights</title>'
);

const extraCss = `
  body { min-height: 100vh; overflow-x: hidden; overflow-y: auto; height: auto; }
  .main { min-height: calc(100vh - 72px); }
  .popup {
    position: fixed; width: 300px; max-width: calc(100vw - 24px);
    max-height: min(85vh, 560px); z-index: 300;
    display: flex; flex-direction: column;
  }
  .popup-header { flex-shrink: 0; }
  .popup-scroll {
    overflow-y: auto; flex: 1; min-height: 0;
    overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
  }
  .popup-scroll::-webkit-scrollbar { width: 5px; }
  .popup-scroll::-webkit-scrollbar-thumb {
    background: rgba(196,94,10,0.35); border-radius: 3px;
  }
  .popup-image-wrap {
    width: 100%; height: 120px; background: var(--panel2); overflow: hidden;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .popup-image-wrap img { width: 100%; height: 100%; object-fit: cover; }
  .popup-image-placeholder {
    width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
    font-size: 2rem; color: rgba(196,94,10,0.35);
    background: linear-gradient(135deg, #1a1a1a, #252015);
  }
  .popup-link {
    display: inline-block; margin-top: 10px; font-size: 0.78em; color: var(--orange-lt);
    text-decoration: none; border-bottom: 1px solid rgba(240,160,58,0.35);
  }
  .popup-link:hover { color: white; }
  .popup-stat.full-width { grid-column: 1 / -1; text-align: left; }
  .popup-stat.full-width .popup-stat-val {
    font-size: 0.88em; font-family: 'DM Sans', sans-serif; line-height: 1.4;
  }
  .marker-pulse { opacity: 0; }
  .company-marker.selected .marker-pulse,
  .company-marker:hover .marker-pulse {
    animation: pulse-ring 3.6s ease-out infinite;
    transform-origin: center; transform-box: fill-box;
  }
  @keyframes pulse-ring {
    0%   { opacity: 0.18; }
    100% { opacity: 0; }
  }
`;
h = h.replace('  /* ── MAP DOTS ── */', extraCss + '\n  /* ── MAP DOTS ── */');

h = h.replace(
  /\.marker-pulse {\s*animation: pulse-ring[\s\S]*?@keyframes pulse-ring {\s*0%[\s\S]*?100%[\s\S]*?}\s*/,
  ''
);

h = h.replace(
  `<div class="logo">🌍 Greenways — European Partners</div>
    <div class="tagline">Energy efficiency partners across Europe</div>`,
  `<div class="logo">🎵 Live Music Finder For Artists</div>
    <div class="tagline">Open mic nights &amp; jam sessions for musicians</div>`
);

h = h.replace(
  /id="stat-companies"[\s\S]*?Total Savings<\/div>\s*<\/div>/,
  `id="stat-venues">0</div>
      <div class="hstat-lbl">Venues</div>
    </div>
    <div class="hstat">
      <div class="hstat-val" id="stat-genres">0</div>
      <div class="hstat-lbl">Music styles</div>
    </div>
    <div class="hstat">
      <div class="hstat-val" id="stat-city">Amsterdam</div>
      <div class="hstat-lbl">City</div>
    </div>`
);

h = h.replace(
  'Partner Companies <span class="count-badge"',
  'Music venues <span class="count-badge"'
);
h = h.replace(
  'placeholder="Search companies or countries…"',
  'placeholder="Search venues, styles, or areas…"'
);
h = h.replace(
  /<div class="filter-row" id="filter-row">[\s\S]*?<\/div>\s*<\/div>\s*<div class="company-list"/,
  `<div class="filter-row" id="filter-row">
        <button class="filter-btn active" data-genre="all">All</button>
      </div>
    </div>
    <div class="company-list"`
);

h = h.replace('＋ Add New Company', '＋ Suggest a venue');

h = h.replace(
  `<div class="popup-header">
    <div class="popup-company-name" id="popup-name"></div>
    <button class="popup-close" id="popup-close">✕</button>
  </div>
  <div class="popup-body">
    <div class="popup-country-tag" id="popup-country"></div>
    <div class="popup-desc" id="popup-desc"></div>
    <div class="popup-stats" id="popup-stats"></div>
    <div class="popup-sector" id="popup-sector"></div>
  </div>`,
  `<div class="popup-header">
    <div class="popup-company-name" id="popup-name"></div>
    <button class="popup-close" id="popup-close">✕</button>
  </div>
  <div class="popup-scroll">
    <div class="popup-image-wrap" id="popup-image-wrap">
      <div class="popup-image-placeholder" id="popup-image-placeholder">🎵</div>
      <img id="popup-image" alt="" hidden>
    </div>
    <div class="popup-body">
      <div class="popup-country-tag" id="popup-country"></div>
      <div class="popup-desc" id="popup-desc"></div>
      <div class="popup-stats" id="popup-stats"></div>
      <div class="popup-sector" id="popup-genre"></div>
      <a class="popup-link" id="popup-link" href="#" target="_blank" rel="noopener noreferrer" hidden>View listing / venue site →</a>
    </div>
  </div>`
);

const modalStart = h.indexOf('<h3>Add New Company</h3>');
const modalEnd = h.indexOf('<button class="btn-primary" id="modal-save">');
const newModal = `<h3>Suggest a venue</h3>
    <div class="modal-sub">Add a jam night or open mic you know about. Pins use Amsterdam area until the address is geocoded.</div>
    <div class="form-row">
      <label class="form-label">Venue name *</label>
      <input class="form-input" id="f-name" placeholder="e.g. Café de Muurbloem">
    </div>
    <div class="form-row">
      <label class="form-label">Music style *</label>
      <select class="form-select" id="f-genre">
        <option value="jazz">Jazz jam</option>
        <option value="open-mic">Open mic</option>
        <option value="open-jam">Open jam</option>
        <option value="gypsy-swing">Gypsy swing</option>
        <option value="mixed">Mixed / variety</option>
        <option value="live-music">Live music (other)</option>
      </select>
    </div>
    <div class="form-row">
      <label class="form-label">Genre / format</label>
      <input class="form-input" id="f-format" placeholder="e.g. Jazz jam, acoustic welcome">
    </div>
    <div class="form-row">
      <label class="form-label">Day / time</label>
      <input class="form-input" id="f-schedule" placeholder="e.g. Tuesday 20:00–23:00">
    </div>
    <div class="form-row">
      <label class="form-label">Address</label>
      <input class="form-input" id="f-address" placeholder="Street, postcode, Amsterdam">
    </div>
    <div class="form-row">
      <label class="form-label">Listing URL</label>
      <input class="form-input" id="f-url" placeholder="https://…">
    </div>
    <div class="form-row">
      <label class="form-label">About the venue</label>
      <textarea class="form-textarea" id="f-desc" placeholder="Vibe, sign-up rules, who plays here…"></textarea>
    </div>
    <div class="form-row">
      <label class="form-label">Image URL (Wix static when ready)</label>
      <input class="form-input" id="f-image" placeholder="https://static.wixstatic.com/media/…">
    </div>
    <div class="modal-actions">
      `;
h = h.slice(0, modalStart) + newModal + h.slice(modalEnd);

const scriptStart = h.indexOf('<script>');
const scriptEnd = h.lastIndexOf('</script>');
const newScript = `<script>
// Live Music Finder — loads data/music-venues.json (served via Express static root)
const MUSIC_VENUES_FALLBACK = ${JSON.stringify(venues.items)};
const MAP_CENTER = ${JSON.stringify(venues.meta?.mapCenter || { lng: 4.9041, lat: 52.3676 })};

const GENRE_COLORS = {
  jazz: "#c45e0a",
  "open-mic": "#e9c46a",
  "open-jam": "#2a9d8f",
  "gypsy-swing": "#f4845f",
  mixed: "#6c91c2",
  "live-music": "#8ecae6",
  other: "#aaa"
};

const GENRE_LABELS = {
  jazz: "Jazz",
  "open-mic": "Open mic",
  "open-jam": "Open jam",
  "gypsy-swing": "Gypsy swing",
  mixed: "Mixed",
  "live-music": "Live music",
  other: "Other"
};

let venues = [];
let activeId = null;
let currentFilter = "all";
let searchTerm = "";

const mapContainer = document.getElementById("map-container");
const svg = d3.select("#map-svg");
let width = mapContainer.clientWidth;
let height = mapContainer.clientHeight;

const projection = d3.geoMercator()
  .center([MAP_CENTER.lng, MAP_CENTER.lat])
  .scale(Math.min(width, height) * 18)
  .translate([width * 0.5, height * 0.52]);

const path = d3.geoPath().projection(projection);
const g = svg.append("g").attr("id", "map-group");

const zoomBehaviour = d3.zoom()
  .scaleExtent([0.6, 40])
  .on("zoom", (event) => {
    g.attr("transform", event.transform);
    g.selectAll(".marker-dot").attr("r", 6 / event.transform.k * 1.2);
    g.selectAll(".marker-pulse").attr("r", 0);
    g.selectAll(".country-label").attr("font-size", \`\${9 / event.transform.k}px\`);
  });

svg.call(zoomBehaviour);

document.getElementById("zoom-in").onclick = () =>
  svg.transition().duration(300).call(zoomBehaviour.scaleBy, 1.4);
document.getElementById("zoom-out").onclick = () =>
  svg.transition().duration(300).call(zoomBehaviour.scaleBy, 0.7);
document.getElementById("reset-btn").onclick = resetView;

function resetView() {
  const [x, y] = projection([MAP_CENTER.lng, MAP_CENTER.lat]);
  const scale = 8;
  svg.transition().duration(600).call(
    zoomBehaviour.transform,
    d3.zoomIdentity.translate(width / 2 - scale * x, height / 2 - scale * y).scale(scale)
  );
}

function genreColor(v) {
  return GENRE_COLORS[v.genre] || v.color || "#c45e0a";
}

function genreLabel(slug) {
  return GENRE_LABELS[slug] || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ") : "");
}

async function loadVenues() {
  const paths = ["/api/music-venues", "../data/music-venues.json", "/data/music-venues.json", "data/music-venues.json"];
  for (const p of paths) {
    try {
      const r = await fetch(p);
      if (r.ok) {
        const data = await r.json();
        const items = data.items || data;
        if (Array.isArray(items) && items.length) {
          return items.map(normalizeVenue);
        }
      }
    } catch (_) { /* try next */ }
  }
  return MUSIC_VENUES_FALLBACK.map(normalizeVenue);
}

function normalizeVenue(v) {
  return {
    ...v,
    genre: v.genre || "other",
    color: v.color || GENRE_COLORS[v.genre] || GENRE_COLORS.other
  };
}

function initMap() {
  const geoUrl = "https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson";
  fetch(geoUrl)
    .then(r => r.json())
    .then(data => {
      g.selectAll(".country-path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class", "country-path")
        .attr("d", path);
      g.selectAll(".country-label")
        .data(data.features.filter(f => f.properties && f.properties.NAME))
        .enter()
        .append("text")
        .attr("class", "country-label")
        .attr("transform", d => {
          const c = path.centroid(d);
          return \`translate(\${c[0]},\${c[1]})\`;
        })
        .text(d => {
          const name = d.properties.NAME;
          if (name === "Netherlands") return "NL";
          return name && name.length <= 6 ? name : "";
        });
      afterDataReady();
    })
    .catch(() => afterDataReady());
}

function afterDataReady() {
  renderFilterButtons();
  renderDots();
  updateStats();
  renderSidebar();
  renderLegend();
  resetView();
}

function renderFilterButtons() {
  const genres = [...new Set(venues.map(v => v.genre))].sort();
  const row = document.getElementById("filter-row");
  row.innerHTML = '<button class="filter-btn active" data-genre="all">All</button>' +
    genres.map(g => \`<button class="filter-btn" data-genre="\${g}">\${genreLabel(g)}</button>\`).join("");
}

function getFiltered() {
  return venues.filter(v => {
    const matchGenre = currentFilter === "all" || v.genre === currentFilter;
    const q = searchTerm;
    const hay = [v.name, v.city, v.country, v.address, v.format, v.schedule, v.desc, v.genre]
      .filter(Boolean).join(" ").toLowerCase();
    return matchGenre && (!q || hay.includes(q));
  });
}

function renderDots() {
  g.selectAll(".company-marker").remove();
  getFiltered().forEach(venue => {
    const [x, y] = projection([venue.lng, venue.lat]);
    if (x == null || y == null) return;
    const color = genreColor(venue);
    const marker = g.append("g")
      .attr("class", "company-marker" + (venue.id === activeId ? " selected" : ""))
      .attr("data-id", venue.id)
      .attr("transform", \`translate(\${x},\${y})\`);
    marker.append("circle").attr("class", "marker-pulse").attr("r", 7)
      .attr("fill", "none").attr("stroke", color).attr("stroke-width", 1).attr("opacity", 0.35);
    marker.append("circle").attr("class", "marker-dot")
      .attr("r", venue.id === activeId ? 9 : 6)
      .attr("fill", color).attr("stroke", "white").attr("stroke-width", 1.5).attr("opacity", 0.95);
    marker.on("mouseover", e => showTooltip(e, venue.name))
      .on("mouseout", () => hideTooltip())
      .on("click", e => { e.stopPropagation(); selectVenue(venue.id); });
  });
}

const tooltip = document.getElementById("map-tooltip");
function showTooltip(event, text) {
  const rect = mapContainer.getBoundingClientRect();
  tooltip.style.left = (event.clientX - rect.left + 14) + "px";
  tooltip.style.top = (event.clientY - rect.top - 12) + "px";
  tooltip.textContent = text;
  tooltip.style.opacity = "1";
}
function hideTooltip() { tooltip.style.opacity = "0"; }

const popup = document.getElementById("popup");

function selectVenue(id) {
  activeId = id;
  const venue = venues.find(v => v.id === id);
  if (!venue) return;
  const [x, y] = projection([venue.lng, venue.lat]);
  const scale = 14;
  svg.transition().duration(700).call(
    zoomBehaviour.transform,
    d3.zoomIdentity.translate(width / 2 - scale * x, height / 2 - scale * y).scale(scale)
  );
  const t = d3.zoomTransform(svg.node());
  showPopup(venue, x * t.k + t.x, y * t.k + t.y);
  renderSidebar();
  renderDots();
}

function showPopup(venue, px, py) {
  document.getElementById("popup-name").textContent = venue.name;
  document.getElementById("popup-country").textContent = "📍 " + (venue.address || venue.city || "Amsterdam");
  document.getElementById("popup-desc").textContent = venue.desc || venue.format || "";

  const img = document.getElementById("popup-image");
  const ph = document.getElementById("popup-image-placeholder");
  if (venue.imageUrl) {
    img.src = venue.imageUrl;
    img.alt = venue.name;
    img.hidden = false;
    ph.hidden = true;
  } else {
    img.hidden = true;
    img.removeAttribute("src");
    ph.hidden = false;
  }

  const statsDiv = document.getElementById("popup-stats");
  statsDiv.innerHTML = "";
  const blocks = [
    [venue.schedule, "When"],
    [venue.format, "Style / format"]
  ];
  blocks.forEach(([val, label]) => {
    if (!val) return;
    statsDiv.innerHTML += \`
      <div class="popup-stat full-width">
        <div class="popup-stat-val">\${val}</div>
        <div class="popup-stat-lbl">\${label}</div>
      </div>\`;
  });

  document.getElementById("popup-genre").innerHTML =
    \`Music style: <span>\${genreLabel(venue.genre)}</span>\`;

  const link = document.getElementById("popup-link");
  if (venue.url) {
    link.href = venue.url;
    link.hidden = false;
  } else {
    link.hidden = true;
  }

  let left = mapContainer.getBoundingClientRect().left + px + 18;
  let top = mapContainer.getBoundingClientRect().top + py - 80;
  const popupW = 300;
  const popupMaxH = Math.min(window.innerHeight * 0.85, 560);
  if (left + popupW > window.innerWidth - 12) left = window.innerWidth - popupW - 12;
  if (left < 12) left = 12;
  if (top < 12) top = 12;
  if (top + popupMaxH > window.innerHeight - 12) top = window.innerHeight - popupMaxH - 12;

  popup.style.left = left + "px";
  popup.style.top = top + "px";
  popup.classList.add("visible");
  document.body.appendChild(popup);
  const scrollEl = popup.querySelector(".popup-scroll");
  if (scrollEl) scrollEl.scrollTop = 0;
}

document.getElementById("popup-close").onclick = () => {
  popup.classList.remove("visible");
  activeId = null;
  renderSidebar();
  renderDots();
};
svg.on("click", () => {
  popup.classList.remove("visible");
  activeId = null;
  renderSidebar();
  renderDots();
});

function renderSidebar() {
  const list = document.getElementById("company-list");
  const filtered = getFiltered();
  document.getElementById("list-count").textContent = filtered.length;
  list.innerHTML = filtered.map(v => {
    const color = genreColor(v);
    const isActive = v.id === activeId;
    return \`
      <div class="company-item \${isActive ? "active" : ""}" data-id="\${v.id}">
        <div class="company-dot-mini" style="background:\${color}"></div>
        <div>
          <div class="company-name">\${v.name}</div>
          <div class="company-country">\${v.schedule || genreLabel(v.genre)}</div>
        </div>
      </div>\`;
  }).join("");
  list.querySelectorAll(".company-item").forEach(el => {
    el.addEventListener("click", () => selectVenue(parseInt(el.dataset.id, 10)));
  });
}

document.getElementById("search-input").addEventListener("input", e => {
  searchTerm = e.target.value.toLowerCase();
  renderSidebar();
  renderDots();
});

document.getElementById("filter-row").addEventListener("click", e => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.genre;
  renderSidebar();
  renderDots();
});

function renderLegend() {
  const genres = [...new Set(venues.map(v => v.genre))];
  document.getElementById("legend").innerHTML =
    '<div class="legend-title">Music style</div>' +
    genres.map(g => \`
      <div class="legend-item">
        <div class="legend-dot" style="background:\${GENRE_COLORS[g] || "#aaa"}"></div>
        \${genreLabel(g)}
      </div>\`).join("");
}

function updateStats() {
  document.getElementById("stat-venues").textContent = venues.length;
  document.getElementById("stat-genres").textContent =
    new Set(venues.map(v => v.genre)).size;
}

document.getElementById("add-company-btn").onclick = () =>
  document.getElementById("modal-overlay").classList.add("open");
document.getElementById("modal-cancel").onclick = () =>
  document.getElementById("modal-overlay").classList.remove("open");
document.getElementById("modal-overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("modal-overlay"))
    document.getElementById("modal-overlay").classList.remove("open");
});

document.getElementById("modal-save").onclick = async () => {
  const name = document.getElementById("f-name").value.trim();
  const genre = document.getElementById("f-genre").value;
  const format = document.getElementById("f-format").value.trim();
  const schedule = document.getElementById("f-schedule").value.trim();
  const address = document.getElementById("f-address").value.trim();
  const url = document.getElementById("f-url").value.trim();
  const desc = document.getElementById("f-desc").value.trim();
  const imageUrl = document.getElementById("f-image").value.trim();
  if (!name) {
    alert("Please enter a venue name.");
    return;
  }

  const payload = {
    name,
    genre,
    format: format || genreLabel(genre),
    schedule,
    address: address || "Amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    desc: desc || format,
    imageUrl,
    url
  };

  let savedVenue = null;
  try {
    const r = await fetch("/api/music-venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (r.ok) {
      const data = await r.json();
      savedVenue = normalizeVenue(data.item);
      const existingIdx = venues.findIndex(v => v.id === savedVenue.id);
      if (existingIdx >= 0) {
        venues[existingIdx] = savedVenue;
      } else if (!data.existing) {
        venues.push(savedVenue);
      } else {
        const byName = venues.findIndex(v => v.name.toLowerCase() === savedVenue.name.toLowerCase());
        if (byName >= 0) venues[byName] = savedVenue;
        else venues.push(savedVenue);
      }
    }
  } catch (_) { /* fall back to local-only below */ }

  if (!savedVenue) {
    const jitter = (venues.length % 7) * 0.008 - 0.024;
    savedVenue = normalizeVenue({
      id: Date.now(),
      ...payload,
      lng: MAP_CENTER.lng + jitter,
      lat: MAP_CENTER.lat + (venues.length % 5) * 0.006 - 0.012,
      color: GENRE_COLORS[genre]
    });
    venues.push(savedVenue);
  }

  document.getElementById("modal-overlay").classList.remove("open");
  ["f-name","f-format","f-schedule","f-address","f-url","f-desc","f-image"].forEach(id => {
    document.getElementById(id).value = "";
  });
  renderFilterButtons();
  renderDots();
  renderSidebar();
  updateStats();
  renderLegend();
  selectVenue(savedVenue.id);
};

window.addEventListener("resize", () => {
  width = mapContainer.clientWidth;
  height = mapContainer.clientHeight;
  projection.translate([width * 0.5, height * 0.52])
    .scale(Math.min(width, height) * 18);
  g.selectAll(".country-path").attr("d", path);
  g.selectAll(".company-marker").remove();
  renderDots();
});

loadVenues().then(items => {
  venues = items;
  initMap();
});
</script>`;

h = h.slice(0, scriptStart) + newScript + h.slice(scriptEnd + '</script>'.length);

fs.writeFileSync(dst, h, 'utf8');
console.log('Wrote', dst, '(' + h.length + ' bytes)');
