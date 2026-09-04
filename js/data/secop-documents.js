import { DocumentOrigin } from '../core/catalogs.js';
import { escapeLiteral } from './soql.js';
import { SOCRATA } from './config.js';
import { socrataGet } from './secop-api.js';

export async function loadExpedientDocuments(contract, { signal } = {}) {
  const ids = [contract.id_contrato, contract.referencia_del_contrato, contract.proceso_de_compra].filter(Boolean);
  const collected = [];
  for (const { id, label } of SOCRATA.datasets.documents) {
    for (const key of ids) {
      const where = `n_mero_de_contrato='${escapeLiteral(key)}' OR proceso='${escapeLiteral(key)}'`;
      const rows = await socrataGet(id, { '$where': where, '$limit': 500 }, { signal });
      rows.forEach(row => collected.push({ ...row, __sourceLabel: label, __datasetId: id }));
    }
  }
  return dedupe(collected).map(normalizeSecopDocument);
}

function dedupe(rows) {
  const seen = new Set();
  return rows.filter(row => {
    const key = row.id_documento || row.url_descarga_documento?.url || `${row.nombre_archivo}|${row.__datasetId}`;
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  });
}

function normalizeSecopDocument(row) {
  return {
    origin: DocumentOrigin.SECOP,
    externalId: row.id_documento || null,
    name: row.nombre_archivo || 'Documento sin nombre',
    description: row.descripci_n || '',
    source: row.__sourceLabel || 'SECOP',
    sourceUrl: row.url_descarga_documento?.url || '',
    uploadedAt: row.fecha_carga || null,
    secopMetadata: { datasetId: row.__datasetId }
  };
}
