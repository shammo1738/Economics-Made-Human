/*
 * Homepage touches:
 *  - Graph-paper hero: React Bits "Dot Grid" (assets/js/DotGrid.js)
 *  - Invisible forces in the Playground: React Bits "Magnet Lines" (assets/js/MagnetLines.js)
 *  - "It's in your…" rotating line, read-along About heading, turning stamp and
 *    click sparks, based on React Bits Rotating Text, Scroll Reveal, Circular Text
 *    and Click Spark, built with GSAP (https://gsap.com).
 * React Bits by David Haz: https://reactbits.dev (MIT + Commons Clause).
 */
(function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const gsap = window.gsap;
  const hasGsap = !!(gsap && window.ScrollTrigger && window.SplitText);
  if (hasGsap) gsap.registerPlugin(window.ScrollTrigger, window.SplitText);
  const { ScrollTrigger, SplitText } = window;

  function initGraph() {
    const home = $('#home-view'), hero = $('.hero');
    const host = document.createElement('div');
    host.className = 'idea-graph'; host.setAttribute('aria-hidden', 'true');
    home.prepend(host);
    const sync = () => host.style.height = hero.offsetHeight + 'px';
    sync(); new ResizeObserver(() => requestAnimationFrame(sync)).observe(hero);
    window.RB.DotGrid(host, {
      dotSize: 2.4, gap: 26, baseColor: '#c9d1c1', activeColor: '#ce542e',
      proximity: 130, strength: 0.5, bounce: 0.4, tension: 0.35, returnDuration: 1.1,
      shockRadius: 260, shockStrength: 2.5, swell: 0.6, stretch: 0.3, glow: 0,
      fade: 0.55, opacity: 1, intro: true, mouseInteraction: fine, clickShock: false,
      dpr: Math.min(devicePixelRatio || 1, 2)
    });
  }

  /* ---------------- C. Invisible forces (MagnetLines) ---------------- */
  function initForces() {
    const sec = $('.playground-section');
    const host = document.createElement('div');
    host.className = 'idea-forces'; host.setAttribute('aria-hidden', 'true');
    sec.prepend(host);
    window.RB.MagnetLines(host, {
      spacing: 34, lineColor: '#b9c6ae', accentColor: '#ce542e', lineWidth: 1.4, lineHeight: 12,
      baseAngle: -20, mode: 'orbit', shape: 'line', radius: 260, fade: 0.75, edgeFade: 0.35,
      stretch: 0.25, inertia: 0.45, bounce: 0.2, ripple: 0.15, clickPulse: false, intro: true, idle: !reduce,
      maxDevicePixelRatio: 2
    });
  }

  /* ---------------- D. It's in your… (rotating text) ---------------- */
  function initRotate() {
    const p = $('.hero-copy > p'); if (!p) return;
    const words = ['morning coffee.', 'rent.', 'Saturday.', 'paycheck.', 'grocery bill.'];
    p.innerHTML = `<span class="rot-line">It’s in your <span class="rot" aria-live="off"><span class="rot-word">${words[0]}</span></span></span><br class="desktop-break"> Clear lessons, everyday examples, and a few<br class="desktop-break"> “oh, that makes sense” moments.`;
    p.setAttribute('aria-label', 'Economics is in your morning coffee, rent, Saturday, paycheck and grocery bill. Clear lessons, everyday examples, and a few “oh, that makes sense” moments.');
    if (reduce) return;
    const box = $('.rot', p);
    let i = 0;
    setInterval(() => {
      i = (i + 1) % words.length;
      const old = $('.rot-word', box);
      const next = document.createElement('span'); next.className = 'rot-word'; next.textContent = words[i];
      box.appendChild(next);
      const a = SplitText.create(old, { type: 'chars' }), b = SplitText.create(next, { type: 'chars' });
      gsap.timeline({ onComplete: () => old.remove() })
        .to(a.chars, { yPercent: -110, opacity: 0, stagger: 0.015, duration: 0.35, ease: 'power2.in' })
        .from(b.chars, { yPercent: 110, opacity: 0, stagger: 0.02, duration: 0.5, ease: 'back.out(1.6)' }, 0.18);
    }, 2400);
  }

  /* ---------------- E. Read-along heading (ScrollReveal) ---------------- */
  function initRead() {
    const h = $('.about-copy h2'); if (!h) return;
    const split = SplitText.create(h, { type: 'words' });
    gsap.fromTo(split.words, { opacity: 0.16 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: h, start: 'top 85%', end: 'bottom 45%', scrub: true }
    });
  }

  /* ---------------- F. Turning stamp (CircularText) ---------------- */
  function initStamp() {
    const st = $('.about-stamp'); if (!st) return;
    const text = 'A LITTLE CURIOSITY GOES A LONG WAY · ';
    st.classList.add('idea-stamp');
    st.innerHTML = `<svg viewBox="0 0 120 120" class="stamp-ring"><defs><path id="stamp-circle" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0"/></defs><text><textPath href="#stamp-circle" textLength="283">${text}</textPath></text></svg><img src="assets/mark.png" width="28" height="24" alt="">`;
    st.setAttribute('aria-label', 'A little curiosity goes a long way.');
    if (!reduce) {
      const spin = gsap.to('.stamp-ring', { rotation: 360, duration: 22, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
      // speeds up a little while you scroll, like a record
      ScrollTrigger.create({ onUpdate: self => { const v = Math.min(Math.abs(self.getVelocity()) / 300, 6); gsap.to(spin, { timeScale: 1 + v, duration: 0.2, overwrite: true }); gsap.to(spin, { timeScale: 1, duration: 1.2, delay: 0.25 }); } });
    }
  }

  /* ---------------- G. Lightbulb sparks (ClickSpark) ---------------- */
  function initSpark() {
    if (reduce) return;
    const c = document.createElement('canvas');
    c.className = 'idea-sparks'; c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    let sparks = [], raf = 0;
    const size = () => { const r = devicePixelRatio || 1; c.width = innerWidth * r; c.height = innerHeight * r; ctx.setTransform(r, 0, 0, r, 0, 0); };
    size(); addEventListener('resize', size);
    const tick = now => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      sparks = sparks.filter(s => now - s.t < 420);
      for (const s of sparks) {
        const k = (now - s.t) / 420, e = k * (2 - k);
        const d = 6 + e * 16, len = 9 * (1 - e);
        ctx.strokeStyle = '#ce542e'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x + d * Math.cos(s.a), s.y + d * Math.sin(s.a));
        ctx.lineTo(s.x + (d + len) * Math.cos(s.a), s.y + (d + len) * Math.sin(s.a));
        ctx.stroke();
      }
      raf = sparks.length ? requestAnimationFrame(tick) : 0;
    };
    document.addEventListener('click', e => {
      const el = e.target.closest('.button, .button-dark, #start-button, .feedback, [data-answer], .lab-tab, .path-item a');
      if (!el) return;
      if (el.matches('[data-answer]')) setTimeout(() => { if (el.classList.contains('correct') || $('#quiz-feedback .feedback:not(.wrong)')) burst(e.clientX, e.clientY); }, 30);
      else burst(e.clientX, e.clientY);
    });
    function burst(x, y) {
      const t = performance.now();
      for (let i = 0; i < 8; i++) sparks.push({ x, y, t, a: (Math.PI * 2 * i) / 8 });
      if (!raf) raf = requestAnimationFrame(tick);
    }
  }

  const safe = (name, fn) => { try { fn(); } catch (err) { console.error('[extras]', name, err); } };
  const run = () => {
    if (window.RB?.DotGrid) safe('graph', initGraph);
    if (window.RB?.MagnetLines) safe('forces', initForces);
    if (hasGsap) {
      safe('rotate', initRotate);
      if (!reduce) safe('read', initRead);
      safe('stamp', initStamp);
    }
    safe('spark', initSpark);
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(run, run);
})();
