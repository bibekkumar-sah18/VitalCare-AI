/* ==========================================
   VITALCARE AI - APPOINTMENT MANAGEMENT MODULE
   ========================================== */
export const AppointmentManager = {
  storageKey: 'vc_appointments',

  defaultAppts: [
    { id: 'a1', doctor: 'Dr. Sarah Jenkins', specialty: 'Cardiology', date: '2026-08-14', time: '4:30 PM', location: 'VitalCare Telehealth Room', reason: 'Routine cardiac check & BP review', mode: 'telehealth', status: 'upcoming', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=80&q=80' },
    { id: 'a2', doctor: 'Dr. Elena Rostova', specialty: 'Primary Care', date: '2026-09-05', time: '9:00 AM', location: 'MedCity Primary Care, Suite 302', reason: 'Annual wellness physical', mode: 'in-person', status: 'upcoming', avatar: 'https://images.unsplash.com/photo-1594824813566-78a1ed649514?auto=format&fit=crop&w=80&q=80' },
    { id: 'a3', doctor: 'Dr. Marcus Vance', specialty: 'Neurology', date: '2026-07-01', time: '11:00 AM', location: 'VitalCare Telehealth Room', reason: 'Tension headache follow-up', mode: 'telehealth', status: 'past', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=80&q=80' }
  ],

  getAppts() {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : [...this.defaultAppts];
  },

  saveAppts(appts) {
    localStorage.setItem(this.storageKey, JSON.stringify(appts));
  },

  addAppt(appt) {
    const appts = this.getAppts();
    const isUpcoming = new Date(appt.date) >= new Date();
    appts.unshift({ ...appt, id: 'a' + Date.now(), status: isUpcoming ? 'upcoming' : 'past', avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(appt.doctor)}&background=0EA5E9&color=fff` });
    this.saveAppts(appts);
  },

  cancelAppt(id) {
    const appts = this.getAppts().filter(a => a.id !== id);
    this.saveAppts(appts);
    return appts;
  },

  activeTab: 'upcoming',

  init() {
    this.render('upcoming');
    this.bindEvents();
  },

  bindEvents() {
    document.querySelectorAll('.appt-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.appt-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.apptTab;
        this.render(this.activeTab);
      });
    });

    const form = document.getElementById('add-appt-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const doctor = document.getElementById('appt-doctor')?.value.trim();
      const specialty = document.getElementById('appt-specialty')?.value;
      const date = document.getElementById('appt-date')?.value;
      const time = document.getElementById('appt-time')?.value;
      const location = document.getElementById('appt-location')?.value.trim() || 'VitalCare Telehealth';
      const reason = document.getElementById('appt-reason')?.value.trim();
      const mode = document.getElementById('appt-mode')?.value || 'telehealth';
      if (!doctor || !date || !time) return;
      this.addAppt({ doctor, specialty, date, time, location, reason, mode });
      this.render(this.activeTab);
      form.reset();
      document.getElementById('add-appt-panel')?.classList.remove('active');
    });

    document.getElementById('show-add-appt-btn')?.addEventListener('click', () => {
      document.getElementById('add-appt-panel')?.classList.toggle('active');
    });
  },

  render(tab) {
    const container = document.getElementById('appts-list-container');
    if (!container) return;

    const appts = this.getAppts().filter(a => a.status === tab);

    if (appts.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">No ${tab} appointments.</div>`;
      return;
    }

    container.innerHTML = appts.map(a => {
      const d = new Date(a.date);
      const day = d.getDate();
      const month = d.toLocaleString('default', { month: 'short' });
      return `
        <div class="appt-card">
          <div class="appt-date-block">
            <div class="appt-date-day">${day}</div>
            <div class="appt-date-month">${month}</div>
          </div>
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <img src="${a.avatar}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1.5px solid var(--sky-500);" alt="${a.doctor}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(a.doctor)}&background=0EA5E9&color=fff'" />
              <strong style="font-size:0.95rem;">${a.doctor}</strong>
            </div>
            <div style="font-size:0.78rem; color:var(--sky-600); font-weight:600;">${a.specialty}</div>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">⏰ ${a.time} • 📍 ${a.location}</div>
            <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">Reason: ${a.reason}</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:5px; align-items:flex-end; flex-shrink:0;">
            <span class="chip chip-${a.mode === 'telehealth' ? 'sky' : 'normal'}">${a.mode === 'telehealth' ? '📹 Telehealth' : '🏥 In-Person'}</span>
            ${tab === 'upcoming' ? `<button class="btn btn-sm" style="color:var(--rose-500);background:var(--rose-bg);border:1px solid rgba(244,63,94,0.3);" onclick="window.cancelAppt('${a.id}')">Cancel</button>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }
};
