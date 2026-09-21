/**
 * Citation registry for Sustainable Renovations + References pages.
 * type: third-party | gw-estimate | etl-official | gw-tool
 */
(function (global) {
    const REFERENCES_PAGE = 'Sustainable%20References%20.HTML';

    const GWM_CITATIONS = {
        'ref-property-value': {
            num: 1,
            type: 'third-party',
            short: 'Property value uplift 8–15% — EPBD / JLL',
            label: 'Property value uplift (8–15%)',
        },
        'ref-grants-range': {
            num: 2,
            type: 'third-party',
            short: 'EU/national grant ranges — official programmes',
            label: 'Grant ranges (€5,000–€30,000)',
        },
        'ref-operating-savings': {
            num: 3,
            type: 'third-party',
            short: 'Energy bill savings 30–50% — EEA',
            label: 'Operating cost savings (30–50%)',
        },
        'ref-water-fixtures': {
            num: 4,
            type: 'third-party',
            short: 'Low-flow savings 40–60% — AWE / EWS',
            label: 'Water fixture savings (40–60%)',
        },
        'ref-water-cost': {
            num: 5,
            type: 'gw-estimate',
            short: 'Illustrative household water bill savings',
            label: 'Water bill savings (€300–€600/yr)',
        },
        'ref-rainwater-payback': {
            num: 6,
            type: 'third-party',
            short: 'Rainwater payback 4–7 years — ARCADIS / Waterwise',
            label: 'Rainwater harvesting payback (4–7 years)',
        },
        'ref-payback-insulation': {
            num: 7,
            type: 'third-party',
            short: 'Insulation payback — Energy Saving Trust',
            label: 'Insulation payback (3–5 years)',
        },
        'ref-payback-windows': {
            num: 8,
            type: 'third-party',
            short: 'Window payback 7–10 years — Passivhaus Institut',
            label: 'Window payback (7–10 years)',
        },
        'ref-payback-solar': {
            num: 9,
            type: 'third-party',
            short: 'Solar payback — IEA / SolarPower Europe',
            label: 'Solar payback (8–12 years)',
        },
        'ref-payback-hvac': {
            num: 10,
            type: 'third-party',
            short: 'Heat pump payback — EHPA (not a product-list figure)',
            label: 'Heat pump payback (5–8 years)',
        },
        'ref-hvac-costs': {
            num: 11,
            type: 'gw-estimate',
            short: 'Illustrative install costs — market surveys',
            label: 'Heat pump install costs (€ ranges)',
        },
        'ref-etl-listing-criteria': {
            num: 12,
            type: 'gw-tool',
            short: 'Energy-efficient alternatives — verified efficiency criteria',
            label: 'Energy-efficient alternatives',
        },
        'ref-etl-product-examples': {
            num: 13,
            type: 'gw-tool',
            short: 'Example energy-efficient products from Greenways marketplace',
            label: 'Energy-efficient product examples',
        },
        'ref-etl-hrv-tech': {
            num: 14,
            type: 'gw-tool',
            short: 'Heat recovery ventilation as an energy-efficient option',
            label: 'Heat recovery ventilation',
        },
        'ref-storm-insurance': {
            num: 15,
            type: 'third-party',
            short: 'Storm shutters & insurance — IBHS',
            label: 'Storm shutters / insurance (20–40%)',
        },
        'ref-cool-roof': {
            num: 16,
            type: 'third-party',
            short: 'Cool roofs — LBNL Heat Island Group',
            label: 'Cool roof heat reduction (50–60%)',
        },
        'ref-passive-cooling': {
            num: 17,
            type: 'third-party',
            short: 'Passive cooling — IEA Cooling Report',
            label: 'Passive cooling (30–40%)',
        },
        'ref-native-plants-water': {
            num: 18,
            type: 'third-party',
            short: 'Drought-tolerant planting — RHS',
            label: 'Native planting water use (70%)',
        },
        'ref-renovation-wave': {
            num: 19,
            type: 'third-party',
            short: 'EU Renovation Wave — European Commission',
            label: 'EU Renovation Wave (€72bn)',
        },
    };

    const TYPE_LABELS = {
        'third-party': 'Published / official programme',
        'gw-estimate': 'Greenways illustrative estimate',
        'etl-official': 'Energy-efficient alternative',
        'gw-tool': 'Energy-efficient alternative',
    };

    function refHref(citeId) {
        return REFERENCES_PAGE + '#' + citeId;
    }

    function notifyParentScroll(citeId) {
        try {
            global.parent.postMessage(
                { type: 'gwm-cite-jump', citeId, href: refHref(citeId) },
                '*'
            );
        } catch (err) {
            /* cross-origin parent */
        }
    }

    let citePortalEl = null;
    let citePortalAnchor = null;
    let citePortalScrollBound = false;

    function ensureCitePortalStyles() {
        if (document.getElementById('gwm-cite-portal-styles')) return;
        const style = document.createElement('style');
        style.id = 'gwm-cite-portal-styles';
        style.textContent =
            '#gwm-cite-tooltip-portal{position:fixed;z-index:2147483000;display:none;min-width:220px;max-width:min(300px,calc(100vw - 24px));' +
            'background:#2c3e50;color:#ecf0f1;font-size:0.78em;font-weight:400;padding:10px 12px;border-radius:8px;' +
            'box-shadow:0 12px 32px rgba(0,0,0,0.35);line-height:1.45;pointer-events:none;font-family:inherit;}' +
            '#gwm-cite-tooltip-portal.is-visible{display:block;}' +
            '#gwm-cite-tooltip-portal.cite-tooltip--below::before,#gwm-cite-tooltip-portal:not(.cite-tooltip--below)::after{content:"";' +
            'position:absolute;left:16px;border:6px solid transparent;}' +
            '#gwm-cite-tooltip-portal:not(.cite-tooltip--below)::after{bottom:-12px;border-top-color:#2c3e50;}' +
            '#gwm-cite-tooltip-portal.cite-tooltip--below::before{top:-12px;border-bottom-color:#2c3e50;}';
        document.head.appendChild(style);
    }

    function getCitePortal() {
        ensureCitePortalStyles();
        if (!citePortalEl) {
            citePortalEl = document.createElement('div');
            citePortalEl.id = 'gwm-cite-tooltip-portal';
            citePortalEl.setAttribute('role', 'tooltip');
            document.body.appendChild(citePortalEl);
        }
        return citePortalEl;
    }

    function buildTooltipHtml(meta) {
        return (
            `<strong>Source [${meta.num}]</strong> ` +
            `<span class="cite-type cite-type-${meta.type}">${TYPE_LABELS[meta.type] || meta.type}</span><br>` +
            `${meta.short}<br>` +
            `<span class="cite-jump-hint">Click [${meta.num}] to highlight in Sources ↓</span>`
        );
    }

    function positionCitePortal(anchor) {
        const portal = getCitePortal();
        portal.classList.add('is-visible');
        portal.style.visibility = 'hidden';
        portal.style.display = 'block';
        portal.style.top = '0';
        portal.style.left = '0';

        const anchorRect = anchor.getBoundingClientRect();
        const portalRect = portal.getBoundingClientRect();
        const gap = 10;
        const pad = 12;
        let top = anchorRect.top - portalRect.height - gap;
        let placeBelow = false;

        if (top < pad) {
            top = anchorRect.bottom + gap;
            placeBelow = true;
        }

        let left = anchorRect.left + anchorRect.width / 2 - portalRect.width / 2;
        left = Math.max(pad, Math.min(left, global.innerWidth - portalRect.width - pad));

        portal.classList.toggle('cite-tooltip--below', placeBelow);
        portal.style.top = `${Math.round(top)}px`;
        portal.style.left = `${Math.round(left)}px`;
        portal.style.visibility = 'visible';
    }

    function hideCitePortal() {
        citePortalAnchor = null;
        if (!citePortalEl) return;
        citePortalEl.classList.remove('is-visible', 'cite-tooltip--below');
        citePortalEl.style.display = '';
        citePortalEl.style.visibility = '';
    }

    function showCitePortal(anchor, meta) {
        citePortalAnchor = anchor;
        const portal = getCitePortal();
        portal.innerHTML = buildTooltipHtml(meta);
        positionCitePortal(anchor);
    }

    function bindCitePortalEvents() {
        if (citePortalScrollBound) return;
        citePortalScrollBound = true;
        global.addEventListener(
            'scroll',
            () => {
                if (citePortalAnchor && citePortalEl && citePortalEl.classList.contains('is-visible')) {
                    positionCitePortal(citePortalAnchor);
                }
            },
            true
        );
        global.addEventListener('resize', () => {
            if (citePortalAnchor && citePortalEl && citePortalEl.classList.contains('is-visible')) {
                positionCitePortal(citePortalAnchor);
            }
        });
    }

    function wireCiteTooltip(el, meta) {
        const show = () => showCitePortal(el, meta);
        const hide = (ev) => {
            if (ev && ev.relatedTarget && el.contains(ev.relatedTarget)) return;
            hideCitePortal();
        };
        el.addEventListener('mouseenter', show);
        el.addEventListener('mouseleave', hide);
        el.addEventListener('focusin', show);
        el.addEventListener('focusout', hide);
    }

    function attachCitationMarkers(root) {
        bindCitePortalEvents();
        const scope = root || document;
        scope.querySelectorAll('[data-cite]').forEach((el) => {
            if (el.dataset.citeBound === '1') return;
            const id = el.getAttribute('data-cite');
            const meta = GWM_CITATIONS[id];
            if (!meta) return;

            const link = document.createElement('a');
            link.className = 'cite-link';
            link.href = refHref(id);
            link.setAttribute('data-cite-type', meta.type);
            link.setAttribute('aria-label', `Source ${meta.num}: ${meta.short}. View in References.`);
            link.title = meta.short;
            link.textContent = String(meta.num);
            link.addEventListener('click', (ev) => {
                ev.stopPropagation();
                notifyParentScroll(id);
            });

            el.classList.add('has-cite');
            el.appendChild(link);
            wireCiteTooltip(el, meta);
            el.dataset.citeBound = '1';
        });
    }

    function highlightReference(citeId) {
        const card = document.getElementById(citeId);
        if (!card) return;
        document.querySelectorAll('.ref-card.cite-highlight').forEach((c) => {
            c.classList.remove('cite-highlight');
        });
        card.classList.add('cite-highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (global.history && global.history.replaceState) {
            global.history.replaceState(null, '', '#' + citeId);
        }
    }

    function initReferencesPage() {
        Object.keys(GWM_CITATIONS).forEach((id) => {
            const meta = GWM_CITATIONS[id];
            let card = document.getElementById(id);
            if (!card) {
                card = document.querySelector(`[data-ref-id="${id}"]`);
            }
            if (!card) return;
            card.id = id;
            const badge = document.createElement('span');
            badge.className = `cite-ref-badge cite-type-${meta.type}`;
            badge.textContent = `[${meta.num}] ${TYPE_LABELS[meta.type] || meta.type}`;
            const label = card.querySelector('.ref-card-label');
            if (label && !label.querySelector('.cite-ref-badge')) {
                label.insertAdjacentElement('afterbegin', badge);
            }
        });

        global.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'gwm-cite-jump' && event.data.citeId) {
                highlightReference(event.data.citeId);
            }
        });

        if (global.location.hash) {
            const id = global.location.hash.replace(/^#/, '');
            if (GWM_CITATIONS[id]) {
                global.setTimeout(() => highlightReference(id), 300);
            }
        }
    }

    function initRenovationsPage() {
        attachCitationMarkers();
        const banner = document.getElementById('sources-banner');
        if (banner) {
            banner.innerHTML =
                'Figures marked with <sup class="cite-demo">n</sup> link to the <strong>Sources</strong> section below. ' +
                '<span class="cite-type cite-type-gw-tool">Energy-efficient</span> = energy-efficient alternatives; ' +
                '<span class="cite-type cite-type-third-party">Published</span> = research/programmes; ' +
                '<span class="cite-type cite-type-gw-estimate">Estimate</span> = Greenways illustrative ranges.';
        }
    }

    global.GWM_CITATIONS = GWM_CITATIONS;
    global.GWM_CITATION_HELPERS = {
        attachCitationMarkers,
        highlightReference,
        initReferencesPage,
        initRenovationsPage,
        refHref,
    };

    document.addEventListener('DOMContentLoaded', () => {
        if (document.body.dataset.gwmCiteMode === 'references') {
            initReferencesPage();
        } else if (document.body.dataset.gwmCiteMode === 'renovations') {
            initRenovationsPage();
        }
    });
})(typeof window !== 'undefined' ? window : global);
