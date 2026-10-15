
/* ---------- Electron lab: drag the electrons ---------- */
const DL={tab:'ionic',lvl:'guided',idx:{ionic:0,covalent:0,metallic:0},S:null,sel:-1,msg:'',drag:null,anim:0};
const DLIST=()=>({ionic:LIST.filter(p=>p.type==='ionic'),covalent:LIST.filter(p=>p.type==='covalent'),metallic:LIST.filter(p=>p.type==='metallic')}[DL.tab]);
const easeIO=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const lerp=(a,b,t)=>a+(b-a)*t;

/* ----- set up each kind of substance ----- */
function dlInit(){
  cancelAnimationFrame(DL.anim); DL.gwhy=''; DL.sel=-1; DL.msg=''; DL.drag=null;
  const P=DLIST()[DL.idx[DL.tab]]; const S={P,tok:[],done:false,t:0,gate:false,gwrong:[],gq:dlGate(DL.tab,P)};
  if(DL.tab==='ionic'){
    const sc=ionScene(P,'atoms'); S.sc=sc; S.tgt=[];
    sc.slots.forEach(s=>{ if(s.target) S.tgt.push({x:s.x,y:s.y,f:-1}); else if(s.expect==='cross') S.tok.push({id:S.tok.length,kind:'cross',hx:s.x,hy:s.y,x:s.x,y:s.y,slot:-1}); });
    S.fin=ionScene(P,'final');
  } else if(DL.tab==='covalent'){
    const F=covScene(P,'final'), at=F.atoms, gap=40;
    at.forEach(a=>{ a.x1=a.x; a.y1=a.y; if(a.parent==null){a.x0=0;a.y0=0;} else { const p=at[a.parent], d=a.R+p.R+gap; a.x0=p.x0+d*Math.cos(RAD(a.ang)); a.y0=p.y0-d*Math.sin(RAD(a.ang)); } });
    S.at=at; S.F=F; S.bonds=F.bonds.map(b=>({a:b.a,b:b.b,order:b.order,pairs:Array.from({length:b.order},()=>[-1,-1])}));
    at.forEach((a,i)=>{ const faces=a.nbrs.map(j=>nearestSide(Math.atan2(at[j].y0-a.y0,at[j].x0-a.x0)*180/Math.PI));
      shellSlots(0,0,a.R,EL[a.sym].ve,sideOrder(faces),a.type).forEach(s=>S.tok.push({id:S.tok.length,atom:i,kind:a.type,off0:[s.x,s.y],off1:null,st:null})); });
  } else {
    const R=34, sp=132, cols=3, rows=2, ve=EL[P.M].ve; S.R=R; S.atoms=[];
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) S.atoms.push({x:c*sp,y:r*sp});
    S.atoms.forEach((a,i)=>{ shellSlots(a.x,a.y,R,ve,[0,180,90,270],'cross').forEach(s=>S.tok.push({id:S.tok.length,atom:i,kind:'cross',hx:s.x,hy:s.y,x:s.x,y:s.y,sea:false})); });
    S.sp=sp; S.cols=cols; S.rows=rows;
  }
  DL.S=S;
}

/* ----- geometry helpers for covalent ----- */
function cvPos(S,i,t){ const a=S.at[i], e=easeIO(t); return [lerp(a.x0,a.x1,e),lerp(a.y0,a.y1,e)]; }
function cvBondPos(S,bi,k,side,t){
  const b=S.bonds[bi], A=cvPos(S,b.a,t), B=cvPos(S,b.b,t), dx=B[0]-A[0], dy=B[1]-A[1], d=Math.hypot(dx,dy), ux=dx/d, uy=dy/d;
  const cl=(d-S.at[b.b].R+S.at[b.a].R)/2, s=(k-(b.order-1)/2)*14, qx=A[0]+ux*cl-uy*s, qy=A[1]+uy*cl+ux*s;
  return side===0?[qx-ux*5,qy-uy*5]:[qx+ux*5,qy+uy*5];
}
function cvTokPos(S,tk,t){
  if(tk.st) return cvBondPos(S,tk.st.bi,tk.st.k,tk.st.side,t);
  const A=cvPos(S,tk.atom,t), o1=tk.off1||tk.off0, e=easeIO(t);
  return [A[0]+lerp(tk.off0[0],o1[0],e),A[1]+lerp(tk.off0[1],o1[1],e)];
}
function dlTokXY(S,tk){
  if(DL.tab==='covalent') return cvTokPos(S,tk,S.t);
  return [tk.x,tk.y];
}

/* ----- drawing ----- */
function fitSVG(svg,x0,y0,w,h,id){
  return svg.replace(/viewBox="[^"]*"/,'viewBox="'+f1(x0)+' '+f1(y0)+' '+f1(w)+' '+f1(h)+'"').replace(/style="width:[^"]*"/,'style="width:min(100%,'+Math.round(w*1.5)+'px);touch-action:none"').replace('<svg ','<svg id="'+id+'" ');
}
function tokHTML(S,tk,live){
  const [x,y]=dlTokXY(S,tk), sel=DL.sel===tk.id;
  return '<g class="dtok'+(live?' live':'')+'" data-tok="'+tk.id+'" transform="translate('+f1(x)+' '+f1(y)+')">'+(sel?'<circle r="10" fill="none" stroke="var(--sel)" stroke-width="2"/>':'')+glyph(tk.kind,0,0)+(live?'<circle r="15" fill="transparent" class="tokhit" tabindex="0" role="button" aria-label="Electron, drag it or press Enter to pick it up"/>':'')+'</g>';
}
function dlSVG(){
  const S=DL.S, P=S.P, live=!S.done&&!S.anim&&S.gate;
  if(DL.tab==='ionic'){
    if(S.done){ const sc=Object.assign({},S.fin,{slots:S.fin.slots.map(s=>Object.assign({},s,{fixed:true}))}); let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; sc.circles.forEach(c=>{x0=Math.min(x0,c.x-c.R-14);y0=Math.min(y0,c.y-c.R-16);x1=Math.max(x1,c.x+c.R+44);y1=Math.max(y1,c.y+c.R+14);}); return fitSVG(drawScene(sc,{label:'The ions that formed'}),x0,y0,x1-x0,y1-y0,'drsvg'); }
    const sc=Object.assign({},S.sc,{slots:S.sc.slots.filter(s=>s.target).map((s,i)=>S.tgt[i].f<0?s:null).filter(Boolean).concat(S.sc.slots.filter(s=>!s.target&&s.expect!=='cross')),arrows:DL.lvl==='guided'&&S.tgt.some(t=>t.f<0)?S.sc.arrows:[]});
    S.view=S.view||(()=>{ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; S.sc.circles.forEach(c=>{x0=Math.min(x0,c.x-c.R-18);y0=Math.min(y0,c.y-c.R-50);x1=Math.max(x1,c.x+c.R+18);y1=Math.max(y1,c.y+c.R+18);}); return [x0,y0,x1-x0,y1-y0]; })();
    return fitSVG(drawScene(sc,{label:'Atoms ready for electron transfer'}),...S.view,'drsvg').replace(/<\/svg>$/,S.tok.map(t=>tokHTML(S,t,live)).join('')+'</svg>');
  }
  if(DL.tab==='covalent'){
    const t=S.t; const circles=S.at.map((a,i)=>{ const [x,y]=cvPos(S,i,t); return {x,y,R:a.R,label:a.sym,small:a.sym==='H'}; });
    const slots=[]; if(DL.lvl==='guided'&&!S.done&&t===0) S.bonds.forEach((b,bi)=>b.pairs.forEach((p,k)=>[0,1].forEach(sd=>{ if(p[sd]<0){ const [x,y]=cvBondPos(S,bi,k,sd,0); slots.push({x,y,expect:'dot',target:true,fixed:true}); } })));
    if(!S.view){ let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; S.at.forEach(a=>[[a.x0,a.y0],[a.x1,a.y1]].forEach(p=>{ x0=Math.min(x0,p[0]-a.R-20);y0=Math.min(y0,p[1]-a.R-20);x1=Math.max(x1,p[0]+a.R+20);y1=Math.max(y1,p[1]+a.R+20); })); S.view=[x0,y0,x1-x0,y1-y0]; }
    return fitSVG(drawScene({circles,slots,arrows:[],ions:[]},{label:'Atoms ready to share electrons'}),...S.view,'drsvg').replace(/<\/svg>$/,S.tok.map(k=>tokHTML(S,k,live)).join('')+'</svg>');
  }
  /* metallic */
  const out=S.tok.filter(k=>k.sea).length, per=EL[P.M].ve;
  const ions=[]; S.atoms.forEach((a,i)=>{ if(S.tok.filter(k=>k.atom===i&&k.sea).length===per) ions.push({x:a.x,y:a.y,R:S.R,charge:chargeText(per,'+')}); });
  const sc={circles:S.atoms.map(a=>({x:a.x,y:a.y,R:S.R,label:P.M,metal:true})),slots:[],arrows:[],ions,sea:out>0};
  const m=S.R+36, w=(S.cols-1)*S.sp+2*m, h=(S.rows-1)*S.sp+2*m;
  const svg=fitSVG(drawScene(sc,{label:'Metal atoms in a lattice'}),-m,-m,w,h,'drsvg');
  return svg.replace(/<\/svg>$/,S.tok.map(k=>{ if(S.done&&k.sea) return '<g class="drift" style="animation-delay:-'+((k.id*.7)%3).toFixed(2)+'s">'+tokHTML(S,k,false)+'</g>'; return tokHTML(S,k,live); }).join('')+'</svg>');
}

/* ----- panels ----- */
function dlInfo(){
  const S=DL.S, P=S.P, g=DL.lvl==='guided'; let h='';
  if(!S.done&&!S.gate) return dlGateCard();
  const rem=S.tok.filter(k=>DL.tab==='ionic'?k.slot<0:DL.tab==='covalent'?!k.st:!k.sea).length;
  if(!S.done){
    if(DL.tab==='ionic'){
      const placed=S.tgt.filter(t=>t.f>=0).length;
      h+='<p class="q">Drag the outer-shell electrons (red crosses) from the <b>'+EL[P.M].n+'</b> to the <b>'+EL[P.X].n+'</b> so every atom ends with a full outer shell.</p>'
        +(g?'<div class="progressline"><b>'+placed+' of '+S.tgt.length+'</b> electrons transferred. Each '+EL[P.X].n+' atom needs <b>'+P.an+'</b> more electron'+(P.an>1?'s':'')+'.</div>':'<p class="note">Work out how many electrons each atom must lose or gain.</p>');
    } else if(DL.tab==='covalent'){
      const need=S.bonds.reduce((n,b)=>n+b.order*2,0), got=S.bonds.reduce((n,b)=>n+b.pairs.reduce((m,p)=>m+(p[0]>=0)+(p[1]>=0),0),0);
      h+='<p class="q">Atoms share electrons so each one gets a full outer shell. Drag electrons into the gap between atoms to make <b>shared pairs</b>. Each atom gives one electron to every pair.</p>'
        +(g?'<div class="progressline"><b>'+got+' of '+need+'</b> electrons shared. The rest stay on their own atom as lone pairs.</div>':'<p class="note">Work out how many shared pairs each atom needs.</p>');
    } else {
      h+='<p class="q">In a metal the outer electrons leave their atoms and move freely. Drag every outer electron into the space <b>between</b> the atoms.</p>'
        +(g?'<div class="progressline"><b>'+(S.tok.length-rem)+' of '+S.tok.length+'</b> electrons delocalised. Each '+EL[P.M].n+' atom has '+EL[P.M].ve+' outer electron'+(EL[P.M].ve>1?'s':'')+'.</div>':'');
    }
    h+='<div class="actions">'+(DL.lvl==='challenge'?'':'<button class="btn ghost" data-dlx="help">Move one for me</button>')+'<button class="btn ghost" data-dlx="reset">Start again</button></div>';
  } else {
    if(DL.tab==='ionic') h+='<div class="explain"><p><b>Ions formed.</b> Each '+EL[P.M].n+' atom lost '+P.cm+' electron'+(P.cm>1?'s':'')+' and became <b>'+P.M+'<sup>'+chargeText(P.cm,'+')+'</sup></b>. Each '+EL[P.X].n+' atom gained '+P.an+' and became <b>'+P.X+'<sup>'+chargeText(P.an,'-')+'</sup></b>. Both now have a full outer shell.</p><p>The oppositely charged ions attract strongly. This electrostatic attraction is the <b>ionic bond</b>. Ratio of ions: '+P.a+' '+P.M+' : '+P.b+' '+P.X+', so the formula is <b>'+P.html+'</b>.</p></div>';
    else if(DL.tab==='covalent') h+='<div class="explain"><p><b>Molecule formed.</b> No electrons were lost or gained. Each shared pair is a <b>covalent bond</b>.</p>'+S.at.map(a=>'<p><b>'+a.sym+'</b>: '+(2*a.lone)+' electrons in lone pairs + '+(2*a.bondSum)+' in shared pairs = <b>'+(2*a.lone+2*a.bondSum)+'</b> in its outer shell.</p>').join('')+'</div>';
    else h+='<div class="explain"><p><b>Metallic bonding.</b> The atoms became positive ions, <b>'+P.M+'<sup>'+chargeText(EL[P.M].ve,'+')+'</sup></b>, in a regular lattice. The outer electrons are <b>delocalised</b>: they are free to move through the whole structure. The strong attraction between the positive ions and the sea of electrons is the <b>metallic bond</b>.</p></div>';
    h+='<div class="actions"><button class="btn" data-dlx="reset">Try again</button><button class="btn ghost" data-dlx="next">Next substance</button></div>';
  }
  if(DL.msg) h+='<p class="msg bad" role="status">'+DL.msg+'</p>';
  return '<div class="card"><div class="probhead"><h2>'+cap(P.name)+'</h2><span class="f">'+P.html+'</span></div>'+(DL.gwhy&&!S.done?'<div class="explain"><p><b>Correct.</b> '+DL.gwhy+'</p></div>':'')+h+'</div>';
}
function renderDrag(){
  const S=DL.S||(dlInit(),DL.S); const T=[['ionic','Ionic: transfer'],['covalent','Covalent: share'],['metallic','Metallic: delocalise']];
  $('drctl').innerHTML='<div class="tabs"><b>Move the electrons</b><span class="spacer"></span>'+T.map(t=>'<button class="tab" aria-selected="'+(DL.tab===t[0])+'" data-dlt="'+t[0]+'">'+t[1]+'</button>').join('')
    +'<span style="width:10px"></span><button class="tab" aria-selected="'+(DL.lvl==='guided')+'" data-dll="guided">Guided</button><button class="tab" aria-selected="'+(DL.lvl==='help')+'" data-dll="help">A little help</button><button class="tab" aria-selected="'+(DL.lvl==='challenge')+'" data-dll="challenge">Unguided</button></div><div class="chips">'
    +DLIST().map((p,i)=>'<button class="chip" data-dls="'+i+'" aria-pressed="'+(i===DL.idx[DL.tab])+'"><span class="f">'+p.html+'</span><span class="n">'+p.name+'</span></button>').join('')+'</div>';
  dlPaint();
}
function dlPaint(){
  const S=DL.S;
  $('drinfo').innerHTML=dlInfo();
  const lg=DL.tab==='ionic'?[{t:'cross',txt:'from the metal'},{t:'dot',txt:'from the non-metal'}]:DL.tab==='covalent'?[{t:S.at[0].type,txt:'from '+S.at[0].sym},...(S.at.some(a=>a.sym!==S.at[0].sym)?[{t:'cross',txt:'from '+S.at.find(a=>a.sym!==S.at[0].sym).sym}]:[{t:'cross',txt:'from the other '+S.at[0].sym}])]:[{t:'cross',txt:'outer electron'}];
  $('drdiag').innerHTML='<div class="dh"><h3>'+(DL.tab==='ionic'?'Electron transfer':DL.tab==='covalent'?'Electron sharing':'Delocalised electrons')+'</h3></div><div class="canvas">'+dlSVG()+'</div><div class="legend">'+legendHTML({legend:lg})+'</div><p class="note">Drag an electron, or tap one and then tap where it should go.</p>';
}

/* ----- placing electrons ----- */
function dlSvgPt(e){ const svg=$('drsvg'), pt=svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; const q=pt.matrixTransform(svg.getScreenCTM().inverse()); return [q.x,q.y]; }
function dlTry(id,px,py){
  const S=DL.S, tk=S.tok[id], P=S.P; DL.msg='';
  if(DL.tab==='ionic'){
    if(tk.slot>=0){ S.tgt[tk.slot].f=-1; tk.slot=-1; tk.x=tk.hx; tk.y=tk.hy; }
    let best=-1,bd=30; S.tgt.forEach((t,i)=>{ if(t.f<0){ const d=Math.hypot(t.x-px,t.y-py); if(d<bd){bd=d;best=i;} } });
    if(best>=0){ S.tgt[best].f=id; tk.slot=best; tk.x=S.tgt[best].x; tk.y=S.tgt[best].y; if(S.tgt.every(t=>t.f>=0)) dlFinish(); return; }
    const near=S.sc.circles.find(c=>Math.hypot(c.x-px,c.y-py)<c.R+16);
    if(near&&near.label===P.X) DL.msg='That atom\'s outer shell is already full, so it cannot take more electrons.';
    else if(near) DL.msg='Metal atoms lose electrons. Move it onto a non-metal atom that needs it.';
  } else if(DL.tab==='covalent'){
    if(tk.st){ S.bonds[tk.st.bi].pairs[tk.st.k][tk.st.side]=-1; tk.st=null; }
    let best=-1,bd=1e9; S.bonds.forEach((b,bi)=>{ const [ax,ay]=cvBondPos(S,bi,(b.order-1)/2,0,0),[bx,by]=cvBondPos(S,bi,(b.order-1)/2,1,0), cx=(ax+bx)/2, cy=(ay+by)/2, d=Math.hypot(cx-px,cy-py); if(d<24+9*b.order&&d<bd){bd=d;best=bi;} });
    if(best>=0){ const b=S.bonds[best];
      if(b.a!==tk.atom&&b.b!==tk.atom){ DL.msg='That bond is between '+S.at[b.a].sym+' and '+S.at[b.b].sym+'. Use an electron from one of those atoms.'; }
      else { const side=b.a===tk.atom?0:1, k=b.pairs.findIndex(p=>p[side]<0);
        if(k<0) DL.msg='This '+S.at[tk.atom].sym+' atom has already given enough electrons to this bond.';
        else { b.pairs[k][side]=id; tk.st={bi:best,k,side}; if(S.bonds.every(b=>b.pairs.every(p=>p[0]>=0&&p[1]>=0))) dlFinish(); } }
    }
  } else {
    if(tk.sea){ tk.sea=false; tk.x=tk.hx; tk.y=tk.hy; }
    const m=S.R+10, inside=px>-m&&px<(S.cols-1)*S.sp+m&&py>-m&&py<(S.rows-1)*S.sp+m, onAtom=S.atoms.some(a=>Math.hypot(a.x-px,a.y-py)<S.R+4);
    if(inside&&!onAtom){ tk.sea=true; tk.x=px; tk.y=py; if(S.tok.every(k=>k.sea)) dlFinish(); }
    else if(onAtom) DL.msg='Move it out of the atom, into the space between the atoms.';
  }
}
function dlFinish(){
  const S=DL.S; DL.sel=-1;
  if(DL.tab==='ionic'){ S.done=true; return; }
  if(DL.tab==='metallic'){ S.done=true; return; }
  S.at.forEach((a,i)=>{ const home=S.tok.filter(k=>k.atom===i&&!k.st), ls=S.F.slots.filter(s=>s.g==='l'+i); home.forEach((k,j)=>{ if(ls[j]) k.off1=[ls[j].x-a.x1,ls[j].y-a.y1]; }); });
  S.anim=1; const t0=performance.now();
  const step=now=>{ S.t=Math.min(1,(now-t0)/1100); dlPaint(); if(S.t<1) DL.anim=requestAnimationFrame(step); else { S.anim=0; S.done=true; dlPaint(); } };
  DL.anim=requestAnimationFrame(step);
}
function dlHelp(){
  const S=DL.S; DL.msg=''; if(!S.gate) return;
  if(DL.tab==='ionic'){ const k=S.tok.find(k=>k.slot<0), i=S.tgt.findIndex(t=>t.f<0); if(k&&i>=0){ dlTry(k.id,S.tgt[i].x,S.tgt[i].y); } }
  else if(DL.tab==='covalent'){ for(const [bi,b] of S.bonds.entries()){ for(let k=0;k<b.order;k++) for(const side of [0,1]){ if(b.pairs[k][side]<0){ const atom=side?b.b:b.a, tk=S.tok.find(t=>t.atom===atom&&!t.st); if(tk){ const [x,y]=cvBondPos(S,bi,k,side,0); dlTry(tk.id,x,y); return; } } } } }
  else { const tk=S.tok.find(t=>!t.sea); if(tk){ const a=S.atoms[tk.atom], c=(tk.atom%S.cols<S.cols-1)?1:-1; dlTry(tk.id,a.x+c*S.sp/2+((tk.id%2)?9:-9),a.y+((tk.id%3)-1)*16); } }
}
function dlReset(){ dlInit(); renderDrag(); }

/* ----- pointer handling ----- */
document.addEventListener('pointerdown',e=>{
  const g=e.target.closest('[data-tok]'); if(!g||!$('drag')||$('drag').hidden||!DL.S||DL.S.done||DL.S.anim||!DL.S.gate) return;
  e.preventDefault(); const id=+g.dataset.tok; const [px,py]=dlSvgPt(e);
  DL.drag={id,el:g,sx:e.clientX,sy:e.clientY,moved:false,ox:0,oy:0,start:dlTokXY(DL.S,DL.S.tok[id])}; DL.drag.ox=DL.drag.start[0]-px; DL.drag.oy=DL.drag.start[1]-py;
});
document.addEventListener('pointermove',e=>{
  const d=DL.drag; if(!d) return; if(!d.moved&&Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<5) return; d.moved=true;
  const [px,py]=dlSvgPt(e); d.el.setAttribute('transform','translate('+f1(px+d.ox)+' '+f1(py+d.oy)+')'); d.el.style.cursor='grabbing';
});
document.addEventListener('pointerup',e=>{
  const d=DL.drag; if(!d) return; DL.drag=null; const S=DL.S;
  if(d.moved){ const [px,py]=dlSvgPt(e); dlTry(d.id,px+d.ox,py+d.oy); DL.sel=-1; }
  else if(DL.sel===d.id) DL.sel=-1; else DL.sel=d.id;
  dlPaint();
});
document.addEventListener('click',e=>{
  const sv=e.target.closest('#drsvg'); if(sv&&!e.target.closest('[data-tok]')&&DL.sel>=0&&DL.S&&!DL.S.done){ const [px,py]=dlSvgPt(e), id=DL.sel; DL.sel=-1; dlTry(id,px,py); dlPaint(); return; }
  const t=e.target.closest('[data-dlt],[data-dll],[data-dls],[data-dlx],[data-dlg]'); if(!t) return;
  if(t.dataset.dlg!==undefined){ const S=DL.S, q=S.gq; if(t.dataset.dlg==='check'){ const pl=dlPlan(S), v=S.plan||(S.plan={v:[],bad:[],tries:0}); v.bad=[]; pl.f.forEach((f,i)=>{ const el=document.querySelector('[data-dlp="'+i+'"]'); v.v[i]=el?el.value.trim():''; if(parseInt(v.v[i],10)!==f.a||!/^\d+$/.test(v.v[i])) v.bad.push(i); }); v.tries++; if(!v.bad.length){ S.gate=true; v.tries=0; DL.gwhy='Your plan works. '+pl.sum; } }
    else if(t.dataset.dlg==='skip'){ S.gate=true; } else { const k=+t.dataset.dlg; if(q.o[k]===q.right){ S.gate=true; DL.gwhy=q.why; } else if(!S.gwrong.includes(k)) S.gwrong.push(k); } dlPaint(); return; }
  if(t.dataset.dlt){ DL.tab=t.dataset.dlt; dlInit(); renderDrag(); }
  else if(t.dataset.dll){ DL.lvl=t.dataset.dll; DL.S.view=null; renderDrag(); }
  else if(t.dataset.dls!==undefined){ DL.idx[DL.tab]=+t.dataset.dls; dlInit(); renderDrag(); }
  else if(t.dataset.dlx==='reset') dlReset();
  else if(t.dataset.dlx==='next'){ DL.idx[DL.tab]=(DL.idx[DL.tab]+1)%DLIST().length; dlInit(); renderDrag(); }
  else if(t.dataset.dlx==='help'){ dlHelp(); dlPaint(); }
});
document.addEventListener('keydown',e=>{
  if(e.key!=='Enter'&&e.key!==' ') return; const g=e.target.closest&&e.target.closest('[data-tok]'); if(!g||!DL.S||DL.S.done) return;
  e.preventDefault(); const id=+g.dataset.tok; DL.sel=DL.sel===id?-1:id; dlPaint();
});

const cp=w=>w[0].toUpperCase()+w.slice(1);
function dlGate(tab,P){
  let Q;
  if(tab==='ionic'){
    const m=EL[P.M], x=EL[P.X], cm=P.cm, an=P.an, u=n=>n+' electron'+(n>1?'s':'');
    Q={p:'Before you start: '+cp(m.n)+' atoms have '+u(m.ve)+' in their outer shell and '+x.n+' atoms have '+x.ve+'. What must happen for each atom to get a full outer shell?',
      right:m.n[0].toUpperCase()+m.n.slice(1)+' loses '+u(cm)+' and '+x.n+' gains '+u(an),
      wrong:[m.n[0].toUpperCase()+m.n.slice(1)+' gains '+u(an)+' and '+x.n+' loses '+u(cm), 'Both atoms lose '+u(cm), 'Both atoms share '+u(Math.min(cm,an))+' in a pair'],
      why:'A metal atom has few outer electrons, so it is easiest to lose '+cm+' and be left with the full shell underneath. A non-metal atom needs '+an+' more, so it gains '+an+'. The transfer gives both a full outer shell.'};
  } else if(tab==='covalent'){
    const c=P.c, e=EL[c], full=c==='H'?2:8, need=full-e.ve;
    const opts=[need,need+1,Math.max(1,need-1),need+2].filter((v,i,a)=>v>0&&a.indexOf(v)===i).slice(0,4);
    while(opts.length<4) opts.push(opts[opts.length-1]+1);
    const f=n=>n+' more electron'+(n>1?'s':'');
    const wr=opts.filter(v=>v!==need).slice(0,3);
    Q={p:'Before you start: '+cp(e.n)+' atoms have '+e.ve+' electron'+(e.ve>1?'s':'')+' in their outer shell. A full outer shell holds '+full+'. How many more electrons does it need?',
      right:f(need), wrong:wr.map(f),
      why:'A full shell needs '+full+', and '+e.n+' already has '+e.ve+', so it needs '+need+' more. Non-metal atoms cannot take electrons from each other, so they share pairs to fill their outer shells.'};
  } else {
    const m=EL[P.M], n=m.ve, u=k=>k+' electron'+(k>1?'s':'');
    Q={p:'Before you start: '+cp(m.n)+' atoms have '+u(n)+' in their outer shell. What happens to them in a metal?',
      right:'All '+n+' become delocalised, leaving a '+chargeText(n,'+')+' ion',
      wrong:[m.n[0].toUpperCase()+m.n.slice(1)+' gains '+(8-n)+' electrons to fill its shell','They are shared in pairs with one neighbouring atom','They stay fixed to their own atom'],
      why:'The outer electrons leave their atoms and move freely. Each atom becomes a '+chargeText(n,'+')+' ion held together by its attraction to the sea of delocalised electrons.'};
  }
  const o=shuffle([Q.right].concat(Q.wrong)); return {p:Q.p,o,right:Q.right,why:Q.why};
}
function dlPlan(S){
  const P=S.P, ve=k=>EL[k].ve;
  if(DL.tab==='ionic') return {f:[
    {l:cp(EL[P.M].n)+': outer electrons in one atom',a:ve(P.M),h:'Use the group number in the periodic table.'},
    {l:cp(EL[P.X].n)+': outer electrons in one atom',a:ve(P.X),h:'Use the group number in the periodic table.'},
    {l:'Electrons each '+EL[P.M].n+' atom loses',a:P.cm,h:'A metal loses its outer electrons to be left with a full shell.'},
    {l:'Electrons each '+EL[P.X].n+' atom gains',a:P.an,h:'A full shell is 8, so gain 8 minus the outer electrons.'},
    {l:'Total electrons that move in '+P.html.replace(/<[^>]+>/g,m=>m),a:S.tgt.length,h:'Number of metal atoms ('+P.a+') × electrons each one loses.'}],
    sum:'Each '+EL[P.M].n+' atom loses '+P.cm+' and each '+EL[P.X].n+' atom gains '+P.an+', so '+S.tgt.length+' electron'+(S.tgt.length>1?'s':'')+' move in total.'};
  if(DL.tab==='covalent'){
    const c=P.c, t=P.t, full=k=>k==='H'?2:8, pairs=S.bonds.reduce((n,b)=>n+b.order,0), f=[{l:cp(EL[c].n)+': outer electrons in one atom',a:ve(c),h:'Use the group number in the periodic table.'}];
    if(t!==c) f.push({l:cp(EL[t].n)+': outer electrons in one atom',a:ve(t),h:'Use the group number in the periodic table.'});
    f.push({l:'Electrons one '+EL[c].n+' atom needs to fill its outer shell',a:full(c)-ve(c),h:'A full shell is '+full(c)+' ('+'2 for hydrogen, 8 for the others)'+'.'});
    f.push({l:'Total shared pairs (covalent bonds) in the molecule',a:pairs,h:'Count the lines in the structural formula. A double bond is 2 pairs.'});
    return {f,sum:'The molecule has '+pairs+' shared pair'+(pairs>1?'s':'')+', so '+(2*pairs)+' electrons are shared in total.'};
  }
  return {f:[
    {l:cp(EL[P.M].n)+': outer electrons in one atom',a:ve(P.M),h:'Use the group number in the periodic table.'},
    {l:'Electrons each atom releases into the sea',a:ve(P.M),h:'Metal atoms release all of their outer electrons.'},
    {l:'Electrons delocalised from the '+S.atoms.length+' atoms shown',a:S.tok.length,h:'Atoms shown × electrons released by each atom.'}],
    sum:'Each atom releases '+ve(P.M)+', so '+S.tok.length+' electrons are delocalised from the atoms shown.'};
}
function dlGateCard(){
  const S=DL.S, P=S.P, head='<div class="probhead"><h2>'+cap(P.name)+'</h2><span class="f">'+P.html+'</span></div>';
  if(DL.lvl!=='guided'){
    const pl=dlPlan(S), v=S.plan||(S.plan={v:[],bad:[],tries:0}), hint=DL.lvl==='help';
    return '<div class="card">'+head+'<p class="q"><b>Plan first: work out the numbers before you move any electrons.</b></p>'
      +pl.f.map((f,i)=>'<div style="margin-bottom:14px"><div class="fld"><span>'+f.l+'</span><input type="text" inputmode="numeric" data-dlp="'+i+'" value="'+(v.v[i]||'')+'" autocomplete="off"'+(v.bad.includes(i)?' class="bad"':'')+'>'+'</div>'+(hint?'<div class="note" style="margin-top:4px">Hint: '+f.h+'</div>':'')+'</div>').join('')
      +(v.tries?'<p class="msg bad">Not quite. Check the highlighted boxes and try again.</p>':'')
      +'<div class="actions"><button class="btn" data-dlg="check">Check my plan</button><button class="btn ghost" data-dlg="skip">Skip the plan</button></div></div>';
  }
  const q=S.gq; return '<div class="card">'+head+'<p class="q"><b>'+q.p+'</b></p><div class="qopts">'
    +q.o.map((t,k)=>'<button class="qopt'+(S.gwrong.includes(k)?' bad':'')+'" data-dlg="'+k+'">'+t+'</button>').join('')+'</div>'
    +(S.gwrong.length?'<p class="msg bad">Not quite. Think about full outer shells and try again.</p>':'')+'<div class="actions"><button class="btn ghost" data-dlg="skip">Skip the question</button></div></div>';
}
