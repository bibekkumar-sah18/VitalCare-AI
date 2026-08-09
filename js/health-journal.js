/* ==========================================
   VITALCARE AI - DAILY HEALTH JOURNAL MODULE
   ========================================== */

export const HealthJournal = {
  storageKey: 'vc_health_journal',

  moods: [
    { emoji: '😄', label: 'Great',    color: '#10B981' },
    { emoji: '🙂', label: 'Good',     color: '#0EA5E9' },
    { emoji: '😐', label: 'Neutral',  color: '#F59E0B' },
    { emoji: '😔', label: 'Low',      color: '#F97316' },
    { emoji: '😫', label: 'Rough',    color: '#F43F5E' },
  ],

  aiInsights: [
    'Consistent journaling improves health self-awareness by up to 40%. Keep it up!',
    'Your mood logs help the AI engine calibrate stress risk factors more accurately.',
    'Regular energy level tracking correlates strongly with sleep quality improvements.',
    'Logging symptoms alongside mood helps identify pattern triggers earlier.',
    'Studies show daily health journals reduce hospital visits by 23% over 6 months.',
  ],

  activeFilter: 'all',
  editingId: null,

  getEntries() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch { return this._defaultEntries(); }
    }
    return this._defaultEntries();
  },

  _defaultEntries() {
    return [
      {
        id: 'j1',
        date: new Date().toISOString().split('T')[0],
        mood: '😄',
        moodLabel: 'Great',
        moodColor: '#10B981',
        energy: 4,
        notes: 'Feeling energized after the morning run. Slept 8 hours last night. No headaches today.',
        tags: ['exercise', 'sleep', 'no symptoms'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'j2',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        mood: '🙂',
        moodLabel: 'Good',
        moodColor: '#0EA5E9',
        energy: 3,
        notes: 'Productive work day. Mild stiffness in the shoulders after sitting at the desk. Took Omega-3 on schedule.',
        tags: ['work', 'mild stiffness', 'meds taken'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'j3',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        mood: '😐',
        moodLabel: 'Neutral',
        moodColor: '#F59E0B',
        energy: 2,
        notes: 'Slight fatigue post-lunch. Did not exercise. Blood pressure measured at 120/80 — slightly elevated.',
        tags: ['fatigue', 'no exercise', 'bp elevated'],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      }
    ];
  },

  saveEntries(entries) {
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
  },

  addEntry(entry) {
    const entries = this.getEntries();
    const newEntry = { ...entry, id: 'j' + Date.now(), createdAt: new Date().toISOString() };
    entries.unshift(newEntry);
    this.saveEntries(entries);
    return newEntry;
  },

  updateEntry(id, updates) {
    const entries = this.getEntries().map(e => e.id === id ? { ...e, ...updates } : e);
    this.saveEntries(entries);
  },

  deleteEntry(id) {
    const entries = this.getEntries().filter(e => e.id !== id);
    this.saveEntries(entries);
    return entries;
  },

  init() {
    this.bindEvents();
    this.render();
    this.renderAIInsight();

    // Global window callbacks
    window.deleteJournalEntry = (id) => {
      if (confirm('Delete this journal entry?')) {
        this.deleteEntry(id);
        this.render();
      }
    };
    window.editJournalEntry = (id) => {
      this.startEdit(id);
    };
  },

  bindEvents() {
    document.getElementById('journal-entry-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleFormSubmit();
    });

    document.querySelectorAll('.journal-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.journal-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.moodFilter;
        this.render();
      });
    });

    document.getElementById('show-journal-form-btn')?.addEventListener('click', () => {
      const panel = document.getElementById('journal-form-panel');
      if (!panel) return;
      const isOpen = panel.style.display !== 'none' && panel.style.display !== '';
      panel.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) {
        this._resetForm();
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    document.querySelectorAll('.mood-pick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mood-pick-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    const energySlider = document.getElementById('journal-energy-slider');
    const energyLabel  = document.getElementById('journal-energy-val');
    if (energySlider && energyLabel) {
      energySlider.addEventListener('input', () => {
        const lvls = ['', '🪫 Very Low', '😴 Low', '⚡ Moderate', '💪 High', '🚀 Peak'];
        energyLabel.textContent = lvls[energySlider.value] || energySlider.value;
      });
    }

    document.getElementById('journal-tags-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        this._addTagFromInput();
      }
    });

    document.getElementById('journal-cancel-btn')?.addEventListener('click', () => {
      this._resetForm();
      document.getElementById('journal-form-panel').style.display = 'none';
      this.editingId = null;
    });
  },

  _handleFormSubmit() {
    const selectedMoodBtn = document.querySelector('.mood-pick-btn.selected');
    const mood = selectedMoodBtn?.dataset.emoji || '🙂';
    const moodLabel = selectedMoodBtn?.dataset.label || 'Good';
    const moodColor = selectedMoodBtn?.dataset.color || '#0EA5E9';
    const energy = parseInt(document.getElementById('journal-energy-slider')?.value || '3');
    const notes = document.getElementById('journal-notes-input')?.value.trim() || '';
    const date  = document.getElementById('journal-date-input')?.value || new Date().toISOString().split('T')[0];
    const tagsContainer = document.getElementById('journal-tags-list');
    const tags = Array.from(tagsContainer?.querySelectorAll('.tag-pill-text') || []).map(t => t.textContent);

    if (!notes) {
      this._showFormAlert('Please enter your health notes for today.');
      return;
    }

    const entryData = { date, mood, moodLabel, moodColor, energy, notes, tags };

    if (this.editingId) {
      this.updateEntry(this.editingId, entryData);
      this.editingId = null;
    } else {
      this.addEntry(entryData);
    }

    this._resetForm();
    document.getElementById('journal-form-panel').style.display = 'none';
    this.render();
    this.showToast('Journal entry saved!');
  },

  _addTagFromInput() {
    const input = document.getElementById('journal-tags-input');
    const container = document.getElementById('journal-tags-list');
    if (!input || !container) return;
    const val = input.value.replace(',', '').trim().toLowerCase();
    if (!val) return;
    const pill = document.createElement('div');
    pill.className = 'journal-tag-pill';
    pill.innerHTML = '<span class="tag-pill-text">' + val + '</span><button type="button" class="tag-pill-remove" onclick="this.parentElement.remove()">x</button>';
    container.appendChild(pill);
    input.value = '';
  },

  _resetForm() {
    document.getElementById('journal-entry-form')?.reset();
    const tagsList = document.getElementById('journal-tags-list');
    if (tagsList) tagsList.innerHTML = '';
    document.querySelectorAll('.mood-pick-btn').forEach((b, i) => b.classList.toggle('selected', i === 1));
    const energyLabel = document.getElementById('journal-energy-val');
    if (energyLabel) energyLabel.textContent = 'Moderate';
    const submitBtn = document.getElementById('journal-submit-btn');
    if (submitBtn) submitBtn.textContent = 'Save Journal Entry';
    const alert = document.getElementById('journal-form-alert');
    if (alert) alert.remove();
    const dateInput = document.getElementById('journal-date-input');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    this.editingId = null;
  },

  _showFormAlert(msg) {
    let el = document.getElementById('journal-form-alert');
    if (!el) {
      el = document.createElement('div');
      el.id = 'journal-form-alert';
      el.className = 'form-alert-box error';
      document.getElementById('journal-entry-form')?.prepend(el);
    }
    el.textContent = msg;
    el.style.display = 'flex';
  },

  render() {
    const container = document.getElementById('journal-entries-container');
    if (!container) return;

    let entries = this.getEntries();

    if (this.activeFilter !== 'all') {
      entries = entries.filter(e => (e.moodLabel || '').toLowerCase() === this.activeFilter);
    }

    if (entries.length === 0) {
      container.innerHTML = '<div class="journal-empty-state"><div style="font-size:3rem;margin-bottom:12px;">📓</div><h3>No journal entries yet</h3><p>Start logging your daily health to unlock AI insights and mood trends.</p></div>';
      return;
    }

    container.innerHTML = entries.map(e => {
      const energyStars = Array.from({ length: 5 }, (_, i) =>
        '<span style="color:' + (i < e.energy ? '#F59E0B' : 'var(--border-medium)') + ';">★</span>'
      ).join('');
      const tagsHtml = (e.tags || []).map(t =>
        '<span class="chip chip-sky" style="font-size:0.7rem;">' + t + '</span>'
      ).join('');

      return '<div class="journal-entry-card" style="border-left:4px solid ' + (e.moodColor || '#0EA5E9') + ';">' +
        '<div class="journal-entry-header">' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<div class="journal-mood-badge" style="background:' + (e.moodColor || '#0EA5E9') + '22;border:1px solid ' + (e.moodColor || '#0EA5E9') + '55;">' +
              '<span style="font-size:1.4rem;">' + e.mood + '</span>' +
            '</div>' +
            '<div>' +
              '<div style="font-weight:700;font-size:0.92rem;color:var(--text-primary);">' + (e.moodLabel || 'Good') + ' Day</div>' +
              '<div style="font-size:0.75rem;color:var(--text-muted);">' + this._formatDate(e.date) + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<div style="font-size:0.75rem;color:var(--text-muted);">Energy: ' + energyStars + '</div>' +
            '<button class="btn btn-sm btn-secondary" onclick="window.editJournalEntry(\'' + e.id + '\')" title="Edit">✏️</button>' +
            '<button class="btn btn-sm" style="background:var(--rose-bg);color:var(--rose-500);border:1px solid rgba(244,63,94,0.3);" onclick="window.deleteJournalEntry(\'' + e.id + '\')" title="Delete">🗑</button>' +
          '</div>' +
        '</div>' +
        '<p class="journal-entry-notes">' + this._escapeHtml(e.notes) + '</p>' +
        (tagsHtml ? '<div class="journal-tags-row">' + tagsHtml + '</div>' : '') +
        '</div>';
    }).join('');
  },

  renderAIInsight() {
    const el = document.getElementById('journal-ai-insight-text');
    if (el) {
      const random = this.aiInsights[Math.floor(Math.random() * this.aiInsights.length)];
      el.textContent = random;
    }
  },

  startEdit(id) {
    const entry = this.getEntries().find(e => e.id === id);
    if (!entry) return;
    this.editingId = id;

    const panel = document.getElementById('journal-form-panel');
    if (panel) { panel.style.display = 'block'; panel.scrollIntoView({ behavior: 'smooth' }); }

    const dateInput = document.getElementById('journal-date-input');
    const notesInput = document.getElementById('journal-notes-input');
    const energySlider = document.getElementById('journal-energy-slider');
    if (dateInput) dateInput.value = entry.date;
    if (notesInput) notesInput.value = entry.notes;
    if (energySlider) energySlider.value = entry.energy;

    const energyLabel = document.getElementById('journal-energy-val');
    const lvls = ['', 'Very Low', 'Low', 'Moderate', 'High', 'Peak'];
    if (energyLabel) energyLabel.textContent = lvls[entry.energy] || entry.energy;

    document.querySelectorAll('.mood-pick-btn').forEach(b => {
      b.classList.toggle('selected', b.dataset.emoji === entry.mood);
    });

    const tagsContainer = document.getElementById('journal-tags-list');
    if (tagsContainer) {
      tagsContainer.innerHTML = (entry.tags || []).map(t =>
        '<div class="journal-tag-pill"><span class="tag-pill-text">' + t + '</span><button type="button" class="tag-pill-remove" onclick="this.parentElement.remove()">x</button></div>'
      ).join('');
    }

    const submitBtn = document.getElementById('journal-submit-btn');
    if (submitBtn) submitBtn.textContent = 'Update Entry';
  },

  _formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  },

  _escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  showToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#10B981,#0EA5E9);color:#fff;padding:10px 22px;border-radius:99px;font-weight:700;font-size:0.85rem;z-index:9999;box-shadow:0 4px 20px rgba(16,185,129,0.4);';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }
};
