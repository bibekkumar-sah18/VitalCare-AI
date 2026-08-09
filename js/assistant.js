/* ==========================================
   VITALCARE AI - ASSISTANT CHATBOT ENGINE
   ========================================== */

export const VitalAssistant = {
  knowledgeBase: {
    lipid: {
      match: ['lipid', 'cholesterol', 'hba1c', 'lab'],
      response: `<strong>Understanding Your Lab Results:</strong><br><br>
        • <strong>HbA1c (5.6%):</strong> Indicates optimal long-term fasting blood sugar control (&lt; 5.7% is normal).<br>
        • <strong>Total Cholesterol (185 mg/dL):</strong> Well within the desirable range (under 200 mg/dL).<br>
        • <strong>LDL Cholesterol (118 mg/dL):</strong> Slightly elevated above the 100 mg/dL threshold. Increasing dietary soluble fiber (oats, legumes) and aerobic exercise can help lower LDL.`
    },
    metformin: {
      match: ['metformin', 'side effect', 'medication', 'dosage'],
      response: `<strong>Medication Guidance — Metformin:</strong><br><br>
        • <strong>Primary Purpose:</strong> Used to manage blood glucose levels in Type 2 Diabetes & Insulin Resistance.<br>
        • <strong>Common Side Effects:</strong> Mild nausea or stomach upset when starting. Taking it with meals minimizes gastrointestinal discomfort.<br>
        • <strong>Key Precaution:</strong> Avoid excessive alcohol consumption while taking Metformin.`
    },
    heart: {
      match: ['resting heart rate', 'bpm', 'pulse', 'normal heart rate'],
      response: `<strong>Resting Heart Rate (RHR) Reference:</strong><br><br>
        • <strong>Normal Adult RHR:</strong> 60 to 100 Beats Per Minute (BPM).<br>
        • <strong>Athletic / Optimal RHR:</strong> 50 to 65 BPM.<br>
        • <strong>Your Current Stream:</strong> Your synced watch reports an average RHR of <strong>72 BPM</strong>, which is in the healthy normal range.`
    }
  },

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const sendBtn = document.getElementById('assistant-send-btn');
    const inputEl = document.getElementById('assistant-input');

    if (sendBtn && inputEl) {
      sendBtn.addEventListener('click', () => this.handleSendMessage());
      inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleSendMessage();
      });
    }

    const promptChips = document.querySelectorAll('.assistant-prompt-chip');
    promptChips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (inputEl) {
          inputEl.value = chip.textContent;
          this.handleSendMessage();
        }
      });
    });
  },

  handleSendMessage() {
    const inputEl = document.getElementById('assistant-input');
    const text = inputEl.value.trim();
    if (!text) return;

    this.appendUserMessage(text);
    inputEl.value = '';

    this.showTypingIndicator();

    setTimeout(() => {
      this.removeTypingIndicator();
      this.generateAIResponse(text);
    }, 1100);
  },

  appendUserMessage(text) {
    const container = document.getElementById('assistant-messages-container');
    if (!container) return;

    const wrap = document.createElement('div');
    wrap.className = 'chat-bubble-wrap user';
    wrap.innerHTML = `<div class="chat-bubble">${this.escapeHtml(text)}</div>`;
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
  },

  showTypingIndicator() {
    const container = document.getElementById('assistant-messages-container');
    if (!container) return;

    const wrap = document.createElement('div');
    wrap.id = 'assistant-typing';
    wrap.className = 'chat-bubble-wrap ai';
    wrap.innerHTML = `
      <div class="ai-avatar-badge" style="width:28px;height:28px;font-size:0.7rem;">VC</div>
      <div class="typing-dots">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
  },

  removeTypingIndicator() {
    const el = document.getElementById('assistant-typing');
    if (el) el.remove();
  },

  generateAIResponse(query) {
    const container = document.getElementById('assistant-messages-container');
    if (!container) return;

    const qLower = query.toLowerCase();
    let replyText = `I have analyzed your query regarding <strong>"${this.escapeHtml(query)}"</strong>. Based on standard clinical reference guidelines, maintain a balanced diet, regular hydration, and routine check-ups.`;

    for (const key in this.knowledgeBase) {
      const kb = this.knowledgeBase[key];
      if (kb.match.some(m => qLower.includes(m))) {
        replyText = kb.response;
        break;
      }
    }

    const wrap = document.createElement('div');
    wrap.className = 'chat-bubble-wrap ai';
    wrap.innerHTML = `
      <div class="ai-avatar-badge" style="width:32px;height:32px;font-size:0.75rem;">VC</div>
      <div class="chat-bubble">
        <p>${replyText}</p>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:8px; border-top:1px solid var(--border-light); padding-top:4px;">
          ⚠️ <em>AI-assisted reference response. Not a medical diagnosis.</em>
        </div>
      </div>
    `;

    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
  },

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
};
