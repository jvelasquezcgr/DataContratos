// js/core/format.js - Formateo adicional
export function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined) return '';
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value, locale = 'es-CO') {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat(locale).format(value);
}

export function formatStatus(status) {
  const statusMap = {
    active: 'Activo',
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };
  return statusMap[status] || status;
}
