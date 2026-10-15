/* ---------- 3D models ---------- */
const reduceMotion=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let g3={yaw:-.6,pitch:.45,auto:!reduceMotion,drag:false,raf:0,scene:null,lx:0,ly:0,w:0,h:0};
let gdim='2d';
function diamondLattice(cells){
  const pts=[],key={},add=(x,y,z)=>{const k=[x,y,z].map(v=>Math.round(v*100)).join(); if(!(k in key)){key[k]=1;pts.push([x,y,z]);}};
  const fcc=[[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]];
  for(let a=0;a<cells;a++)for(let b=0;b<cells;b++)for(let c=0;c<cells;c++)fcc.forEach(f=>{add(a+f[0],b+f[1],c+f[2]);add(a+f[0]+.25,b+f[1]+.25,c+f[2]+.25);});
  const bonds=[]; for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const d=Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1],pts[i][2]-pts[j][2]); if(Math.abs(d-.4330)<.01)bonds.push([i,j]);}
  return {pts,bonds};
}
function build3D(id){
  const atoms=[],bonds=[]; const add=(x,y,z,k,r)=>{atoms.push({x,y,z,k,r});return atoms.length-1;};
  let bw=2.4;
  if(id==='ionic'){
    const n=3,ix={}; for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++){const c=(i+j+k)%2; ix[i+','+j+','+k]=add(i-1,j-1,k-1,c?'cat':'an',c?.15:.25);}
    for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++){[[1,0,0],[0,1,0],[0,0,1]].forEach(d=>{const t=ix[(i+d[0])+','+(j+d[1])+','+(k+d[2])]; if(t!=null)bonds.push([ix[i+','+j+','+k],t,'attr']);});}
  } else if(id==='diamond'||id==='silica'){
    const L=diamondLattice(2), c=[1,1,1];
    if(id==='diamond'){ L.pts.forEach(p=>add(p[0]-c[0],p[1]-c[1],p[2]-c[2],'c',.075)); L.bonds.forEach(b=>bonds.push([b[0],b[1],'bond'])); bw=3.2; }
    else { const si=L.pts.map(p=>add(p[0]-c[0],p[1]-c[1],p[2]-c[2],'si',.075));
      L.bonds.forEach(b=>{const A=L.pts[b[0]],B=L.pts[b[1]]; const o=add((A[0]+B[0])/2-c[0],(A[1]+B[1])/2-c[1],(A[2]+B[2])/2-c[2],'ox',.045); bonds.push([si[b[0]],o,'bond'],[o,si[b[1]],'bond']);}); bw=1.8; }
  } else {
    const layers=id==='graphite'?3:1, cols=id==='graphite'?4:6, rows=id==='graphite'?3:4, a=.34;
    const net=hexNet(cols,rows,a); const mx=Math.max(...net.atoms.map(p=>p.x))/2, my=Math.max(...net.atoms.map(p=>p.y))/2; const ids=[];
    for(let L=0;L<layers;L++){ const y=(L-(layers-1)/2)*.62, sh=L%2?a*.5:0; ids.push(net.atoms.map(p=>add(p.x-mx+sh,y,p.y-my,'c',.06)));
      net.bonds.forEach(b=>bonds.push([ids[L][b[0]],ids[L][b[1]],'bond'])); }
    for(let L=0;L<layers-1;L++) for(let i=0;i<net.atoms.length;i+=3) bonds.push([ids[L][i],ids[L+1][i],'weak']);
    bw=3;
  }
  const n=atoms.length, m=[0,0,0]; atoms.forEach(a=>{m[0]+=a.x/n;m[1]+=a.y/n;m[2]+=a.z/n;}); atoms.forEach(a=>{a.x-=m[0];a.y-=m[1];a.z-=m[2];});
  const ext=Math.max(...atoms.map(a=>Math.hypot(a.x,a.y,a.z)+a.r));
  return {atoms,bonds,ext,bw};
}
function draw3D(cv,st){
  st=st||g3;
  const par=cv.parentElement, w=Math.max(260,par.clientWidth-24), h=Math.round(Math.min(380,w*.78)), dpr=Math.min(2,window.devicePixelRatio||1);
  if(st.w!==w||st.h!==h||cv.width!==Math.round(w*dpr)){ cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); cv.style.width=w+'px'; cv.style.height=h+'px'; st.w=w; st.h=h; }
  const ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
  const css=getComputedStyle(document.documentElement), col=n=>css.getPropertyValue(n).trim();
  const ink=col('--ink'), ink2=col('--ink2'), panel=col('--panel');
  const C={cat:col('--cross'),an:col('--dot'),c:ink,si:col('--dot'),ox:col('--cross'),H:ink2,C:ink,N:col('--dot'),O:col('--cross'),Cl:col('--ok'),lp:col('--warn')};
  const sc=st.scene, cy=Math.cos(st.yaw), sy=Math.sin(st.yaw), cp=Math.cos(st.pitch), sp=Math.sin(st.pitch);
  const s0=.5*Math.min(w,h)/sc.ext, f=sc.ext*4;
  const P=sc.atoms.map(a=>{ const x1=a.x*cy+a.z*sy, z1=-a.x*sy+a.z*cy, y2=a.y*cp-z1*sp, z2=a.y*sp+z1*cp, k=f/(f+z2); return {px:w/2+x1*s0*k,py:h/2-y2*s0*k,z:z2,k,a}; });
  const items=[];
  sc.bonds.forEach(b=>{const A=P[b[0]],B=P[b[1]]; items.push({z:(A.z+B.z)/2,b,A,B});});
  P.forEach(p=>items.push({z:p.z,p}));
  items.sort((u,v)=>v.z-u.z);
  const fade=z=>.45+.55*(1-(z+sc.ext)/(2*sc.ext));
  items.forEach(it=>{
    if(it.b){ const t=it.b[2], n=it.b[3]||1, k=(it.A.k+it.B.k)/2; ctx.globalAlpha=fade(it.z)*(t==='attr'?.55:1); ctx.strokeStyle=t==='bond'?ink:ink2; ctx.lineWidth=(t==='bond'?sc.bw:t==='attr'?1.2:1.6)*k/(n>1?1.6:1);
      ctx.setLineDash(t==='bond'?[]:[4,4]); const dx=it.B.px-it.A.px, dy=it.B.py-it.A.py, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L;
      for(let i=0;i<n;i++){ const o=(i-(n-1)/2)*5.5*k; ctx.beginPath(); ctx.moveTo(it.A.px+nx*o,it.A.py+ny*o); ctx.lineTo(it.B.px+nx*o,it.B.py+ny*o); ctx.stroke(); } ctx.setLineDash([]); }
    else { const p=it.p, r=Math.max(2,p.a.r*s0*p.k); ctx.globalAlpha=fade(p.z)*(p.a.k==='lp'?.22:1); ctx.fillStyle=C[p.a.k]; ctx.beginPath(); ctx.arc(p.px,p.py,r,0,6.2832); ctx.fill();
      ctx.lineWidth=p.a.k==='lp'?.8:1.2; ctx.strokeStyle=p.a.k==='lp'?C.lp:panel; ctx.stroke(); }
  });
  ctx.globalAlpha=1;
}
function startViewer(id,st,hid,mk){
  cancelAnimationFrame(st.raf); const cv=$(id); if(!cv) return;
  st.scene=mk();
  if(!cv._bound){ cv._bound=1;
    cv.addEventListener('pointerdown',e=>{st.drag=true;st.lx=e.clientX;st.ly=e.clientY;try{cv.setPointerCapture(e.pointerId);}catch(_){}});
    cv.addEventListener('pointermove',e=>{ if(!st.drag) return; st.yaw+=(e.clientX-st.lx)*.01; st.pitch=Math.max(-1.45,Math.min(1.45,st.pitch+(e.clientY-st.ly)*.01)); st.lx=e.clientX;st.ly=e.clientY; if(!st.raf) draw3D(cv,st); });
    ['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,()=>{st.drag=false;}));
  }
  const tick=()=>{ const c=$(id); if(!c||hid()){st.raf=0;return;} if(st.auto&&!st.drag) st.yaw+=.006; draw3D(c,st); st.raf=requestAnimationFrame(tick); };
  tick();
}
function start3D(){ startViewer('g3d',g3,()=>$('giant').hidden,()=>build3D(GS[gi].id)); }
const GCAP3={
  ionic:'Drag to turn the lattice. Every ion is surrounded by ions of the opposite charge in all three directions, held by strong electrostatic attraction.',
  diamond:'Drag to turn it. Each carbon is bonded to four others, pointing to the corners of a tetrahedron, all the way through the crystal.',
  graphite:'Drag to turn it. Flat layers of hexagons with strong bonds inside each layer. The dashed lines are the weak forces between layers.',
  graphene:'Drag to turn it. A single flat sheet of hexagons, one atom thick.',
  silica:'Drag to turn it. Each silicon (blue) has four oxygen atoms (red) around it, and every oxygen joins two silicon atoms.'
};
const LEG3={ionic:[['cross','Na⁺ (small)'],['dot','Cl⁻ (large)']],diamond:[['ink','carbon atom']],graphite:[['ink','carbon atom']],graphene:[['ink','carbon atom']],silica:[['dot','silicon'],['cross','oxygen']]};
const leg3=id=>'<div class="legend">'+LEG3[id].map(l=>'<span><i class="sw" style="background:var(--'+l[0]+')"></i> '+l[1]+'</span>').join('')+'</div>';

/* ---------- Bond lines for covalent molecules ---------- */
function drawLines(P,o){
  o=o||{}; const at=covScene(P,'atoms'), fin=covScene(P,'final'), S=.6;
  const pos=at.atoms.map(a=>[a.x*S,a.y*S]);
  const xs=pos.map(p=>p[0]), ys=pos.map(p=>p[1]), x0=Math.min(...xs)-34,y0=Math.min(...ys)-34,w=Math.max(...xs)-x0+34,h=Math.max(...ys)-y0+34;
  let s='<svg viewBox="'+f1(x0)+' '+f1(y0)+' '+f1(w)+' '+f1(h)+'" style="width:min(100%,'+Math.round(w*2.1)+'px)" role="img" aria-label="Bond lines of '+P.name+'">';
  at.bonds.forEach((b,bi)=>{
    const A=pos[b.a],B=pos[b.b],dx=B[0]-A[0],dy=B[1]-A[1],d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d,px=-uy,py=ux, t=12;
    const ord=o.orders?o.orders[bi]:b.order, cls='lnb'+(o.res&&o.res[bi]!=null?(o.res[bi]?' ok':' bad'):'');
    for(let k=0;k<ord;k++){ const off=(k-(ord-1)/2)*6; s+='<line class="'+cls+'" x1="'+f1(A[0]+ux*t+px*off)+'" y1="'+f1(A[1]+uy*t+py*off)+'" x2="'+f1(B[0]-ux*t+px*off)+'" y2="'+f1(B[1]-uy*t+py*off)+'"/>'; }
    if(o.interactive) s+='<line class="hitb" data-lb="'+bi+'" tabindex="0" role="button" aria-label="Bond '+(bi+1)+', currently order '+ord+'" x1="'+f1(A[0]+ux*t)+'" y1="'+f1(A[1]+uy*t)+'" x2="'+f1(B[0]-ux*t)+'" y2="'+f1(B[1]-uy*t)+'"/>';
  });
  at.atoms.forEach((a,i)=>{ s+='<text class="sym" x="'+f1(pos[i][0])+'" y="'+f1(pos[i][1])+'">'+a.sym+'</text>'; });
  if(o.lone) fin.atoms.forEach((a,i)=>{ if(!(a.lone>0)) return; const L=a.lone, ph=a.phi, angs=L===1?[ph]:L===2?[ph-55,ph+55]:[ph,ph-90,ph+90];
    angs.forEach(t=>{ const cx=pos[i][0]+19*Math.cos(RAD(t)), cy=pos[i][1]+19*Math.sin(RAD(t)), tx=-Math.sin(RAD(t))*4, ty=Math.cos(RAD(t))*4;
      s+=glyph(a.type,cx-tx,cy-ty)+glyph(a.type,cx+tx,cy+ty); }); });
  return s+'</svg>';
}
const BW=['','single','double','triple'];
function bondSummary(P,orders){
  const at=covScene(P,'atoms'), seen={}, out=[];
  at.bonds.forEach((b,bi)=>{ const A=at.atoms[b.a].sym,B=at.atoms[b.b].sym,o=orders?orders[bi]:b.order,k=[A,B].sort().join('-')+o; if(seen[k]) return; seen[k]=1;
    out.push('<p><b>'+A+(['','–','=','≡'][o])+B+'</b>: '+BW[o]+' bond, '+o+' shared pair'+(o>1?'s':'')+' ('+o*2+' electrons)</p>'); });
  return out.join('');
}
function viewTabs(dg){ return '<div class="tabs" style="margin-bottom:10px"><button class="tab" aria-selected="'+(dg.view!=='lines')+'" data-dv="dc">Dot-and-cross</button><button class="tab" aria-selected="'+(dg.view==='lines')+'" data-dv="lines">Bond lines</button></div>'; }
function linesPanel(){
  const dg=G.dg, inter=mode!=='worked'&&!dg.lok;
  const orders=mode==='worked'?null:dg.orders;
  let h='<div class="canvas">'+drawLines(P,{orders,lone:dg.lone,interactive:inter,res:dg.lres})+'</div>';
  h+='<div class="actions" style="margin-top:10px"><button class="btn ghost" data-lx="lone">'+(dg.lone?'Hide lone pairs':'Show lone pairs')+'</button>'+(inter?'<button class="btn" data-lx="lcheck">Check bonds</button>':'')+'</div>';
  if(mode==='worked'){ h+='<p class="note">Each line is one shared pair of electrons. A double bond is two lines and a triple bond is three.</p><div class="explain">'+bondSummary(P,null)+'</div>'; }
  else if(dg.lok){ h+='<p class="msg ok">Correct.</p><div class="explain">'+bondSummary(P,dg.orders)+'</div>'; }
  else { h+='<p class="note">Click a bond to change it between single, double and triple. Each line is one shared pair of electrons.</p>'; if(dg.lmsg) h+='<p class="msg bad">'+dg.lmsg+'</p>'; }
  return h;
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-dv],[data-lx],[data-lb],[data-gd],[data-gx],[data-gy]'); if(!t) return;
  const dg=G&&G.dg;
  if(t.dataset.dv){ dg.view=t.dataset.dv; renderDiag(); }
  else if(t.dataset.lx==='lone'){ dg.lone=!dg.lone; renderDiag(); }
  else if(t.dataset.lx==='lcheck'){ const at=covScene(P,'atoms'); dg.lres=at.bonds.map((b,i)=>dg.orders[i]===b.order); const n=dg.lres.filter(Boolean).length;
    if(n===at.bonds.length){ dg.lok=true; dg.lmsg=''; } else dg.lmsg=n+' of '+at.bonds.length+' bonds are right. The red lines need another look.'; renderDiag(); }
  else if(t.dataset.lb!==undefined){ const i=+t.dataset.lb; dg.orders[i]=dg.orders[i]%3+1; if(dg.lres) dg.lres[i]=null; renderDiag(); const el=document.querySelector('.hitb[data-lb="'+i+'"]'); if(el) el.focus(); }
  else if(t.dataset.gd){ gdim=t.dataset.gd; renderGiant(); }
  else if(t.dataset.gx==='auto'){ g3.auto=!g3.auto; renderGiant(); }
  else if(t.dataset.gx==='rview'){ g3.yaw=-.6; g3.pitch=.45; renderGiant(); }
  else if(t.dataset.gx==='mnext'){ newMystery(); renderGiant(); }
  else if(t.dataset.gy!==undefined){ const i=+t.dataset.gy; if(mys.done) return; if(i===mys.t){ mys.done=true; gi=mys.t; } else { mys.wrong.push(i); mys.shown=Math.min(3,mys.shown+1); } renderGiant(); }
});
document.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('hitb')){ e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click',{bubbles:true})); } });

/* ---------- Mystery structure ---------- */
const CLUES={
  ionic:['It is brittle and breaks when struck.','It does not conduct as a solid, but it conducts when molten.','It has a high melting point because of strong attractions between oppositely charged particles.'],
  diamond:['It does not conduct electricity.','It is one of the hardest materials known.','Every atom forms four covalent bonds to four neighbours.'],
  graphite:['It feels soft and slippery.','It conducts electricity, even as a solid.','Its layers are held together by weak forces.'],
  graphene:['It is only one atom thick.','It conducts electricity and is extremely strong for its mass.','It is used in electronics and lightweight composites.'],
  silica:['It is the main compound in sand.','It does not conduct and has a very high melting point.','Each atom of one element is bonded to four atoms of another element.']
};
let mys=null;
function newMystery(){ let t; do{ t=Math.floor(Math.random()*GS.length); }while(mys&&t===mys.t); mys={t,shown:1,done:false,wrong:[]}; }
function renderMystery(){
  if(!mys) newMystery(); const g=GS[mys.t], id=g.id;
  let h='<div class="card"><h3 style="margin-bottom:8px">Which structure am I?</h3><p class="q">Pick a structure from the buttons above. Each wrong guess gives you another clue.</p><ol class="clues">'+CLUES[id].slice(0,mys.shown).map(c=>'<li>'+c+'</li>').join('')+'</ol>';
  if(mys.done){ h+='<p class="msg ok">Solved with '+mys.shown+' clue'+(mys.shown>1?'s':'')+'. It is '+g.name.toLowerCase()+'.</p><div class="explain"><p>'+g.rows[1]+'</p></div><div class="actions" style="margin-top:10px"><button class="btn" data-gx="mnext">Next mystery</button></div>'; }
  else if(mys.wrong.length) h+='<p class="msg bad">Not that one. Here is another clue.</p>';
  $('ginfo').innerHTML=h+'</div>';
  const gd=mys.done?'<div class="dh"><h3>'+g.name+'</h3></div><div class="canvas">'+gDiagram()+'</div><p class="note">'+GCAP[id]()+'</p>':'<div class="dh"><h3>Mystery structure</h3></div><div class="canvas"><p class="lock">The diagram appears when you solve it.</p></div>';
  $('gdiag').innerHTML=gd; $('gcmp').hidden=true;
}
