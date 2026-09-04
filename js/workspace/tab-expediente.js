import {el,clear} from '../core/dom.js';
import {toast} from '../core/toast.js';
import {loadExpedientDocuments} from '../data/secop-documents.js';
import {OperationRun} from '../data/secop-api.js';
import {createDocument} from '../models/entities.js';
import {DocumentOrigin,DocumentRole,ExtractionStatus,AnalysisStatus} from '../core/catalogs.js';
import {repositories,saveDocumentBlob,getDocumentsForCase} from '../storage/repositories.js';
import {extractPdf} from '../documents/pdf-extractor.js';

export async function renderExpediente(host,contractCase,ctx){
  clear(host);
  const secopBox=el('div',{});
  const userBox=el('div',{});
  host.append(
    el('h3',{style:'margin:0 0 8px'},'Documentos SECOP'),
    secopBox,
    el('hr',{style:'border:0;border-top:1px solid var(--line);margin:20px 0'}),
    el('h3',{style:'margin:0 0 8px'},'Documentos incorporados por el usuario'),
    userBox,
    buildUploader(contractCase,userBox,ctx)
  );
  await loadSecop(contractCase,secopBox);
  await refreshUserDocs(contractCase,userBox);
}

async function loadSecop(contractCase,box){
  const run=new OperationRun();
  clear(box).append(el('p',{class:'muted'},'Consultando documentos SECOP...'));
  try{
    const docs=await loadExpedientDocuments(contractCase.secop,{signal:run.signal});
    clear(box);
    if(!docs.length){ box.append(el('div',{class:'state-msg state-msg--warn'},'No se encontraron documentos SECOP para este contrato.')); return; }
    box.append(el('p',{class:'muted',style:'margin:0 0 8px'},docs.length+' documento(s) SECOP'));
    const table=el('table',{class:'data'});
    table.append(el('thead',{},[el('tr',{},[el('th',{},'Documento'),el('th',{},'Fuente'),el('th',{style:'text-align:center'},'Accion')])]));
    const tbody=el('tbody',{});
    for(const d of docs){
      const actions=el('div',{class:'row',style:'gap:6px;justify-content:center'});
      if(d.sourceUrl){
        // Descarga individual, exactamente como en app.js (enlace directo al documento).
        actions.append(el('a',{href:d.sourceUrl,target:'_blank',class:'btn btn--sm btn--ghost'},'Descargar'));
      }else{
        actions.append(el('span',{class:'muted',style:'font-size:12px'},'Sin URL'));
      }
      tbody.append(el('tr',{},[
        el('td',{},[el('span',{class:'tag tag--secop'},'SECOP'),' ',d.name]),
        el('td',{style:'font-size:12px;color:var(--muted)'},d.source||''),
        el('td',{},[actions])
      ]));
    }
    table.append(tbody);
    box.append(el('div',{class:'table-wrap'},[table]));
  }catch(e){
    if(e.name==='AbortError')return;
    clear(box).append(el('div',{class:'state-msg state-msg--error'},'Error consultando SECOP: '+e.message));
  }
}

function buildUploader(contractCase,userBox,ctx){
  const input=el('input',{type:'file',accept:'.pdf',style:'display:none'});
  const zone=el('div',{class:'dropzone',style:'margin-top:12px'},'+ Anadir documento (PDF) al expediente');
  const progressWrap=el('div',{style:'margin-top:12px'});
  zone.addEventListener('click',()=>input.click());
  zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('is-over');});
  zone.addEventListener('dragleave',()=>zone.classList.remove('is-over'));
  zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('is-over');if(e.dataTransfer.files[0])handleFile(e.dataTransfer.files[0],contractCase,userBox,progressWrap,ctx);});
  input.addEventListener('change',()=>{if(input.files[0])handleFile(input.files[0],contractCase,userBox,progressWrap,ctx);input.value='';});
  return el('div',{},[zone,input,progressWrap]);
}

async function handleFile(file,contractCase,userBox,progressWrap,ctx){
  if(!file.name.toLowerCase().endsWith('.pdf')){toast('Solo se aceptan PDF.','error');return;}
  clear(progressWrap);
  const bar=el('div',{class:'progress'},[el('div',{})]);
  const label=el('p',{class:'muted',style:'margin:6px 0 0'},'Preparando...');
  progressWrap.append(bar,label);
  const setProgress=(pct,text)=>{bar.firstChild.style.width=Math.round(pct)+'%';if(text)label.textContent=text;};
  try{
    // 1. Crear Document (origen USER_UPLOAD) y guardarlo.
    const isContract=/contrato/i.test(file.name);
    const doc=createDocument({contractCaseId:contractCase.id,origin:DocumentOrigin.USER_UPLOAD,
      role:isContract?DocumentRole.CONTRACT:DocumentRole.OTHER,name:file.name,originalName:file.name,
      size:file.size,extractionStatus:ExtractionStatus.PROCESSING});
    await repositories.documents.put(doc);
    // 2. Guardar el blob en IndexedDB.
    await saveDocumentBlob(doc.id,file);
    // 3. Extraer texto pagina por pagina (logica portada de gestor.js).
    const {pages,warnings}=await extractPdf(file,{onProgress:setProgress});
    // 4. Persistir paginas y actualizar el documento.
    const pageEntities=pages.map(p=>({id:doc.id+':p:'+p.pageNumber,contractCaseId:contractCase.id,documentId:doc.id,
      pageNumber:p.pageNumber,text:p.text,wordCount:p.wordCount,extractionMethod:p.extractionMethod,ocrApplied:p.ocrApplied,
      extractionWarnings:[],createdAt:new Date().toISOString()}));
    await repositories.pages.putMany(pageEntities);
    doc.pageCount=pages.length;
    doc.wordCount=pages.reduce((a,p)=>a+p.wordCount,0);
    doc.extractionStatus=ExtractionStatus.DONE;
    doc.analysisStatus=AnalysisStatus.INDEXED;
    doc.updatedAt=new Date().toISOString();
    await repositories.documents.put(doc);
    setProgress(100,'Documento procesado: '+pages.length+' paginas, '+doc.wordCount+' palabras'+(warnings.length?(' ('+warnings.length+' avisos OCR)'):''));
    toast('Documento procesado','ok');
    await refreshUserDocs(contractCase,userBox);
  }catch(e){
    console.error(e);
    label.textContent='Error: '+e.message;
    toast('Error procesando el PDF: '+e.message,'error');
  }
}

async function refreshUserDocs(contractCase,box){
  clear(box);
  const all=await getDocumentsForCase(contractCase.id);
  const userDocs=all.filter(d=>d.origin==='USER_UPLOAD');
  if(!userDocs.length){ box.append(el('p',{class:'muted'},'Aun no has incorporado documentos. Usa el boton de abajo.')); return; }
  const table=el('table',{class:'data'});
  table.append(el('thead',{},[el('tr',{},[el('th',{},'Documento'),el('th',{},'Paginas'),el('th',{},'Palabras'),el('th',{},'Estado')])]));
  const tbody=el('tbody',{});
  for(const d of userDocs){
    tbody.append(el('tr',{},[
      el('td',{},[el('span',{class:'tag tag--user'},'PROPIO'),' ',d.name]),
      el('td',{},String(d.pageCount||0)),
      el('td',{},String(d.wordCount||0)),
      el('td',{style:'font-size:12px;color:var(--muted)'},d.extractionStatus)
    ]));
  }
  table.append(tbody);
  box.append(el('div',{class:'table-wrap'},[table]));
}
