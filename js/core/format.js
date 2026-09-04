const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const INT = new Intl.NumberFormat('es-CO');

export const money = value => COP.format(Number(value) || 0);
export const integer = value => INT.format(Number(value) || 0);

export function fileSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(2)} MB`;
}

export function isoDate(value) {
  return String(value ?? '').slice(0, 10);
}
