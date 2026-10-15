/* ---------- Data ---------- */
const EL = {
  H:{n:'hydrogen',z:1,ve:1,cfg:'1',metal:false}, Li:{n:'lithium',z:3,ve:1,cfg:'2,1',metal:true},
  C:{n:'carbon',z:6,ve:4,cfg:'2,4',metal:false}, N:{n:'nitrogen',z:7,ve:5,cfg:'2,5',metal:false},
  O:{n:'oxygen',z:8,ve:6,cfg:'2,6',metal:false}, F:{n:'fluorine',z:9,ve:7,cfg:'2,7',metal:false},
  Na:{n:'sodium',z:11,ve:1,cfg:'2,8,1',metal:true}, Mg:{n:'magnesium',z:12,ve:2,cfg:'2,8,2',metal:true},
  Al:{n:'aluminium',z:13,ve:3,cfg:'2,8,3',metal:true}, S:{n:'sulfur',z:16,ve:6,cfg:'2,8,6',metal:false},
  Cl:{n:'chlorine',z:17,ve:7,cfg:'2,8,7',metal:false}, K:{n:'potassium',z:19,ve:1,cfg:'2,8,8,1',metal:true},
  Ca:{n:'calcium',z:20,ve:2,cfg:'2,8,8,2',metal:true}, Br:{n:'bromine',z:35,ve:7,cfg:'2,8,18,7',metal:false}
};
const IDE = {O:'oxide',S:'sulfide',F:'fluoride',Cl:'chloride',Br:'bromide',N:'nitride'};
const VAL = {H:1,F:1,Cl:1,Br:1,O:2,N:3,C:4};
const COV = { // "central:terminal" -> number of terminal atoms
  'O:H':2,'N:H':3,'C:H':4,'Cl:H':1,'F:H':1,'Br:H':1,'C:Cl':4,'C:F':4,'C:Br':4,'C:O':2,'N:F':3,'N:Cl':3
};
const DIATOMIC = ['H','N','O','F','Cl','Br'];
const COVNAME = {H2:'hydrogen',Cl2:'chlorine',O2:'oxygen',N2:'nitrogen',F2:'fluorine',Br2:'bromine',HCl:'hydrogen chloride',HF:'hydrogen fluoride',
  HBr:'hydrogen bromide',H2O:'water',NH3:'ammonia',CH4:'methane',CO2:'carbon dioxide',CCl4:'tetrachloromethane',C2H4:'ethene'};
const PREFIX = ['','','di','tri','tetra'];

const gcd=(a,b)=>b?gcd(b,a%b):a;
const sub = s => s.replace(/(\d+)/g,'<sub>$1</sub>');
const chargeText = (n,sign) => (n===1?'':n)+(sign==='+'?'+':'−');

/* ---------- Problem makers ---------- */
function makeIonic(M,X){
  const cm=EL[M].ve, an=8-EL[X].ve, l=cm*an/gcd(cm,an), a=l/cm, b=l/an;
  if(a===1 && b>2) return null;
  const plain=M+(a>1?a:'')+X+(b>1?b:'');
  return {type:'ionic',M,X,cm,an,a,b,plain,html:sub(plain),name:EL[M].n+' '+IDE[X],els:[M,X]};
}
function makeCovalent(c,t,n){
  const order=VAL[t];
  let plain;
  if(c===t) plain=c+'2';
  else if(t==='H' && (c==='O'||['F','Cl','Br'].includes(c))) plain=(n>1?'H'+n:'H')+c;
  else plain=c+t+(n>1?n:'');
  if(c!==t && t==='H' && c!=='O' && !['F','Cl','Br'].includes(c)) plain=c+'H'+(n>1?n:'');
  let name=COVNAME[plain];
  if(!name){ name=EL[c].n+' '+PREFIX[n]+(n===1?'':'')+(IDE[t]||EL[t].n+'ide'); }
  return {type:'covalent',c,t,n,order,plain,html:sub(plain),name,els:c===t?[c]:[c,t]};
}
function makeEthene(){ return {type:'covalent',special:'ethene',c:'C',t:'H',n:4,order:1,plain:'C2H4',html:sub('C2H4'),name:'ethene',els:['C','H']}; }
function makeMetal(M){ return {type:'metallic',M,plain:M,html:M,name:EL[M].n,els:[M]}; }

const LIST = [];
['NaCl','MgO','MgCl2','CaCl2','Na2O','K2O','KBr','LiF','CaO','Al2O3'].forEach(f=>{
  const m=f.match(/^(Li|Na|K|Mg|Ca|Al)(\d?)(F|Cl|Br|O|S)(\d?)$/); LIST.push(makeIonic(m[1],m[3]));
});
[['H','H'],['Cl','Cl'],['O','O'],['N','N'],['F','F']].forEach(p=>LIST.push(makeCovalent(p[0],p[1],1)));
[['Cl','H',1],['F','H',1],['O','H',2],['N','H',3],['C','H',4],['C','O',2],['C','Cl',4]].forEach(p=>LIST.push(makeCovalent(p[0],p[1],p[2])));
LIST.push(makeEthene());
['Li','Na','K','Mg','Ca','Al'].forEach(m=>LIST.push(makeMetal(m)));
LIST.sort((a,b)=>a.name.localeCompare(b.name));

function customProblem(e1,e2){
  if(!e1) return {err:'Choose an element to start.'};
  const A=EL[e1], B=e2?EL[e2]:null;
  if(!e2){ return A.metal ? {p:makeMetal(e1)} : {err:'Pick a second element. Choose the same non-metal twice to build a diatomic molecule, such as O and O.'}; }
  if(A.metal && B.metal){ return e1===e2 ? {p:makeMetal(e1)} : {err:'Two different metals would make an alloy, which is outside this lab. Swap one for a non-metal.'}; }
  if(A.metal!==B.metal){
    const M=A.metal?e1:e2, X=A.metal?e2:e1;
    if(!IDE[X]) return {err:EL[X].n+' does not form a simple ion at this level. Try F, Cl, Br, O, S or N.'};
    const p=makeIonic(M,X);
    return p?{p}:{err:'That pair gives a 1:3 compound, a special case outside this lab. Try a different pair.'};
  }
  if(e1===e2) return DIATOMIC.includes(e1)?{p:makeCovalent(e1,e1,1)}:{err:e1+' does not form a simple diatomic molecule.'};
  for(const [c,t] of [[e1,e2],[e2,e1]]){ const n=COV[c+':'+t]; if(n) return {p:makeCovalent(c,t,n)}; }
  return {err:'That pair is not a standard IGCSE molecule. Try H with O, N, C or a halogen, or C with O or a halogen.'};
}

/* ---------- Geometry helpers ---------- */
const RAD=a=>a*Math.PI/180;
const SIDES=[270,0,90,180]; // screen angles (y down): top, right, bottom, left
const nearestSide=ang=>{ let best=SIDES[0],bd=999; SIDES.forEach(s=>{ let d=Math.abs(((ang-s+540)%360)-180); if(d<bd){bd=d;best=s;} }); return best; };
const dlt=R=>Math.asin(10/R)*180/Math.PI; // half-gap of an electron pair, 10px along the shell
const polar=(cx,cy,r,deg)=>[cx+r*Math.cos(RAD(deg)), cy+r*Math.sin(RAD(deg))];
function sideOrder(facing){ const o=[]; facing.forEach(s=>{if(!o.includes(s))o.push(s);}); [270,90,0,180].forEach(s=>{if(!o.includes(s))o.push(s);}); return o; }
/* electrons of one atom on 4 sides; q=0 first on every side, then q=1 on sides in reverse priority */
function shellSlots(cx,cy,R,count,order,kind){
  const out=[]; const pos=(side,q,paired)=>polar(cx,cy,R,side+(paired?(q?dlt(R):-dlt(R)):0));
  const paired=count>4;
  for(let i=0;i<Math.min(count,4);i++){ const [x,y]=pos(order[i],0,paired); out.push({x,y,expect:kind,side:order[i],q:0}); }
  const rev=order.slice().reverse();
  for(let i=0;i<count-4;i++){ const [x,y]=pos(rev[i],1,true); out.push({x,y,expect:kind,side:rev[i],q:1}); }
  return out;
}

/* ---------- Covalent scene ---------- */
function covLayout(n,lone){
  if(n===1) return [0];
  if(n===2) return lone>0?[218,322]:[180,0];
  if(n===3) return [200,270,340];
  return [0,90,180,270];
}
function covScene(P,stage){
  const atoms=[], bonds=[];
  const Rof=s=>s==='H'?32:46;
  const add=(sym,parent,ang,order)=>{ atoms.push({sym,parent,ang,order,R:Rof(sym)}); if(parent!=null) bonds.push({a:parent,b:atoms.length-1,order}); };
  if(P.special==='ethene'){
    add('C',null); add('C',0,0,2); add('H',0,135,1); add('H',0,225,1); add('H',1,45,1); add('H',1,315,1);
  } else if(P.c===P.t){ add(P.c,null); add(P.t,0,0,P.order); }
  else {
    add(P.c,null);
    const lone=(EL[P.c].ve-P.n*P.order)/2;
    let angs=covLayout(P.n,lone);
    if(P.n===1 && P.t==='H') angs=[180];
    angs.forEach(a=>add(P.t,0,a,P.order));
  }
  atoms.forEach((a,i)=>{
    if(a.parent==null){a.x=0;a.y=0;return;}
    const p=atoms[a.parent];
    const d=a.R+p.R-(stage==='atoms'?-26:16+8*(a.order-1));
    a.x=p.x+d*Math.cos(RAD(a.ang)); a.y=p.y-d*Math.sin(RAD(a.ang));
  });
  const syms=[...new Set(atoms.map(a=>a.sym))];
  atoms.forEach((a,i)=>{ a.type=syms.length===1?(i===0?'dot':'cross'):(a.sym===syms[0]?'dot':'cross'); a.label=a.sym; });
  atoms.forEach((a,i)=>{ a.bondSum=0; a.nbrs=[]; });
  bonds.forEach(b=>{ atoms[b.a].bondSum+=b.order; atoms[b.b].bondSum+=b.order; atoms[b.a].nbrs.push(b.b); atoms[b.b].nbrs.push(b.a); });
  const slots=[];
  if(stage==='atoms'){
    atoms.forEach(a=>{
      const faces=a.nbrs.map(j=>nearestSide(Math.atan2(atoms[j].y-a.y,atoms[j].x-a.x)*180/Math.PI));
      shellSlots(a.x,a.y,a.R,EL[a.sym].ve,sideOrder(faces),a.type).forEach(s=>{s.fixed=true;slots.push(s);});
    });
  } else {
    bonds.forEach((b,bi)=>{
      const A=atoms[b.a],B=atoms[b.b],dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d,px=-uy,py=ux;
      const cl=(d-B.R+A.R)/2, cx=A.x+ux*cl, cy=A.y+uy*cl;
      const tA=A.type, tB=A.type===B.type?(A.type==='dot'?'cross':'dot'):B.type;
      for(let k=0;k<b.order;k++){
        const s=(k-(b.order-1)/2)*14, qx=cx+px*s, qy=cy+py*s;
        slots.push({x:qx-ux*5,y:qy-uy*5,expect:tA,g:'b'+bi}); slots.push({x:qx+ux*5,y:qy+uy*5,expect:tB,g:'b'+bi});
      }
    });
    atoms.forEach((a,ai)=>{
      const L=(EL[a.sym].ve-a.bondSum)/2; a.lone=L; if(L<=0) return;
      let sx=0,sy=0; a.nbrs.forEach(j=>{ const dx=atoms[j].x-a.x,dy=atoms[j].y-a.y,d=Math.hypot(dx,dy); sx+=dx/d; sy+=dy/d; });
      const phi=Math.hypot(sx,sy)<1e-6?270:Math.atan2(-sy,-sx)*180/Math.PI; a.phi=phi;
      const angs=L===1?[phi]:L===2?[phi-55,phi+55]:[phi,phi-90,phi+90];
      angs.forEach(t=>{ [-dlt(a.R),dlt(a.R)].forEach(dd=>{ const [x,y]=polar(a.x,a.y,a.R,t+dd); slots.push({x,y,expect:a.type,g:'l'+ai}); }); });
    });
  }
  atoms.forEach(a=>{ if(a.lone==null) a.lone=(EL[a.sym].ve-a.bondSum)/2; });
  const circles=atoms.map(a=>({x:a.x,y:a.y,R:a.R,label:a.sym,small:a.sym==='H'}));
  return {circles,slots,atoms,bonds,arrows:[],ions:[],legend:covLegend(atoms)};
}
function covLegend(atoms){
  const syms=[...new Set(atoms.map(a=>a.sym))];
  if(syms.length===1) return [{t:'dot',txt:'from one '+syms[0]+' atom'},{t:'cross',txt:'from the other '+syms[0]+' atom'}];
  return [{t:'dot',txt:'from '+syms[0]},{t:'cross',txt:'from '+syms[1]}];
}

/* ---------- Ionic scene ---------- */
function ionSeq(P){
  const seq=[]; const {a,b}=P;
  if(b>a){ for(let i=0;i<b;i++){ seq.push('a'); if(i<a) seq.push('c'); } }
  else { for(let i=0;i<a;i++){ seq.push('c'); if(i<b) seq.push('a'); } }
  return seq;
}
function ionScene(P,stage){
  const seq=ionSeq(P), fin=stage==='final';
  const items=seq.map(k=>({k,sym:k==='c'?P.M:P.X,R:fin?(k==='c'?44:52):46}));
  let x=0;
  items.forEach((it,i)=>{ if(i>0) x+=items[i-1].R+it.R+(fin?58:70); it.x=x; it.y=0; });
  const slots=[], circles=[], ions=[], arrows=[];
  items.forEach((it,i)=>{
    const facing=[]; if(i>0) facing.push(180); if(i<items.length-1) facing.push(0);
    const order=sideOrder(facing);
    it.facing=facing; it.order=order;
    circles.push({x:it.x,y:it.y,R:it.R,label:it.sym,ion:fin});
    if(fin){
      ions.push({x:it.x,y:it.y,R:it.R,charge:it.k==='c'?chargeText(P.cm,'+'):chargeText(P.an,'-')});
      if(it.k==='c'){
        const n=P.M==='Li'?2:8;
        const ord=P.M==='Li'?[270]:SIDES;
        for(let s=0;s<(n===2?1:4);s++) for(let q=0;q<2;q++){ const [px,py]=polar(it.x,it.y,it.R,ord[s]+(q?dlt(it.R):-dlt(it.R))); slots.push({x:px,y:py,expect:'cross',g:'i'+i}); }
      } else {
        const g=P.an;
        SIDES.forEach(s=>{ const [px,py]=polar(it.x,it.y,it.R,s-dlt(it.R)); slots.push({x:px,y:py,expect:'dot',g:'i'+i}); });
        order.forEach((s,j)=>{ const [px,py]=polar(it.x,it.y,it.R,s+dlt(it.R)); slots.push({x:px,y:py,expect:j<g?'cross':'dot',g:'i'+i}); });
      }
    } else {
      if(it.k==='c'){ shellSlots(it.x,it.y,it.R,EL[P.M].ve,order,'cross').forEach(s=>{s.fixed=true;slots.push(s);}); }
      else {
        const dots=shellSlots(it.x,it.y,it.R,EL[P.X].ve,order,'dot'); dots.forEach(s=>{s.fixed=true;slots.push(s);});
        const taken=dots.filter(s=>s.q===1).map(s=>s.side);
        const free=order.filter(s=>!taken.includes(s)).slice(0,P.an);
        free.forEach(s=>{ const [px,py]=polar(it.x,it.y,it.R,s+dlt(it.R)); slots.push({x:px,y:py,expect:'cross',target:true,fixed:true,owner:i}); });
      }
    }
  });
  if(!fin){
    const src=slots.filter(s=>!s.target&&s.expect==='cross'), tg=slots.filter(s=>s.target).slice();
    // arrows: from each metal electron to the nearest unfilled target
    const used=new Set();
    const cat=src.map(s=>({s,done:false}));
    cat.forEach(c=>{
      let bi=-1,bd=1e9; tg.forEach((t,i)=>{ if(used.has(i)) return; const d=Math.hypot(t.x-c.s.x,t.y-c.s.y); if(d<bd){bd=d;bi=i;} });
      if(bi>=0){ used.add(bi); const t=tg[bi]; arrows.push({x1:c.s.x,y1:c.s.y,x2:t.x,y2:t.y}); }
    });
  }
  return {circles,slots,arrows,ions,atoms:items,legend:[{t:'cross',txt:'electrons from '+P.M+' (metal)'},{t:'dot',txt:'electrons from '+P.X+' (non-metal)'}]};
}

/* ---------- Metallic scene ---------- */
function metScene(P,n,stage){
  const cols=4,rows=3,s=64,R=24, circles=[], slots=[];
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) circles.push({x:c*s,y:r*s,R,label:P.M,charge:(stage==='final'&&n>0)?chargeText(n,'+'):'',metal:true});
  const base=[];
  for(let r=0;r<rows;r++) for(let c=0;c<cols-1;c++) base.push([(c+.5)*s,r*s]);
  for(let r=0;r<rows-1;r++) for(let c=0;c<cols;c++) base.push([c*s,(r+.5)*s]);
  for(let r=0;r<rows-1;r++) for(let c=0;c<cols-1;c++) base.push([(c+.5)*s,(r+.5)*s]);
  const N=stage==='final'?n*cols*rows:0;
  const pick=[];
  if(N<=base.length){ for(let i=0;i<N;i++) pick.push(base[Math.floor(i*base.length/N)]); }
  else { base.forEach(p=>pick.push(p)); const extra=N-base.length; for(let i=0;i<extra;i++){ const p=base[Math.floor(i*base.length/extra)]; pick.push([p[0]+9,p[1]+9]); } }
  pick.forEach((p,i)=>slots.push({x:p[0],y:p[1],expect:'cross',fixed:true,drift:i}));
  return {circles,slots,arrows:[],ions:[],atoms:[],sea:N>0,legend:[{t:'cross',txt:'delocalised electron from a '+P.M+' atom'}]};
}
