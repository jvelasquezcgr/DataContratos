import {AnalysisStatus,DocumentOrigin,DocumentRole,EvidenceStatus,ExtractionStatus,Party,SCHEMA_VERSION} from '../core/catalogs.js';
import {contractKey,newId,nowIso} from '../core/identity.js';
function required(v,n){if(v===undefined||v===null||v==='')throw new TypeError(n+' es obligatorio');return v;}
export function createContractCase(secop){
  required(secop,'secop');
  const key=required(contractKey(secop),'contractKey');
  const now=nowIso();
  return {id:newId('case'),schemaVersion:SCHEMA_VERSION,contractKey:key,secop:structuredClone(secop),
    entityName:secop.nombre_entidad||'',contractReference:secop.referencia_del_contrato||secop.id_contrato||'',
    providerName:secop.proveedor_adjudicado||'',status:'OPEN',currentDocumentId:null,createdAt:now,updatedAt:now};
}
export function createDocument(input){
  required(input.contractCaseId,'contractCaseId'); required(input.name||input.originalName,'name');
  const now=nowIso();
  return {id:input.id||newId('doc'),contractCaseId:input.contractCaseId,origin:input.origin||DocumentOrigin.USER_UPLOAD,
    role:input.role||DocumentRole.OTHER,name:input.name||input.originalName,originalName:input.originalName||input.name,
    description:input.description||'',source:input.source||'',sourceUrl:input.sourceUrl||'',
    mimeType:input.mimeType||'application/pdf',size:Number(input.size||0),secopMetadata:input.secopMetadata||null,
    extractionStatus:input.extractionStatus||ExtractionStatus.NOT_REQUESTED,analysisStatus:input.analysisStatus||AnalysisStatus.NOT_ANALYZED,
    pageCount:Number(input.pageCount||0),wordCount:Number(input.wordCount||0),contentHash:input.contentHash||null,
    classification:input.classification||null,addedAt:input.addedAt||now,updatedAt:now};
}
export function createPage(input){
  required(input.documentId,'documentId'); required(input.contractCaseId,'contractCaseId');
  const pageNumber=Number(required(input.pageNumber,'pageNumber'));
  return {id:input.documentId+':p:'+pageNumber,contractCaseId:input.contractCaseId,documentId:input.documentId,pageNumber,
    text:input.text||'',wordCount:Number(input.wordCount||0),extractionMethod:input.extractionMethod||'PDFJS',
    ocrApplied:Boolean(input.ocrApplied),extractionWarnings:input.extractionWarnings||[],createdAt:nowIso()};
}
function base(prefix,input){required(input.contractCaseId,'contractCaseId');const now=nowIso();return {id:input.id||newId(prefix),contractCaseId:input.contractCaseId,createdAt:now,updatedAt:now};}
export const createClause=input=>({...base('clause',input),documentId:required(input.documentId,'documentId'),number:input.number||null,
  title:input.title||'',rawHeading:input.rawHeading||'',text:input.text||'',startPage:Number(input.startPage||1),
  endPage:Number(input.endPage||input.startPage||1),category:input.category||'OTRA',confidence:Number(input.confidence||0),
  classificationMethod:input.classificationMethod||'RULE',matchedRules:input.matchedRules||[],userCorrected:Boolean(input.userCorrected)});
