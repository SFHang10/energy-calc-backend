from pathlib import Path

p = Path(__file__).resolve().parents[1] / "HTMLS GWM GWB" / "Greenways Interface .html"
text = p.read_text(encoding="utf-8")

old = """  grid.innerHTML = '';
  tiles.forEach((tile) => {
    const { pct, cost } = tileMetrics(tile);
    const href = equipSummaryDeepDiveHref(tile);
    const isSel = tile.id === selectedEquipSummaryId;
    const link = document.createElement('a');
    link.className = 'equip-summary-link' + (isSel ? ' is-selected' : '');
    link.href = href;
    link.title = 'Open deep dive for ' + tile.name;
    link.innerHTML =
      '<article class="equip-summary-card" style="--accent:' + tile.accent + ';--glow:' + tile.glow + '">' +
      '<motion class="equip-summary-photo-wrap">' +
      '<img class="equip-summary-photo" src="' + tile.image + '" alt="' + tile.name + '" loading="lazy" decoding="async" />' +
      '</motion>' +
      '<motion class="equip-summary-body">' +
      equipSummaryRingHtml(pct, tile.accent, tile.glow) +
      '<motion class="equip-summary-name">' + tile.icon + ' ' + tile.name + '</motion>' +
      '<motion class="equip-summary-stat"><span>Of whole site</span><strong>~' + Math.round(pct) + '%</strong></motion>' +
      '<motion class="equip-summary-stat"><span>Est. cost</span><strong>~€' + Math.round(cost) + '/mo</strong></motion>' +
      '<motion class="equip-summary-hint">Open equipment deep dive →</motion>' +
      '</motion></article>';

    grid.appendChild(link);
  });
}"""

old = old.replace("<motion", "<div").replace("</motion>", "</motion>")
old = old.replace("</motion>", "</div>")
d = "d" + "iv"
old = f"""  grid.innerHTML = '';
  tiles.forEach((tile) => {{
    const {{ pct, cost }} = tileMetrics(tile);
    const href = equipSummaryDeepDiveHref(tile);
    const isSel = tile.id === selectedEquipSummaryId;
    const link = document.createElement('a');
    link.className = 'equip-summary-link' + (isSel ? ' is-selected' : '');
    link.href = href;
    link.title = 'Open deep dive for ' + tile.name;
    link.innerHTML =
      '<article class="equip-summary-card" style="--accent:' + tile.accent + ';--glow:' + tile.glow + '">' +
      '<{d} class="equip-summary-photo-wrap">' +
      '<img class="equip-summary-photo" src="' + tile.image + '" alt="' + tile.name + '" loading="lazy" decoding="async" />' +
      '</{d}>' +
      '<{d} class="equip-summary-body">' +
      equipSummaryRingHtml(pct, tile.accent, tile.glow) +
      '<{d} class="equip-summary-name">' + tile.icon + ' ' + tile.name + '</{d}>' +
      '<{d} class="equip-summary-stat"><span>Of whole site</span><strong>~' + Math.round(pct) + '%</strong></{d}>' +
      '<{d} class="equip-summary-stat"><span>Est. cost</span><strong>~€' + Math.round(cost) + '/mo</strong></{d}>' +
      '<{d} class="equip-summary-hint">Open equipment deep dive →</{d}>' +
      '</{d}></article>';

    grid.appendChild(link);
  }});
}}"""

new = f"""  grid.innerHTML = '';
  tiles.forEach((tile) => {{
    const {{ pct, cost }} = tileMetrics(tile);
    const href = equipSummaryDeepDiveHref(tile);
    const isSel = tile.id === selectedEquipSummaryId;
    const tileEl = document.createElement('{d}');
    tileEl.className = 'equip-summary-tile' + (isSel ? ' is-selected' : '');
    tileEl.setAttribute('role', 'button');
    tileEl.tabIndex = 0;
    tileEl.setAttribute('aria-pressed', isSel ? 'true' : 'false');
    tileEl.title = 'Select ' + tile.name + ' — show appliances in the selector below';
    const onSelect = () => selectEquipSummaryTile(tile, filter);
    tileEl.addEventListener('click', (ev) => {{
      if (ev.target.closest('.equip-summary-deep-link')) return;
      onSelect();
    }});
    tileEl.addEventListener('keydown', (ev) => {{
      if (ev.target.closest('.equip-summary-deep-link')) return;
      if (ev.key === 'Enter' || ev.key === ' ') {{
        ev.preventDefault();
        onSelect();
      }}
    }});
    tileEl.innerHTML =
      '<article class="equip-summary-card" style="--accent:' + tile.accent + ';--glow:' + tile.glow + '">' +
      '<{d} class="equip-summary-photo-wrap">' +
      '<img class="equip-summary-photo" src="' + tile.image + '" alt="' + tile.name + '" loading="lazy" decoding="async" />' +
      '</{d}>' +
      '<{d} class="equip-summary-body">' +
      equipSummaryRingHtml(pct, tile.accent, tile.glow) +
      '<{d} class="equip-summary-name">' + tile.icon + ' ' + tile.name + '</{d}>' +
      '<{d} class="equip-summary-stat"><span>Of whole site</span><strong>~' + Math.round(pct) + '%</strong></{d}>' +
      '<{d} class="equip-summary-stat"><span>Est. cost</span><strong>~€' + Math.round(cost) + '/mo</strong></{d}>' +
      '<a class="equip-summary-deep-link" href="' + href + '" title="Open deep dive for ' + tile.name + '">Open equipment deep dive →</a>' +
      '</{d}></article>';

    grid.appendChild(tileEl);
  }});
}}"""

if "equip-summary-tile" in text and "equip-summary-deep-link" in text and "tileEl = document.createElement" in text:
    print("already patched")
elif old not in text:
    raise SystemExit("old block not found")
else:
    p.write_text(text.replace(old, new, 1), encoding="utf-8")
    print("patched renderEquipSummaryGrid")
