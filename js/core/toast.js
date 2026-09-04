let hideTimer;
export function toast(message,kind='info'){
  const node=document.getElementById('toast');
  if(!node)return;
  node.textContent=message;
  node.className='toast is-visible '+(kind==='ok'?'is-ok':kind==='error'?'is-error':'');
  clearTimeout(hideTimer);
  hideTimer=setTimeout(()=>{node.className='toast';},3200);
}
