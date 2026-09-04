import {openDatabase} from './storage/db.js';
import {toast} from './core/toast.js';
import {appState} from './core/state.js';
import {registerModule,navigate,renderMenu} from './router.js';
import {registerAppModules} from './modules/index.js';

async function boot(){
  try{ await openDatabase(); }
  catch(e){ console.error(e); toast('No se pudo abrir el almacenamiento local.','error'); }

  registerAppModules(registerModule);

  renderMenu(id=>navigate(id));
  navigate(appState.get('currentModule'));
}
document.addEventListener('DOMContentLoaded',boot);
