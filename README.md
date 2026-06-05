# ShipSense — AI-Native Product Intelligence Studio
### World Product Day 2026 Hackathon Entry · #EveryoneShipsNow

> *"Your entire product brain. One tab."*

---

## 🚀 Live Demo
Deploy URL will be added after Vercel deployment.

## 🎯 What is ShipSense?

ShipSense is an AI-native **Product Intelligence Studio** that unifies the entire PM workflow — from fuzzy idea to shipped feature — in a single, context-aware interface.

**No more 10-tab chaos.** ShipSense replaces:
- ChatPRD → **PRD Architect**
- Dovetail → **FeedbackFusion**
- Productboard → **PriorityMatrix**
- UserTesting → **Persona Lab**
- Your GTM doc → **LaunchControl**
- All 5 → **Command Center**

---

## ✨ Features (30+)

### 🚀 IdeaForge
1. **Ship Score™** — AI confidence index (0–100) for any idea
2. **Market Pulse Analyzer** — TAM/SAM/SOM + growth rate
3. **Devil's Advocate AI** — Top 5 failure modes + counters
4. **Competitor Radar** — Auto-maps top 5 competitors
5. **Pain Point Validator** — Evidence-backed validation

### 📄 PRD Architect
6. **One-Click PRD Generator** — Full spec from one sentence
7. **User Story Factory** — Given/When/Then stories
8. **Acceptance Criteria Builder** — Edge cases included
9. **PRD Health Score** — Completeness rating + suggestions
10. **Version Timeline** — History of all generated docs

### 👥 Persona Lab
11. **AI Persona Generator** — Rich, detailed user profiles
12. **Jobs-to-be-Done Canvas** — Functional/emotional/social jobs
13. **Empathy Map Builder** — 6-quadrant visual map
14. **Persona Conflict Analyzer** — Detects serving conflicting users
15. **Behavioral Pattern Predictor** — Predicts usage patterns

### 🎯 PriorityMatrix
16. **Dynamic RICE Scorer** — Real-time RICE calculation
17. **MoSCoW Classifier** — AI auto-assigns priority
18. **Effort Estimator** — T-shirt sizing with confidence bands
19. **Dependency Web Mapper** — Visual dependency graph
20. **Sprint Velocity Simulator** — Monte Carlo sprint simulation

### 💬 FeedbackFusion
21. **Feedback Cluster AI** — Themes from 50+ comments
22. **Sentiment Trajectory** — Sentiment over time chart
23. **Feature Request Ranker** — Business impact scoring
24. **NPS Signal Decoder** — Verbatim theme extraction
25. **Competitive Intel Digester** — Analyze competitor reviews

### 🛸 LaunchControl
26. **Go-to-Market Canvas** — Positioning + channels + pricing
27. **Changelog AI Writer** — Human-friendly release notes
28. **Success Metric Planner** — Leading/lagging/guardrails
29. **Stakeholder Brief Generator** — Executive summaries
30. **Ship Readiness Checklist** — Dynamic launch tracker

### ⚡ Command Center
31. **Real-Time Product Health Monitor** — Live scores across all modules
32. **AI Insight Feed** — Proactive recommendations as you work
33. **Cross-Module Session Memory** — Context persists everywhere

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6 Modules)
- **Design:** Glassmorphism dark UI, Space Grotesk + Inter fonts
- **Animations:** Pure CSS keyframes + Canvas particle system
- **AI Engine:** Rich deterministic demo data (no API key needed)
- **Analytics:** Novus.ai (via GitHub repo integration)
- **Deployment:** Vercel (static, zero-config)

---

## 📦 Project Structure

```
focused-pascal/
├── index.html              # App shell + landing page
├── vercel.json             # Deployment config
├── css/
│   ├── design-system.css   # Tokens, variables, base
│   ├── animations.css      # All keyframes & transitions
│   ├── components.css      # Reusable component styles
│   └── modules.css         # Module-specific overrides
└── js/
    ├── app.js              # Main entry: routing, particles, init
    ├── ai-engine.js        # All AI output generation
    ├── utils/
    │   ├── state.js        # Reactive state manager (pub/sub)
    │   └── helpers.js      # Utility functions
    ├── components/
    │   └── notifications.js # Toast + insight feed
    └── modules/
        ├── ideaforge.js        # Features 1–5
        ├── prd-architect.js    # Features 6–10
        ├── persona-lab.js      # Features 11–15
        ├── priority-matrix.js  # Features 16–20
        ├── feedback-fusion.js  # Features 21–25
        └── launch-control.js   # Features 26–30
```

---

## 🚀 Running Locally

```bash
# Option 1: Python (no install needed)
python -m http.server 3000

# Option 2: Node.js
npx serve .

# Option 3: VS Code Live Server
# Right-click index.html → Open with Live Server
```

Then open http://localhost:3000

---

## 🌐 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (from project root)
vercel --prod
```

---

## 📊 Novus.ai Integration

Connect your GitHub repository to Novus.ai at [novus.pendo.io](https://novus.pendo.io):
1. Register at novus.pendo.io
2. Connect this GitHub repository
3. Novus auto-maps all routes and user flows
4. Screenshot your dashboard for hackathon submission

---

## 🏆 Hackathon Details

- **Event:** World Product Day — Everyone Ships Now
- **Organizer:** Mind the Product
- **Deadline:** June 20, 2026
- **Hashtag:** #EveryoneShipsNow

---

*Built with ❤️ for the Mind the Product community*
