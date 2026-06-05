// ============================================================
// SHIPSENSE — PRD ARCHITECT MODULE
// Features 6-10: PRD Generator, User Stories, AC Builder,
//                PRD Health Score, Version Timeline
// ============================================================

import { generatePRD, generatePRDHealth, thinkDelay } from '../ai-engine.js';
import { markdownToHTML, copyToClipboard, downloadFile, show, hide } from '../utils/helpers.js';
import { State } from '../utils/state.js';
import { toastSuccess, toastInfo, pushInsight } from '../components/notifications.js';
import { showAIOverlay, hideAIOverlay } from './ideaforge.js';

let currentPRDText = '';
let prdType = 'full-prd';
let prdAudience = 'engineering';
let isGenerating = false;

export function initPRDArchitect() {
  const ideaInput   = document.getElementById('prd-idea-input');
  const generateBtn = document.getElementById('prd-generate-btn');
  const healthBtn   = document.getElementById('prd-health-btn');
  const copyBtn     = document.getElementById('prd-copy-btn');
  const downloadBtn = document.getElementById('prd-download-btn');

  if (!ideaInput) return;

  // Type pills
  document.querySelectorAll('#prd-type-group .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#prd-type-group .pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      prdType = pill.dataset.val;
    });
  });

  // Audience pills
  document.querySelectorAll('#prd-audience-group .pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#prd-audience-group .pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      prdAudience = pill.dataset.val;
    });
  });

  // Pre-fill from IdeaForge if available
  const currentIdea = State.get('currentIdea');
  if (currentIdea && !ideaInput.value) ideaInput.value = currentIdea;

  generateBtn?.addEventListener('click', () => runGenerate(ideaInput.value));
  healthBtn?.addEventListener('click', () => runHealthCheck(ideaInput.value));
  copyBtn?.addEventListener('click', handleCopy);
  downloadBtn?.addEventListener('click', handleDownload);
}

async function runGenerate(idea) {
  if (isGenerating) return;
  if (!idea || idea.trim().length < 5) {
    import('../components/notifications.js').then(n => n.toastWarn('Missing input', 'Please describe what you want to spec out.'));
    return;
  }

  isGenerating = true;
  const btn     = document.getElementById('prd-generate-btn');
  const btnText = document.getElementById('prd-btn-text');
  const spinner = document.getElementById('prd-spinner');

  btnText.textContent = 'Generating…';
  spinner?.classList.remove('hidden');
  btn.disabled = true;

  const typeLabels = { 'full-prd': 'Writing your PRD…', 'user-stories': 'Generating user stories…', 'ac-only': 'Building acceptance criteria…' };
  showAIOverlay(typeLabels[prdType] || 'Generating document…');

  await thinkDelay(1600, 2600);

  const prdContent = await generatePRD(idea, prdType, prdAudience);
  currentPRDText = prdContent;

  hideAIOverlay();

  // Render with streaming effect
  const contentArea = document.getElementById('prd-content-area');
  const outputLabel = document.getElementById('prd-output-label');

  const typeLabel = { 'full-prd': 'PRD Output', 'user-stories': 'User Stories', 'ac-only': 'Acceptance Criteria' };
  outputLabel.textContent = typeLabel[prdType] || 'Output';

  contentArea.innerHTML = `<div class="prd-rendered" id="prd-rendered-content"></div>`;
  const rendered = document.getElementById('prd-rendered-content');

  // Simulate streaming by revealing lines progressively
  await streamMarkdown(rendered, prdContent);

  // Add to version history
  addVersion(idea, prdType);

  // State updates
  State.set('currentPRD', prdContent);
  State.setModuleStatus('prd-architect', 'done');
  State.updateHealth('prd', 78 + Math.floor(Math.random() * 18));
  State.addActivity(`Generated ${typeLabel[prdType]} for "${idea.substring(0, 35)}…"`, 'prd-architect');
  State.incrementScore(20);

  pushInsight('📄', `PRD generated for "${idea.substring(0, 40)}". Check the PRD Health Score to identify any missing sections before sharing with engineering.`);

  toastSuccess('PRD Generated!', 'Copy or download your document below.');

  btnText.textContent = 'Regenerate';
  spinner?.classList.add('hidden');
  btn.disabled = false;
  isGenerating = false;
}

async function streamMarkdown(container, text) {
  const lines = text.split('\n');
  let html = '';
  for (let i = 0; i < lines.length; i++) {
    html += lines[i] + '\n';
    if (i % 3 === 0 || i === lines.length - 1) {
      container.innerHTML = markdownToHTML(html) + '<span class="streaming-cursor"></span>';
      container.scrollTop = container.scrollHeight;
      await new Promise(r => setTimeout(r, 18));
    }
  }
  // Final render without cursor
  container.innerHTML = markdownToHTML(text);
}

async function runHealthCheck(idea) {
  const panel = document.getElementById('prd-health-panel');
  if (!panel) return;

  const content = currentPRDText || idea || '';
  const health = generatePRDHealth(content);

  panel.style.display = 'block';

  const circle = document.getElementById('prd-health-circle');
  const checksEl = document.getElementById('prd-health-checks');
  const scoreEl = document.getElementById('prd-health-score');

  if (scoreEl) scoreEl.textContent = health.score;
  if (circle) {
    const color = health.score >= 70 ? '#10b981' : health.score >= 50 ? '#f59e0b' : '#f43f5e';
    circle.style.background = `conic-gradient(${color} ${health.score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`;
  }

  if (checksEl) {
    checksEl.innerHTML = health.checks.map(c => `
      <div class="health-check-item">
        <span class="${c.pass ? 'hc-pass' : 'hc-fail'}">${c.pass ? '✓' : '✗'}</span>
        <span>${c.label}</span>
      </div>`).join('');
  }

  toastInfo('Health check complete', `PRD score: ${health.score}/100`);
}

function addVersion(idea, type) {
  const timeline = document.getElementById('prd-version-timeline');
  const itemsEl  = document.getElementById('prd-timeline-items');
  if (!timeline || !itemsEl) return;

  timeline.classList.remove('hidden');

  const versions = State.get('prdVersions') || [];
  versions.unshift({
    label: `v${versions.length + 1}.0 — ${type === 'full-prd' ? 'Full PRD' : type === 'user-stories' ? 'User Stories' : 'AC'}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    idea: idea.substring(0, 40),
  });
  if (versions.length > 5) versions.pop();
  State.set('prdVersions', versions);

  itemsEl.innerHTML = versions.map(v => `
    <div class="timeline-item">
      <div class="ti-dot"></div>
      <div>
        <div class="ti-label">${v.label}</div>
        <div class="ti-time">${v.time} · ${v.idea}</div>
      </div>
    </div>`).join('');
}

async function handleCopy() {
  if (!currentPRDText) {
    import('../components/notifications.js').then(n => n.toastWarn('Nothing to copy', 'Generate a PRD first.'));
    return;
  }
  await copyToClipboard(currentPRDText);
  toastSuccess('Copied!', 'PRD content copied to clipboard.');
}

function handleDownload() {
  if (!currentPRDText) {
    import('../components/notifications.js').then(n => n.toastWarn('Nothing to download', 'Generate a PRD first.'));
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  const element = document.getElementById('prd-rendered-content');
  
  if (element && window.html2pdf) {
    // PDF Export Polish
    const opt = {
      margin:       10,
      filename:     `shipsense-prd-${date}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      toastSuccess('PDF Downloaded!', 'Your polished PRD is ready.');
      if (window.novus) window.novus.track('prd_pdf_downloaded');
    });
  } else {
    // Fallback to markdown
    downloadFile(currentPRDText, `shipsense-prd-${date}.md`);
    toastSuccess('Downloaded!', 'Your PRD markdown file is ready.');
  }
}
