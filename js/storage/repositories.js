import {req,STORES,withStore} from './db.js';
export class Repository{
  constructor(storeName){this.storeName=storeName;}
  put(entity){return withStore(this.storeName,'readwrite',s=>req(s.put(entity)));}
  get(id){return withStore(this.storeName,'readonly',s=>req(s.get(id)));}
  delete(id){return withStore(this.storeName,'readwrite',s=>req(s.delete(id)));}
  getAll(){return withStore(this.storeName,'readonly',s=>req(s.getAll()));}
  byIndex(indexName,value){return withStore(this.storeName,'readonly',s=>req(s.index(indexName).getAll(value)));}
  putMany(entities){return withStore(this.storeName,'readwrite',store=>{entities.forEach(e=>store.put(e));return entities.length;});}
}
export const repositories=Object.freeze({
  contractCases:new Repository(STORES.contractCases),documents:new Repository(STORES.documents),
  documentBlobs:new Repository(STORES.documentBlobs),pages:new Repository(STORES.pages),
  clauses:new Repository(STORES.clauses),obligations:new Repository(STORES.obligations),
  facts:new Repository(STORES.facts),evidenceLinks:new Repository(STORES.evidenceLinks),
  alerts:new Repository(STORES.alerts),findings:new Repository(STORES.findings),
  searchIndexes:new Repository(STORES.searchIndexes),userCorrections:new Repository(STORES.userCorrections)
});
export const saveDocumentBlob=(documentId,blob)=>repositories.documentBlobs.put({id:documentId,blob,updatedAt:new Date().toISOString()});
export const getDocumentBlob=documentId=>repositories.documentBlobs.get(documentId);
export const getContractCaseByKey=key=>repositories.contractCases.byIndex('byContractKey',key).then(rows=>rows[0]||null);
export const getDocumentsForCase=caseId=>repositories.documents.byIndex('byCase',caseId);
export const getPagesForDocument=documentId=>repositories.pages.byIndex('byDocument',documentId);
export const getClausesForCase=caseId=>repositories.clauses.byIndex('byCase',caseId);
