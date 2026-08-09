/* ==========================================
   VITALCARE AI - FIND HEALTHCARE MODULE
   ========================================== */
export const FindHealthcare = {
  activeCategory: 'all',
  searchQuery: '',

  facilities: [
    { id: 'f1', name: 'City General Hospital', category: 'hospital', address: '123 Medical Center Blvd', phone: '(555) 100-0001', distance: '0.8 mi', rating: '4.5', hours: '24/7 Emergency', icon: '🏥', specialty: 'Full Emergency, Cardiology, Neurology' },
    { id: 'f2', name: 'MedCity Urgent Care & Walk-In', category: 'clinic', address: '456 Wellness Ave, Suite 10', phone: '(555) 200-0002', distance: '1.2 mi', rating: '4.7', hours: 'Mon-Sat 8AM–8PM', icon: '🏨', specialty: 'Urgent Care, Flu, Vaccinations' },
    { id: 'f3', name: "St. Michael's Medical Center", category: 'hospital', address: '789 St Michael Drive', phone: '(555) 300-0003', distance: '2.5 mi', rating: '4.8', hours: '24/7 Emergency', icon: '🏥', specialty: 'Oncology, Orthopedics, Cardiology' },
    { id: 'f4', name: 'Dr. Sarah Jenkins – Cardiology', category: 'doctor', address: 'VitalCare Medical Park, Floor 4', phone: '(555) 400-0004', distance: '1.9 mi', rating: '4.95', hours: 'Mon-Fri 9AM–5PM', icon: '👩‍⚕️', specialty: 'Cardiologist, MD FACC' },
    { id: 'f5', name: 'Dr. Marcus Vance – Neurology', category: 'doctor', address: 'Brain & Spine Center, Suite 8', phone: '(555) 500-0005', distance: '3.1 mi', rating: '4.91', hours: 'Mon-Fri 10AM–6PM', icon: '🧠', specialty: 'Clinical Neurologist, MD' },
    { id: 'f6', name: 'MedCity Pharmacy', category: 'pharmacy', address: '101 Health Street, Block A', phone: '(555) 600-0006', distance: '0.5 mi', rating: '4.6', hours: 'Daily 8AM–10PM', icon: '💊', specialty: 'Prescription, OTC, Compounding' },
    { id: 'f7', name: 'WellRx Pharmacy & Clinic', category: 'pharmacy', address: '222 Cure Boulevard', phone: '(555) 700-0007', distance: '1.4 mi', rating: '4.4', hours: 'Daily 7AM–11PM', icon: '💊', specialty: 'Vaccination, Flu Shots, Rx' }
  ],

  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    document.getElementById('healthcare-search-input')?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.render();
    });

    document.querySelectorAll('.category-card[data-hc-cat]').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.category-card[data-hc-cat]').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.activeCategory = card.dataset.hcCat;
        this.render();
      });
    });
  },

  render() {
    const container = document.getElementById('facilities-list-container');
    if (!container) return;

    let filtered = this.facilities;
    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(f => f.category === this.activeCategory);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(f => f.name.toLowerCase().includes(q) || f.specialty.toLowerCase().includes(q) || f.address.toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">No healthcare facilities found for this search.</div>`;
      return;
    }

    container.innerHTML = filtered.map(f => `
      <div class="facility-card">
        <div class="facility-header">
          <div class="facility-icon-circle">${f.icon}</div>
          <div style="flex:1;">
            <strong style="font-size:0.95rem;">${f.name}</strong>
            <div style="font-size:0.78rem; color:var(--sky-600); font-weight:600;">${f.specialty}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">⭐ ${f.rating} • 🕐 ${f.hours}</div>
          </div>
          <span class="chip chip-sky" style="font-size:0.72rem; flex-shrink:0;">${f.distance}</span>
        </div>
        <div style="font-size:0.78rem; color:var(--text-secondary); margin-bottom:10px;">📍 ${f.address}</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a href="tel:${f.phone.replace(/\D/g,'')}" class="btn btn-sm btn-primary">📞 ${f.phone}</a>
          <a href="https://www.google.com/maps/search/${encodeURIComponent(f.name + ' ' + f.address)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary">🗺 Directions</a>
        </div>
      </div>
    `).join('');
  }
};
