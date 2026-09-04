import { normalizeText } from '../core/text.js';
import { CONTRACT_FIELDS, SOCRATA } from './config.js';
import { socrataGet, socrataGetAll } from './secop-api.js';
import { and, dateRange, eqUpper, fuzzyPattern, likeUpper } from './soql.js';

const SELECT = CONTRACT_FIELDS.join(',');

export async function searchEntities(query, { signal } = {}) {
  const normalized = normalizeText(query);
  if (normalized.length < 3) throw new Error('Escribe al menos 3 caracteres.');
  const pattern = fuzzyPattern(normalized);
  const rows = await socrataGetAll(SOCRATA.datasets.entities, {
    '$select': 'nombre_entidad', '$where': likeUpper('nombre_entidad', pattern),
    '$group': 'nombre_entidad', '$order': 'nombre_entidad'
  }, { signal });
  const found = new Set();
  for (const row of rows) {
    if (row.nombre_entidad && normalizeText(row.nombre_entidad).includes(normalized)) found.add(row.nombre_entidad.trim());
  }
  return [...found].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

export function queryContracts(where, { order = 'fecha_de_firma DESC', limit = 5000, signal } = {}) {
  return socrataGet(SOCRATA.datasets.contracts, { '$select': SELECT, '$where': where, '$order': order, '$limit': limit }, { signal });
}

export function entityWhere(entity, { from, to, dateField = 'fecha_de_firma' } = {}) {
  return and(eqUpper('nombre_entidad', entity), dateRange(dateField, from, to));
}

export async function searchByObject(entity, rawTerms, { mode = 'all', limit = 50, from, to, signal } = {}) {
  const tokens = String(rawTerms).split(/\s+/).filter(Boolean);
  const roots = [...new Set(tokens.map(fuzzyPattern).filter(Boolean))];
  if (!roots.length) return { rows: [], scanned: 0 };
  const objectClause = roots.map(root => likeUpper('objeto_del_contrato', root)).join(mode === 'any' ? ' OR ' : ' AND ');
  const where = and(entityWhere(entity, { from, to }), `(${objectClause})`);
  const rows = await socrataGetAll(SOCRATA.datasets.contracts, {
    '$select': SELECT, '$where': where, '$order': 'valor_del_contrato DESC,id_contrato'
  }, { signal });
  const phrase = normalizeText(rawTerms);
  const terms = phrase.split(' ').filter(Boolean);
  const matches = row => {
    const haystack = normalizeText(row.objeto_del_contrato);
    if (mode === 'phrase') return haystack.includes(phrase);
    if (mode === 'any') return terms.some(term => haystack.includes(term));
    return terms.every(term => haystack.includes(term));
  };
  const seen = new Set();
  const filtered = rows.filter(matches).filter(row => {
    const key = row.id_contrato || row.referencia_del_contrato;
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  }).sort((a, b) => (+b.valor_del_contrato || 0) - (+a.valor_del_contrato || 0)).slice(0, limit);
  return { rows: filtered, scanned: rows.length };
}

export async function searchBySupplier(entity, query, { from, to, signal } = {}) {
  const digits = String(query).replace(/\D/g, '');
  const isNit = /^\s*[0-9.\-]+\s*$/.test(query) && digits;
  const supplierClause = isNit ? `documento_proveedor='${digits}'` : likeUpper('proveedor_adjudicado', fuzzyPattern(query));
  const where = and(eqUpper('nombre_entidad', entity), supplierClause, dateRange('fecha_de_firma', from, to));
  const rows = await queryContracts(where, { order: 'valor_del_contrato DESC', signal });
  return isNit ? rows : rows.filter(row => normalizeText(row.proveedor_adjudicado).includes(normalizeText(query)));
}
