/* ==========================================
   VITALCARE AI - HEALTH RISK ANALYTICS ENGINE
   ========================================== */

import { UserStore } from './user-data.js';

export const RiskEngine = {
  renderRiskDashboard() {
    const profile = UserStore.getProfile();
    const bmi = profile.bmi || 23.4;
    const age = profile.age || 33;
    const history = profile.medicalHistory || [];
    const lifestyle = profile.lifestyle || {};

    // Risk scoring logic
    let cvRisk = 12; // Base baseline low risk %
    let diabetesRisk = 14;
    let lifestyleRisk = 18;

    if (bmi > 25.0) { cvRisk += 8; diabetesRisk += 12; }
    if (bmi > 30.0) { cvRisk += 14; diabetesRisk += 18; }
    if (age > 45) { cvRisk += 10; diabetesRisk += 10; }

    if (history.some(h => h.toLowerCase().includes('hypertension'))) cvRisk += 12;
    if (lifestyle.smoking === 'Smoker') { cvRisk += 20; lifestyleRisk += 25; }
    if (lifestyle.sleepHours && lifestyle.sleepHours < 6) lifestyleRisk += 15;

    const overallScore = Math.max(60, Math.min(98, 100 - Math.round((cvRisk + diabetesRisk + lifestyleRisk) / 3)));

    // Render elements
    const scoreValEl = document.getElementById('risk-overall-score');
    if (scoreValEl) scoreValEl.textContent = overallScore;

    const cvEl = document.getElementById('risk-cv-val');
    if (cvEl) cvEl.textContent = `${cvRisk}%`;

    const diabEl = document.getElementById('risk-diab-val');
    if (diabEl) diabEl.textContent = `${diabetesRisk}%`;

    const lifeEl = document.getElementById('risk-life-val');
    if (lifeEl) lifeEl.textContent = `${lifestyleRisk}%`;

    // Render Factors Breakdown
    const factorsContainer = document.getElementById('risk-factors-container');
    if (factorsContainer) {
      factorsContainer.innerHTML = `
        <div class="factor-item positive">
          <div>
            <strong style="font-size:0.9rem;">Normal BMI Index (${bmi})</strong>
            <p style="font-size:0.78rem; color:var(--text-muted);">Maintains healthy weight-to-height proportion</p>
          </div>
          <span class="chip chip-normal">Protective</span>
        </div>

        <div class="factor-item positive">
          <div>
            <strong style="font-size:0.9rem;">Non-Smoker Status</strong>
            <p style="font-size:0.78rem; color:var(--text-muted);">Zero tobacco cardiotoxicity exposure</p>
          </div>
          <span class="chip chip-normal">Protective</span>
        </div>

        <div class="factor-item negative">
          <div>
            <strong style="font-size:0.9rem;">Past Mild Hypertension History</strong>
            <p style="font-size:0.78rem; color:var(--text-muted);">Slight elevation in arterial strain baseline</p>
          </div>
          <span class="chip chip-warning">+12% Risk</span>
        </div>
      `;
    }
  }
};
