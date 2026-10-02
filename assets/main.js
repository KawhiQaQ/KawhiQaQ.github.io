(() => {
  const links = [...document.querySelectorAll('nav a[href^="#"]')];
  const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
  let ticking = false;
  function updateNavigation() {
    const offset = document.querySelector('.site-header').offsetHeight + 135;
    let active = sections[0];
    for (const section of sections) if (section.getBoundingClientRect().top <= offset) active = section;
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) active = sections[sections.length - 1];
    links.forEach(link => {
      const selected = link.hash === '#' + active.id;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateNavigation); ticking = true; } }, {passive:true});
  window.addEventListener('resize', updateNavigation);
  updateNavigation();
})();

// Independent galleries advance every two seconds, with manual controls.
document.querySelectorAll('.project-gallery').forEach(gallery => {
  const viewport = gallery.querySelector('.gallery-viewport');
  const slides = [...gallery.querySelectorAll('.gallery-slide')];
  const dots = [...gallery.querySelectorAll('.gallery-dot')];
  const status = gallery.querySelector('.gallery-status');
  const controls = gallery.querySelector('.gallery-controls');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const name = gallery.getAttribute('aria-label').replace(/ screenshots$/, '');
  const playback = document.createElement('button');
  playback.type = 'button';
  playback.className = 'gallery-playback';
  playback.setAttribute('aria-controls', viewport.id);
  controls.prepend(playback);
  let current = 0;
  let frame;
  let timer;
  let inView = false;
  let hovering = false;
  let touching = false;
  let enabled = !reducedMotion.matches;

  function syncPlayback() {
    const label = `${enabled ? 'Pause' : 'Play'} ${name} slideshow`;
    playback.setAttribute('aria-label', label);
    playback.title = label;
    playback.innerHTML = enabled
      ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h3v12H3zm7 0h3v12h-3z"/></svg>'
      : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2v12l10-6z"/></svg>';
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    const running = enabled && !gallery.closest('details:not([open])') && inView && !hovering && !touching && !document.hidden && !gallery.contains(document.activeElement);
    status.setAttribute('aria-live', running ? 'off' : 'polite');
    if (running) timer = setTimeout(() => goTo(current + 1), 2000);
  }
  function update() {
    if (!viewport.clientWidth) return;
    current = Math.max(0, Math.min(slides.length - 1, Math.round(viewport.scrollLeft / viewport.clientWidth)));
    dots.forEach((dot, index) => {
      if (index === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
      slides[index].tabIndex = index === current ? 0 : -1;
    });
    const message = `Image ${current + 1} of ${slides.length}`;
    if (status.textContent !== message) status.textContent = message;
  }
  function goTo(index) {
    const target = (index + slides.length) % slides.length;
    viewport.scrollTo({left: target * viewport.clientWidth, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    schedule();
  }
  controls.hidden = false;
  playback.addEventListener('click', () => { enabled = !enabled; syncPlayback(); });
  gallery.querySelectorAll('.gallery-arrow').forEach(button => {
    button.addEventListener('click', () => goTo(current + Number(button.dataset.direction)));
  });
  dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));
  gallery.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    goTo(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  gallery.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovering = true; schedule(); } });
  gallery.addEventListener('pointerleave', () => { hovering = false; schedule(); });
  viewport.addEventListener('pointerdown', () => { touching = true; schedule(); });
  window.addEventListener('pointerup', () => { if (touching) { touching = false; schedule(); } });
  window.addEventListener('pointercancel', () => { touching = false; schedule(); });
  gallery.addEventListener('focusin', schedule);
  gallery.addEventListener('focusout', () => requestAnimationFrame(schedule));
  document.addEventListener('visibilitychange', schedule);
  gallery.closest('details')?.addEventListener('toggle', schedule);
  reducedMotion.addEventListener('change', () => { enabled = !reducedMotion.matches; syncPlayback(); });
  viewport.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }, {passive: true});
  viewport.addEventListener('scrollend', schedule);
  new ResizeObserver(() => {
    viewport.scrollTo({left: current * viewport.clientWidth, behavior: 'instant'});
    update();
  }).observe(viewport);
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.15;
    schedule();
  }, {threshold: 0.15}).observe(gallery);
  update();
  syncPlayback();
});

// Paper figures: architecture first, then original figures every three seconds.
// No playback or navigation buttons; the visible figure remains a full-size link.
document.querySelectorAll('.publication-carousel').forEach(gallery => {
  const slides = [...gallery.querySelectorAll('.publication-slide')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer;
  let inView = false;
  let hovering = false;
  function show(index) {
    current = index;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    const active = slides[current];
    gallery.href = active.getAttribute('src');
    gallery.setAttribute('aria-label', `${gallery.dataset.paperName}: ${active.alt} — open full-size figure`);
    if (!reducedMotion.matches) active.animate([{opacity: 0}, {opacity: 1}], {duration: 220});
  }
  function schedule() {
    clearTimeout(timer);
    if (slides.length < 2 || !inView || hovering || document.hidden || reducedMotion.matches || gallery.matches(':focus') || gallery.closest('details:not([open])')) return;
    timer = setTimeout(() => {
      const next = (current + 1) % slides.length;
      if (slides[next].complete && slides[next].naturalWidth > 0) show(next);
      schedule();
    }, 3000);
  }
  new IntersectionObserver(entries => {
    const visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.15;
    if (visible && !inView) {
      slides.forEach(slide => { slide.loading = 'eager'; });
      show(0);
    }
    inView = visible;
    schedule();
  }, {threshold: 0.15}).observe(gallery);
  gallery.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hovering = true; schedule(); } });
  gallery.addEventListener('pointerleave', () => { hovering = false; schedule(); });
  gallery.addEventListener('focus', schedule);
  gallery.addEventListener('blur', schedule);
  gallery.closest('details')?.addEventListener('toggle', schedule);
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) show(0); schedule(); });
});

// Keep the same accessible toggle after the extra items, including when open.
// Native details remain usable when JavaScript is unavailable.
document.querySelectorAll('.content-disclosure').forEach((details, index) => {
  const summary = details.querySelector(':scope > summary');
  const remaining = details.querySelectorAll('.paper, .project-card, .record-list > li').length;
  const count = document.createElement('span');
  count.className = 'disclosure-count';
  count.textContent = ` (${remaining})`;
  summary.querySelector('.show-more-label').append(count);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'disclosure-toggle';
  button.innerHTML = summary.innerHTML;
  details.id ||= `more-content-${index + 1}`;
  button.setAttribute('aria-controls', details.id);
  button.setAttribute('aria-expanded', String(details.open));
  details.classList.add('disclosure-enhanced');
  details.after(button);
  button.addEventListener('click', () => {
    const collapsing = details.open;
    const previousScrollY = window.scrollY;
    details.open = !details.open;
    button.setAttribute('aria-expanded', String(details.open));
    if (!collapsing) {
      requestAnimationFrame(() => window.scrollTo({top:previousScrollY, behavior:'instant'}));
    }
    if (collapsing) {
      requestAnimationFrame(() => {
        const box = button.getBoundingClientRect();
        const headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom;
        if (box.top < headerBottom || box.bottom > innerHeight) {
          button.scrollIntoView({block:'center', behavior:'instant'});
        }
        button.focus({preventScroll:true});
      });
    }
  });
  details.addEventListener('toggle', () => {
    button.setAttribute('aria-expanded', String(details.open));
  });
});

// Section totals include collapsed entries; template placeholders do not count.
[
  ['publications', '.paper:not([data-placeholder="true"])'],
  ['projects', '.project-card'],
  ['research', '.record-list > li'],
  ['awards', '.award-list > li'],
].forEach(([id, selector]) => {
  const section = document.getElementById(id);
  if (!section) return;
  const total = section.querySelectorAll(selector).length;
  const badge = document.createElement('span');
  badge.className = 'section-count';
  const value = document.createElement('span');
  value.className = 'section-count-value';
  value.textContent = total;
  const label = document.createElement('span');
  label.className = 'section-count-label';
  label.textContent = 'total';
  badge.append(value, label);
  section.querySelector('.section-heading').append(badge);
});
// Number each collection in document order, including its collapsed continuation.
// Inserting a new item at the top automatically shifts the following numbers.
function numberItems(container, itemSelector, titleSelector) {
  if (!container) return;
  container.querySelectorAll(itemSelector).forEach((item, index) => {
    const title = item.querySelector(titleSelector);
    if (!title) return;
    const number = document.createElement('span');
    number.className = 'item-number';
    number.textContent = `#${index + 1}`;
    item.classList.add('numbered-item');
    const position = item.querySelector('.project-copy') || item.querySelector('.paper-meta') || item;
    position.append(number);
  });
}
document.querySelectorAll('#publications .publication-group').forEach(group => {
  numberItems(group, '.paper', 'h4');
});
numberItems(document.getElementById('projects'), '.project-card', '.project-copy h3');
document.querySelectorAll('#research .research-group, #awards .award-group').forEach(group => {
  numberItems(group, '.record-list > li', 'h4');
});

// Start silent demos when visible, and retain an explicit pause by the visitor.
document.querySelectorAll('.project-video video[data-autoplay]').forEach(video => {
  let inView = false;
  let userPaused = false;
  video.muted = true;
  const sync = () => {
    if (inView && !document.hidden && !userPaused) {
      video.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
    } else {
      video.pause();
    }
  };
  video.addEventListener('pause', () => {
    if (inView && !document.hidden) userPaused = true;
  });
  video.addEventListener('play', () => { userPaused = false; });
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
    sync();
  }, {threshold: 0.25}).observe(video);
  document.addEventListener('visibilitychange', sync);
});
