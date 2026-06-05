// ============================================================
// SHIPSENSE — STATE MANAGER
// Centralized reactive state with pub/sub
// ============================================================

const _state = {
  currentModule: 'dashboard',
  sessionScore: 0,
  moduleStatus: {
    ideaforge:        'idle',
    'prd-architect':  'idle',
    'persona-lab':    'idle',
    'priority-matrix':'idle',
    'feedback-fusion':'idle',
    'launch-control': 'idle',
  },
  health: {
    idea:   0,
    prd:    0,
    user:   0,
    launch: 0,
  },
  insights: [],
  activities: [],
  scoreHistory: [],
  features: [],          // Priority Matrix features
  currentIdea: '',
  currentPersona: null,
  currentPRD: null,
  prdVersions: [],
  feedbackResults: null,
  launchResults: null,
  checklistState: {},    // Launch checklist item states
};

const _listeners = {};

export const State = {
  get(key) {
    return key ? _state[key] : { ..._state };
  },

  set(key, value) {
    const prev = _state[key];
    _state[key] = value;
    this._notify(key, value, prev);
    this._notify('*', _state, null);
  },

  update(key, updater) {
    const prev = _state[key];
    const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
    _state[key] = next;
    this._notify(key, next, prev);
    this._notify('*', _state, null);
  },

  on(key, callback) {
    if (!_listeners[key]) _listeners[key] = [];
    _listeners[key].push(callback);
    return () => this.off(key, callback);
  },

  off(key, callback) {
    if (_listeners[key]) {
      _listeners[key] = _listeners[key].filter(cb => cb !== callback);
    }
  },

  _notify(key, value, prev) {
    if (_listeners[key]) {
      _listeners[key].forEach(cb => {
        try { cb(value, prev); } catch (e) { console.error('State listener error:', e); }
      });
    }
  },

  addActivity(label, module) {
    const activities = _state.activities;
    activities.unshift({
      label,
      module,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now(),
    });
    // Keep last 20
    if (activities.length > 20) activities.pop();
    this._notify('activities', activities, null);
    this._notify('*', _state, null);
  },

  addInsight(emoji, text) {
    const insights = _state.insights;
    insights.unshift({
      emoji,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now(),
    });
    if (insights.length > 15) insights.pop();
    this._notify('insights', insights, null);
    this._notify('*', _state, null);
  },

  addScoreHistory(idea, score) {
    const history = _state.scoreHistory;
    history.unshift({ idea: idea.substring(0, 60), score, id: Date.now() });
    if (history.length > 10) history.pop();
    this._notify('scoreHistory', history, null);
    this._notify('*', _state, null);
  },

  setModuleStatus(module, status) {
    _state.moduleStatus[module] = status;
    this._notify('moduleStatus', _state.moduleStatus, null);
    this._notify('*', _state, null);
  },

  incrementScore(amount) {
    _state.sessionScore = Math.min(100, _state.sessionScore + amount);
    this._notify('sessionScore', _state.sessionScore, null);
    this._notify('*', _state, null);
  },

  updateHealth(key, value) {
    _state.health[key] = Math.min(100, Math.max(0, value));
    this._notify('health', _state.health, null);
    this._notify('*', _state, null);
  },
};
