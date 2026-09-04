// Extraccion de texto pagina por pagina con PDF.js y OCR opcional (portado de gestor.js).
// Carga PDF.js y Tesseract desde CDN de forma diferida.
const PDFJS_URL='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const TESSERACT_URL='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
const OCR_MIN_CHARS=50; // igual criterio que gestor.js

function loadScript(src){
  return new Promise((resolve,reject)=>{
    if([...document.scripts].some(s=>s.src===src))return resolve();
    const s=document.createElement('script');
    s.src=src; s.onload=()=>resolve(); s.onerror=()=>reject(new Error('No se pudo cargar '+src));
    document.head.appendChild(s);
  });
}
async function ensurePdfjs(){
  if(!window.pdfjsLib){ await loadScript(PDFJS_URL); }
  window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS_WORKER;
  return window.pdfjsLib;
}
async function ensureTesseract(){
  if(!window.Tesseract){ await loadScript(TESSERACT_URL); }
  return window.Tesseract;
}

export async function extractPdf(file,{onProgress,useOcr=true}={}){
  const pdfjsLib=await ensurePdfjs();
  const buffer=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:buffer}).promise;
  const pageCount=pdf.numPages;
  const pages=[]; const warnings=[];
  for(let i=1;i<=pageCount;i++){
    onProgress&&onProgress((i-1)/pageCount*100,'Analizando pagina '+i+' de '+pageCount+'...');
    const page=await pdf.getPage(i);
    const textContent=await page.getTextContent();
    let text=textContent.items.map(it=>it.str).join(' ');
    let ocrApplied=false, method='PDFJS';
    if(useOcr && text.trim().length<OCR_MIN_CHARS){
      onProgress&&onProgress((i-1)/pageCount*100,'OCR en pagina '+i+' (poco texto)...');
      try{
        const Tesseract=await ensureTesseract();
        const viewport=page.getViewport({scale:1.5});
        const canvas=document.createElement('canvas');
        const ctx=canvas.getContext('2d');
        canvas.width=viewport.width; canvas.height=viewport.height;
        await page.render({canvasContext:ctx,viewport}).promise;
        const result=await Tesseract.recognize(canvas,'spa+eng');
        text=result.data.text||''; ocrApplied=true; method='OCR_TESSERACT';
      }catch(err){ warnings.push('OCR fallo en pagina '+i); console.warn('OCR fallo',err); }
    }
    const wordCount=text.split(/\s+/).filter(Boolean).length;
    pages.push({pageNumber:i,text,wordCount,extractionMethod:method,ocrApplied});
  }
  pdf.destroy&&pdf.destroy();
  onProgress&&onProgress(100,'Extraccion completa');
  return {pages,warnings};
}
