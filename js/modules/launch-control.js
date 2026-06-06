// ============================================================
// SHIPSENSE — LAUNCH CONTROL MODULE
// Features 26-30: GTM Canvas, Changelog AI, Success Metrics,
//                 Stakeholder Brief, Ship Readiness Checklist
// ============================================================

import { generateLaunchPlan, thinkDelay } from '../ai-engine.js';
import { copyToClipboard } from '../utils/helpers.js';
import { State } from '../utils/state.js';
import { toastSuccess, pushInsight } from '../components/notifications.js';
import { showAIOverlay, hideAIOverlay } from './ideaforge.js';

let currentPlan = null;
let activeTab = 'gtm';
let checklistState = {};
let isGenerating = false;

export function initLaunchControl() {
  const productInput = document.getElementById('lc-product-input');
  const generateBtn  = document.getElementById('lc-generate-btn');

  if (!productInput) return;

  // Pre-fill from context
  const currentIdea = State.get('currentIdea');
  if (currentIdea && !productInput.value) {
    productInput.value = currentIdea.length > 80 ? currentIdea.substring(0, 80) : currentIdea;
  }

  generateBtn?.addEventListener('click', () => runGenerate(productInput.value));
  productInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') runGenerate(productInput.value);
  });

  // Tab switching
  document.querySelectorAll('.lctab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.lctab));
  });
}

async function runGenerate(product) {
  if (isGenerating) return;
  if (!product || product.trim().length < 5) {
    import('../components/notifications.js').then(n => n.toastWarn('Missing input', 'Describe what you are launching.'));
    return;
  }

  isGenerating = true;
  const btn     = document.getElementById('lc-generate-btn');
  const btnText = document.getElementById('lc-btn-text');
  const spinner = document.getElementById('lc-spinner');

  btnText.textContent = 'Planning launch…';
  spinner?.classList.remove('hidden');
  btn.disabled = true;

  showAIOverlay('Building your launch plan…');
  await thinkDelay(1600, 2600);

  currentPlan = generateLaunchPlan(product);
  State.set('launchResults', currentPlan);

  hideAIOverlay();

  // Show results
  const resultsEl = document.getElementById('lc-results');
  resultsEl.style.display = 'block';

  // Render all tabs
  renderGTM(currentPlan.gtm);
  renderChangelog(currentPlan.changelog);
  renderMetrics(currentPlan.metrics);
  renderBrief(currentPlan.brief, product);
  renderChecklist(currentPlan.checklist);

  switchTab('gtm');

  // State updates
  State.setModuleStatus('launch-control', 'done');
  State.updateHealth('launch', 82 + Math.floor(Math.random() * 15));
  State.addActivity(`Generated launch plan for "${product.substring(0, 40)}…"`, 'launch-control');
  State.incrementScore(22);

  // Pendo Track Event: launch_plan_generated
  if (typeof pendo !== 'undefined') {
    pendo.track('launch_plan_generated', {
      productName: product.substring(0, 100),
      productNameLength: product.length,
      checklistItemCount: currentPlan.checklist.categories.reduce((acc, c) => acc + c.items.length, 0),
      checklistCategoryCount: currentPlan.checklist.categories.length,
      changelogVersionCount: currentPlan.changelog.length,
      leadingMetricCount: currentPlan.metrics.leading.length,
      laggingMetricCount: currentPlan.metrics.lagging.length,
      guardrailMetricCount: currentPlan.metrics.guardrails.length,
    });
  }

  pushInsight('🛸', `Launch plan generated! Your Ship Readiness Checklist has ${currentPlan.checklist.categories.reduce((acc, c) => acc + c.items.length, 0)} items. Start with "Technical" and "Analytics" categories first.`);
  pushInsight('📊', `Success metrics defined. Leading indicator to watch first: "${currentPlan.metrics.leading[0].name}" — this tells you if you're on track before lagging metrics confirm it.`);

  toastSuccess('Launch plan ready!', 'GTM canvas, changelog, metrics, brief, and checklist generated.');

  btnText.textContent = 'Regenerate';
  spinner?.classList.add('hidden');
  btn.disabled = false;
  isGenerating = false;
}

function renderGTM(gtm) {
  const el = document.getElementById('gtm-canvas');
  if (!el) return;

  el.innerHTML = `
    <div class="gtm-canvas">
      <div class="gtm-section">
        <div class="gtm-section-title">🎯 Positioning</div>
        <ul>${gtm.positioning.map(p => `<li>${p}</li>`).join('')}</ul>
      </div>
      <div class="gtm-section">
        <div class="gtm-section-title">📣 Distribution Channels</div>
        <ul>${gtm.channels.map(c => `<li>${c}</li>`).join('')}</ul>
      </div>
      <div class="gtm-section">
        <div class="gtm-section-title">💰 Pricing Strategy</div>
        <ul>${gtm.pricing.map(p => `<li>${p}</li>`).join('')}</ul>
      </div>
    </div>`;
}

function renderChangelog(versions) {
  const el = document.getElementById('changelog-content');
  if (!el) return;

  const typeLabels = { major: 'MAJOR', minor: 'MINOR', patch: 'PATCH' };
  el.innerHTML = `
    <div class="changelog-content">
      ${versions.map(v => `
        <div class="changelog-version">
          <div class="cv-header">
            <span class="cv-version">v${v.version}</span>
            <span class="cv-date">${v.date}</span>
            <span class="cv-type cv-${v.type}">${typeLabels[v.type]}</span>
          </div>
          <div class="cv-items">
            ${v.items.map(item => `<div class="cv-item">${item}</div>`).join('')}
          </div>
        </div>`).join('')}
    </div>`;
}

function renderMetrics(metrics) {
  const el = document.getElementById('metrics-content');
  if (!el) return;

  const sections = [
    { title: '⚡ Leading Indicators', key: 'leading', type: 'leading' },
    { title: '📈 Lagging Indicators', key: 'lagging', type: 'lagging' },
    { title: '🛡️ Guard Rail Metrics', key: 'guardrails', type: 'guard' },
  ];

  el.innerHTML = sections.map(section => `
    <div style="margin-bottom:var(--sp-5)">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text-primary);margin-bottom:var(--sp-3)">${section.title}</div>
      <div class="metrics-grid">
        ${metrics[section.key].map(m => `
          <div class="metric-card metric-card--${section.type}">
            <div class="metric-type">${section.type.toUpperCase()}</div>
            <div class="metric-name">${m.name}</div>
            <div class="metric-target">Target: ${m.target}</div>
            <div class="metric-why">${m.why}</div>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

function renderBrief(brief, product) {
  const el = document.getElementById('brief-content');
  if (!el) return;

  el.innerHTML = `
    <div class="brief-content">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-5)">
        <h3 style="font-family:var(--font-display);font-size:var(--fs-2xl);font-weight:800">Executive Brief</h3>
        <button class="tool-btn" id="brief-copy-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy Brief
        </button>
      </div>

      <div class="brief-section" style="padding:var(--sp-4);background:rgba(124,58,237,0.06);border-radius:var(--r-lg);border-left:3px solid var(--color-violet);margin-bottom:var(--sp-4)">
        <h4>One-liner</h4>
        <p style="font-size:var(--fs-md);font-style:italic;color:var(--text-primary)">"${brief.oneLiner}"</p>
      </div>

      <div class="brief-section">
        <h4>The Problem</h4>
        <p>${brief.problem}</p>
      </div>

      <div class="brief-section">
        <h4>Our Solution</h4>
        <p>${brief.solution}</p>
      </div>

      <div class="brief-section">
        <h4>Early Traction</h4>
        <p>${brief.traction}</p>
      </div>

      <div class="brief-section">
        <h4>The Ask</h4>
        <p>${brief.ask}</p>
      </div>
    </div>`;

  document.getElementById('brief-copy-btn')?.addEventListener('click', async () => {
    const briefText = `${brief.oneLiner}\n\nPROBLEM\n${brief.problem}\n\nSOLUTION\n${brief.solution}\n\nTRACTION\n${brief.traction}\n\nASK\n${brief.ask}`;
    await copyToClipboard(briefText);

    // Pendo Track Event: stakeholder_brief_copied
    if (typeof pendo !== 'undefined') {
      pendo.track('stakeholder_brief_copied', {
        briefLength: briefText.length,
        productName: product.substring(0, 100),
      });
    }

    toastSuccess('Brief copied!', 'Paste into your email or deck.');
  });
}

function renderChecklist(checklist) {
  const el = document.getElementById('checklist-content');
  if (!el) return;

  // Count total items
  const totalItems = checklist.categories.reduce((acc, c) => acc + c.items.length, 0);
  checklistState = {};

  el.innerHTML = `
    <div class="checklist-progress">
      <div class="cp-ring">
        <svg viewBox="0 0 64 64" width="64" height="64">
          <circle class="score-ring-track" cx="32" cy="32" r="26" />
          <circle class="score-ring-progress" cx="32" cy="32" r="26" id="checklist-ring" style="stroke-dasharray:163;stroke-dashoffset:163" />
        </svg>
        <div class="cp-center" id="checklist-pct">0%</div>
      </div>
      <div class="cp-details">
        <h4>Ship Readiness</h4>
        <p id="checklist-status">0 of ${totalItems} tasks complete</p>
      </div>
    </div>
    <div class="ship-checklist">
      ${checklist.categories.map(cat => `
        <div class="checklist-category">
          <div class="checklist-cat-title">${cat.title}</div>
          <div class="checklist-items">
            ${cat.items.map((item, idx) => {
              const itemId = `check-${cat.title.replace(/\s+/g, '-')}-${idx}`;
              checklistState[itemId] = false;
              return `
                <div class="checklist-item" id="${itemId}" data-item-id="${itemId}">
                  <div class="checklist-checkbox"></div>
                  <span class="checklist-label">${item.label}</span>
                  <span class="checklist-priority pri-${item.priority}">${item.priority.toUpperCase()}</span>
                </div>`;
            }).join('')}
          </div>
        </div>`).join('')}
    </div>`;

  // Attach click handlers
  el.querySelectorAll('.checklist-item').forEach(item => {
    item.addEventListener('click', () => toggleChecklistItem(item, totalItems));
  });
}

function toggleChecklistItem(item, totalItems) {
  const itemId = item.dataset.itemId;
  checklistState[itemId] = !checklistState[itemId];

  item.classList.toggle('checked', checklistState[itemId]);

  // Update progress
  const completed = Object.values(checklistState).filter(Boolean).length;
  const pct = Math.round((completed / totalItems) * 100);

  const pctEl  = document.getElementById('checklist-pct');
  const statEl = document.getElementById('checklist-status');
  const ringEl = document.getElementById('checklist-ring');

  if (pctEl) pctEl.textContent = pct + '%';
  if (statEl) statEl.textContent = `${completed} of ${totalItems} tasks complete`;

  if (ringEl) {
    const circumference = 163;
    const offset = circumference - (pct / 100) * circumference;
    ringEl.style.transition = 'stroke-dashoffset 0.5s ease';
    ringEl.style.strokeDashoffset = offset;
  }

  // Achievement toast at key milestones
  if (pct === 50)  toastSuccess('50% there!', 'Halfway to launch-ready 🚀');
  if (pct === 100) {
    toastSuccess('🎉 Ship it!', 'All checklist items complete. You are launch-ready!');
    State.updateHealth('launch', 100);
    pushInsight('🎉', 'Ship Readiness: 100%! All checklist items complete. Time to launch and share with #EveryoneShipsNow!');

    // Pendo Track Event: ship_readiness_completed
    if (typeof pendo !== 'undefined') {
      pendo.track('ship_readiness_completed', {
        totalItems: totalItems,
        categoriesCompleted: Object.values(checklistState).filter(Boolean).length,
      });
    }
  }
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.lctab').forEach(t => t.classList.toggle('active', t.dataset.lctab === tab));
  document.querySelectorAll('.lctab-content').forEach(c => c.classList.toggle('active', c.id === `lctab-content-${tab}`));
}
