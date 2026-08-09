/* ==========================================
   VITALCARE AI - TELEHEALTH & CONSULTATION MODULE
   ========================================== */

export const TelehealthModule = {
  doctors: [
    {
      id: 'doc-1',
      name: 'Dr. Sarah Jenkins',
      title: 'MD, FACC - Senior Cardiologist',
      specialty: 'cardiology',
      rating: '4.95',
      reviews: 142,
      exp: '14 Yrs Exp',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
      nextSlot: 'Today, 4:30 PM',
      fee: '$45 (Insurance Covered)'
    },
    {
      id: 'doc-2',
      name: 'Dr. Marcus Vance',
      title: 'MD - Clinical Neurologist',
      specialty: 'neurology',
      rating: '4.91',
      reviews: 98,
      exp: '11 Yrs Exp',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
      nextSlot: 'Today, 5:15 PM',
      fee: '$50'
    },
    {
      id: 'doc-3',
      name: 'Dr. Elena Rostova',
      title: 'MD - Primary Care & Internal Med',
      specialty: 'primary',
      rating: '4.98',
      reviews: 210,
      exp: '16 Yrs Exp',
      avatar: 'https://images.unsplash.com/photo-1594824813566-78a1ed649514?auto=format&fit=crop&w=300&q=80',
      nextSlot: 'Tomorrow, 9:00 AM',
      fee: '$35'
    },
    {
      id: 'doc-4',
      name: 'Dr. Aris Thorne',
      title: 'MD, FAAD - Dermatologist',
      specialty: 'dermatology',
      rating: '4.88',
      reviews: 84,
      exp: '9 Yrs Exp',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
      nextSlot: 'Tomorrow, 11:30 AM',
      fee: '$40'
    }
  ],

  selectedDoc: null,
  callTimer: null,
  callSeconds: 0,
  isMuted: false,
  isVideoOff: false,

  init() {
    this.renderDoctors('all');
    this.bindEvents();
  },

  bindEvents() {
    const chips = document.querySelectorAll('.specialty-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const spec = chip.dataset.specialty;
        this.renderDoctors(spec);
      });
    });

    // Close booking modal
    const closeBookingBtn = document.getElementById('close-booking-modal');
    if (closeBookingBtn) {
      closeBookingBtn.addEventListener('click', () => this.closeBookingModal());
    }

    // Confirm Booking
    const confirmBookingBtn = document.getElementById('confirm-booking-btn');
    if (confirmBookingBtn) {
      confirmBookingBtn.addEventListener('click', () => this.handleConfirmBooking());
    }

    // Join video call buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.join-telehealth-btn')) {
        this.openVideoRoom('Dr. Sarah Jenkins');
      }
    });

    // Room control buttons
    const endCallBtn = document.getElementById('end-call-btn');
    if (endCallBtn) {
      endCallBtn.addEventListener('click', () => this.endCall());
    }

    const muteBtn = document.getElementById('toggle-mute-btn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        this.isMuted = !this.isMuted;
        muteBtn.style.background = this.isMuted ? 'var(--rose-600)' : '#334155';
      });
    }

    const camBtn = document.getElementById('toggle-cam-btn');
    if (camBtn) {
      camBtn.addEventListener('click', () => {
        this.isVideoOff = !this.isVideoOff;
        camBtn.style.background = this.isVideoOff ? 'var(--rose-600)' : '#334155';
      });
    }
  },

  renderDoctors(specialty) {
    const grid = document.getElementById('doctors-grid-container');
    if (!grid) return;

    const list = specialty === 'all' 
      ? this.doctors 
      : this.doctors.filter(d => d.specialty === specialty);

    grid.innerHTML = list.map(doc => `
      <div class="doctor-card">
        <div>
          <div class="doctor-card-top">
            <img src="${doc.avatar}" alt="${doc.name}" class="doctor-avatar" />
            <div class="doctor-info">
              <h3>${doc.name}</h3>
              <div class="doctor-specialty">${doc.title}</div>
              <div class="doctor-meta">
                <span class="rating-badge">★ ${doc.rating} (${doc.reviews})</span>
                <span>•</span>
                <span>${doc.exp}</span>
              </div>
            </div>
          </div>
          
          <div class="next-slot-pill">
            <span>⚡ Next Slot:</span>
            <strong>${doc.nextSlot}</strong>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
          <span style="font-weight:700; font-size:0.9rem; color:var(--text-primary);">${doc.fee}</span>
          <button class="btn btn-primary btn-sm book-doc-btn" onclick="window.openDocModal('${doc.id}')">
            Book Consult
          </button>
        </div>
      </div>
    `).join('');
  },

  openBookingModal(docId) {
    this.selectedDoc = this.doctors.find(d => d.id === docId) || this.doctors[0];
    const modal = document.getElementById('booking-modal-overlay');
    if (!modal) return;

    document.getElementById('booking-doc-name').textContent = this.selectedDoc.name;
    document.getElementById('booking-doc-title').textContent = this.selectedDoc.title;
    document.getElementById('booking-doc-avatar').src = this.selectedDoc.avatar;

    modal.classList.add('active');
  },

  closeBookingModal() {
    const modal = document.getElementById('booking-modal-overlay');
    if (modal) modal.classList.remove('active');
  },

  handleConfirmBooking() {
    this.closeBookingModal();

    // Show toast or alert banner
    const banner = document.getElementById('telehealth-upcoming-banner');
    if (banner) {
      banner.style.display = 'flex';
      banner.scrollIntoView({ behavior: 'smooth' });
    }

    alert(`Consultation booked with ${this.selectedDoc.name} for Today at 4:30 PM!`);
  },

  openVideoRoom(docName = 'Dr. Sarah Jenkins') {
    const room = document.getElementById('telehealth-room-overlay');
    if (!room) return;

    room.classList.add('active');
    document.getElementById('room-doc-name').textContent = docName;

    // Start timer
    this.callSeconds = 0;
    this.callTimer = setInterval(() => {
      this.callSeconds++;
      const mins = String(Math.floor(this.callSeconds / 60)).padStart(2, '0');
      const secs = String(this.callSeconds % 60).padStart(2, '0');
      const timerEl = document.getElementById('call-timer-display');
      if (timerEl) timerEl.textContent = `${mins}:${secs}`;
    }, 1000);
  },

  endCall() {
    clearInterval(this.callTimer);
    const room = document.getElementById('telehealth-room-overlay');
    if (room) room.classList.remove('active');
  }
};
