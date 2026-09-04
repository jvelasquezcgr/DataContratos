import {openDatabase} from './storage/db.js';
import {toast} from './core/toast.js';
import {appState} from './core/state.js';
import {registerModule,navigate,renderMenu} from './router.js';
import {mountEntities} from './modules/entities.js';
import {mountContracts} from './modules/contracts.js';
import {mountWorkspace} from './workspace/workspace.js';

async function boot(){
  try{ await openDatabase(); }
  catch(e){ console.error(e); toast('No se pudo abrir el almacenamiento local.','error'); }

  registerModule({id:'entities',label:'Buscador de entidades',icon:'\ud83c\udfe2',mount:mountEntities});
  registerModule({id:'contracts',label:'Contratos de la entidad',icon:'\ud83d\udcc4',mount:mountContracts});
  // El workspace no aparece en el menu: se abre al seleccionar un contrato.
  registerModule({id:'workspace',label:'Expediente',icon:'\ud83d\udcc1',mount:mountWorkspace,hidden:true});

  renderMenu(id=>navigate(id));
  navigate(appState.get('currentModule'));
}
document.addEventListener('DOMContentLoaded',boot);
