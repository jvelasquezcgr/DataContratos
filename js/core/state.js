export class AppState{
  #state; #listeners=new Set();
  constructor(initial={}){
    this.#state={selectedEntity:null,currentContractCaseId:null,currentModule:'entities',sample:[],lastResults:[],...initial};
  }
  get snapshot(){return structuredClone(this.#state);}
  get(key){return this.#state[key];}
  set(patch,reason='state:update'){
    this.#state={...this.#state,...patch};
    const snap=this.snapshot;
    for(const l of this.#listeners) l(snap,reason);
    return snap;
  }
  subscribe(l){this.#listeners.add(l);return()=>this.#listeners.delete(l);}
}
export const appState=new AppState();
