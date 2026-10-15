
/* ---------- Student progress (saved on this device) ---------- */
const PKEY='bondinglab-progress-v1';
const TOPICS=['Bond types','Ion charges','Formulae','Covalent bonding','Giant structures','Molecule shapes','Alloys','Dot-and-cross'];
let PROG={}; try{ PROG=JSON.parse(localStorage.getItem(PKEY))||{}; }catch(e){ PROG={}; }
function progSave(){ try{ localStorage.setItem(PKEY,JSON.stringify(PROG)); }catch(e){} }
function progRec(t,ok){ const r=PROG[t]||(PROG[t]={ok:0,n:0}); r.n++; if(ok) r.ok++; progSave(); }
const progAcc=t=>{ const r=PROG[t]; return r&&r.n?r.ok/r.n:null; };
const progWeak=()=>TOPICS.filter(t=>PROG[t]&&PROG[t].n>=2&&progAcc(t)<.8).sort((a,b)=>progAcc(a)-progAcc(b)).slice(0,3);
function progPick(){ const w=TOPICS.slice(0,7).map(t=>{ const a=progAcc(t); return a==null?2:1+4*(1-a); }); let r=Math.random()*w.reduce((x,y)=>x+y,0); for(let i=0;i<w.length;i++){ r-=w[i]; if(r<=0) return i; } return 0; }
let progConfirm=false;
function progCard(){
  const rows=TOPICS.map(t=>{ const r=PROG[t], a=progAcc(t); return '<div class="progrow"><span>'+t+'</span><span class="progbar"><i class="'+(a==null?'':a>=.8?'ok':a>=.5?'mid':'low')+'" style="width:'+(a==null?0:Math.round(a*100))+'%"></i></span><span class="progn">'+(a==null?'not tried yet':Math.round(a*100)+'% ('+r.ok+' of '+r.n+')')+'</span></div>'; }).join('');
  const weak=progWeak();
  return '<div class="progcard"><h3>My progress</h3><p class="note">Saved on this device only. It fills in as you answer quiz and exam questions.</p>'+rows+(weak.length?'<p class="note"><b>Needs work:</b> '+weak.join(', ')+'. Tick "Focus on my weak topics" in the class quiz.</p>':'')+'<button class="btn ghost" data-prog="reset">'+(progConfirm?'Click again to confirm':'Reset my progress')+'</button></div>';
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-prog]'); if(!t) return;
  if(!progConfirm){ progConfirm=true; setTimeout(()=>{ progConfirm=false; },4000); } else { PROG={}; progSave(); progConfirm=false; }
  if($('quiz')&&!$('quiz').hidden) renderQuiz(); if($('exam')&&!$('exam').hidden) renderExam();
});

/* ---------- Exam mode ---------- */
const EXAM={stage:'setup',n:5,t:20,kind:'mixed',list:[],i:0,left:0,timer:0,res:null,confirm:false};
function exBuild(){
  const by=t=>shuffle(LIST.filter(p=>p.type===t)), src={ionic:by('ionic'),covalent:by('covalent'),metallic:by('metallic')}; let picks=[];
  for(let i=0;i<EXAM.n;i++){ const t=EXAM.kind==='mixed'?(i%4===3?'metallic':(i%2?'covalent':'ionic')):EXAM.kind; picks.push(src[t].pop()||rnd(LIST.filter(p=>p.type===t))); }
  EXAM.list=shuffle(picks).map(P=>{ const q={P,a:{type:'',f:'',ne:'',chg:'',user:[]},max:P.type==='metallic'?3:5};
    if(P.type!=='metallic'){ q.sc=P.type==='ionic'?ionScene(P,'final'):covScene(P,'final'); q.a.user=q.sc.slots.map(()=>0); } return q; });
}
function exEval(sc,user){
  const groups={}; sc.slots.forEach((s,i)=>{ (groups[s.g]=groups[s.g]||[]).push(i); });
  const bad=[]; let ok=0, total=0;
  Object.values(groups).forEach(ix=>{ total++; let ed=0,ec=0,ud=0,uc=0; ix.forEach(i=>{ if(sc.slots[i].expect==='dot') ed++; else ec++; if(user[i]===1) ud++; else if(user[i]===2) uc++; });
    if(ud===ed&&uc===ec){ ok++; return; }
    let sd=Math.max(0,ud-ed), sx=Math.max(0,uc-ec);
    ix.forEach(i=>{ const u=user[i]; if(u===0) bad.push(i); else if(u===1&&sd>0){sd--;bad.push(i);} else if(u===2&&sx>0){sx--;bad.push(i);} }); });
  return {bad,ok,total};
}
function exMark(q){
  const P=q.P,a=q.a, parts=[], typeNames={ionic:'ionic',covalent:'covalent',metallic:'metallic'};
  parts.push({k:'Bond types',label:'Type of bonding',max:1,earned:a.type===P.type?1:0,detail:'Your answer: '+(a.type?typeNames[a.type]:'no answer')+'. Correct: '+P.type+'.'});
  if(P.type==='metallic'){
    parts.push({k:'Dot-and-cross',label:'Electrons released per atom',max:1,earned:parseInt(a.ne,10)===EL[P.M].ve?1:0,detail:'Your answer: '+(a.ne||'no answer')+'. Correct: '+EL[P.M].ve+'.'});
    parts.push({k:'Ion charges',label:'Charge on the ions',max:1,earned:a.chg===EL[P.M].ve+'+'?1:0,detail:'Your answer: '+(a.chg?chLabel(a.chg):'no answer')+'. Correct: '+chargeText(EL[P.M].ve,'+')+'.'});
  } else {
    parts.push({k:'Formulae',label:'Formula',max:1,earned:norm(a.f)===norm(P.plain)?1:0,detail:'Your answer: '+(a.f?a.f.replace(/</g,'&lt;'):'no answer')+'. Correct: '+P.html+'.'});
    const ev=exEval(q.sc,a.user), full=ev.ok===ev.total, e=full?3:Math.min(2,Math.floor(3*ev.ok/ev.total));
    q.ev=ev; parts.push({k:'Dot-and-cross',label:'Dot-and-cross diagram',max:3,earned:e,detail:ev.ok+' of '+ev.total+' ion or bond groups correct.'});
  }
  q.parts=parts; q.score=parts.reduce((n,p)=>n+p.earned,0); return q.score;
}
function exStart(){ exStop(); exBuild(); Object.assign(EXAM,{stage:'paper',i:0,res:null,confirm:false,left:EXAM.t*60}); exRun(); renderExam(); }
function exRun(){ if(EXAM.t>0) EXAM.timer=setInterval(()=>{ EXAM.left--; const el=$('extime'); if(el){ el.textContent=exFmt(EXAM.left); el.classList.toggle('low',EXAM.left<60); } if(EXAM.left<=0) exSubmit(); },1000); }
function exStop(){ clearInterval(EXAM.timer); EXAM.timer=0; }
const exFmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
function exSubmit(){
  exStop(); EXAM.list.forEach(exMark); EXAM.stage='results';
  EXAM.list.forEach(q=>q.parts.forEach(p=>progRec(p.k,p.earned===p.max)));
  renderExam();
}
function exDiagram(sc,o){ return drawScene(sc,o).replace(/class="hit" data-i="/g,'class="exhit" data-ei="'); }
function renderExam(){
  const box=$('exambox'); if(!box) return;
  if(EXAM.stage==='setup'){
    box.innerHTML='<div class="probhead"><h2>Written paper</h2></div><p class="q">A short paper of blank dot-and-cross questions. Each ionic or covalent question is out of 5 marks: type of bonding (1), formula (1) and the diagram (3). Metallic questions are out of 3. There are no hints, and you see the mark scheme when you hand in.</p>'
     +'<div class="cfg"><label>Questions<select id="exn">'+[3,5,8,10].map(n=>'<option'+(n===EXAM.n?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'
     +'<label>Time allowed<select id="ext">'+[[0,'No time limit'],[10,'10 minutes'],[20,'20 minutes'],[30,'30 minutes'],[45,'45 minutes']].map(a=>'<option value="'+a[0]+'"'+(a[0]===EXAM.t?' selected':'')+'>'+a[1]+'</option>').join('')+'</select></label>'
     +'<label>Bonding types<select id="exk">'+[['mixed','All types mixed'],['ionic','Ionic only'],['covalent','Covalent only'],['metallic','Metallic only']].map(a=>'<option value="'+a[0]+'"'+(a[0]===EXAM.kind?' selected':'')+'>'+a[1]+'</option>').join('')+'</select></label></div>'
     +'<div class="actions"><button class="btn" data-ex="start">Start the paper</button><button class="btn ghost" data-ex="print">Print a paper and mark scheme</button></div>'+progCard();
  } else if(EXAM.stage==='paper'){
    const q=EXAM.list[EXAM.i], P=q.P, a=q.a, last=EXAM.i===EXAM.list.length-1;
    const answered=x=>x.a.type!=='';
    let h='<div class="qhead"><b>Question '+(EXAM.i+1)+' of '+EXAM.list.length+'</b><span class="chip" style="cursor:default">['+q.max+' marks]</span><span class="spacer"></span>'+(EXAM.t>0?'<b id="extime" class="'+(EXAM.left<60?'low':'')+'">'+exFmt(EXAM.left)+'</b>':'')+'</div>';
    h+='<div class="exnav">'+EXAM.list.map((x,i)=>'<button class="exn'+(i===EXAM.i?' cur':'')+(answered(x)?' did':'')+'" data-exq="'+i+'" aria-label="Question '+(i+1)+(answered(x)?', started':'')+'">'+(i+1)+'</button>').join('')+'</div>';
    h+='<p class="q"><b>(a)</b> State the type of bonding in <b>'+P.name+'</b>. <span class="note">[1]</span></p><div class="chips" style="max-height:none;grid-template-columns:repeat(3,minmax(0,1fr))">'+['ionic','covalent','metallic'].map(t=>'<button class="chip" data-exa="'+t+'" aria-pressed="'+(a.type===t)+'">'+cap(t)+'</button>').join('')+'</div>';
    if(P.type==='metallic'){
      h+='<p class="q"><b>(b)</b> How many electrons does each <b>'+EL[P.M].n+'</b> atom release into the sea of electrons? <span class="note">[1]</span></p><div class="fld"><span>Electrons</span><input type="text" inputmode="numeric" id="exn2" value="'+a.ne+'" autocomplete="off"></div>'
       +'<p class="q"><b>(c)</b> What is the charge on each metal ion that forms? <span class="note">[1]</span></p><select id="exc"><option value="">Choose…</option>'+['1+','2+','3+'].map(v=>'<option value="'+v+'"'+(a.chg===v?' selected':'')+'>'+chLabel(v)+'</option>').join('')+'</select>';
    } else {
      h+='<p class="q"><b>(b)</b> Write the formula of <b>'+P.name+'</b>. <span class="note">[1]</span></p><div class="fld"><span>Formula</span><input type="text" id="exf" value="'+a.f.replace(/"/g,'&quot;')+'" autocomplete="off" spellcheck="false"><em>Type numbers normally, such as MgCl2</em></div>'
       +'<p class="q"><b>(c)</b> Complete the dot-and-cross diagram for <b>'+P.name+'</b>. Show the outer shell electrons only. <span class="note">[3]</span></p><div class="canvas">'+exDiagram(q.sc,{user:a.user,pre:[],interactive:true,label:'Blank dot-and-cross diagram'})+'</div><div class="legend">'+legendHTML(q.sc)+'</div><p class="note">Click a ring once for a dot, twice for a cross, a third time to clear it.</p>';
    }
    h+='<div class="actions" style="margin-top:14px"><button class="btn ghost" data-ex="prev"'+(EXAM.i===0?' disabled':'')+'>Previous</button>'+(last?'':'<button class="btn" data-ex="nextq">Next question</button>')
      +'<span class="spacer"></span><button class="btn'+(last?'':' ghost')+'" data-ex="submit">'+(EXAM.confirm?'Click again to hand in':'Hand in paper')+'</button></div>';
    if(EXAM.confirm){ const un=EXAM.list.filter(x=>!answered(x)).length; h+='<p class="msg bad">'+(un?un+' question'+(un>1?'s':'')+' not started. ':'')+'Click "Hand in paper" again to finish and see your marks.</p>'; }
    box.innerHTML=h;
  } else {
    const tot=EXAM.list.reduce((n,q)=>n+q.score,0), max=EXAM.list.reduce((n,q)=>n+q.max,0), pc=Math.round(100*tot/max);
    const by={}; EXAM.list.forEach(q=>q.parts.forEach(p=>{ const r=by[p.k]||(by[p.k]=[0,0]); r[0]+=p.earned; r[1]+=p.max; }));
    let h='<div class="probhead"><h2>Mark scheme and results</h2></div><p class="q big-f">'+tot+' / '+max+' <span class="progress">('+pc+'%)</span></p>'
     +'<table class="tbl"><tr><th>Skill</th><th>Marks</th></tr>'+Object.keys(by).map(k=>'<tr><td>'+k+'</td><td>'+by[k][0]+' of '+by[k][1]+'</td></tr>').join('')+'</table>';
    EXAM.list.forEach((q,i)=>{ h+='<div class="qa"><p class="q"><b>Question '+(i+1)+': '+cap(q.P.name)+'</b> <span class="chip" style="cursor:default">'+q.score+' / '+q.max+'</span></p><ul class="note" style="padding-left:18px;margin:4px 0">'+q.parts.map(p=>'<li>'+(p.earned===p.max?'✓ ':p.earned?'◐ ':'✗ ')+'<b>'+p.label+'</b> ('+p.earned+'/'+p.max+'): '+p.detail+'</li>').join('')+'</ul>';
      if(q.sc){ const ok=q.sc.slots.map(s=>s.expect==='dot'?1:2); h+='<div class="excmp"><div><p class="note"><b>Your diagram</b> (red rings show mistakes)</p>'+drawScene(q.sc,{user:q.a.user,pre:[],bad:q.ev.bad,label:'Your diagram'})+'</div><div><p class="note"><b>Mark scheme diagram</b></p>'+drawScene(q.sc,{user:ok,pre:[],label:'Correct diagram'})+'</div></div>'; }
      else h+='<p class="note">Each '+EL[q.P.M].n+' atom releases '+EL[q.P.M].ve+' outer electron'+(EL[q.P.M].ve>1?'s':'')+' and becomes '+q.P.M+'<sup>'+chargeText(EL[q.P.M].ve,'+')+'</sup>. The electrons are delocalised in a sea around the positive ions.</p>';
      h+='</div>'; });
    h+='<div class="actions"><button class="btn" data-ex="start">New paper</button><button class="btn ghost" data-ex="setup">Change settings</button></div>'+progCard();
    box.innerHTML=h;
  }
}
document.addEventListener('click',e=>{
  const hit=e.target.closest('.exhit'); if(hit&&EXAM.stage==='paper'){ const q=EXAM.list[EXAM.i], i=+hit.dataset.ei; q.a.user[i]=(q.a.user[i]+1)%3; renderExam(); const el=document.querySelector('.exhit[data-ei="'+i+'"]'); if(el) el.focus(); return; }
  const t=e.target.closest('[data-ex],[data-exq],[data-exa]'); if(!t) return;
  if(t.dataset.exa){ EXAM.list[EXAM.i].a.type=t.dataset.exa; renderExam(); return; }
  if(t.dataset.exq!==undefined){ EXAM.i=+t.dataset.exq; EXAM.confirm=false; renderExam(); return; }
  const v=t.dataset.ex;
  if(v==='start') exStart(); else if(v==='setup'){ exStop(); EXAM.stage='setup'; renderExam(); }
  else if(v==='prev'){ EXAM.i=Math.max(0,EXAM.i-1); EXAM.confirm=false; renderExam(); } else if(v==='nextq'){ EXAM.i=Math.min(EXAM.list.length-1,EXAM.i+1); EXAM.confirm=false; renderExam(); }
  else if(v==='submit'){ if(EXAM.confirm) exSubmit(); else { EXAM.confirm=true; renderExam(); } }
  else if(v==='print') exPrint();
});
document.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('exhit')){ e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click',{bubbles:true})); } });
document.addEventListener('input',e=>{ if(EXAM.stage!=='paper') return; const a=EXAM.list[EXAM.i]&&EXAM.list[EXAM.i].a; if(!a) return; if(e.target.id==='exf') a.f=e.target.value; else if(e.target.id==='exn2') a.ne=e.target.value; });
document.addEventListener('change',e=>{
  if(e.target.id==='exn') EXAM.n=+e.target.value; else if(e.target.id==='ext') EXAM.t=+e.target.value; else if(e.target.id==='exk') EXAM.kind=e.target.value;
  else if(e.target.id==='exc'&&EXAM.stage==='paper') EXAM.list[EXAM.i].a.chg=e.target.value;
});

/* printable paper and mark scheme */
function exPrint(){
  exBuild(); let pr=document.getElementById('examprint'); if(!pr){ pr=document.createElement('div'); pr.id='examprint'; document.body.appendChild(pr); }
  const L=EXAM.list; let h='<h1>Bonding paper</h1><p>Name: ______________________ &nbsp; Date: ____________ &nbsp; Time allowed: '+(EXAM.t?EXAM.t+' minutes':'—')+' &nbsp; Total: ____ / '+L.reduce((n,q)=>n+q.max,0)+'</p><p>In dot-and-cross diagrams use a dot (•) for electrons from one atom or ion and a cross (×) for electrons from the other. Show outer shells only.</p>';
  L.forEach((q,i)=>{ const P=q.P; h+='<div class="expq"><p><b>'+(i+1)+'.</b> <b>'+cap(P.name)+'</b></p><p>(a) State the type of bonding. ________________________ [1]</p>'
    +(P.type==='metallic'?'<p>(b) How many electrons does each '+EL[P.M].n+' atom release? ________ [1]</p><p>(c) State the charge on each metal ion. ________ [1]</p>':'<p>(b) Write the formula. ________________________ [1]</p><p>(c) Complete the dot-and-cross diagram. [3]</p><div class="exprd">'+drawScene(q.sc,{user:q.a.user,pre:[],label:'Blank diagram'})+'</div>')+'</div>'; });
  h+='<div class="exbreak"><h1>Mark scheme</h1>';
  L.forEach((q,i)=>{ const P=q.P; h+='<div class="expq"><p><b>'+(i+1)+'. '+cap(P.name)+'</b></p><p>(a) '+cap(P.type)+' [1]</p>';
    if(P.type==='metallic') h+='<p>(b) '+EL[P.M].ve+' [1]</p><p>(c) '+chargeText(EL[P.M].ve,'+')+' [1]</p>';
    else h+='<p>(b) '+P.html+' [1]</p><p>(c) [3] Award marks for each correct part of the diagram, with full marks only if every electron is correct.</p><div class="exprd">'+drawScene(q.sc,{user:q.sc.slots.map(s=>s.expect==='dot'?1:2),pre:[],label:'Correct diagram'})+'</div>';
    h+='</div>'; });
  h+='</div>';
  pr.innerHTML=h; document.body.classList.add('printexam'); try{ window.print(); }catch(err){} document.body.classList.remove('printexam');
}

/* ---------- Teacher tools: present mode ---------- */
(function(){
  const css=document.createElement('style');
  css.textContent='.exnav{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.exn{width:34px;height:34px;border-radius:8px;border:1.5px solid var(--line);background:var(--panel);color:var(--ink);cursor:pointer;font-weight:600}.exn.did{border-color:var(--ok);background:var(--okbg)}.exn.cur{outline:2px solid var(--ink)}'
  +'.exhit{fill:transparent;cursor:pointer}.excmp{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin-top:6px}#extime{font:700 18px var(--f-mono,monospace)}#extime.low{color:var(--bad)}'
  +'.progcard{margin-top:18px;border-top:1px solid var(--line);padding-top:12px}.progcard h3{margin:0 0 2px}.progrow{display:grid;grid-template-columns:150px 1fr 120px;gap:10px;align-items:center;font-size:13.5px;margin:5px 0}.progbar{height:9px;background:var(--grid);border-radius:5px;overflow:hidden}.progbar i{display:block;height:100%;background:var(--ink2)}.progbar i.ok{background:var(--ok)}.progbar i.mid{background:var(--warn)}.progbar i.low{background:var(--bad)}.progn{font-size:12px;color:var(--ink2)}'
  +'@media(max-width:560px){.progrow{grid-template-columns:110px 1fr 90px}}'
  +'.cfg .chk{flex-direction:row;align-items:center;gap:8px;font-size:14px;color:var(--ink)}.qa .chip,.qhead .chip{display:inline-flex;width:auto}.qopt.cls{cursor:default}.sheetblank .tbl td{color:transparent!important;height:34px;user-select:none}.sheetblank .tbl td *{color:transparent!important}'
  +'#prbtn{position:absolute;right:0;top:4px;border:1.5px solid var(--line);background:var(--panel);color:var(--ink);border-radius:999px;padding:6px 14px;font-size:13px;font-weight:600;cursor:pointer}#prbtn[aria-pressed=true]{background:var(--ink);color:var(--paper)}'
  +'body.present .wrap .wrap,body.present header,body.present .views{zoom:1.22}body.present [data-act=dhint],body.present [data-act=dreveal],body.present [data-act=dpeek],body.present [data-act=hint],body.present [data-act=reveal],body.present [data-dlx=help],body.present [data-grx=hint],body.present [data-grx=show]{display:none!important}'
  +'#examprint{display:none}@media print{body.printexam .wrap,body.printexam #ptbtn,body.printexam #ptp{display:none!important}body.printexam #examprint{display:block;color:#111;background:#fff;padding:10mm;font:14px/1.5 sans-serif}.expq{break-inside:avoid;margin-bottom:16px}.exbreak{break-before:page}.exprd svg{width:340px!important;max-width:100%}#prbtn{display:none!important}}';
  document.head.appendChild(css);
  const hd=document.querySelector('header'); if(hd){ hd.style.position='relative'; const b=document.createElement('button'); b.id='prbtn'; b.type='button'; b.setAttribute('aria-pressed','false'); b.textContent='Present mode'; b.title='Bigger display for projecting. Hides hints and show-answer buttons.';
    b.addEventListener('click',()=>{ const on=!document.body.classList.contains('present'); document.body.classList.toggle('present',on); b.setAttribute('aria-pressed',String(on)); b.textContent=on?'Present mode: on':'Present mode'; }); hd.appendChild(b); }
})();
