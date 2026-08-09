/* ==========================================
   VITALCARE AI - MAIN APP MODULE & ROUTER v3.4
   ========================================== */

import { UserStore } from './user-data.js';
import { AuthModule } from './auth.js';
import { OnboardingWizard } from './onboarding.js';
import { VitalsEngine } from './vitals-chart.js';
import { AICopilot } from './ai-chat.js';
import { VitalAssistant } from './assistant.js';
import { RiskEngine } from './risk-engine.js';
import { TelehealthModule } from './telehealth.js';
import { DiagnosticsModule } from './diagnostics.js';
import { HealthRecords } from './health-records.js';
import { MedicationManager } from './medications.js';
import { AppointmentManager } from './appointments.js';
import { EmergencySOS } from './emergency-sos.js';
import { FindHealthcare } from './find-healthcare.js';
import { HealthAnalytics } from './health-analytics.js';
import { HealthJournal } from './health-journal.js';
import { NotificationBadges } from './notifications.js';

document.addEventListener('DOMContentLoaded', () => {
  // Service Worker for PWA - force update & cache clear
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => reg.update());
    });
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Initialize theme & Auth
  initTheme();
  AuthModule.init();
  OnboardingWizard.init();

  // Vitals Engine
  VitalsEngine.initSparklines();
  VitalsEngine.renderMainChart('24h', 'heartRate');
  VitalsEngine.startLivePulseSimulation();

  // AI & Healthcare Modules
  AICopilot.init();
  VitalAssistant.init();
  RiskEngine.renderRiskDashboard();
  TelehealthModule.init();
  DiagnosticsModule.init();
  HealthRecords.init();
  MedicationManager.init();
  AppointmentManager.init();
  EmergencySOS.init();
  FindHealthcare.init();
  HealthAnalytics.init();
  HealthJournal.init();
  NotificationBadges.init();

  // Navigation
  initNavigation();

  // Global function bindings
  window.appNav = (tabId) => switchTab(tabId);
  window.openDocModal = (docId) => TelehealthModule.openBookingModal(docId);
  window.downloadRecord = (id) => { HealthRecords.showToast('Viewing medical document.'); };
  window.deleteRecord = (id) => {
    if (confirm('Delete this health record?')) {
      HealthRecords.deleteRecord(id);
      HealthRecords.render(HealthRecords.activeFilter || 'all', '');
    }
  };
  window.markMed = (id, status) => {
    MedicationManager.updateStatus(id, status);
    MedicationManager.render();
  };
  window.deleteMed = (id) => {
    if (confirm('Remove this medication?')) {
      MedicationManager.deleteMed(id);
      MedicationManager.render();
    }
  };
  window.cancelAppt = (id) => {
    if (confirm('Cancel this appointment?')) {
      AppointmentManager.cancelAppt(id);
      AppointmentManager.render(AppointmentManager.activeTab);
    }
  };

  // SOS Buttons
  document.querySelectorAll('.sos-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab('emergency'));
  });

  // Initial route — check URL hash, respect role
  const rawHash  = window.location.hash.replace('#', '').trim();
  const hashRoute = (rawHash === 'login' || rawHash === 'register') ? 'auth' : rawHash;

  if (AuthModule.isLoggedIn()) {
    const role = AuthModule.getUserRole();
    const defaultView = role === 'admin' ? 'admin-dashboard' : 'dashboard';
    // Already logged in — don't show auth pages
    if (hashRoute === 'auth' || hashRoute === 'landing' || !hashRoute) {
      switchTab(defaultView);
    } else {
      switchTab(hashRoute || defaultView);
    }
  } else {
    // Not logged in — only allow public routes
    if (hashRoute === 'auth' || hashRoute === 'landing') {
      switchTab(hashRoute);
    } else if (hashRoute) {
      switchTab('auth'); // Protected route → redirect
    } else {
      switchTab('landing');
    }
  }
});

function initTheme() {
  const storedTheme = localStorage.getItem('vc_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', storedTheme);
  document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('vc_theme', next);
  });
}

function initNavigation() {
  document.querySelectorAll('[data-view]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const v = item.dataset.view;
      if (v) switchTab(v);
    });
  });
}

const PUBLIC_VIEWS = ['landing', 'auth'];
const PROTECTED_VIEWS = ['dashboard','onboarding','copilot','assistant','risk-dashboard','diagnostics','telehealth','vault','records','medications','appointments','emergency','find-healthcare','analytics','admin-dashboard','journal'];
const ADMIN_ONLY_VIEWS = ['admin-dashboard'];

function switchTab(viewId) {
  // Resolve legacy routes
  if (viewId === 'login' || viewId === 'register') viewId = 'auth';

  const isLoggedIn = AuthModule.isLoggedIn();
  const userRole   = AuthModule.getUserRole();

  // Auth guard: redirect unauthenticated users to auth page
  if (PROTECTED_VIEWS.includes(viewId) && !isLoggedIn) {
    viewId = 'auth';
  }

  // Admin-only guard: non-admins cannot access admin-dashboard
  if (ADMIN_ONLY_VIEWS.includes(viewId) && userRole !== 'admin') {
    viewId = isLoggedIn ? 'dashboard' : 'auth';
  }

  // Hide all view sections
  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));

  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add('active');
  } else {
    document.getElementById('view-landing')?.classList.add('active');
  }

  // Update navbar active state
  document.querySelectorAll('[data-view]').forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewId);
  });

  // Sidebar & Bottom Nav: hide on public/auth views
  const sidebar   = document.querySelector('.desktop-sidebar');
  const bottomNav = document.querySelector('.mobile-bottom-nav');
  const isPublic  = PUBLIC_VIEWS.includes(viewId);
  const isAdmin   = viewId === 'admin-dashboard';

  if (sidebar)   sidebar.style.display   = (isPublic || isAdmin) ? 'none' : 'flex';
  if (bottomNav) bottomNav.style.display = (isPublic || isAdmin) ? 'none' : 'flex';

  // Render admin audit log if admin dashboard
  if (viewId === 'admin-dashboard') renderAdminDashboard();
  if (viewId === 'auth') {
    AuthModule.setRole('patient');
    AuthModule.switchTab('signin');
  }

  // Dynamic Content Updates
  if (viewId === 'dashboard')       updateDashboard();
  if (viewId === 'risk-dashboard')  RiskEngine.renderRiskDashboard();
  if (viewId === 'diagnostics')     setTimeout(() => VitalsEngine.renderMainChart('24h', 'heartRate'), 100);
  if (viewId === 'records')         HealthRecords.render(HealthRecords.activeFilter || 'all', '');
  if (viewId === 'medications')     { MedicationManager.render(); NotificationBadges.update(); }
  if (viewId === 'appointments')    { AppointmentManager.render(AppointmentManager.activeTab); NotificationBadges.update(); }
  if (viewId === 'emergency')       { EmergencySOS.populateProfileInfo(); EmergencySOS.requestLocation(); }
  if (viewId === 'find-healthcare') FindHealthcare.render();
  if (viewId === 'analytics')       HealthAnalytics.render();
  if (viewId === 'journal')         HealthJournal.render();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateDashboard() {
  const p = UserStore.getProfile();
  const greetingEl = document.getElementById('user-greeting-name');
  if (greetingEl) greetingEl.textContent = p.fullName ? p.fullName.split(' ')[0] : 'Alex';

  const bmiEl = document.getElementById('user-bmi-val');
  if (bmiEl) bmiEl.textContent = p.bmi || '23.4';

  const catEl = document.getElementById('user-bmi-cat');
  if (catEl) catEl.textContent = p.bmiCategory || 'Normal Weight';

  VitalsEngine.initSparklines();
}

function renderAdminDashboard() {
  const log = JSON.parse(localStorage.getItem('vc_audit_log') || '[]');
  const adminUser = AuthModule.currentUser;

  // Update admin name in header
  const adminNameEl = document.getElementById('admin-dashboard-name');
  if (adminNameEl && adminUser) adminNameEl.textContent = adminUser.name || 'Administrator';

  // Stats
  const totalLogins  = log.filter(e => e.event.includes('SUCCESS') || e.event.includes('LOGOUT')).length;
  const failedLogins = log.filter(e => !e.success).length;
  const lastLoginEl  = document.getElementById('admin-last-login');
  if (lastLoginEl && adminUser) {
    lastLoginEl.textContent = new Date(adminUser.loginTime).toLocaleString();
  }
  const totalLoginsEl  = document.getElementById('admin-total-logins');
  const failedLoginsEl = document.getElementById('admin-failed-logins');
  const auditCountEl   = document.getElementById('admin-audit-count');
  if (totalLoginsEl)  totalLoginsEl.textContent  = totalLogins  || 1;
  if (failedLoginsEl) failedLoginsEl.textContent = failedLogins || 0;
  if (auditCountEl)   auditCountEl.textContent   = log.length   || 1;

  // Render audit log table
  const tbody = document.getElementById('audit-log-tbody');
  if (!tbody) return;

  if (log.length === 0) {
    // Seed with the current session
    tbody.innerHTML = `
      <tr>
        <td>${new Date().toLocaleString()}</td>
        <td><span class="audit-event-badge chip chip-normal">ADMIN_LOGIN</span></td>
        <td>${adminUser?.email || 'admin@vitalcare.ai'}</td>
        <td>192.168.1.1</td>
        <td class="audit-success">✓ Success</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = log.slice(0, 15).map(entry => {
    const time   = new Date(entry.timestamp).toLocaleString();
    const status = entry.success
      ? `<span class="audit-success">✓ Success</span>`
      : `<span class="audit-failed">✗ Failed</span>`;
    const eventClass = entry.success ? 'chip-normal' : 'chip-danger';
    const ip = entry.ip || '127.0.0.1 (local)';
    return `
      <tr>
        <td>${time}</td>
        <td><span class="audit-event-badge chip ${eventClass}">${entry.event}</span></td>
        <td>${entry.identifier}</td>
        <td>${ip}</td>
        <td>${status}</td>
      </tr>`;
  }).join('');
}

