/**
 * Citation registry: Importance of energy Monitoring + Reference Energy monitoring pages.
 */
(function (global) {
    const TYPE_LABELS = {
        'third-party': 'Published / official programme',
        'gw-estimate': 'Greenways illustrative',
        'etl-official': 'UK Energy Technology List (ETL)',
        'gw-tool': 'Greenways demo / synthesis',
    };

    const GWM_CITATIONS = {
        'ref-em-01': {
            num: 1,
            type: 'third-party',
            short: 'EU Energy Efficiency Directive — metering & savings',
            label: 'EU EED 2023/1791',
        },
        'ref-em-02': {
            num: 2,
            type: 'etl-official',
            short: 'ETL monitoring equipment — costs, payback, ROI examples',
            label: 'UK ETL — monitoring & targeting',
        },
        'ref-em-03': {
            num: 3,
            type: 'third-party',
            short: 'ISO 50001 — energy management / aM&T basis',
            label: 'ISO 50001:2018',
        },
        'ref-em-04': {
            num: 4,
            type: 'third-party',
            short: 'ATELIER — Amsterdam & Bilbao positive energy districts',
            label: 'ATELIER case study',
        },
        'ref-em-05': {
            num: 5,
            type: 'third-party',
            short: 'E.ON Glasgow — 33% heating reduction in two months',
            label: 'Glasgow TRV trial',
        },
        'ref-em-06': {
            num: 6,
            type: 'third-party',
            short: 'European hotel — 65% savings, ~£377k/yr',
            label: 'Hotel CHP & monitoring case',
        },
        'ref-em-07': {
            num: 7,
            type: 'third-party',
            short: 'WE Data Europe — 20–40% heating savings',
            label: 'Digital heating optimisation',
        },
        'ref-em-08': {
            num: 8,
            type: 'third-party',
            short: 'Paris Smart EPC — connected lighting',
            label: 'Paris smart lighting',
        },
        'ref-em-09': {
            num: 9,
            type: 'third-party',
            short: 'SW England portfolio — 50% carbon, £50k/yr',
            label: 'Commercial sub-metering case',
        },
        'ref-em-10': {
            num: 10,
            type: 'third-party',
            short: 'BPIE — tenant/submetering 10–15% savings',
            label: 'Homes & tenant metering (10–15%)',
        },
        'ref-em-11': {
            num: 11,
            type: 'third-party',
            short: 'Carbon Trust GPG 125 — aM&T 4–20%, avg 10–15%',
            label: 'Office aM&T savings range',
        },
        'ref-em-12': {
            num: 12,
            type: 'third-party',
            short: 'Applied Energy review — 20–40% heating via digital optimisation',
            label: 'Digital optimisation (20–40%)',
        },
        'ref-em-13': {
            num: 13,
            type: 'third-party',
            short: 'Restaurant energy monitoring — load categories',
            label: 'Restaurant monitoring',
        },
        'ref-em-14': {
            num: 14,
            type: 'third-party',
            short: 'IEA Energy Efficiency 2023 — headline savings range',
            label: '10–40% savings headline',
        },
        'ref-em-15': {
            num: 15,
            type: 'third-party',
            short: 'EN 15232-1 — BMS / automation impact',
            label: 'Building automation standard',
        },
        'ref-em-16': {
            num: 16,
            type: 'third-party',
            short: 'CIBSE TM39 — metering hierarchy',
            label: 'Metering methods',
        },
        'ref-em-17': {
            num: 17,
            type: 'third-party',
            short: 'UK MEES — commercial property compliance',
            label: 'UK MEES',
        },
        'ref-em-18': {
            num: 18,
            type: 'etl-official',
            short: 'Electrex product specs (ETL-listed examples)',
            label: 'ETL product examples',
        },
        'ref-em-19': {
            num: 19,
            type: 'gw-tool',
            short: 'Charts are illustrative demos — not measured site data',
            label: 'Demo charts',
        },
        'ref-em-etl-disclaimer': {
            num: 2,
            type: 'etl-official',
            short: 'ETL = listed product criteria & published example economics only',
            label: 'ETL vs other figures',
        },
    };

    function referencesPageUrl() {
        const fromBody = document.body && document.body.dataset.gwmCiteRefs;
        if (fromBody) return fromBody;
        return 'Refrenece%20Energy%20monitoring%20.Html';
    }

    function refHref(citeId) {
        return referencesPageUrl() + '#' + citeId;
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
            'background:#1a1d29;color:#f0f4f8;font-size:0.78em;font-weight:400;padding:10px 12px;border-radius:8px;' +
            'border:1px solid rgba(0,168,204,0.45);box-shadow:0 12px 32px rgba(0,0,0,0.45);line-height:1.45;pointer-events:none;font-family:inherit;}' +
            '#gwm-cite-tooltip-portal.is-visible{display:block;}';
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
        el.addEventListener('click', (ev) => {
            if (ev.target.closest('.cite-link')) return;
            if (citePortalAnchor === el && citePortalEl && citePortalEl.classList.contains('is-visible')) {
                hideCitePortal();
            } else {
                showCitePortal(el, meta);
            }
        });
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
        card.classList.remove('hidden');
        card.classList.add('cite-highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (global.history && global.history.replaceState) {
            global.history.replaceState(null, '', '#' + citeId);
        }
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab && activeTab.getAttribute('data-filter') !== 'all') {
            document.querySelectorAll('.tab-btn').forEach((t) => t.classList.remove('active'));
            const allTab = document.querySelector('.tab-btn[data-filter="all"]');
            if (allTab) allTab.classList.add('active');
            document.querySelectorAll('.ref-card').forEach((c) => c.classList.remove('hidden'));
        }
    }

    function initReferencesPage() {
        Object.keys(GWM_CITATIONS).forEach((id) => {
            const meta = GWM_CITATIONS[id];
            const card = document.getElementById(id);
            if (!card) return;
            const badge = document.createElement('span');
            badge.className = `cite-ref-badge cite-type-${meta.type}`;
            badge.textContent = `[${meta.num}] ${TYPE_LABELS[meta.type] || meta.type}`;
            const heading = card.querySelector('h4');
            if (heading && !card.querySelector('.cite-ref-badge')) {
                heading.insertAdjacentElement('beforebegin', badge);
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

    function initMonitoringPage() {
        attachCitationMarkers();
        const banner = document.getElementById('sources-banner');
        if (banner) {
            banner.innerHTML =
                'Figures marked with <sup class="cite-demo">n</sup> link to <strong>Sources</strong> below. ' +
                'Hover or <strong>tap</strong> highlighted figures for a short explanation; click the number to jump to the full source. ' +
                '<span class="cite-type cite-type-etl-official">ETL</span> = UK Energy Technology List; ' +
                '<span class="cite-type cite-type-third-party">Published</span> = research/programmes; ' +
                '<span class="cite-type cite-type-gw-tool">Demo</span> = illustrative charts only.';
        }
    }

    global.GWM_ENERGY_MONITORING_CITATIONS = GWM_CITATIONS;

    document.addEventListener('DOMContentLoaded', () => {
        const mode = document.body.dataset.gwmCiteMode;
        if (mode === 'energy-monitoring-references') {
            initReferencesPage();
        } else if (mode === 'energy-monitoring') {
            initMonitoringPage();
        }
    });
})(typeof window !== 'undefined' ? window : global);
