import {el,clear} from '../core/dom.js';
import {toast} from '../core/toast.js';
import {getDocumentsForCase,getPagesForDocument,getClausesForCase,repositories} from '../storage/repositories.js';
import {parseClauses} from '../contracts/clause-parser.js';
import {createClause} from '../models/entities.js';

export async function renderClausulas(host,contractCase,ctx){
  clear(host);
  const docs=(await getDocumentsForCase(contractCase.id)).filter(d=>d.origin==='USER_UPLOAD'&&d.pageCount>0);
  if(!docs.length){
    host.append(el('div',{class:'state-msg state-msg--info'},'Anade y procesa el PDF del contrato en la pestana Expediente para detectar clausulas.'));
    return;
  }
  const contractDoc=docs.find(d=>d.role==='CONTRACT')||docs[0];
  const toolbar=el('div',{class:'row',style:'align-items:center;justify-content:space-between;margin-bottom:12px'});
  const listBox=el('div',{});
  toolbar.append(
    el('span',{class:'muted'},'Documento analizado: '+contractDoc.name),
    el('button',{class:'btn btn--sm',onClick:()=>run(true)},'Re-analizar clausulas')
  );
  host.append(toolbar,listBox);

  async function run(force){
    clear(listBox).append(el('p',{class:'muted'},'Detectando clausulas...'));
    let clauses=await getClausesForCase(contractCase.id);
    clauses=clauses.filter(c=>c.documentId===contractDoc.id);
    if(force||!clauses.length){
      const pages=(await getPagesForDocument(contractDoc.id)).sort((a,b)=>a.pageNumber-b.pageNumber);
      const detected=parseClauses(pages);
      // Borrar previas de este documento y guardar nuevas.
      for(const old of clauses) await repositories.clauses.delete(old.id);
      const entities=detected.map(d=>createClause({contractCaseId:contractCase.id,documentId:contractDoc.id,
        number:d.number,title:d.title,rawHeading:d.rawHeading,text:d.text,startPage:d.startPage,endPage:d.endPage,
        category:d.category,confidence:d.confidence,matchedRules:d.matchedRules}));
      if(entities.length) await repositories.clauses.putMany(entities);
      clauses=entities;
      if(force) toast(entities.length+' clausulas detectadas','ok');
    }
    renderList(clauses,listBox,ctx);
  }

  await run(false);
}

function pageLabel(c){ return c.startPage===c.endPage?('pag. '+c.startPage):('pag. '+c.startPage+'-'+c.endPage); }

function renderList(clauses,box,ctx){
  clear(box);
  if(!clauses.length){ box.append(el('div',{class:'state-msg state-msg--warn'},'No se detectaron clausulas. Prueba re-analizar; el PDF puede requerir OCR.')); return; }
  box.append(el('p',{class:'muted',style:'margin:0 0 10px'},clauses.length+' clausulas identificadas'));
  clauses.sort((a,b)=>(a.startPage-b.startPage)||(a.number||0)-(b.number||0));
  clauses.forEach((c,idx)=>{
    const num=String(c.number||idx+1).padStart(2,'0');
    const header=el('div',{class:'row',style:'align-items:center;justify-content:space-between'},[
      el('div',{},[el('span',{class:'clause-num'},num+' \u00b7 '),el('strong',{},c.title||c.rawHeading||'(sin titulo)')]),
      el('div',{},[el('span',{class:'tag tag--cat'},c.category),' ',el('span',{class:'muted',style:'font-size:12px'},pageLabel(c))])
    ]);
    const bodyBox=el('div',{style:'display:none'});
    const item=el('div',{class:'clause-item'},[header]);
    item.addEventListener('click',()=>{
      const open=bodyBox.style.display==='block';
      bodyBox.style.display=open?'none':'block';
      if(!open&&!bodyBox.dataset.filled){
        bodyBox.dataset.filled='1';
        bodyBox.append(
          el('div',{class:'clause-body'},c.text||'(sin texto)'),
          el('div',{style:'margin-top:8px'},[
            el('button',{class:'btn btn--sm btn--ghost',onClick:(e)=>{e.stopPropagation();ctx.navigate&&openPage(ctx,c);}},'Abrir pagina '+c.startPage)
          ])
        );
      }
    });
    item.append(bodyBox);
    box.append(item);
  });
}

function openPage(ctx,clause){
  // Cambia a la pestana Documento; el usuario navega a la pagina de la clausula.
  toast('Abre la pestana Documento y ve a la pagina '+clause.startPage,'info');
}
