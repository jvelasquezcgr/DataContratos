import { normalizeText } from '../core/text.js';

export const escapeLiteral = value => String(value ?? '').replaceAll("'", "''");

export function eqUpper(field, value) {
  return `upper(${field})='${escapeLiteral(normalizeText(value))}'`;
}

export function fuzzyPattern(token) {
  const normalized = normalizeText(token);
  if (!normalized) return '';
  return '%' + [...normalized].map(char => /[AEIOUN]/.test(char) ? '%' : char).join('') + '%';
}

export function likeUpper(field, pattern) {
  return `upper(${field}) like '${escapeLiteral(pattern)}'`;
}

export function dateRange(field, from, to) {
  const parts = [];
  if (from) parts.push(`${field}>='${from}T00:00:00'`);
  if (to) parts.push(`${field}<='${to}T23:59:59'`);
  return parts.join(' AND ');
}

export const and = (...clauses) => clauses.filter(Boolean).join(' AND ');
export const or = (...clauses) => `(${clauses.filter(Boolean).join(' OR ')})`;
