/**
 * Inline citations for energy-cost-guide (standalone page → #references anchors).
 */
(function (global) {
    const TYPE_LABELS = {
        'third-party': 'Published / official',
        'etl-official': 'Energy-efficient alternative',
        'gw-estimate': 'Illustrative estimate',
        'gw-tool': 'Greenways catalogue',
    };

    const GWM_CITATIONS = {
        'ref-ecg-01': { num: 1, type: 'third-party', short: 'Ofgem — UK energy price cap & unit rates', label: 'Ofgem price cap' },
        'ref-ecg-02': { num: 2, type: 'etl-official', short: '~8,000 energy-efficient alternatives listed', label: 'Energy-efficient alternatives' },
        'ref-ecg-03': { num: 3, type: 'third-party', short: 'DESNZ — UK Energy in Brief', label: 'UK energy statistics' },
        'ref-ecg-04': { num: 4, type: 'third-party', short: 'Ofgem Smart Export Guarantee (SEG)', label: 'Solar export (SEG)' },
        'ref-ecg-05': { num: 5, type: 'third-party', short: 'ECO4 — insulation & low-carbon heating', label: 'ECO4 scheme' },
        'ref-ecg-06': { num: 6, type: 'third-party', short: 'Eurostat — EU household electricity prices', label: 'EU electricity prices' },
        'ref-ecg-07': { num: 7, type: 'third-party', short: 'Eurostat — EU household gas prices', label: 'EU gas prices' },
        'ref-ecg-08': { num: 8, type: 'third-party', short: 'EU Renewable Energy Directive (RED III)', label: 'EU renewables policy' },
        'ref-ecg-09': { num: 9, type: 'third-party', short: 'Netherlands RVO — SDE++ subsidy', label: 'NL SDE++' },
        'ref-ecg-10': { num: 10, type: 'third-party', short: 'Germany EEG — renewable support', label: 'German EEG' },
        'ref-ecg-11': { num: 11, type: 'third-party', short: 'Carbon Trust — sub-metering & energy management', label: 'Carbon Trust' },
        'ref-ecg-12': { num: 12, type: 'third-party', short: 'Energy Saving Trust — home efficiency measures', label: 'Energy Saving Trust' },
        'ref-ecg-13': { num: 13, type: 'third-party', short: 'CIBSE Guide F — commercial energy benchmarks', label: 'CIBSE Guide F' },
        'ref-ecg-14': { num: 14, type: 'third-party', short: 'Solar Trade Association — UK PV yield data', label: 'Solar PV yields' },
        'ref-ecg-15': { num: 15, type: 'third-party', short: 'Waterwise — water efficiency & hot-water savings', label: 'Waterwise' },
        'ref-ecg-16': { num: 16, type: 'gw-tool', short: 'Greenways Marketplace — water-saving products', label: 'Greenways Marketplace' },
        'ref-ecg-illustrative': { num: 'i', type: 'gw-estimate', short: 'Illustrative calculator, charts & case-study outputs', label: 'Disclaimer' },
    };

    function refHref(citeId) {
        return '#' + citeId;
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
            'background:#0d1f35;color:#f8f3e8;font-size:0.78em;padding:10px 12px;border-radius:8px;border:1px solid rgba(56,182,232,0.45);' +
            'box-shadow:0 12px 32px rgba(0,0,0,0.45);line-height:1.45;pointer-events:none;font-family:inherit;}';
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
        const num = meta.num;
        return (
            `<strong>Source [${num}]</strong> ` +
            `<span class="cite-type cite-type-${meta.type}">${TYPE_LABELS[meta.type] || meta.type}</span><br>` +
            `${meta.short}<br>` +
            `<span class="cite-jump-hint">Click [${num}] to jump to References ↓</span>`
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
        getCitePortal().innerHTML = buildTooltipHtml(meta);
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

    function highlightReference(citeId) {
        const card = document.getElementById(citeId);
        if (!card) return;
        document.querySelectorAll('.ref-item.cite-highlight, .ref-disclaimer.cite-highlight').forEach((c) => {
            c.classList.remove('cite-highlight');
        });
        card.classList.add('cite-highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (global.history && global.history.replaceState) {
            global.history.replaceState(null, '', '#' + citeId);
        }
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
            link.setAttribute('aria-label', `Source ${meta.num}: ${meta.short}. Jump to References.`);
            link.title = meta.short;
            link.textContent = String(meta.num);
            link.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                highlightReference(id);
            });

            el.classList.add('has-cite');
            el.appendChild(link);
            wireCiteTooltip(el, meta);
            el.dataset.citeBound = '1';
        });
    }

    function initReferencesSection() {
        Object.keys(GWM_CITATIONS).forEach((id) => {
            const meta = GWM_CITATIONS[id];
            const card = document.getElementById(id);
            if (!card || id === 'ref-ecg-illustrative') return;
            const badge = document.createElement('span');
            badge.className = `cite-ref-badge cite-type-${meta.type}`;
            badge.textContent = `[${meta.num}] ${TYPE_LABELS[meta.type] || meta.type}`;
            const title = card.querySelector('.ref-title');
            if (title && !card.querySelector('.cite-ref-badge')) {
                title.insertAdjacentElement('beforebegin', badge);
            }
        });

        if (global.location.hash) {
            const id = global.location.hash.replace(/^#/, '');
            if (GWM_CITATIONS[id]) {
                global.setTimeout(() => highlightReference(id), 300);
            }
        }
    }

    function initEnergyCostGuidePage() {
        attachCitationMarkers();
        const banner = document.getElementById('sources-banner');
        if (banner) {
            banner.innerHTML =
                'Figures marked with <sup class="cite-demo">n</sup> link to <a href="#references">References</a> at the bottom. ' +
                '<span class="cite-type cite-type-third-party">Published</span> = official data; ' +
                '<span class="cite-type cite-type-gw-estimate">Illustrative</span> = calculator/chart estimates.';
        }
        initReferencesSection();
    }

    global.GWM_ENERGY_COST_GUIDE_CITATIONS = GWM_CITATIONS;

    document.addEventListener('DOMContentLoaded', () => {
        if (document.body.dataset.gwmCiteMode === 'energy-cost-guide') {
            initEnergyCostGuidePage();
        }
    });
})(typeof window !== 'undefined' ? window : global);
