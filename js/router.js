// Registro central de modulos y control de navegacion.
// Cada modulo se registra con: id, label, icon y una funcion mount(container, ctx).
import { el, byId, clear } from './core/dom.js';
import { appState } from './core/state.js';

const registry = new Map();

export function registerModule(definition) {
  if (!definition?.id || typeof definition.mount !== 'function') {
    throw new Error('Modulo invalido: requiere id y mount()');
  }
  registry.set(definition.id, definition);
  return definition;
}

export function getModules() {
  return [...registry.values()];
}

export function renderMenu(onNavigate) {
  const menu = clear(byId('app-menu'));
  const current = appState.get('currentModule');
  for (const module of registry.values()) {
    menu.append(el('button', {
      class: module.id === current ? 'is-active' : '',
      dataset: { module: module.id },
      onClick: () => onNavigate(module.id)
    }, [el('span', {}, module.icon || ''), el('span', {}, module.label)]));
  }
}

export function navigate(moduleId, ctx = {}) {
  const module = registry.get(moduleId) || registry.values().next().value;
  if (!module) return;
  appState.set({ currentModule: module.id }, 'router:navigate');
  renderMenu(id => navigate(id, ctx));
  module.mount(byId('app-main'), { navigate, ...ctx });
}
