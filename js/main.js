// ENTRADA UNICA de la aplicacion. index.html carga solo este archivo.
// Responsabilidad: inicializar almacenamiento, registrar modulos y arrancar el router.
import { openDatabase } from './storage/db.js';
import { toast } from './core/toast.js';
import { appState } from './core/state.js';
import { registerAllModules } from './modules/index.js';
import { navigate, renderMenu } from './router.js';

async function boot() {
  try {
    await openDatabase();
  } catch (error) {
    console.error(error);
    toast('No se pudo abrir el almacenamiento local.', 'error');
  }

  registerAllModules();
  renderMenu(id => navigate(id));
  navigate(appState.get('currentModule'));
}

document.addEventListener('DOMContentLoaded', boot);
