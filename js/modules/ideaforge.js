// ============================================================
// SHIPSENSE — IDEAFORGE MODULE
// Features 1-5: Ship Score™, Market Pulse, Devil's Advocate,
//               Competitor Radar, Pain Point Validator
// ============================================================

import {
  generateShipScore, generateMarketData, generateDevilsAdvocate,
  generateCompetitors, generatePainPoints, thinkDelay, getRandomIdea
} from '../ai-engine.js';
import {
  animateNumber, animateBigRing, animateBar, animateRing,
  getScoreVerdict, show, hide, markdownToHTML
} from '../utils/helpers.js';
import { State } from '../utils/state.js';
import { toastSuccess, pushInsight } from '../components/notifications.js';

let isAnalyzing = false;

export function initIdeaForge() {
  const ideaInput    = document.getElementById('idea-input');
  const analyzeBtn   = document.getElementById('idea-analyze-btn');
  const randomBtn    = document.getElementById('idea-random-btn');
  const charCount    = document.getElementById('idea-char-count');
  const toPRDBtn     = document.getElementById('idea-to-prd-btn');

  if (!ideaInput) return;

  // Char count
  ideaInput.addEventListener('input', () => {
    charCount.textContent = `${ideaInput.value.length}/500`;
  });

  // Random idea
  randomBtn?.addEventListener('click', () => {
    ideaInput.value = getRandomIdea();
    charCount.textContent = `${ideaInput.value.length}/500`;
    ideaInput.focus();
  });

  // Analyze
  analyzeBtn?.addEventListener('click', () => runAnalysis(ideaInput.value));

  // Enter to analyze
  ideaInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runAnalysis(ideaInput.value);
  });

  // Navigate to PRD
  toPRDBtn?.addEventListener('click', () => {
    const idea = ideaInput.value;
    const prdInput = document.getElementById('prd-idea-input');
    if (prdInput && idea) prdInput.value = idea;

    // Pendo Track Event: idea_sent_to_prd
    if (typeof pendo !== 'undefined') {
      pendo.track('idea_sent_to_prd', {
        ideaText: idea ? idea.substring(0, 100) : '',
        ideaLength: idea ? idea.length : 0,
      });
    }

    document.querySelector('.sidebar-item[data-module="prd-architect"]')?.click();
  });
}

async function runAnalysis(idea) {
  if (isAnalyzing) return;
  if (!idea || idea.trim().length < 10) {
    import('../components/notifications.js').then(n => n.toastWarn('Too short', 'Please describe your idea in at least 10 characters.'));
    return;
  }

  isAnalyzing = true;
  const btn     = document.getElementById('idea-analyze-btn');
  const btnText = document.getElementById('idea-btn-text');
  const spinner = document.getElementById('idea-spinner');

  btnText.textContent = 'Analyzing...';
  spinner.classList.remove('hidden');
  btn.disabled = true;

  showAIOverlay('Analyzing your idea…');

  await thinkDelay(1400, 2200);

  const scoreData      = generateShipScore(idea);
  const marketData     = generateMarketData(idea);
  const devilData      = generateDevilsAdvocate(idea);
  const competitors    = generateCompetitors(idea);
  const painData       = generatePainPoints(idea);

  hideAIOverlay();

  // Show results container
  const results = document.getElementById('idea-results');
  results.style.display = 'grid';

  // Animate Ship Score
  renderShipScore(scoreData);

  // Render all cards with staggered delays
  setTimeout(() => renderMarket(marketData), 200);
  setTimeout(() => renderDevil(devilData), 400);
  setTimeout(() => renderCompetitors(competitors), 600);
  setTimeout(() => renderPainPoints(painData), 800);

  // Update state
  State.set('currentIdea', idea);
  State.addScoreHistory(idea, scoreData.total);
  State.setModuleStatus('ideaforge', 'done');
  State.updateHealth('idea', scoreData.total);
  State.addActivity(`Scored idea: "${idea.substring(0, 40)}…"`, 'ideaforge');
  State.incrementScore(15);

  // Pendo Track Event: idea_analyzed
  if (typeof pendo !== 'undefined') {
    pendo.track('idea_analyzed', {
      ideaLength: idea.length,
      shipScoreTotal: scoreData.total,
      marketScore: scoreData.market,
      noveltyScore: scoreData.novelty,
      viabilityScore: scoreData.viability,
      timingScore: scoreData.timing,
      verdict: getScoreVerdict(scoreData.total).text,
      competitorCount: competitors.length,
      painValidationScore: painData.validationScore,
    });
  }

  // Push insights
  setTimeout(() => {
    pushInsight('🚀', `Your idea scored ${scoreData.total}/100 on the Ship Score™. ${scoreData.total >= 70 ? 'Strong signal — consider moving to PRD Architect.' : 'Consider refining the market fit before building.'}`);
    if (scoreData.market >= 70) {
      pushInsight('📊', `Market Pulse shows ${marketData.growth} CAGR with ${marketData.tam} TAM. This is a large and growing market.`);
    }
    if (devilData.length > 0) {
      pushInsight('😈', `Devil's Advocate flagged "${devilData[0].title}" as the top risk to watch. Plan your mitigation early.`);
    }
  }, 1000);

  toastSuccess('Analysis complete!', `Ship Score™: ${scoreData.total}/100`);

  // Reset button
  btnText.textContent = 'Re-analyze';
  spinner.classList.add('hidden');
  btn.disabled = false;
  isAnalyzing = false;
}

function renderShipScore(data) {
  const ringEl   = document.getElementById('idea-score-ring');
  const valueEl  = document.getElementById('idea-score-value');
  const verdictEl= document.getElementById('idea-verdict');

  // Animate ring
  animateBigRing(ringEl, data.total);

  // Animate number
  animateNumber(valueEl, 0, data.total, 1200);

  // Verdict
  const verdict = getScoreVerdict(data.total);
  verdictEl.textContent = verdict.text;
  verdictEl.className = `score-verdict ${verdict.cls}`;

  // Dim bars
  setTimeout(() => {
    const bars = [
      { id: 'sdg-market',   valId: 'sdg-market-v',   val: data.market },
      { id: 'sdg-novelty',  valId: 'sdg-novelty-v',  val: data.novelty },
      { id: 'sdg-viability',valId: 'sdg-viability-v', val: data.viability },
      { id: 'sdg-timing',   valId: 'sdg-timing-v',   val: data.timing },
    ];
    bars.forEach((b, i) => {
      const barEl = document.getElementById(b.id);
      const valEl = document.getElementById(b.valId);
      setTimeout(() => {
        animateBar(barEl, b.val, 0);
        if (valEl) animateNumber(valEl, 0, b.val, 1000);
      }, i * 120);
    });
  }, 300);
}

function renderMarket(data) {
  const el = document.getElementById('idea-market-content');
  if (!el) return;

  el.innerHTML = `
    <div class="market-content">
      <div class="market-stat"><span class="ms-key">Total Addressable Market</span><span class="ms-val">${data.tam}</span></div>
      <div class="market-stat"><span class="ms-key">Serviceable Market (SAM)</span><span class="ms-val">${data.sam}</span></div>
      <div class="market-stat"><span class="ms-key">Obtainable Market (SOM)</span><span class="ms-val">${data.som}</span></div>
      <div class="market-stat"><span class="ms-key">Annual Growth Rate</span><span class="ms-val" style="color:var(--color-emerald)">${data.growth} CAGR</span></div>
      <div class="market-stat"><span class="ms-key">Direct Competitors</span><span class="ms-val">${data.competitors}</span></div>
      <div class="market-insight">${data.insight}</div>
    </div>`;
}

function renderDevil(risks) {
  const el = document.getElementById('idea-devil-content');
  if (!el) return;

  el.innerHTML = `<div class="devil-content">
    ${risks.map((r, i) => `
      <div class="devil-risk">
        <span class="devil-num">${i + 1}</span>
        <div>
          <div class="devil-risk-text"><strong>${r.title}:</strong> ${r.text}</div>
          <div class="devil-counter">💡 Counter: ${r.counter}</div>
        </div>
      </div>`).join('')}
  </div>`;
}

function renderCompetitors(comps) {
  const el = document.getElementById('idea-comp-content');
  if (!el) return;

  el.innerHTML = `<div class="competitor-content">
    ${comps.map(c => `
      <div class="competitor-item">
        <div class="comp-avatar">${c.emoji}</div>
        <div class="comp-info">
          <div class="comp-name">${c.name}</div>
          <div class="comp-desc">${c.desc}</div>
        </div>
        <span class="comp-threat threat-${c.threat}">${c.threat.toUpperCase()}</span>
      </div>`).join('')}
  </div>`;
}

function renderPainPoints(data) {
  const el = document.getElementById('idea-pain-content');
  if (!el) return;

  el.innerHTML = `<div class="pain-content">
    ${data.evidence.map(e => `
      <div class="pain-evidence">
        <span class="pain-source">${e.source}</span>
        <div class="pain-text">${e.text}</div>
      </div>`).join('')}
    <div class="pain-validation-score">
      <span class="pvs-label">Pain Point Validation Score</span>
      <span class="pvs-value">${data.validationScore}/100</span>
    </div>
  </div>`;
}

// ── Landing page hero Ship Score ─────────────────────────────
export function initHeroShipScore() {
  const btn      = document.getElementById('hero-score-btn');
  const input    = document.getElementById('hero-idea-input');
  if (!btn || !input) return;

  btn.addEventListener('click', () => runHeroScore(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') runHeroScore(input.value); });

  // Auto-run on load
  setTimeout(() => runHeroScore(input.value), 800);
}

async function runHeroScore(idea) {
  if (!idea || idea.trim().length < 5) return;

  const btnText = document.getElementById('hero-score-btn-text');
  const spinner = document.getElementById('hero-spinner');
  btnText.textContent = 'Scoring…';
  spinner?.classList.remove('hidden');

  await thinkDelay(800, 1400);

  const data = generateShipScore(idea);

  // Pendo Track Event: hero_idea_scored
  if (typeof pendo !== 'undefined') {
    pendo.track('hero_idea_scored', {
      ideaLength: idea.length,
      shipScoreTotal: data.total,
      marketScore: data.market,
      noveltyScore: data.novelty,
      viabilityScore: data.viability,
      timingScore: data.timing,
    });
  }

  // Ring
  const ring = document.getElementById('hero-score-ring');
  const val  = document.getElementById('hero-score-value');
  animateRing(ring, data.total);
  animateNumber(val, 0, data.total, 1000);

  // Dim bars
  const dims = [
    { fillId: 'dim-market',   valId: 'dim-market-val',   v: data.market },
    { fillId: 'dim-novelty',  valId: 'dim-novelty-val',  v: data.novelty },
    { fillId: 'dim-viability',valId: 'dim-viability-val', v: data.viability },
    { fillId: 'dim-timing',   valId: 'dim-timing-val',   v: data.timing },
  ];
  dims.forEach((d, i) => {
    setTimeout(() => {
      const fillEl = document.getElementById(d.fillId);
      const valEl  = document.getElementById(d.valId);
      if (fillEl) animateBar(fillEl, d.v, 0);
      if (valEl) animateNumber(valEl, 0, d.v, 900);
    }, i * 100);
  });

  btnText.textContent = 'Re-score';
  spinner?.classList.add('hidden');
}

// ── Overlay helpers ──────────────────────────────────────────
function showAIOverlay(msg = 'Thinking…') {
  const overlay = document.getElementById('ai-overlay');
  const text    = document.getElementById('ai-thinking-text');
  const fill    = document.getElementById('ai-progress-fill');
  if (!overlay) return;
  if (text) text.textContent = msg;
  if (fill) {
    fill.style.animation = 'none';
    fill.offsetHeight; // reflow
    fill.style.animation = 'progressBar 3s ease forwards';
  }
  overlay.classList.remove('hidden');
}

function hideAIOverlay() {
  document.getElementById('ai-overlay')?.classList.add('hidden');
}

export { showAIOverlay, hideAIOverlay };
