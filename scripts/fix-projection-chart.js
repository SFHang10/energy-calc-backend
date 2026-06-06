const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'HTMLS GWM GWB', 'equipment-savings-projection.html');
let h = fs.readFileSync(p, 'utf8');

const start = h.indexOf('    function renderChart(proj) {');
const end = h.indexOf('    function refresh() {', start);
if (start === -1 || end === -1) {
  console.error('markers not found');
  process.exit(1);
}

const replacement = `    function sampleIndices(len, maxPts) {
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
      const proposedPoints = idx.map((i) => (i === purchaseIdx || i === breakIdx ? 8 : 0));

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
    }

`;

h = h.slice(0, start) + replacement + h.slice(end);
fs.writeFileSync(p, h);
console.log('chart fixed');
