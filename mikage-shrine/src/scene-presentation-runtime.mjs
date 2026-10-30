import { presentationView } from './scene-presentation-core.mjs';
(() => {
  'use strict';
  const $ = id => document.getElementById(id), root = $('shrine-game');
  if (!root || window.MikagePresentation) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let bridge = null, state = null, scope = '', serial = 0, disposed = false;
  let region = '', location = '', imageKey = '', transition = null, transitionTimer = 0;
  const stops = [];
  function on(el, name, fn) { el.addEventListener(name, fn); stops.push(() => el.removeEventListener(name, fn)); }
  function resize() { bridge?.resize?.(Math.ceil(root.getBoundingClientRect().height) + 2); }
  function clearTransition() { clearTimeout(transitionTimer); transitionTimer = 0; transition?.cancel(); transition = null; $('vn-transition').hidden = true; }
  function reset() {
    serial++; state = null; region = ''; location = ''; imageKey = ''; clearTransition();
    $('vn-full').hidden = true; $('vn-full').textContent = ''; $('vn-full').scrollTop = 0;
    $('vn-toggle').setAttribute('aria-expanded', 'false'); $('vn-toggle').textContent = '展开正文';
    $('vn-portrait').hidden = true; $('vn-portrait').dataset.loaded = 'false'; $('vn-portrait-image').removeAttribute('src');
    $('vn-dialogue').dataset.portrait = 'false'; $('vn-preview').textContent = '正在读取本楼正文…';
    $('vn-speaker').textContent = '本轮正文'; $('vn-toggle').disabled = true;
    $('vn-context').textContent = ''; $('vn-task-text').textContent = '记录待就绪';
  }
  function connect(next) {
    if (disposed) return;
    const key = [next?.chatEpoch, next?.messageId, next?.swipeId].join(':');
    if (bridge !== next || key !== scope) { reset(); bridge = next; scope = key; }
  }
  function portrait(view) {
    const holder = $('vn-portrait'), img = $('vn-portrait-image');
    if (!view.portrait) { holder.hidden = true; root.querySelector('.vn-dialogue').dataset.portrait = 'false'; return; }
    let api; try { api = window.MikageCharacterArt || window.parent.MikageCharacterArt; } catch {}
    if (!api?.portrait) { holder.hidden = true; $('vn-dialogue').dataset.portrait = 'false'; return; }
    let url;
    try { url = api.portrait('tomoe', view.outfit); } catch { try { url = api.portrait('tomoe', 'usual'); } catch { return; } }
    // URLs are supplied by the existing pinned asset catalog, never message text.
    if (typeof url !== 'string' || !url.startsWith('https://')) return;
    holder.hidden = false; $('vn-dialogue').dataset.portrait = 'true';
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
  async function render(value) {
    if (disposed) return;
    state = value;
    const own = ++serial, current = bridge;
    const blank = presentationView(state, ''); travel(blank);
    $('vn-task-text').textContent = state?.进度 ? blank.taskText : '记录待就绪';
    try {
      const result = await current?.getNarrative?.();
      if (disposed || own !== serial || current !== bridge) return;
      const view = presentationView(state, result?.status === 'ready' ? result.text : '');
      $('vn-preview').textContent = view.preview || (result?.status === 'stale' ? '本页已过期，请查看当前消息页。' : '本楼暂无可展示的正文。');
      $('vn-speaker').textContent = view.speaker;
      $('vn-context').textContent = [view.period, view.weather].filter(Boolean).join(' · ');
      if ($('vn-full').textContent !== view.text) $('vn-full').textContent = view.text;
      $('vn-toggle').disabled = !view.text;
      if (!view.text) { $('vn-full').hidden = true; $('vn-toggle').setAttribute('aria-expanded','false'); $('vn-toggle').textContent = '展开正文'; }
      portrait(view); resize();
    } catch {
      if (!disposed && own === serial) { $('vn-preview').textContent = '正文暂时无法读取，可查看聊天原文。'; $('vn-full').textContent=''; $('vn-full').hidden=true; $('vn-toggle').disabled=true; $('vn-toggle').setAttribute('aria-expanded','false'); $('vn-toggle').textContent='展开正文'; $('vn-portrait').hidden=true; $('vn-dialogue').dataset.portrait='false'; resize(); }
    }
  }
  on($('vn-toggle'), 'click', () => {
    const open = $('vn-full').hidden; $('vn-full').hidden = !open;
    $('vn-toggle').setAttribute('aria-expanded', String(open)); $('vn-toggle').textContent = open ? '收起正文' : '展开正文'; resize();
  });
  on($('vn-portrait-image'), 'load', () => { $('vn-portrait').dataset.loaded='true'; resize(); });
  on($('vn-portrait-image'), 'error', () => { $('vn-portrait').hidden=true; $('vn-dialogue').dataset.portrait='false'; resize(); });
  on(document, 'visibilitychange', () => { if (document.hidden) clearTransition(); });
  on(reduced, 'change', clearTransition);
  on(window, 'mikage:art-ready', () => { if (bridge) render(state); });
  on($('vn-records'), 'toggle', resize);
  function dispose() { if(disposed)return;disposed=true;serial++;clearTransition();stops.forEach(fn=>fn());bridge=null;state=null; }
  on(window, 'pagehide', dispose);
  window.MikagePresentation = {connect,render,dispose,inspect:()=>({scope,region,disposed,transition:!!transitionTimer})};
  reset();
})();
