// ============================================================
// SHIPSENSE — PERSONA LAB MODULE
// Features 11-15: AI Persona Generator, JTBD Canvas,
//                 Empathy Map, Conflict Analyzer, Behavior Predictor
// ============================================================

import { generatePersona, thinkDelay, getRandomIdea } from '../ai-engine.js';
import { animateBar, animateNumber } from '../utils/helpers.js';
import { State } from '../utils/state.js';
import { toastSuccess, pushInsight } from '../components/notifications.js';
import { showAIOverlay, hideAIOverlay } from './ideaforge.js';

let currentPersona = null;
let activeTab = 'profile';

const RANDOM_SEGMENTS = [
  'Senior product managers at B2B SaaS startups',
  'Solo founders building their first product',
  'Junior PMs transitioning from engineering',
  'Head of Product at Series A fintech companies',
  'Indie developers who just launched their first SaaS',
  'Product designers moving into PM roles',
  'Enterprise product leaders at Fortune 500 companies',
  'Product owners at agencies managing client products',
];

export function initPersonaLab() {
  const segInput   = document.getElementById('persona-segment-input');
  const genBtn     = document.getElementById('persona-generate-btn');
  const randomBtn  = document.getElementById('persona-random-btn');

  if (!segInput) return;

  randomBtn?.addEventListener('click', () => {
    const idx = Math.floor(Math.random() * RANDOM_SEGMENTS.length);
    segInput.value = RANDOM_SEGMENTS[idx];
    segInput.focus();
  });

  genBtn?.addEventListener('click', () => runGenerate(segInput.value));
  segInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') runGenerate(segInput.value);
  });

  // Tab switching
  document.querySelectorAll('.ptab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      switchTab(target);
    });
  });
}

async function runGenerate(segment) {
  if (!segment || segment.trim().length < 5) {
    import('../components/notifications.js').then(n => n.toastWarn('Missing input', 'Enter a user segment to generate a persona.'));
    return;
  }

  const btn     = document.getElementById('persona-generate-btn');
  const btnText = document.getElementById('persona-btn-text');
  const spinner = document.getElementById('persona-spinner');

  btnText.textContent = 'Building persona…';
  spinner?.classList.remove('hidden');
  btn.disabled = true;

  showAIOverlay('Profiling your user segment…');
  await thinkDelay(1500, 2400);

  currentPersona = generatePersona(segment);
  State.set('currentPersona', currentPersona);

  hideAIOverlay();

  // Show results
  const resultsEl = document.getElementById('persona-results');
  resultsEl.style.display = 'block';

  // Render all tabs
  renderProfile(currentPersona);
  renderJTBD(currentPersona.jtbd);
  renderEmpathyMap(currentPersona);
  renderBehaviorPredictor(currentPersona.predictions);

  // Switch to profile tab
  switchTab('profile');

  // State
  State.setModuleStatus('persona-lab', 'done');
  State.updateHealth('user', 72 + Math.floor(Math.random() * 22));
  State.addActivity(`Built persona: "${currentPersona.name}" (${segment.substring(0, 30)}…)`, 'persona-lab');
  State.incrementScore(18);

  // Pendo Track Event: persona_generated
  if (typeof pendo !== 'undefined') {
    pendo.track('persona_generated', {
      segmentInput: segment.substring(0, 100),
      personaName: currentPersona.name,
      personaRole: currentPersona.role,
      techSavvyScore: currentPersona.attrs.techSavvy,
      riskToleranceScore: currentPersona.attrs.riskTolerance,
      dataFocusScore: currentPersona.attrs.dataFocus,
      collaborationScore: currentPersona.attrs.collaboration,
    });
  }

  pushInsight('👥', `Persona "${currentPersona.name}" created. Key insight: their top pain is "${currentPersona.pains[0].substring(0, 60)}"`);
  pushInsight('🎯', `JTBD core statement captured. Use this to frame your PRD problem statement — it makes engineering briefs 40% more persuasive.`);

  toastSuccess('Persona created!', `Meet ${currentPersona.name}, ${currentPersona.role}`);

  btnText.textContent = 'Regenerate';
  spinner?.classList.add('hidden');
  btn.disabled = false;
}

function renderProfile(p) {
  // Avatar
  const avatarEl = document.getElementById('persona-avatar');
  if (avatarEl) avatarEl.textContent = p.emoji;

  // Name & role
  setInnerText('persona-name', p.name);
  setInnerText('persona-role', `${p.role} · ${p.company}`);

  // Tags
  const tagsEl = document.getElementById('persona-tags');
  if (tagsEl) {
    tagsEl.innerHTML = p.tags.map(t => `<span class="persona-tag">${t}</span>`).join('');
  }

  // Attributes with animated bars
  const attrsEl = document.getElementById('persona-attrs');
  if (attrsEl) {
    const attrDefs = [
      { label: 'Tech Savvy',      key: 'techSavvy' },
      { label: 'Risk Tolerance',  key: 'riskTolerance' },
      { label: 'Data Focus',      key: 'dataFocus' },
      { label: 'Collaboration',   key: 'collaboration' },
    ];
    attrsEl.innerHTML = attrDefs.map((a, i) => `
      <div class="persona-attr">
        <span class="attr-label">${a.label}</span>
        <div class="attr-bar">
          <div class="attr-fill" id="attr-fill-${i}" style="width:0%"></div>
        </div>
        <span class="attr-val">${p.attrs[a.key]}</span>
      </div>`).join('');

    // Animate bars
    attrDefs.forEach((a, i) => {
      setTimeout(() => animateBar(document.getElementById(`attr-fill-${i}`), p.attrs[a.key], 0), i * 100 + 300);
    });
  }

  // Goals, pains, motivations
  renderList('persona-goals', p.goals);
  renderList('persona-pains', p.pains);
  renderList('persona-motivations', p.motivations);

  // Conflict analyzer
  const conflictEl = document.getElementById('conflict-content');
  if (conflictEl) conflictEl.innerHTML = `<p style="font-size:var(--fs-xs);color:var(--text-secondary);line-height:1.6">${p.conflictAnalysis}</p>`;
}

function renderJTBD(jtbd) {
  const canvas = document.getElementById('jtbd-canvas');
  if (!canvas) return;

  canvas.innerHTML = `
    <div class="jtbd-section">
      <div class="jtbd-section-title">Core JTBD Statement</div>
      <div class="jtbd-statement">${jtbd.coreStatement}</div>
    </div>
    <div class="jtbd-section">
      <div class="jtbd-section-title">Functional Jobs (What they need to DO)</div>
      <div class="jtbd-items">
        ${jtbd.functionalJobs.map(j => `<div class="jtbd-item">→ ${j}</div>`).join('')}
      </div>
    </div>
    <div class="jtbd-section">
      <div class="jtbd-section-title">Emotional Jobs (What they need to FEEL)</div>
      <div class="jtbd-items">
        ${jtbd.emotionalJobs.map(j => `<div class="jtbd-item">💙 ${j}</div>`).join('')}
      </div>
    </div>
    <div class="jtbd-section">
      <div class="jtbd-section-title">Social Jobs (How they need to be PERCEIVED)</div>
      <div class="jtbd-items">
        ${jtbd.socialJobs.map(j => `<div class="jtbd-item">⭐ ${j}</div>`).join('')}
      </div>
    </div>`;
}

function renderEmpathyMap(p) {
  setInnerText('empathy-name', p.name);

  renderEmpathyList('emp-think', p.empathy.thinks);
  renderEmpathyList('emp-hear', p.empathy.hears);
  renderEmpathyList('emp-see', p.empathy.sees);
  renderEmpathyList('emp-say', p.empathy.says);
  renderEmpathyList('emp-pain', p.empathy.pains);
  renderEmpathyList('emp-gain', p.empathy.gains);
}

function renderEmpathyList(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
}

function renderBehaviorPredictor(predictions) {
  const el = document.getElementById('behavior-predictor');
  if (!el) return;

  el.innerHTML = `
    <h3 style="font-family:var(--font-display);font-size:var(--fs-xl);font-weight:700;margin-bottom:var(--sp-5)">Behavioral Predictions</h3>
    ${predictions.map(scenario => `
      <div class="bp-scenario">
        <h4>${scenario.scenario}</h4>
        <div class="bp-predictions">
          ${scenario.predictions.map(pred => `
            <div class="bp-pred">
              <span class="bp-prob">${pred.prob}</span>
              <span class="bp-text">${pred.text}</span>
            </div>`).join('')}
        </div>
      </div>`).join('')}`;
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.ptab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.ptab-content').forEach(c => c.classList.toggle('active', c.id === `ptab-content-${tab}`));
}

function renderList(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
}

function setInnerText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
