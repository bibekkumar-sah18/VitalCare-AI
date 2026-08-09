/* ==========================================
   VITALCARE AI - MEDICATION MANAGEMENT MODULE
   ========================================== */
export const MedicationManager = {
  storageKey: 'vc_medications',

  defaultMeds: [
    { id: 'm1', name: 'Omega-3 Fatty Acid', dose: '1000mg', frequency: 'Once Daily', timing: 'Morning with breakfast', startDate: '2026-01-01', status: 'taken', refillDate: '2026-09-01', icon: '🐟' },
    { id: 'm2', name: 'Vitamin D3', dose: '2000 IU', frequency: 'Once Daily', timing: 'Afternoon with lunch', startDate: '2026-01-01', status: 'taken', refillDate: '2026-09-01', icon: '☀️' },
    { id: 'm3', name: 'Magnesium Glycinate', dose: '200mg', frequency: 'Once Daily', timing: 'Bedtime (9:30 PM)', startDate: '2026-02-15', status: 'pending', refillDate: '2026-10-15', icon: '💊' }
  ],

  getMeds() {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : [...this.defaultMeds];
  },

  saveMeds(meds) {
    localStorage.setItem(this.storageKey, JSON.stringify(meds));
  },

  addMed(med) {
    const meds = this.getMeds();
    meds.unshift({ ...med, id: 'm' + Date.now(), status: 'pending' });
    this.saveMeds(meds);
  },

  updateStatus(id, status) {
    const meds = this.getMeds().map(m => m.id === id ? { ...m, status } : m);
    this.saveMeds(meds);
    return meds;
  },

  deleteMed(id) {
    const meds = this.getMeds().filter(m => m.id !== id);
    this.saveMeds(meds);
    return meds;
  },

  calcAdherence() {
    const meds = this.getMeds();
    if (!meds.length) return 0;
    const taken = meds.filter(m => m.status === 'taken').length;
    return Math.round((taken / meds.length) * 100);
  },

  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    const form = document.getElementById('add-med-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('med-name-input')?.value.trim();
      const dose = document.getElementById('med-dose-input')?.value.trim();
      const freq = document.getElementById('med-freq-input')?.value;
      const timing = document.getElementById('med-timing-input')?.value.trim();
      if (!name || !dose) return;
      this.addMed({ name, dose, frequency: freq, timing, startDate: new Date().toISOString().split('T')[0], icon: '💊' });
      this.render();
      form.reset();
      document.getElementById('add-med-panel')?.classList.remove('active');
    });

    document.getElementById('show-add-med-btn')?.addEventListener('click', () => {
      const panel = document.getElementById('add-med-panel');
      if (!panel) return;
      panel.style.display = panel.style.display === 'none' || panel.style.display === '' ? 'block' : 'none';
    });
  },

  render() {
    const container = document.getElementById('med-list-container');
    const adherenceEl = document.getElementById('adherence-score');
    const adherenceFill = document.getElementById('adherence-fill-bar');
    if (!container) return;

    const meds = this.getMeds();
    const adherence = this.calcAdherence();

    if (adherenceEl) adherenceEl.textContent = adherence + '%';
    if (adherenceFill) adherenceFill.style.width = adherence + '%';

    container.innerHTML = meds.map(med => `
      <div class="med-card ${med.status}">
        <div class="med-icon-circle">${med.icon}</div>
        <div style="flex:1; min-width:0;">
          <div style="font-weight:700; font-size:0.92rem;">${med.name}</div>
          <div style="font-size:0.78rem; color:var(--text-muted);">${med.dose} • ${med.frequency} • ${med.timing}</div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:5px;">
          <span class="chip chip-${med.status === 'taken' ? 'normal' : med.status === 'missed' ? 'danger' : 'sky'}">${med.status}</span>
          <div style="display:flex; gap:4px;">
            ${med.status !== 'taken' ? `<button class="btn btn-sm btn-emerald" onclick="window.markMed('${med.id}','taken')">✓ Taken</button>` : ''}
            ${med.status !== 'missed' ? `<button class="btn btn-sm btn-sm" style="background:var(--rose-bg);color:var(--rose-600);border:1px solid rgba(244,63,94,0.3);" onclick="window.markMed('${med.id}','missed')">Missed</button>` : ''}
            <button class="btn btn-sm btn-secondary" onclick="window.deleteMed('${med.id}')">🗑</button>
          </div>
        </div>
      </div>
    `).join('');
  }
};
