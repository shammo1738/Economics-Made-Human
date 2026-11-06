// Quick glossary drawer: slides in from the left edge on hover (or tap / keyboard).
(() => {
  'use strict';
  const terms = [...(window.ECON_GLOSSARY || [])].sort((a, b) => a[0].localeCompare(b[0]));
  const lessons = window.ECON_LESSONS || [];
  if (!terms.length) return;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lessonTitle = id => ((lessons.find(l => l.id === id) || {}).title || 'the related lesson').replace(/\.$/, '');

  const tab = document.getElementById('gdrawer-tab');
  const panel = document.getElementById('gdrawer');
  const zone = document.getElementById('gdrawer-zone');
  const list = document.getElementById('gdrawer-list');
  const search = document.getElementById('gdrawer-search');
  const count = document.getElementById('gdrawer-count');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let closeTimer, openTimer;

  function render() {
    const q = search.value.trim().toLowerCase();
    const shown = terms.filter(t => `${t[0]} ${t[1]}`.toLowerCase().includes(q));
    count.textContent = q ? `${shown.length} of ${terms.length} terms` : `${terms.length} terms, A to Z`;
    let letter = '';
    list.innerHTML = shown.map((t, i) => {
      const first = t[0][0].toUpperCase();
      const head = first !== letter ? `<li class="gdrawer-letter" aria-hidden="true">${(letter = first)}</li>` : '';
      return `${head}<li><details class="gdrawer-term"><summary>${esc(t[0])}</summary><p>${esc(t[1])}</p><a href="#lesson/${esc(t[2])}/0" data-gdrawer-close>Learn it in “${esc(lessonTitle(t[2]))}” <span aria-hidden="true">↗</span></a></details></li>`;
    }).join('') || '<li class="gdrawer-empty">No matching terms. Try “price” or “cost”.</li>';
  }

  function open() {
    clearTimeout(closeTimer);
    if (panel.classList.contains('open')) return;
    panel.classList.add('open'); panel.inert = false;
    tab.setAttribute('aria-expanded', 'true');
    document.body.classList.add('gdrawer-on');
  }
  function close({returnFocus = false} = {}) {
    clearTimeout(openTimer);
    if (!panel.classList.contains('open')) return;
    panel.classList.remove('open'); panel.inert = true;
    tab.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('gdrawer-on');
    if (returnFocus) tab.focus();
  }
  const busy = () => document.activeElement === search && search.value;
  const scheduleClose = () => { clearTimeout(openTimer); clearTimeout(closeTimer); closeTimer = setTimeout(() => { if (!busy()) close(); }, 380); };

  if (canHover) {
    // small delay so brushing past the edge doesn't pop it open
    const hoverOpen = () => { clearTimeout(closeTimer); clearTimeout(openTimer); openTimer = setTimeout(open, 120); };
    [tab, zone].forEach(el => { el.addEventListener('mouseenter', hoverOpen); el.addEventListener('mouseleave', scheduleClose); });
    panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    panel.addEventListener('mouseleave', scheduleClose);
  }
  tab.addEventListener('click', () => {
    if (panel.classList.contains('open')) close();
    else { open(); setTimeout(() => search.focus({preventScroll: true}), 260); }
  });
  panel.addEventListener('click', e => { if (e.target.closest('[data-gdrawer-close]')) close(); });
  document.getElementById('gdrawer-x').addEventListener('click', () => close({returnFocus: true}));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) close({returnFocus: true}); });
  document.addEventListener('pointerdown', e => {
    if (panel.classList.contains('open') && !panel.contains(e.target) && !tab.contains(e.target)) close();
  });
  search.addEventListener('input', render);
  panel.inert = true;
  render();
})();
