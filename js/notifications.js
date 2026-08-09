/* ==========================================
   VITALCARE AI - NOTIFICATION BADGES MODULE
   ========================================== */

export const NotificationBadges = {
  init() {
    this.update();
    // Refresh badges every 60 seconds
    setInterval(() => this.update(), 60000);
  },

  update() {
    const pendingMeds    = this._countPendingMeds();
    const upcomingAppts  = this._countUpcomingAppts();

    this._setBadge('badge-medications-sidebar',  pendingMeds);
    this._setBadge('badge-appointments-sidebar', upcomingAppts);
    this._setBadge('badge-medications-mobile',   pendingMeds);
    this._setBadge('badge-appointments-mobile',  upcomingAppts);

    // Update browser tab title with total pending count
    const total = pendingMeds + upcomingAppts;
    const baseTitle = 'VitalCare AI — Your Health. Your Data. Smarter Care.';
    document.title = total > 0 ? '(' + total + ') ' + baseTitle : baseTitle;
  },

  _countPendingMeds() {
    try {
      const saved = localStorage.getItem('vc_medications');
      const meds = saved ? JSON.parse(saved) : [];
      return meds.filter(m => m.status === 'pending').length;
    } catch {
      return 0;
    }
  },

  _countUpcomingAppts() {
    try {
      const saved = localStorage.getItem('vc_appointments');
      const appts = saved ? JSON.parse(saved) : [];
      const today = new Date().toISOString().split('T')[0];
      return appts.filter(a => a.date === today && a.status !== 'cancelled').length;
    } catch {
      return 0;
    }
  },

  _setBadge(id, count) {
    const el = document.getElementById(id);
    if (!el) return;
    if (count > 0) {
      el.textContent = count > 9 ? '9+' : String(count);
      el.style.display = 'flex';
    } else {
      el.style.display = 'none';
    }
  }
};
