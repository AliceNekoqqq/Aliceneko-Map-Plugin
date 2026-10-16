(function () {
  'use strict';
  const paths = {
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/>',
    ema: '<path d="m4 9 8-6 8 6v11H4Z"/><path d="M12 3V1M8 12h8M8 16h5"/>',
    wardrobe: '<path d="M10 6a2 2 0 1 1 3 1.7L12 9v2L3 17v2h18v-2l-9-6"/>',
    life: '<path d="m3 11 9-8 9 8M5 9v12h14V9M10 21v-7h4v7"/>',
    journal: '<path d="M5 3h15v18H5a2 2 0 0 1 0-4h15M5 3a2 2 0 0 0-2 2v14M8 7h8M8 11h6"/>',
    route: '<path d="M6 4c-5 1-2 7 0 8 4-1 3-6 0-8ZM17 12c-5 1-2 7 0 8 4-1 3-6 0-8Z"/><path d="m7 16 2 1M14 7l2 1"/>',
    sweep: '<path d="m18 3-6 10M9 11l6 4-5 6-7-5Z"/><path d="m5 17 6-4m-3 6 5-5"/>',
    cat: '<path d="m5 10-1-7 6 4h4l6-4-1 7c5 13-19 13-14 0Z"/><path d="M8 12h.1M16 12h.1M10 15l2 1 2-1M2 15h4M18 15h4"/>',
    dango: '<path d="m5 21 3-5"/><circle cx="9" cy="15" r="3"/><circle cx="12" cy="10" r="3"/><circle cx="15" cy="5" r="3"/>',
    boat: '<path d="m2 15 20-5-6 11-8-1Z"/><path d="m2 15 10 1 10-6M12 16l4 5M9 12l3-9 4 8"/>',
    ticket: '<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4Z"/><path d="M15 6v2m0 3v2m0 3v2M7 9h4M7 13h3"/>',
    postcard: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M14 6v12M4 16l4-6 4 6M16 14h4M16 17h3"/><rect x="16" y="7" width="4" height="4"/>',
    leaves: '<path d="M5 19C0 8 9 3 20 3c0 10-5 17-15 16Zm0 0L16 7M8 14h6M12 10V7"/>',
    firefly: '<ellipse cx="12" cy="15" rx="3" ry="5"/><path d="M9 13C-3 2 8 2 12 11c4-9 15-9 3 2M10 9 8 6m6 3 2-3M12 11v9"/>',
    drum: '<ellipse cx="12" cy="8" rx="8" ry="4"/><path d="M4 8v9c0 5 16 5 16 0V8M7 12v6m10-6v6M3 2l6 5m12-5-6 5"/>',
    lantern: '<path d="M8 3h8M12 1v2M8 21h8M12 21v2"/><rect x="5" y="4" width="14" height="16" rx="5"/><path d="M9 5v14m6-14v14M5 9h14M5 15h14"/>',
    bell: '<path d="M5 13c0-12 14-12 14 0ZM12 13v8l3-2M9 15h6"/>',
    wind: '<path d="M2 9h13c8 0 3-10-1-5M2 13h17c6 0 3 8-1 5M2 17h7c5 0 3 7-1 4"/>',
    moon: '<path d="M19 16A9 9 0 0 1 8 4 9 9 0 1 0 19 16Z"/>',
    wander: '<path d="M12 8v6l-4 7M12 14l5 7M12 10l5 3 3-3M12 10l-5 3-3-2"/><circle cx="12" cy="4" r="2"/>',
    retry: '<path d="M20 8A9 9 0 1 0 21 15M20 3v6h-6"/>',
    repair: '<path d="m4 20 8-8M14 3l-2 5 4 4 5-2a6 6 0 0 1-8 6l-6 6-4-4 6-6a6 6 0 0 1 5-9Z"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    flower: '<path d="M12 8c-6-10-12 0-4 4-10 6 0 12 4 4 6 10 12 0 4-4 10-6 0-12-4-4Z"/><circle cx="12" cy="12" r="1"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    sea: '<path d="M2 14c4-8 7 8 11 0s7 5 9 0M2 20c4-8 7 8 11 0s7 5 9 0"/><circle cx="17" cy="6" r="3"/>',
  };
  window.MikageIcon = name => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.flower) + '</svg>';
})();
