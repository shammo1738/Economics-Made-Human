(() => {
  'use strict';
  const lessons = window.ECON_LESSONS;
  const glossary = window.ECON_GLOSSARY;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = n => new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:2}).format(n);
  const ids = new Set(lessons.map(l=>l.id));
  let saved = {completed:[],last:null};
  let storageWorks = true;
  try {
    const raw = JSON.parse(localStorage.getItem('omar-economics-v1') || 'null');
    if(raw && typeof raw === 'object') {
      saved.completed = Array.isArray(raw.completed) ? [...new Set(raw.completed.filter(id=>ids.has(id)))] : [];
      if(raw.last && ids.has(raw.last.id)) saved.last = {id:raw.last.id,step:Math.max(0,Math.min(3,Number(raw.last.step)||0))};
    }
  } catch { storageWorks = false; }
  let activeLab='market', activeLesson=null, activeStep=0;
  let labState={price:5,shift:0,rate:3,years:5,hours:4,wage:20};
  let practicePassed = new Set(), quizPassed = new Set(saved.completed), quizWrong = new Map();
  let toastTimer;
  const stepNames=['The idea','Break it down','Try it yourself','Make it stick'];

  function persist() {
    try{localStorage.setItem('omar-economics-v1',JSON.stringify(saved));}
    catch{storageWorks=false;}
  }
  function toast(message){ $('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500); }
  const num=l=>String(lessons.indexOf(l)+1).padStart(2,'0');
  function nextUp(){
    const done=saved.completed;
    if(done.length===lessons.length) return {state:'done'};
    if(saved.last&&!done.includes(saved.last.id)) return {state:'resume',lesson:lessons.find(l=>l.id===saved.last.id),step:saved.last.step};
    return {state:done.length?'next':'new',lesson:lessons.find(l=>!done.includes(l.id)),step:0};
  }
  function updateProgress(){
    const count=saved.completed.length, up=nextUp();
    $('#header-progress').textContent=`${count}/12`;
    $('.progress-trigger').setAttribute('aria-label',`View your progress: ${count} of 12 lessons complete`);
    const start=$('#start-button'); if(!start) return;
    if(up.state==='done'){start.href='#lessons';start.innerHTML='Revisit the lessons <span aria-hidden="true">↗</span>';}
    else{const n=lessons.indexOf(up.lesson)+1;start.href=`#lesson/${up.lesson.id}/${up.step}`;start.innerHTML=`${up.state==='resume'?'Continue':'Start'} lesson ${n} <span aria-hidden="true">↗</span>`;}
    renderNextCard(up,count);
  }
  function renderNextCard(up,count){
    const card=$('#next-card'); if(!card) return;
    const track=`<div class="next-progress"><div class="next-progress-label"><span>Your progress</span><strong>${count} of 12 lessons</strong></div><div class="progress-track" aria-hidden="true"><span style="width:${count/12*100}%"></span></div></div>`;
    if(up.state==='done'){
      card.href='#playground';
      card.setAttribute('aria-label','All 12 lessons complete. Go to the playground.');
      card.innerHTML=`<div class="next-label">ALL 12 LESSONS COMPLETE</div><div class="next-body"><h2>You did it. Every idea, unlocked.</h2><p>Keep the ideas fresh by experimenting in the playground, or revisit any lesson below.</p><span class="next-go">Open the playground <span aria-hidden="true">→</span></span></div>${track}`;
      return;
    }
    const l=up.lesson, label={new:'START HERE',next:'UP NEXT',resume:'PICK UP WHERE YOU LEFT OFF'}[up.state];
    card.href=`#lesson/${l.id}/${up.step}`;
    card.setAttribute('aria-label',`${label.toLowerCase()}: lesson ${lessons.indexOf(l)+1}, ${l.short}, ${l.time} minutes`);
    card.innerHTML=`<div class="next-label"><span class="live-dot"></span>${label}</div><div class="lesson-art ${l.color}"><span class="lesson-number">LESSON ${num(l)}</span>${illustration(l.art)}</div><div class="next-body"><div class="card-kicker"><span>${l.category}</span><span>◷ ${l.time} min</span></div><h2>${l.title}</h2><p>${l.description}</p><ol class="next-steps" aria-hidden="true">${stepNames.map((n,i)=>`<li class="${i<up.step?'done':i===up.step?'current':''}">${n}</li>`).join('')}</ol><span class="next-go">${up.state==='resume'?`Continue from step ${up.step+1}`:'Start this lesson'} <span aria-hidden="true">→</span></span></div>${track}`;
  }

  function illustration(type){
    const ink='#586c50', orange='#c7835e', blue='#708fa5', light='#faf9f0';
    const common=`fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
    const designs={
      choice:`<path d="M95 107h150" ${common}/><path d="M170 42v65m-61-49 122-8M119 58l-24 35h49zm99-8-24 35h49z" ${common}/><path d="M94 94c2 18 49 18 50 0m50-8c2 18 49 18 50 0" fill="${light}" stroke="${ink}" stroke-width="2"/><circle cx="170" cy="52" r="6" fill="${orange}"/><path d="M153 122h34m-17-15v15" ${common}/><circle cx="112" cy="79" r="8" fill="${orange}"/><rect x="210" y="66" width="16" height="19" rx="2" fill="${blue}"/><path d="m252 38 5 8m11-1-9 4m-5-17 1 8" stroke="${orange}" stroke-width="2"/>`,
      paths:`<path d="M170 137V89c0-21-50-23-50-48M170 89c0-21 50-23 50-48" ${common} stroke-width="3"/><path d="m108 51 12-14 12 14m76 0 12-14 12 14" ${common}/><path d="M161 137h18" ${common}/><circle cx="104" cy="112" r="21" fill="${light}"/><path d="M100 100v17l12-6" ${common}/><circle cx="235" cy="113" r="21" fill="#d1dcc4"/><text x="235" y="120" text-anchor="middle" font-size="23" fill="${ink}" font-family="Georgia">$</text><path d="m158 47 9-5m10 0 9 5" stroke="${orange}" stroke-width="2"/>`,
      steps:`<path d="M85 128h43v-25h43V78h43V53h42" ${common} stroke-width="3"/><path d="M101 89c23-37 51-49 94-53" stroke="${orange}" stroke-width="2" fill="none" stroke-dasharray="4 5"/><path d="m186 28 13 7-10 11" stroke="${orange}" stroke-width="2" fill="none"/><circle cx="150" cy="85" r="10" fill="${orange}"/><circle cx="193" cy="60" r="10" fill="${blue}"/><circle cx="235" cy="35" r="10" fill="${light}" stroke="${ink}" stroke-width="1.5"/>`,
      curves:`<path d="M94 30v104h167" ${common}/><path d="m108 42 136 80" stroke="${blue}" stroke-width="3"/><path d="m108 122 136-80" stroke="${orange}" stroke-width="3"/><path d="M176 82v52m0-52H94" stroke="${ink}" stroke-width="1" stroke-dasharray="4 5"/><circle cx="176" cy="82" r="8" fill="${light}" stroke="${ink}" stroke-width="2"/><text x="77" y="40" fill="${ink}" font-size="11">P</text><text x="258" y="149" fill="${ink}" font-size="11">Q</text>`,
      balance:`<path d="M169 54v73m-33 0h66M108 56h123" ${common}/><circle cx="169" cy="56" r="7" fill="${orange}"/><path d="m118 58-23 41h46zm102 0-23 41h46z" ${common}/><path d="M94 99c1 20 47 20 48 0m55 0c1 20 47 20 48 0" fill="${light}" stroke="${ink}" stroke-width="2"/><path d="m156 28 8 8 16-17" stroke="${ink}" stroke-width="2" fill="none"/>`,
      stretch:`<path d="M83 84h35m104 0h35m-164-9-10 9 10 9m154-18 10 9-10 9" ${common}/><path d="M118 84c6-42 14 42 20 0s14 42 20 0 14 42 20 0 14 42 20 0 14 42 24 0" stroke="${orange}" fill="none" stroke-width="3"/><path d="M120 124h100" stroke="${ink}" stroke-dasharray="3 5"/><text x="170" y="46" text-anchor="middle" font-family="Georgia" font-style="italic" font-size="15" fill="${ink}">how much?</text>`,
      ripple:`<ellipse cx="170" cy="88" rx="89" ry="40" fill="none" stroke="${ink}" stroke-width="1" opacity=".3"/><ellipse cx="170" cy="88" rx="63" ry="29" fill="none" stroke="${ink}" stroke-width="1.5" opacity=".5"/><ellipse cx="170" cy="88" rx="37" ry="18" fill="none" stroke="${ink}" stroke-width="2"/><path d="M170 35c-20 25-17 43 0 43s20-18 0-43" fill="${orange}"/><circle cx="249" cy="105" r="8" fill="${blue}"/><circle cx="93" cy="66" r="6" fill="${light}" stroke="${ink}"/>`,
      city:`<path d="M82 133h180" ${common}/><rect x="98" y="83" width="31" height="50" fill="${light}" stroke="${ink}" stroke-width="1.5"/><rect x="143" y="54" width="35" height="79" fill="${blue}"/><rect x="194" y="69" width="37" height="64" fill="${orange}"/><path d="M104 40c54-22 89 3 131-15m-11-2 14 1-6 13" stroke="${ink}" fill="none" stroke-width="1.5"/><path d="M151 64v8m10-8v8m10-8v8m-20 9v8m10-8v8m10-8v8m-20 9v8m10-8v8m10-8v8" stroke="${light}" stroke-width="3"/><path d="M202 80h9m8 0h5m-22 14h9m8 0h5m-22 14h9m8 0h5" stroke="${light}" stroke-width="3"/>`,
      basket:`<path d="m112 71 11 55h95l12-55z" fill="${light}" stroke="${ink}" stroke-width="2"/><path d="m134 71 24-31m48 31-24-31M135 84l7 29m27-29v29m33-29-6 29" ${common}/><path d="M107 71h128" stroke="${ink}" stroke-width="3"/><circle cx="244" cy="46" r="24" fill="${orange}"/><path d="M244 57V35m-8 8 8-8 8 8" stroke="${light}" fill="none" stroke-width="2"/><text x="95" y="42" font-family="Georgia" fill="${ink}" font-size="26">$</text>`,
      percent:`<circle cx="140" cy="59" r="20" fill="${light}" stroke="${ink}" stroke-width="2"/><circle cx="201" cy="111" r="20" fill="${orange}"/><path d="m134 128 75-88" stroke="${ink}" stroke-width="3"/><path d="M250 56v38m-8-30 8-8 8 8M90 83v31m-8-8 8 8 8-8" stroke="${blue}" stroke-width="2" fill="none"/>`,
      people:`<circle cx="115" cy="62" r="13" fill="${blue}"/><circle cx="170" cy="62" r="13" fill="${orange}"/><circle cx="225" cy="62" r="13" fill="${light}" stroke="${ink}" stroke-width="1.5"/><path d="M96 123V93c0-20 38-20 38 0v30M151 123V93c0-20 38-20 38 0v30M206 123V93c0-20 38-20 38 0v30" ${common}/><path d="M105 123v-24m20 24v-24m35 24v-24m20 24v-24m35 24v-24m20 24v-24" stroke="${ink}" stroke-width="1.5"/><circle cx="248" cy="35" r="14" fill="#d2d9c9"/><text x="248" y="40" text-anchor="middle" font-size="17" font-family="Georgia" fill="${ink}">?</text>`,
      exchange:`<path d="M117 52h108l-10-10m10 10-10 10M223 115H115l10 10m-10-10 10-10" ${common}/><path d="m101 78-15 23h42z" fill="${orange}" stroke="${ink}" stroke-width="1.5"/><path d="m91 96 10-13 17 13" fill="none" stroke="${light}" stroke-width="2"/><path d="M220 72h29v17c0 13-29 13-29 0z" fill="${light}" stroke="${ink}" stroke-width="1.5"/><path d="M249 75h5c10 0 8 15-5 15m-24-32c-6 5 6 6 0 10m12-10c-6 5 6 6 0 10" ${common}/><text x="170" y="90" text-anchor="middle" font-size="25" fill="${ink}">↔</text>`
    };
    return `<svg viewBox="0 0 340 164" aria-hidden="true"><circle cx="170" cy="82" r="62" fill="#ffffff" opacity=".18"/>${designs[type]||designs.curves}</svg>`;
  }

  function renderPath(){
    const box=$('#lesson-path'); if(!box) return;
    const up=nextUp(), units=[...new Set(lessons.map(l=>l.category))];
    box.innerHTML=units.map((u,ui)=>{
      const list=lessons.filter(l=>l.category===u), done=list.filter(l=>saved.completed.includes(l.id)).length;
      return `<section class="unit" aria-labelledby="unit-${ui}"><div class="unit-head"><span class="unit-label">UNIT ${ui+1}</span><h3 id="unit-${ui}">${u}</h3><span class="unit-count">${done===list.length?'✓ Complete':`${done} of ${list.length} done`}</span></div><ol class="path-list">${list.map(l=>{
        const isDone=saved.completed.includes(l.id), isNext=up.lesson===l, step=isNext?up.step:0;
        const status=isDone?'Done':isNext?(up.state==='resume'?'Continue':'Start'):'';
        return `<li class="path-item ${isDone?'done':isNext?'next':''}"><a href="#lesson/${l.id}/${step}" aria-label="Lesson ${lessons.indexOf(l)+1}: ${escape(l.short)}, ${l.time} minutes${isDone?', completed':isNext?', up next':''}"><span class="path-marker" aria-hidden="true">${isDone?'✓':num(l)}</span><span class="path-thumb ${l.color}" aria-hidden="true">${illustration(l.art)}</span><span class="path-text">${isNext?'<span class="path-flag">Up next</span>':''}<strong>${l.title}</strong><small>${l.description}</small></span><span class="path-meta">◷ ${l.time} min</span><span class="path-status">${status}${status&&!isDone?' <span aria-hidden="true">→</span>':''}</span></a></li>`;}).join('')}</ol></section>`;
    }).join('');
  }

  function marketGraph(price,shift=0){
    const x=q=>45+q/120*420, y=p=>241-p/10*198;
    const qd=100+shift-10*price,qs=10*price,eqP=(100+shift)/20,eqQ=10*eqP;
    const grid=[2,4,6,8,10].map(p=>`<path d="M45 ${y(p)}H465" stroke="#e5e9df" stroke-width=".8"/>`).join('')+[20,40,60,80,100,120].map(q=>`<path d="M${x(q)} 43V241" stroke="#e5e9df" stroke-width=".8"/>`).join('');
    return `<svg viewBox="0 0 500 284" role="img" aria-label="Supply and demand for coffee. At ${money(price)}, ${qd} cups demanded and ${qs} supplied. Equilibrium is ${money(eqP)} and ${eqQ} cups per hour."><text class="chart-label" x="9" y="21" fill="#7e8c72" style="font-size:10px">Price ($)</text>${grid}<path d="M45 37v204h427" stroke="#9da991" stroke-width="1" fill="none"/>${[0,5,10].map(p=>`<text x="33" y="${y(p)+3}" text-anchor="end" class="chart-label" style="font-size:9px" fill="#8f9c85">${p}</text>`).join('')}${[0,60,120].map(q=>`<text x="${x(q)}" y="258" text-anchor="middle" class="chart-label" style="font-size:9px" fill="#8f9c85">${q}</text>`).join('')}<text x="465" y="278" text-anchor="end" class="chart-label" fill="#7e8c72" style="font-size:10px">Cups per hour</text><path d="M${x(shift)} ${y(10)}L${x(100+shift)} ${y(0)}" stroke="#698bb2" stroke-width="2.7"/><path d="M${x(0)} ${y(0)}L${x(100)} ${y(10)}" stroke="#c8895f" stroke-width="2.7"/><text x="${x(shift)+12}" y="40" class="chart-label" fill="#698bb2" style="font-size:11px">Demand</text><text x="${x(100)-39}" y="32" class="chart-label" fill="#b97d52" style="font-size:11px">Supply</text><path d="M45 ${y(price)}H465" stroke="#a3b297" stroke-width="1" stroke-dasharray="4 5"/><path d="M${x(eqQ)} ${y(eqP)}V241" stroke="#b1be9f" stroke-width="1" stroke-dasharray="3 5"/><circle cx="${x(eqQ)}" cy="${y(eqP)}" r="16" fill="#a8b98d" fill-opacity=".16"/><circle cx="${x(eqQ)}" cy="${y(eqP)}" r="5" fill="#698057"/><circle cx="${x(qd)}" cy="${y(price)}" r="5.5" fill="#698bb2" stroke="#fffef9" stroke-width="2"/><circle cx="${x(qs)}" cy="${y(price)}" r="5.5" fill="#c8895f" stroke="#fffef9" stroke-width="2"/><rect x="9" y="${y(price)-9}" width="31" height="18" rx="4" fill="#eef2e6"/><text x="25" y="${y(price)+3}" text-anchor="middle" class="chart-label" style="font-size:10px" fill="#5d7451">${price.toFixed(1)}</text>${Math.abs(qd-qs)<1?`<rect x="${x(eqQ)+12}" y="${y(eqP)-34}" width="60" height="22" rx="4" fill="#edf1e5"/><text x="${x(eqQ)+42}" y="${y(eqP)-19}" text-anchor="middle" class="chart-label" style="font-size:10px" fill="#60754d">Balance!</text>`:''}</svg>`;
  }
  function renderLab(){
    $$('.lab-tab').forEach(b=>{const on=b.dataset.lab===activeLab;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});
    if(activeLab==='market') $('#lab-stage').innerHTML=`<h3>A market in your hands.</h3><p>Set the coffee price. Then bring in some new customers. Watch the market respond.</p><div class="lab-split"><div class="lab-graph" id="lab-market-chart"></div><div class="lab-control"><label class="field-label" for="lab-price">Price per cup <strong id="lab-price-value"></strong></label><input id="lab-price" type="range" min="2" max="8" step="0.5" value="${labState.price}"><div class="range-labels"><span>$2</span><span>$8</span></div><p>What if a new office opens nearby?</p><div class="lab-controls-inline"><button class="small-button ${labState.shift===0?'active':''}" data-demand="0" aria-pressed="${labState.shift===0}">Usual day</button><button class="small-button ${labState.shift===20?'active':''}" data-demand="20" aria-pressed="${labState.shift===20}">More customers</button></div><p id="market-quantities"></p></div></div><div class="lab-insight" aria-live="polite"><img class="insight-mark" src="assets/mark.png" width="22" height="19" alt=""><p id="market-insight"></p></div><p class="lab-assumption">Illustrative model: demand = 100 + demand shift − 10P; supply = 10P. Quantities are cups per hour. Other influences are held constant.</p>`;
    if(activeLab==='inflation') $('#lab-stage').innerHTML=`<h3>Same $100. A different basket.</h3><p>If you keep $100 in cash while prices rise, how much can it buy in today’s terms?</p><div class="money-display"><strong id="inflation-value"></strong><span>of today’s purchasing power</span></div><div class="basket-bar" role="img" id="inflation-bar"><div class="basket-bar-fill" id="basket-fill"></div></div><div class="basket-bar-label"><span>What your cash can buy</span><span>$100 today</span></div><div class="slider-row"><div><label class="field-label" for="inflation-rate">Annual inflation <strong id="inflation-rate-value"></strong></label><input id="inflation-rate" type="range" min="0" max="10" step="0.5" value="${labState.rate}"><div class="range-labels"><span>0%</span><span>10%</span></div></div><div><label class="field-label" for="inflation-years">Time passes <strong id="inflation-years-value"></strong></label><input id="inflation-years" type="range" min="1" max="20" step="1" value="${labState.years}"><div class="range-labels"><span>1 year</span><span>20 years</span></div></div></div><div class="lab-insight" aria-live="polite"><img class="insight-mark" src="assets/mark.png" width="22" height="19" alt=""><p id="inflation-insight"></p></div><p class="lab-assumption">Illustrative, constant inflation. Cash earns no interest. Purchasing power = $100 ÷ (1 + annual inflation rate)<sup>years</sup>. This is a learning model, not a forecast.</p>`;
    if(activeLab==='time') $('#lab-stage').innerHTML=`<h3>Eight hours. Your call.</h3><p>You have eight free hours on Saturday. Split them between paid work and time for yourself.</p><div class="time-blocks" id="time-blocks" role="img"></div><div class="time-key"><span><i></i> Work</span><span><i></i> Free time</span></div><div class="slider-row"><div><label class="field-label" for="work-hours">Hours at work <strong id="work-hours-value"></strong></label><input id="work-hours" type="range" min="0" max="8" step="1" value="${labState.hours}"><div class="range-labels"><span>0 hours</span><span>8 hours</span></div></div><div><label class="field-label" for="hourly-wage">Hourly pay <strong id="hourly-wage-value"></strong></label><input id="hourly-wage" type="range" min="10" max="40" step="1" value="${labState.wage}"><div class="range-labels"><span>$10</span><span>$40</span></div></div></div><div class="time-summary"><strong id="time-earned"></strong><span>earned before tax · <span id="time-free"></span> free</span></div><div class="lab-insight" aria-live="polite"><img class="insight-mark" src="assets/mark.png" width="22" height="19" alt=""><p id="time-insight"></p></div><p class="lab-assumption">Assumes flexible shifts at a constant wage, with work as the next-best alternative to free time. No taxes or travel costs. Your free time has value too.</p>`;
    updateLab();
  }
  function updateLab(){
    const s=labState;
    if(activeLab==='market'){
      const qd=100+s.shift-10*s.price, qs=10*s.price, gap=qd-qs, eq=(100+s.shift)/20;
      $('#lab-market-chart').innerHTML=marketGraph(s.price,s.shift);
      $('#lab-price-value').textContent=money(s.price);
      $('#market-quantities').innerHTML=`<strong>${qd} cups</strong> wanted · <strong>${qs} cups</strong> offered`;
      $('#market-insight').innerHTML=gap===0?`<strong>You found equilibrium.</strong> Buyers want ${qd} cups and sellers offer ${qs}. ${s.shift?'Extra demand moved the balancing price from $5 to $6.':'At $5, neither a shortage nor a surplus appears in this model.'}`:`<strong>${gap>0?`A shortage of ${gap} cups.`:`A surplus of ${-gap} cups.`}</strong> ${gap>0?'Buyers want more than sellers offer. This creates upward pressure on price.':'Sellers offer more than buyers want. This creates downward pressure on price.'} Try ${money(eq)} to find the new balance.`;
    }
    if(activeLab==='inflation'){
      const factor=(1+s.rate/100)**s.years, power=100/factor, cost=100*factor;
      $('#inflation-value').textContent=money(power);$('#inflation-rate-value').textContent=`${s.rate}%`;$('#inflation-years-value').textContent=`${s.years} year${s.years===1?'':'s'}`;
      $('#basket-fill').style.width=`${power}%`;$('#inflation-bar').setAttribute('aria-label',`${power.toFixed(1)} percent of the original purchasing power remains`);
      $('#inflation-insight').innerHTML=s.rate===0?'<strong>With zero inflation, purchasing power stays the same.</strong> Your $100 still buys the same basket in this model.':`<strong>The cash still says $100. What it buys has changed.</strong> After ${s.years} year${s.years===1?'':'s'}, today’s $100 basket would cost ${money(cost)}. Your cash buys about ${power.toFixed(1)}% of that basket.`;
    }
    if(activeLab==='time'){
      $('#time-blocks').innerHTML=Array.from({length:8},(_,i)=>`<span class="time-block ${i<s.hours?'work':''}" aria-hidden="true">${i<s.hours?'↗':'☼'}</span>`).join('');$('#time-blocks').setAttribute('aria-label',`${s.hours} hours working and ${8-s.hours} hours free`);
      $('#work-hours-value').textContent=`${s.hours}h`;$('#hourly-wage-value').textContent=money(s.wage);$('#time-earned').textContent=money(s.hours*s.wage);$('#time-free').textContent=`${8-s.hours}h`;
      $('#time-insight').innerHTML=`<strong>${8-s.hours} free hours mean ${money((8-s.hours)*s.wage)} in foregone pay.</strong> ${s.hours===8?'You chose the highest earnings here, but you gave up all eight free hours.':`One extra free hour would mean giving up ${money(s.wage)} in pay.`} There is no single right split: it depends on what you value.`;
    }
  }
  function showProgress(){
    const count=saved.completed.length;
    $('#progress-content').innerHTML=`<div class="progress-big">${count}<small> / 12 ideas unlocked</small></div><div class="progress-track" role="progressbar" aria-label="Lessons complete" aria-valuemin="0" aria-valuemax="12" aria-valuenow="${count}"><span style="width:${count/12*100}%"></span></div><p class="progress-help">${count===12?'You completed every lesson. Revisit an idea or keep experimenting in the playground.':count===0?'Every clear idea starts somewhere. Complete the final check in a lesson to save your progress.':'A little more understanding, one lesson at a time. Pick up where you left off or follow a new idea.'}</p><div class="progress-lessons">${lessons.map((l,i)=>`<a href="#lesson/${l.id}/0" class="${saved.completed.includes(l.id)?'done':''}" data-close-dialog><span>${saved.completed.includes(l.id)?'✓':String(i+1).padStart(2,'0')}</span>${l.short}<span>→</span></a>`).join('')}</div>${count?'<button class="reset-progress" data-action="reset-progress">Reset learning progress</button>':''}`;
    $('.storage-note').textContent=storageWorks?'Progress is saved in this browser on this device.':'Browser storage is unavailable. Progress will last for this visit only.';
    if(!$('#progress-dialog').open) $('#progress-dialog').showModal();
  }

  function renderLesson(id,step,{focus=true}={}){
    const l=lessons.find(x=>x.id===id);if(!l){location.hash='#lessons';return;}
    activeLesson=l;activeStep=step;
    saved.last={id:l.id,step};persist();updateProgress();
    $('#home-view').hidden=true;$('#lesson-view').hidden=false;
    document.title=`${l.short} — Economics by Omar`;
    const i=lessons.indexOf(l),next=lessons[i+1];
    let body='';
    if(step===0) body=`<h1 tabindex="-1">${l.title}</h1><p class="lesson-hook">${l.hook}</p><p class="lesson-prose">${l.idea}</p><div class="lesson-art ${l.color}">${illustration(l.art)}</div><div class="takeaway"><span>THE ONE THING TO REMEMBER</span><p>${l.takeaway}</p></div>`;
    if(step===1) body=`<h1 tabindex="-1">Let’s break it down.</h1><p class="example-intro">${l.example}</p><ol class="worked-steps">${l.steps.map(s=>`<li><h3>${s[0]}</h3><p>${s[1]}</p></li>`).join('')}</ol><p class="pitfall"><strong>A useful distinction.</strong> ${l.pitfall}</p>`;
    if(step===2) body=`<h1 tabindex="-1">Your turn to make it click.</h1><p class="lesson-prose">A small example. No timer. Work it out at your own pace.</p><form class="practice-card" id="practice-form"><label for="practice-answer">${l.practice.prompt}</label><div class="practice-input"><input id="practice-answer" name="answer" type="number" inputmode="decimal" step="any" required placeholder="Your answer" aria-describedby="practice-unit"><span id="practice-unit">${l.practice.unit}</span></div><button class="button button-dark" type="submit">Check my answer <span>→</span></button><button class="hint-toggle" type="button" data-action="hint" aria-expanded="false" aria-controls="practice-hint">A little help?</button><p class="practice-hint" id="practice-hint" hidden>${l.practice.explanation}</p><div id="practice-feedback" aria-live="polite">${practicePassed.has(l.id)?`<div class="feedback"><strong>You’ve already solved this one.</strong>${l.practice.explanation}</div>`:''}</div></form>${l.lab?`<button class="lab-jump" data-jump-lab="${l.lab}">Explore this idea in the playground ↗</button>`:''}`;
    if(step===3){
      const passed=quizPassed.has(l.id);
      body=`<h1 tabindex="-1">One last lightbulb moment.</h1><p class="lesson-prose">Check the idea, not your memory. Choose the answer that makes the most sense.</p><h2 class="quiz-question" id="quiz-question">${l.quiz.question}</h2><div class="quiz-options" role="group" aria-labelledby="quiz-question">${l.quiz.answers.map((a,n)=>`<button class="quiz-option ${passed&&n===l.quiz.correct?'correct':''}" data-answer="${n}" ${passed?'disabled':''}><span aria-hidden="true">${String.fromCharCode(65+n)}</span>${a}</button>`).join('')}</div><div id="quiz-feedback" aria-live="polite">${passed?`<div class="feedback"><strong>That’s the idea.</strong>${l.quiz.explain}</div>`:''}</div><div id="completion-slot">${passed?completionHTML(l,next):''}</div>`;
    }
    $('#lesson-view').innerHTML=`<article class="reader"><div class="reader-top"><a href="#lessons">← All lessons</a><span>${String(i+1).padStart(2,'0')} / 12 &nbsp;·&nbsp; ${l.category}</span></div><div class="reader-layout"><aside class="reader-sidebar" aria-label="Lesson steps"><div class="eyebrow">${l.category}</div><h2>${l.short}</h2><p class="reader-side-meta">${l.time} minute lesson · 4 small steps</p><div class="reader-steps">${stepNames.map((s,n)=>`<a class="reader-step ${n===step?'active':''}" href="#lesson/${l.id}/${n}" ${n===step?'aria-current="step"':''}><span>${n+1}</span>${s}</a>`).join('')}</div><p class="sidebar-note">Understanding beats memorizing.<br>Take all the time you need.</p></aside><div class="reader-content"><div class="lesson-progress-track" aria-hidden="true"><span style="width:${(step+1)*25}%"></span></div><div class="step-overline">STEP ${step+1} OF 4 · ${stepNames[step].toUpperCase()}</div>${body}<div class="reader-bottom">${step>0?`<a class="text-link" href="#lesson/${l.id}/${step-1}">← Previous step</a>`:'<a class="text-link" href="#lessons">← Back to lessons</a>'}${step<3?`<a class="button button-dark" href="#lesson/${l.id}/${step+1}">${step===0?'See an example':step===1?'Try it yourself':'Check your understanding'} <span>→</span></a>`:'<a class="text-link" href="#lessons">Explore all lessons ↗</a>'}</div></div></div></article>`;
    if(focus){window.scrollTo({top:0,behavior:'instant'});$('.reader-content h1').focus({preventScroll:true});}
  }
  function completionHTML(l,next){return `<div class="completion-panel"><h3>✓ One more idea, unlocked.</h3><p>${l.takeaway}</p>${next?`<a class="button button-dark" href="#lesson/${next.id}/0">Next: ${next.short} <span>→</span></a>`:'<a class="button button-dark" href="#lessons">Explore your learning path <span>↗</span></a>'}<p class="storage-note">${storageWorks?'Your completion is saved on this device.':'Progress is kept for this visit. Browser storage is unavailable.'}</p></div>`;}
  function checkQuiz(n){
    const l=activeLesson;if(!l||quizPassed.has(l.id))return;
    const buttons=$$('.quiz-option');buttons.forEach(b=>b.classList.remove('wrong'));
    if(n===l.quiz.correct){
      quizPassed.add(l.id);if(!saved.completed.includes(l.id))saved.completed.push(l.id);persist();updateProgress();
      buttons.forEach(b=>b.disabled=true);buttons[n].classList.add('correct');
      $('#quiz-feedback').innerHTML=`<div class="feedback"><strong>That’s the idea.</strong>${l.quiz.explain}</div>`;
      $('#completion-slot').innerHTML=completionHTML(l,lessons[lessons.indexOf(l)+1]);
      toast(`✓ ${l.short} — lesson complete`);
    }else{
      buttons[n].classList.add('wrong');quizWrong.set(l.id,n);
      $('#quiz-feedback').innerHTML=`<div class="feedback wrong"><strong>Not quite. You can try again.</strong>${l.quiz.explain}</div>`;
    }
  }
  function route(initial=false){
    const hash=location.hash||'#home';const m=hash.match(/^#lesson\/([a-z-]+)\/(\d+)$/);
    if(m){renderLesson(m[1],Math.min(3,Number(m[2])),{focus:!initial});return;}
    const wasLesson=!$('#lesson-view').hidden;
    $('#home-view').hidden=false;$('#lesson-view').hidden=true;activeLesson=null;document.title='Economics, made human — by Omar';
    renderPath();updateProgress();
    const known=['#home','#lessons','#playground','#about'];
    if(known.includes(hash)) requestAnimationFrame(()=>{if(hash==='#home')window.scrollTo({top:0,behavior:initial||wasLesson?'instant':'smooth'});else $(hash)?.scrollIntoView({behavior:initial||wasLesson?'instant':'smooth',block:'start'});});
  }

  document.addEventListener('click',e=>{
    const el=e.target.closest('button,a');if(!el)return;
    if(el.dataset.lab){activeLab=el.dataset.lab;renderLab();}
    if(el.dataset.demand!==undefined){labState.shift=Number(el.dataset.demand);$$('[data-demand]').forEach(b=>{const on=Number(b.dataset.demand)===labState.shift;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});updateLab();}
    if(el.dataset.answer!==undefined)checkQuiz(Number(el.dataset.answer));
    if(el.dataset.jumpLab){activeLab=el.dataset.jumpLab;renderLab();location.hash='#playground';}
    if(el.hasAttribute('data-close-dialog'))$('#progress-dialog').close();
    if(el.dataset.action==='progress')showProgress();
    if(el.dataset.action==='close-progress')$('#progress-dialog').close();
    if(el.dataset.action==='hint'){const hint=$('#practice-hint');hint.hidden=!hint.hidden;el.setAttribute('aria-expanded',String(!hint.hidden));el.textContent=hint.hidden?'A little help?':'Hide explanation';}
    const action=el.dataset.action;
    if(action==='reset-progress'){
      el.textContent='Reset all saved progress? Click again to confirm.';el.dataset.action='confirm-reset';
    }
    if(action==='confirm-reset'){
      saved={completed:[],last:null};practicePassed.clear();quizPassed.clear();quizWrong.clear();persist();updateProgress();renderPath();if(activeLesson)renderLesson(activeLesson.id,activeStep,{focus:false});showProgress();toast('Your learning progress has been reset.');
    }
    if(el.classList.contains('skip-link')){e.preventDefault();$('#main').setAttribute('tabindex','-1');$('#main').focus();$('#main').scrollIntoView();}
  });
  $('#progress-dialog').addEventListener('click',e=>{if(e.target===$('#progress-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  document.addEventListener('input',e=>{
    const id=e.target.id;
    const map={'lab-price':'price','inflation-rate':'rate','inflation-years':'years','work-hours':'hours','hourly-wage':'wage'};
    if(map[id]){labState[map[id]]=Number(e.target.value);updateLab();}
  });
  document.addEventListener('submit',e=>{
    if(e.target.id!=='practice-form')return;e.preventDefault();const l=activeLesson,value=Number($('#practice-answer').value),correct=Number.isFinite(value)&&Math.abs(value-l.practice.answer)<=(l.practice.tolerance||0.001);
    if(correct)practicePassed.add(l.id);
    $('#practice-feedback').innerHTML=`<div class="feedback ${correct?'':'wrong'}"><strong>${correct?'Exactly. You’ve got it.':'Not quite yet. Let’s work through it.'}</strong>${l.practice.explanation}${correct?'':' You can update your answer and try again.'}</div>`;
  });
  window.addEventListener('hashchange',()=>route());
  renderPath();renderLab();updateProgress();route(true);
})();
