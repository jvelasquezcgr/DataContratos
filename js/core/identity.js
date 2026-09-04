export function newId(prefix='id'){
  const value=globalThis.crypto?.randomUUID?.() ?? (Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
  return prefix+':'+value;
}
export function contractKey(secop={}){
  return String(secop.id_contrato||secop.referencia_del_contrato||secop.proceso_de_compra||'').trim();
}
export const nowIso=()=>new Date().toISOString();
