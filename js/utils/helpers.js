// ============================================================
// SHIPSENSE — HELPERS
// Utility functions used across all modules
// ============================================================

/** Debounce a function */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Clamp a number between min and max */
export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

/** Animate a number from start to end */
export function animateNumber(el, from, to, duration = 1200, suffix = '') {
  if (!el) return;
  const start = performance.now();
  const diff = to - from;
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);
    const current = Math.round(from + diff * eased);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/** Animate a CSS width from 0 to target% */
export function animateBar(el, targetPct, delay = 0) {
  if (!el) return;
  el.style.width = '0%';
  setTimeout(() => {
    el.style.transition = 'width 1.1s cubic-bezier(0.34, 1.2, 0.64, 1)';
    el.style.width = targetPct + '%';
  }, delay);
}

/** Animate score ring SVG circle */
export function animateRing(el, score, maxScore = 100, circumference = 314) {
  if (!el) return;
  const offset = circumference - (score / maxScore) * circumference;
  el.style.strokeDasharray = circumference;
  el.style.strokeDashoffset = circumference;
  setTimeout(() => {
    el.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.2, 0.64, 1)';
    el.style.strokeDashoffset = offset;
  }, 50);
}

/** Animate a larger ring (r=68, circumference=427) */
export function animateBigRing(el, score, maxScore = 100) {
  animateRing(el, score, maxScore, 427);
}

/** Format a number with K/M suffix */
export function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

/** Get score color based on value */
export function getScoreColor(score) {
  if (score >= 75) return 'var(--color-emerald)';
  if (score >= 50) return 'var(--color-amber)';
  return 'var(--color-rose)';
}

/** Get score verdict text */
export function getScoreVerdict(score) {
  if (score >= 85) return { text: '🔥 Ship It! Exceptional idea.', cls: 'verdict--high' };
  if (score >= 70) return { text: '✅ Strong Signal — worth building', cls: 'verdict--high' };
  if (score >= 55) return { text: '⚡ Promising — needs refinement', cls: 'verdict--mid' };
  if (score >= 40) return { text: '🤔 Risky — validate first', cls: 'verdict--mid' };
  return { text: '⚠️ High Risk — pivot or rethink', cls: 'verdict--low' };
}

/** Simple hash from a string (for deterministic demo data) */
export function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Generate a deterministic score between min and max based on input */
export function deterministicScore(input, min, max) {
  const hash = hashString(input);
  return min + (hash % (max - min + 1));
}

/** Convert markdown-like text to HTML */
export function markdownToHTML(text) {
  if (!text) return '';
  let html = text
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // HR
    .replace(/^---$/gm, '<hr/>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Unordered lists
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    // Ordered lists  
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive li in ul
    .replace(/(<li>.*<\/li>\n?)+/g, match => `<ul>${match}</ul>`)
    // Paragraphs (double newline)
    .replace(/\n\n(?!<)/g, '</p><p>')
    // Line breaks
    .replace(/\n(?!<)/g, '<br/>');

  // Wrap in paragraph if not already block element
  if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<hr')) {
    html = '<p>' + html + '</p>';
  }
  return html;
}

/** Copy text to clipboard */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

/** Download text as a file */
export function downloadFile(content, filename, type = 'text/markdown') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Sleep for ms milliseconds */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Pick random item from array */
export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Shuffle array in place */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Format date as relative time */
export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

/** Show/hide element */
export function show(el) { if (el) el.style.display = ''; }
export function hide(el) { if (el) el.style.display = 'none'; }
export function toggle(el, show) {
  if (el) el.style.display = show ? '' : 'none';
}

/** Add/remove class */
export function addClass(el, cls) { if (el) el.classList.add(cls); }
export function removeClass(el, cls) { if (el) el.classList.remove(cls); }
export function toggleClass(el, cls, force) { if (el) el.classList.toggle(cls, force); }

/** Create element with props */
export function createElement(tag, cls = '', html = '') {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html) el.innerHTML = html;
  return el;
}

/** Safe querySelector */
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
export function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

/** Capitalize first letter */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Truncate string */
export function truncate(str, maxLen = 60) {
  if (!str || str.length <= maxLen) return str;
  return str.substring(0, maxLen) + '…';
}
