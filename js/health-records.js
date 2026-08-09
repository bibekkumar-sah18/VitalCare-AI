/* ==========================================
   VITALCARE AI - HEALTH RECORDS MODULE
   ========================================== */
export const HealthRecords = {
  storageKey: 'vc_health_records',

  defaultRecords: [
    { id: 'r1', name: 'Annual Physical Report 2026', type: 'report', date: '2026-07-15', provider: 'Dr. Elena Rostova', size: '2.4 MB', icon: '📋' },
    { id: 'r2', name: 'Lipid Panel & HbA1c Results', type: 'lab', date: '2026-06-30', provider: 'Quest Diagnostics', size: '1.1 MB', icon: '🧬' },
    { id: 'r3', name: 'Metformin Prescription', type: 'prescription', date: '2026-05-10', provider: 'Dr. Sarah Jenkins', size: '0.3 MB', icon: '💊' },
    { id: 'r4', name: 'COVID-19 Vaccination Certificate', type: 'vaccination', date: '2024-11-20', provider: 'City Health Clinic', size: '0.5 MB', icon: '💉' },
    { id: 'r5', name: 'Flu Vaccination 2025', type: 'vaccination', date: '2025-10-05', provider: 'Walgreens Pharmacy', size: '0.2 MB', icon: '💉' }
  ],

  getRecords() {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : [...this.defaultRecords];
  },

  saveRecords(records) {
    localStorage.setItem(this.storageKey, JSON.stringify(records));
  },

  addRecord(record) {
    const records = this.getRecords();
    records.unshift({ ...record, id: 'r' + Date.now() });
    this.saveRecords(records);
    return records;
  },

  deleteRecord(id) {
    const records = this.getRecords().filter(r => r.id !== id);
    this.saveRecords(records);
    return records;
  },

  filterRecords(records, type, query) {
    let filtered = records;
    if (type && type !== 'all') filtered = filtered.filter(r => r.type === type);
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(r => r.name.toLowerCase().includes(q) || r.provider.toLowerCase().includes(q));
    }
    return filtered;
  },

  init() {
    this.render('all', '');
    this.bindEvents();
  },

  bindEvents() {
    document.getElementById('record-search-input')?.addEventListener('input', (e) => {
      this.render(this.activeFilter || 'all', e.target.value);
    });

    document.querySelectorAll('.filter-tab[data-record-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab[data-record-type]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.recordType;
        const q = document.getElementById('record-search-input')?.value || '';
        this.render(this.activeFilter, q);
      });
    });

    document.getElementById('record-upload-dropzone')?.addEventListener('click', () => {
      document.getElementById('record-file-input')?.click();
    });

    document.getElementById('record-file-input')?.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const typeSelect = document.getElementById('record-type-select');
        const newRecord = {
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: typeSelect?.value || 'report',
          date: new Date().toISOString().split('T')[0],
          provider: 'Uploaded by Patient',
          size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
          icon: '📄'
        };
        this.addRecord(newRecord);
        this.render(this.activeFilter || 'all', '');
        this.showToast('Record uploaded successfully!');
      }
    });
  },

  render(filterType, query) {
    const container = document.getElementById('records-list-container');
    if (!container) return;

    const records = this.filterRecords(this.getRecords(), filterType, query);

    if (records.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">No health records found.</div>`;
      return;
    }

    container.innerHTML = records.map(r => `
      <div class="record-item" data-id="${r.id}">
        <div class="record-icon" style="background:var(--bg-surface-elevated);">${r.icon}</div>
        <div class="record-meta">
          <div class="record-name">${r.name}</div>
          <div class="record-detail">${r.provider} • ${r.date} • ${r.size}</div>
        </div>
        <span class="chip chip-${r.type === 'lab' ? 'sky' : r.type === 'prescription' ? 'ai' : r.type === 'vaccination' ? 'normal' : 'sky'}" style="display:none; font-size:0.7rem;">${r.type}</span>
        <div class="record-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.downloadRecord('${r.id}')">View</button>
          <button class="btn btn-sm" style="color:var(--rose-500);background:var(--rose-bg);border:1px solid rgba(244,63,94,0.3);" onclick="window.deleteRecord('${r.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  },

  showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#10B981;color:#fff;padding:10px 20px;border-radius:99px;font-weight:700;font-size:0.85rem;z-index:9999;';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }
};
