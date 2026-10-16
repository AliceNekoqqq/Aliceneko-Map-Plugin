/* Time-of-day images keep the original artwork when a variant is unavailable. */
(function (host) {
  'use strict';
  function resolve(value) {
    const name = String(value ?? '').trim().toLowerCase();
    if (['凌晨', '夜晚', 'night'].includes(name)) return 'night';
    if (['傍晚', '黄昏', 'dusk'].includes(name)) return 'dusk';
    return 'day';
  }
  function url(region, period) {
    const value = host.MikageTimeSceneCatalog?.[region]?.[resolve(period)];
    return typeof value === 'string' && value.trim() ? value : null;
  }
  function apply(root, period) {
    if (!root?.querySelectorAll) return false;
    const name = resolve(period);
    let applied = false;
    for (const element of root.querySelectorAll('.life-region-art[data-region]')) {
      const value = url(element.dataset.region, name);
      if (!value) continue;
      element.style.backgroundImage = 'url(' + JSON.stringify(value) + ')';
      element.style.backgroundSize = '100% 100%';
      element.style.backgroundPosition = 'center';
      element.dataset.period = name;
      applied = true;
    }
    return applied;
  }
  host.MikageDaylight = Object.freeze({ resolve, url, apply });
})(typeof window === 'undefined' ? globalThis : window);
