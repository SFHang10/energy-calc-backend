# Wix: citation links between two stacked iframes

## Why the code showed as text on the page

The `window.addEventListener('message', …)` snippet is **JavaScript for the Wix page that hosts both iframes** (the parent). It is **not** HTML content for inside an iframe.

If you paste it into:

- an **HTML iframe / embed box** body, or  
- a **text** area on the green “References” section,

Wix renders it as **visible text** (what you saw in the editor). It will not run there.

Each iframe should only load a **URL** to your hosted file, for example:

- `https://energy-calc-backend.onrender.com/HTMLS%20GWM%20GWB/Sustainable%20Renovations%20New%20.html`
- `https://energy-calc-backend.onrender.com/HTMLS%20GWM%20GWB/Sustainable%20References%20.HTML`

---

## What still works without the parent listener

On the **top** iframe (Renovations / Energy Monitoring):

- Hover **[n]** → tooltip (fixed on top of the page).
- Click **[n]** → link target is the References page + `#ref-em-XX` or `#ref-property-value` etc.

On the **bottom** iframe (References):

- Opening with a hash (e.g. `…References%20.HTML#ref-em-06`) highlights the right card.
- If the user scrolls to the bottom iframe manually, citations still make sense.

Without parent code, click does **not** auto-scroll the Wix page to the lower iframe; the user scrolls to Sources themselves.

---

## Where to put the listener (correct)

### Option A — Wix **Custom Code** (recommended, no Velo)

1. In the Wix dashboard: **Settings** → **Custom Code** (or **Marketing & SEO** → **Custom Code**, depending on your plan).
2. **+ Add Custom Code**.
3. Name: `GWM citation jump`.
4. **Add to:** choose the **specific page** that has both iframes stacked (not “all pages” unless you want that).
5. **Place in:** **Body - end** (or **Body - start**).
6. Paste **only** this (adjust the iframe `src` substring if your embed URL differs):

```html
<script>
(function () {
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'gwm-cite-jump' || !e.data.citeId) return;
    var sel =
      'iframe[src*="Sustainable%20References"],' +
      'iframe[src*="Sustainable References"],' +
      'iframe[src*="Refrenece%20Energy%20monitoring"],' +
      'iframe[src*="Refrenece Energy monitoring"]';
    var refFrame = document.querySelector(sel);
    if (!refFrame) return;
    refFrame.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try {
      refFrame.contentWindow.postMessage(e.data, '*');
    } catch (err) {}
  });
})();
</script>
```

7. **Apply** / save and **Publish** the site.

Do **not** put this inside either iframe element in the editor.

---

### Option B — **Velo** (if your site uses Velo)

On the page with both iframes, in the page code file:

```javascript
import wixWindow from 'wix-window';

$w.onReady(function () {
  wixWindow.onMessage((event) => {
    const data = event.data;
    if (!data || data.type !== 'gwm-cite-jump') return;
    // Scroll to your bottom HTML/iframe element by ID, e.g. $w('#htmlReferences').scrollTo();
    // Then forward to embedded content if your setup supports it.
  });
});
```

Exact element IDs depend on how you added the second embed; use the Velo `$w('#yourElementId')` for the **bottom** embed, not the iframe’s inner HTML.

---

## Wix editor checklist

| Element | What to set |
|--------|-------------|
| Top iframe (`html3` etc.) | **URL only** → main page HTML on Render |
| Bottom iframe | **URL only** → References HTML on Render |
| Custom Code on that Wix page | Parent `message` listener (Option A) |
| Green “References” section | Title/copy only — **no** raw `<script>` paste |

---

## Energy Monitoring pair

Same pattern:

- Top: `HTMLs/Importance of energy Monitoring.html` (Render path as deployed)
- Bottom: `HTMLS GWM GWB/Refrenece Energy monitoring .Html`
- Custom Code `iframe[src*="Refrenece%20Energy%20monitoring"]` (included in snippet above)

---

## Quick test after publish

1. Open the live page (not only the editor preview if Custom Code is flaky there).
2. Hover a **[n]** on the top embed → tooltip appears.
3. Click **[n]** → page should scroll to the bottom embed and highlight the source card.

If step 3 fails but 1–2 work, Custom Code is missing, on the wrong page, or the bottom iframe `src` does not match the `querySelector` strings — adjust the substring to match your real embed URL.
