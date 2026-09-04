import {mountEntities} from './entities.js';
import {mountContracts} from './contracts.js';
import {mountWorkspace} from '../workspace/workspace.js';

export function registerAppModules(registerModule){
  registerModule({id:'entities',label:'Buscador de entidades',icon:'\ud83c\udfe2',mount:mountEntities});
  registerModule({id:'contracts',label:'Contratos de la entidad',icon:'\ud83d\udcc4',mount:mountContracts});
  registerModule({id:'workspace',label:'Expediente',icon:'\ud83d\udcc1',mount:mountWorkspace,hidden:true});
}