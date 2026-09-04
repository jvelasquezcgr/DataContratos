import {HTTP,SOCRATA} from './config.js';
export class OperationRun{
  constructor(){this.controller=new AbortController();}
  get signal(){return this.controller.signal;}
  abort(){this.controller.abort();}
}
const delay=(ms,signal)=>new Promise((resolve,reject)=>{
  if(signal?.aborted)return reject(new DOMException('Cancelado','AbortError'));
  const t=setTimeout(resolve,ms);
  signal?.addEventListener('abort',()=>{clearTimeout(t);reject(new DOMException('Cancelado','AbortError'));},{once:true});
});
function mergeSignals(a,b){
  if(!a)return b; if(!b)return a;
  const c=new AbortController(); const f=()=>c.abort();
  a.addEventListener('abort',f,{once:true}); b.addEventListener('abort',f,{once:true});
  if(a.aborted||b.aborted)c.abort(); return c.signal;
}
export async function socrataGet(datasetId,params={},{signal,timeoutMs=20000}={}){
  const url=new URL(SOCRATA.base+datasetId+'.json');
  for(const [k,v] of Object.entries(params)) if(v!==''&&v!=null) url.searchParams.set(k,v);
  if(SOCRATA.appToken) url.searchParams.set('$$app_token',SOCRATA.appToken);
  let lastError;
  for(let attempt=0;attempt<HTTP.maxRetries;attempt++){
    const tc=new AbortController(); const timeout=setTimeout(()=>tc.abort(),timeoutMs);
    const merged=mergeSignals(signal,tc.signal);
    try{
      const r=await fetch(url,{signal:merged});
      if(!r.ok)throw new Error('HTTP '+r.status+' en '+datasetId);
      return await r.json();
    }catch(e){
      if(signal?.aborted)throw new DOMException('Cancelado','AbortError');
      lastError=e;
      if(attempt<HTTP.maxRetries-1) await delay(HTTP.baseDelayMs*(attempt+1)+Math.random()*250,signal);
    }finally{clearTimeout(timeout);}
  }
  throw lastError;
}
export async function socrataGetAll(datasetId,params={},{signal}={}){
  const rows=[];
  for(let page=0;page<HTTP.maxPages;page++){
    const block=await socrataGet(datasetId,{...params,'$limit':HTTP.pageSize,'$offset':page*HTTP.pageSize},{signal});
    rows.push(...block);
    if(block.length<HTTP.pageSize)break;
  }
  return rows;
}
