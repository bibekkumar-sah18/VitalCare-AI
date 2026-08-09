/* ==========================================
   VITALCARE AI - USER DATA & PROFILE MANAGER
   ========================================== */

export const UserStore = {
  // Default fallback user profile if not onboarded yet
  defaultProfile: {
    fullName: 'Alex Miller',
    email: 'alex.miller@vitalcare.ai',
    dob: '1992-11-14',
    age: 33,
    gender: 'Male',
    heightCm: 178,
    weightKg: 74,
    bmi: 23.4,
    bmiCategory: 'Normal Weight',
    medicalHistory: ['Mild Hypertension', 'Asthma in childhood'],
    allergies: ['Penicillin', 'Dust Mites'],
    lifestyle: {
      activity: 'Moderately Active (3-4x/wk)',
      smoking: 'Non-Smoker',
      alcohol: 'Occasional (1-2 drinks/wk)',
      sleepHours: 7.5
    },
    medications: [
      { name: 'Omega-3 Fatty Acid', dose: '1000mg', freq: 'Daily' },
      { name: 'Vitamin D3', dose: '2000 IU', freq: 'Daily' },
      { name: 'Magnesium Glycinate', dose: '200mg', freq: 'Bedtime' }
    ],
    emergencyContacts: [
      { name: 'Elena Miller', relation: 'Spouse', phone: '(555) 019-2831' }
    ]
  },

  getProfile() {
    const saved = localStorage.getItem('vc_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return this.defaultProfile;
      }
    }
    return this.defaultProfile;
  },

  saveProfile(profileData) {
    const current = this.getProfile();
    const updated = { ...current, ...profileData };

    // Auto calculate BMI if height & weight provided
    if (updated.heightCm && updated.weightKg) {
      const hMeters = updated.heightCm / 100;
      const bmiVal = (updated.weightKg / (hMeters * hMeters)).toFixed(1);
      updated.bmi = parseFloat(bmiVal);
      
      if (updated.bmi < 18.5) updated.bmiCategory = 'Underweight';
      else if (updated.bmi < 25.0) updated.bmiCategory = 'Normal Weight';
      else if (updated.bmi < 30.0) updated.bmiCategory = 'Overweight';
      else updated.bmiCategory = 'Obese';
    }

    localStorage.setItem('vc_user_profile', JSON.stringify(updated));
    return updated;
  },

  calculateBmi(heightCm, weightKg) {
    if (!heightCm || !weightKg) return { bmi: 22.0, category: 'Normal Weight' };
    const hMeters = heightCm / 100;
    const bmiVal = (weightKg / (hMeters * hMeters)).toFixed(1);
    const num = parseFloat(bmiVal);

    let category = 'Normal Weight';
    if (num < 18.5) category = 'Underweight';
    else if (num < 25.0) category = 'Normal Weight';
    else if (num < 30.0) category = 'Overweight';
    else category = 'Obese';

    return { bmi: num, category };
  },

  getSymptomHistory() {
    const saved = localStorage.getItem('vc_symptom_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      {
        date: '2026-08-01',
        symptom: 'Mild headache behind eyes',
        urgency: 'routine',
        urgencyLabel: 'Routine Consult',
        recommendation: 'Hydration and rest in a dim room'
      }
    ];
  },

  addSymptomHistory(item) {
    const history = this.getSymptomHistory();
    history.unshift(item);
    localStorage.setItem('vc_symptom_history', JSON.stringify(history));
  }
};
