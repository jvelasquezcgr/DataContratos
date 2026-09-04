export function normalizeText(value){
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();
}
export function normalizeToken(value){
  return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\u00f1]/g,'').trim();
}
export function collapseSpaces(value){ return String(value ?? '').replace(/\s+/g,' ').trim(); }
export function onlyDigits(value){ return String(value ?? '').replace(/\D/g,''); }
