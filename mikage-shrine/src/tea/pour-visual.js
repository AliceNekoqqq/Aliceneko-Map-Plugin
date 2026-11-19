function createTeaPourVisual(host, stage, pot, potImage, cups, stream, ribbon, glint) {
  // These points are measured on the transparent kettle and cup artwork.
  const spout = { x: .906, y: .56 };
  const opening = { x: .50, y: .29 };
  let target = -1;

  function layout() {
    const cup = cups[target];
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const ready = cup?.image.naturalWidth && potImage.naturalWidth && width && height;
    stage.toggleAttribute('data-tea-flow', Boolean(ready));
    if (!ready) return;

    const endX = cup.button.offsetLeft + cup.image.offsetLeft + cup.image.offsetWidth * opening.x;
    const endY = cup.button.offsetTop + cup.image.offsetTop + cup.image.offsetHeight * opening.y;
    const arc = Math.max(7, cup.image.offsetWidth * .15);
    const drop = Math.max(16, potImage.offsetHeight * .21);
    const startX = endX - arc;
    const startY = endY - drop;
    const potX = potImage.offsetLeft + potImage.offsetWidth * spout.x;
    const potY = potImage.offsetTop + potImage.offsetHeight * spout.y;

    pot.style.transformOrigin = potX + 'px ' + potY + 'px';
    pot.style.setProperty('--tea-pour-x', startX - pot.offsetLeft - potX + 'px');
    pot.style.setProperty('--tea-pour-y', startY - pot.offsetTop - potY + 'px');
    stream.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const path = `M ${startX} ${startY} Q ${endX} ${startY + drop * .28} ${endX} ${endY}`;
    ribbon.setAttribute('d', path);
    glint.setAttribute('d', path);
  }

  function show(cup) {
    if (target === cup) return;
    target = cup;
    layout();
  }

  const images = [potImage, ...cups.map(cup => cup.image)];
  for (const image of images) image.addEventListener('load', layout);
  host.addEventListener('resize', layout);
  const observer = host.ResizeObserver ? new host.ResizeObserver(layout) : null;
  observer?.observe(stage);

  function dispose() {
    show(-1);
    observer?.disconnect();
    host.removeEventListener('resize', layout);
    for (const image of images) image.removeEventListener('load', layout);
  }

  return { show, dispose };
}
