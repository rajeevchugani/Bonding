
/* ---------- Class quiz ---------- */
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a;};
function mcq(topic,p,correct,wrongs,why){
  const w=shuffle([...new Set(wrongs)].filter(x=>x!==correct)).slice(0,3), o=shuffle([correct,...w]);
  return {topic,p,o,a:o.indexOf(correct),why};
}
const BT=[['NaCl','ionic'],['MgO','ionic'],['CaCl2','ionic'],['K2O','ionic'],['H2O','covalent'],['CH4','covalent'],['CO2','covalent'],['NH3','covalent'],['HCl','covalent'],['Cu','metallic'],['Fe','metallic'],['Al','metallic'],['Zn','metallic'],['Cl2','covalent']];
const SP=[['H2',1],['Cl2',1],['O2',2],['N2',3],['HCl',1],['H2O',2],['NH3',3],['CH4',4],['CO2',4],['C2H4',6]];
const WHYBT={ionic:'It is a metal bonded to a non-metal, so electrons are transferred.',covalent:'It contains only non-metals, so electrons are shared.',metallic:'It is a metal element: positive ions in a sea of delocalised electrons.'};
const GENS=[
 ()=>{ const [f,t]=rnd(BT); return mcq('Bond types','What type of bonding is in '+sub(f)+'?',cap(t),['Ionic','Covalent','Metallic'].filter(x=>x!==cap(t)).concat(['Hydrogen']),WHYBT[t]); },
 ()=>{ const i=rnd(Math.random()<.5?CATS.filter(c=>!c.poly):ANS.filter(c=>!c.poly)), s=i.cat?'+':'−', ch=chargeText(i.q,s); return mcq('Ion charges','What is the charge on a '+i.name+' ion ('+sub(i.plain)+')?',ch,['1+','2+','3+','1−','2−','3−'],i.name+' forms an ion with a charge of '+ch+'.'); },
 ()=>{ const co=compose(rnd(CATS),rnd(ANS)), c=co.c,a=co.a;
   const sw=part(c,co.na)+part(a,co.nc), nb=c.plain+co.nc+a.plain+co.na, one=c.plain+a.plain;
   return mcq('Formulae','What is the formula of '+co.name+'?',co.html,[sub(sw),sub(nb),sub(one),sub(part(c,co.nc+1)+part(a,co.na))].map(x=>x),'Balance the charges: '+co.nc+' × '+chargeText(c.q,'+')+' with '+co.na+' × '+chargeText(a.q,'−')+'. '+((c.poly&&co.nc>1)||(a.poly&&co.na>1)?'Brackets go round a group ion when more than one is needed.':'')); },
 ()=>{ const [f,n]=rnd(SP); return mcq('Covalent bonding','How many shared pairs of electrons are there in '+sub(f)+'?',String(n),['1','2','3','4','6'],'Count the shared pairs between atoms: a single bond is 1, a double bond is 2 and a triple bond is 3.'); },
 ()=>{ const g=rnd(GS), q=rnd(questions(g)); return mcq('Giant structures',q.p.replace(/\?$/,'')+' ('+g.name+')?',q.o[g.ans[q.id]],q.o,'For '+g.name.toLowerCase()+': '+q.o[g.ans[q.id]].toLowerCase()+'.'); },
 ()=>{ const m=rnd(SH), q=rnd(shQs(m)); return {topic:'Molecule shapes',p:q.p,o:q.o,a:q.a,why:q.why}; },
 ()=>{ const q=rnd(alQs()); return {topic:'Alloys',p:q.p,o:q.o,a:q.a,why:q.why}; }
];
let cq={stage:'setup',n:10,t:30,big:false,weak:false,cls:false,list:[],i:0,sel:-1,score:0,res:[],timer:0,left:0};
function cqStop(){ clearInterval(cq.timer); cq.timer=0; document.removeEventListener('keydown',cqKey); }
function cqBuild(){
  const L=[]; let guard=0;
  while(L.length<cq.n&&guard++<400){ const q=GENS[cq.weak?progPick():L.length%GENS.length](); if(!L.some(x=>x.p===q.p)) L.push(q); }
  cq.list=shuffle(L);
}
function cqStart(){ cqStop(); cqBuild(); Object.assign(cq,{stage:'play',i:0,sel:-1,score:0,res:[]}); cqNext(0); }
function cqNext(i){
  cq.i=i; cq.sel=-1; cq.left=cq.t; clearInterval(cq.timer); cq.timer=0;
  renderQuiz(); document.removeEventListener('keydown',cqKey); document.addEventListener('keydown',cqKey);
  if(cq.t>0) cq.timer=setInterval(()=>{ cq.left-=0.1; if(cq.left<=0){ cq.left=0; cqAnswer(-2); } else cqTick(); },100);
}
function cqTick(){ const b=document.querySelector('#quizbox .tbar'); if(!b) return; b.firstElementChild.style.width=(100*cq.left/cq.t)+'%'; b.classList.toggle('low',cq.left<=cq.t*.25); const s=document.getElementById('cqsec'); if(s) s.textContent=Math.ceil(cq.left)+'s'; }
function cqAnswer(k){
  if(cq.sel!==-1||cq.stage!=='play') return; clearInterval(cq.timer); cq.timer=0;
  const q=cq.list[cq.i]; if(cq.cls){ cq.sel=-3; renderQuiz(); return; }
  cq.sel=k; const ok=k===q.a; if(ok) cq.score++; progRec(q.topic,ok);
  cq.res.push({q,k,ok}); renderQuiz();
}
function cqKey(e){
  if(!$('quiz')||$('quiz').hidden){ cqStop(); return; }
  if(/INPUT|SELECT|TEXTAREA/.test((e.target||{}).tagName||'')) return;
  if(cq.cls){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); if(cq.sel===-1) cqAnswer(-3); else cqAdvance(); } return; }
  const n=+e.key; if(n>=1&&n<=4&&cq.sel===-1) cqAnswer(n-1);
  else if((e.key==='Enter'||e.key===' ')&&cq.sel!==-1){ e.preventDefault(); cqAdvance(); }
}
function cqAdvance(){ if(cq.i+1>=cq.list.length){ cqStop(); cq.stage='end'; renderQuiz(); } else cqNext(cq.i+1); }
function renderQuiz(){
  const box=$('quizbox'); if(!box) return;
  if(cq.stage!=='play') cqStop();
  box.className='card'+((cq.big||cq.cls)?' big':'');
  if(cq.stage==='setup'){
    box.innerHTML='<div class="probhead"><h2>Quick quiz</h2></div><p class="q">A mixed quiz on bond types, ions, formulae, covalent bonding, giant structures, molecule shapes and alloys. Use the number keys 1 to 4 to answer.</p>'
     +'<div class="cfg"><label>Questions<select id="cqn">'+[5,10,15,20].map(n=>'<option'+(n===cq.n?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'
     +'<label>Time per question<select id="cqt">'+[[0,'No timer'],[20,'20 seconds'],[30,'30 seconds'],[60,'60 seconds']].map(a=>'<option value="'+a[0]+'"'+(a[0]===cq.t?' selected':'')+'>'+a[1]+'</option>').join('')+'</select></label>'
     +'<label class="chk"><input type="checkbox" id="cqb"'+(cq.big?' checked':'')+'> Large text for a projector</label><label class="chk"><input type="checkbox" id="cqw"'+(cq.weak?' checked':'')+'> Focus on my weak topics</label><label class="chk"><input type="checkbox" id="cqc"'+(cq.cls?' checked':'')+'> Whole-class mode: I reveal each answer</label></div><div class="actions"><button class="btn" data-cq="start">Start quiz</button></div>'+progCard();
  } else if(cq.stage==='play'){
    const q=cq.list[cq.i], ans=cq.sel!==-1;
    box.innerHTML='<div class="qhead"><b>Question '+(cq.i+1)+' of '+cq.list.length+'</b><span class="chip" style="cursor:default">'+q.topic+'</span><span class="spacer"></span><span class="progress">'+(cq.cls?'':'Score '+cq.score)+'</span>'+(cq.t>0?'<b id="cqsec">'+Math.ceil(cq.left)+'s</b>':'')+'</div>'
     +(cq.t>0?'<div class="tbar'+(cq.left<=cq.t*.25?' low':'')+'"><i style="width:'+(100*cq.left/cq.t)+'%"></i></div>':'')
     +'<p class="q"><b>'+q.p+'</b></p><div class="qopts">'+q.o.map((t,k)=>cq.cls?'<div class="qopt cls'+(ans&&k===q.a?' ok':'')+'"><b>'+'ABCD'[k]+'</b> '+t+'</div>':'<button class="qopt'+(ans&&k===q.a?' ok':'')+(ans&&k===cq.sel&&k!==q.a?' bad':'')+'" data-cq="a'+k+'"'+(ans?' disabled':'')+'><b>'+(k+1)+'</b> '+t+'</button>').join('')+'</div>'
     +(cq.cls&&!ans?'<div class="actions"><button class="btn" data-cq="reveal">Reveal answer</button></div>':'')+(ans?'<div class="explain"><p><b>'+(cq.cls?'Answer: '+'ABCD'[q.a]+'.':cq.sel===q.a?'Correct.':cq.sel===-2?'Out of time.':'Not quite.')+'</b> '+q.why+'</p></div><div class="actions"><button class="btn" data-cq="next">'+(cq.i+1>=cq.list.length?'See results':'Next question')+'</button></div>':'');
  } else if(cq.cls){
    box.innerHTML='<div class="probhead"><h2>Quiz complete</h2></div><p class="q">Recap of the questions and answers:</p>'+cq.list.map((q,i)=>'<div class="qa"><p class="q"><b>'+(i+1)+'. '+q.p+'</b></p><p>Answer: <b>'+q.o[q.a]+'</b></p></div>').join('')+'<div class="actions"><button class="btn" data-cq="start">Play again</button><button class="btn ghost" data-cq="setup">Change settings</button></div>';
  } else {
    const by={}; cq.res.forEach(r=>{ const t=r.q.topic; by[t]=by[t]||[0,0]; by[t][1]++; if(r.ok) by[t][0]++; });
    const wrong=cq.res.filter(r=>!r.ok), pc=Math.round(100*cq.score/cq.list.length);
    box.innerHTML='<div class="probhead"><h2>Results</h2></div><p class="q big-f">'+cq.score+' / '+cq.list.length+' <span class="progress">('+pc+'%)</span></p>'
     +'<table class="tbl"><tr><th>Topic</th><th>Correct</th></tr>'+Object.keys(by).map(t=>'<tr><td>'+t+'</td><td>'+by[t][0]+' of '+by[t][1]+'</td></tr>').join('')+'</table>'
     +(wrong.length?'<h3 style="margin-top:14px">Review your mistakes</h3>'+wrong.map(r=>'<div class="qa"><p class="q"><b>'+r.q.p+'</b></p><p>Correct answer: <b>'+r.q.o[r.q.a]+'</b></p><div class="explain"><p>'+r.q.why+'</p></div></div>').join(''):'<p class="msg ok">Full marks. Well done.</p>')
     +'<div class="actions"><button class="btn" data-cq="start">Play again</button><button class="btn ghost" data-cq="setup">Change settings</button></div>';
  }
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-cq]'); if(!t) return; const v=t.dataset.cq;
  if(v==='start') cqStart(); else if(v==='setup'){ cqStop(); cq.stage='setup'; renderQuiz(); }
  else if(v==='next') cqAdvance(); else if(v==='reveal') cqAnswer(-3); else if(v[0]==='a') cqAnswer(+v.slice(1));
});
document.addEventListener('change',e=>{
  if(e.target.id==='cqn') cq.n=+e.target.value; else if(e.target.id==='cqt') cq.t=+e.target.value;
  else if(e.target.id==='cqw') cq.weak=e.target.checked; else if(e.target.id==='cqc') cq.cls=e.target.checked;
  else if(e.target.id==='cqb'){ cq.big=e.target.checked; $('quizbox').className='card'+(cq.big?' big':''); }
});
document.addEventListener('click',e=>{ if(e.target.closest('[data-view]')&&cq.stage==='play'&&e.target.closest('[data-view]').dataset.view!=='quiz'){ cqStop(); cq.stage='setup'; } },true);
