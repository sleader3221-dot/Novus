// ============================================================
// SHIPSENSE — FEEDBACK FUSION MODULE
// Features 21-25: Feedback Cluster AI, Sentiment Trajectory,
//                 Feature Request Ranker, NPS Decoder,
//                 Competitive Intel Digester
// ============================================================

import { analyzeFeedback, thinkDelay, getSampleFeedback } from '../ai-engine.js';
import { animateBar, animateNumber } from '../utils/helpers.js';
import { State } from '../utils/state.js';
import { toastSuccess, pushInsight } from '../components/notifications.js';
import { showAIOverlay, hideAIOverlay } from './ideaforge.js';

let fbType = 'raw';
let isAnalyzing = false;

export function initFeedbackFusion() {
  const fbInput   = document.getElementById('feedback-input');
  const analyzeBtn= document.getElementById('fb-analyze-btn');
  const sampleBtn = document.getElementById('fb-sample-btn');

  if (!fbInput) return;

  // Feedback type tabs
  document.querySelectorAll('.fbtab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.fbtab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      fbType = tab.dataset.fbtype;

      // Update placeholder
      const placeholders = {
        raw:        'Paste customer feedback, support tickets, survey responses, or user interview notes here...',
        nps:        'Paste NPS survey verbatim responses here (one per line)...\n\nExample:\n"Great tool but needs better onboarding"\n"Would recommend to all PMs I know"\n"Missing the integrations I need"',
        competitor: 'Paste competitor reviews from G2, Capterra, or App Store (one per line)...',
      };
      fbInput.placeholder = placeholders[fbType] || placeholders.raw;
    });
  });

  sampleBtn?.addEventListener('click', () => {
    fbInput.value = getSampleFeedback();
    fbInput.style.height = 'auto';
    fbInput.style.height = fbInput.scrollHeight + 'px';
  });

  analyzeBtn?.addEventListener('click', () => runAnalysis(fbInput.value));
}

async function runAnalysis(rawText) {
  if (isAnalyzing) return;
  if (!rawText || rawText.trim().length < 20) {
    import('../components/notifications.js').then(n => n.toastWarn('Not enough data', 'Please paste at least a few lines of feedback.'));
    return;
  }

  isAnalyzing = true;
  const btn     = document.getElementById('fb-analyze-btn');
  const btnText = document.getElementById('fb-btn-text');
  const spinner = document.getElementById('fb-spinner');

  btnText.textContent = 'Analyzing…';
  spinner?.classList.remove('hidden');
  btn.disabled = true;

  showAIOverlay('Clustering your feedback…');
  await thinkDelay(1800, 2800);

  const results = analyzeFeedback(rawText, fbType);
  State.set('feedbackResults', results);

  hideAIOverlay();

  // Show results section
  const resultsEl = document.getElementById('feedback-results');
  resultsEl.style.display = 'block';

  // Render each section with staggered animations
  renderClusters(results.clusters);
  setTimeout(() => renderSentiment(results.sentiment), 200);
  setTimeout(() => renderFeatureRanker(results.featureRanking), 400);
  setTimeout(() => renderTrajectory(results.trajectory), 600);

  // State updates
  State.setModuleStatus('feedback-fusion', 'done');
  State.addActivity(`Analyzed ${rawText.split('\n').filter(l => l.trim()).length} feedback items`, 'feedback-fusion');
  State.incrementScore(16);

  // Insights
  const topCluster = results.clusters[0];
  const topFeature = results.featureRanking[0];
  pushInsight('💬', `Top feedback theme: "${topCluster.name}" (${topCluster.count} mentions). This is your highest-signal area to address in your next sprint.`);
  pushInsight('⭐', `Top feature request: "${topFeature.name}" with ${topFeature.mentions} user mentions. Score it in PriorityMatrix to see if it belongs in your roadmap.`);

  const sentimentLabel = results.sentiment.positive > results.sentiment.negative ? 'predominantly positive' : 'mixed with notable negatives';
  pushInsight('📈', `Sentiment is ${sentimentLabel} (${results.sentiment.positive}% positive). ${results.sentiment.negative > 30 ? 'High negative sentiment warrants urgent attention.' : 'Good signal — users like the core value.'}`);

  toastSuccess('Analysis complete!', `Found ${results.clusters.length} themes across your feedback.`);

  btnText.textContent = 'Re-analyze';
  spinner?.classList.add('hidden');
  btn.disabled = false;
  isAnalyzing = false;
}

function renderClusters(clusters) {
  const el = document.getElementById('feedback-clusters');
  if (!el) return;

  const clusterColors = [
    'var(--color-violet)',
    'var(--color-amber)',
    'var(--color-rose)',
    'var(--color-cyan)',
    'var(--color-emerald)',
  ];

  el.innerHTML = clusters.map((c, i) => `
    <div class="cluster-item" style="border-left-color:${clusterColors[i % clusterColors.length]};animation-delay:${i * 0.08}s">
      <div class="cluster-header">
        <span class="cluster-name">${c.name}</span>
        <span class="cluster-count">${c.count} mentions</span>
      </div>
      <div class="cluster-desc">${c.desc}</div>
      <div class="cluster-quotes">
        ${c.quotes.slice(0, 2).map(q => `<div class="cluster-quote">${q}</div>`).join('')}
      </div>
    </div>`).join('');
}

function renderSentiment(sentiment) {
  const el = document.getElementById('sentiment-display');
  if (!el) return;

  const total = sentiment.positive + sentiment.neutral + sentiment.negative;
  const sentItems = [
    { label: '😊 Positive', cls: 'sent-positive', pct: sentiment.positive, color: 'var(--color-emerald)' },
    { label: '😐 Neutral',  cls: 'sent-neutral',  pct: sentiment.neutral,  color: 'var(--color-indigo)' },
    { label: '😞 Negative', cls: 'sent-negative',  pct: sentiment.negative, color: 'var(--color-rose)' },
  ];

  el.innerHTML = `
    <div class="sentiment-display">
      ${sentItems.map(s => `
        <div class="sentiment-bar-row">
          <span class="sent-label">${s.label}</span>
          <div class="sent-bar">
            <div class="sent-fill ${s.cls}" id="sent-${s.cls}" style="width:0%"></div>
          </div>
          <span class="sent-val">${s.pct}%</span>
        </div>`).join('')}
      <div style="margin-top:var(--sp-4);padding:var(--sp-3);background:rgba(255,255,255,0.03);border-radius:var(--r-md)">
        <div style="font-size:var(--fs-xs);color:var(--text-muted);margin-bottom:var(--sp-2)">Overall Sentiment Score</div>
        <div style="font-family:var(--font-display);font-size:var(--fs-2xl);font-weight:800;color:${sentiment.positive > sentiment.negative ? 'var(--color-emerald)' : 'var(--color-amber)'}">
          ${Math.round((sentiment.positive - sentiment.negative + 100) / 2)}/100
        </div>
      </div>
    </div>`;

  // Animate bars
  setTimeout(() => {
    sentItems.forEach((s, i) => {
      setTimeout(() => {
        const barEl = el.querySelector(`.${s.cls}`);
        if (barEl) animateBar(barEl, s.pct, 0);
      }, i * 150);
    });
  }, 100);
}

function renderFeatureRanker(features) {
  const el = document.getElementById('feature-ranker');
  if (!el) return;

  el.innerHTML = features.map((f, i) => `
    <div class="fr-item" style="animation-delay:${i * 0.06}s">
      <span class="fr-rank ${i < 3 ? 'top' : ''}">#${i + 1}</span>
      <span class="fr-name">${f.name}</span>
      <span class="fr-mentions">${f.mentions} mentions</span>
      <span class="fr-score">${f.score}</span>
    </div>`).join('');
}

function renderTrajectory(trajectory) {
  const el = document.getElementById('trajectory-chart');
  if (!el) return;

  const maxVal = Math.max(...trajectory.map(t => Math.max(t.positive, t.negative)));

  el.innerHTML = `
    <div style="display:flex;gap:var(--sp-5)">
      <div style="flex:1">
        <div style="font-size:var(--fs-xs);color:var(--color-emerald);font-weight:700;margin-bottom:var(--sp-2)">😊 Positive Trend</div>
        <div class="traj-bars" style="margin-bottom:var(--sp-2)">
          ${trajectory.map((t, i) => `
            <div class="traj-bar traj-bar--positive"
                 style="height:0px;transition:height 0.8s ease ${i * 0.1}s"
                 data-height="${(t.positive / maxVal) * 100}px"
                 title="${t.label}: ${t.positive}%">
            </div>`).join('')}
        </div>
        <div class="traj-labels">
          ${trajectory.map(t => `<span class="traj-label">${t.label}</span>`).join('')}
        </div>
      </div>
      <div style="flex:1">
        <div style="font-size:var(--fs-xs);color:var(--color-rose);font-weight:700;margin-bottom:var(--sp-2)">😞 Negative Trend</div>
        <div class="traj-bars" style="margin-bottom:var(--sp-2)">
          ${trajectory.map((t, i) => `
            <div class="traj-bar traj-bar--negative"
                 style="height:0px;transition:height 0.8s ease ${i * 0.1}s"
                 data-height="${(t.negative / maxVal) * 100}px"
                 title="${t.label}: ${t.negative}%">
            </div>`).join('')}
        </div>
        <div class="traj-labels">
          ${trajectory.map(t => `<span class="traj-label">${t.label}</span>`).join('')}
        </div>
      </div>
    </div>`;

  // Animate bar heights
  setTimeout(() => {
    el.querySelectorAll('.traj-bar').forEach(bar => {
      bar.style.height = bar.dataset.height;
    });
  }, 200);
}
