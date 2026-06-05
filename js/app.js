// ============================================================
// SHIPSENSE — MAIN APPLICATION
// Routing, navigation, particles, dashboard, global init
// ============================================================

import { State } from './utils/state.js';
import { animateBar, animateNumber, sleep } from './utils/helpers.js';
import { renderInsightFeed, renderActivityFeed, renderScoreHistory } from './components/notifications.js';

// Modules
import { initIdeaForge, initHeroShipScore } from './modules/ideaforge.js';
import { initPRDArchitect } from './modules/prd-architect.js';
import { initPersonaLab } from './modules/persona-lab.js';
import { initPriorityMatrix } from './modules/priority-matrix.js';
import { initFeedbackFusion } from './modules/feedback-fusion.js';
import { initLaunchControl } from './modules/launch-control.js';

// ── App Initialization ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectSVGDefs();
  initParticles();
  initLandingPage();
  initHeroShipScore();
  initAppShell();
  initModules();
  initStateSubscriptions();
  initDashboard();

  console.log('%c🚀 ShipSense loaded — World Product Day 2026', 'color:#7c3aed;font-weight:800;font-size:14px');
});

// ── SVG Gradient Definitions ─────────────────────────────────
function injectSVGDefs() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'svg-defs');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `
    <defs>
      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7c3aed"/>
        <stop offset="100%" stop-color="#06b6d4"/>
      </linearGradient>
    </defs>`;
  document.body.insertBefore(svg, document.body.firstChild);
}

// ── Particle System ──────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * canvas.width;
      this.y    = Math.random() * canvas.height;
      this.r    = Math.random() * 1.5 + 0.3;
      this.vx   = (Math.random() - 0.5) * 0.3;
      this.vy   = (Math.random() - 0.5) * 0.3;
      this.life = Math.random();
      this.maxLife = 0.4 + Math.random() * 0.6;
      const palette = ['124,58,237', '6,182,212', '16,185,129', '245,158,11'];
      this.color = palette[Math.floor(Math.random() * palette.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life += 0.002;
      if (this.life > this.maxLife || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
        this.life = 0;
      }
    }
    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${alpha})`;
      ctx.fill();
    }
  }

  function initParticleArray() {
    particles = Array.from({ length: 80 }, () => new Particle());
  }

  function drawConnections() {
    const maxDist = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${(1 - dist / maxDist) * 0.08})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animId = requestAnimationFrame(animate);
  }

  resize();
  initParticleArray();
  animate();
  window.addEventListener('resize', () => { resize(); initParticleArray(); });
}

// ── Landing Page ─────────────────────────────────────────────
function initLandingPage() {
  // Launch buttons → open app
  ['hero-launch-btn', 'nav-launch-btn', 'features-launch-btn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', openApp);
  });

  // Feature cards → open app at module
  document.querySelectorAll('.feature-card[data-module]').forEach(card => {
    card.addEventListener('click', () => {
      openApp();
      setTimeout(() => navigateToModule(card.dataset.module), 300);
    });
  });

  // Module status items → open app at module
  document.querySelectorAll('.ms-item[data-module]').forEach(item => {
    item.addEventListener('click', () => navigateToModule(item.dataset.module));
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // Nav scroll effect
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('main-nav');
    if (nav) nav.style.background = window.scrollY > 50
      ? 'rgba(7,7,18,0.9)'
      : 'rgba(255,255,255,0.04)';
  }, { passive: true });
}

// ── App Shell ────────────────────────────────────────────────
function initAppShell() {
  // Sidebar navigation
  document.querySelectorAll('.sidebar-item[data-module]').forEach(item => {
    item.addEventListener('click', () => navigateToModule(item.dataset.module));
  });

  // Quick action buttons in dashboard
  document.querySelectorAll('.qa-btn[data-module]').forEach(btn => {
    btn.addEventListener('click', () => navigateToModule(btn.dataset.module));
  });

  // Back to landing
  document.getElementById('back-to-landing-btn')?.addEventListener('click', closeLanding);

  // Mobile sidebar toggle
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('open');
  });
  document.getElementById('sidebar-close-btn')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open');
  });

  // Notification bell
  document.getElementById('topbar-notifications-btn')?.addEventListener('click', () => {
    navigateToModule('dashboard');
    document.getElementById('notification-dot')?.classList.add('hidden');
  });

  // Demo nav link
  document.getElementById('nav-demo-link')?.addEventListener('click', e => {
    e.preventDefault();
    openApp();
  });
}

// ── Module Initialization ────────────────────────────────────
function initModules() {
  initIdeaForge();
  initPRDArchitect();
  initPersonaLab();
  initPriorityMatrix();
  initFeedbackFusion();
  initLaunchControl();
}

// ── State Subscriptions (reactive UI updates) ────────────────
function initStateSubscriptions() {
  // Session score in topbar
  State.on('sessionScore', score => {
    const el = document.getElementById('topbar-score');
    if (el) animateNumber(el, parseInt(el.textContent) || 0, score, 600);
  });

  // Health bars in dashboard
  State.on('health', health => {
    updateHealthBars(health);
  });

  // Activity feed
  State.on('activities', () => renderActivityFeed());

  // Insight feed
  State.on('insights', () => renderInsightFeed());

  // Score history
  State.on('scoreHistory', () => renderScoreHistory());

  // Module status indicators in sidebar + dashboard
  State.on('moduleStatus', status => {
    updateModuleStatusGrid(status);
    updateSidebarBadges(status);
  });
}

// ── Dashboard ────────────────────────────────────────────────
function initDashboard() {
  // Animate health bars on first render
  setTimeout(() => {
    const health = State.get('health');
    updateHealthBars(health);
  }, 500);

  // Initial renders
  renderInsightFeed();
  renderActivityFeed();
  renderScoreHistory();

  // Live health simulation (slight drift to show "live" feel)
  setInterval(() => {
    const health = State.get('health');
    const nonZero = Object.entries(health).filter(([, v]) => v > 0);
    if (nonZero.length === 0) return;
    const [key, val] = nonZero[Math.floor(Math.random() * nonZero.length)];
    State.updateHealth(key, val + (Math.random() - 0.5) * 2);
  }, 4000);
}

function updateHealthBars(health) {
  const bars = [
    { fillId: 'hb-idea',   valId: 'hb-idea-val',   val: health.idea },
    { fillId: 'hb-prd',    valId: 'hb-prd-val',    val: health.prd },
    { fillId: 'hb-user',   valId: 'hb-user-val',   val: health.user },
    { fillId: 'hb-launch', valId: 'hb-launch-val', val: health.launch },
  ];

  bars.forEach(b => {
    const fillEl = document.getElementById(b.fillId);
    const valEl  = document.getElementById(b.valId);
    if (fillEl) {
      fillEl.style.transition = 'width 1s ease';
      fillEl.style.width = b.val + '%';
    }
    if (valEl) valEl.textContent = b.val > 0 ? Math.round(b.val) + '%' : '—';
  });
}

function updateModuleStatusGrid(status) {
  Object.entries(status).forEach(([module, state]) => {
    const el = document.querySelector(`.ms-item[data-module="${module}"] .ms-status`);
    if (!el) return;
    el.className = `ms-status ms-status--${state === 'idle' ? 'idle' : state === 'done' ? 'done' : 'active'}`;
    el.textContent = state === 'idle' ? 'Not started' : state === 'done' ? '✓ Complete' : 'In progress';
  });
}

function updateSidebarBadges(status) {
  const doneCount = Object.values(status).filter(s => s === 'done').length;
  const badgeEl = document.getElementById('badge-dashboard');
  if (badgeEl) {
    badgeEl.textContent = doneCount > 0 ? doneCount : '';
  }
}

// ── Navigation ───────────────────────────────────────────────
function navigateToModule(module) {
  // Hide all module views
  document.querySelectorAll('.module-view').forEach(v => v.classList.remove('active'));

  // Show target module
  const target = document.getElementById(`module-${module}`);
  if (target) target.classList.add('active');

  // Update sidebar active state
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.module === module);
  });

  // Update breadcrumb
  const labels = {
    dashboard:        'Command Center',
    ideaforge:        'IdeaForge',
    'prd-architect':  'PRD Architect',
    'persona-lab':    'Persona Lab',
    'priority-matrix':'PriorityMatrix',
    'feedback-fusion':'FeedbackFusion',
    'launch-control': 'LaunchControl',
  };
  const breadcrumb = document.getElementById('breadcrumb-current');
  if (breadcrumb) breadcrumb.textContent = labels[module] || module;

  State.set('currentModule', module);

  // Close mobile sidebar
  document.getElementById('sidebar')?.classList.remove('open');

  // Scroll to top
  document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function openApp() {
  document.getElementById('landing-page')?.classList.remove('active');
  document.getElementById('app-shell')?.classList.remove('hidden');
  navigateToModule('dashboard');

  // Animate dashboard in
  setTimeout(() => {
    State.addInsight('👋', 'Welcome to ShipSense! Start with IdeaForge to validate your idea, or jump straight to any module.');
    State.addInsight('💡', 'Pro tip: Use the Command Center to see your product health score update in real time as you work through each module.');
  }, 600);
}

function closeLanding() {
  document.getElementById('app-shell')?.classList.add('hidden');
  document.getElementById('landing-page')?.classList.add('active');
}

// ── Keyboard Shortcuts ───────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('ai-overlay')?.classList.add('hidden');
  }

  // Cmd/Ctrl + K → focus idea input
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const ideaInput = document.getElementById('idea-input');
    if (ideaInput && document.getElementById('module-ideaforge')?.classList.contains('active')) {
      ideaInput.focus();
    }
  }
});

// ── Service Worker Registration (for offline capability) ─────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // SW registration would go here for PWA support
  });
}

export { navigateToModule, openApp };
