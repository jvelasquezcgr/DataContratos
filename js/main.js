// js/main.js - ENTRADA UNICA
import { initDB } from './storage/db.js';
import { registerModules } from './modules/index.js';
import { initRouter, navigate } from './router.js';

async function main() {
  console.log('[main] Iniciando aplicación...');
  
  // 1. Abrir IndexedDB
  await initDB();
  console.log('[main] IndexedDB listo');
  
  // 2. Registrar módulos en el router
  registerModules();
  console.log('[main] Módulos registrados');
  
  // 3. Arrancar router (menu lateral + navegación)
  initRouter();
  console.log('[main] Router iniciado');
  
  // 4. Navegar a la ruta por defecto
  navigate('/entities');
}

main().catch(err => {
  console.error('[main] Error fatal:', err);
});
