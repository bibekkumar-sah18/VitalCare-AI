/* ==========================================
   VITALCARE AI - MULTI-STEP HEALTH ONBOARDING
   ========================================== */

import { UserStore } from './user-data.js';

export const OnboardingWizard = {
  currentStep: 1,
  totalSteps: 6,

  init() {
    this.bindEvents();
    this.updateProgress();
  },

  bindEvents() {
    const nextBtn = document.getElementById('onboarding-next-btn');
    const prevBtn = document.getElementById('onboarding-prev-btn');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.handleNextStep());
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.handlePrevStep());
    }

    // Live BMI calculation on height & weight inputs
    const heightInput = document.getElementById('ob-height');
    const weightInput = document.getElementById('ob-weight');

    if (heightInput && weightInput) {
      const calcHandler = () => {
        const h = parseFloat(heightInput.value);
        const w = parseFloat(weightInput.value);
        const bmiEl = document.getElementById('ob-bmi-display');

        if (h && w) {
          const res = UserStore.calculateBmi(h, w);
          if (bmiEl) {
            bmiEl.innerHTML = `Calculated BMI: <strong>${res.bmi}</strong> (${res.category})`;
          }
        }
      };

      heightInput.addEventListener('input', calcHandler);
      weightInput.addEventListener('input', calcHandler);
    }
  },

  handleNextStep() {
    if (!this.validateStep(this.currentStep)) return;

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.showStep(this.currentStep);
    } else {
      // Final Submit & Save
      this.saveOnboardingData();
      alert('🎉 Health Profile Onboarding Complete! Redirecting to your Personalized Dashboard.');
      window.appNav('dashboard');
    }
  },

  handlePrevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.showStep(this.currentStep);
    }
  },

  showStep(stepNum) {
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));

    const activeEl = document.getElementById(`ob-step-${stepNum}`);
    if (activeEl) activeEl.classList.add('active');

    this.updateProgress();
  },

  updateProgress() {
    const pct = Math.round((this.currentStep / this.totalSteps) * 100);
    const fillBar = document.getElementById('onboarding-progress-fill');
    const label = document.getElementById('onboarding-step-label');
    const prevBtn = document.getElementById('onboarding-prev-btn');
    const nextBtn = document.getElementById('onboarding-next-btn');

    if (fillBar) fillBar.style.width = `${pct}%`;
    if (label) label.textContent = `Step ${this.currentStep} of ${this.totalSteps} (${pct}%)`;

    if (prevBtn) prevBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.textContent = this.currentStep === this.totalSteps ? 'Complete & Launch Dashboard' : 'Next Step →';
  },

  validateStep(stepNum) {
    if (stepNum === 1) {
      const name = document.getElementById('ob-fullname').value.trim();
      const dob = document.getElementById('ob-dob').value;
      if (!name || !dob) {
        alert('Please enter your Full Name and Date of Birth to proceed.');
        return false;
      }
    }
    return true;
  },

  saveOnboardingData() {
    const data = {
      fullName: document.getElementById('ob-fullname').value.trim() || 'Alex Miller',
      dob: document.getElementById('ob-dob').value || '1992-11-14',
      gender: document.getElementById('ob-gender').value,
      heightCm: parseFloat(document.getElementById('ob-height').value) || 178,
      weightKg: parseFloat(document.getElementById('ob-weight').value) || 74,
      medicalHistory: [document.getElementById('ob-history').value].filter(Boolean),
      allergies: [document.getElementById('ob-allergies').value].filter(Boolean),
      lifestyle: {
        activity: document.getElementById('ob-activity').value,
        smoking: document.getElementById('ob-smoking').value,
        alcohol: document.getElementById('ob-alcohol').value,
        sleepHours: parseFloat(document.getElementById('ob-sleep').value) || 7.5
      },
      medications: [
        {
          name: document.getElementById('ob-med-name').value || 'Omega-3 Fatty Acid',
          dose: document.getElementById('ob-med-dose').value || '1000mg',
          freq: 'Daily'
        }
      ],
      emergencyContacts: [
        {
          name: document.getElementById('ob-emergency-name').value || 'Elena Miller',
          relation: document.getElementById('ob-emergency-relation').value || 'Spouse',
          phone: document.getElementById('ob-emergency-phone').value || '(555) 019-2831'
        }
      ]
    };

    UserStore.saveProfile(data);
  }
};
