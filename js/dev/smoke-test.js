import { createContractCase, createDocument, createObligation } from '../models/entities.js';
import { repositories, getDocumentsForCase } from '../storage/repositories.js';
import { fuzzyPattern, eqUpper } from '../data/soql.js';

export async function runSmokeTest() {
  const results = [];
  const contract = createContractCase({
    id_contrato: 'TEST-860-2025', referencia_del_contrato: '860-2025',
    nombre_entidad: 'ENTIDAD DE PRUEBA', proveedor_adjudicado: 'PROVEEDOR DE PRUEBA'
  });
  const document = createDocument({ contractCaseId: contract.id, name: 'contrato-prueba.pdf' });
  const obligation = createObligation({ contractCaseId: contract.id, documentId: document.id, text: 'Entregar informes.' });

  await repositories.contractCases.put(contract);
  await repositories.documents.put(document);
  await repositories.obligations.put(obligation);

  const loaded = await repositories.contractCases.get(contract.id);
  const docs = await getDocumentsForCase(contract.id);
  results.push(['expediente recuperado', loaded?.contractKey === 'TEST-860-2025']);
  results.push(['documento asociado', docs.length === 1]);
  results.push(['patron difuso', fuzzyPattern('geologico').startsWith('%')]);
  results.push(['escape SoQL', eqUpper('x', "o'brien").includes("''")]);

  await repositories.obligations.delete(obligation.id);
  await repositories.documents.delete(document.id);
  await repositories.contractCases.delete(contract.id);

  const ok = results.every(([, passed]) => passed);
  console.table(results.map(([name, passed]) => ({ prueba: name, resultado: passed ? 'OK' : 'FALLA' })));
  return { ok, results };
}

if (typeof window !== 'undefined') window.runSmokeTest = runSmokeTest;
