var dotColors={food:'#5c7cfa',music:'#ff2d7b',nightlife:'#7c4dff',culture:'#42a5f5',shop:'#26c6da',hotel:'#ffb347',community:'#66bb6a'};

function setStatusDisabled(disabled){
  var sel=document.getElementById('statusSelect');
  if(!sel)return;
  sel.disabled=disabled;
  sel.style.opacity=disabled?'0.4':'';
  sel.style.pointerEvents=disabled?'none':'';
  if(disabled)sel.value='all';
}
