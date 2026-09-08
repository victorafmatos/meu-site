(() => {
  const track = document.getElementById('services-track');
  if (!track) return;
  const cards = Array.from(track.children);
  const controls = document.querySelector('.carousel-controls');
  const counter = controls.querySelector('.carousel-counter');
  const dotsHost = controls.querySelector('.carousel-dots');
  const previous = controls.querySelector('[data-direction="-1"]');
  const next = controls.querySelector('[data-direction="1"]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let stops = [];
  let current = 0;
  let timer;
  function positions() {
    const first = cards[0].getBoundingClientRect().left;
    return cards.map(card => card.getBoundingClientRect().left - first);
  }
  function update() {
    const left = track.scrollLeft;
    current = stops.reduce((best, stop, index) => Math.abs(stop - left) < Math.abs(stops[best] - left) ? index : best, 0);
    previous.disabled = left <= 2;
    next.disabled = left >= track.scrollWidth - track.clientWidth - 2;
    Array.from(dotsHost.children).forEach((dot, index) => dot.setAttribute('aria-current', String(index === current)));
    const visible = cards.map((card, index) => {
      const r = card.getBoundingClientRect();
      const area = track.getBoundingClientRect();
      return Math.min(r.right, area.right) - Math.max(r.left, area.left) > r.width * .5 ? index + 1 : null;
    }).filter(Boolean);
    if (visible.length) counter.textContent = visible.length === 1 ? `Serviço ${visible[0]} de ${cards.length}` : `Serviços ${visible[0]}–${visible[visible.length - 1]} de ${cards.length}`;
  }
  function go(index) {
    index = Math.max(0, Math.min(stops.length - 1, index));
    track.scrollTo({ left: stops[index], behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  function rebuild() {
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    stops = [...new Set(positions().map(position => Math.min(Math.round(position), max)))];
    dotsHost.replaceChildren(...stops.map((_, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'carousel-dot';
      button.setAttribute('aria-label', `Mostrar serviço ${index + 1} de ${cards.length}`);
      button.setAttribute('aria-controls', 'services-track');
      button.addEventListener('click', () => go(index));
      return button;
    }));
    update();
  }
  previous.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    go(event.key === 'Home' ? 0 : event.key === 'End' ? stops.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  track.addEventListener('scroll', () => { clearTimeout(timer); timer = setTimeout(update, 100); }, { passive: true });
  controls.hidden = false;
  new ResizeObserver(rebuild).observe(track);
  rebuild();
})();
