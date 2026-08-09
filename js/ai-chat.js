/* ==========================================
   VITALCARE AI - AI COPILOT & CLINICAL TRIAGE
   ========================================== */

import { UserStore } from './user-data.js';

export const AICopilot = {
  selectedBodyPart: 'head',
  
  symptomDatabase: {
    head: {
      title: 'Head & Neurological',
      prompts: ['Sharp headache behind eyes', 'Dizziness when standing', 'Tension headache & neck stiffness'],
      botResponse: {
        text: 'Based on your reported symptoms in the **Head & Neurological** region, this may indicate a tension headache, ocular strain, or early migraine onset.',
        urgency: 'routine',
        urgencyLabel: 'Routine Consult (Low Risk)',
        possibilities: [
          { name: 'Tension Headache', pct: '68%' },
          { name: 'Dehydration / Eyestrain', pct: '22%' },
          { name: 'Migraine Aura', pct: '10%' }
        ],
        recommendation: 'Rest in a dim room, maintain hydration (500ml water), and track symptoms. If accompanied by blurred vision or numbness, consult a neurologist immediately.'
      }
    },
    chest: {
      title: 'Chest & Cardiovascular',
      prompts: ['Mild chest tightness after exercise', 'Palpitations / irregular flutter', 'Shortness of breath with fatigue'],
      botResponse: {
        text: 'Symptoms in the **Chest & Cardiovascular** area require prompt evaluation. While exercise-induced tightness can be muscular, cardiovascular risk factors must be ruled out.',
        urgency: 'urgent',
        urgencyLabel: 'Urgent Care Priority',
        possibilities: [
          { name: 'Intercostal Muscle Strain', pct: '52%' },
          { name: 'Esophageal Reflux / GERD', pct: '28%' },
          { name: 'Cardiovascular Exertional Stress', pct: '20%' }
        ],
        recommendation: 'Refrain from heavy physical exertion. We recommend booking an immediate 15-min Telehealth consultation with Dr. Sarah Jenkins (Cardiology).'
      }
    },
    abdomen: {
      title: 'Abdomen & Digestive',
      prompts: ['Upper stomach bloating after meals', 'Sharp lower right abdomen pain', 'Acid reflux & nausea'],
      botResponse: {
        text: 'Your report of **Abdominal** discomfort points primarily to digestive distress or mild gastritis.',
        urgency: 'routine',
        urgencyLabel: 'Routine Consult',
        possibilities: [
          { name: 'Acute Gastritis / Indigestion', pct: '65%' },
          { name: 'Irritable Bowel Flare', pct: '25%' },
          { name: 'Gallbladder / Biliary Sensitivity', pct: '10%' }
        ],
        recommendation: 'Consume light, non-spicy meals. If pain migrates to the lower right quadrant or is accompanied by high fever, seek emergency evaluation.'
      }
    },
    skin: {
      title: 'Skin & Dermatology',
      prompts: ['Itchy red rash on arms', 'Dry scaly patches', 'Sudden allergic hives'],
      botResponse: {
        text: 'The **Dermatological** symptoms described align with contact dermatitis or localized eczema.',
        urgency: 'routine',
        urgencyLabel: 'Self-Care / Routine',
        possibilities: [
          { name: 'Contact Dermatitis', pct: '74%' },
          { name: 'Eczema Flare-up', pct: '18%' },
          { name: 'Mild Urticaria (Hives)', pct: '8%' }
        ],
        recommendation: 'Apply cool compresses and fragrance-free moisturizer. Avoid harsh soaps. You can upload a photo in the Diagnostics tab for AI dermal analysis.'
      }
    }
  },

  init() {
    this.bindEvents();
    this.renderHistory();
  },

  bindEvents() {
    const bodyBtns = document.querySelectorAll('.body-part-btn');
    bodyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const part = btn.dataset.part;
        this.setBodyPart(part);
      });
    });

    const sendBtn = document.getElementById('send-chat-btn');
    const inputEl = document.getElementById('chat-input-field');

    if (sendBtn && inputEl) {
      sendBtn.addEventListener('click', () => this.handleSendMessage());
      inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleSendMessage();
      });
    }

    // Severity Slider Label Update
    const severityInput = document.getElementById('symptom-severity-slider');
    const severityVal = document.getElementById('severity-val-display');

    if (severityInput && severityVal) {
      severityInput.addEventListener('input', () => {
        severityVal.textContent = severityInput.value;
      });
    }

    const quickPrompts = document.querySelectorAll('.quick-prompt-chip');
    quickPrompts.forEach(chip => {
      chip.addEventListener('click', () => {
        if (inputEl) {
          inputEl.value = chip.textContent;
          this.handleSendMessage();
        }
      });
    });
  },

  setBodyPart(part) {
    this.selectedBodyPart = part;

    document.querySelectorAll('.body-part-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.part === part);
    });

    const info = this.symptomDatabase[part] || this.symptomDatabase.head;
    const promptsWrap = document.getElementById('quick-prompts-container');
    if (promptsWrap) {
      promptsWrap.innerHTML = info.prompts.map(p => `
        <button class="quick-prompt-chip">${p}</button>
      `).join('');

      promptsWrap.querySelectorAll('.quick-prompt-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const inputEl = document.getElementById('chat-input-field');
          if (inputEl) {
            inputEl.value = chip.textContent;
            this.handleSendMessage();
          }
        });
      });
    }
  },

  handleSendMessage() {
    const inputEl = document.getElementById('chat-input-field');
    const msg = inputEl.value.trim();
    if (!msg) return;

    this.appendUserMessage(msg);
    inputEl.value = '';

    this.showTypingIndicator();

    setTimeout(() => {
      this.removeTypingIndicator();
      this.generateAIResponse(msg);
    }, 1200);
  },

  appendUserMessage(text) {
    const chatContainer = document.getElementById('chat-messages-container');
    if (!chatContainer) return;

    const wrap = document.createElement('div');
    wrap.className = 'chat-bubble-wrap user';
    wrap.innerHTML = `<div class="chat-bubble">${this.escapeHtml(text)}</div>`;
    chatContainer.appendChild(wrap);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  },

  showTypingIndicator() {
    const chatContainer = document.getElementById('chat-messages-container');
    if (!chatContainer) return;

    const wrap = document.createElement('div');
    wrap.id = 'typing-indicator-wrap';
    wrap.className = 'chat-bubble-wrap ai';
    wrap.innerHTML = `
      <div class="ai-avatar-badge" style="width:28px;height:28px;font-size:0.7rem;">AI</div>
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    chatContainer.appendChild(wrap);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  },

  removeTypingIndicator() {
    const el = document.getElementById('typing-indicator-wrap');
    if (el) el.remove();
  },

  generateAIResponse(userText) {
    const chatContainer = document.getElementById('chat-messages-container');
    if (!chatContainer) return;

    const info = this.symptomDatabase[this.selectedBodyPart] || this.symptomDatabase.head;
    const res = info.botResponse;

    const wrap = document.createElement('div');
    wrap.className = 'chat-bubble-wrap ai';
    wrap.innerHTML = `
      <div class="ai-avatar-badge" style="width:32px;height:32px;font-size:0.75rem;">AI</div>
      <div class="chat-bubble">
        <p>${res.text}</p>
        
        <div class="triage-assessment-box">
          <div class="triage-urgency-badge ${res.urgency}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
            ${res.urgencyLabel}
          </div>

          <p style="font-size:0.8rem; font-weight:700; margin-bottom:6px; color:var(--text-primary);">Matched Differentials:</p>
          <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:10px;">
            ${res.possibilities.map(item => `
              <div style="display:flex; justify-content:space-between; font-size:0.78rem;">
                <span>${item.name}</span>
                <span style="font-weight:700; color:var(--sky-600);">${item.pct}</span>
              </div>
            `).join('')}
          </div>

          <p style="font-size:0.78rem; color:var(--text-secondary); line-height:1.4;">
            <strong>Recommendation:</strong> ${res.recommendation}
          </p>

          <div style="margin-top:8px; padding-top:6px; border-top:1px solid var(--border-light); font-size:0.72rem; color:var(--text-muted);">
            ⚠️ <em>AI-assisted triage estimate. Not a medical diagnosis.</em>
          </div>

          <button class="btn btn-primary btn-sm" style="margin-top:10px; width:100%;" onclick="window.appNav('telehealth')">
            Book Specialist Consultation
          </button>
        </div>
      </div>
    `;

    chatContainer.appendChild(wrap);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Save into history log
    UserStore.addSymptomHistory({
      date: new Date().toISOString().split('T')[0],
      symptom: userText,
      urgency: res.urgency,
      urgencyLabel: res.urgencyLabel,
      recommendation: res.recommendation
    });

    this.renderHistory();
  },

  renderHistory() {
    const container = document.getElementById('symptom-history-log-container');
    if (!container) return;

    const history = UserStore.getSymptomHistory();
    container.innerHTML = history.map(item => `
      <div style="background:var(--bg-surface-elevated); padding:10px 14px; border-radius:var(--radius-md); font-size:0.8rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <strong style="color:var(--text-primary);">${this.escapeHtml(item.symptom)}</strong>
          <span class="chip chip-${item.urgency === 'routine' ? 'normal' : 'warning'}">${item.urgencyLabel}</span>
        </div>
        <div style="color:var(--text-muted); font-size:0.74rem;">Log Date: ${item.date}</div>
      </div>
    `).join('');
  },

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
};
