from pathlib import Path

p = Path(__file__).resolve().parents[1] / "HTMLS GWM GWB" / "savings.html"
text = p.read_text(encoding="utf-8")

BASELINE_OPEN = "./Greenways%20Interface%20.html?tab=equipment#equipment-baseline"
EVENTS_PAGE = "./Events%20Ticker%20W2W%20.html?return=savings.html"
DEALS_PAGE = "./Deals.html"
d = "d" + "iv"

replacements = [
    (
        '<a class="btn" href="./Greenways%20Interface%20.html?tab=equipment" target="_blank" rel="noopener">Open dashboard — Equipment tab</a>',
        f'<a class="btn" href="{BASELINE_OPEN}" target="_blank" rel="noopener">Open baseline on dashboard</a>',
    ),
    (
        'data-open-label="Preview dashboard in tablet">Preview dashboard in tablet</button>',
        'data-open-label="Preview baseline section in tablet">Preview baseline section in tablet</button>',
    ),
    (
        '<iframe title="Dashboard equipment preview" loading="lazy" src="./Greenways%20Interface%20.html"></iframe>',
        f'<iframe title="Equipment baseline on dashboard" loading="lazy" src="{BASELINE_OPEN}"></iframe>',
    ),
    (
        "Switch to the Equipment tab inside the embedded view if it opens on Overview.",
        "Opens the Equipment tab scrolled to the baseline explainer (why we baseline each asset class).",
    ),
    (
        '<a class="btn btn--gold" href="./deals-ticker-hub.html" target="_blank" rel="noopener">Open deals hub</a>',
        f'<a class="btn btn--gold" href="{DEALS_PAGE}" target="_blank" rel="noopener">Open deals page</a>',
    ),
    (
        '<a class="btn btn--blue" href="./Deals.html" target="_blank" rel="noopener">Open full deals page</a>',
        '<a class="btn btn--blue" href="./deals-ticker-hub.html" target="_blank" rel="noopener">Open deals hub only</a>',
    ),
    (
        '<iframe title="Deals hub preview" loading="lazy" src="./deals-ticker-hub.html"></iframe>',
        f'<iframe title="Deals page preview" loading="lazy" src="{DEALS_PAGE}"></iframe>',
    ),
    (
        "Interactive hub — open full tab for longest browse sessions.",
        "Full deals page — tickers, search, and spotlight cards.",
    ),
]

for old, new in replacements:
    if old not in text:
        raise SystemExit(f"missing: {old[:70]}...")
    text = text.replace(old, new, 1)

if 'id="iframe-events"' not in text:
    needle = (
        '                  <span class="gear" aria-hidden="true">⚙</span> Wiring note: connect your events provider or chamber-of-commerce feed to replace the demo marquee.\n'
        "                </p>\n"
        "              </" + d + ">\n"
        "            </" + d + ">\n"
        "          </" + d + ">\n"
        "        </section>\n"
        "\n"
        "        <!-- Assistance -->"
    )
    insert = (
        '                  <span class="gear" aria-hidden="true">⚙</span> Wiring note: connect your events provider or chamber-of-commerce feed to replace the demo marquee.\n'
        "                </p>\n"
        '                <' + d + ' class="actions">\n'
        f'                  <a class="btn btn--gold" href="{EVENTS_PAGE}" target="_blank" rel="noopener">Open events ticker</a>\n'
        '                  <button type="button" class="btn btn--gold" data-toggle-iframe="events" data-open-label="Preview events ticker in tablet">Preview events ticker in tablet</button>\n'
        "                </" + d + ">\n"
        "              </" + d + ">\n"
        '              <' + d + ' class="iframe-wrap" id="iframe-events" hidden>\n'
        f'                <iframe title="Events ticker preview" loading="lazy" src="{EVENTS_PAGE}"></iframe>\n'
        "                <" + d + ' class="iframe-hint">Amsterdam-area events and catering — same surface as Wok Assist.</' + d + ">\n"
        "              </" + d + ">\n"
        "            </" + d + ">\n"
        "          </" + d + ">\n"
        "        </section>\n"
        "\n"
        "        <!-- Assistance -->"
    )
    if needle not in text:
        raise SystemExit("events needle not found")
    text = text.replace(needle, insert, 1)

toggle_old = "        base: document.getElementById('iframe-base'),\n        deals: document.getElementById('iframe-deals'),"
toggle_new = (
    "        base: document.getElementById('iframe-base'),\n"
    "        events: document.getElementById('iframe-events'),\n"
    "        deals: document.getElementById('iframe-deals'),"
)
if "events: document.getElementById('iframe-events')" not in text:
    if toggle_old not in text:
        raise SystemExit("toggle map not found")
    text = text.replace(toggle_old, toggle_new, 1)

p.write_text(text, encoding="utf-8")
print("patched savings.html")
