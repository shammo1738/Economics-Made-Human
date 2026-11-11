/*
 * Hand-drawn sketches: lesson illustrations and the supply/demand chart draw
 * themselves like pen on paper, and a line is drawn under "Made human."
 * Uses GSAP (https://gsap.com) with DrawSVG. If GSAP doesn't load, or the
 * visitor prefers reduced motion, everything simply shows without animating.
 */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  const ready = !reduce && gsap && window.ScrollTrigger && window.DrawSVGPlugin;
  if (ready) gsap.registerPlugin(window.ScrollTrigger, window.DrawSVGPlugin);

  // Straight underline under "Made human."
  const span = $('#hero-title span');
  if (span) {
    span.classList.add('has-underline');
    span.insertAdjacentHTML('beforeend', '<svg class="hero-underline" viewBox="0 0 300 6" preserveAspectRatio="none" aria-hidden="true"><path d="M2 3H298" fill="none" stroke="#ce542e" stroke-width="3.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>');
  }
  if (!ready) return;

  const ScrollTrigger = window.ScrollTrigger;
  gsap.fromTo('.hero-underline path', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut', delay: 0.5 });

  const parts = svg => ({
    strokes: $$('path, line, polyline, ellipse, rect, circle', svg).filter(el => {
      const st = el.getAttribute('stroke'); return st && st !== 'none';
    }),
    fills: $$('path, ellipse, rect, circle, text', svg).filter(el => {
      const f = el.getAttribute('fill');
      return el.tagName === 'text' || (f && f !== 'none' && !el.getAttribute('opacity'));
    })
  });

  // Lesson drawings: hide the pen strokes, then draw them as they scroll in
  const watch = () => $$('.lesson-art svg, .path-thumb svg').forEach(svg => {
    if (svg.dataset.sketch) return;
    svg.dataset.sketch = '1';
    const { strokes, fills } = parts(svg);
    gsap.set(strokes, { drawSVG: '0%' });
    gsap.set(fills, { opacity: 0 });
    ScrollTrigger.create({
      trigger: svg, start: 'top 92%', once: true,
      onEnter: () => gsap.timeline({ delay: 0.05 })
        .to(strokes, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut', stagger: 0.07 }, 0)
        .to(fills, { opacity: 1, duration: 0.5, stagger: 0.05, ease: 'none', clearProps: 'opacity' }, 0.45)
    });
  });
  watch();
  const path = $('#lesson-path'), card = $('#next-card');
  if (path) new MutationObserver(() => { watch(); ScrollTrigger.refresh(); }).observe(path, { childList: true });
  if (card) new MutationObserver(watch).observe(card, { childList: true });

  // Playground chart: draw the curves when an experiment opens
  const stage = $('#lab-stage');
  if (stage) {
    const drawChart = () => {
      const svg = $('#lab-market-chart svg'); if (!svg) return;
      const curves = $$('path[stroke]', svg).filter(p => !/e5e9df/i.test(p.getAttribute('stroke')));
      gsap.fromTo(curves, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.3, ease: 'power2.inOut', stagger: 0.12 });
    };
    ScrollTrigger.create({ trigger: stage, start: 'top 75%', once: true, onEnter: drawChart });
    new MutationObserver(drawChart).observe(stage, { childList: true });
  }

  // Coming back from a lesson changes the page height, so re-measure
  addEventListener('hashchange', () => requestAnimationFrame(() => ScrollTrigger.refresh()));
})();
