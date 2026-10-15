/* ---------- Giant structures ---------- */
const BONDQ=['Strong electrostatic attraction between ions','Strong covalent bonds in all directions','Strong covalent bonds in layers, with weak forces between the layers','Strong covalent bonds in a single flat sheet'];
const MPQ=['The strong electrostatic attractions between ions','The strong covalent bonds','Only the weak forces between layers'];
const WHYQ=['Delocalised electrons can move','Ions are free to move','There are no free ions or electrons'];
const HARDQ=['Very hard','Soft and slippery','Hard but brittle','Strong, light and flexible'];
const MOLQ=['It conducts, because the ions are free to move','It still does not conduct','It conducts, because delocalised electrons move'];
const ROWS=['Structure','Bonding','Melting point','Electrical conductivity','Hardness and properties','Uses'];
const GS=[
 {id:'ionic',name:'Giant ionic lattice',eg:'Sodium chloride, NaCl',ans:{bond:0,mp:0,cond:1,why:2,hard:2,molten:0},
  rows:['A regular, repeating lattice of alternating positive and negative ions that extends in all directions.','Strong electrostatic attraction between oppositely charged ions. Each ion is surrounded by ions of the opposite charge.','High (sodium chloride melts at 801 °C). A lot of energy is needed to overcome the many strong electrostatic attractions.','As a solid it does not conduct, because the ions are held in fixed positions. Molten or dissolved in water it conducts, because the ions are free to move and carry charge.','Hard but brittle. A blow shifts a layer so that like charges line up and repel, and the crystal splits. Many dissolve in water.','Common salt for food. Molten ionic compounds are electrolysed to make metals.'],
  cmp:['Positive and negative ions','Ionic: electrostatic attraction','High (801 °C for NaCl)','No (yes when molten or dissolved)','Hard but brittle']},
 {id:'diamond',name:'Diamond',eg:'Carbon, C',ans:{bond:1,mp:1,cond:1,why:2,hard:0},
  rows:['A giant covalent network of carbon atoms. Each carbon atom forms four covalent bonds to four others, in a tetrahedral arrangement.','Strong covalent bonds in all directions throughout the structure. All four outer electrons of each carbon are used in bonding.','Very high (above 3500 °C). A huge number of strong covalent bonds must be broken.','Does not conduct. There are no ions and no delocalised electrons, because every outer electron is held in a bond.','Very hard, one of the hardest materials, because the rigid network of strong bonds resists any change in shape.','Cutting and drilling tools, polishing, and jewellery.'],
  cmp:['Carbon atoms','Covalent: 4 bonds per atom','Very high','No','Very hard']},
 {id:'graphite',name:'Graphite',eg:'Carbon, C',ans:{bond:2,mp:1,cond:0,why:0,hard:1},
  rows:['A giant covalent structure of carbon atoms in flat layers of hexagons. Each carbon atom forms three covalent bonds.','Strong covalent bonds within each layer, with only weak forces between the layers. The fourth outer electron on each carbon is delocalised.','Very high (above 3500 °C). The strong covalent bonds within the layers must still be broken.','Conducts electricity, because the delocalised electrons can move along the layers and carry charge.','Soft and slippery. The weak forces between layers are easily overcome, so the layers slide over each other.','Pencil leads, lubricants, and electrodes.'],
  cmp:['Carbon atoms in layers','Covalent: 3 bonds per atom, weak forces between layers','Very high','Yes','Soft and slippery']},
 {id:'graphene',name:'Graphene',eg:'Carbon, C',ans:{bond:3,mp:1,cond:0,why:0,hard:3},
  rows:['A single layer of graphite: a flat sheet of hexagons one atom thick. Each carbon atom forms three covalent bonds.','Strong covalent bonds throughout the sheet. The fourth outer electron on each carbon is delocalised.','Very high. The strong covalent bonds must be broken.','Conducts electricity very well, because the delocalised electrons can move across the whole sheet.','Extremely strong for its mass, very light, flexible and almost transparent.','Electronics, strong lightweight composites, and sensors.'],
  cmp:['Carbon atoms in one layer','Covalent: 3 bonds per atom','Very high','Yes','Very strong, light and flexible']},
 {id:'silica',name:'Silicon dioxide',eg:'Silica, SiO₂ (sand)',ans:{bond:1,mp:1,cond:1,why:2,hard:0},
  rows:['A giant covalent network of silicon and oxygen atoms. Each silicon atom bonds to four oxygen atoms and each oxygen atom to two silicon atoms, so the ratio is 1 Si : 2 O.','Strong covalent bonds in all directions throughout the structure.','Very high (about 1700 °C). A huge number of strong covalent bonds must be broken.','Does not conduct. There are no ions and no delocalised electrons.','Hard and rigid. It does not dissolve in water.','Sand, glass making, and building materials.'],
  cmp:['Silicon and oxygen atoms','Covalent: Si has 4 bonds, O has 2','Very high (about 1700 °C)','No','Very hard']}
];
const EXTRA=[{name:'Simple molecule',eg:'water, CO\u2082',cmp:['Small molecules','Covalent inside molecules, weak forces between them','Low','No','Soft, or a liquid or gas']},{name:'Metal',eg:'copper',cmp:['Positive ions in a sea of delocalised electrons','Metallic: attraction between ions and electrons','High','Yes','Malleable and ductile']}];
const CMPROWS=['Particles','Bonding','Melting point','Conducts as a solid?','Hardness'];
let gi=0, gmode='study', gview='top', gshift=false, gq={};

function questions(g){
  const q=[{id:'bond',p:'What holds the structure together?',o:BONDQ,row:1},{id:'mp',p:'To melt it, what has to be overcome?',o:MPQ,row:2},
    {id:'cond',p:'Does it conduct electricity as a solid?',o:['Yes','No'],row:3},{id:'why',p:'Why does it, or does it not, conduct?',o:WHYQ,row:3},
    {id:'hard',p:'Which describes it best?',o:HARDQ,row:4}];
  if(g.id==='ionic') q.splice(4,0,{id:'molten',p:'What happens when it is molten or dissolved in water?',o:MOLQ,row:3});
  return q;
}
/* --- drawing helpers --- */
const T=(x,y,t,cls)=>'<text class="'+(cls||'sym sm')+'" x="'+f1(x)+'" y="'+f1(y)+'">'+t+'</text>';
const A=(x,y,r,cls,t)=>'<circle class="gatom '+cls+'" cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+r+'"/>'+(t?T(x,y,t,'sym '+(r<12?'xs':'sm')):'');
const B=(x1,y1,x2,y2,cls)=>'<line class="gbond '+(cls||'')+'" x1="'+f1(x1)+'" y1="'+f1(y1)+'" x2="'+f1(x2)+'" y2="'+f1(y2)+'"/>';
const DE=(x,y,i)=>'<g class="drift" style="animation-delay:-'+((i*0.43)%3.2).toFixed(2)+'s">'+glyph('cross',x,y)+'</g>';
const SVG=(w,h,inner,label)=>'<svg viewBox="0 0 '+w+' '+h+'" style="width:min(100%,'+Math.round(w*1.6)+'px)" role="img" aria-label="'+label+'"><defs><marker id="ahr" viewBox="0 0 8 8" refX="4" refY="4" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="var(--bad)"/></marker></defs>'+inner+'</svg>';
const ion=(x,y,cat,sup)=>A(x,y,cat?15:21,cat?'cat':'an','')+'<text class="sym sm" x="'+f1(x)+'" y="'+f1(y)+'">'+(cat?'Na':'Cl')+'<tspan dy="-5" font-size="9">'+(cat?'+':'−')+'</tspan></text>';

function drawIonic(shift){
  const s=62,cols=5,rows=4,ox=40,oy=38; let o='';
  const pos=(r,c)=>[ox+c*s+(shift&&r<2?s:0),oy+r*s];
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){ const [x,y]=pos(r,c);
    if(c<cols-1){ const [x2,y2]=pos(r,c+1); o+='<line class="attr" x1="'+x+'" y1="'+y+'" x2="'+x2+'" y2="'+y2+'"/>'; }
    if(r<rows-1&&!(shift&&r===1)){ const [x2,y2]=pos(r+1,c); o+='<line class="attr" x1="'+x+'" y1="'+y+'" x2="'+x2+'" y2="'+y2+'"/>'; } }
  if(shift) for(let c=0;c<cols-1;c++){ const x=ox+(c+1)*s, y=oy+s, R=((1+c)%2===1)?15:21; o+='<line class="rep" x1="'+x+'" y1="'+(y+R+2)+'" x2="'+x+'" y2="'+(y+s-R-2)+'" marker-start="url(#ahr)" marker-end="url(#ahr)"/>'; }
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){ const [x,y]=pos(r,c); o+=ion(x,y,(r+c)%2===1); }
  const w=ox*2+(cols-1)*s+s, h=oy*2+(rows-1)*s;
  return SVG(w,h,o,'Giant ionic lattice');
}
function hexNet(cols,rows,a){
  const idx={},atoms=[],bonds=[],bset=new Set(),cent=[];
  const get=(x,y)=>{const k=Math.round(x*2)+','+Math.round(y*2); if(!(k in idx)){idx[k]=atoms.length;atoms.push({x,y,n:[]});} return idx[k];};
  for(let c=0;c<cols;c++) for(let r=0;r<rows;r++){
    const cx=c*1.5*a, cy=r*Math.sqrt(3)*a+(c%2)*Math.sqrt(3)*a/2; cent.push([cx,cy]);
    const v=[0,1,2,3,4,5].map(k=>get(cx+a*Math.cos(k*Math.PI/3),cy+a*Math.sin(k*Math.PI/3)));
    for(let k=0;k<6;k++){ const i=v[k],j=v[(k+1)%6],key=Math.min(i,j)+'-'+Math.max(i,j); if(!bset.has(key)){bset.add(key);bonds.push([i,j]);atoms[i].n.push(j);atoms[j].n.push(i);} }
  }
  return {atoms,bonds,cent};
}
function drawHex(cols,rows,a,label){
  const net=hexNet(cols,rows,a), ox=30,oy=30; let o='';
  const xs=net.atoms.map(p=>p.x), ys=net.atoms.map(p=>p.y), w=Math.max(...xs)+ox*2, h=Math.max(...ys)+oy*2;
  const mid=[Math.max(...xs)/2,Math.max(...ys)/2];
  let hl=-1,bd=1e9; net.atoms.forEach((p,i)=>{ if(p.n.length===3){ const d=Math.hypot(p.x-mid[0],p.y-mid[1]); if(d<bd){bd=d;hl=i;} } });
  net.atoms.forEach((p,i)=>{ if(p.n.length<3){ let sx=0,sy=0; p.n.forEach(j=>{const dx=net.atoms[j].x-p.x,dy=net.atoms[j].y-p.y,d=Math.hypot(dx,dy);sx+=dx/d;sy+=dy/d;}); const m=Math.hypot(sx,sy)||1; o+='<line class="gbond weak" x1="'+f1(p.x+ox)+'" y1="'+f1(p.y+oy)+'" x2="'+f1(p.x+ox-sx/m*14)+'" y2="'+f1(p.y+oy-sy/m*14)+'"/>'; } });
  net.bonds.forEach(([i,j])=>{ const P=net.atoms[i],Q=net.atoms[j]; o+=B(P.x+ox,P.y+oy,Q.x+ox,Q.y+oy,(i===hl||j===hl)?'hl':''); });
  net.cent.forEach(([x,y],k)=>{ o+=DE(x+ox-6,y+oy,k*2)+DE(x+ox+6,y+oy,k*2+1); });
  net.atoms.forEach(p=>{ o+=A(p.x+ox,p.y+oy,6,'c',''); });
  return SVG(w,h,o,label);
}
function drawGraphiteSide(){
  let o='',layers=3,n=12,dx=26,ox=34,oy=36,gap=64;
  for(let L=0;L<layers;L++){ const y=oy+L*gap; for(let i=0;i<n-1;i++) o+=B(ox+i*dx,y+(i%2?8:0),ox+(i+1)*dx,y+((i+1)%2?8:0)); }
  for(let L=0;L<layers-1;L++){ const y=oy+L*gap; for(let i=1;i<n;i+=3) o+='<line class="gbond weak" x1="'+(ox+i*dx)+'" y1="'+(y+(i%2?8:0)+8)+'" x2="'+(ox+i*dx)+'" y2="'+(y+gap-0+(i%2?8:0)-8)+'"/>'; }
  for(let L=0;L<layers;L++){ const y=oy+L*gap; for(let i=0;i<n;i++){ o+=A(ox+i*dx,y+(i%2?8:0),6,'c',''); } for(let i=0;i<5;i++) o+=DE(ox+30+i*56,y+24,L*5+i); }
  o+=T(ox+(n-1)*dx/2,oy+gap/2+16,'weak forces between layers','cap')+T(ox+(n-1)*dx/2,oy+gap*1.5+16,'weak forces between layers','cap');
  return SVG(ox*2+(n-1)*dx,oy*2+(layers-1)*gap+20,o,'Graphite layers side view');
}
function drawDiamond(){
  const h=42,I=8,J=5,ox=34,oy=34; let o=''; const has=(i,j)=>i>=0&&i<=I&&j>=0&&j<=J&&(i+j)%2===0;
  const cx=4,cy=2; // highlighted atom (cx+cy even)
  for(let i=0;i<=I;i++) for(let j=0;j<=J;j++){ if(!has(i,j)) continue;
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,b])=>{ const ni=i+a,nj=j+b; const hlb=(i===cx&&j===cy)||(ni===cx&&nj===cy);
      if(has(ni,nj)){ if(a>0||(a<0&&false)) o+=B(ox+i*h,oy+j*h,ox+ni*h,oy+nj*h,hlb?'hl':''); }
      else o+='<line class="gbond weak" x1="'+(ox+i*h)+'" y1="'+(oy+j*h)+'" x2="'+(ox+i*h+a*14)+'" y2="'+(oy+j*h+b*14)+'"/>'; }); }
  for(let i=0;i<=I;i++) for(let j=0;j<=J;j++) if(has(i,j)) o+=A(ox+i*h,oy+j*h,9,'c','C');
  return SVG(ox*2+I*h,oy*2+J*h,o,'Diamond network');
}
function drawSilica(){
  const s=78,I=3,J=2,ox=58,oy=52; let o='',sil=[],oxy=[];
  for(let i=0;i<=I;i++) for(let j=0;j<=J;j++) sil.push([i,j]);
  const hlI=1,hlJ=1;
  for(let i=0;i<=I;i++) for(let j=0;j<=J;j++){ const x=ox+i*s,y=oy+j*s;
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{ const ni=i+a,nj=j+b,inside=ni>=0&&ni<=I&&nj>=0&&nj<=J; const mx=x+a*s/2,my=y+b*s/2; const hl=(i===hlI&&j===hlJ)||(inside&&ni===hlI&&nj===hlJ);
      if(inside){ if(a>0||b>0){ o+=B(x,y,mx,my,hl?'hl':'')+B(mx,my,ox+ni*s,oy+nj*s,hl?'hl':''); oxy.push([mx,my]); } }
      else { o+=B(x,y,mx,my,hl?'hl':'')+'<line class="gbond weak" x1="'+f1(mx)+'" y1="'+f1(my)+'" x2="'+f1(mx+a*16)+'" y2="'+f1(my+b*16)+'"/>'; oxy.push([mx,my]); } }); }
  sil.forEach(([i,j])=>{ o+=A(ox+i*s,oy+j*s,15,'c','Si'); });
  oxy.forEach(([x,y])=>{ o+=A(x,y,9,'ox','O'); });
  return SVG(ox*2+I*s,oy*2+J*s,o,'Silicon dioxide network');
}
function gDiagram(){
  const id=GS[gi].id;
  if(id==='ionic') return drawIonic(gshift);
  if(id==='diamond') return drawDiamond();
  if(id==='graphite') return gview==='top'?drawHex(4,3,24,'Graphite layer top view'):drawGraphiteSide();
  if(id==='graphene') return drawHex(6,3,24,'Graphene sheet');
  return drawSilica();
}
const GCAP={
  ionic:()=>gshift?'Slide two rows along by one ion and like charges line up. They repel, so the crystal splits. That is why ionic solids are brittle.':'A flat slice of the lattice. The dashed lines are the electrostatic attractions between neighbouring ions. The real lattice is 3D.',
  diamond:()=>'A flat sketch of the network. The highlighted carbon has four bonds. The real structure is 3D, with the bonds pointing to the corners of a tetrahedron.',
  graphite:()=>gview==='top'?'Top view of one layer. The highlighted carbon has three bonds. The crosses are delocalised electrons, free to move along the layer.':'Side view. Strong covalent bonds hold each layer together, and weak forces act between the layers.',
  graphene:()=>'One layer only. The highlighted carbon has three bonds. The crosses are delocalised electrons that move across the whole sheet.',
  silica:()=>'A flat sketch. The highlighted silicon is bonded to four oxygen atoms. Each oxygen atom is shared by two silicon atoms, so the ratio is 1 Si : 2 O.'
};
/* --- rendering --- */
function renderGiant(){
  const g=GS[gi];
  $('gpick').innerHTML='<div class="tabs"><b>Choose a structure</b><span class="spacer"></span><button class="tab" aria-selected="'+(gmode==='study')+'" data-gm="study">Study</button><button class="tab" aria-selected="'+(gmode==='quiz')+'" data-gm="quiz">Quiz me</button><button class="tab" aria-selected="'+(gmode==='mystery')+'" data-gm="mystery">Mystery</button></div><div class="chips">'
    +GS.map((s,i)=>(gmode==='mystery'?'<button class="chip'+(mys&&mys.wrong.includes(i)?' bad':'')+(mys&&mys.done&&i===mys.t?' ok':'')+'" data-gy="'+i+'"'+(mys&&mys.done?' disabled':'')+'>':'<button class="chip" data-gs="'+i+'" aria-pressed="'+(i===gi)+'">')+'<span class="f" style="font:600 15px var(--f-display)">'+s.name+'</span><span class="n">'+s.eg+'</span></button>').join('')+'</div>';
  if(gmode==='mystery'){ renderMystery(); return; }
  let h='<div class="card"><div class="probhead"><h2>'+g.name+'</h2><span class="progress">'+g.eg+'</span></div></div>';
  if(gmode==='study'){
    h+='<div class="card"><dl class="gl">'+ROWS.map((r,i)=>'<dt>'+r+'</dt><dd>'+g.rows[i]+'</dd>').join('')+'</dl></div>';
  } else {
    const qs=questions(g); let good=0,done=0;
    h+='<div class="card"><p class="q" style="margin-bottom:0">Answer from what you know. You can retry a wrong answer, and only first tries count.</p>';
    qs.forEach(q=>{ const st=gq[g.id+q.id]||{tries:0,ok:false}; if(st.ok){done++; if(st.tries===1) good++;}
      h+='<div class="qa"><p class="q"><b>'+q.p+'</b></p><div class="qopts">'+q.o.map((t,k)=>'<button class="qopt'+(st.ok&&k===g.ans[q.id]?' ok':'')+(st.wrong&&st.wrong.includes(k)?' bad':'')+'" data-gq="'+q.id+'" data-go="'+k+'"'+(st.ok?' disabled':'')+'>'+t+'</button>').join('')+'</div>'
        +(st.ok?'<div class="explain"><p>'+g.rows[q.row]+'</p></div>':st.tries?'<p class="msg bad">Not quite. Try another answer.</p>':'')+'</div>'; });
    h+='<div class="actions"><span class="progress" style="align-self:center">'+done+' of '+qs.length+' answered correctly'+(done===qs.length?', '+good+' first time':'')+'</span><span class="spacer"></span><button class="btn ghost" data-gx="reset">Restart quiz</button></div></div>';
  }
  $('ginfo').innerHTML=h;
  const dimTabs='<div class="tabs" style="margin-bottom:10px"><button class="tab" aria-selected="'+(gdim==='2d')+'" data-gd="2d">2D</button><button class="tab" aria-selected="'+(gdim==='3d')+'" data-gd="3d">3D (drag to turn)</button></div>';
  let d='<div class="dh"><h3>'+g.name+'</h3></div>'+dimTabs+'<div class="canvas">'+(gdim==='3d'?'<canvas id="g3d" role="img" aria-label="3D model of '+g.name+'"></canvas>':gDiagram())+'</div>';
  const ctl=[];
  if(gdim==='3d') ctl.push('<button class="btn ghost" data-gx="auto">'+(g3.auto?'Stop spinning':'Spin')+'</button><button class="btn ghost" data-gx="rview">Reset view</button>');
  else if(g.id==='ionic') ctl.push('<button class="btn ghost" data-gx="shift">'+(gshift?'Reset the lattice':'Slide the top two rows')+'</button>');
  if(gdim==='2d'&&g.id==='graphite') ctl.push('<button class="tab" aria-selected="'+(gview==='top')+'" data-gv="top">Top view</button><button class="tab" aria-selected="'+(gview==='side')+'" data-gv="side">Side view</button>');
  if(ctl.length) d+='<div class="actions" style="margin-top:10px">'+ctl.join('')+'</div>';
  if(gdim==='3d') d+=leg3(g.id);
  d+='<p class="note">'+(gdim==='3d'?GCAP3[g.id]:GCAP[g.id]())+'</p>';
  $('gdiag').innerHTML=d; if(gdim==='3d') start3D();
  $('gcmp').hidden=false; $('gcmp').innerHTML='<h3 style="margin-bottom:10px">Compare the structures</h3><div class="scroll"><table class="tbl"><thead><tr><th></th>'+GS.concat(EXTRA).map((s,i)=>'<th class="'+(i===gi?'sel':'')+'">'+s.name+(s.eg&&i>=GS.length?'<br><span class="progress">'+s.eg+'</span>':'')+'</th>').join('')+'</tr></thead><tbody>'
    +CMPROWS.map((r,k)=>'<tr><th>'+r+'</th>'+GS.concat(EXTRA).map((s,i)=>'<td class="'+(i===gi?'sel':'')+'">'+s.cmp[k]+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
}
const VIEWS=['practice','drag','giant','shapes','groups','alloys','quiz','exam','sheet'];
function setView(v){ VIEWS.forEach(x=>{ const el=$(x); if(el) el.hidden=x!==v; });
  document.querySelectorAll('.view').forEach(b=>b.setAttribute('aria-selected',b.dataset.view===v||(b.dataset.view==='quiz'&&v==='exam')));
  document.querySelectorAll('.tsw .tab').forEach(b=>b.setAttribute('aria-selected',b.dataset.view===v));
  const R={drag:renderDrag,giant:renderGiant,shapes:renderShapes,groups:renderGroups,alloys:renderAlloys,quiz:renderQuiz,exam:renderExam,sheet:renderSheet}[v]; if(R) R(); }
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-view],[data-gs],[data-gm],[data-gv],[data-gx],[data-gq]'); if(!t) return;
  if(t.dataset.view) setView(t.dataset.view);
  else if(t.dataset.gs!==undefined){ gi=+t.dataset.gs; gshift=false; gview='top'; renderGiant(); }
  else if(t.dataset.gm){ gmode=t.dataset.gm; renderGiant(); }
  else if(t.dataset.gv){ gview=t.dataset.gv; renderGiant(); }
  else if(t.dataset.gx==='shift'){ gshift=!gshift; renderGiant(); }
  else if(t.dataset.gx==='reset'){ Object.keys(gq).filter(k=>k.indexOf(GS[gi].id)===0).forEach(k=>delete gq[k]); renderGiant(); }
  else if(t.dataset.gq){ const g=GS[gi], k=g.id+t.dataset.gq, st=gq[k]||(gq[k]={tries:0,ok:false,wrong:[]}), o=+t.dataset.go; st.tries++; if(o===g.ans[t.dataset.gq]) st.ok=true; else st.wrong.push(o); renderGiant(); }
});
