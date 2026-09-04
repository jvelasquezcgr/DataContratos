export const SOCRATA = Object.freeze({
  base: 'https://www.datos.gov.co/resource/',
  appToken: null,
  datasets: Object.freeze({
    entities: 'b6m4-qgqv',
    contracts: 'jbjy-vk9h',
    documents: Object.freeze([
      { id: 'nbae-kzan', label: 'Historico 2024' },
      { id: 'dmgg-8hin', label: 'Desde 2025' },
      { id: '3skv-9na7', label: 'Historico 2023' },
      { id: 'kgcd-kt7i', label: 'Historico 2022' }
    ])
  })
});

export const CONTRACT_FIELDS = [
  'nombre_entidad', 'nit_entidad', 'id_contrato', 'referencia_del_contrato', 'proceso_de_compra',
  'estado_contrato', 'fecha_de_firma', 'fecha_de_inicio_del_contrato', 'fecha_de_fin_del_contrato',
  'proveedor_adjudicado', 'documento_proveedor', 'valor_del_contrato', 'valor_facturado',
  'objeto_del_contrato', 'modalidad_de_contratacion', 'tipo_de_contrato', 'urlproceso'
];

export const HTTP = Object.freeze({ maxRetries: 3, baseDelayMs: 600, pageSize: 1000, maxPages: 30 });
