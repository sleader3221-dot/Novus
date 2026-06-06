// ============================================================
// SHIPSENSE — PRIORITY MATRIX MODULE
// Features 16-20: Dynamic RICE Scorer, MoSCoW Classifier,
//                 Effort Estimator, Dependency Web, Sprint Sim
// ============================================================

import { scoreFeature, runSprintSimulation } from '../ai-engine.js';
import { animateNumber } from '../utils/helpers.js';
import { State } from '../utils/state.js';
import { toastSuccess, toastInfo, pushInsight } from '../components/notifications.js';

let features = [];
let activeTab = 'rice';

export function initPriorityMatrix() {
  const featureInput = document.getElementById('pm-feature-input');
  const addBtn       = document.getElementById('pm-add-btn');

  if (!featureInput) return;

  // Add button
  addBtn?.addEventListener('click', () => addFeature(featureInput.value));
  featureInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') addFeature(featureInput.value);
  });
  
  // "Load Sample Features" global listener
  document.body.addEventListener('click', e => {
    if (e.target.id === 'pm-load-sample-btn') {
      // Pendo Track Event: sample_features_loaded
      if (typeof pendo !== 'undefined') {
        pendo.track('sample_features_loaded', {
          sampleFeatureCount: 5,
        });
      }

      ['AI-powered search', 'Dark mode', 'Bulk export', 'Mobile app', 'Integrations'].forEach(async (f, i) => {
        setTimeout(() => addFeature(f), i * 300);
      });
    }
    // "Draft PRD" cross-module listener
    if (e.target.classList.contains('draft-prd-btn')) {
      const featName = e.target.dataset.feature;

      // Pendo Track Event: draft_prd_from_sprint
      if (typeof pendo !== 'undefined') {
        pendo.track('draft_prd_from_sprint', {
          featureName: featName,
          sourceModule: 'priority-matrix',
        });
      }

      import('../app.js').then(app => {
        app.navigateToModule('prd-architect');
        const prdInput = document.getElementById('prd-idea-input');
        if (prdInput) {
          prdInput.value = featName;
          document.getElementById('prd-generate-btn')?.click();
        }
      });
    }
  });

  // Quick-add chips
  document.querySelectorAll('.qa-chip').forEach(chip => {
    chip.addEventListener('click', () => addFeature(chip.textContent.trim()));
  });

  // Tab switching
  document.querySelectorAll('.pmtab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.pmtab));
  });

  // Sprint simulator controls
  const teamSizeInput  = document.getElementById('sprint-team-size');
  const sprintLenInput = document.getElementById('sprint-length');
  const simBtn         = document.getElementById('sprint-simulate-btn');

  teamSizeInput?.addEventListener('input', () => {
    document.getElementById('sprint-team-size-val').textContent = `${teamSizeInput.value} engineers`;
  });
  sprintLenInput?.addEventListener('input', () => {
    document.getElementById('sprint-length-val').textContent = `${sprintLenInput.value} week${sprintLenInput.value > 1 ? 's' : ''}`;
  });
  simBtn?.addEventListener('click', runSim);
}

async function addFeature(name) {
  if (!name || name.trim().length < 2) return;
  const trimmed = name.trim();

  // Avoid duplicates
  if (features.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) {
    import('../components/notifications.js').then(n => n.toastWarn('Already added', `"${trimmed}" is already in your list.`));
    return;
  }

  const featureInput = document.getElementById('pm-feature-input');
  if (featureInput) featureInput.value = '';

  const btnText = document.getElementById('pm-add-btn');
  const originalText = btnText.textContent;
  btnText.textContent = 'Scoring...';
  
  const scored = await scoreFeature(trimmed);
  features.push(scored);
  
  btnText.textContent = originalText;

  // Sort by RICE score descending
  features.sort((a, b) => b.riceScore - a.riceScore);

  State.set('features', features);
  State.setModuleStatus('priority-matrix', 'active');
  State.addActivity(`Scored feature: "${trimmed}"`, 'priority-matrix');

  renderAllViews();

  // Insights after 3+ features
  if (features.length === 3) {
    pushInsight('🎯', `You have ${features.length} features scored. The top priority by RICE is "${features[0].name}" — validate this with stakeholders before committing.`);
  }

  // Pendo Track Event: feature_scored
  if (typeof pendo !== 'undefined') {
    pendo.track('feature_scored', {
      featureName: trimmed.substring(0, 100),
      riceScore: scored.riceScore,
      reach: scored.reach,
      impact: scored.impact,
      confidence: scored.confidence,
      effort: scored.effort,
      effortLabel: scored.effortLabel,
      moscowCategory: scored.moscow,
      dependencyCount: scored.dependencies.length,
      totalFeaturesScored: features.length,
      usedOpenAI: !!localStorage.getItem('openai_key'),
    });
  }

  toastSuccess('Feature scored!', `"${trimmed}" — RICE: ${scored.riceScore}`);
}

function renderAllViews() {
  renderRICEList();
  renderMoSCoW();
  renderDependencyMap();
  updateModuleStatus();
}

function renderRICEList() {
  const list = document.getElementById('rice-features-list');
  if (!list) return;

  if (features.length === 0) {
    list.innerHTML = `
      <div class="rice-empty">
        <div style="margin-bottom:12px">Add features above to start scoring →</div>
        <button class="btn btn--primary btn--glow" id="pm-load-sample-btn" style="margin: 0 auto;">⚡ Load Sample Framework</button>
      </div>`;
    return;
  }

  list.innerHTML = features.map((f, idx) => `
    <div class="rice-item" style="animation-delay:${idx * 0.05}s">
      <div>
        <div class="rice-feature-name">${f.name}</div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:3px">
          Reach: ${f.reach.toLocaleString()} · Impact: ${f.impact}× · Confidence: ${Math.round(f.confidence * 100)}%
        </div>
      </div>
      <div class="rice-metric">
        <span class="rice-metric-label">Reach</span>
        <span class="rice-metric-val">${(f.reach / 1000).toFixed(1)}K</span>
      </div>
      <div class="rice-metric">
        <span class="rice-metric-label">Impact</span>
        <span class="rice-metric-val">${f.impact}×</span>
      </div>
      <div class="rice-metric">
        <span class="rice-metric-label">Confidence</span>
        <span class="rice-metric-val">${Math.round(f.confidence * 100)}%</span>
      </div>
      <div class="rice-metric">
        <span class="rice-metric-label">Effort</span>
        <span class="rice-metric-val">${f.effort}</span>
      </div>
      <span class="rice-effort-badge ${f.effortCls}">${f.effortLabel}</span>
      <span class="rice-score-chip">${f.riceScore.toLocaleString()}</span>
    </div>`).join('');
}

function renderMoSCoW() {
  const buckets = { must: [], should: [], could: [], wont: [] };
  features.forEach(f => {
    if (buckets[f.moscow]) buckets[f.moscow].push(f);
  });

  Object.entries(buckets).forEach(([key, items]) => {
    const itemsEl = document.getElementById(`moscow-${key}-items`);
    const countEl = document.getElementById(`${key}-count`);
    if (countEl) countEl.textContent = items.length;
    if (itemsEl) {
      itemsEl.innerHTML = items.length === 0
        ? `<div style="font-size:var(--fs-xs);color:var(--text-muted);padding:var(--sp-3)">No features yet</div>`
        : items.map(f => `
            <div class="moscow-item">
              <strong>${f.name}</strong>
              <div style="font-size:10px;color:var(--text-muted);margin-top:3px">RICE: ${f.riceScore.toLocaleString()} · ${f.effortLabel} effort</div>
            </div>`).join('');
    }
  });
}

function renderDependencyMap() {
  const map = document.getElementById('dependency-map');
  if (!map) return;

  if (features.length < 2) {
    map.innerHTML = '<div class="dep-empty">Add at least 2 features to see dependency relationships.</div>';
    return;
  }

  const featuresWithDeps = features.filter(f => f.dependencies.length > 0);
  if (featuresWithDeps.length === 0) {
    map.innerHTML = `
      <div class="dep-graph">
        <div style="font-size:var(--fs-sm);color:var(--text-secondary);padding:var(--sp-4);text-align:center">
          ✅ No blocking dependencies detected between your current features. All can be worked on in parallel!
        </div>
        ${features.map(f => `
          <div class="dep-row">
            <div class="dep-node">${f.name}</div>
            <span class="dep-arrow">→</span>
            <span style="font-size:var(--fs-xs);color:var(--text-muted)">No dependencies</span>
          </div>`).join('')}
      </div>`;
    return;
  }

  map.innerHTML = `
    <div class="dep-graph">
      ${featuresWithDeps.map(f => `
        <div class="dep-row">
          <div class="dep-node">${f.name}</div>
          <span class="dep-arrow">→ requires →</span>
          <div class="dep-deps">
            ${f.dependencies.map(d => `<span class="dep-dep">${d}</span>`).join('')}
          </div>
        </div>`).join('')}
      ${features.filter(f => f.dependencies.length === 0).map(f => `
        <div class="dep-row">
          <div class="dep-node">${f.name}</div>
          <span class="dep-arrow">→</span>
          <span style="font-size:var(--fs-xs);color:var(--text-muted)">Independent</span>
        </div>`).join('')}
    </div>`;
}

function runSim() {
  if (features.length === 0) {
    toastInfo('No features', 'Add some features first to run a sprint simulation.');
    return;
  }

  const teamSize    = parseInt(document.getElementById('sprint-team-size')?.value || '3');
  const sprintWeeks = parseInt(document.getElementById('sprint-length')?.value || '2');

  const sprints = runSprintSimulation(features, teamSize, sprintWeeks);
  const resultsEl = document.getElementById('sprint-results');
  if (!resultsEl) return;

  if (sprints.length === 0) {
    resultsEl.innerHTML = '<div style="color:var(--text-muted);font-size:var(--fs-sm)">Not enough features or capacity to simulate sprints.</div>';
    return;
  }

  State.setModuleStatus('priority-matrix', 'done');
  State.updateHealth('idea', Math.max(State.get('health').idea, 65));
  State.addActivity(`Sprint simulation: ${sprints.length} sprints · ${teamSize} engineers`, 'priority-matrix');
  State.incrementScore(12);

  // Pendo Track Event: sprint_simulation_completed
  if (typeof pendo !== 'undefined') {
    pendo.track('sprint_simulation_completed', {
      teamSize,
      sprintWeeks,
      totalFeatures: features.length,
      totalSprints: sprints.length,
      totalPoints: sprints.reduce((acc, s) => acc + s.points, 0),
      highConfidenceSprints: sprints.filter(s => s.confidence === 'high').length,
      lowConfidenceSprints: sprints.filter(s => s.confidence === 'low').length,
    });
  }

  pushInsight('⚡', `Sprint simulation complete. ${sprints.length} sprints to ship all ${features.length} features with ${teamSize} engineers. Highest risk: Sprint ${sprints.findIndex(s => s.confidence === 'low') + 1 || 'none'}.`);

  resultsEl.innerHTML = sprints.map(sprint => `
    <div class="sprint-sprint" style="animation-delay:${sprint.num * 0.1}s">
      <div class="sprint-sprint-header">
        <span class="sprint-sprint-title">Sprint ${sprint.num}</span>
        <div style="display:flex;align-items:center;gap:var(--sp-3)">
          <span style="font-size:var(--fs-xs);color:var(--text-muted)">${sprint.points}/${sprint.capacity} pts</span>
          <span class="sprint-confidence conf-${sprint.confidence}">${sprint.confidence.toUpperCase()} confidence</span>
        </div>
      </div>
      <div class="sprint-items-list">
        ${sprint.items.map(item => `
          <div class="sprint-item-row" style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <span class="sprint-item-name">${item.name}</span>
              <span class="sprint-item-pts">${item.points} pts</span>
              <span class="rice-effort-badge ${item.effortCls}">${item.effortLabel}</span>
            </div>
            <button class="btn btn--ghost btn--sm draft-prd-btn" data-feature="${item.name}">Draft PRD ⚡</button>
          </div>`).join('')}
      </div>
    </div>`).join('');

  toastSuccess('Simulation complete!', `${sprints.length} sprints planned for ${features.length} features.`);
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.pmtab').forEach(t => t.classList.toggle('active', t.dataset.pmtab === tab));
  document.querySelectorAll('.pmtab-content').forEach(c => c.classList.toggle('active', c.id === `pmtab-content-${tab}`));
}

function updateModuleStatus() {
  if (features.length >= 1) {
    State.setModuleStatus('priority-matrix', features.length >= 3 ? 'done' : 'active');
    State.updateHealth('launch', Math.min(100, features.length * 12 + 20));
    State.incrementScore(5);
  }
}
