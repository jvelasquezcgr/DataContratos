import {el,byId,clear} from '../core/dom.js';
import {money,isoDate} from '../core/format.js';
import {appState} from '../core/state.js';
import {toast} from '../core/toast.js';
import {repositories} from '../storage/repositories.js';
import {renderExpediente} from './tab-expediente.js';
import {renderDocumento} from './tab-document.js';
import {renderClausulas} from './tab-clauses.js';

const TABS=[
  {id:'overview',label:'Resumen'},
  {id:'expediente',label:'Expediente'},
  {id:'documento',label:'Documento'},
  {id:'clausulas',label:'Clausulas'}
];

export async function mountWorkspace(container,ctx={}){
  clear(container);
  const caseId=ctx.contractCaseId||appState.get('currentContractCaseId');
  const contractCase=caseId?await repositories.contractCases.get(caseId):null;
  if(!contractCase){
    container.append(el('section',{class:'card'},[
      el('div',{class:'state-msg state-msg--warn'},'No hay expediente abierto. Selecciona un contrato primero.'),
      el('button',{class:'btn',style:'margin-top:12px',onClick:()=>ctx.navigate('entities')},'Ir al buscador')
    ]));
    return;
  }
  const ref=contractCase.contractReference||contractCase.contractKey;
  const tabHost=el('div',{});
  const state={active:'overview'};
  const tabsBar=el('div',{class:'ws-tabs'});
  function drawTabs(){
    clear(tabsBar);
    for(const t of TABS){
      tabsBar.append(el('button',{class:'ws-tab'+(t.id===state.active?' is-active':''),onClick:()=>select(t.id)},t.label));
    }
  }
  async function select(id){ state.active=id; drawTabs(); await renderTab(id,tabHost,contractCase,ctx); }
  drawTabs();

  container.append(el('section',{class:'card'},[
    el('div',{class:'ws-head'},[
      el('div',{},[
        el('h2',{class:'ws-title'},'Contrato '+ref),
        el('p',{class:'ws-sub'},(contractCase.entityName||'')+' \u00b7 '+(contractCase.providerName||''))
      ]),
      el('button',{class:'btn btn--ghost btn--sm',onClick:()=>ctx.navigate('contracts')},'\u2190 Volver a contratos')
    ]),
    tabsBar,
    tabHost
  ]));
  await select('overview');
}

async function renderTab(id,host,contractCase,ctx){
  clear(host);
  if(id==='overview') return renderOverview(host,contractCase);
  if(id==='expediente') return renderExpediente(host,contractCase,ctx);
  if(id==='documento') return renderDocumento(host,contractCase,ctx);
  if(id==='clausulas') return renderClausulas(host,contractCase,ctx);
}

function renderOverview(host,c){
  const s=c.secop||{};
  const dl=el('dl',{class:'kv'});
  const rows=[
    ['Entidad',s.nombre_entidad],['NIT entidad',s.nit_entidad],['Referencia',s.referencia_del_contrato||s.id_contrato],
    ['Proceso',s.proceso_de_compra],['Contratista',s.proveedor_adjudicado],['Documento proveedor',s.documento_proveedor],
    ['Objeto',s.objeto_del_contrato],['Valor',money(s.valor_del_contrato)],['Valor facturado',money(s.valor_facturado)],
    ['Modalidad',s.modalidad_de_contratacion],['Tipo',s.tipo_de_contrato],['Estado',s.estado_contrato],
    ['Firma',isoDate(s.fecha_de_firma)],['Inicio',isoDate(s.fecha_de_inicio_del_contrato)],['Terminacion',isoDate(s.fecha_de_fin_del_contrato)]
  ];
  for(const [k,v] of rows){ dl.append(el('dt',{},k),el('dd',{},v||'-')); }
  host.append(dl);
  if(s.urlproceso?.url||typeof s.urlproceso==='string'){
    const url=s.urlproceso?.url||s.urlproceso;
    host.append(el('p',{style:'margin-top:16px'},[el('a',{href:url,target:'_blank',class:'btn btn--sm btn--ghost'},'Ver proceso en SECOP')]));
  }
}
