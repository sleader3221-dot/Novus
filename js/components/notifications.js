// ============================================================
// SHIPSENSE — NOTIFICATIONS
// Toast notification system + AI Insight Feed
// ============================================================

import { State } from '../utils/state.js';

const container = document.getElementById('toast-container');

export function toast(title, msg = '', type = 'info', duration = 4000) {
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  const icons = { success: '✅', error: '❌', info: '💡', warning: '⚠️' };
  t.innerHTML = `
    <span class="toast-icon">${icons[type] || '💡'}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
    </div>
    <button class="toast-close" aria-label="Close">✕</button>
  `;

  t.querySelector('.toast-close').addEventListener('click', () => dismiss(t));
  container.appendChild(t);

  setTimeout(() => dismiss(t), duration);
  return t;
}

function dismiss(t) {
  t.classList.add('toast--exit');
  setTimeout(() => t.remove(), 300);
}

export function toastSuccess(title, msg) { return toast(title, msg, 'success'); }
export function toastError(title, msg)   { return toast(title, msg, 'error', 6000); }
export function toastInfo(title, msg)    { return toast(title, msg, 'info'); }
export function toastWarn(title, msg)    { return toast(title, msg, 'warning'); }

// ── AI Insight Feed ──────────────────────────────────────────
export function pushInsight(emoji, text) {
  State.addInsight(emoji, text);
  renderInsightFeed();

  // Show notification dot
  const dot = document.getElementById('notification-dot');
  if (dot) dot.classList.remove('hidden');
}

export function renderInsightFeed() {
  const feed = document.getElementById('insight-feed');
  if (!feed) return;

  const insights = State.get('insights');
  if (!insights || insights.length === 0) {
    feed.innerHTML = `
      <div class="insight-placeholder">
        <div class="insight-icon">🤖</div>
        <p>Your AI co-pilot is ready. Start using any module to get proactive insights here.</p>
      </div>`;
    return;
  }

  feed.innerHTML = insights.map(ins => `
    <div class="insight-item">
      <span class="insight-emoji">${ins.emoji}</span>
      <div>
        <div class="insight-text">${ins.text}</div>
        <div class="insight-time">${ins.time}</div>
      </div>
    </div>
  `).join('');
}

// ── Activity Feed ────────────────────────────────────────────
export function renderActivityFeed() {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;

  const activities = State.get('activities');
  if (!activities || activities.length === 0) {
    feed.innerHTML = '<div class="activity-empty">No activity yet. Start with IdeaForge →</div>';
    return;
  }

  feed.innerHTML = activities.map(a => `
    <div class="activity-item">
      <div class="activity-dot"></div>
      <span class="activity-label">${a.label}</span>
      <span class="activity-time">${a.time}</span>
    </div>
  `).join('');
}

// ── Score History ────────────────────────────────────────────
export function renderScoreHistory() {
  const el = document.getElementById('score-history');
  if (!el) return;

  const history = State.get('scoreHistory');
  if (!history || history.length === 0) {
    el.innerHTML = '<div class="score-history-empty">Score your ideas in IdeaForge to track them here.</div>';
    return;
  }

  el.innerHTML = history.map(h => {
    const color = h.score >= 70 ? 'var(--color-emerald)' : h.score >= 50 ? 'var(--color-amber)' : 'var(--color-rose)';
    return `
      <div class="score-history-item">
        <span class="sh-score-badge" style="color:${color}">${h.score}</span>
        <span class="sh-idea">${h.idea}</span>
        <span class="sh-time">just now</span>
      </div>`;
  }).join('');
}
