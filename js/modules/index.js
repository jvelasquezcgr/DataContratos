// js/modules/index.js - Aquí se registran TODOS los módulos
import { registerRoute } from '../router.js';
import entitiesModule from './entities.js';

export function registerModules() {
  console.log('[modules] Registrando módulos...');
  
  // Registrar cada módulo en el router
  registerRoute('/entities', entitiesModule);
  
  console.log('[modules] Módulos registrados:', ['/entities']);
}
