import {normalizeText} from '../core/text.js';
import {CONTRACT_FIELDS,SOCRATA} from './config.js';
import {socrataGet,socrataGetAll} from './secop-api.js';
import {and,dateRange,eqUpper,fuzzyPattern,likeUpper} from './soql.js';
const SELECT=CONTRACT_FIELDS.join(',');
export async function searchEntities(query,{signal}={}){
  const n=normalizeText(query);
  if(n.length<3)throw new Error('Escribe al menos 3 caracteres.');
  const pattern=fuzzyPattern(n);
  const rows=await socrataGetAll(SOCRATA.datasets.entities,{'$select':'nombre_entidad','$where':likeUpper('nombre_entidad',pattern),'$group':'nombre_entidad','$order':'nombre_entidad'},{signal});
  const found=new Set();
  for(const row of rows) if(row.nombre_entidad&&normalizeText(row.nombre_entidad).includes(n)) found.add(row.nombre_entidad.trim());
  return [...found].sort((a,b)=>a.localeCompare(b,'es',{sensitivity:'base'}));
}
export function queryContracts(where,{order='fecha_de_firma DESC',limit=5000,signal}={}){
  return socrataGet(SOCRATA.datasets.contracts,{'$select':SELECT,'$where':where,'$order':order,'$limit':limit},{signal});
}
export function entityWhere(entity,{from,to,dateField='fecha_de_firma'}={}){
  return and(eqUpper('nombre_entidad',entity),dateRange(dateField,from,to));
}
export function contractsForEntity(entity,{limit=200,signal}={}){
  return queryContracts(eqUpper('nombre_entidad',entity),{order:'valor_del_contrato DESC',limit,signal});
}
