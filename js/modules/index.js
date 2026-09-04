// Punto unico donde se registran todos los modulos disponibles.
// Agregar un modulo nuevo = importarlo aqui y registrarlo. Nada mas.
import { registerModule } from '../router.js';
import { el, clear } from '../core/dom.js';
import { mountEntities } from './entities.js';

function placeholder(id, label, icon) {
  return registerModule({
    id, label, icon,
    mount(container) {
      clear(container).append(el('section', { class: 'card' }, [
        el('div', { class: 'card__head' }, [el('h2', { class: 'card__title' }, label)]),
        el('p', { class: 'state-msg state-msg--info' }, 'Este modulo se migrara en una fase posterior del plan.')
      ]));
    }
  });
}

export function registerAllModules() {
  registerModule({ id: 'entities', label: 'Buscador de entidades', icon: '\ud83c\udfe2', mount: mountEntities });
  placeholder('profile', 'Perfil contractual', '\ud83d\udcca');
  placeholder('top', 'Ranking de contratos', '\u2b50');
  placeholder('object', 'Busqueda por objeto', '\ud83d\uddc2\ufe0f');
  placeholder('supplier', 'Busqueda de proveedores', '\ud83e\uddd1\u200d\ud83d\udcbc');
  placeholder('sample', 'Muestra de auditoria', '\ud83c\udfaf');
}
