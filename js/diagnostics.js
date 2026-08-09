/* ==========================================
   VITALCARE AI - DIAGNOSTICS & EMERGENCY VAULT
   ========================================== */

import { VitalsEngine } from './vitals-chart.js';

export const DiagnosticsModule = {
  init() {
    this.bindTimeframeButtons();
    this.bindLabScanner();
    this.bindEmergencyPass();
  },

  bindTimeframeButtons() {
    const btns = document.querySelectorAll('#view-diagnostics .tf-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tf = btn.dataset.tf;
        VitalsEngine.renderMainChart(tf, 'heartRate');
      });
    });
  },

  bindLabScanner() {
    const dropzone = document.getElementById('lab-dropzone');
    const fileInput = document.getElementById('lab-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.simulateLabScan(e.target.files[0].name);
        }
      });

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--sky-600)';
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = 'var(--sky-500)';
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--sky-500)';
        if (e.dataTransfer.files.length > 0) {
          this.simulateLabScan(e.dataTransfer.files[0].name);
        }
      });
    }
  },

  simulateLabScan(filename) {
    const statusText = document.getElementById('upload-status-text');
    if (statusText) {
      statusText.innerHTML = `
        <span style="color:var(--sky-600); font-weight:700;">Scanning "${filename}" with VitalCare AI OCR...</span>
      `;
    }

    setTimeout(() => {
      if (statusText) {
        statusText.innerHTML = `
          <span style="color:var(--emerald-600); font-weight:700;">✓ Extraction Complete: 4 Key Biomarkers Identified</span>
        `;
      }

      const resultsGrid = document.getElementById('lab-results-grid');
      if (resultsGrid) {
        resultsGrid.style.display = 'grid';
        resultsGrid.innerHTML = `
          <div class="marker-card">
            <div class="marker-header">
              <span class="marker-name">HbA1c (Glycated Hgb)</span>
              <span class="chip chip-normal">5.6% (Normal)</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted);">Ref: &lt; 5.7% (Optimal Fasting Glucose control)</div>
            <div class="marker-range-bar"><div class="marker-fill-pin" style="width: 55%;"></div></div>
          </div>

          <div class="marker-card">
            <div class="marker-header">
              <span class="marker-name">Total Cholesterol</span>
              <span class="chip chip-normal">185 mg/dL</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted);">Ref: 125 - 200 mg/dL</div>
            <div class="marker-range-bar"><div class="marker-fill-pin" style="width: 65%;"></div></div>
          </div>

          <div class="marker-card">
            <div class="marker-header">
              <span class="marker-name">LDL Cholesterol</span>
              <span class="chip chip-warning">118 mg/dL</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted);">Ref: &lt; 100 mg/dL (Slightly Elevated)</div>
            <div class="marker-range-bar"><div class="marker-fill-pin warning" style="width: 78%;"></div></div>
          </div>

          <div class="marker-card">
            <div class="marker-header">
              <span class="marker-name">WBC (White Blood Cells)</span>
              <span class="chip chip-normal">6.8 K/uL</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted);">Ref: 4.5 - 11.0 K/uL</div>
            <div class="marker-range-bar"><div class="marker-fill-pin" style="width: 50%;"></div></div>
          </div>
        `;
      }
    }, 1500);
  },

  bindEmergencyPass() {
    const openPassBtn = document.getElementById('open-emergency-pass-btn');
    const closePassBtn = document.getElementById('close-emergency-pass-modal');
    const modal = document.getElementById('emergency-pass-modal');

    if (openPassBtn && modal) {
      openPassBtn.addEventListener('click', () => modal.classList.add('active'));
    }

    if (closePassBtn && modal) {
      closePassBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
  }
};
