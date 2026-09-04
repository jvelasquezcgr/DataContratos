// Parser deterministico de clausulas para contratos publicos colombianos.
// Detecta encabezados tipo "CLAUSULA PRIMERA", ordinales sueltos y titulos en mayuscula,
// delimita el texto de cada clausula y la clasifica por palabras clave.

// Mapa explicito ordinal->valor. Incluye variantes (UNDECIMA = DECIMA PRIMERA = 11).
const ORDINAL_VALUE=new Map([
  ['PRIMERA',1],['SEGUNDA',2],['TERCERA',3],['CUARTA',4],['QUINTA',5],['SEXTA',6],['SEPTIMA',7],['OCTAVA',8],['NOVENA',9],['DECIMA',10],
  ['UNDECIMA',11],['DECIMA PRIMERA',11],['DUODECIMA',12],['DECIMA SEGUNDA',12],['DECIMA TERCERA',13],['DECIMA CUARTA',14],
  ['DECIMA QUINTA',15],['DECIMA SEXTA',16],['DECIMA SEPTIMA',17],['DECIMA OCTAVA',18],['DECIMA NOVENA',19],['VIGESIMA',20],
  ['VIGESIMA PRIMERA',21],['VIGESIMA SEGUNDA',22],['VIGESIMA TERCERA',23],['VIGESIMA CUARTA',24],['VIGESIMA QUINTA',25],
  ['VIGESIMA SEXTA',26],['VIGESIMA SEPTIMA',27],['VIGESIMA OCTAVA',28],['VIGESIMA NOVENA',29],['TRIGESIMA',30]
]);
const ORDINALS=[...ORDINAL_VALUE.keys()];
// Ordinales ordenados de mas largo a mas corto (para que "DECIMA SEPTIMA" gane sobre "DECIMA").
const ORDINALS_BY_LEN=[...ORDINALS].sort((a,b)=>b.length-a.length);

function stripAccents(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
// Pliega acentos SIN cambiar la longitud (1 caracter -> 1 caracter), para conservar offsets.
const FOLD_MAP={'\u00e1':'a','\u00e9':'e','\u00ed':'i','\u00f3':'o','\u00fa':'u','\u00fc':'u','\u00f1':'n',
'\u00c1':'A','\u00c9':'E','\u00cd':'I','\u00d3':'O','\u00da':'U','\u00dc':'U','\u00d1':'N'};
function foldAccents(s){ return String(s||'').replace(/[\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc\u00f1\u00c1\u00c9\u00cd\u00d3\u00da\u00dc\u00d1]/g,c=>FOLD_MAP[c]); }

// Reglas de clasificacion: [categoria, [palabras clave...]]. Se evalua sobre el titulo.
const RULES=[
  ['OBJETO',['OBJETO']],
  ['ESPECIFICACIONES_TECNICAS',['ESPECIFICACION','ALCANCE','ANEXO TECNICO','OBLIGACIONES ESPECIFICAS']],
  ['VALOR',['VALOR']],
  ['FORMA_PAGO',['FORMA DE PAGO','PAGO']],
  ['PRESUPUESTO',['APROPIACION','PRESUPUEST','IMPUTACION','REGISTRO PRESUPUESTAL','CDP','RP']],
  ['PLAZO',['PLAZO','TERMINO DE EJECUCION','DURACION','VIGENCIA']],
  ['GARANTIAS',['GARANTIA','AMPARO','POLIZA']],
  ['OBLIGACIONES_CONTRATISTA',['OBLIGACIONES DEL CONTRATISTA','OBLIGACIONES GENERALES DEL CONTRATISTA']],
  ['OBLIGACIONES_ENTIDAD',['OBLIGACIONES DE LA ENTIDAD','OBLIGACIONES DEL CONTRATANTE']],
  ['SUPERVISION',['SUPERVISION','SUPERVISOR']],
  ['INTERVENTORIA',['INTERVENTORIA','INTERVENTOR']],
  ['MULTAS',['MULTA']],
  ['CLAUSULA_PENAL',['CLAUSULA PENAL','PENAL PECUNIARIA']],
  ['CADUCIDAD',['CADUCIDAD']],
  ['CESION',['CESION','SUBCONTRAT']],
  ['INDEMNIDAD',['INDEMNIDAD']],
  ['SUSPENSION',['SUSPENSION']],
  ['TERMINACION',['TERMINACION']],
  ['LIQUIDACION',['LIQUIDACION']],
  ['CONTROVERSIAS',['CONTROVERSIA','SOLUCION DE CONFLICTOS','ARBITR']],
  ['PERFECCIONAMIENTO',['PERFECCIONAMIENTO','REQUISITOS DE EJECUCION','LEGALIZACION']],
  ['EJECUCION',['EJECUCION']],
  ['DOMICILIO',['DOMICILIO']],
  ['DOCUMENTOS_INTEGRANTES',['DOCUMENTOS DEL CONTRATO','DOCUMENTOS INTEGRANTES','DOCUMENTOS QUE HACEN PARTE']],
  ['CONFIDENCIALIDAD',['CONFIDENCIAL','RESERVA','DATOS PERSONALES']],
  ['INDEMNIDAD',['INDEMNIDAD']]
];

function classify(title){
  const t=stripAccents(title).toUpperCase();
  const matched=[];
  for(const [cat,keys] of RULES){
    if(keys.some(k=>t.includes(k))){ matched.push(cat); }
  }
  if(matched.length) return {category:matched[0],confidence:matched.length>1?0.6:0.85,matchedRules:matched};
  return {category:'OTRA',confidence:0.3,matchedRules:[]};
}

// Regex de encabezado sobre texto PLEGADO (sin acentos): "CLAUSULA PRIMERA", "CLAUSULA 1", "PRIMERA.-".
// Los ordinales van de mas largo a mas corto para evitar que "DECIMA" gane sobre "DECIMA SEPTIMA".
const HEADING=new RegExp(
  '(?:^|\\n|\\.)\\s*(?:CLAUSULA\\s+)?('+ORDINALS_BY_LEN.map(o=>o.replace(/ /g,'\\s+')).join('|')+
  '|CLAUSULA\\s+\\d{1,2}|\\d{1,2})\\s*[\\.:\\-\u2013)]*\\s*([^\\n]{0,80})','gi');

// Construye un texto continuo con marcas de pagina para poder mapear offset->pagina.
function buildDocText(pages){
  let full=''; const offsets=[];
  for(const p of pages){
    offsets.push({page:p.pageNumber,start:full.length});
    full+='\n'+(p.text||'')+'\n';
  }
  return {full,offsets};
}
function pageAtOffset(offsets,offset){
  let page=offsets.length?offsets[0].page:1;
  for(const o of offsets){ if(o.start<=offset) page=o.page; else break; }
  return page;
}

function ordinalFromHeading(raw){
  const up=foldAccents(String(raw||'')).toUpperCase();
  const numMatch=up.match(/CLAUSULA\s+(\d{1,2})/)||up.match(/^\s*(\d{1,2})\b/);
  if(numMatch) return parseInt(numMatch[1],10);
  // Probar frases largas primero para no confundir "DECIMA" con "DECIMA SEPTIMA".
  for(const word of ORDINALS_BY_LEN){ if(up.includes(word)) return ORDINAL_VALUE.get(word); }
  return null;
}

export function parseClauses(pages){
  const {full,offsets}=buildDocText(pages);
  // El matching corre sobre texto plegado (misma longitud), pero el texto mostrado sale de `full`.
  const folded=foldAccents(full);
  const marks=[];
  let m;
  HEADING.lastIndex=0;
  while((m=HEADING.exec(folded))!==null){
    // El match empieza en un caracter de frontera (\n o .). Saltarlo para no heredar la pagina anterior.
    const lead=(m[0].match(/^[\n.\s]*/)||[''])[0].length;
    const realIndex=m.index+lead;
    const rawTitle=full.slice(realIndex,m.index+m[0].length).replace(/^[\n.\s]+/,'');
    const number=ordinalFromHeading(m[1]);
    // Filtrar falsos positivos: numeros sueltos sin contexto de titulo suelen ser ruido.
    const foldedHead=foldAccents(m[1]).toUpperCase().replace(/\s+/g,' ').trim();
    const looksClause=/CLAUSULA/i.test(m[0]) || ORDINAL_VALUE.has(foldedHead);
    if(!looksClause) continue;
    marks.push({index:realIndex,titleGuess:(m[2]||'').trim(),rawHeading:rawTitle.slice(0,80),number});
  }
  // Deduplicar marcas muy cercanas.
  const clean=[];
  for(const mk of marks){ if(!clean.length||mk.index-clean[clean.length-1].index>40) clean.push(mk); }
  const clauses=[];
  for(let i=0;i<clean.length;i++){
    const start=clean[i].index;
    const end=i+1<clean.length?clean[i+1].index:full.length;
    const segment=full.slice(start,end).trim();
    const firstBreak=segment.indexOf('\n');
    let title=clean[i].titleGuess;
    if(!title){ title=segment.split(/[\.\n]/)[0].replace(/^(CL[A\u00c1]USULA\s+\w+\s*)/i,'').trim(); }
    title=title.replace(/\s+/g,' ').slice(0,80);
    const startPage=pageAtOffset(offsets,start);
    const endPage=pageAtOffset(offsets,end-1);
    const cls=classify(title||clean[i].rawHeading);
    clauses.push({number:clean[i].number,title:title||'(sin titulo)',rawHeading:clean[i].rawHeading,
      text:segment,startPage,endPage,category:cls.category,confidence:cls.confidence,matchedRules:cls.matchedRules});
  }
  // Renumerar secuencial si faltan numeros.
  clauses.forEach((c,i)=>{ if(!c.number) c.number=i+1; });
  return clauses;
}
