(() => {
  const root = document.getElementById('wardrobe-dialog');
  if (!root) return;
  window.MikageWardrobeDesk?.dispose();

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const status = root.querySelector('#robe-desk-status');
  let view, animation;
  let direction = 'front';

  function paintDirection() {
    const mini = root.querySelector('[data-art="wardrobe-mini"]');
    try {
      view?.art?.paint(mini, view.actor, view.outfit, direction);
    } catch {
      mini.style.backgroundImage = '';
      mini.classList.add('art-missing');
    }
    for (const button of root.querySelectorAll('.wardrobe-direction')) {
      button.setAttribute('aria-pressed', String(button.dataset.direction === direction));
    }
  }

  function render(next) {
    const changed = view && (view.actor !== next.actor || view.outfit !== next.outfit);
    view = next;
    paintDirection();
    if (changed && status.dataset.state !== 'pending') status.textContent = '';
    if (changed && !root.hidden && !motion.matches) {
      animation?.cancel();
      animation = root.querySelector('.wardrobe-portrait').animate(
        [{ opacity: .55 }, { opacity: 1 }], { duration: 200 }
      );
    }
  }

  function selectDirection(event) {
    const button = event.target.closest('.wardrobe-direction');
    if (!button) return;
    direction = button.dataset.direction;
    paintDirection();
  }

  function operation(state, text) {
    root.setAttribute('aria-busy', String(state === 'pending'));
    status.dataset.state = state;
    status.textContent = text;
  }

  function dispose() {
    animation?.cancel();
    root.removeEventListener('click', selectDirection);
    window.removeEventListener('pagehide', dispose);
    if (window.MikageWardrobeDesk === api) delete window.MikageWardrobeDesk;
  }

  const api = { render, operation, dispose };
  root.addEventListener('click', selectDirection);
  window.addEventListener('pagehide', dispose, { once: true });
  window.MikageWardrobeDesk = api;
})();
