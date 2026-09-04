// js/core/catalogs.js - Catálogos estáticos
export const ENTITY_TYPES = [
  { value: 'public', label: 'Entidad Pública' },
  { value: 'private', label: 'Entidad Privada' },
  { value: 'mixed', label: 'Entidad Mixta' },
];

export const CONTRACT_TYPES = [
  { value: 'obra', label: 'Obra Pública' },
  { value: 'servicio', label: 'Prestación de Servicios' },
  { value: 'suministro', label: 'Suministro' },
  { value: 'interventoria', label: 'Interventoría' },
  { value: 'consultoria', label: 'Consultoría' },
];

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

export function getCatalogLabel(catalog, value) {
  const item = catalog.find(c => c.value === value);
  return item ? item.label : value;
}
