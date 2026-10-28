/* ---------- Generic quiz block (used by shapes and alloys) ---------- */
const QS={}, QREG={};
function quizBlock(ns,qs){
  let good=0,done=0;
  let h='<div class="card"><p class="q" style="margin-bottom:0">Answer from what you know. You can retry a wrong answer, and only first tries count.</p>';
  qs.forEach(q=>{ const st=QS[ns+'|'+q.id]||{tries:0,ok:false,wrong:[]}; if(st.ok){done++; if(st.tries===1) good++;}
    h+='<div class="qa"><p class="q"><b>'+q.p+'</b></p><div class="qopts">'+q.o.map((t,k)=>'<button class="qopt'+(st.ok&&k===q.a?' ok':'')+(st.wrong.includes(k)?' bad':'')+'" data-qz="'+ns+'|'+q.id+'|'+k+'"'+(st.ok?' disabled':'')+'>'+t+'</button>').join('')+'</div>'
      +(st.ok?'<div class="explain"><p>'+q.why+'</p></div>':st.tries?'<p class="msg bad">Not quite. Try another answer.</p>':'')+'</div>'; });
  return h+'<div class="actions"><span class="progress" style="align-self:center">'+done+' of '+qs.length+' answered correctly'+(done===qs.length?', '+good+' first time':'')+'</span><span class="spacer"></span><button class="btn ghost" data-qr="'+ns+'">Restart quiz</button></div></div>';
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-qz],[data-qr]'); if(!t) return;
  if(t.dataset.qr){ Object.keys(QS).filter(k=>k.indexOf(t.dataset.qr+'|')===0).forEach(k=>delete QS[k]); QREG[t.dataset.qr].render(); return; }
  const [ns,id,o]=t.dataset.qz.split('|'), reg=QREG[ns], q=reg.qs().find(x=>x.id===id), k=ns+'|'+id, st=QS[k]||(QS[k]={tries:0,ok:false,wrong:[]});
  st.tries++; if(+o===q.a) st.ok=true; else st.wrong.push(+o); reg.render();
});

/* ---------- Molecule shapes ---------- */
const T3=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(v=>v.map(x=>x/Math.sqrt(3)));
const SHAPE_OPTS=['Linear','Bent (V-shaped)','Pyramidal','Tetrahedral','Trigonal planar'];
const ANG_OPTS=['180°','120°','109.5°','107°','104.5°'];
const SH=[
 {id:'ch4',f:'CH4',name:'methane',regions:'4',lp:0,central:true,shape:'Tetrahedral',ang:'109.5°',why:'The four bonding pairs repel each other equally, so they spread out as far apart as possible.'},
 {id:'nh3',f:'NH3',name:'ammonia',regions:'3',lp:1,central:true,shape:'Pyramidal',ang:'107°',why:'Four pairs of electrons spread out tetrahedrally, but one is a lone pair. Lone pairs repel more strongly than bonding pairs, so the H–N–H angle is squeezed to 107°.'},
 {id:'h2o',f:'H2O',name:'water',regions:'2',lp:2,central:true,shape:'Bent (V-shaped)',ang:'104.5°',why:'Four pairs of electrons spread out tetrahedrally, but two are lone pairs. They repel the bonding pairs strongly, squeezing the angle to 104.5°.'},
 {id:'co2',f:'CO2',name:'carbon dioxide',regions:'2 (two double bonds)',lp:0,central:true,shape:'Linear',ang:'180°',why:'The two double bonds repel each other and get as far apart as possible, on opposite sides of the carbon atom.'},
 {id:'ccl4',f:'CCl4',name:'tetrachloromethane',regions:'4',lp:0,central:true,shape:'Tetrahedral',ang:'109.5°',why:'Four bonding pairs and no lone pairs, so they spread out evenly in a tetrahedron.'},
 {id:'c2h4',f:'C2H4',name:'ethene',regions:'3 around each carbon',lp:0,central:true,shape:'Trigonal planar',ang:'120°',why:'Each carbon has three regions of electrons (two C–H bonds and the C=C double bond). They spread out flat, 120° apart.'},
 {id:'hcl',f:'HCl',name:'hydrogen chloride',regions:'1',lp:3,central:false,shape:'Linear',ang:null,why:'Only two atoms, so the molecule is always a straight line.'},
 {id:'h2',f:'H2',name:'hydrogen',regions:'1',lp:0,central:false,shape:'Linear',ang:null,why:'Only two atoms, so the molecule is always a straight line.'}
];
function shMake(id,showLone){
  const A=[],B=[],L=[]; const at=(k,x,y,z,r)=>{A.push({k,x,y,z,r});return A.length-1;}; const bd=(i,j,o)=>B.push([i,j,'bond',o||1]);
  const nrm=v=>{const m=Math.hypot(v[0],v[1],v[2]);return v.map(x=>x/m);};
  const lobes=(ci,dirs,r)=>{ if(!showLone) return; const a=A[ci]; dirs.forEach(d=>{ const u=nrm(d), t=a.r+.2; L.push(at('lp',a.x+u[0]*t,a.y+u[1]*t,a.z+u[2]*t,r||.15)); }); };
  if(id==='ch4'){ const c=at('C',0,0,0,.17); T3.forEach(v=>bd(c,at('H',v[0],v[1],v[2],.11))); }
  else if(id==='ccl4'){ const c=at('C',0,0,0,.17); T3.forEach(v=>{ const cl=at('Cl',v[0]*1.35,v[1]*1.35,v[2]*1.35,.24); bd(c,cl); const u=v, a=Math.abs(u[0])<.9?[1,0,0]:[0,1,0], e1=nrm([u[1]*a[2]-u[2]*a[1],u[2]*a[0]-u[0]*a[2],u[0]*a[1]-u[1]*a[0]]), e2=[u[1]*e1[2]-u[2]*e1[1],u[2]*e1[0]-u[0]*e1[2],u[0]*e1[1]-u[1]*e1[0]]; lobes(cl,[0,2.0944,4.1888].map(t=>[u[0]*.33+.94*(Math.cos(t)*e1[0]+Math.sin(t)*e2[0]),u[1]*.33+.94*(Math.cos(t)*e1[1]+Math.sin(t)*e2[1]),u[2]*.33+.94*(Math.cos(t)*e1[2]+Math.sin(t)*e2[2])]),.1); }); }
  else if(id==='nh3'){ const n=at('N',0,0,0,.17); [0,120,240].forEach(a=>{const r=a*Math.PI/180; bd(n,at('H',.928*Math.cos(r),-.372,.928*Math.sin(r),.11));}); lobes(n,[[0,1,0]]); }
  else if(id==='h2o'){ const o=at('O',0,0,0,.17); bd(o,at('H',.79,-.61,0,.11)); bd(o,at('H',-.79,-.61,0,.11)); lobes(o,[[0,.6,.8],[0,.6,-.8]]); }
  else if(id==='hcl'){ const c=at('Cl',0,0,0,.24); bd(c,at('H',-1.35,0,0,.11)); lobes(c,[[.33,.94,0],[.33,-.47,.81],[.33,-.47,-.81]]); }
  else if(id==='co2'){ const c=at('C',0,0,0,.17); [-1,1].forEach(s=>{ const o=at('O',s*1.25,0,0,.17); bd(c,o,2); lobes(o,[[s*.5,.87,0],[s*.5,-.87,0]]); }); }
  else if(id==='c2h4'){ const a=at('C',-.68,0,0,.17), b=at('C',.68,0,0,.17); bd(a,b,2); [1,-1].forEach(z=>{ bd(a,at('H',-.68-.45,0,z*.78,.11)); bd(b,at('H',.68+.45,0,z*.78,.11)); }); }
  else { const a=at('H',-.45,0,0,.13), b=at('H',.45,0,0,.13); bd(a,b); }
  const ext=Math.max(...A.map(a=>Math.hypot(a.x,a.y,a.z)+a.r))+.15;
  return {atoms:A,bonds:B,ext:Math.max(ext,1.3),bw:3.4};
}
let shI=1, shMode='study', shLone=true;
const sh3={yaw:-.6,pitch:.35,auto:!reduceMotion,drag:false,raf:0,scene:null,lx:0,ly:0,w:0,h:0};
function shQs(m){
  const q=[{id:m.id+'-shape',p:'What is the shape of a molecule of '+sub(m.f)+'?',o:SHAPE_OPTS,a:SHAPE_OPTS.indexOf(m.shape),why:m.why}];
  if(m.ang) q.push({id:m.id+'-ang',p:'What is the bond angle in '+sub(m.f)+'?',o:ANG_OPTS,a:ANG_OPTS.indexOf(m.ang),why:m.why});
  if(m.central) q.push({id:m.id+'-lp',p:'How many lone pairs are on the central atom of '+sub(m.f)+'?',o:['0','1','2','3'],a:m.lp,why:m.why});
  if(m.lp>0&&m.central) q.push({id:m.id+'-why',p:'Why is the angle smaller than 109.5°?',o:['Lone pairs repel more strongly than bonding pairs','The hydrogen atoms attract each other','The bonds are ionic','There are fewer electrons in the molecule'],a:0,why:m.why});
  return q;
}
QREG.sh={qs:()=>shQs(SH[shI]),render:()=>renderShapes()};
function renderShapes(){
  const m=SH[shI];
  $('shpick').innerHTML='<div class="tabs"><b>Choose a molecule</b><span class="spacer"></span><button class="tab" aria-selected="'+(shMode==='study')+'" data-shm="study">Study</button><button class="tab" aria-selected="'+(shMode==='quiz')+'" data-shm="quiz">Quiz me</button></div><div class="chips">'
    +SH.map((s,i)=>'<button class="chip" data-sh="'+i+'" aria-pressed="'+(i===shI)+'"><span class="f">'+sub(s.f)+'</span><span class="n">'+s.name+'</span></button>').join('')+'</div>';
  let h='<div class="card"><div class="probhead"><h2>'+cap(m.name)+'</h2><span class="f">'+sub(m.f)+'</span></div></div>';
  if(shMode==='study'){
    h+='<div class="card"><dl class="gl"><dt>Shape</dt><dd><b>'+m.shape+'</b></dd><dt>Bond angle</dt><dd>'+(m.ang||'Not applicable: only two atoms')+'</dd><dt>Electron regions around the central atom</dt><dd>'+m.regions+'</dd><dt>Lone pairs on the central atom</dt><dd>'+(m.central?m.lp:'Not applicable')+'</dd><dt>Why this shape</dt><dd>'+m.why+'</dd></dl>'
      +'<div class="explain" style="margin-top:12px"><p><b>Key idea:</b> pairs of electrons repel each other, so they spread out as far apart as they can. Lone pairs repel more strongly than bonding pairs.</p></div></div>';
  } else h+=quizBlock('sh',shQs(m));
  $('shinfo').innerHTML=h;
  $('shdiag').innerHTML='<div class="dh"><h3>3D model</h3></div><div class="canvas"><canvas id="sh3d" role="img" aria-label="3D model of '+m.name+'"></canvas></div><div class="actions" style="margin-top:10px"><button class="btn ghost" data-shx="auto">'+(sh3.auto?'Stop spinning':'Spin')+'</button><button class="btn ghost" data-shx="rview">Reset view</button><button class="btn ghost" data-shx="lone">'+(shLone?'Hide lone pairs':'Show lone pairs')+'</button></div>'
    +'<div class="legend"><span><i class="sw" style="background:var(--ink)"></i> carbon</span><span><i class="sw" style="background:var(--ink2)"></i> hydrogen</span><span><i class="sw" style="background:var(--dot)"></i> nitrogen</span><span><i class="sw" style="background:var(--cross)"></i> oxygen</span><span><i class="sw" style="background:var(--ok)"></i> chlorine</span><span><i class="sw" style="background:var(--warn);opacity:.45"></i> lone pair</span></div><p class="note">Drag to turn the molecule. Lines show bonds: two lines is a double bond.</p>';
  startViewer('sh3d',sh3,()=>$('shapes').hidden,()=>shMake(m.id,shLone));
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-sh],[data-shm],[data-shx]'); if(!t) return;
  if(t.dataset.sh!==undefined){ shI=+t.dataset.sh; renderShapes(); }
  else if(t.dataset.shm){ shMode=t.dataset.shm; renderShapes(); }
  else if(t.dataset.shx==='auto'){ sh3.auto=!sh3.auto; renderShapes(); }
  else if(t.dataset.shx==='rview'){ sh3.yaw=-.6; sh3.pitch=.35; renderShapes(); }
  else if(t.dataset.shx==='lone'){ shLone=!shLone; renderShapes(); }
});

/* ---------- Group ions ---------- */
const CATS=[
 {plain:'Li',q:1,name:'lithium'},{plain:'Na',q:1,name:'sodium'},{plain:'K',q:1,name:'potassium'},{plain:'Ag',q:1,name:'silver'},
 {plain:'Mg',q:2,name:'magnesium'},{plain:'Ca',q:2,name:'calcium'},{plain:'Ba',q:2,name:'barium'},{plain:'Zn',q:2,name:'zinc'},{plain:'Cu',q:2,name:'copper(II)'},{plain:'Fe',q:2,name:'iron(II)'},
 {plain:'Al',q:3,name:'aluminium'},{plain:'Fe',q:3,name:'iron(III)'}
];
const ANS=[
 {plain:'F',q:1,name:'fluoride'},{plain:'Cl',q:1,name:'chloride'},{plain:'Br',q:1,name:'bromide'},{plain:'I',q:1,name:'iodide'},
 {plain:'O',q:2,name:'oxide'},{plain:'S',q:2,name:'sulfide'},
 {plain:'N',q:3,name:'nitride'},{plain:'P',q:3,name:'phosphide'}
];
const toSub=s=>s.replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[+d]);
const ionLabel=i=>sub(i.plain)+'<sup>'+chargeText(i.q,i===undefined?'+':(i.cat?'+':'-'))+'</sup>';
CATS.forEach(c=>c.cat=true);
const part=(ion,n)=>n===1?ion.plain:(ion.poly?'('+ion.plain+')'+n:ion.plain+n);
function compose(c,a){ const l=c.q*a.q/gcd(c.q,a.q), nc=l/c.q, na=l/a.q, plain=part(c,nc)+part(a,na); return {c,a,nc,na,plain,html:sub(plain),name:c.name+' '+a.name}; }
let grMode='explore', grC=1, grA=1, gp=null;
function newGp(){ const c=CATS[Math.floor(Math.random()*CATS.length)], a=ANS[Math.floor(Math.random()*ANS.length)]; gp={co:compose(c,a),val:'',tries:0,done:false,first:false,hint:0,helped:false,show:gp?gp.show:true,asked:gp?gp.asked:0,good:gp?gp.good:0,msg:''}; gp.asked++; }
function groupWorking(co){
  const {c,a,nc,na}=co;
  let h='<div class="explain"><p><b>1. Ion charges:</b> '+ionLabel(c)+' and '+ionLabel(a)+'.</p><p><b>2. Balance the charges:</b> '+nc+' × ('+chargeText(c.q,'+')+') = '+nc*c.q+'+ and '+na+' × ('+chargeText(a.q,'-')+') = '+na*a.q+'−, so the ratio is <b>'+nc+' : '+na+'</b>.</p>';
  const br=(c.poly&&nc>1)||(a.poly&&na>1);
  h+='<p><b>3. Write the formula:</b> '+(br?'brackets go round a group ion when you need more than one of it. ':'')+'<b>'+co.html+'</b></p><p><b>Name:</b> '+co.name+'</p></div>';
  return h;
}
function renderGroups(){
  const tabs='<div class="tabs"><b>Ionic compounds from simple ions</b><span class="spacer"></span><button class="tab" aria-selected="'+(grMode==='explore')+'" data-grm="explore">Explore</button><button class="tab" aria-selected="'+(grMode==='practise')+'" data-grm="practise">Practise</button></div>';
  if(grMode==='explore'){
    const co=compose(CATS[grC],ANS[grA]);
    $('grctl').innerHTML=tabs+'<div class="builder"><label>Positive ion<select id="grc">'+CATS.map((c,i)=>'<option value="'+i+'"'+(i===grC?' selected':'')+'>'+c.name+' ('+c.plain+' '+chargeText(c.q,'+')+')</option>').join('')+'</select></label><label>Negative ion<select id="gra">'+ANS.map((c,i)=>'<option value="'+i+'"'+(i===grA?' selected':'')+'>'+c.name+' ('+c.plain+' '+chargeText(c.q,'-')+')</option>').join('')+'</select></label></div><p class="note">Simple negative ions come from non-metals in Group 7 (1− ions), Group 6 (2− ions) and Group 5 (3− ions). The charge is 8 minus the group number.</p>';
    $('grinfo').innerHTML='<div class="card"><div class="probhead"><h2>'+cap(co.name)+'</h2><span class="f">'+co.html+'</span></div></div><div class="card">'+groupWorking(co)+'</div>'+gbCard(co)+mistakesCard(co);
    $('grdiag').innerHTML='<div class="dh"><h3>The ions in the formula</h3></div><div class="canvas">'+(gbActive(co)?gbDiagram(co):ionsRow(co))+'</div>'+(gbActive(co)?gbControls(co):'');
  } else {
    if(!gp) newGp();
    const co=gp.co;
    $('grctl').innerHTML=tabs+'<label class="chk"><input type="checkbox" id="grshow"'+(gp.show?' checked':'')+'> Show the ion charges</label>';
    let h='<div class="card"><div class="probhead"><h2>Write the formula</h2><span class="progress">'+gp.good+' of '+gp.asked+(gp.done?'':' (this one in progress)')+' right first time</span></div><p class="q" style="margin-top:10px">What is the formula of <b>'+co.name+'</b>?</p>'
      +(gp.show?'<p class="q">Ions: '+ionLabel(co.c)+' and '+ionLabel(co.a)+'</p>':'')
      +'<div class="fld"><span>Formula</span><input type="text" id="grin" value="'+gp.val.replace(/"/g,'&quot;')+'" autocomplete="off" spellcheck="false"'+(gp.done?' disabled class="ok"':'')+'><em>Use normal numbers, such as Ca(OH)2</em></div>';
    if(!gp.done) h+='<div class="actions" style="margin-top:12px"><button class="btn" data-grx="check">Check</button><button class="btn ghost" data-grx="hint">Hint</button><button class="btn ghost" data-grx="show">Show answer</button></div>';
    if(gp.msg&&!gp.done) h+='<p class="msg bad">'+gp.msg+'</p>';
    if(gp.hint>0&&!gp.done) h+='<div class="hintbox">'+(gp.hint>=1?'The total positive charge must equal the total negative charge.':'')+(gp.hint>=2?'<br>You need '+co.nc+' of the '+co.c.name+' ion and '+co.na+' of the '+co.a.name+' ion.':'')+(gp.hint>=3&&((co.c.poly&&co.nc>1)||(co.a.poly&&co.na>1))?'<br>Put brackets round a group ion when you need more than one.':'')+'</div>';
    if(gp.done) h+=groupWorking(co)+'<div class="actions" style="margin-top:12px"><button class="btn" data-grx="next">Next compound</button></div>';
    $('grinfo').innerHTML=h+'</div>';
    $('grdiag').innerHTML='<div class="dh"><h3>The ions in the formula</h3></div><div class="canvas">'+(gp.done?ionsRow(co):'<p class="lock">The ions appear when you get the formula.</p>')+'</div>';
  }
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-grm],[data-grx]'); if(!t) return;
  if(t.dataset.grm){ grMode=t.dataset.grm; renderGroups(); return; }
  const a=t.dataset.grx;
  if(a==='next'){ newGp(); renderGroups(); }
  else if(a==='hint'){ gp.hint=Math.min(3,gp.hint+1); gp.helped=true; renderGroups(); }
  else if(a==='show'){ gp.val=gp.co.plain; gp.done=true; gp.helped=true; renderGroups(); }
  else if(a==='check'){ gp.tries++; if(norm(gp.val)===norm(gp.co.plain)){ gp.done=true; gp.msg=''; if(gp.tries===1&&!gp.helped){ gp.first=true; gp.good++; } } else gp.msg='Not quite. Check the charges and the numbers of each ion.'; renderGroups(); }
});
document.addEventListener('input',e=>{ if(e.target.id==='grin'&&gp) gp.val=e.target.value; });
document.addEventListener('change',e=>{
  if(e.target.id==='grc'){ grC=+e.target.value; gb.on=false; renderGroups(); } else if(e.target.id==='gra'){ grA=+e.target.value; gb.on=false; renderGroups(); }
  else if(e.target.id==='grshow'){ gp.show=e.target.checked; renderGroups(); }
});
document.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.id==='grin'){ const b=document.querySelector('[data-grx=check]'); if(b) b.click(); } });

/* ---------- Alloys ---------- */
const ALLOYS=[
 ['Brass','Copper and zinc','Harder than copper and does not corrode easily','Door handles, musical instruments'],
 ['Bronze','Copper and tin','Hard and strong','Statues, bells, ship fittings'],
 ['Mild steel','Iron and a little carbon','Stronger and harder than pure iron, but still easy to shape','Car bodies, bridges, buildings'],
 ['High-carbon steel','Iron and more carbon','Very hard, but brittle','Cutting tools, drill bits'],
 ['Stainless steel','Iron, chromium and nickel','Hard and resists rusting','Cutlery, sinks, surgical tools'],
 ['Duralumin','Aluminium with copper and magnesium','Strong and light','Aircraft parts']
];
let alMode='learn', alPush=false;
const alQs=()=>[
 {id:'why',p:'Why is an alloy harder than the pure metal?',o:['Atoms of different sizes stop the layers sliding over each other','The atoms are all the same size','The metal atoms are joined by covalent bonds','Alloys contain no delocalised electrons'],a:0,why:'In an alloy the different-sized atoms disrupt the regular layers, so the layers cannot slide over each other easily.'},
 {id:'pure',p:'Why is a pure metal soft and malleable?',o:['The layers of identical atoms can slide over each other','It has weak covalent bonds','It has no free electrons','Its atoms are held in a rigid network'],a:0,why:'Layers of identical atoms are regular, so they slide past one another easily when a force is applied.'},
 {id:'steel',p:'What is steel made from?',o:['Iron with a small amount of carbon','Copper and zinc','Copper and tin','Pure iron'],a:0,why:'Steel is an alloy of iron with carbon. Other metals are added to make special steels such as stainless steel.'},
 {id:'brass',p:'Which two metals make brass?',o:['Copper and zinc','Copper and tin','Iron and carbon','Aluminium and magnesium'],a:0,why:'Brass is copper and zinc. Bronze is copper and tin.'},
 {id:'cutlery',p:'Which alloy would you choose for cutlery, and why?',o:['Stainless steel, because it is hard and does not rust','Pure iron, because it is soft','Brass, because it is made from iron','Bronze, because it is a pure metal'],a:0,why:'Stainless steel resists rusting and is hard, so it suits cutlery.'}
];
QREG.al={qs:alQs,render:()=>renderAlloys()};
function drawAlloy(alloy,pushed){
  const cols=9,rows=4,dx=34,dy=29,ox=24,oy=22;
  const big=[[0,2],[1,6],[2,3],[3,7],[1,1],[2,8]].map(p=>p.join()), small=[[0,6],[2,7],[3,2],[2,0],[1,4],[3,5]].map(p=>p.join());
  let o='',blocked='';
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    let x=ox+c*dx+(r%2?dx/2:0), y=oy+r*dy; if(pushed&&r<2) x+=alloy?4:dx; const k=r+','+c;
    let R=14,cls='';
    if(alloy&&big.includes(k)){R=17;cls='cat';} else if(alloy&&small.includes(k)){R=9;cls='an';}
    o+='<circle class="gatom '+cls+'" cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+R+'"/>';
    if(alloy&&pushed&&r===1&&big.includes(k)) blocked+='<text class="chg" x="'+f1(x-6)+'" y="'+f1(y+oy*.9)+'" style="fill:var(--bad)">✕</text>';
  }
  if(pushed) o+='<line class="rep" x1="8" y1="'+(oy+dy*.5)+'" x2="26" y2="'+(oy+dy*.5)+'" marker-end="url(#ahr)"/>';
  return o+blocked;
}
function renderAlloys(){
  $('alctl').innerHTML='<div class="tabs"><b>Alloys</b><span class="spacer"></span><button class="tab" aria-selected="'+(alMode==='learn')+'" data-alm="learn">Learn</button><button class="tab" aria-selected="'+(alMode==='quiz')+'" data-alm="quiz">Quiz me</button></div><p class="note" style="margin:0">An alloy is a mixture of a metal with at least one other element, usually another metal.</p>';
  if(alMode==='learn'){
    $('alinfo').innerHTML='<div class="card"><dl class="gl"><dt>Pure metals</dt><dd>Layers of identical atoms in a regular pattern. The layers slide over each other easily when a force is applied, so pure metals are soft and malleable.</dd><dt>Alloys</dt><dd>Atoms of different sizes disrupt the regular layers. The layers cannot slide so easily, so alloys are harder and stronger than the pure metal.</dd><dt>Why use them</dt><dd>Alloys can be made with properties chosen for a job: harder, stronger, or resistant to rusting.</dd></dl></div>';
  } else $('alinfo').innerHTML=quizBlock('al',alQs());
  $('aldiag').innerHTML='<div class="dh"><h3>Pure metal and alloy</h3></div><div class="canvas"><svg viewBox="0 0 380 305" style="width:min(100%,560px)" role="img" aria-label="Layers of atoms in a pure metal and in an alloy"><defs><marker id="ahr" viewBox="0 0 8 8" refX="4" refY="4" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--bad)"/></marker></defs>'
    +'<text class="latcap" x="190" y="14">Pure metal</text><g transform="translate(0,14)">'+drawAlloy(false,alPush)+'</g><g transform="translate(0,160)"><text class="latcap" x="190" y="14">Alloy</text><g transform="translate(0,14)">'+drawAlloy(true,alPush)+'</g></g></svg></div>'
    +'<div class="actions" style="margin-top:10px"><button class="btn ghost" data-alx="push">'+(alPush?'Reset':'Push the top two layers')+'</button></div><p class="note">'+(alPush?'In the pure metal the layers slide over each other easily. In the alloy the larger and smaller atoms block the layers, shown by the pink crosses.':'Pure metal on top, alloy below. The alloy has larger (red outline) and smaller (blue outline) atoms mixed in.')+'</p>';
  $('altbl').innerHTML='<h3 style="margin-bottom:10px">Common alloys</h3><div class="scroll"><table class="tbl"><thead><tr><th>Alloy</th><th>Made from</th><th>Properties</th><th>Uses</th></tr></thead><tbody>'+ALLOYS.map(r=>'<tr><th>'+r[0]+'</th><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+r[3]+'</td></tr>').join('')+'</tbody></table></div>';
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-alm],[data-alx]'); if(!t) return;
  if(t.dataset.alm){ alMode=t.dataset.alm; renderAlloys(); } else if(t.dataset.alx==='push'){ alPush=!alPush; renderAlloys(); }
});
