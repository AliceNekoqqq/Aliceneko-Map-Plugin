import { presentationView, portraitPlacement } from './scene-presentation-core.mjs';
(() => {
  'use strict';
  const $ = id => document.getElementById(id), root = $('shrine-game');
  if (!root || window.MikagePresentation) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let bridge = null, state = null, scope = '', disposed = false;
  let region = '', location = '', imageKey = '', transition = null, transitionTimer = 0;
  let portraitFrame = null;
  let portraitRequested = false;
  let requestedFrame = null, failedImage = '';
  const stops = [];
  function on(el, name, fn) { el.addEventListener(name, fn); stops.push(() => el.removeEventListener(name, fn)); }
  function resize() { bridge?.resize?.(Math.ceil(root.getBoundingClientRect().height) + 2); }
  function clearTransition() { clearTimeout(transitionTimer); transitionTimer = 0; transition?.cancel(); transition = null; $('vn-transition').hidden = true; }
  function switchView(showPortrait, available, message = '', retry = false) {
    const show = !!showPortrait && !!available;
    const focus = document.activeElement;
    const restoreFocus = (!show && $('scene-return-controls').contains(focus)) || (!available && focus === $('scene-portrait-view')) || (!retry && focus === $('scene-portrait-retry'));
    $('scene').hidden = show;
    $('portrait-view').hidden = !show;
    $('scene-portrait').hidden = !show;
    $('scene-return-controls').hidden = !show;
    $('scene-walk-hint').hidden = show || !state || presentationView(state).region === 'R01';
    $('scene-walk-view').setAttribute('aria-pressed', String(!show));
    $('scene-portrait-view').setAttribute('aria-pressed', String(show));
    $('scene-portrait-view').disabled = !available;
    $('scene-portrait-view').title = message;
    $('scene-view-status').textContent = message;
    $('scene-view-notice').hidden = !message;
    $('scene-portrait-retry').hidden = !retry;
    const next = show ? 'portrait' : 'walk', changed = root.dataset.sceneView !== next;
    root.dataset.sceneView = next;
    if (changed) root.dispatchEvent(new Event('mikage:scene-view'));
    if (restoreFocus) $(show ? 'scene-portrait-view' : 'scene-walk-view').focus({preventScroll:true});
  }
  function reset() {
    state = null; region = ''; location = ''; imageKey = ''; portraitFrame = null; portraitRequested = false; requestedFrame = null; failedImage = ''; clearTransition();
    switchView(false, false);
    $('scene-portrait').hidden = true; $('scene-portrait').dataset.loaded = 'false'; $('scene-portrait-image').removeAttribute('src');
    $('portrait-view').setAttribute('aria-busy','false');
    $('vn-task-text').textContent = '记录待就绪';
  }
  function placePortrait(){
    const holder=$('scene-portrait');if(holder.hidden||!portraitFrame)return;
    const box=holder.getBoundingClientRect(),p=portraitPlacement(portraitFrame,box.width,box.height,SCENE_PORTRAIT_FRAMING.target);
    if(!p)return;
    const img=$('scene-portrait-image');
    for(const key of ['width','left','top'])img.style[key]=p[key]+'px';
  }
  function connect(next) {
    if (disposed) return;
    const key = [next?.chatEpoch, next?.messageId, next?.swipeId].join(':');
    if (bridge !== next || key !== scope) { reset(); bridge = next; scope = key; }
  }
  function portrait(view) {
    const holder = $('scene-portrait'), img = $('scene-portrait-image');
    if (!view.portrait) { portraitRequested = false; switchView(false, false, state?.进度 ? '巴卫目前不在此处' : '本楼记录尚未就绪'); return; }
    let api; try { api = window.MikageCharacterArt || window.parent.MikageCharacterArt; } catch {}
    if (!api?.portrait) { switchView(false, false, '立绘资源尚未就绪'); return; }
    const outfit=Object.prototype.hasOwnProperty.call(SCENE_PORTRAIT_FRAMING.outfits,view.outfit)?view.outfit:'usual';
    let url;
    try { url = api.portrait('tomoe', outfit); } catch { switchView(false,false,'立绘资源暂不可用');return; }
    // URLs are supplied by the existing pinned asset catalog, never message text.
    if (typeof url !== 'string' || !url.startsWith('https://')) { switchView(false,false,'立绘资源暂不可用');return; }
    portraitFrame=SCENE_PORTRAIT_FRAMING.outfits[outfit];holder.dataset.outfit=outfit;
    $('portrait-outfit-name').textContent = portraitFrame.name;
    const failed = failedImage === url;
    switchView(portraitRequested, true, failed ? '立绘加载失败，可重试加载' : '', failed);
    if (!portraitRequested) return;
    placePortrait();
    if (imageKey !== url) { imageKey = url; requestedFrame = portraitFrame; holder.dataset.loaded = 'false'; $('portrait-view').setAttribute('aria-busy','true'); img.src = url; }
  }
  function travel(view) {
    if (!view.region || !view.location) return;
    if (region && (region !== view.region || location !== view.location) && !document.hidden && !reduced.matches) {
      clearTransition(); const el = $('vn-transition'); el.hidden = false;
      $('vn-location').textContent = view.location;
      $('vn-location-meta').textContent = [view.period, view.weather].filter(Boolean).join(' · ');
      if (el.animate) transition = el.animate([{opacity:0},{opacity:1,offset:.22},{opacity:1,offset:.65},{opacity:0}],{duration:1400,easing:'ease-in-out'});
      transitionTimer = setTimeout(clearTransition, 1400);
    }
    region = view.region;
    location = view.location;
  }
  function render(value) {
    if (disposed) return;
    state = value;
    const view = presentationView(state); travel(view);
    $('vn-task-text').textContent = state?.进度 ? view.taskText : '记录待就绪';
    portrait(view); resize();
  }
  function showWalkView() {
    portraitRequested = false;
    if (state) portrait(presentationView(state));
    resize();
  }
  on($('scene-walk-view'), 'click', showWalkView);
  on($('scene-return'), 'click', showWalkView);
  function showPortraitView() {
    failedImage = '';
    portraitRequested = true;
    if (state) portrait(presentationView(state));
    resize();
  }
  on($('scene-portrait-view'), 'click', showPortraitView);
  on($('scene-portrait-retry'), 'click', showPortraitView);
  function imageFailed() {
    if (!requestedFrame || !imageKey) return;
    failedImage = imageKey; imageKey = ''; requestedFrame = null; portraitRequested = false;
    $('scene-portrait').dataset.loaded = 'false';$('portrait-view').setAttribute('aria-busy','false');
    if (state) portrait(presentationView(state));
    resize();
  }
  on($('scene-portrait-image'), 'load', () => {
    const img=$('scene-portrait-image');
    if(!requestedFrame || img.src !== imageKey) return;
    if(img.naturalWidth!==requestedFrame.width||img.naturalHeight!==requestedFrame.height){imageFailed();return;}
    if (failedImage === imageKey) failedImage = '';
    placePortrait();$('scene-portrait').dataset.loaded='true';$('portrait-view').setAttribute('aria-busy','false');resize();
  });
  on($('scene-portrait-image'), 'error', imageFailed);
  on(document, 'visibilitychange', () => { if (document.hidden) clearTransition(); });
  on(reduced, 'change', clearTransition);
  on(window, 'mikage:art-ready', () => { if (bridge) render(state); });
  on($('vn-records'), 'toggle', resize);
  const portraitObserver=typeof ResizeObserver==='function'?new ResizeObserver(placePortrait):null;
  portraitObserver?.observe($('scene-portrait'));on(window,'resize',placePortrait);
  function dispose() { if(disposed)return;disposed=true;clearTransition();portraitObserver?.disconnect();stops.forEach(fn=>fn());bridge=null;state=null;portraitFrame=null; }
  on(window, 'pagehide', dispose);
  window.MikagePresentation = {connect,render,dispose,inspect:()=>({scope,region,disposed,transition:!!transitionTimer})};
  reset();
})();
