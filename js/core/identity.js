// js/core/identity.js - Validaciones y utilidades de identidad
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidNIT(nit) {
  // Validación básica de NIT colombiano
  if (!nit || typeof nit !== 'string') return false;
  const cleanNit = nit.replace(/[-.]/g, '');
  return /^\d{8,10}$/.test(cleanNit);
}

export function generateId(prefix = '') {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '')
    .trim();
}
