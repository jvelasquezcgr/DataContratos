// js/core/state.js - Gestión de estado simple
let state = {};
const listeners = new Set();

export function getState(key) {
  return key ? state[key] : state;
}

export function setState(key, value) {
  if (typeof key === 'object') {
    state = { ...state, ...key };
  } else {
    state[key] = value;
  }
  notifyListeners();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyListeners() {
  listeners.forEach(fn => fn(state));
}
