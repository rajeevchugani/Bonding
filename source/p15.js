/* ---------- Read the diagram (work backwards from a finished dot-and-cross) ---------- */
const RD={P:null,sc:null,v:{},res:null,tries:0,score:0,n:0,shown:false,all:false};
function rdPick(prev){
  let P; do{ P=rnd(LIST); }while(prev&&P===prev&&LIST.length>1);
  RD.P=P; RD.v={}; RD.res=null; RD.tries=0; RD.shown=false;
  RD.sc=P.type==='ionic'?ionScene(P,'final'):P.type==='covalent'?covScene(P,'final'):metScene(P,EL[P.M].ve,'final');
}
function rdFields(){
  const P=RD.P;
  if(P.type==='ionic') return [
    {k:'f',l:'Formula of the compound',a:P.plain,t:'f',ph:'e.g. MgCl2'},
    {k:'n',l:'Name of the compound',a:P.name,t:'n',ph:'e.g. calcium oxide'},
    {k:'c1',l:'Charge on the '+P.M+' ion',a:P.cm,t:'c',ph:'e.g. 2+'},
    {k:'c2',l:'Charge on the '+P.X+' ion',a:-P.an,t:'c',ph:'e.g. 1-'}];
  if(P.type==='covalent'){ const pairs=RD.sc.bonds.reduce((n,b)=>n+b.order,0); return [
    {k:'f',l:'Formula of the molecule',a:P.plain,t:'f',ph:'e.g. H2O'},
    {k:'n',l:'Name of the substance',a:P.name,t:'n',ph:'e.g. carbon dioxide'},
    {k:'p',l:'Number of shared pairs (bonds)',a:pairs,t:'i',ph:'e.g. 2'}]; }
  return [
    {k:'n',l:'Name of the metal',a:P.name,t:'n',ph:'e.g. sodium'},
    {k:'e',l:'Electrons each atom releases',a:EL[P.M].ve,t:'i',ph:'e.g. 2'},
    {k:'c1',l:'Charge on each metal ion',a:EL[P.M].ve,t:'c',ph:'e.g. 3+'}];
}
function rdOK(f,v){
  v=String(v||'').trim(); if(!v) return false;
  if(f.t==='f') return norm(v)===norm(f.a);
  if(f.t==='n') return v.toLowerCase().replace(/\s+/g,' ').replace('sulphide','sulfide')===f.a.toLowerCase();
  if(f.t==='i') return /^\d+$/.test(v)&&+v===f.a;
  return dlParseCharge(v)===f.a;
}
const rdShow=a=>typeof a==='number'?(a>0?a+'+':a<0?(-a)+'−':'0'):a;
function renderRead(){
  const box=$('readbox'); if(!box) return; if(!RD.P) rdPick();
  const P=RD.P, F=rdFields(), done=RD.res&&F.every(f=>RD.res[f.k]);
  let sc=Object.assign({},RD.sc,{ions:RD.sc.ions.map(i=>Object.assign({},i,{charge:(RD.shown||done)?i.charge:'?'}))});
  const svg=drawScene(sc,{pre:sc.slots.map(()=>true),label:'A finished dot-and-cross diagram to read'});
  let h='<div class="probhead"><h2>Read the diagram</h2><span class="chip" style="cursor:default">Score '+RD.score+' / '+RD.n+'</span></div>'
   +'<p class="q">Here is a finished dot-and-cross diagram. Work backwards: what substance is it? '+(P.type==='ionic'?'The charges are hidden, so count the electrons lost and gained.':P.type==='covalent'?'Count the shared pairs between the atoms.':'')+'</p>'
   +'<div class="canvas" style="min-height:0">'+svg+'</div><div class="legend">'+legendHTML(sc)+'</div>'
   +'<div style="display:flex;flex-direction:column;gap:12px;margin-top:14px">'
   +F.map(f=>{ const r=RD.res&&RD.res[f.k], v=RD.shown?(f.t==='c'?rdShow(f.a):String(f.a)):(RD.v[f.k]||'');
      return '<div class="fld"><span style="min-width:200px">'+f.l+'</span><input type="text" data-rdf="'+f.k+'" value="'+String(v).replace(/"/g,'&quot;')+'" placeholder="'+f.ph+'" autocomplete="off" spellcheck="false"'+(RD.shown?' disabled':'')+(r===true?' class="ok"':r===false?' class="bad"':'')+'>'
        +(r===true?'<span class="msg ok" style="margin:0">Correct</span>':r===false?'<span class="msg bad" style="margin:0">'+(f.t==='f'?'Check the numbers and capital letters.':f.t==='c'?'Think about electrons lost or gained.':'Not quite.')+'</span>':'')+'</div>'; }).join('')+'</div>';
  if(done||RD.shown) h+='<div class="explain" style="margin-top:12px"><p><b>'+cap(P.name)+(P.type==='metallic'?'':' ('+P.html+')')+'</b></p><p>'+(P.type==='ionic'?'The '+EL[P.M].n+' atoms each lost '+P.cm+' electron'+(P.cm>1?'s':'')+' and the '+EL[P.X].n+' atoms each gained '+P.an+', so every ion has a full outer shell.':P.type==='covalent'?'Each shared pair is one covalent bond. Every atom ends up with a full outer shell.':'Each atom releases its '+EL[P.M].ve+' outer electron'+(EL[P.M].ve>1?'s':'')+' into the sea of electrons, leaving a '+EL[P.M].ve+'+ ion.')+'</p></div>';
  h+='<div class="actions">'+(done||RD.shown?'<button class="btn" data-rd="next">Next diagram</button>':'<button class="btn" data-rd="check">Check my answers</button>'+(RD.tries>=1?'<button class="btn ghost" data-rd="show">Show the answers</button>':''))+'</div>';
  box.innerHTML=h;
}
document.addEventListener('input',e=>{ const t=e.target; if(t&&t.dataset&&t.dataset.rdf) RD.v[t.dataset.rdf]=t.value; });
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-rd]'); if(!t) return; const a=t.dataset.rd;
  if(a==='check'){ const F=rdFields(); RD.res={}; F.forEach(f=>RD.res[f.k]=rdOK(f,RD.v[f.k])); RD.tries++; if(F.every(f=>RD.res[f.k])){ RD.n++; if(RD.tries===1) RD.score++; } renderRead(); }
  else if(a==='show'){ RD.shown=true; RD.n++; renderRead(); }
  else if(a==='next'){ rdPick(RD.P); renderRead(); }
});

/* ---------- Sort the substances ---------- */
const SO_CATS=[
  {id:'ionic',t:'Ionic',d:'metal + non-metal',why:'It is a metal joined to a non-metal. Electrons are transferred, so it is made of ions in a giant lattice.'},
  {id:'mol',t:'Simple covalent',d:'small molecules',why:'It is made of non-metal atoms only, sharing electrons in small separate molecules.'},
  {id:'giant',t:'Giant covalent',d:'huge network',why:'Non-metal atoms are all joined by covalent bonds in one huge network, with no small molecules.'},
  {id:'met',t:'Metallic',d:'metal only',why:'It is a metal. The atoms form positive ions in a sea of delocalised electrons.'}
];
const SO_POOL=(()=>{
  const A=[];
  [['NaCl','sodium chloride'],['MgO','magnesium oxide'],['CaCl₂','calcium chloride'],['Al₂O₃','aluminium oxide'],['K₂O','potassium oxide'],['LiF','lithium fluoride'],['KBr','potassium bromide'],['CaO','calcium oxide']].forEach(x=>A.push({n:x[1],f:x[0],c:'ionic'}));
  [['H₂O','water'],['CO₂','carbon dioxide'],['CH₄','methane'],['NH₃','ammonia'],['HCl','hydrogen chloride'],['O₂','oxygen'],['N₂','nitrogen'],['Cl₂','chlorine'],['C₂H₄','ethene'],['CCl₄','tetrachloromethane']].forEach(x=>A.push({n:x[1],f:x[0],c:'mol'}));
  [['C','diamond'],['C','graphite'],['C','graphene'],['SiO₂','silicon dioxide']].forEach(x=>A.push({n:x[1],f:x[0],c:'giant'}));
  [['Cu','copper'],['Fe','iron'],['Mg','magnesium'],['Al','aluminium'],['Na','sodium'],['Zn','zinc']].forEach(x=>A.push({n:x[1],f:x[0],c:'met'}));
  [['A metal combined with a non-metal','ionic'],['Positive and negative ions in a giant lattice','ionic'],['Two non-metals sharing electrons in small molecules','mol'],['Atoms bonded in a huge network of covalent bonds','giant'],['Positive ions surrounded by a sea of delocalised electrons','met'],['A pure metal element','met']].forEach(x=>A.push({n:x[0],f:'',c:x[1],desc:true}));
  return A;
})();
const SO={deck:[],i:0,score:0,streak:0,best:0,pick:null,miss:[],stage:'start'};
function soStart(){ const pool=shuffle(SO_POOL.filter(c=>!c.desc)), dd=shuffle(SO_POOL.filter(c=>c.desc)).slice(0,3);
  const per={ionic:[],mol:[],giant:[],met:[]}; pool.forEach(c=>per[c.c].push(c));
  let d=[]; ['ionic','mol','met'].forEach(k=>d.push(...per[k].slice(0,3))); d.push(...per.giant.slice(0,3)); d=d.concat(dd); SO.deck=shuffle(d); SO.i=0; SO.score=0; SO.streak=0; SO.best=0; SO.pick=null; SO.miss=[]; SO.stage='play'; }
function renderSort(){
  const box=$('sortbox'); if(!box) return;
  if(SO.stage==='start'){ box.innerHTML='<div class="probhead"><h2>Sort the substances</h2></div><p class="q">Which type of structure and bonding is it? A card appears and you choose a box. You get 15 cards, mixing ionic, simple covalent, giant covalent and metallic.</p><div class="actions"><button class="btn" data-so="start">Start sorting</button></div>'; return; }
  if(SO.stage==='end'){ box.innerHTML='<div class="probhead"><h2>All sorted</h2><span class="chip" style="cursor:default">'+SO.score+' / '+SO.deck.length+'</span></div><p class="q">Best streak: <b>'+SO.best+'</b> in a row.</p>'
    +(SO.miss.length?'<div class="explain"><p><b>Look again at these:</b></p>'+SO.miss.map(c=>'<p>'+(c.desc?c.n:c.n+(c.f?' ('+c.f+')':''))+' &rarr; <b>'+SO_CATS.find(k=>k.id===c.c).t+'</b></p>').join('')+'</div>':'<p class="msg ok">✓ Perfect round!</p>')
    +'<div class="actions"><button class="btn" data-so="start">Play again</button></div>'; return; }
  const c=SO.deck[SO.i], ans=SO.pick;
  let h='<div class="probhead"><h2>Sort the substances</h2><span class="chip" style="cursor:default">'+(SO.i+1)+' of '+SO.deck.length+' · Score '+SO.score+(SO.streak>1?' · Streak '+SO.streak:'')+'</span></div>'
   +'<div class="card" style="background:var(--raise);text-align:center;padding:22px"><div style="font:800 30px var(--f-display);color:var(--head)">'+(c.desc?'<span style="font-size:22px">'+c.n+'</span>':cap(c.n))+'</div>'+(c.f?'<div class="mono" style="font-size:20px;color:var(--ink2);margin-top:4px">'+c.f+'</div>':'')+'</div>'
   +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:14px">'
   +SO_CATS.map(k=>{ const st=ans?(k.id===c.c?' ok':(k.id===ans?' bad':'')):''; return '<button class="qopt'+st+'" data-so="'+k.id+'"'+(ans?' disabled':'')+' style="text-align:center"><b>'+k.t+'</b><br><span style="font-size:14px;color:var(--ink2)">'+k.d+'</span></button>'; }).join('')+'</div>';
  if(ans){ const right=ans===c.c; h+='<p class="msg '+(right?'ok':'bad')+'">'+(right?'Correct. ':'Not quite. It is '+SO_CATS.find(k=>k.id===c.c).t.toLowerCase()+'. ')+SO_CATS.find(k=>k.id===c.c).why+'</p><div class="actions"><button class="btn" data-so="next">'+(SO.i+1>=SO.deck.length?'See results':'Next card')+'</button></div>'; }
  box.innerHTML=h;
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-so]'); if(!t) return; const a=t.dataset.so;
  if(a==='start'){ soStart(); renderSort(); }
  else if(a==='next'){ SO.i++; SO.pick=null; if(SO.i>=SO.deck.length) SO.stage='end'; renderSort(); }
  else if(!SO.pick&&SO.stage==='play'){ SO.pick=a; const c=SO.deck[SO.i]; if(a===c.c){ SO.score++; SO.streak++; SO.best=Math.max(SO.best,SO.streak); } else { SO.streak=0; SO.miss.push(c); } renderSort(); }
});
