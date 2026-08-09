/* =====================================================
   VITALCARE AI — AUTH MODULE
   Single-card role-based authentication
   ===================================================== */

import { UserStore } from './user-data.js';

export const AuthModule = {
  /* ── State ───────────────────────────────────────── */
  currentUser:      null,
  activeRole:       'patient',   // 'patient' | 'admin'
  activeTab:        'signin',    // 'signin' | 'register'
  activeSection:    'patient',   // 'patient' | 'admin' | '2fa' | 'verify'
  adminAttempts:    0,
  adminLockUntil:   null,
  _pendingAdminEmail: null,
  _pendingAdminRemember: false,

  /* ── Session ─────────────────────────────────────── */
  checkSession() {
    const raw = localStorage.getItem('vc_session') || sessionStorage.getItem('vc_session');
    if (!raw) return null;
    try {
      this.currentUser = JSON.parse(raw);
      return this.currentUser;
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    const raw = localStorage.getItem('vc_session') || sessionStorage.getItem('vc_session');
    if (!raw) return false;
    try { JSON.parse(raw); return true; } catch { return false; }
  },

  getUserRole() {
    const raw = localStorage.getItem('vc_session') || sessionStorage.getItem('vc_session');
    if (!raw) return null;
    try { return JSON.parse(raw).role || null; } catch { return null; }
  },

  saveSession(user, remember) {
    const json = JSON.stringify(user);
    if (remember) localStorage.setItem('vc_session', json);
    else sessionStorage.setItem('vc_session', json);
    this.currentUser = user;
  },

  clearSession() {
    localStorage.removeItem('vc_session');
    sessionStorage.removeItem('vc_session');
    this.currentUser = null;
  },

  /* ── Init ────────────────────────────────────────── */
  init() {
    this.checkSession();
    this._bindAll();
    this._updateHeaderUI();
    // Reset to default state
    this.switchSection('patient');
    this.switchTab('signin');
    this.setRole('patient');
  },

  /* ── Role Switcher ──────────────────────────────── */
  setRole(role) {
    this.activeRole = role;

    // Update role button styles
    document.querySelectorAll('.role-pick-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === role);
    });

    // Clear all alerts
    this._clearAlerts();

    if (role === 'patient') {
      this.switchSection('patient');
    } else {
      this.switchSection('admin');
    }
  },

  /* ── Section Switcher ───────────────────────────── */
  switchSection(section) {
    this.activeSection = section;
    const sections = {
      'patient': document.getElementById('patient-auth-section'),
      'admin':   document.getElementById('admin-auth-section'),
      '2fa':     document.getElementById('admin-2fa-section'),
      'verify':  document.getElementById('email-verify-section'),
    };
    Object.entries(sections).forEach(([key, el]) => {
      if (el) el.style.display = key === section ? 'block' : 'none';
    });
    // Role picker only shows for patient/admin sections
    const picker = document.getElementById('auth-role-picker');
    if (picker) picker.style.display = (section === 'patient' || section === 'admin') ? 'flex' : 'none';
  },

  /* ── Tab Switcher (Patient: signin / register) ──── */
  switchTab(tab) {
    this.activeTab = tab;

    // Tab buttons
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Form views
    const signinView   = document.getElementById('patient-signin-view');
    const registerView = document.getElementById('patient-register-view');

    if (signinView)   signinView.style.display   = tab === 'signin'   ? 'block' : 'none';
    if (registerView) registerView.style.display = tab === 'register' ? 'block' : 'none';

    // Remove 'active' class from both, add to current
    [signinView, registerView].forEach(v => v?.classList.remove('active'));
    if (tab === 'signin')   signinView?.classList.add('active');
    if (tab === 'register') registerView?.classList.add('active');

    this._clearAlerts();
  },

  /* ── Bind All Events ─────────────────────────────── */
  _bindAll() {
    // Role picker buttons
    document.querySelectorAll('.role-pick-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setRole(btn.dataset.role));
    });

    // Patient tab buttons
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.tab) this.switchTab(btn.dataset.tab);
      });
    });

    // Bottom switch links ("Don't have an account? Create Account")
    document.querySelectorAll('.link-btn[data-switch-tab]').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.switchTab));
    });

    // Password eye toggles
    document.querySelectorAll('.password-eye-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const inp = btn.closest('.input-with-icon')?.querySelector('input');
        if (!inp) return;
        inp.type = inp.type === 'password' ? 'text' : 'password';
        btn.innerHTML = inp.type === 'text'
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
      });
    });

    // Patient Sign In form
    document.getElementById('form-patient-signin')?.addEventListener('submit', e => {
      e.preventDefault(); this._handlePatientSignIn();
    });

    // Patient Register form
    document.getElementById('form-patient-register')?.addEventListener('submit', e => {
      e.preventDefault(); this._handlePatientRegister();
    });

    // Admin Sign In form
    document.getElementById('form-admin-signin')?.addEventListener('submit', e => {
      e.preventDefault(); this._handleAdminSignIn();
    });

    // OTP form
    document.getElementById('form-admin-otp')?.addEventListener('submit', e => {
      e.preventDefault(); this._handleAdminOTP();
    });

    // Cancel 2FA
    document.getElementById('btn-cancel-2fa')?.addEventListener('click', () => {
      this.setRole('admin');
    });

    // Google auth
    document.getElementById('btn-google-auth')?.addEventListener('click', () => {
      this._handleGoogleAuth();
    });

    // Password strength meter
    document.getElementById('pr-password')?.addEventListener('input', e => {
      this._updateStrength(e.target.value);
    });

    // Forgot password
    ['open-forgot-modal', 'open-forgot-modal-admin'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => {
        const email = prompt('Enter your email address to receive a password reset link:');
        if (email && this._isEmail(email)) {
          alert(`✓ Password reset instructions sent to:\n${email}\n\nPlease check your inbox (and spam folder).`);
        } else if (email) {
          alert('Please enter a valid email address.');
        }
      });
    });

    // Demo verified button (email verification bypass)
    document.getElementById('btn-demo-verified')?.addEventListener('click', () => {
      window.appNav?.('onboarding');
    });

    // Resend verification
    document.getElementById('btn-resend-verify')?.addEventListener('click', e => {
      const btn = e.currentTarget;
      btn.textContent = '✓ Sent! Check your inbox.';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = 'Resend Verification Email'; btn.disabled = false; }, 6000);
    });

    // Back from verify
    document.getElementById('btn-back-from-verify')?.addEventListener('click', () => {
      this.setRole('patient');
      this.switchTab('signin');
    });

    // OTP digit inputs
    this._bindOTPInputs();

    // Logout buttons (any element with .logout-btn)
    document.querySelectorAll('.logout-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleLogout());
    });
  },

  /* ── Patient Sign In ─────────────────────────────── */
  _handlePatientSignIn() {
    const email    = document.getElementById('ps-email')?.value.trim();
    const password = document.getElementById('ps-password')?.value;
    const remember = document.getElementById('ps-remember')?.checked;
    const alert_   = document.getElementById('signin-alert');
    const btn      = document.getElementById('btn-patient-signin');

    this._clearAlerts();

    // Validation
    if (!email)                     { this._showAlert(alert_, 'Please enter your email address.', 'error'); return; }
    if (!this._isEmail(email))      { this._showAlert(alert_, 'Please enter a valid email address.', 'error'); return; }
    if (!password)                  { this._showAlert(alert_, 'Please enter your password.', 'error'); return; }
    if (password.length < 6)        { this._showAlert(alert_, 'Password must be at least 6 characters.', 'error'); return; }

    this._setLoading(btn, true, 'Signing in…');

    setTimeout(() => {
      // Demo: any valid email + password ≥ 6 chars = success
      const user = {
        email,
        name: this._nameFromEmail(email),
        role: 'patient',
        loginTime: new Date().toISOString(),
      };
      this.saveSession(user, remember);
      this._updateHeaderUI();
      this._showAlert(alert_, '✓ Welcome back! Redirecting to dashboard…', 'success');
      this._setLoading(btn, false, 'Sign In →');
      setTimeout(() => window.appNav?.('dashboard'), 1000);
    }, 900);
  },

  /* ── Patient Register ────────────────────────────── */
  _handlePatientRegister() {
    const name    = document.getElementById('pr-name')?.value.trim();
    const email   = document.getElementById('pr-email')?.value.trim();
    const pass    = document.getElementById('pr-password')?.value;
    const confirm = document.getElementById('pr-confirm')?.value;
    const consent = document.getElementById('pr-consent')?.checked;
    const alert_  = document.getElementById('register-alert');
    const btn     = document.getElementById('btn-patient-register');

    this._clearAlerts();

    if (!name)                       { this._showAlert(alert_, 'Please enter your full name.', 'error'); return; }
    if (!email || !this._isEmail(email)) { this._showAlert(alert_, 'Please enter a valid email address.', 'error'); return; }
    if (!pass || pass.length < 8)    { this._showAlert(alert_, 'Password must be at least 8 characters.', 'error'); return; }
    if (pass !== confirm)            { this._showAlert(alert_, 'Passwords do not match. Please re-enter.', 'error'); return; }
    if (!consent)                    { this._showAlert(alert_, 'Please accept the Terms & Privacy Policy to continue.', 'error'); return; }

    this._setLoading(btn, true, 'Creating account…');

    setTimeout(() => {
      // Save to UserStore for onboarding pre-fill
      try { UserStore.saveProfile({ fullName: name, email }); } catch {}

      const user = { email, name, role: 'patient', registeredAt: new Date().toISOString() };
      this.saveSession(user, true);

      // Show email verification step
      const verifyEl = document.getElementById('verify-email-display');
      if (verifyEl) verifyEl.textContent = email;

      this._setLoading(btn, false, 'Create Account →');
      this.switchSection('verify');
    }, 950);
  },

  /* ── Admin Sign In ───────────────────────────────── */
  _handleAdminSignIn() {
    const email    = document.getElementById('ad-email')?.value.trim();
    const password = document.getElementById('ad-password')?.value;
    const remember = document.getElementById('ad-remember')?.checked;
    const alert_   = document.getElementById('admin-alert');
    const btn      = document.getElementById('btn-admin-signin');

    this._clearAlerts();

    // Lockout check
    if (this.adminLockUntil && Date.now() < this.adminLockUntil) {
      const mins = Math.ceil((this.adminLockUntil - Date.now()) / 60000);
      this._showAlert(alert_, `Account locked. Try again in ${mins} minute(s). Contact IT if urgent.`, 'error');
      return;
    }

    if (!email)    { this._showAlert(alert_, 'Please enter your admin email or username.', 'error'); return; }
    if (!password) { this._showAlert(alert_, 'Please enter your password.', 'error'); return; }

    this._setLoading(btn, true, 'Verifying credentials…');

    setTimeout(() => {
      // Demo credentials: admin@vitalcare.ai / Admin@2026
      const valid = (email === 'admin@vitalcare.ai' || email === 'admin') && password === 'Admin@2026';

      if (!valid) {
        this.adminAttempts++;
        this._logAudit('ADMIN_LOGIN_FAILED', email, false);

        if (this.adminAttempts >= 5) {
          this.adminLockUntil = Date.now() + 15 * 60 * 1000;
          this._logAudit('ADMIN_LOCKED', email, false);
          this._showAlert(alert_, '🔒 Account locked after 5 failed attempts. Contact your IT administrator or try in 15 minutes.', 'error');
        } else {
          const left = 5 - this.adminAttempts;
          this._showAlert(alert_, `Invalid credentials. ${left} attempt(s) remaining before lockout.`, 'error');
        }
        this._setLoading(btn, false, 'Sign In as Administrator →');
        return;
      }

      // Credentials valid → require 2FA
      this.adminAttempts = 0;
      this._pendingAdminEmail    = email;
      this._pendingAdminRemember = remember;
      this._logAudit('ADMIN_2FA_REQUIRED', email, true);
      this._setLoading(btn, false, 'Sign In as Administrator →');
      this._showAlert(alert_, '✓ Credentials verified. 2FA required.', 'success');

      setTimeout(() => {
        this.switchSection('2fa');
        document.querySelector('.otp-input')?.focus();
      }, 600);
    }, 1100);
  },

  /* ── Admin OTP Verify ────────────────────────────── */
  _handleAdminOTP() {
    const inputs  = document.querySelectorAll('#admin-2fa-section .otp-input');
    const otp     = Array.from(inputs).map(i => i.value).join('');
    const alert_  = document.getElementById('otp-alert');
    const btn     = document.getElementById('btn-verify-otp');

    if (otp.length !== 6) {
      this._showAlert(alert_, 'Please enter the complete 6-digit code.', 'error');
      return;
    }

    this._setLoading(btn, true, 'Verifying…');

    setTimeout(() => {
      // Demo OTP: 123456
      if (otp === '123456') {
        const adminUser = {
          email:    this._pendingAdminEmail,
          name:     'System Administrator',
          role:     'admin',
          loginTime: new Date().toISOString(),
        };
        this.saveSession(adminUser, this._pendingAdminRemember);
        this._updateHeaderUI();
        this._logAudit('ADMIN_2FA_SUCCESS', adminUser.email, true);
        this._setLoading(btn, false, 'Verify & Access Admin Portal →');
        this._showAlert(alert_, '✓ Verified! Accessing admin portal…', 'success');
        setTimeout(() => window.appNav?.('admin-dashboard'), 900);
      } else {
        this._logAudit('ADMIN_2FA_FAILED', this._pendingAdminEmail, false);
        this._showAlert(alert_, 'Incorrect code. Please try again.', 'error');
        this._setLoading(btn, false, 'Verify & Access Admin Portal →');
        inputs.forEach(i => { i.value = ''; i.classList.remove('filled'); });
        inputs[0]?.focus();
      }
    }, 700);
  },

  /* ── Google Auth ─────────────────────────────────── */
  _handleGoogleAuth() {
    const user = {
      email: 'demo.user@gmail.com',
      name:  'Demo User',
      role:  'patient',
      loginTime: new Date().toISOString(),
      googleAuth: true,
    };
    this.saveSession(user, true);
    this._updateHeaderUI();
    window.appNav?.('dashboard');
  },

  /* ── Logout ──────────────────────────────────────── */
  handleLogout() {
    if (this.currentUser?.role === 'admin') {
      this._logAudit('ADMIN_LOGOUT', this.currentUser.email, true);
    }
    this.clearSession();
    this._updateHeaderUI();
    // Reset auth UI to default
    this.setRole('patient');
    this.switchTab('signin');
    window.appNav?.('auth');
  },

  /* ── OTP Inputs ──────────────────────────────────── */
  _bindOTPInputs() {
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach((inp, i) => {
      inp.addEventListener('input', () => {
        if (inp.value.length > 1) inp.value = inp.value.slice(-1);
        inp.classList.toggle('filled', inp.value !== '');
        if (inp.value && i < inputs.length - 1) inputs[i + 1].focus();
      });
      inp.addEventListener('keydown', e => {
        if (e.key === 'Backspace') {
          if (!inp.value && i > 0) { inputs[i - 1].value = ''; inputs[i - 1].classList.remove('filled'); inputs[i - 1].focus(); }
          inp.classList.remove('filled');
        }
        if (!/^\d$/.test(e.key) && !['Backspace','Tab','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
      });
      inp.addEventListener('paste', e => {
        e.preventDefault();
        const digits = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6);
        inputs.forEach((inp2, j) => { inp2.value = digits[j] || ''; inp2.classList.toggle('filled', !!inp2.value); });
        inputs[Math.min(digits.length, inputs.length) - 1]?.focus();
      });
    });
  },

  /* ── Password Strength ───────────────────────────── */
  _updateStrength(pass) {
    const segs  = [1,2,3,4].map(n => document.getElementById(`strength-seg-${n}`));
    const label = document.getElementById('strength-text-label');
    if (!segs[0]) return;
    segs.forEach(s => { if (s) s.style.background = 'var(--border-light)'; });
    if (!pass) { if (label) { label.textContent = 'Password strength'; label.style.color = 'var(--text-muted)'; } return; }

    let score = 0;
    if (pass.length >= 8)  score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (pass.length >= 14) score = Math.min(score + 1, 4);

    const levels = [
      { color: '#f43f5e', text: 'Weak' },
      { color: '#f59e0b', text: 'Fair' },
      { color: '#38bdf8', text: 'Good' },
      { color: '#10b981', text: 'Strong' },
    ];
    const lvl = levels[Math.max(0, score - 1)];
    if (score > 0 && lvl) {
      for (let k = 0; k < score; k++) { if (segs[k]) segs[k].style.background = lvl.color; }
      if (label) { label.textContent = `${lvl.text} password`; label.style.color = lvl.color; }
    }
  },

  /* ── Header UI ───────────────────────────────────── */
  _updateHeaderUI() {
    const loggedIn   = this.isLoggedIn();
    const authBtns   = document.getElementById('landing-auth-btns');
    const profileBtn = document.querySelector('.user-profile-btn');

    if (authBtns)   authBtns.style.display   = loggedIn ? 'none' : 'flex';
    if (profileBtn) {
      profileBtn.style.display = loggedIn ? 'flex' : 'none';
      const nameEl = profileBtn.querySelector('.user-role');
      if (nameEl && this.currentUser) nameEl.textContent = this.currentUser.name || this.currentUser.email;
    }
  },

  /* ── Audit Log ───────────────────────────────────── */
  _logAudit(event, identifier, success) {
    const log = JSON.parse(localStorage.getItem('vc_audit_log') || '[]');
    log.unshift({ event, identifier, success, timestamp: new Date().toISOString() });
    localStorage.setItem('vc_audit_log', JSON.stringify(log.slice(0, 100)));
  },

  /* ── Helpers ─────────────────────────────────────── */
  _showAlert(el, msg, type = 'error') {
    if (!el) return;
    el.textContent = msg;
    el.className = `form-alert-box ${type}`;
    el.style.display = 'flex';
  },

  _clearAlerts() {
    document.querySelectorAll('.form-alert-box').forEach(el => {
      el.style.display = 'none';
      el.textContent   = '';
    });
  },

  _setLoading(btn, loading, text) {
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading
      ? `<span class="btn-loader"></span> ${text}`
      : text;
  },

  _isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  _nameFromEmail(email) {
    return email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  },
};
