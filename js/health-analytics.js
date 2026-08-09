/* ==========================================
   VITALCARE AI - HEALTH ANALYTICS MODULE
   ========================================== */

export const HealthAnalytics = {
  activeMetric: 'healthScore',
  activeRange: '7d',

  datasets: {
    healthScore: {
      label: 'Overall Health Score',
      unit: '/100',
      color: '#0EA5E9',
      '7d': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [88, 90, 89, 92, 91, 94, 94] },
      '30d': { labels: ['W1', 'W2', 'W3', 'W4'], values: [86, 89, 91, 94] },
      '3m': { labels: ['Jun', 'Jul', 'Aug'], values: [82, 88, 94] },
      aiTrend: 'Your Health Score has improved by <strong>+8 points</strong> over the past month, driven by consistent medication adherence (87%) and improved sleep quality. Continue the current routine.'
    },
    weight: {
      label: 'Body Weight',
      unit: 'kg',
      color: '#A855F7',
      '7d': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [74.8, 74.5, 74.6, 74.2, 74.1, 74.3, 74.0] },
      '30d': { labels: ['W1', 'W2', 'W3', 'W4'], values: [75.5, 75.0, 74.5, 74.0] },
      '3m': { labels: ['Jun', 'Jul', 'Aug'], values: [76.2, 75.1, 74.0] },
      aiTrend: 'Weight trend shows a healthy gradual loss of <strong>−2.2 kg</strong> over 3 months. At this rate, target BMI of 22.0 is achievable by Q4 2026 with current activity levels.'
    },
    bmi: {
      label: 'BMI Index',
      unit: 'kg/m²',
      color: '#10B981',
      '7d': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [23.6, 23.5, 23.5, 23.4, 23.4, 23.4, 23.4] },
      '30d': { labels: ['W1', 'W2', 'W3', 'W4'], values: [23.8, 23.7, 23.6, 23.4] },
      '3m': { labels: ['Jun', 'Jul', 'Aug'], values: [24.1, 23.7, 23.4] },
      aiTrend: 'BMI is progressing from 24.1 to 23.4 — firmly in the <strong>Normal Weight</strong> range (18.5–24.9). Consistent moderate exercise has been the primary driver.'
    },
    sleep: {
      label: 'Sleep Duration',
      unit: 'hrs',
      color: '#6366F1',
      '7d': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [7.0, 6.5, 7.5, 8.0, 7.2, 8.5, 7.8] },
      '30d': { labels: ['W1', 'W2', 'W3', 'W4'], values: [6.8, 7.2, 7.6, 7.8] },
      '3m': { labels: ['Jun', 'Jul', 'Aug'], values: [6.5, 7.0, 7.8] },
      aiTrend: 'Sleep quality is trending positively, averaging <strong>7.5 hrs/night</strong> this week vs. 6.5 hrs in June. Magnesium Glycinate supplementation started in February may be contributing.'
    },
    activity: {
      label: 'Daily Activity',
      unit: 'steps',
      color: '#F59E0B',
      '7d': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [7200, 8500, 6000, 9100, 8000, 11200, 7800] },
      '30d': { labels: ['W1', 'W2', 'W3', 'W4'], values: [7500, 8200, 8800, 8700] },
      '3m': { labels: ['Jun', 'Jul', 'Aug'], values: [6500, 7800, 8700] },
      aiTrend: 'Average daily step count has increased <strong>+2,200 steps/day</strong> vs. 3 months ago. Weekend activity spikes (Saturday 11,200 steps) suggest outdoor exercise routines are working.'
    },
    adherence: {
      label: 'Medication Adherence',
      unit: '%',
      color: '#14B8A6',
      '7d': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [100, 67, 100, 100, 100, 67, 100] },
      '30d': { labels: ['W1', 'W2', 'W3', 'W4'], values: [85, 80, 90, 87] },
      '3m': { labels: ['Jun', 'Jul', 'Aug'], values: [75, 82, 87] },
      aiTrend: 'Medication adherence has improved from 75% in June to <strong>87% this month</strong>. Missing doses typically occur on weekends. Consider setting a Saturday/Sunday alarm.'
    }
  },

  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    document.querySelectorAll('.metric-tab-btn[data-metric]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.metric-tab-btn[data-metric]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeMetric = btn.dataset.metric;
        this.render();
      });
    });

    document.querySelectorAll('.analytics-range-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.analytics-range-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeRange = btn.dataset.range;
        this.render();
      });
    });
  },

  render() {
    const ds = this.datasets[this.activeMetric];
    const data = ds[this.activeRange];
    if (!ds || !data) return;

    // Render Chart
    this.renderChart('analytics-chart-canvas', data.values, data.labels, ds.color);

    // Render Summary Stats
    const vals = data.values;
    const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    const min = Math.min(...vals).toFixed(1);
    const max = Math.max(...vals).toFixed(1);
    const trend = vals[vals.length - 1] - vals[0];

    const statsEl = document.getElementById('analytics-stats-row');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-mini-card">
          <div class="stat-mini-val" style="color:${ds.color};">${avg}<span style="font-size:0.65rem;color:var(--text-muted);"> ${ds.unit}</span></div>
          <div class="stat-mini-label">Average</div>
        </div>
        <div class="stat-mini-card">
          <div class="stat-mini-val" style="color:var(--emerald-500);">${max}<span style="font-size:0.65rem;color:var(--text-muted);"> ${ds.unit}</span></div>
          <div class="stat-mini-label">Peak</div>
        </div>
        <div class="stat-mini-card">
          <div class="stat-mini-val" style="color:var(--rose-500);">${min}<span style="font-size:0.65rem;color:var(--text-muted);"> ${ds.unit}</span></div>
          <div class="stat-mini-label">Low</div>
        </div>
        <div class="stat-mini-card">
          <div class="stat-mini-val" style="color:${trend >= 0 ? 'var(--emerald-500)' : 'var(--rose-500)'};">${trend >= 0 ? '+' : ''}${parseFloat(trend).toFixed(1)}</div>
          <div class="stat-mini-label">Net Change</div>
        </div>
      `;
    }

    // Render AI Trend Explanation
    const trendEl = document.getElementById('analytics-ai-trend');
    if (trendEl) {
      trendEl.innerHTML = `
        <div style="display:flex; align-items:flex-start; gap:10px;">
          <span style="font-size:1.2rem; flex-shrink:0;">🤖</span>
          <div>
            <strong style="font-size:0.8rem; color:var(--indigo-500);">AI TREND ANALYSIS</strong><br>
            <span style="font-size:0.84rem;">${ds.aiTrend}</span>
          </div>
        </div>
      `;
    }
  },

  renderChart(containerId, values, labels, color) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = 600;
    const height = 220;
    const padX = 40;
    const padY = 28;
    const min = Math.min(...values) * 0.92;
    const max = Math.max(...values) * 1.08;
    const n = values.length;

    const pts = values.map((v, i) => ({
      x: padX + (i / (n - 1)) * (width - 2 * padX),
      y: height - padY - ((v - min) / (max - min)) * (height - 2 * padY),
      v, l: labels[i]
    }));

    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${pts[n-1].x} ${height - padY} L ${pts[0].x} ${height - padY} Z`;

    const gridY = [0.25, 0.5, 0.75, 1.0].map(f => padY + (1 - f) * (height - 2 * padY));

    container.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="overflow:visible;">
        <defs>
          <linearGradient id="analyticsGrad_${containerId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        ${gridY.map(y => `<line x1="${padX}" y1="${y.toFixed(1)}" x2="${width - padX}" y2="${y.toFixed(1)}" stroke="var(--border-light)" stroke-dasharray="4"/>`).join('')}
        <path d="${areaPath}" fill="url(#analyticsGrad_${containerId})"/>
        <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${pts.map(p => `
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${color}" stroke="#fff" stroke-width="2"/>
          <text x="${p.x.toFixed(1)}" y="${height - 8}" font-size="11" fill="var(--text-muted)" text-anchor="middle" font-weight="600">${p.l}</text>
        `).join('')}
      </svg>
    `;
  }
};
