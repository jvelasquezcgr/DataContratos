import {
  AnalysisStatus, DocumentOrigin, DocumentRole, EvidenceStatus, ExtractionStatus, Party, SCHEMA_VERSION
} from '../core/catalogs.js';
import { contractKey, newId, nowIso } from '../core/identity.js';

function required(value, name) {
  if (value === undefined || value === null || value === '') throw new TypeError(`${name} es obligatorio`);
  return value;
}

export function createContractCase(secop) {
  required(secop, 'secop');
  const key = required(contractKey(secop), 'contractKey');
  const now = nowIso();
  return {
    id: newId('case'), schemaVersion: SCHEMA_VERSION, contractKey: key, secop: structuredClone(secop),
    entityName: secop.nombre_entidad || '', contractReference: secop.referencia_del_contrato || secop.id_contrato || '',
    providerName: secop.proveedor_adjudicado || '', status: 'OPEN', currentDocumentId: null,
    createdAt: now, updatedAt: now
  };
}

export function createDocument(input) {
  required(input.contractCaseId, 'contractCaseId');
  required(input.name || input.originalName, 'name');
  const now = nowIso();
  return {
    id: input.id || newId('doc'), contractCaseId: input.contractCaseId,
    origin: input.origin || DocumentOrigin.USER_UPLOAD, role: input.role || DocumentRole.OTHER,
    name: input.name || input.originalName, originalName: input.originalName || input.name,
    description: input.description || '', source: input.source || '', sourceUrl: input.sourceUrl || '',
    mimeType: input.mimeType || 'application/pdf', size: Number(input.size || 0),
    secopMetadata: input.secopMetadata || null,
    extractionStatus: input.extractionStatus || ExtractionStatus.NOT_REQUESTED,
    analysisStatus: input.analysisStatus || AnalysisStatus.NOT_ANALYZED,
    pageCount: Number(input.pageCount || 0), wordCount: Number(input.wordCount || 0),
    contentHash: input.contentHash || null, classification: input.classification || null,
    addedAt: input.addedAt || now, updatedAt: now
  };
}

export function createPage(input) {
  required(input.documentId, 'documentId'); required(input.contractCaseId, 'contractCaseId');
  const pageNumber = Number(required(input.pageNumber, 'pageNumber'));
  return {
    id: `${input.documentId}:p:${pageNumber}`, contractCaseId: input.contractCaseId, documentId: input.documentId,
    pageNumber, text: input.text || '', wordCount: Number(input.wordCount || 0),
    extractionMethod: input.extractionMethod || 'PDFJS', ocrApplied: Boolean(input.ocrApplied),
    extractionWarnings: input.extractionWarnings || [], createdAt: nowIso()
  };
}

function base(prefix, input) {
  required(input.contractCaseId, 'contractCaseId');
  const now = nowIso();
  return { id: input.id || newId(prefix), contractCaseId: input.contractCaseId, createdAt: now, updatedAt: now };
}

export const createClause = input => ({
  ...base('clause', input), documentId: required(input.documentId, 'documentId'),
  number: input.number || null, title: input.title || '', rawHeading: input.rawHeading || '',
  text: input.text || '', startPage: Number(input.startPage || 1), endPage: Number(input.endPage || input.startPage || 1),
  category: input.category || 'OTRA', confidence: Number(input.confidence || 0),
  classificationMethod: input.classificationMethod || 'RULE', matchedRules: input.matchedRules || [],
  userCorrected: Boolean(input.userCorrected)
});

export const createObligation = input => ({
  ...base('obl', input), documentId: required(input.documentId, 'documentId'), clauseId: input.clauseId || null,
  party: input.party || Party.UNDETERMINED, category: input.category || 'OTHER', text: required(input.text, 'text'),
  sourcePage: Number(input.sourcePage || 1), evidenceStatus: input.evidenceStatus || EvidenceStatus.SIN_EVIDENCIA,
  parserMethod: input.parserMethod || 'RULE', confidence: Number(input.confidence || 0), userCorrected: Boolean(input.userCorrected)
});

export const createFact = input => ({
  ...base('fact', input), type: required(input.type, 'type'), value: input.value ?? null,
  normalizedValue: input.normalizedValue ?? null, unit: input.unit || null,
  sourceDocumentId: required(input.sourceDocumentId, 'sourceDocumentId'), sourceClauseId: input.sourceClauseId || null,
  sourcePage: Number(input.sourcePage || 1), sourceSnippet: input.sourceSnippet || '',
  extractionMethod: input.extractionMethod || 'RULE', matchedRule: input.matchedRule || null,
  confidence: Number(input.confidence || 0), userCorrected: Boolean(input.userCorrected)
});

export const createEvidenceLink = input => ({
  ...base('evidence', input), obligationId: input.obligationId || null, factId: input.factId || null,
  sourceDocumentId: input.sourceDocumentId || null, sourcePage: input.sourcePage || null,
  evidenceDocumentId: required(input.evidenceDocumentId, 'evidenceDocumentId'),
  evidencePage: Number(required(input.evidencePage, 'evidencePage')), snippet: required(input.snippet, 'snippet'),
  score: Number(input.score || 0), matchedTerms: input.matchedTerms || [], linkMethod: input.linkMethod || 'BM25',
  reviewStatus: input.reviewStatus || 'PROPOSED', reviewedAt: null
});

export const createAlert = input => ({
  ...base('alert', input), ruleId: required(input.ruleId, 'ruleId'), type: required(input.type, 'type'),
  severity: input.severity || 'INFO', message: required(input.message, 'message'),
  entityType: input.entityType || null, entityId: input.entityId || null, basis: input.basis || [],
  status: input.status || 'OPEN', reviewedAt: null
});

export const createFinding = input => ({
  ...base('finding', input), title: required(input.title, 'title'), description: input.description || '',
  criteria: input.criteria || '', condition: input.condition || '', cause: input.cause || '',
  effect: input.effect || '', scope: input.scope || '', linkedFactIds: input.linkedFactIds || [],
  linkedEvidenceIds: input.linkedEvidenceIds || [], linkedAlertIds: input.linkedAlertIds || [],
  status: input.status || 'DRAFT', createdBy: input.createdBy || ''
});
