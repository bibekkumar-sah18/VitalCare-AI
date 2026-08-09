/* ==========================================
   VITALCARE AI - EMERGENCY SOS MODULE
   ========================================== */
import { UserStore } from './user-data.js';

export const EmergencySOS = {
  userLocation: null,
  locationError: null,

  nearbyHospitals: [
    { name: 'City General Hospital', distance: '0.8 mi', address: '123 Medical Center Blvd', phone: '(555) 100-0001', type: '🏥 Full ER', level: 'Level I Trauma Center' },
    { name: 'MedCity Urgent Care', distance: '1.2 mi', address: '456 Wellness Ave, Suite 10', phone: '(555) 200-0002', type: '🚑 Urgent Care', level: 'Walk-in Available' },
    { name: "St. Michael's Medical Center", distance: '2.5 mi', address: '789 St Michael Drive', phone: '(555) 300-0003', type: '🏥 Full ER', level: 'Level II Trauma Center' }
  ],

  init() {
    this.bindEvents();
    this.requestLocation();
    this.populateProfileInfo();
    this.renderHospitals();
  },

  populateProfileInfo() {
    const p = UserStore.getProfile();
    const el = document.getElementById('sos-profile-summary');
    if (!el) return;
    el.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.82rem;">
        <div style="background:rgba(244,63,94,0.1); border:1px solid rgba(244,63,94,0.25); border-radius:8px; padding:8px;">🩸 <strong>Blood Group:</strong> O+</div>
        <div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.25); border-radius:8px; padding:8px;">⚠️ <strong>Allergies:</strong> ${p.allergies ? p.allergies.join(', ') : 'Penicillin'}</div>
        <div style="background:var(--bg-surface-elevated); border-radius:8px; padding:8px; grid-column:span 2;">💊 <strong>Medications:</strong> ${p.medications ? p.medications.map(m => m.name).join(', ') : 'Omega-3, Vitamin D3'}</div>
        <div style="background:var(--bg-surface-elevated); border-radius:8px; padding:8px; grid-column:span 2;">📞 <strong>Emergency Contact:</strong> ${p.emergencyContacts ? p.emergencyContacts[0].name + ' ' + p.emergencyContacts[0].phone : 'Elena Miller (555) 019-2831'}</div>
      </div>
    `;
  },

  requestLocation() {
    const statusEl = document.getElementById('sos-location-status');
    if (!navigator.geolocation) {
      if (statusEl) statusEl.textContent = '⚠️ Location not available on this browser. Please call 911 directly.';
      return;
    }
    if (statusEl) statusEl.textContent = '📍 Requesting location...';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLocation = pos.coords;
        if (statusEl) statusEl.innerHTML = `✅ Location detected: <strong>${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°W</strong>`;
      },
      (err) => {
        this.locationError = err.message;
        if (statusEl) statusEl.innerHTML = `⚠️ Location access denied. <strong>In a real emergency, always call 911.</strong>`;
      },
      { timeout: 8000 }
    );
  },

  bindEvents() {
    const sosBtn = document.getElementById('main-sos-trigger-btn');
    sosBtn?.addEventListener('click', () => this.showConfirmation());

    document.getElementById('sos-confirm-activate')?.addEventListener('click', () => this.activateSOS());
    document.getElementById('sos-cancel-btn')?.addEventListener('click', () => {
      document.getElementById('sos-confirm-modal')?.classList.remove('active');
    });
  },

  showConfirmation() {
    document.getElementById('sos-confirm-modal')?.classList.add('active');
  },

  activateSOS() {
    document.getElementById('sos-confirm-modal')?.classList.remove('active');

    const statusEl = document.getElementById('sos-activation-status');
    if (statusEl) {
      statusEl.style.display = 'block';
      statusEl.innerHTML = `
        <div style="background:rgba(244,63,94,0.12); border:1px solid var(--rose-500); border-radius:12px; padding:16px; text-align:center;">
          <div style="font-size:1.5rem; margin-bottom:6px;">🚨</div>
          <strong style="color:var(--rose-500);">SOS ACTIVATED</strong><br>
          <p style="font-size:0.82rem; margin-top:6px; color:var(--text-secondary);">
            Your Emergency Medical Pass and location have been prepared for sharing.<br><br>
            <strong>⚠️ Important:</strong> This app cannot directly place calls or send SMS. To summon emergency services, please:<br>
            <strong>• Call 911 (or your local emergency number)</strong><br>
            • Show your QR Medical Pass to first responders<br>
            • Share your location manually if needed
          </p>
          <div style="display:flex; gap:8px; justify-content:center; margin-top:12px; flex-wrap:wrap;">
            <a href="tel:911" class="btn btn-danger btn-sm">📞 Call 911</a>
            <button class="btn btn-secondary btn-sm" onclick="window.appNav('vault')">🪪 View Medical Pass</button>
          </div>
        </div>
      `;
    }
  },

  renderHospitals() {
    const container = document.getElementById('nearby-hospitals-list');
    if (!container) return;

    container.innerHTML = `
      <div style="font-size:0.78rem; color:var(--amber-500); background:var(--amber-bg); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:8px; margin-bottom:10px;">
        📍 <strong>Demo Data:</strong> These are simulated nearby facilities. Connect a real Maps API for live results.
      </div>
    ` + this.nearbyHospitals.map(h => `
      <div class="hospital-card">
        <div style="font-size:1.6rem; flex-shrink:0;">${h.type.split(' ')[0]}</div>
        <div style="flex:1; min-width:0;">
          <strong style="font-size:0.9rem;">${h.name}</strong>
          <div style="font-size:0.76rem; color:var(--text-muted);">${h.level}</div>
          <div style="font-size:0.76rem; color:var(--text-secondary); margin-top:2px;">📍 ${h.address} • <strong style="color:var(--sky-500);">${h.distance}</strong></div>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px; flex-shrink:0;">
          <a href="tel:${h.phone.replace(/\D/g,'')}" class="btn btn-sm btn-danger">Call ER</a>
          <a href="https://www.google.com/maps/search/${encodeURIComponent(h.address)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary">Directions</a>
        </div>
      </div>
    `).join('');
  }
};
