const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'HTMLS GWM GWB', 'equipment-savings-projection.html');
let h = fs.readFileSync(p, 'utf8');
const d = 'di' + 'v';

h = h.replace(/<\/?motion\b[^>]*>/gi, (tag) => tag.replace(/motion/gi, d));

const renderKpis = `    function renderKpis(proj) {
      document.getElementById('pageTitle').textContent = state.title;
      document.getElementById('kpiRow').innerHTML =
        '<' + d + ' class="kpi highlight"><' + d + ' class="label">You save</' + d + '><' + d + ' class="val">' + euro(proj.monthlySavingsEur) + '<span class="small">/mo</span></' + d + '></' + d + '>' +
        '<' + d + ' class="kpi"><' + d + ' class="label">Payback (with subsidy)</' + d + '><' + d + ' class="val">' + M.formatPayback(proj.paybackMonths) + '</' + d + '></' + d + '>' +
        '<' + d + ' class="kpi"><' + d + ' class="label">Payback (no subsidy)</' + d + '><' + d + ' class="val">' + M.formatPayback(proj.paybackMonthsWithoutGrant) + '</' + d + '></' + d + '>' +
        '<' + d + ' class="kpi"><' + d + ' class="label">Net upfront</' + d + '><' + d + ' class="val small">' + euro(proj.netUpfrontEur) + '</' + d + '></' + d + '>' +
        '<' + d + ' class="kpi"><' + d + ' class="label">Extra in pocket (' + (proj.horizonMonths / 12) + ' yr)</' + d + '><' + d + ' class="val small">' + euro(proj.totalSavingsAtHorizonEur) + '</' + d + '></' + d + '>';
      document.getElementById('grantAmountLabel').textContent = euro(state.grantsFull);
      const thumb = document.getElementById('productThumb');
      if (state.image) {
        thumb.src = state.image;
        thumb.hidden = false;
      } else thumb.hidden = true;
    }`;

h = h.replace(/    function renderKpis\(proj\) \{[\s\S]*?    \}\n\n    function renderMarkers/, renderKpis + '\n\n    function renderMarkers');

const renderChart = `    function sampleIndices(len, maxPts) {
      const step = Math.max(1, Math.floor(len / maxPts));
      const idx = [];
      for (let i = 0; i < len; i += step) idx.push(i);
      if (idx[idx.length - 1] !== len - 1) idx.push(len - 1);
      return idx;
    }

    function renderChart(proj) {
      const ctx = document.getElementById('projectionChart');
      const idx = sampleIndices(proj.labels.length, 28);
      const labels = idx.map((i) => (i === 0 ? 'Now' : 'M' + i));
      const purchaseIdx = proj.purchaseMonth;
      const breakIdx = proj.breakEvenMonth;

      const proposedPoints = idx.map((i) => {
        if (i === purchaseIdx || i === breakIdx) return 8;
        return 0;
      });

      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: state.baselineLabel,
              data: idx.map((i) => proj.baselineCumulative[i]),
              borderColor: '#e85d7a',
              backgroundColor: 'rgba(232, 93, 122, 0.08)',
              borderWidth: 2.5,
              tension: 0,
              pointRadius: 0,
              fill: true
            },
            {
              label: state.proposedLabel,
              data: idx.map((i) => proj.proposedCumulative[i]),
              borderColor: '#53b8ff',
              backgroundColor: 'rgba(83, 184, 255, 0.1)',
              borderWidth: 2.5,
              tension: 0.15,
              pointRadius: proposedPoints,
              pointBackgroundColor: '#fff',
              pointBorderColor: '#53b8ff',
              pointBorderWidth: 2,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 700, easing: 'easeOutQuart' },
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c) => c.dataset.label + ': ' + euro(c.parsed.y) + ' cumulative'
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.06)' },
              ticks: { color: '#8fb89a', maxTicksLimit: 12 }
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.06)' },
              ticks: {
                color: '#8fb89a',
                callback: (v) => '€' + Math.round(v).toLocaleString('en-GB')
              },
              title: { display: true, text: 'Cumulative cost', color: '#8fb89a', font: { size: 11 } }
            }
          }
        }
      });
    }`;

h = h.replace(/    function renderChart\(proj\) \{[\s\S]*?    \}\n\n    function downsample/, renderChart + '\n\n    function downsampleRemoved');
h = h.replace(/    function downsample[\s\S]*?    function refresh\(\)/, '    function refresh()');

const bootFix = `    async function boot() {
      const paramId = readParams();
      document.getElementById('tariffFootnote').textContent =
        (window.SiteEnergyModel && SiteEnergyModel.tariffSummaryLine())
          ? SiteEnergyModel.tariffSummaryLine() + '. Move sliders to explore purchase timing and subsidy.'
          : 'Tariff assumptions from Greenways site model.';

      try {
        const res = await fetch(resolveDataUrl(SCENARIOS_URL), { cache: 'no-store' });
        const payload = await res.json();
        scenarios = payload.scenarios || [];
      } catch (e) {
        console.warn(e);
        document.getElementById('scenarioNote').textContent =
          'Could not load scenarios — using URL params or defaults.';
      }

      const sel = document.getElementById('scenarioSelect');
      if (scenarios.length) {
        sel.innerHTML = scenarios.map((s) =>
          '<option value="' + s.id + '">' + s.title + '</option>'
        ).join('');
        const initial = scenarios.find((s) => s.id === paramId) || scenarios[0];
        if (initial) {
          sel.value = initial.id;
          applyScenario(initial);
        }
      } else {
        document.getElementById('scenarioPanel').style.display = 'none';
      }

      sel.addEventListener('change', () => {
        const s = scenarios.find((x) => x.id === sel.value);
        applyScenario(s);
        refresh();
      });

      document.getElementById('purchaseSlider').addEventListener('input', refresh);
      document.getElementById('savingsPctSlider').addEventListener('input', refresh);
      document.getElementById('subsidyToggle').addEventListener('change', refresh);
      document.querySelectorAll('#horizonBtns button').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#horizonBtns button').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          state.horizonMonths = Number(btn.getAttribute('data-months'));
          refresh();
        });
      });

      refresh();
    }

    boot().catch((err) => {
      console.warn(err);
      refresh();
    });`;

h = h.replace(/    async function boot\(\) \{[\s\S]*<\/script>/, bootFix + '\n  </script>');

fs.writeFileSync(p, h);
console.log('fixed', (h.match(/motion/gi) || []).filter((x) => x !== 'motion' && !h.includes('prefers-reduced-motion')).length);
