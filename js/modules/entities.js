import { appState } from '../core/state.js';
import { el, byId, clear } from '../core/dom.js';
import { toast } from '../core/toast.js';
import { searchEntities } from '../data/secop-contracts.js';
import { OperationRun } from '../data/secop-api.js';

let activeRun = null;

export function mountEntities(container) {
  clear(container);
  const input = el('input', { class: 'field', placeholder: 'Ej.: servicio geologico, ICBF, SENA', 'aria-label': 'Entidad' });
  const button = el('button', { class: 'btn' }, 'Buscar');
  const results = el('div', { class: 'entity-results' });

  const run = () => execute(input.value, results, button);
  button.addEventListener('click', run);
  input.addEventListener('keydown', event => { if (event.key === 'Enter') run(); });

  container.append(el('section', { class: 'card' }, [
    el('div', { class: 'card__head' }, [el('h2', { class: 'card__title' }, '\ud83c\udfe2 Buscador de entidades')]),
    el('p', { class: 'muted' }, 'Busca denominaciones coincidentes en SECOP, elimina duplicados y ordena alfabeticamente.'),
    el('div', { class: 'row', style: 'margin-top:12px' }, [
      el('div', { style: 'flex:1;min-width:240px' }, [input]), button
    ]),
    results
  ]));
}

async function execute(rawQuery, results, button) {
  const query = rawQuery.trim();
  if (query.length < 3) { toast('Escribe al menos 3 caracteres.', 'error'); return; }
  if (activeRun) activeRun.abort();
  activeRun = new OperationRun();
  button.disabled = true;
  clear(results).append(el('p', { class: 'muted', style: 'margin-top:16px' }, 'Consultando coincidencias...'));
  try {
    const entities = await searchEntities(query, { signal: activeRun.signal });
    renderResults(results, entities);
  } catch (error) {
    if (error.name === 'AbortError') return;
    clear(results).append(el('div', { class: 'state-msg state-msg--error', style: 'margin-top:16px' }, error.message));
  } finally {
    button.disabled = false;
  }
}

function renderResults(container, entities) {
  clear(container);
  if (!entities.length) {
    container.append(el('div', { class: 'state-msg state-msg--warn', style: 'margin-top:16px' }, 'Sin coincidencias.'));
    return;
  }
  const list = el('div', { class: 'table-wrap', style: 'margin-top:16px' });
  const inner = el('div', {});
  for (const name of entities) {
    inner.append(el('button', {
      class: 'btn--ghost',
      style: 'display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);padding:12px;background:#fff;cursor:pointer',
      onClick: () => selectEntity(name)
    }, name));
  }
  list.append(inner);
  container.append(el('p', { class: 'muted', style: 'margin:16px 0 8px' }, `${entities.length} coincidencia(s)`), list);
}

function selectEntity(name) {
  appState.set({ selectedEntity: name }, 'entities:select');
  byId('entity-name').textContent = name;
  byId('entity-badge').hidden = false;
  toast(`Entidad seleccionada: ${name}`, 'ok');
}
