  function applyPanelLayout(){
    if(!frame)return;
    const {w,h,x,y}=hostViewport();
    const compact=w<=900||h<620;
    const width=Math.floor(Math.min(w*(compact ? .96 : .94),Math.max(1,w-12),1100));
    const height=Math.floor(Math.min(h*(compact ? .94 : .92),Math.max(1,h-16),900));
    const radius=compact?16:20;
    frame.style.cssText=`position:fixed!important;left:${x+w/2}px!important;top:${y+h/2}px!important;right:auto!important;bottom:auto!important;width:${Math.max(1,width)}px!important;height:${Math.max(1,height)}px!important;transform:translate(-50%,-50%)!important;margin:0!important;box-sizing:border-box!important;border:2px solid #b7986f!important;border-radius:${radius}px!important;outline:1px solid #382a38!important;outline-offset:0!important;z-index:2147483002!important;background:#f7eee2!important;box-shadow:0 0 0 4px #3325354d,0 18px 58px #24192584!important;display:block!important;overflow:hidden!important;`;
    placeCloseButton();
  }
