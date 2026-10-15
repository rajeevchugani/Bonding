
/* ---------- Electron diagrams for the ions in group-ion compounds ---------- */
const GB1=['cross','dot'], GBD=['cross','cross'];
const GSPEC={
  OH:{s:'O',own:6,gain:1,outer:[{s:'H',own:1,ang:0,bonds:[GB1]}],note:'One covalent bond between O and H. The ringed red × is the electron gained from the metal, which makes the ion 1−.'},
  NH4:{s:'N',own:5,gain:0,outer:[{s:'H',own:1,ang:225,bonds:[GB1]},{s:'H',own:1,ang:315,bonds:[GB1]},{s:'H',own:1,ang:135,bonds:[GB1]},{s:'H',own:0,ang:45,bonds:[GBD]}],note:'Four covalent bonds. In one of them both electrons come from nitrogen, and the hydrogen ion has none, so the ion is 1+.'},
  NO3:{s:'N',own:5,gain:0,outer:[{s:'O',own:6,ang:270,bonds:[GB1,GB1]},{s:'O',own:6,ang:30,bonds:[GB1],gain:1},{s:'O',own:6,ang:150,bonds:[GBD]}],note:'Covalent bonds inside the ion. The electron gained from the metal makes the ion 1−.'},
  CO3:{s:'C',own:4,gain:0,outer:[{s:'O',own:6,ang:270,bonds:[GB1,GB1]},{s:'O',own:6,ang:30,bonds:[GB1],gain:1},{s:'O',own:6,ang:150,bonds:[GB1],gain:1}],note:'Covalent bonds inside the ion. The two electrons gained from the metal make the ion 2−.'},
  SO4:{s:'S',own:6,gain:0,outer:[{s:'O',own:6,ang:315,bonds:[GB1,GB1]},{s:'O',own:6,ang:225,bonds:[GB1,GB1]},{s:'O',own:6,ang:45,bonds:[GB1],gain:1},{s:'O',own:6,ang:135,bonds:[GB1],gain:1}],note:'Covalent bonds inside the ion. The two electrons gained from the metal make the ion 2−.'},
  PO4:{s:'P',own:5,gain:0,outer:[{s:'O',own:6,ang:315,bonds:[GB1,GB1]},{s:'O',own:6,ang:225,bonds:[GB1],gain:1},{s:'O',own:6,ang:45,bonds:[GB1],gain:1},{s:'O',own:6,ang:135,bonds:[GB1],gain:1}],note:'Covalent bonds inside the ion. The three electrons gained from the metal make the ion 3−.'}
};
const GRAD=a=>a*Math.PI/180;
function gionScene(ion){
  const sp=ion.plain==='OH'?GSPEC.OH:null, slots=[], circles=[];
  const pairsAt=(x,y,R,angs,list,g)=>{ let k=0; angs.forEach(t=>{ [-dlt(R),dlt(R)].forEach(dd=>{ if(k<list.length){ const [px,py]=polar(x,y,R,t+dd); slots.push({x:px,y:py,expect:list[k],fixed:true}); } k++; }); }); };
  const lonePairAngles=(L,phi)=>L===1?[phi]:L===2?[phi-55,phi+55]:L===3?[phi,phi-90,phi+90]:[phi-45,phi+45,phi-135,phi+135];
  if(sp){
    const Rc=36, Ro=o=>o.s==='H'?28:33, atoms=[{s:sp.s,x:0,y:0,R:Rc,t:'cross'}];
    sp.outer.forEach(o=>atoms.push({s:o.s,x:(Rc+Ro(o)-8)*Math.cos(GRAD(o.ang)),y:(Rc+Ro(o)-8)*Math.sin(GRAD(o.ang)),R:Ro(o),t:'dot',ang:o.ang}));
    let cUsed=0; const oUsed=sp.outer.map(()=>0);
    sp.outer.forEach((o,i)=>{ const B=atoms[i+1], dx=B.x,dy=B.y,d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d,px=-uy,py=ux, cl=(d-B.R+Rc)/2, cx=ux*cl, cy=uy*cl, n=o.bonds.length;
      o.bonds.forEach((bt,k)=>{ const sft=(k-(n-1)/2)*14, qx=cx+px*sft, qy=cy+py*sft;
        slots.push({x:qx-ux*5,y:qy-uy*5,expect:bt[0],fixed:true}); slots.push({x:qx+ux*5,y:qy+uy*5,expect:bt[1],fixed:true});
        cUsed+=bt[0]==='cross'?1:0; cUsed+=bt[1]==='cross'?1:0; oUsed[i]+=bt[1]==='dot'?1:0; }); });
    const cList=[]; for(let i=0;i<sp.own-cUsed;i++) cList.push('cross');
    for(let i=0;i<(sp.gain||0);i++) cList.push('gain');
    if(cList.length){ let sx=0,sy=0; atoms.slice(1).forEach(a=>{ const d=Math.hypot(a.x,a.y); sx+=a.x/d; sy+=a.y/d; }); const phi=Math.hypot(sx,sy)<1e-6?270:Math.atan2(-sy,-sx)*180/Math.PI; pairsAt(0,0,Rc,lonePairAngles(cList.length/2,phi),cList); }
    sp.outer.forEach((o,i)=>{ const a=atoms[i+1], l=[]; for(let k=0;k<o.own-oUsed[i];k++) l.push('dot'); for(let k=0;k<(o.gain||0);k++) l.push('gain'); if(l.length) pairsAt(a.x,a.y,a.R,lonePairAngles(l.length/2,o.ang),l); });
    atoms.forEach(a=>circles.push({x:a.x,y:a.y,R:a.R,label:a.s,small:a.s==='H'}));
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; atoms.forEach(a=>{ x0=Math.min(x0,a.x-a.R); y0=Math.min(y0,a.y-a.R); x1=Math.max(x1,a.x+a.R); y1=Math.max(y1,a.y+a.R); });
    const cx=(x0+x1)/2, cy=(y0+y1)/2, R=Math.max(x1-x0,y1-y0)/2+4;
    return {circles,slots,arrows:[],ions:[{x:cx,y:cy,R,charge:ion.cat?chargeText(ion.q,'+'):chargeText(ion.q,'-')}],vb:[cx,cy,R]};
  }
  if(ion.poly){ const R=40; circles.push({x:0,y:0,R,label:toSub(ion.plain),small:true}); return {circles,slots,arrows:[],ions:[{x:0,y:0,R:R+4,charge:ion.cat?chargeText(ion.q,'+'):chargeText(ion.q,'-')}],vb:[0,0,R+4],group:true}; }
  const R=36, ve=EL[ion.plain]?EL[ion.plain].ve:(ion.plain==='I'?7:ion.plain==='P'?5:0), pairs=[270,0,90,180];
  let list=[];
  if(ion.cat){ const n=ion.plain==='Li'?2:(EL[ion.plain]&&EL[ion.plain].z<=20?8:0); for(let i=0;i<n;i++) list.push('cross'); }
  else { for(let i=0;i<ve;i++) list.push('dot'); for(let i=0;i<8-ve;i++) list.push('gain'); }
  pairsAt(0,0,R,list.length===2?[270]:[315,45,135,225],list);
  circles.push({x:0,y:0,R,label:ion.plain});
  return {circles,slots,arrows:[],ions:[{x:0,y:0,R:R+4,charge:ion.cat?chargeText(ion.q,'+'):chargeText(ion.q,'-')}],vb:[0,0,R+4],transition:ion.cat&&list.length===0};
}
function ionFig(ion,n){
  const sc=gionScene(ion), [cx,cy,R]=sc.vb;
  let svg=drawScene(sc,{label:'Electron diagram of the '+ion.name+' ion'});
  svg=svg.replace(/viewBox="[^"]*"/,'viewBox="'+f1(cx-R-18)+' '+f1(cy-R-18)+' '+f1(2*R+64)+' '+f1(2*R+36)+'"').replace(/style="width:[^"]*"/,'style="width:'+Math.round((2*R+64)*1.1)+'px;max-width:100%"');
  const kinds=new Set(sc.slots.map(s=>s.expect));
  return {html:'<figure class="ionfig">'+svg+'<figcaption><b>'+(n>1?n+' × ':'')+ion.name+'</b>'+(sc.transition?'<br>electron arrangement not needed':'')+(sc.group?'<br>group ion (atoms covalently bonded)':'')+'</figcaption></figure>',kinds,note:ion.plain==='OH'?GSPEC.OH.note:null,simple:!ion.poly||ion.plain==='OH',name:ion.name};
}
function ionsRow(co){
  const a=ionFig(co.c,co.nc), b=ionFig(co.a,co.na), kinds=new Set([...a.kinds,...b.kinds]);
  const lg=[]; if(kinds.has('cross')) lg.push({t:'cross',txt:'metal or central atom'}); if(kinds.has('dot')) lg.push({t:'dot',txt:'non-metal or outer atom'}); if(kinds.has('gain')) lg.push({t:'gain',txt:'electron gained from the metal (ringed)'});
  const tr=(a.simple&&b.simple&&!co.c.poly)?'<p class="note" style="border-left:3px solid var(--cross);padding-left:8px"><b>Where the electrons come from:</b> each '+co.c.name.replace(/\(.*\)/,'')+' atom loses '+co.c.q+' electron'+(co.c.q>1?'s':'')+' and becomes '+ionLabel(co.c)+'. The negative ion gains these electrons. They are drawn as <b>ringed red crosses</b> because they come from the metal. In total '+(co.c.q*co.nc)+' electron'+(co.c.q*co.nc>1?'s are':' is')+' transferred.</p>':'';
  const notes=tr+[a.note,b.note].filter(Boolean).map(n=>'<p class="note">'+n+'</p>').join('');
  return '<div class="ionrow">'+a.html+'<span class="ionplus">+</span>'+b.html+'</div><div class="legend" style="justify-content:center">'+legendHTML({legend:lg})+'</div>'+notes+'<p class="note">The brackets show the ion is one particle with an overall charge. The formula has '+co.nc+' of the positive ion and '+co.na+' of the negative ion'+(((co.c.poly&&co.nc>1)||(co.a.poly&&co.na>1))?', so group ions get brackets with the number outside.':'.')+'</p>';
}
