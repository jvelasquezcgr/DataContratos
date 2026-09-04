export function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function el(tag,props={},children=[]){
  const node=document.createElement(tag);
  for(const [key,value] of Object.entries(props)){
    if(key==='class') node.className=value;
    else if(key==='dataset') Object.assign(node.dataset,value);
    else if(key.startsWith('on')&&typeof value==='function') node.addEventListener(key.slice(2).toLowerCase(),value);
    else if(value!==null&&value!==undefined&&value!==false) node.setAttribute(key,value===true?'':value);
  }
  for(const child of [].concat(children)){
    if(child==null) continue;
    node.append(child.nodeType?child:document.createTextNode(String(child)));
  }
  return node;
}
export const byId=id=>document.getElementById(id);
export function clear(node){while(node.firstChild)node.removeChild(node.firstChild);return node;}
