/* ---------- State ---------- */
const $=id=>document.getElementById(id);
const MODES={
  worked:{label:'Worked',lvl:0,blurb:'Watch each step worked out while the diagram builds. Nothing to fill in.'},
  guided:{label:'Guided',lvl:1,blurb:'A few blanks with hints on every step. The diagram is mostly drawn and you fill the gaps.'},
  practice:{label:'Practice',lvl:2,blurb:'More blanks. Hints are there if you get stuck, and you can peek at the separate atoms.'},
  challenge:{label:'Challenge',lvl:3,blurb:'Everything is blank, even the formula. No hints and no peeking. Scored on first tries.'}
};
const BLANK={worked:[],guided:['ion','ratio','need','lone'],practice:['ve','xf','ion','ratio','need','bond','lone'],challenge:['ve','xf','ion','ratio','need','bond','lone','formula']};
const PRE={worked:1,guided:.6,practice:.25,challenge:0};
const CH=[['','Choose…'],['1+','+'],['2+','2+'],['3+','3+'],['1-','−'],['2-','2−'],['3-','3−']];
const TYPES=[['ionic','Ionic bonding'],['covalent','Covalent bonding'],['metallic','Metallic bonding']];
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
let mode='guided', tab='list', custom={e1:'Na',e2:'Cl'}, customMsg='', P=null, G=null, STEPS=[];

function rng(str){ let h=2166136261; for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);} let a=h>>>0;
  return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}; }
const norm=s=>String(s).replace(/\s+/g,'').replace(/[₀-₉]/g,c=>String(c.charCodeAt(0)-0x2080));
const ionCfg=e=>EL[e].cfg.split(',').slice(0,-1).join(',');
const anCfg=e=>{const p=EL[e].cfg.split(',');p[p.length-1]='8';return p.join(',');};
const chLabel=v=>(CH.find(c=>c[0]===v)||[0,''])[1];

/* ---------- Step definitions ---------- */
function stepsFor(P){
  const L=[], els=P.els;
  const numF=(id,label,answer,suffix)=>({id,label,kind:'num',answer,suffix});
  L.push({id:'type',title:'Decide the type of bonding',
    q:'Which type of bonding holds <b>'+P.name+'</b> together? Elements involved: '+els.map(e=>'<b>'+e+'</b> ('+EL[e].n+')').join(', ')+'.',
    fields:[{id:'type',kind:'choice',answer:P.type}],
    hints:['Is each element a metal or a non-metal? Metals sit on the left and in the middle of the periodic table.','Metal + non-metal: electrons move across. Non-metals only: electrons are shared. A metal on its own: electrons are pooled.'],
    explain:()=>P.type==='ionic'?'<p><b>'+P.M+'</b> is a <b>metal</b> and <b>'+P.X+'</b> is a <b>non-metal</b>. The metal gives electrons to the non-metal, so the particles become oppositely charged ions: <b>ionic bonding</b>.</p>'
      :P.type==='covalent'?'<p>Every atom here is a <b>non-metal</b> ('+els.join(', ')+'). Non-metal atoms share pairs of electrons: <b>covalent bonding</b>.</p>'
      :'<p><b>'+P.name+'</b> is a <b>metal</b> on its own, so there is no non-metal to take its electrons. The atoms pool their outer electrons: <b>metallic bonding</b>.</p>'});
  L.push({id:'ve',title:'Count the outer electrons',q:'How many electrons are in the outer shell of each atom?',
    fields:els.map(e=>numF('ve_'+e,e+' atom',EL[e].ve,'outer-shell electron(s)')),
    hints:['Use the group number, or the last number in the electronic structure.','Electronic structures: '+els.map(e=>e+' = <code>'+EL[e].cfg+'</code>').join(', ')+'.'],
    explain:()=>els.map(e=>'<p><b>'+e+'</b>: electronic structure <code>'+EL[e].cfg+'</code>, so <b>'+EL[e].ve+'</b> outer electron'+(EL[e].ve>1?'s':'')+'.</p>').join('')});
  if(P.type==='ionic'){
    const {M,X,cm,an,a,b}=P;
    L.push({id:'xf',title:'Move the electrons',q:'Each atom changes until its outer shell is full. How many electrons does each one lose or gain?',
      fields:[numF('xf_m',M+' atom loses',cm,'electron(s)'),numF('xf_n',X+' atom gains',an,'electron(s)')],
      hints:['Metals lose electrons and non-metals gain them, until the outer shell is full.','Take the metal’s outer electrons away, or add enough to the non-metal to reach 8.'],
      explain:()=>'<p><b>'+M+'</b> loses '+cm+': <code>'+EL[M].cfg+'</code> → <code>'+ionCfg(M)+'</code>, a full shell.</p><p><b>'+X+'</b> gains '+an+': <code>'+EL[X].cfg+'</code> → <code>'+anCfg(X)+'</code>, a full shell.</p>'});
    L.push({id:'ion',title:'Write the ion charges',q:'What charge does each ion have?',
      fields:[{id:'ch_m',label:M+' ion',kind:'sel',answer:cm+'+'},{id:'ch_n',label:X+' ion',kind:'sel',answer:an+'-'}],
      hints:['Losing electrons leaves more protons than electrons, so the ion is positive. Gaining makes it negative.','The size of the charge is the number of electrons lost or gained.'],
      explain:()=>'<p><b>'+M+'</b>: '+EL[M].z+' protons, '+(EL[M].z-cm)+' electrons → <b>'+chargeText(cm,'+')+'</b>.</p><p><b>'+X+'</b>: '+EL[X].z+' protons, '+(EL[X].z+an)+' electrons → <b>'+chargeText(an,'-')+'</b>.</p>'});
    L.push({id:'ratio',title:'Balance the charges',q:'How many of each ion are needed so the total positive and negative charges cancel?',
      fields:[numF('n_m','number of '+M+' ions',a,''),numF('n_x','number of '+X+' ions',b,'')],
      hints:['Total positive charge must equal total negative charge.','Find numbers so that (number of '+M+' ions × '+cm+') = (number of '+X+' ions × '+an+').'],
      explain:()=>'<p>'+a+' × ('+chargeText(cm,'+')+') = '+a*cm+'+ and '+b+' × ('+chargeText(an,'-')+') = '+b*an+'−. The charges cancel, so the ratio is <b>'+a+' : '+b+'</b>.</p><p>Formula: <b>'+P.html+'</b></p>'});
  } else if(P.type==='covalent'){
    const sc=covScene(P,'final'); P._sc=sc;
    const full=e=>e==='H'?2:8;
    L.push({id:'need',title:'Work out the bonds each atom forms',q:'How many more electrons does each atom need for a full outer shell? That is also how many bonds it forms.',
      fields:els.map(e=>numF('nd_'+e,e+' needs',full(e)-EL[e].ve,'more electron(s)')),
      hints:['A full outer shell has 8 electrons. Hydrogen only needs 2.','Subtract the outer electrons from the full shell.'],
      explain:()=>els.map(e=>'<p><b>'+e+'</b>: '+EL[e].ve+' outer electron'+(EL[e].ve>1?'s':'')+', full shell '+full(e)+' → needs <b>'+(full(e)-EL[e].ve)+'</b> → forms '+(full(e)-EL[e].ve)+' bond'+((full(e)-EL[e].ve)>1?'s':'')+'.</p>').join('')});
    const kinds=[]; sc.bonds.forEach(bd=>{ const A=sc.atoms[bd.a].sym,B=sc.atoms[bd.b].sym; const k=[A,B].sort().join('-'); if(!kinds.find(x=>x.k===k)) kinds.push({k,A,B,order:bd.order}); });
    const W=['','single','double','triple'];
    L.push({id:'bond',title:'Count the shared pairs',q:'How many pairs of electrons are shared in each type of bond?',
      fields:kinds.map(k=>numF('bd_'+k.k,'each '+k.A+'–'+k.B+' bond',k.order,'shared pair(s)')),
      hints:['Each atom must share enough electrons to fill its outer shell.','One shared pair is a single bond, two is a double bond, three is a triple bond.'],
      explain:()=>kinds.map(k=>'<p><b>'+k.A+'–'+k.B+'</b>: '+k.order+' shared pair'+(k.order>1?'s':'')+' → a '+W[k.order]+' bond.</p>').join('')});
    const lone=els.map(e=>sc.atoms.find(a=>a.sym===e));
    L.push({id:'lone',title:'Find the lone pairs',q:'How many lone pairs (pairs not used in bonding) does each atom have?',
      fields:lone.map(a=>numF('lp_'+a.sym,a.sym+' atom',a.lone,'lone pair(s)')),
      hints:['Outer electrons minus the electrons used in bonds. Pairs of what is left are lone pairs.','Lone pairs = (outer electrons − electrons used in bonds) ÷ 2.'],
      explain:()=>lone.map(a=>'<p><b>'+a.sym+'</b>: '+EL[a.sym].ve+' outer − '+a.bondSum+' in bonds = '+(EL[a.sym].ve-a.bondSum)+' left → <b>'+a.lone+'</b> lone pair'+(a.lone!==1?'s':'')+'.</p>').join('')});
  } else {
    const M=P.M, v=EL[M].ve;
    L.push({id:'ion',title:'Find the ion charge',q:'The atoms release their outer electrons into the structure. What charge is left on each metal ion?',
      fields:[{id:'ch_m',label:M+' ion',kind:'sel',answer:v+'+'}],
      hints:['Each atom gives up its outer electrons, so what is left is positive.','The charge equals the number of electrons released.'],
      explain:()=>'<p><b>'+M+'</b> releases '+v+' electron'+(v>1?'s':'')+', so each ion is <b>'+chargeText(v,'+')+'</b>.</p>'});
  }
  L.push({id:'formula',title:'Write the formula',q:'Write the formula for <b>'+P.name+'</b>.',
    fields:[{id:'formula',label:'Formula',kind:'text',answer:P.plain}],
    hints:[P.type==='ionic'?'Metal first, then non-metal. Put the ratio as small numbers after each symbol. No charges.':'Count the atoms of each element in one molecule and write the numbers after the symbols.','A 1 is never written.'],
    explain:()=>'<p><b>'+P.html+'</b></p>',only:'challenge'});
  return L.filter(s=>!s.only||s.only===mode);
}
const diagExplain=()=>P.type==='ionic'?'<p>Draw each ion in square brackets with its charge. Metal electrons are crosses, the non-metal’s own electrons are dots, and the electrons it gained show as crosses. Every ion ends with a full outer shell.</p>'
  :P.type==='covalent'?'<p>Draw the shared pairs where the shells overlap, one dot and one cross in each pair. Then add the lone pairs on the outside. Every atom ends with a full outer shell.</p>'
  :'<p>Draw a regular lattice of positive ions. The outer electrons are delocalised, so they move freely through the whole structure.</p>';
const propsText=()=>P.type==='ionic'?'<b>Why it matters:</b> strong attraction between oppositely charged ions in a giant lattice, so a high melting point. It conducts electricity only when molten or dissolved, because the ions are then free to move.'
  :P.type==='covalent'?'<b>Why it matters:</b> strong covalent bonds inside each molecule but weak forces between molecules, so a low melting and boiling point. It does not conduct electricity because there are no free charged particles.'
  :'<b>Why it matters:</b> the delocalised electrons carry charge, so metals conduct electricity. The layers of ions slide over each other, so metals are malleable.';

/* ---------- Problem lifecycle ---------- */
const isBlank=id=>mode!=='worked'&&(id==='type'||BLANK[mode].includes(id));
function setProblem(p){
  P=p; STEPS=stepsFor(P);
  G={ss:{},fv:{},fs:{},hint:{},wrong:{},typeDone:mode==='worked',widx:0,finished:false,dg:null};
  initDiag(); renderAll();
}
function initDiag(){
  const dg={user:[],pre:[],bad:[],hinted:[],msg:'',msgOk:false,hint:0,attempts:0,helped:false,first:false,done:false,peek:false,n:0,view:'dc',lone:false,orders:[],lres:null,lok:false,lmsg:''};
  if(P.type==='covalent') dg.orders=covScene(P,'atoms').bonds.map(()=>1);
  if(P.type!=='metallic'){
    const sc=P.type==='ionic'?ionScene(P,'final'):covScene(P,'final');
    const N=sc.slots.length;
    if(mode==='worked'){ dg.pre=sc.slots.map(()=>true); }
    else {
      const r=rng(P.plain+mode), idx=sc.slots.map((_,i)=>i).sort(()=>r()-.5);
      const k=Math.min(Math.round(N*PRE[mode]),N-1);
      dg.pre=sc.slots.map(()=>false); idx.slice(0,k).forEach(i=>dg.pre[i]=true);
    }
    dg.user=sc.slots.map((s,i)=>dg.pre[i]?(s.expect==='dot'?1:2):0);
  } else if(mode==='worked'){ dg.n=EL[P.M].ve; }
  G.dg=dg;
}
function tasks(){ const ids=STEPS.filter(s=>isBlank(s.id)).map(s=>s.id); return ids.concat(['diagram']); }
function doneCount(){ return tasks().filter(id=>id==='diagram'?G.dg.done:(G.ss[id]||{}).done).length; }
function firstCount(){ return tasks().filter(id=>id==='diagram'?G.dg.first:(G.ss[id]||{}).first).length; }
function cmp(f,v){ if(f.kind==='num') return v!==''&&parseInt(v,10)===f.answer; if(f.kind==='text') return norm(v)===norm(f.answer); return v===f.answer; }
const ssOf=id=>G.ss[id]||(G.ss[id]={attempts:0,helped:false,done:false,first:false,msg:''});

/* ---------- Rendering: header, modes, picker ---------- */
function renderModes(){
  $('modes').innerHTML=Object.keys(MODES).map(k=>'<button class="mode" role="radio" aria-checked="'+(k===mode)+'" data-mode="'+k+'"><b>'+MODES[k].label+'</b><span class="meter" title="Blanks to fill">'
    +[1,2,3].map(i=>'<i class="'+(i<=MODES[k].lvl?'on':'')+'"></i>').join('')+'</span></button>').join('');
  $('blurb').textContent=MODES[mode].blurb;
}
function renderPicker(){
  const els=Object.keys(EL).sort((a,b)=>EL[a].z-EL[b].z);
  const opt=(sel,none)=>(none?'<option value="">(none)</option>':'')+els.map(e=>'<option value="'+e+'"'+(sel===e?' selected':'')+'>'+e+' – '+EL[e].n+'</option>').join('');
  let h='<div class="tabs" role="tablist"><button class="tab" role="tab" aria-selected="'+(tab==='list')+'" data-tab="list">Standard list</button><button class="tab" role="tab" aria-selected="'+(tab==='build')+'" data-tab="build">Build your own</button><span class="spacer"></span><button class="btn ghost" data-act="random">Surprise me</button></div>';
  if(tab==='list') h+='<div class="chips">'+LIST.map((p,i)=>'<button class="chip" data-i="'+i+'" aria-pressed="'+(P&&P.plain===p.plain&&P.type===p.type)+'"><span class="f">'+p.html+'</span><span class="n">'+p.name+'</span></button>').join('')+'</div>';
  else h+='<div class="builder"><label>Element 1<select id="e1">'+opt(custom.e1,false)+'</select></label><label>Element 2<select id="e2">'+opt(custom.e2,true)+'</select></label></div><p class="note'+(customMsg?' err':'')+'">'+(customMsg||'Pick two elements and the lab works out the substance. Choose a metal alone for a metal, or the same non-metal twice for a diatomic molecule.')+'</p>';
  $('picker').innerHTML=h;
}

/* ---------- Rendering: steps ---------- */
function fieldHTML(f,st,state){ // state: 'open' | 'locked' | 'done' | 'given'
  const v=G.fv[f.id]??'', s=G.fs[f.id]||'';
  if(f.kind==='choice'){
    return '<div class="choices">'+TYPES.map(t=>'<button class="choice'+(state==='done'&&t[0]===f.answer?' ok':'')+(G.wrong[t[0]]&&state!=='done'?' bad':'')+'" data-act="choose" data-val="'+t[0]+'"'+(state!=='open'?' disabled':'')+'>'+t[1]+'</button>').join('')+'</div>';
  }
  if(state==='given'||state==='done'&&false){ const lab=f.kind==='sel'?chLabel(f.answer):f.answer; return '<div class="fld"><span>'+f.label+'</span><span class="given">'+lab+'</span><em>'+(f.suffix||'')+'</em></div>'; }
  const dis=state!=='open'?' disabled':'';
  let ctl;
  if(f.kind==='sel') ctl='<select id="f_'+f.id+'" data-f="'+f.id+'" class="'+s+'"'+dis+'>'+CH.map(c=>'<option value="'+c[0]+'"'+(v===c[0]?' selected':'')+'>'+c[1]+'</option>').join('')+'</select>';
  else if(f.kind==='text') ctl='<input type="text" id="f_'+f.id+'" data-f="'+f.id+'" class="'+s+'" value="'+String(v).replace(/"/g,'&quot;')+'" autocomplete="off" spellcheck="false"'+dis+'>';
  else ctl='<input type="number" id="f_'+f.id+'" data-f="'+f.id+'" class="'+s+'" min="0" max="9" value="'+v+'"'+dis+'>';
  return '<div class="fld"><span>'+f.label+'</span>'+ctl+'<em>'+(f.suffix||'')+'</em></div>';
}
function stepCard(st,n){
  const blank=isBlank(st.id), ss=ssOf(st.id), locked=st.id!=='type'&&!G.typeDone;
  const state=!blank?'given':ss.done?'done':locked?'locked':'open';
  const pill=state==='given'?'<span class="pill">Given</span>':state==='done'?'<span class="pill ok">Done</span>':state==='locked'?'<span class="pill">Locked</span>':'';
  let h='<section class="card step '+(state==='done'||state==='given'?'done':'')+(state==='locked'?' locked':'')+'" data-step="'+st.id+'"><header><span class="tag">'+n+'</span><h3>'+st.title+'</h3>'+pill+'</header>';
  h+='<p class="q">'+st.q+'</p><div class="fields">'+st.fields.map(f=>fieldHTML(f,st,state)).join('')+'</div>';
  if(state==='open'||state==='locked'){
    const hb=mode!=='challenge';
    h+='<div class="actions">'+(st.id==='type'?'':'<button class="btn" data-act="check" data-step="'+st.id+'"'+(state==='locked'?' disabled':'')+'>Check</button>')
      +(hb?'<button class="btn ghost" data-act="hint" data-step="'+st.id+'"'+(state==='locked'?' disabled':'')+'>Hint</button><button class="btn ghost" data-act="reveal" data-step="'+st.id+'"'+(state==='locked'?' disabled':'')+'>Show answer</button>':'')+'</div>';
    if(ss.msg&&state==='open') h+='<p class="msg bad">'+ss.msg+'</p>';
    const hn=G.hint[st.id]||0; if(hn>0&&state==='open') h+='<div class="hintbox">'+st.hints.slice(0,hn).join('<br>')+'</div>';
  }
  if(state==='done'||state==='given'){
    h+='<div class="explain">'+st.explain()+'</div>';
  }
  return h+'</section>';
}
function renderSteps(){
  let h='';
  const name=P.name;
  const tot=tasks().length, dn=doneCount();
  h+='<div class="card"><div class="probhead"><h2>'+cap(name)+'</h2><span class="f">'+(mode==='challenge'&&P.type!=='metallic'?'?':P.html)+'</span></div>';
  if(mode!=='worked') h+='<div class="progress">'+dn+' of '+tot+' tasks complete</div><div class="bar"><i style="width:'+Math.round(dn/tot*100)+'%"></i></div>';
  else h+='<div class="progress">Step '+(G.widx+1)+' of '+(STEPS.length+1)+'</div>';
  h+='</div>';
  if(mode==='worked'){
    const last=G.widx>=STEPS.length;
    if(!last){ const st=STEPS[G.widx]; h+=workedCard(st,G.widx+1); }
    else h+='<section class="card step"><header><span class="tag">'+(STEPS.length+1)+'</span><h3>Draw the dot-and-cross diagram</h3></header><div class="explain">'+diagExplain()+'</div><div class="props">'+propsText()+'</div>'+stepperHTML()+'</section>';
  } else {
    let n=1; h+=STEPS.map(st=>stepCard(st,n++)).join('');
    if(G.finished){
      const f=firstCount(), t=tasks().length;
      h+='<section class="card done-card"><h3>Done. '+f+' of '+t+' right first time.</h3><p>'+(f===t?'Clean sheet. Try a harder mode or a new substance.':'Every task is complete. Try the same one again in a harder mode, or pick something new.')+'</p><div class="actions"><button class="btn" data-act="random">Another substance</button><button class="btn ghost" data-act="retry">Try this one again</button></div></section>';
    }
  }
  $('steps').innerHTML=h;
}
function workedCard(st,n){
  const rows=st.fields.map(f=>f.kind==='choice'?'':fieldHTML(f,st,'given')).join('');
  const ans=st.id==='type'?'<div class="choices">'+TYPES.map(t=>'<button class="choice'+(t[0]===P.type?' ok':'')+'" disabled>'+t[1]+'</button>').join('')+'</div>':'';
  return '<section class="card step"><header><span class="tag">'+n+'</span><h3>'+st.title+'</h3></header><p class="q">'+st.q+'</p>'+(rows?'<div class="fields">'+rows+'</div>':'')+ans+'<div class="explain">'+st.explain()+'</div>'+stepperHTML()+'</section>';
}
function stepperHTML(){
  const tot=STEPS.length+1;
  return '<div class="stepper"><button class="btn ghost" data-act="wprev"'+(G.widx===0?' disabled':'')+'>Back</button><span class="dots">'+Array.from({length:tot},(_,i)=>'<i class="'+(i<=G.widx?'on':'')+'"></i>').join('')+'</span><button class="btn" data-act="wnext"'+(G.widx>=tot-1?' disabled':'')+'>Next step</button></div>';
}

/* ---------- Rendering: diagram panel ---------- */
function renderDiag(){
  const dg=G.dg; let h='<div class="dh"><h3>Dot-and-cross diagram</h3></div>';
  if(P.type==='covalent'&&mode!=='challenge'&&(mode==='worked'||G.typeDone)){ h+=viewTabs(dg); if(dg.view==='lines'){ $('diag').innerHTML=h+linesPanel(); return; } }
  const mk=(sc,o)=>'<div class="canvas">'+drawScene(sc,o)+'</div>';
  if(mode==='worked'){
    const last=G.widx>=STEPS.length;
    let sc,cap;
    if(P.type==='metallic'){ sc=metScene(P,last?EL[P.M].ve:0,last?'final':'atoms'); cap=last?'After: positive ions in a sea of delocalised electrons':'Before: separate metal atoms'; }
    else if(last){ sc=P.type==='ionic'?ionScene(P,'final'):covScene(P,'final'); cap='After bonding'; }
    else { sc=P.type==='ionic'?ionScene(P,'atoms'):covScene(P,'atoms'); cap='Before bonding: separate atoms'+(P.type==='ionic'?' (arrows show electron transfer)':''); }
    h+=mk(sc,{pre:last?dg.pre:[],user:dg.user,label:cap})+'<div class="legend"><b>'+cap+'.</b></div><div class="legend">'+legendHTML(sc)+'</div>';
    $('diag').innerHTML=h; return;
  }
  if(!G.typeDone){
    h+='<div class="canvas"><p class="lock"><b>Locked.</b><br>Decide the type of bonding in step 1 and the diagram opens up for you to draw.</p></div>';
    $('diag').innerHTML=h; return;
  }
  let sc;
  if(dg.peek){ sc=P.type==='metallic'?metScene(P,0,'atoms'):P.type==='ionic'?ionScene(P,'atoms'):covScene(P,'atoms'); h+=mk(sc,{label:'Atoms before bonding'})+'<div class="legend"><b>Atoms before bonding.</b> Arrows show where electrons go.</div><div class="legend">'+legendHTML(sc)+'</div>'; }
  else if(P.type==='metallic'){
    sc=metScene(P,dg.n,'final');
    h+=mk(sc,{label:'Metallic lattice'})+'<div class="counter"><span>Electrons released per atom</span><button data-act="nminus"'+(dg.done?' disabled':'')+' aria-label="Fewer electrons">−</button><output>'+dg.n+'</output><button data-act="nplus" aria-label="More electrons">+</button></div><div class="legend">'+legendHTML(sc)+'</div>';
  } else {
    sc=P.type==='ionic'?ionScene(P,'final'):covScene(P,'final');
    h+=mk(sc,{user:dg.user,pre:dg.pre,bad:dg.bad,hinted:dg.hinted,interactive:!dg.done,label:'Dot-and-cross diagram of '+P.name});
    h+='<p class="note">Click a ring once for a dot, twice for a cross, a third time to clear it. Position does not matter: each ion or shared pair just needs the right dots and crosses.</p><div class="legend">'+legendHTML(sc)+'</div>';
  }
  const hb=mode!=='challenge';
  h+='<div class="actions" style="margin-top:12px">'+(dg.done?'':'<button class="btn" data-act="dcheck">Check diagram</button>')
    +(hb&&!dg.done?'<button class="btn ghost" data-act="dhint">Hint</button><button class="btn ghost" data-act="dreveal">Show answer</button>':'')
    +(P.type!=='metallic'&&!dg.done?'<button class="btn ghost" data-act="dclear">Clear</button>':'')
    +(hb&&mode!=='worked'?'<button class="btn ghost" data-act="dpeek">'+(dg.peek?'Back to my diagram':'Peek at the atoms')+'</button>':'')+'</div>';
  if(dg.msg) h+='<p class="msg '+(dg.msgOk?'ok':'bad')+'">'+dg.msg+'</p>';
  const DH={ionic:['Metal electrons are crosses. They move across to the non-metal.','Each ion should show 8 electrons in its outer shell (lithium shows 2). The non-metal’s own electrons are dots.'],
    covalent:['Start with the shared pairs where the shells overlap: each pair has one dot and one cross.','Then add the lone pairs on the outside. Every atom should finish with 8 electrons around it (hydrogen 2).'],
    metallic:['Count the outer electrons one atom can release.','Each atom releases all of its outer electrons. Use + until that many are in the sea.']}[P.type];
  if(dg.hint>0&&!dg.done) h+='<div class="hintbox">'+DH.slice(0,Math.min(dg.hint,2)).join('<br>')+'</div>';
  if(dg.done) h+='<div class="explain">'+diagExplain()+'</div><div class="props">'+propsText()+'</div>';
  $('diag').innerHTML=h;
}
function renderAll(){ renderModes(); renderPicker(); renderSteps(); renderDiag(); }
function afterChange(){
  if(mode!=='worked'&&doneCount()===tasks().length) G.finished=true;
  renderSteps(); renderDiag();
}

/* ---------- Actions ---------- */
function checkStep(id){
  const st=STEPS.find(s=>s.id===id), ss=ssOf(id); let all=true;
  st.fields.forEach(f=>{ const v=String(G.fv[f.id]??'').trim(); const ok=cmp(f,v); G.fs[f.id]=ok?'ok':'bad'; if(!ok) all=false; });
  ss.attempts++;
  if(all){ ss.done=true; ss.msg=''; ss.first=ss.attempts===1&&!ss.helped; }
  else ss.msg='Not quite. The red boxes need another look.';
  afterChange();
}
function revealStep(id){
  const st=STEPS.find(s=>s.id===id), ss=ssOf(id);
  st.fields.forEach(f=>{ G.fv[f.id]=String(f.answer); G.fs[f.id]='ok'; });
  ss.done=true; ss.helped=true; ss.first=false; ss.msg='';
  if(id==='type') G.typeDone=true;
  afterChange();
}
function dgEval(sc){
  const dg=G.dg, groups={}, bad=[];
  sc.slots.forEach((s,i)=>{ (groups[s.g]=groups[s.g]||[]).push(i); });
  Object.values(groups).forEach(ix=>{
    let ed=0,ec=0,ud=0,uc=0;
    ix.forEach(i=>{ if(sc.slots[i].expect==='dot') ed++; else ec++; if(dg.user[i]===1) ud++; else if(dg.user[i]===2) uc++; });
    if(ud===ed&&uc===ec) return;
    let sd=Math.max(0,ud-ed), sx=Math.max(0,uc-ec);
    ix.forEach(i=>{ const u=dg.user[i]; if(u===0) bad.push(i); else if(u===1&&sd>0){sd--;bad.push(i);} else if(u===2&&sx>0){sx--;bad.push(i);} });
  });
  return {bad,groups};
}
function dgCheck(){
  const dg=G.dg; dg.attempts++;
  if(P.type==='metallic'){
    const ok=dg.n===EL[P.M].ve; dg.done=ok; if(ok){dg.first=dg.attempts===1&&!dg.helped; dg.msg='';}
    else dg.msg=dg.n===0?'No electrons in the sea yet. Add the outer electrons each atom releases.':(dg.n<EL[P.M].ve?'Not enough electrons. Each atom releases all of its outer electrons.':'Too many electrons. An atom can only release the electrons in its outer shell.');
    return afterChange();
  }
  const sc=P.type==='ionic'?ionScene(P,'final'):covScene(P,'final');
  dg.hinted=[]; dg.bad=dgEval(sc).bad; const good=sc.slots.length-dg.bad.length;
  if(!dg.bad.length){ dg.done=true; dg.first=dg.attempts===1&&!dg.helped; dg.msg=''; }
  else { dg.msgOk=false; dg.msg=good+' of '+sc.slots.length+' electrons are right. The red rings are empty or hold too many of that symbol.'; }
  afterChange();
}
function dgReveal(){
  const dg=G.dg; dg.helped=true; dg.first=false; dg.done=true; dg.msg=''; dg.bad=[]; dg.hinted=[];
  if(P.type==='metallic') dg.n=EL[P.M].ve;
  else { const sc=P.type==='ionic'?ionScene(P,'final'):covScene(P,'final'); dg.user=sc.slots.map(s=>s.expect==='dot'?1:2); }
  afterChange();
}
function dgHint(){
  const dg=G.dg; dg.helped=true; dg.first=false;
  if(dg.hint<2||P.type==='metallic'){ dg.hint=Math.min(dg.hint+1,2); return renderDiag(); }
  const sc=P.type==='ionic'?ionScene(P,'final'):covScene(P,'final');
  const i=dgEval(sc).bad[0];
  if(i!=null){ const ix=sc.slots.map((s,k)=>k).filter(k=>sc.slots[k].g===sc.slots[i].g); const ed=ix.filter(k=>sc.slots[k].expect==='dot').length, ud=ix.filter(k=>dg.user[k]===1).length; dg.user[i]=ed>ud?1:2; dg.hinted.push(i); dg.bad=dg.bad.filter(x=>x!==i); dg.msg='One electron placed for you (amber ring).'; dg.msgOk=true; }
  renderDiag();
}

/* ---------- Events ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-mode],[data-tab],[data-i],[data-act]'); if(!t) return;
  if(t.dataset.mode){ mode=t.dataset.mode; setProblem(P); return; }
  if(t.dataset.tab){ tab=t.dataset.tab; renderPicker(); if(tab==='build') applyCustom(); return; }
  if(t.classList.contains('chip')){ setProblem(LIST[+t.dataset.i]); return; }
  if(t.classList.contains('hit')){ slotClick(+t.dataset.i); return; }
  const a=t.dataset.act, id=t.dataset.step;
  if(a==='random'){ let p; do{p=LIST[Math.floor(Math.random()*LIST.length)];}while(P&&p.plain===P.plain&&p.type===P.type); tab='list'; setProblem(p); }
  else if(a==='retry') setProblem(P);
  else if(a==='choose'){ const ss=ssOf('type'); ss.attempts++; if(t.dataset.val===P.type){ ss.done=true; ss.first=ss.attempts===1&&!ss.helped; G.typeDone=true; G.wrong={}; } else G.wrong[t.dataset.val]=true; afterChange(); }
  else if(a==='check') checkStep(id);
  else if(a==='hint'){ const st=STEPS.find(s=>s.id===id); G.hint[id]=Math.min((G.hint[id]||0)+1,st.hints.length); ssOf(id).helped=true; renderSteps(); }
  else if(a==='reveal') revealStep(id);
  else if(a==='wnext'){ G.widx=Math.min(G.widx+1,STEPS.length); renderSteps(); renderDiag(); }
  else if(a==='wprev'){ G.widx=Math.max(G.widx-1,0); renderSteps(); renderDiag(); }
  else if(a==='dcheck') dgCheck();
  else if(a==='dhint') dgHint();
  else if(a==='dreveal') dgReveal();
  else if(a==='dclear'){ G.dg.user=G.dg.user.map((v,i)=>G.dg.pre[i]?v:0); G.dg.bad=[]; G.dg.hinted=[]; G.dg.msg=''; renderDiag(); }
  else if(a==='dpeek'){ G.dg.peek=!G.dg.peek; renderDiag(); }
  else if(a==='nplus'){ G.dg.n=Math.min(G.dg.n+1,4); G.dg.msg=''; renderDiag(); }
  else if(a==='nminus'){ G.dg.n=Math.max(G.dg.n-1,0); G.dg.msg=''; renderDiag(); }
});
function slotClick(i){ const dg=G.dg; if(dg.done||dg.pre[i]) return; dg.user[i]=(dg.user[i]+1)%3; dg.bad=dg.bad.filter(x=>x!==i); renderDiag(); const el=document.querySelector('.hit[data-i="'+i+'"]'); if(el) el.focus(); }
document.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('hit')){ e.preventDefault(); slotClick(+e.target.dataset.i); } });
function onField(e){ const t=e.target; if(t.dataset&&t.dataset.f){ G.fv[t.dataset.f]=t.value; if(G.fs[t.dataset.f]){ G.fs[t.dataset.f]=''; t.classList.remove('ok','bad'); } } }
document.addEventListener('input',onField); document.addEventListener('change',e=>{
  onField(e);
  if(e.target.id==='e1'||e.target.id==='e2'){ custom.e1=$('e1').value; custom.e2=$('e2').value; applyCustom(); }
});
function applyCustom(){ const r=customProblem(custom.e1,custom.e2); if(r.err){ customMsg=r.err; renderPicker(); } else { customMsg=''; setProblem(r.p); } }

/* ---------- Start ---------- */
setProblem(LIST.find(p=>p.plain==='H2O'));
