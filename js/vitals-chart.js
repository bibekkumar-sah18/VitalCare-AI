/* ==========================================
   VITALCARE AI - CHARTING & VITALS SIMULATOR ENGINE
   ========================================== */

export const VitalsEngine = {
  // Live vitals data state
  vitals: {
    heartRate: { val: 72, min: 60, max: 100, unit: 'BPM', status: 'Normal', spark: [68, 70, 74, 71, 75, 72, 73, 72] },
    bp: { val: '118/78', unit: 'mmHg', status: 'Optimal', spark: [120, 118, 119, 117, 118] },
    spo2: { val: 99, unit: '%', status: 'Optimal', spark: [98, 99, 99, 98, 99, 99] },
    glucose: { val: 95, unit: 'mg/dL', status: 'Fasting', spark: [92, 98, 95, 96, 94, 95] },
    temp: { val: 98.6, unit: '°F', status: 'Normal', spark: [98.4, 98.6, 98.5, 98.6] },
    sleep: { val: 7.8, unit: 'Hrs', status: 'Restful', spark: [6.5, 7.2, 8.0, 7.5, 7.8] }
  },

  // Historical Analytics datasets
  analyticsData: {
    '24h': {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'],
      heartRate: [64, 58, 72, 85, 76, 70, 72],
      bpSystolic: [115, 112, 122, 128, 120, 116, 118],
      bpDiastolic: [74, 72, 80, 84, 78, 76, 78],
      glucose: [90, 88, 110, 105, 98, 92, 95]
    },
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      heartRate: [68, 74, 71, 69, 75, 78, 72],
      bpSystolic: [118, 120, 116, 122, 119, 124, 118],
      bpDiastolic: [76, 78, 74, 80, 77, 82, 78],
      glucose: [94, 99, 92, 102, 96, 98, 95]
    },
    '30d': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      heartRate: [70, 73, 69, 72],
      bpSystolic: [119, 121, 117, 118],
      bpDiastolic: [77, 79, 75, 78],
      glucose: [96, 94, 97, 95]
    }
  },

  initSparklines() {
    this.renderSparkline('heart-sparkline', this.vitals.heartRate.spark, '#F43F5E');
    this.renderSparkline('bp-sparkline', this.vitals.bp.spark, '#0EA5E9');
    this.renderSparkline('spo2-sparkline', this.vitals.spo2.spark, '#10B981');
    this.renderSparkline('glucose-sparkline', this.vitals.glucose.spark, '#F59E0B');
  },

  renderSparkline(containerId, points, color) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const width = 140;
    const height = 30;
    const min = Math.min(...points) - 2;
    const max = Math.max(...points) + 2;
    const len = points.length;

    const coords = points.map((val, idx) => {
      const x = (idx / (len - 1)) * width;
      const y = height - ((val - min) / (max - min)) * height;
      return `${x},${y}`;
    }).join(' ');

    el.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <polyline fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${coords}" />
      </svg>
    `;
  },

  renderMainChart(timeframe = '24h', metric = 'heartRate') {
    const container = document.getElementById('main-analytics-chart');
    if (!container) return;

    const data = this.analyticsData[timeframe] || this.analyticsData['24h'];
    const values = data[metric] || data.heartRate;
    const labels = data.labels;

    const width = 600;
    const height = 220;
    const padding = 30;

    const minVal = Math.min(...values) * 0.9;
    const maxVal = Math.max(...values) * 1.1;

    const points = values.map((val, idx) => {
      const x = padding + (idx / (values.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);
      return { x, y, val, label: labels[idx] };
    });

    const pathD = points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    let dotsSvg = points.map(pt => `
      <circle cx="${pt.x}" cy="${pt.y}" r="4.5" fill="#0EA5E9" stroke="#FFFFFF" stroke-width="2" class="chart-dot" data-val="${pt.val} ${metric === 'heartRate' ? 'BPM' : 'mmHg'}" data-label="${pt.label}"/>
    `).join('');

    let xLabelsSvg = points.map(pt => `
      <text x="${pt.x}" y="${height - 8}" font-size="11" fill="var(--text-muted)" text-anchor="middle" font-weight="600">${pt.label}</text>
    `).join('');

    container.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="overflow: visible;">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0EA5E9" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#0EA5E9" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        
        <!-- Grid lines -->
        <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="var(--border-light)" stroke-dasharray="4"/>
        <line x1="${padding}" y1="${height/2}" x2="${width - padding}" y2="${height/2}" stroke="var(--border-light)" stroke-dasharray="4"/>
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--border-light)"/>

        <!-- Area Fill & Line -->
        <path d="${areaD}" fill="url(#chartGradient)" />
        <path d="${pathD}" fill="none" stroke="#0EA5E9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        
        <!-- Interactive Dots & Labels -->
        ${dotsSvg}
        ${xLabelsSvg}
      </svg>
    `;
  },

  startLivePulseSimulation() {
    setInterval(() => {
      // Small realistic variation in heart rate (70 - 76 BPM)
      const delta = (Math.random() * 2 - 1).toFixed(0);
      let newBpm = this.vitals.heartRate.val + parseInt(delta);
      if (newBpm < 68) newBpm = 68;
      if (newBpm > 78) newBpm = 78;
      
      this.vitals.heartRate.val = newBpm;
      const bpmEl = document.getElementById('vital-hr-value');
      if (bpmEl) {
        bpmEl.textContent = newBpm;
      }
    }, 4000);
  }
};
