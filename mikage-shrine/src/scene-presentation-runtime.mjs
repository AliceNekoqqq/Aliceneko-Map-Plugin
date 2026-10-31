import { presentationView, portraitPlacement } from './scene-presentation-core.mjs';
(() => {
  'use strict';
  const $ = id => document.getElementById(id), root = $('shrine-game');
  if (!root || window.MikagePresentation) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let bridge = null, state = null, scope = '', disposed = false;
  let region = '', location = '', imageKey = '', transition = null, transitionTimer = 0;
  let portraitFrame = null;
  const stops = [];
  function on(el, name, fn) { el.addEventListener(name, fn); stops.push(() => el.removeEventListener(name, fn)); }
  function resize() { bridge?.resize?.(Math.ceil(root.getBoundingClientRect().height) + 2); }
  function clearTransition() { clearTimeout(transitionTimer); transitionTimer = 0; transition?.cancel(); transition = null; $('vn-transition').hidden = true; }
  function reset() {
    state = null; region = ''; location = ''; imageKey = ''; portraitFrame = null; clearTransition();
    $('scene-portrait').hidden = true; $('scene-portrait').dataset.loaded = 'false'; $('scene-portrait-image').removeAttribute('src');
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
    if (!view.portrait) { holder.hidden = true; return; }
    let api; try { api = window.MikageCharacterArt || window.parent.MikageCharacterArt; } catch {}
    if (!api?.portrait) { holder.hidden = true; return; }
    const outfit=Object.prototype.hasOwnProperty.call(SCENE_PORTRAIT_FRAMING.outfits,view.outfit)?view.outfit:'usual';
    let url;
    try { url = api.portrait('tomoe', outfit); } catch { holder.hidden=true;return; }
    // URLs are supplied by the existing pinned asset catalog, never message text.
    if (typeof url !== 'string' || !url.startsWith('https://')) return;
    portraitFrame=SCENE_PORTRAIT_FRAMING.outfits[outfit];holder.dataset.outfit=outfit;holder.hidden = false;
    placePortrait();
    if (imageKey !== url) { imageKey = url; holder.dataset.loaded = 'false'; img.src = url; }
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
  on($('scene-portrait-image'), 'load', () => {
    const img=$('scene-portrait-image');
    if(!portraitFrame||img.naturalWidth!==portraitFrame.width||img.naturalHeight!==portraitFrame.height){$('scene-portrait').hidden=true;return;}
    placePortrait();$('scene-portrait').dataset.loaded='true';resize();
  });
  on($('scene-portrait-image'), 'error', () => { $('scene-portrait').hidden=true; resize(); });
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
