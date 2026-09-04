import {el,clear} from '../core/dom.js';
import {getDocumentsForCase,getPagesForDocument} from '../storage/repositories.js';

export async function renderDocumento(host,contractCase,ctx){
  clear(host);
  const docs=(await getDocumentsForCase(contractCase.id)).filter(d=>d.origin==='USER_UPLOAD'&&d.pageCount>0);
  if(!docs.length){
    host.append(el('div',{class:'state-msg state-msg--info'},'Todavia no hay documentos procesados. Ve a la pestana Expediente y anade el PDF del contrato.'));
    return;
  }
  const selector=el('select',{class:'field',style:'max-width:420px'});
  docs.forEach(d=>selector.append(el('option',{value:d.id},d.name+' ('+d.pageCount+' pags)')));
  const stats=el('div',{class:'stat-grid'});
  const pageNav=el('div',{class:'row',style:'align-items:center;margin:12px 0'});
  const view=el('div',{class:'page-view'});
  host.append(el('div',{class:'row',style:'align-items:center;gap:12px'},[el('span',{class:'muted'},'Documento:'),selector]),stats,pageNav,view);

  async function load(docId){
    const doc=docs.find(d=>d.id===docId);
    const pages=(await getPagesForDocument(docId)).sort((a,b)=>a.pageNumber-b.pageNumber);
    clear(stats).append(
      el('div',{class:'stat'},[el('b',{},String(doc.pageCount)),el('span',{},'Paginas')]),
      el('div',{class:'stat'},[el('b',{},String(doc.wordCount)),el('span',{},'Palabras')]),
      el('div',{class:'stat'},[el('b',{},pages.filter(p=>p.ocrApplied).length+''),el('span',{},'Paginas con OCR')])
    );
    let current=0;
    const draw=()=>{
      clear(pageNav);
      const prev=el('button',{class:'btn btn--sm btn--ghost',onClick:()=>{if(current>0){current--;render();}}},'\u2190');
      const next=el('button',{class:'btn btn--sm btn--ghost',onClick:()=>{if(current<pages.length-1){current++;render();}}},'\u2192');
      pageNav.append(prev,el('span',{class:'muted'},'Pagina '+(current+1)+' de '+pages.length),next);
    };
    const render=()=>{draw();clear(view).append(el('div',{},pages[current]?.text||'(sin texto extraido en esta pagina)'));};
    render();
  }
  selector.addEventListener('change',()=>load(selector.value));
  await load(docs[0].id);
}
