/**
 * Citations for energy_technology_list_etl.html — ETL programme facts + named case studies only.
 */
(function (global) {
    const TYPE_LABELS = {
        'third-party': 'Published programme / organisation',
        'etl-official': 'UK Energy Technology List (ETL)',
        'gw-note': 'Greenways editorial note'
    };

    const GWM_CITATIONS = {
        'ref-etl-01': {
            num: 1,
            type: 'etl-official',
            short: 'ETL product register — large catalogue of independently assessed technologies',
            label: 'ETL product list scale',
            url: 'https://etl.energysecurity.gov.uk/'
        },
        'ref-etl-02': {
            num: 2,
            type: 'etl-official',
            short: 'ETL organises listed equipment into published technology categories',
            label: 'Technology categories',
            url: 'https://etl.energysecurity.gov.uk/'
        },
        'ref-etl-03': {
            num: 3,
            type: 'etl-official',
            short: 'Eligibility — products must meet top-quartile energy performance for their category',
            label: 'Top 25% efficiency criterion',
            url: 'https://www.gov.uk/guidance/energy-technology-list-etl'
        },
        'ref-etl-04': {
            num: 4,
            type: 'etl-official',
            short: 'Managed by the UK Department for Energy Security and Net Zero (DESNZ)',
            label: 'DESNZ programme',
            url: 'https://www.gov.uk/government/organisations/department-for-energy-security-and-net-zero'
        },
        'ref-etl-05': {
            num: 5,
            type: 'etl-official',
            short: 'Category pages describe performance tests and criteria — not site-specific costs',
            label: 'ETL category criteria',
            url: 'https://etl.energysecurity.gov.uk/'
        },
        'ref-etl-case-tfl': {
            num: 6,
            type: 'third-party',
            short: 'TfL procurement uses energy efficiency standards including ETL criteria',
            label: 'Transport for London',
            url: 'https://tfl.gov.uk/'
        },
        'ref-etl-case-reading': {
            num: 7,
            type: 'third-party',
            short: 'University of Reading — ETL used in equipment procurement',
            label: 'University of Reading',
            url: 'https://www.reading.ac.uk/'
        },
        'ref-etl-case-fea': {
            num: 8,
            type: 'third-party',
            short: 'Foodservice Equipment Association partnership with the ETL programme',
            label: 'FEA & ETL',
            url: 'https://www.fea.org.uk/'
        },
        'ref-etl-disclaimer': {
            num: 'i',
            type: 'gw-note',
            short: 'No installation costs, payback, or annual £ savings on this page unless a named case study states them',
            label: 'Figure policy',
            url: ''
        }
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
            'background:#0f766e;color:#f0fdfa;font-size:0.78em;padding:10px 12px;border-radius:8px;border:1px solid rgba(45,212,191,0.45);' +
            'box-shadow:0 12px 32px rgba(0,0,0,0.45);line-height:1.45;pointer-events:none;font-family:inherit;}' +
            '.cite-type{display:inline-block;padding:0.12rem 0.45rem;border-radius:8px;font-size:0.62rem;font-weight:700;text-transform:uppercase;margin-left:4px;}' +
            '.cite-type-etl-official{background:rgba(16,185,129,0.25);color:#6ee7b7;}' +
            '.cite-type-third-party{background:rgba(59,130,246,0.25);color:#93c5fd;}' +
            '.cite-type-gw-note{background:rgba(251,191,36,0.2);color:#fcd34d;}' +
            '.cite-link{margin-left:0.2rem;font-size:0.6em;font-weight:800;color:#fff;background:#0d9488;border-radius:4px;padding:0 4px;text-decoration:none;vertical-align:super;}' +
            '.has-cite{cursor:help;border-bottom:1px dotted rgba(13,148,136,0.55);}' +
            '.sources-banner{max-width:900px;margin:0 auto 1.5rem;padding:1rem 1.25rem;background:rgba(255,255,255,0.12);' +
            'border:1px solid rgba(255,255,255,0.25);border-radius:12px;font-size:0.92rem;line-height:1.6;text-align:center;color:#e5e7eb;}' +
            '.etl-sources{margin:2rem 20px 3rem;padding:2rem;background:rgba(255,255,255,0.96);border-radius:20px;color:#1f2937;}' +
            '.etl-sources h2{font-size:1.6rem;margin-bottom:1rem;color:#065f46;}' +
            '.ref-card{padding:1rem 1.1rem;margin-bottom:0.75rem;border-radius:10px;border-left:4px solid #0d9488;background:#f0fdfa;}' +
            '.ref-card h4{font-size:1rem;margin-bottom:0.35rem;color:#065f46;}' +
            '.ref-card p{font-size:0.88rem;line-height:1.55;color:#374151;margin:0;}' +
            '.ref-card a{color:#0d9488;font-weight:600;}' +
            '.ref-card.cite-highlight{box-shadow:0 0 0 2px #f59e0b;background:#fffbeb;}';
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
            `<span class="cite-jump-hint">Click [${meta.num}] for full reference ↓</span>`
        );
    }

    function positionCitePortal(anchor) {
        const portal = getCitePortal();
        portal.classList.add('is-visible');
        portal.style.visibility = 'hidden';
        portal.style.display = 'block';
        const anchorRect = anchor.getBoundingClientRect();
        const portalRect = portal.getBoundingClientRect();
        const gap = 10;
        const pad = 12;
        let top = anchorRect.top - portalRect.height - gap;
        if (top < pad) top = anchorRect.bottom + gap;
        let left = anchorRect.left + anchorRect.width / 2 - portalRect.width / 2;
        left = Math.max(pad, Math.min(left, global.innerWidth - portalRect.width - pad));
        portal.style.top = `${Math.round(top)}px`;
        portal.style.left = `${Math.round(left)}px`;
        portal.style.visibility = 'visible';
    }

    function hideCitePortal() {
        citePortalAnchor = null;
        if (!citePortalEl) return;
        citePortalEl.classList.remove('is-visible');
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
        const hide = () => hideCitePortal();
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
            link.setAttribute('aria-label', `Source ${meta.num}: ${meta.short}`);
            link.title = meta.short;
            link.textContent = String(meta.num);
            link.addEventListener('click', (ev) => {
                ev.preventDefault();
                highlightReference(id);
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
        document.querySelectorAll('.ref-card.cite-highlight').forEach((c) => c.classList.remove('cite-highlight'));
        card.classList.add('cite-highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (global.history && global.history.replaceState) {
            global.history.replaceState(null, '', '#' + citeId);
        }
    }

    function buildReferencesSection() {
        const mount = document.getElementById('etl-sources-mount');
        if (!mount) return;
        const cards = Object.keys(GWM_CITATIONS)
            .map((id) => {
                const meta = GWM_CITATIONS[id];
                const link = meta.url
                    ? `<p><a href="${meta.url}" target="_blank" rel="noopener">${meta.label}</a></p>`
                    : `<p>${meta.label}</p>`;
                return (
                    `<article class="ref-card" id="${id}">` +
                    `<h4>[${meta.num}] ${meta.label} ` +
                    `<span class="cite-type cite-type-${meta.type}">${TYPE_LABELS[meta.type] || meta.type}</span></h4>` +
                    `<p>${meta.short}</p>${link}</article>`
                );
            })
            .join('');
        mount.innerHTML =
            '<h2>Figure &amp; statement sources</h2>' +
            '<p style="margin-bottom:1.25rem;color:#4b5563;line-height:1.6;">' +
            'Programme facts cite the UK Energy Technology List (ETL) or named organisations. ' +
            'This page does not state installation costs, payback periods, or annual savings unless a named case study publishes them.' +
            '</p>' +
            cards;
    }

    function initEtlPage() {
        attachCitationMarkers();
        buildReferencesSection();
        const banner = document.getElementById('sources-banner');
        if (banner) {
            banner.innerHTML =
                'Figures marked with <strong>[n]</strong> link to sources below. ' +
                '<span class="cite-type cite-type-etl-official">ETL</span> = official programme data; ' +
                'hover or tap highlighted text for a short note.';
        }
        if (global.location.hash) {
            const id = global.location.hash.replace(/^#/, '');
            if (GWM_CITATIONS[id]) {
                global.setTimeout(() => highlightReference(id), 300);
            }
        }
    }

    global.GWM_ETL_CITATIONS = GWM_CITATIONS;

    document.addEventListener('DOMContentLoaded', () => {
        if (document.body.dataset.gwmCiteMode === 'energy-etl') {
            initEtlPage();
        }
    });
})(typeof window !== 'undefined' ? window : global);
