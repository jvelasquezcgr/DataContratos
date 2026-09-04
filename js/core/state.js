export class AppState {
  #state;
  #listeners = new Set();

  constructor(initial = {}) {
    this.#state = {
      selectedEntity: null, currentContractCaseId: null, currentModule: 'entities',
      currentTab: 'overview', sample: [], lastResults: [], activeOperation: null, ...initial
    };
  }

  get snapshot() { return structuredClone(this.#state); }
  get(key) { return this.#state[key]; }

  set(patch, reason = 'state:update') {
    this.#state = { ...this.#state, ...patch };
    const snapshot = this.snapshot;
    for (const listener of this.#listeners) listener(snapshot, reason);
    return snapshot;
  }

  update(key, updater, reason = `state:${key}`) {
    return this.set({ [key]: updater(this.#state[key]) }, reason);
  }

  subscribe(listener) { this.#listeners.add(listener); return () => this.#listeners.delete(listener); }
}

export const appState = new AppState();
