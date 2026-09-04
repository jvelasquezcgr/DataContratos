import {el,byId,clear} from './core/dom.js';
import {appState} from './core/state.js';
const registry=new Map();
export function registerModule(def){
  if(!def?.id||typeof def.mount!=='function')throw new Error('Modulo invalido');
  registry.set(def.id,def); return def;
}
export function renderMenu(onNavigate){
  const menu=clear(byId('app-menu'));
  const current=appState.get('currentModule');
  for(const m of registry.values()){
    if(m.hidden)continue;
    menu.append(el('button',{class:m.id===current?'is-active':'',dataset:{module:m.id},onClick:()=>onNavigate(m.id)},
      [el('span',{},m.icon||''),el('span',{},m.label)]));
  }
}
export function navigate(moduleId,ctx={}){
  const m=registry.get(moduleId)||registry.values().next().value;
  if(!m)return;
  appState.set({currentModule:m.id},'router:navigate');
  renderMenu(id=>navigate(id,ctx));
  m.mount(byId('app-main'),{navigate,...ctx});
}
