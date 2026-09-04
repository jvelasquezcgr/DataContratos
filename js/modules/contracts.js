import {appState} from '../core/state.js';
import {el,clear} from '../core/dom.js';
import {money,isoDate} from '../core/format.js';
import {toast} from '../core/toast.js';
import {contractsForEntity} from '../data/secop-contracts.js';
import {OperationRun} from '../data/secop-api.js';
import {createContractCase} from '../models/entities.js';
import {repositories,getContractCaseByKey} from '../storage/repositories.js';
import {contractKey} from '../core/identity.js';
let activeRun=null;
export function mountContracts(container,{navigate}={}){
  clear(container);
  const entity=appState.get('selectedEntity');
  if(!entity){
    container.append(el('section',{class:'card'},[
      el('div',{class:'card__head'},[el('h2',{class:'card__title'},'\ud83d\udcc4 Contratos de la entidad')]),
      el('div',{class:'state-msg state-msg--info'},'Primero selecciona una entidad en el buscador.'),
      el('button',{class:'btn',style:'margin-top:12px',onClick:()=>navigate('entities')},'Ir al buscador')
    ]));
    return;
  }
  const body=el('div',{});
  container.append(el('section',{class:'card'},[
    el('div',{class:'card__head'},[el('h2',{class:'card__title'},'\ud83d\udcc4 Contratos de '+entity)]),
    el('p',{class:'muted'},'Selecciona un contrato para abrir su expediente.'),
    body
  ]));
  load(entity,body,navigate);
}
async function load(entity,body,navigate){
  if(activeRun)activeRun.abort();
  activeRun=new OperationRun();
  clear(body).append(el('p',{class:'muted',style:'margin-top:12px'},'Cargando contratos...'));
  try{
    const rows=await contractsForEntity(entity,{limit:200,signal:activeRun.signal});
    appState.set({lastResults:rows},'contracts:load');
    renderTable(rows,body,navigate);
  }catch(e){
    if(e.name==='AbortError')return;
    clear(body).append(el('div',{class:'state-msg state-msg--error'},e.message));
  }
}
function renderTable(rows,body,navigate){
  clear(body);
  if(!rows.length){body.append(el('div',{class:'state-msg state-msg--warn'},'Sin contratos para esta entidad.'));return;}
  const table=el('table',{class:'data'});
  table.append(el('thead',{},[el('tr',{},[
    el('th',{},'Contrato'),el('th',{},'Proveedor'),el('th',{},'Fecha'),el('th',{style:'text-align:right'},'Valor'),
    el('th',{},'Objeto'),el('th',{style:'text-align:center'},'Accion')
  ])]));
  const tbody=el('tbody',{});
  rows.forEach((x,i)=>{
    tbody.append(el('tr',{},[
      el('td',{style:'font-weight:600'},x.referencia_del_contrato||x.id_contrato||'-'),
      el('td',{style:'max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis',title:x.proveedor_adjudicado||''},x.proveedor_adjudicado||'-'),
      el('td',{},isoDate(x.fecha_de_firma)),
      el('td',{style:'text-align:right;font-weight:600'},money(x.valor_del_contrato)),
      el('td',{style:'max-width:320px;font-size:12px;color:var(--muted);white-space:normal'},x.objeto_del_contrato||''),
      el('td',{style:'text-align:center'},[el('button',{class:'btn btn--sm',onClick:()=>openCase(x,navigate)},'Abrir expediente')])
    ]));
  });
  table.append(tbody);
  body.append(el('p',{class:'muted',style:'margin:8px 0'},rows.length+' contrato(s)'),el('div',{class:'table-wrap'},[table]));
}
async function openCase(secopRow,navigate){
  try{
    const key=contractKey(secopRow);
    if(!key){toast('El contrato no tiene identificador utilizable.','error');return;}
    let contractCase=await getContractCaseByKey(key);
    if(!contractCase){
      contractCase=createContractCase(secopRow);
      await repositories.contractCases.put(contractCase);
      toast('Expediente creado: '+key,'ok');
    }else{
      toast('Expediente recuperado: '+key,'ok');
    }
    appState.set({currentContractCaseId:contractCase.id},'contracts:openCase');
    navigate('workspace',{contractCaseId:contractCase.id});
  }catch(e){ console.error(e); toast('No se pudo abrir el expediente: '+e.message,'error'); }
}
