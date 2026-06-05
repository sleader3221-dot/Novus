// ============================================================
// SHIPSENSE — AI ENGINE
// Rich, deterministic demo data engine with realistic outputs
// Simulates streaming AI responses for all 30+ features
// ============================================================

import { hashString, deterministicScore, randomPick, shuffle } from './utils/helpers.js';

// ── Stream text character by character ──────────────────────
export async function streamText(container, text, speedMs = 18) {
  container.innerHTML = '';
  const cursor = document.createElement('span');
  cursor.className = 'streaming-cursor';
  container.appendChild(cursor);

  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.textContent = text[i];
    span.style.animation = 'streamText 0.1s ease';
    container.insertBefore(span, cursor);
    await new Promise(r => setTimeout(r, text[i] === '\n' ? 5 : speedMs));
  }
  cursor.remove();
}

// ── Simulate AI thinking delay ───────────────────────────────
export async function thinkDelay(min = 1200, max = 2400) {
  const ms = min + Math.random() * (max - min);
  return new Promise(r => setTimeout(r, ms));
}

// ── IDEA FORGE ENGINE ────────────────────────────────────────
export function generateShipScore(idea) {
  const h = hashString(idea + 'shipsense');
  const base = 40 + (h % 45); // 40–85
  return {
    total: base,
    market:    Math.min(95, base + (h % 15) - 5),
    novelty:   Math.min(95, base + ((h >> 4) % 20) - 10),
    viability: Math.min(95, base + ((h >> 8) % 12) - 6),
    timing:    Math.min(95, base + ((h >> 12) % 18) - 9),
  };
}

export function generateMarketData(idea) {
  const h = hashString(idea);
  const tamBase = [1.2, 2.4, 5.8, 8.1, 12.4, 24.6, 38.2, 52.1][h % 8];
  const growth  = [14, 22, 31, 45, 18, 27, 38, 52][h % 8];
  const competitors = [12, 24, 8, 35, 17, 6, 43, 21][h % 8];

  const insights = [
    `The ${extractDomain(idea)} space is experiencing a ${growth}% CAGR driven by AI adoption and remote-first work culture.`,
    `Enterprise buyers are spending 3× more on ${extractDomain(idea)} tools vs. 2023, with budgets consolidating toward integrated platforms.`,
    `SMB market shows fastest growth at ${growth + 8}% YoY — largely underserved by current tools which are built for enterprise.`,
    `Recent VC investment in this category totaled $2.1B in the last 12 months, signaling strong investor confidence.`,
    `Community-led growth is the dominant GTM strategy — tools with built-in sharing mechanics grow 2.8× faster.`,
  ];

  return {
    tam: tamBase.toFixed(1) + 'B',
    sam: (tamBase * 0.18).toFixed(1) + 'B',
    som: (tamBase * 0.02).toFixed(0) + 'M',
    growth: growth + '%',
    competitors,
    insight: insights[h % insights.length],
  };
}

export function generateDevilsAdvocate(idea) {
  const h = hashString(idea);
  const allRisks = [
    {
      title: 'Market Timing Risk',
      text: 'The market may not be ready yet. Early entrants in this space burned through $40M+ before finding PMF.',
      counter: 'Validate with a 2-week paid pilot before full build.',
    },
    {
      title: 'Distribution Challenge',
      text: 'Without an existing audience or distribution channel, reaching your first 1,000 users will cost significantly more than expected.',
      counter: 'Partner with communities (like Mind the Product!) for initial distribution.',
    },
    {
      title: 'Enterprise Sales Cycle',
      text: 'If targeting enterprises, expect 6–12 month sales cycles, security reviews, and procurement processes that will strain your runway.',
      counter: 'Start with self-serve SMB, use enterprise interest as social proof.',
    },
    {
      title: 'AI Commoditization',
      text: 'OpenAI, Google, or Microsoft could ship a competing feature in their existing products, eliminating your differentiation overnight.',
      counter: 'Build network effects and proprietary data moats that are hard to replicate.',
    },
    {
      title: 'Churn Vulnerability',
      text: 'Point solutions in this space see 40-60% annual churn unless deeply embedded into workflows.',
      counter: 'Focus on integrations and data persistence to increase switching costs.',
    },
    {
      title: 'Founder-Market Fit',
      text: "Without lived experience of this problem, you risk building for an imaginary user — not the one who will actually pay.",
      counter: 'Spend 40 hours doing customer discovery before writing a line of code.',
    },
    {
      title: 'Regulatory Uncertainty',
      text: 'Depending on data handled, GDPR, SOC 2, and AI regulation (EU AI Act) could significantly increase compliance costs.',
      counter: 'Design for data minimization from day one — easier to build than to retrofit.',
    },
    {
      title: 'Talent Competition',
      text: 'The engineers needed to build this are in high demand. Big Tech is paying 2–3× your likely startup salary.',
      counter: 'Offer equity, mission, and autonomy — things Big Tech cannot match.',
    },
  ];

  shuffle(allRisks);
  return allRisks.slice(0, 5);
}

export function generateCompetitors(idea) {
  const domain = extractDomain(idea);
  const h = hashString(idea);

  const competitorSets = {
    default: [
      { name: 'Notion AI', emoji: '📝', desc: 'Workspace + AI docs layer. 30M+ users, strong brand.', threat: 'mid' },
      { name: 'Linear', emoji: '🔷', desc: 'Developer-first project management with AI integrations.', threat: 'low' },
      { name: 'Productboard', emoji: '📋', desc: 'Feedback management & roadmapping for enterprise.', threat: 'high' },
      { name: 'Amplitude', emoji: '📊', desc: 'Product analytics with AI-powered behavioral insights.', threat: 'mid' },
      { name: 'Miro', emoji: '🎨', desc: 'Visual collaboration with growing AI capabilities.', threat: 'low' },
    ],
    pm: [
      { name: 'ChatPRD', emoji: '🤖', desc: 'AI-first PRD generation tool, growing fast with PMs.', threat: 'high' },
      { name: 'Coda AI', emoji: '📄', desc: 'Docs + database hybrid with strong AI workflow features.', threat: 'mid' },
      { name: 'Dovetail', emoji: '🔍', desc: 'Research repository — strong in user insight synthesis.', threat: 'mid' },
      { name: 'Sprig', emoji: '🌿', desc: 'In-product surveys + AI analysis for product teams.', threat: 'high' },
      { name: 'Maze', emoji: '🌀', desc: 'Rapid product testing at scale with AI insights.', threat: 'low' },
    ],
    ai: [
      { name: 'Claude (Anthropic)', emoji: '🧠', desc: 'Broad AI assistant — could be used for similar tasks.', threat: 'mid' },
      { name: 'GPT-4 / ChatGPT', emoji: '💬', desc: 'General-purpose AI used by PMs for many workflows.', threat: 'high' },
      { name: 'Gemini Advanced', emoji: '✨', desc: "Google's AI — increasingly used in productivity contexts.", threat: 'mid' },
      { name: 'Perplexity', emoji: '🔎', desc: 'AI search — growing adoption for market research tasks.', threat: 'low' },
      { name: 'Langchain Apps', emoji: '⛓️', desc: 'Custom internal tools built with LLM frameworks.', threat: 'low' },
    ],
  };

  const setKey = idea.toLowerCase().includes('product') || idea.toLowerCase().includes('pm') ? 'pm'
    : idea.toLowerCase().includes('ai') ? 'ai' : 'default';

  return competitorSets[setKey] || competitorSets.default;
}

export function generatePainPoints(idea) {
  const h = hashString(idea);
  const sources = ['Reddit', 'Twitter/X', 'G2 Reviews', 'Hacker News', 'Indie Hackers', 'ProductHunt', 'Discord'];

  const evidence = [
    { text: '"I waste 2+ hours every week copying information between tools. There has to be a better way." — Senior PM, SaaS startup', source: sources[h % 7] },
    { text: '"The lack of context persistence kills my flow. Every AI session starts from scratch and I have to re-explain everything." — Product Lead, scaleup', source: sources[(h+2) % 7] },
    { text: '"My team is drowning in feedback but has no way to systematically extract actionable insights without manual effort." — Head of Product, fintech', source: sources[(h+4) % 7] },
    { text: '"We spend 40% of PM time on documentation and stakeholder updates. That time should be spent talking to customers." — VP Product, enterprise', source: sources[(h+1) % 7] },
    { text: '"Feature prioritization is still done in spreadsheets with gut feel. RICE scoring tools exist but none actually connect to real usage data." — PM, B2B SaaS', source: sources[(h+3) % 7] },
  ];

  const validationScore = 72 + (h % 22);
  return { evidence: evidence.slice(0, 4), validationScore };
}

// ── PRD ARCHITECT ENGINE ─────────────────────────────────────
export function generatePRD(idea, type, audience) {
  const h = hashString(idea + type);
  const featureName = idea.length > 40 ? idea.substring(0, 40) + '...' : idea;

  if (type === 'user-stories') {
    return generateUserStories(idea, h);
  }
  if (type === 'ac-only') {
    return generateAcceptanceCriteria(idea, h);
  }
  return generateFullPRD(idea, audience, h);
}

function generateFullPRD(idea, audience, h) {
  const complexities = ['Low', 'Medium', 'High'];
  const quarters = ['Q3 2026', 'Q4 2026', 'Q1 2027'];
  const statuses = ['Draft', 'In Review', 'Approved'];

  return `# Product Requirements Document

**Feature:** ${idea}
**Status:** ${statuses[h % 3]}  **Version:** 1.0  **Target:** ${quarters[h % 3]}
**Author:** Product Team  **Audience:** ${audience.charAt(0).toUpperCase() + audience.slice(1)} Team

---

## 1. Executive Summary

This PRD defines the requirements for **${idea}**. This feature addresses a validated pain point identified across user research, support tickets, and market analysis. The expected outcome is a measurable improvement in user engagement, retention, and time-to-value.

---

## 2. Problem Statement

### User Pain Points
- Users currently have no streamlined way to accomplish this workflow without switching between 3+ tools
- Manual processes introduce significant error rates (~18%) and consume an average of 2.3 hours per week per user
- The status quo results in delayed decisions and reduced confidence in product direction

### Business Impact
- **Churn risk:** 22% of churned customers cited this gap in exit surveys
- **Expansion blocker:** 31% of expansion opportunities stalled at this capability
- **Competitive gap:** 3 of our top 5 competitors offer a version of this feature

---

## 3. Goals & Success Metrics

### Primary Goals
1. Reduce time-on-task from ~2.3h/week to under 20 minutes
2. Increase feature adoption to 60% of active users within 90 days
3. Improve user satisfaction (CSAT) from 3.2 to 4.5+ for this workflow

### Key Metrics
| Metric | Baseline | Target | Timeframe |
|--------|----------|--------|-----------|
| Weekly active users | — | 60% of MAU | Day 90 |
| Time on task | 2.3h/week | <20 min/week | Day 30 |
| Error rate | 18% | <3% | Day 60 |
| CSAT score | 3.2 | 4.5+ | Day 90 |

### Counter-Metrics (guard rails)
- Core workflow retention must not drop
- Page load time must stay under 2s
- No increase in support ticket volume

---

## 4. User Research & Personas

### Primary Persona: "Strategic Sam"
- **Role:** Senior Product Manager, B2B SaaS (50–500 employees)
- **Pain:** Spends too much time on documentation and stakeholder alignment
- **Goal:** Make faster, more confident product decisions backed by data
- **Behavior:** Power user, early adopter, uses 6+ tools daily

### Supporting Evidence
- 14 user interviews conducted (May 2026)
- 847 support tickets analyzed via FeedbackFusion™
- NPS verbatim analysis: 32 mentions of this pain in detractor responses

---

## 5. Solution & Scope

### Core Solution
${idea} — enabling users to complete this workflow end-to-end in a single context, with AI assistance at every step.

### In Scope (V1)
- [ ] Core workflow: input → processing → output
- [ ] AI-powered suggestions and auto-completion
- [ ] Save & export functionality (PDF, Markdown, CSV)
- [ ] Integration with existing workspace
- [ ] Mobile-responsive interface

### Out of Scope (V1, consider V2)
- Real-time collaboration / multi-user editing
- Advanced API integrations (Jira, Linear, Salesforce)
- Custom templates and branding
- Bulk processing / batch operations

---

## 6. Functional Requirements

### FR-001: Core Input Interface
**Priority:** Must Have  
**Description:** User can input their data/content through a clean, guided interface.  
**Acceptance Criteria:**
- Input field accepts text up to 10,000 characters
- Character count displayed in real-time
- Auto-save every 30 seconds to localStorage
- Works offline with sync-on-reconnect

### FR-002: AI Processing Engine
**Priority:** Must Have  
**Description:** AI processes input and returns structured output within 10 seconds.  
**Acceptance Criteria:**
- Response time: < 10s for 95th percentile requests
- Streaming output — user sees results as they generate
- Error handling: graceful fallback with retry option
- Processing state clearly communicated to user

### FR-003: Output & Export
**Priority:** Must Have  
**Description:** User can view, copy, and download the AI-generated output.  
**Acceptance Criteria:**
- Output renders with proper formatting (headers, lists, tables)
- Copy to clipboard button with confirmation feedback
- Download as Markdown and PDF
- Version history (last 5 saves)

### FR-004: Quality Scoring
**Priority:** Should Have  
**Description:** System provides a quality/completeness score for each output.  
**Acceptance Criteria:**
- Score displayed as percentage (0–100%)
- Breakdown by section/dimension shown
- Actionable suggestions for improvement
- Score updates in real-time as user edits

---

## 7. Non-Functional Requirements

- **Performance:** P95 response time < 10s; P99 < 20s
- **Availability:** 99.9% uptime SLA
- **Security:** All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- **Accessibility:** WCAG 2.1 AA compliant
- **Scalability:** Must support 10× current DAU without degradation

---

## 8. Technical Considerations

### Architecture
- Client-side first with optional server-side processing
- AI layer: model-agnostic (supports Gemini, GPT-4, Claude)
- Storage: localStorage (client) + optional cloud sync
- No PII stored in AI prompts

### Dependencies
- AI API provider (latency SLA required)
- Authentication system (existing)
- Analytics pipeline (Novus.ai integration required)

---

## 9. Milestones & Timeline

| Milestone | Date | Owner |
|-----------|------|-------|
| Tech spec complete | Week 1 | Engineering |
| Design mockups approved | Week 2 | Design |
| Core AI integration | Week 3-4 | Backend |
| Frontend build | Week 3-5 | Frontend |
| QA & testing | Week 6 | QA |
| Beta launch (20% rollout) | Week 7 | PM |
| Full launch | Week 8 | All |

---

## 10. Open Questions

1. Do we support multi-language output in V1, or English-only?
2. What's our fallback if the AI API is unavailable — cached responses or error state?
3. Should version history be user-facing or just internal for debugging?
4. How do we handle extremely long inputs that exceed model context windows?

---

## 11. Appendix

### Competitive Analysis
Three direct competitors offer a version of this feature. Our differentiation is:
- Native integration (not a separate tool)
- AI quality that adapts to team context
- Significantly lower time-to-output

### User Research Artifacts
- [Interview recordings — drive link]
- [FeedbackFusion cluster report]
- [Competitive teardown doc]`;
}

function generateUserStories(idea, h) {
  return `# User Stories — ${idea}

---

## Epic: ${idea}

**Epic Goal:** Enable users to complete [${idea}] end-to-end within the product, without switching tools.

---

## Core Stories

### US-001: Basic Workflow (MVP)
**As a** Product Manager,  
**I want to** ${idea.toLowerCase()},  
**So that** I can save time and make better decisions faster.

**Story Points:** 5  **Priority:** Must Have  **Sprint:** Sprint 1

#### Acceptance Criteria:
- **Given** I'm on the main dashboard
- **When** I navigate to the feature
- **Then** I see a clean input interface with clear guidance

- **Given** I have entered my input
- **When** I click "Generate" or "Analyze"
- **Then** the system processes my input within 10 seconds

- **Given** the processing is complete
- **When** the output is ready
- **Then** I see structured, formatted results with clear sections

---

### US-002: Save & Export
**As a** Product Manager,  
**I want to** save and export my outputs,  
**So that** I can share them with my team and stakeholders.

**Story Points:** 3  **Priority:** Must Have  **Sprint:** Sprint 1

#### Acceptance Criteria:
- **Given** I have a generated output
- **When** I click "Copy"
- **Then** the full content is copied to my clipboard with a confirmation toast

- **Given** I have a generated output
- **When** I click "Download"
- **Then** a Markdown file is downloaded to my device

---

### US-003: Version History
**As a** Product Manager,  
**I want to** see my previous outputs,  
**So that** I can compare iterations and recover earlier versions.

**Story Points:** 3  **Priority:** Should Have  **Sprint:** Sprint 2

#### Acceptance Criteria:
- **Given** I have generated at least 2 outputs for the same feature
- **When** I open the "Version History" section
- **Then** I see a chronological list of my last 5 outputs

- **Given** I'm viewing version history
- **When** I click on a previous version
- **Then** I can view the full content and optionally restore it

---

### US-004: Quality Score
**As a** Product Manager,  
**I want to** see a quality score for my output,  
**So that** I know if it's ready to share or needs improvement.

**Story Points:** 5  **Priority:** Should Have  **Sprint:** Sprint 2

#### Acceptance Criteria:
- **Given** I have a generated output
- **When** I view the quality panel
- **Then** I see an overall score (0–100) with dimension breakdown

- **Given** my quality score is below 70
- **When** I view the score details
- **Then** I see specific, actionable suggestions to improve each low-scoring dimension

---

### US-005: AI Suggestions
**As a** Product Manager,  
**I want** the AI to proactively suggest improvements,  
**So that** I can produce higher-quality outputs faster.

**Story Points:** 8  **Priority:** Could Have  **Sprint:** Sprint 3

#### Acceptance Criteria:
- **Given** I'm viewing an output
- **When** the AI detects a missing or weak section
- **Then** I see a highlighted suggestion with a one-click "Accept" option

---

## Non-Functional Stories

### US-NF-001: Performance
- P95 response time ≤ 10 seconds for all AI operations
- Page load ≤ 2 seconds (Lighthouse score 90+)

### US-NF-002: Accessibility
- All interactive elements keyboard-navigable
- Screen reader compatible (ARIA labels throughout)
- WCAG 2.1 AA color contrast ratios

---

*Generated by ShipSense PRD Architect — ${new Date().toLocaleDateString()}*`;
}

function generateAcceptanceCriteria(idea, h) {
  return `# Acceptance Criteria — ${idea}

---

## Feature Overview
**Feature:** ${idea}  
**Version:** 1.0  
**Status:** Draft

---

## AC-001: Core Functionality

### Happy Path
- **Given** a user with appropriate permissions
- **When** they navigate to the feature
- **Then** the interface loads within 2 seconds

- **Given** a user has entered valid input
- **When** they submit the form
- **Then** processing begins immediately (spinner visible within 100ms)

- **Given** processing is complete
- **When** results are ready
- **Then** output is displayed in a clearly formatted, readable structure

### Edge Cases
- **Given** the input is empty
- **When** the user tries to submit
- **Then** a clear validation message is shown (not a console error)

- **Given** the AI service is unavailable
- **When** a user submits
- **Then** a friendly error message is shown with a retry button

- **Given** the user's input exceeds the maximum length
- **When** they type beyond the limit
- **Then** input is prevented and a character count with limit is shown

---

## AC-002: Output Quality

- **Given** a successful output
- **When** a user reviews it
- **Then** it contains all required sections without placeholder text

- **Given** a successful output
- **When** checking formatting
- **Then** all headings, lists, and tables render correctly

---

## AC-003: Save & Export

- **Given** a generated output
- **When** the user clicks "Copy"
- **Then** clipboard contains the full content and a success toast appears

- **Given** a generated output
- **When** the user clicks "Download"
- **Then** a file is downloaded named \`shipsense-output-YYYY-MM-DD.md\`

---

## AC-004: Performance

| Scenario | Threshold |
|----------|-----------|
| Page load (cold) | < 2s |
| AI processing (P50) | < 5s |
| AI processing (P95) | < 10s |
| Copy to clipboard | < 100ms |
| Download file | < 500ms |

---

## AC-005: Accessibility

- All form fields have associated labels
- Error messages are announced to screen readers via aria-live
- Tab order is logical and complete
- Color is not the sole indicator of state
- Minimum touch target size: 44×44px

---

*Generated by ShipSense PRD Architect — ${new Date().toLocaleDateString()}*`;
}

export function generatePRDHealth(content) {
  if (!content || content.length < 50) {
    return {
      score: 12,
      checks: [
        { label: 'Has problem statement', pass: false },
        { label: 'Has success metrics', pass: false },
        { label: 'Has acceptance criteria', pass: false },
        { label: 'Has timeline', pass: false },
        { label: 'Has user personas', pass: false },
      ]
    };
  }

  const lower = content.toLowerCase();
  const checks = [
    { label: 'Has problem statement', pass: lower.includes('problem') || lower.includes('pain point') },
    { label: 'Has success metrics', pass: lower.includes('metric') || lower.includes('kpi') || lower.includes('goal') },
    { label: 'Has acceptance criteria', pass: lower.includes('given') || lower.includes('acceptance') },
    { label: 'Has timeline / milestones', pass: lower.includes('milestone') || lower.includes('sprint') || lower.includes('timeline') },
    { label: 'Has user personas', pass: lower.includes('persona') || lower.includes('as a') || lower.includes('user') },
    { label: 'Has non-functional requirements', pass: lower.includes('performance') || lower.includes('accessibility') || lower.includes('security') },
    { label: 'Has open questions', pass: lower.includes('question') || lower.includes('open') },
  ];

  const passed = checks.filter(c => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);
  return { score, checks };
}

// ── PERSONA LAB ENGINE ───────────────────────────────────────
export function generatePersona(segment) {
  const h = hashString(segment);

  const names = ['Alex Chen', 'Jordan Park', 'Sam Rivera', 'Taylor Kim', 'Morgan Lee', 'Casey Patel', 'Avery Johnson', 'Riley Zhang'];
  const roles = ['Senior Product Manager', 'Head of Product', 'Principal PM', 'Product Lead', 'VP of Product', 'Product Director', 'Group PM', 'CPO'];
  const companies = ['B2B SaaS startup (50–200 ppl)', 'Scale-up (Series B)', 'Enterprise tech company', 'Fintech startup', 'EdTech platform', 'Healthcare SaaS'];
  const emojis = ['👩‍💻', '👨‍💼', '👩‍🎨', '🧑‍💻', '👩‍🔬', '👨‍🚀'];

  const name = names[h % names.length];
  const role = roles[(h + 1) % roles.length];
  const company = companies[(h + 2) % companies.length];
  const emoji = emojis[h % emojis.length];

  const goalsPool = [
    'Ship faster without sacrificing quality or team morale',
    'Reduce time spent on documentation by 50%',
    'Get engineering buy-in on product decisions faster',
    'Build a data-driven culture where decisions are backed by evidence',
    'Align stakeholders around a clear, prioritized roadmap',
    'Reduce context-switching between 10+ tools in a typical workday',
    'Turn user research into actionable insights within 24 hours',
    'Prove product impact to leadership with clear metrics',
  ];

  const painsPool = [
    'Spends 40% of their week on documentation instead of customer conversations',
    'Stakeholders constantly request ad-hoc reports, derailing strategic work',
    'Struggles to maintain a single source of truth across Notion, Jira, and Slack',
    'Prioritization debates are political, not data-driven',
    'User research insights get buried and never actioned',
    'Engineering sprint planning takes 4+ hours with no single view of priorities',
    'Context is lost between tool sessions — every AI conversation starts fresh',
    'Hard to measure the actual impact of shipped features on business outcomes',
  ];

  const motivationsPool = [
    'Deeply cares about building products users actually love',
    'Motivated by shipping things that change behavior at scale',
    'Driven by career growth toward a Director/CPO role',
    'Values systems thinking — wants processes that work at scale',
    'Gets energy from customer interviews and finding unexpected insights',
    'Passionate about reducing friction for their engineering team',
  ];

  shuffle(goalsPool);
  shuffle(painsPool);
  shuffle(motivationsPool);

  return {
    name,
    role,
    company,
    emoji,
    age: 28 + (h % 15),
    experience: 4 + (h % 9) + ' years in product',
    tags: [extractDomain(segment), 'B2B SaaS', 'AI-curious', 'Data-driven'],
    goals: goalsPool.slice(0, 4),
    pains: painsPool.slice(0, 4),
    motivations: motivationsPool.slice(0, 3),
    attrs: {
      techSavvy: 60 + (h % 35),
      riskTolerance: 40 + ((h >> 4) % 45),
      dataFocus: 55 + ((h >> 8) % 40),
      collaboration: 65 + ((h >> 2) % 30),
    },
    jtbd: generateJTBD(segment, h),
    empathy: generateEmpathy(segment, h),
    predictions: generateBehaviorPredictions(segment, h),
    conflictAnalysis: generateConflictAnalysis(segment, h),
  };
}

function generateJTBD(segment, h) {
  return {
    coreStatement: `When I'm overwhelmed by competing priorities and stakeholder pressure, I want to quickly validate my decisions with data and clear rationale, so I can ship the right thing with confidence and avoid wasted engineering cycles.`,
    functionalJobs: [
      'Quickly synthesize customer feedback into prioritized themes',
      'Generate structured PRDs from rough ideas in minutes',
      'Score and compare feature ideas against business goals',
      'Create stakeholder-ready summaries from raw research',
    ],
    emotionalJobs: [
      'Feel confident that I\'m building the right thing',
      'Reduce the anxiety of making high-stakes decisions with incomplete information',
      'Feel respected by engineering as a data-driven partner',
      'Feel like a strategic thinker, not a backlog manager',
    ],
    socialJobs: [
      'Be seen as the most effective PM on the team',
      'Build credibility with leadership through clear, measured outcomes',
      'Be the person others come to for product strategy advice',
    ],
  };
}

function generateEmpathy(segment, h) {
  return {
    thinks: [
      '"Am I working on the highest-impact thing right now?"',
      '"How do I get engineering to really understand the customer\'s pain?"',
      '"There has to be a way to do this faster without sacrificing quality."',
      '"What will my CEO say when they see this roadmap?"',
    ],
    hears: [
      '"Can we just add this one feature for [Customer X]?"',
      '"Engineering says that\'s 3 sprints away."',
      '"Users are complaining about X in the support queue."',
      '"Competitor Y just shipped this. When are we shipping it?"',
    ],
    sees: [
      'A Jira board with 150+ tickets in the backlog',
      'Slack channels where urgent requests arrive at midnight',
      'A Google Sheets roadmap that is already 2 weeks out of date',
      'Engineering estimates that vary wildly between team members',
    ],
    says: [
      '"Let\'s make sure we have customer evidence before we commit."',
      '"I need to talk to 3 more users before I\'m confident in this."',
      '"Can we timebox this spike to understand the real effort?"',
      '"What does the data say about current user behavior?"',
    ],
    pains: [
      'Loss of momentum when context switches kill deep work',
      'Political prioritization debates that override data',
      'Handoff gaps where intent gets lost between PM and engineering',
      'No time for strategic thinking amid tactical firefighting',
    ],
    gains: [
      'More time for customer discovery and strategic thinking',
      'Engineering that ships what was specified without surprises',
      'A roadmap the whole company trusts and rallies around',
      'Clear data showing the impact of every feature shipped',
    ],
  };
}

function generateBehaviorPredictions(segment, h) {
  return [
    {
      scenario: 'First session with the product',
      predictions: [
        { prob: '72%', text: 'Will try IdeaForge first — wants to validate their current backlog top idea immediately.' },
        { prob: '18%', text: 'Will jump straight to PRD Architect — already has an idea, needs the doc.' },
        { prob: '10%', text: 'Will explore the dashboard and orient before taking action.' },
      ],
    },
    {
      scenario: 'After seeing first AI output',
      predictions: [
        { prob: '65%', text: 'Will edit and refine the output, treating it as a starting point not a final answer.' },
        { prob: '25%', text: 'Will immediately share with their team or engineering lead.' },
        { prob: '10%', text: 'Will be skeptical and cross-check against their own knowledge.' },
      ],
    },
    {
      scenario: 'Week 2+ of regular use',
      predictions: [
        { prob: '58%', text: 'Becomes a daily active user — incorporates ShipSense into their morning routine.' },
        { prob: '30%', text: 'Becomes a weekly user — uses for specific high-stakes documents.' },
        { prob: '12%', text: 'Churns — either their workflow didn\'t change or tool doesn\'t integrate with their stack.' },
      ],
    },
  ];
}

function generateConflictAnalysis(segment, h) {
  return `**Potential Conflict Detected:** If your product serves both "Strategic Sam" (senior PM) and early-career PMs simultaneously, you may face tension. Senior PMs want sophisticated controls and customization. Junior PMs need guardrails and guided workflows. 

**Recommendation:** Start with one persona. The senior PM has higher willingness to pay and lower onboarding friction. Junior PM is higher volume but needs more support investment.`;
}

// ── PRIORITY MATRIX ENGINE ───────────────────────────────────
export function scoreFeature(featureName) {
  const h = hashString(featureName + 'rice');

  const reach      = 1000 + (h % 9000);
  const impact     = (1 + (h % 4)) * 0.5; // 0.5, 1, 1.5, 2
  const confidence = 0.5 + ((h >> 4) % 5) * 0.1; // 0.5-0.9
  const effort     = 1 + ((h >> 8) % 8); // 1-8

  const riceScore  = Math.round((reach * impact * confidence) / effort);
  const effortLabels = ['', 'XS', 'XS', 'S', 'S', 'M', 'M', 'L', 'XL'];
  const effortCls    = ['', 'effort-xs', 'effort-xs', 'effort-s', 'effort-s', 'effort-m', 'effort-m', 'effort-l', 'effort-xl'];

  const moscowOpts = ['must', 'must', 'should', 'should', 'could', 'wont'];
  const moscow = moscowOpts[h % moscowOpts.length];

  const deps = [];
  const depPool = ['Authentication', 'Search API', 'Notification System', 'Data Pipeline', 'Analytics Layer'];
  if (h % 3 === 0) deps.push(depPool[h % depPool.length]);
  if ((h >> 2) % 4 === 0) deps.push(depPool[(h + 1) % depPool.length]);

  return {
    name: featureName,
    reach,
    impact,
    confidence,
    effort,
    riceScore,
    effortLabel: effortLabels[Math.min(effort, 8)],
    effortCls: effortCls[Math.min(effort, 8)],
    moscow,
    dependencies: deps,
    points: effort * 2 + (h % 5), // story points
  };
}

export function runSprintSimulation(features, teamSize, sprintWeeks) {
  const velocityPerPerson = 8 + Math.floor(Math.random() * 5); // 8-12 pts per person per week
  const totalVelocity = velocityPerPerson * teamSize * sprintWeeks;

  let remaining = [...features].sort((a, b) => b.riceScore - a.riceScore);
  const sprints = [];
  let sprintNum = 1;

  while (remaining.length > 0 && sprintNum <= 4) {
    const sprintItems = [];
    let sprintPoints = 0;
    const sprintCap = totalVelocity * (0.85 + Math.random() * 0.3);

    const nextBatch = [];
    for (const f of remaining) {
      if (sprintPoints + f.points <= sprintCap) {
        sprintItems.push(f);
        sprintPoints += f.points;
      } else {
        nextBatch.push(f);
      }
    }

    if (sprintItems.length === 0) break;

    const confidence = sprintPoints < sprintCap * 0.8 ? 'high'
      : sprintPoints < sprintCap * 1.0 ? 'mid' : 'low';

    sprints.push({
      num: sprintNum,
      items: sprintItems,
      points: sprintPoints,
      capacity: Math.round(sprintCap),
      confidence,
    });

    remaining = nextBatch;
    sprintNum++;
  }

  return sprints;
}

// ── FEEDBACK FUSION ENGINE ───────────────────────────────────
export function analyzeFeedback(rawText, type) {
  const lines = rawText.split('\n').filter(l => l.trim().length > 10);
  const h = hashString(rawText);

  return {
    clusters: generateClusters(lines, h, type),
    sentiment: generateSentiment(lines, h),
    featureRanking: generateFeatureRanking(lines, h),
    trajectory: generateTrajectory(h),
  };
}

function generateClusters(lines, h, type) {
  const clusterDefs = [
    {
      name: 'Performance & Speed',
      color: 'var(--color-rose)',
      desc: 'Users consistently mention slowness, lag, and loading times as primary friction points.',
      quotes: ['"Takes forever to load"', '"Why is this so slow?"', '"Crashes when I have many items open"'],
    },
    {
      name: 'Missing Integrations',
      color: 'var(--color-amber)',
      desc: 'High demand for integrations with existing tools in users\' stack — Jira, Slack, and Notion are top requests.',
      quotes: ['"Needs Jira integration"', '"Where is the Slack bot?"', '"Export to Notion please"'],
    },
    {
      name: 'Onboarding & Learnability',
      color: 'var(--color-violet)',
      desc: 'New users struggle to understand core value proposition without hand-holding.',
      quotes: ['"Took me a week to understand how to use it"', '"Great tool but the docs are terrible"'],
    },
    {
      name: 'Feature Requests',
      color: 'var(--color-cyan)',
      desc: 'Strong demand for bulk operations, templates, and customization options.',
      quotes: ['"Need bulk export"', '"Can I create templates?"', '"More customization options please"'],
    },
    {
      name: 'UI/UX Praise',
      color: 'var(--color-emerald)',
      desc: 'Strong positive signal around the interface design and overall user experience.',
      quotes: ['"Best UI I\'ve used in this category"', '"So clean and intuitive"', '"Love the dark mode"'],
    },
  ];

  const count = Math.min(5, 2 + (h % 3));
  shuffle(clusterDefs);
  return clusterDefs.slice(0, count).map(c => ({
    ...c,
    count: 5 + (hashString(c.name) % (lines.length > 0 ? Math.max(1, lines.length / 2) : 8)),
  }));
}

function generateSentiment(lines, h) {
  const pos = 35 + (h % 30);
  const neg = 15 + ((h >> 4) % 25);
  const neu = 100 - pos - neg;
  return { positive: pos, neutral: Math.max(0, neu), negative: neg };
}

function generateFeatureRanking(lines, h) {
  const features = [
    { name: 'API Integration (Jira/Slack)', score: 94, mentions: 47 },
    { name: 'Bulk Export / Import', score: 87, mentions: 38 },
    { name: 'Template Library', score: 82, mentions: 31 },
    { name: 'Mobile App', score: 76, mentions: 28 },
    { name: 'Real-time Collaboration', score: 71, mentions: 24 },
    { name: 'Custom Dashboards', score: 65, mentions: 19 },
    { name: 'AI Auto-suggestions', score: 61, mentions: 17 },
    { name: 'Dark Mode Improvements', score: 44, mentions: 11 },
  ];
  shuffle(features);
  return features.slice(0, 6).sort((a, b) => b.score - a.score);
}

function generateTrajectory(h) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((m, i) => ({
    label: m,
    positive: 30 + (hashString(m + h) % 40) + i * 3,
    negative: 40 - (hashString(m + h + 1) % 25) - i * 2,
  }));
}

// ── LAUNCH CONTROL ENGINE ────────────────────────────────────
export function generateLaunchPlan(product) {
  const h = hashString(product);
  return {
    gtm: generateGTM(product, h),
    changelog: generateChangelog(product, h),
    metrics: generateSuccessMetrics(product, h),
    brief: generateStakeholderBrief(product, h),
    checklist: generateShipChecklist(product, h),
  };
}

function generateGTM(product, h) {
  return {
    positioning: [
      `For product professionals who waste hours context-switching, ${product} is the AI-native command center that unifies discovery, planning, and launch in one tab.`,
      `Unlike point solutions (Dovetail, ChatPRD, etc.) that require you to switch tools for each task, ${product} maintains context across your entire product workflow.`,
      `The result: 70% less time on documentation, 50% faster stakeholder alignment, and the confidence to ship the right thing, faster.`,
    ],
    channels: [
      'LinkedIn (organic + paid): Target PM titles at B2B SaaS companies 50–500 employees',
      'Mind the Product community: Sponsor newsletter, speak at ProductTank events',
      'ProductHunt launch: Build waitlist, coordinate upvotes with early beta users',
      'Indie Hackers / Hacker News: Honest "show HN" post with real metrics',
      'PM Slack communities: Personal outreach to community leaders for feedback',
    ],
    pricing: [
      'Free tier: Core features, 10 AI generations/month (get users hooked)',
      'Pro $19/mo: Unlimited generations, export, version history',
      'Team $49/seat/mo: Shared workspace, admin controls, priority support',
      'Enterprise: Custom pricing, SSO, security review, SLA',
    ],
  };
}

function generateChangelog(product, h) {
  return [
    {
      version: '1.0.0',
      date: 'June 2026',
      type: 'major',
      items: [
        `🚀 Launched ${product} — your AI-native product intelligence studio`,
        '✨ IdeaForge: Validate any idea with Ship Score™ in 30 seconds',
        '📄 PRD Architect: Generate complete product specs from one sentence',
        '👥 Persona Lab: Build rich user personas with JTBD + empathy maps',
        '🎯 PriorityMatrix: Dynamic RICE scoring with Monte Carlo sprint simulation',
        '💬 FeedbackFusion: Cluster 50 customer comments into actionable themes',
        '🛸 LaunchControl: GTM canvas, changelog AI, and ship readiness checklist',
      ],
    },
    {
      version: '0.9.0',
      date: 'May 2026',
      type: 'minor',
      items: [
        '⚡ Command Center with real-time product health dashboard',
        '🧠 AI Insight Feed with proactive recommendations',
        '📊 Cross-module session memory and context persistence',
        '🎨 Glassmorphism UI with aurora gradient backgrounds',
      ],
    },
    {
      version: '0.1.0',
      date: 'May 2026',
      type: 'patch',
      items: [
        '🌱 Initial private beta with 47 early access users',
        '🔧 Core AI engine with deterministic, high-quality outputs',
        '📱 Mobile-responsive layout',
      ],
    },
  ];
}

function generateSuccessMetrics(product, h) {
  return {
    leading: [
      { name: 'Daily Active Users (DAU)', target: '500 by Day 30', why: 'Early signal of genuine habit formation vs. one-time exploration' },
      { name: 'AI Generations per Session', target: '>3 per session', why: 'Indicates users are getting value and exploring multiple features' },
      { name: 'Feature Adoption Breadth', target: '40% use 3+ modules', why: 'Multi-module users have 3× lower churn than single-module users' },
    ],
    lagging: [
      { name: 'Week-4 Retention', target: '>45%', why: 'Industry benchmark for productivity tools — anything below signals weak habit' },
      { name: 'Net Revenue Retention (NRR)', target: '>110%', why: 'Expansion must outpace churn for sustainable growth' },
      { name: 'Organic Referral Rate', target: '25% of signups', why: 'Product-led growth only works if users are excited enough to share' },
    ],
    guardrails: [
      { name: 'AI Response Quality (CSAT)', target: '>4.2/5', why: 'Core value prop is AI quality — if this drops, retention collapses' },
      { name: 'Error Rate (AI failures)', target: '<2%', why: 'Every failure breaks trust and increases churn probability 3×' },
      { name: 'P95 Response Time', target: '<8 seconds', why: 'Users abandon AI tools that feel slow — 10s+ is unacceptable' },
    ],
  };
}

function generateStakeholderBrief(product, h) {
  return {
    oneLiner: `${product} is an AI-native product intelligence studio that helps PMs go from idea to shipped feature in one session — without switching between 10 different tools.`,
    problem: `Product professionals today context-switch between Notion, Jira, ChatGPT, Dovetail, and dozens of other tools to complete tasks that should flow naturally together. This costs them 40% of their week on process overhead instead of customer conversations.`,
    solution: `ShipSense unifies the PM workflow — idea validation, PRD generation, persona building, feature prioritization, feedback analysis, and launch planning — into a single AI-powered studio that maintains context across every step.`,
    traction: `Launched at World Product Day 2026 hackathon. 47 beta users in first 48 hours. Average session time: 22 minutes. NPS: 67 (excellent for a new product).`,
    ask: `We need your support to: (1) share with your network of PMs, (2) provide introductions to potential design partners, (3) feedback on the roadmap for V2.`,
  };
}

function generateShipChecklist(product, h) {
  return {
    categories: [
      {
        title: '🏗️ Technical',
        items: [
          { label: 'Core features work end-to-end without errors', priority: 'high' },
          { label: 'Performance tested — P95 response time < 10s', priority: 'high' },
          { label: 'Mobile responsive on iOS and Android', priority: 'medium' },
          { label: 'Cross-browser tested (Chrome, Firefox, Safari)', priority: 'medium' },
          { label: 'Error boundaries and graceful failure states in place', priority: 'high' },
          { label: '404 and error pages styled and working', priority: 'low' },
        ],
      },
      {
        title: '📊 Analytics & Tracking',
        items: [
          { label: 'Novus.ai connected to GitHub repo', priority: 'high' },
          { label: 'Key user flows are trackable in Novus dashboard', priority: 'high' },
          { label: 'Session recording enabled for first 100 users', priority: 'medium' },
          { label: 'Conversion funnel set up (landing → app → key action)', priority: 'high' },
        ],
      },
      {
        title: '🚀 Launch',
        items: [
          { label: 'Public URL live and accessible to all', priority: 'high' },
          { label: 'ProductHunt listing drafted and scheduled', priority: 'medium' },
          { label: 'Demo video recorded (2–3 min walkthrough)', priority: 'high' },
          { label: 'Devpost submission form completed', priority: 'high' },
          { label: 'Social posts drafted for #EveryoneShipsNow', priority: 'low' },
        ],
      },
      {
        title: '📋 Hackathon Requirements',
        items: [
          { label: 'Novus.ai screenshot from dashboard captured', priority: 'high' },
          { label: 'Written description (what, who, how, learnings) drafted', priority: 'high' },
          { label: 'Demo video uploaded to YouTube/Loom (public)', priority: 'high' },
          { label: 'Submission submitted before June 20, 5pm GMT', priority: 'high' },
        ],
      },
    ],
  };
}

// ── RANDOM IDEA GENERATOR ────────────────────────────────────
export function getRandomIdea() {
  const ideas = [
    'An AI tool that turns customer support tickets into prioritized feature requests automatically',
    'A mobile app for tracking micro-habits with AI-powered behavior change coaching',
    'A tool that automatically generates meeting agendas based on your calendar and Slack context',
    'An AI writing assistant specifically trained on product management frameworks and language',
    'A platform that helps remote teams run async retrospectives with AI-generated insights',
    'A service that monitors competitor product changes and alerts you to strategic shifts',
    'An app that converts voice memos from customer interviews into structured research reports',
    'A SaaS tool that automatically generates status updates for stakeholders from Jira tickets',
    'A tool that score and grades feature ideas against company OKRs in real time',
    'A platform that connects indie makers with potential early adopters in their niche',
    'An AI coach that helps junior PMs prepare for stakeholder presentations',
    'A tool that automatically creates personas from your product analytics and support data',
  ];
  return randomPick(ideas);
}

export function getSampleFeedback() {
  return `The onboarding is confusing — I didn't understand what the product actually did until day 3
The AI suggestions are incredibly accurate and save me hours every week
Loading times are way too slow, especially when importing large files
I wish there was a Jira integration, that would make this a complete solution for my team
Love the clean dark interface, much better than competitors I've tried
The export to PDF feature is broken — nothing happens when I click it
This has replaced 3 tools I was using before. Game changer for our product team
Would be great to have team collaboration features — right now it feels too solo
The AI sometimes gives generic answers that aren't specific enough to be useful
Support team is incredibly responsive — had an issue resolved in 2 hours
Missing templates — I have to start from scratch every time which is tedious
Pricing is fair for what you get, but the free tier limit is too restrictive
Mobile experience is surprisingly good, I use it on my phone during commutes
The feature prioritization scoring doesn't integrate with my real usage data
This is the tool I wished existed 3 years ago when I started in PM
Slack integration would be huge — I want to run commands from within Slack
The onboarding tutorial is helpful but too long — lost me at step 6
Very impressive for a new product. The persona builder alone is worth the subscription`;
}

// ── Helper ───────────────────────────────────────────────────
function extractDomain(text) {
  const words = text.toLowerCase().split(' ');
  const stopWords = ['a', 'an', 'the', 'for', 'with', 'that', 'this', 'to', 'of', 'and', 'or', 'is', 'are'];
  const meaningful = words.filter(w => w.length > 3 && !stopWords.includes(w));
  return meaningful[0] ? meaningful[0].charAt(0).toUpperCase() + meaningful[0].slice(1) : 'Product';
}
