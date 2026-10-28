/* ---------- Electron arrangements: build the atom, then make the ion ---------- */
const AR_EL=[['H','hydrogen'],['He','helium'],['Li','lithium'],['Be','beryllium'],['B','boron'],['C','carbon'],['N','nitrogen'],['O','oxygen'],['F','fluorine'],['Ne','neon'],['Na','sodium'],['Mg','magnesium'],['Al','aluminium'],['Si','silicon'],['P','phosphorus'],['S','sulfur'],['Cl','chlorine'],['Ar','argon'],['K','potassium'],['Ca','calcium']];
function arCfg(z){ const caps=[2,8,8,2], r=[]; let left=z; for(let i=0;i<4&&left>0;i++){ const n=Math.min(caps[i],left); r.push(n); left-=n; } return r; }
const AR={z:3,v:{},res:null,shown:false,ion:{act:'',n:'',chg:'',cfg:''},ires:null};
function arInfo(z){
  const [sym,name]=AR_EL[z-1], cfg=arCfg(z), ve=cfg[cfg.length-1], noble=[2,10,18].includes(z);
  let act='neither', n=0, chg=0, icfg=cfg.slice();
  if(noble){ act='neither'; }
  else if([1,3,4,11,12,13,19,20].includes(z)){ act='lose'; n=ve; chg=ve; icfg=cfg.slice(); icfg[icfg.length-1]-=ve; if(icfg[icfg.length-1]===0) icfg.pop(); }
  else if([7,8,9,15,16,17].includes(z)){ act='gain'; n=8-ve; chg=-n; icfg[icfg.length-1]=8; }
  return {sym,name,cfg,ve,period:cfg.length,group:noble?8:ve,noble,act,n,chg,icfg};
}
const arParse=t=>String(t||'').split(/[\s,.\-]+/).filter(x=>x!=='').map(Number);
function arAtomSVG(cfg,sym,o){
  o=o||{}; const sh=cfg.length||1, R0=22, gap=21, R=R0+gap*sh, cx=R+14, W=cx+R+(o.charge?54:14), cy=R+10;
  let s='<svg viewBox="0 0 '+W+' '+(2*R+20)+'" style="width:min(100%,'+Math.round(W*1.5)+'px)" role="img" aria-label="Electron shells of '+sym+'">';
  if(o.brackets){ const a=cx-R-6,b=cx+R+6,t=cy-R-6,u=cy+R+6; s+='<path class="brk" d="M'+(a+7)+' '+t+'H'+a+'V'+u+'H'+(a+7)+'M'+(b-7)+' '+t+'H'+b+'V'+u+'H'+(b-7)+'"/><text class="chg" x="'+(b+4)+'" y="'+(t+8)+'">'+o.charge+'</text>'; }
  for(let k=0;k<sh;k++){ s+='<circle class="shell" cx="'+cx+'" cy="'+cy+'" r="'+(R0+gap*(k+1)-gap*.0)+'" style="fill:none"/>'; }
  s+='<circle class="shell" cx="'+cx+'" cy="'+cy+'" r="'+R0+'" style="fill:var(--raise)"/><text class="sym" x="'+cx+'" y="'+cy+'">'+sym+'</text>';
  cfg.forEach((n,k)=>{ const r=R0+gap*(k+1); for(let i=0;i<n;i++){ const a=-Math.PI/2+2*Math.PI*i/Math.max(n,1)+(k%2?Math.PI/Math.max(n,1):0); s+=glyph(k===cfg.length-1&&!o.plain?'cross':'dot',cx+r*Math.cos(a),cy+r*Math.sin(a)); } });
  return s+'</svg>';
}
function renderArr(){
  const box=$('arrbox'); if(!box) return; const E=arInfo(AR.z), v=AR.v, r=AR.res, I=AR.ion, ir=AR.ires;
  const parsed=arParse(v.cfg), shown=AR.shown?E.cfg:parsed.filter(n=>n>=0);
  const okA=r&&r.cfg&&r.grp&&r.per, bad=k=>r&&r[k]===false;
  let h='<div class="probhead"><h2>Electron arrangements</h2></div><p class="q">Pick an element. Type its electron arrangement (like <b>2,8,1</b>) and watch the shells fill. Then work out what happens when it becomes an ion.</p>'
   +'<div class="chips" style="max-height:none;grid-template-columns:repeat(auto-fill,minmax(88px,1fr))">'+AR_EL.map((e,i)=>'<button class="chip" data-ar="el" data-z="'+(i+1)+'" aria-pressed="'+(AR.z===i+1)+'"><span class="f">'+e[0]+'</span><span class="n">'+e[1]+'</span></button>').join('')+'</div>'
   +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:16px;align-items:start"><div>'
   +'<h3>1. Build the atom of '+E.name+'</h3><p class="note">Atomic number '+AR.z+' means '+AR.z+' protons and '+AR.z+' electrons.</p>'
   +'<div class="fld" style="margin-top:8px"><span>Electron arrangement</span><input type="text" data-arf="cfg" value="'+(AR.shown?E.cfg.join(','):(v.cfg||'')).replace(/"/g,'&quot;')+'" placeholder="e.g. 2,8,1" autocomplete="off" spellcheck="false"'+(bad('cfg')?' class="bad"':r&&r.cfg?' class="ok"':'')+'></div>'
   +'<div class="fld" style="margin-top:8px"><span>Group number</span><input type="text" data-arf="grp" value="'+(AR.shown?(E.noble?'8':E.group):(v.grp||'')).replace(/"/g,'&quot;')+'" style="width:90px" autocomplete="off"'+(bad('grp')?' class="bad"':r&&r.grp?' class="ok"':'')+'></div>'
   +'<div class="fld" style="margin-top:8px"><span>Period number</span><input type="text" data-arf="per" value="'+(AR.shown?E.period:(v.per||'')).replace(/"/g,'&quot;')+'" style="width:90px" autocomplete="off"'+(bad('per')?' class="bad"':r&&r.per?' class="ok"':'')+'></div>'
   +(r?'<p class="msg '+(okA?'ok':'bad')+'">'+(okA?'All correct. The group number is the number of outer electrons, and the period is the number of shells.':'Not quite. Fill shells from the inside: 2, then 8, then 8. The group is the outer electrons; the period is the number of shells.')+'</p>':'')
   +'<div class="actions"><button class="btn" data-ar="check">Check the atom</button><button class="btn ghost" data-ar="show">Show me</button></div>'
   +'</div><div><div class="canvas" style="min-height:0;text-align:center">'+arAtomSVG(shown.slice(0,4),E.sym,{})+'</div><p class="note" style="text-align:center">'+(shown.length?shown.join(','):'Type an arrangement to draw it')+(shown.some((n,k)=>n>[2,8,8,2][k])?' – that shell is too full':'')+'</p></div></div>';
  // ion section
  h+='<hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><h3>2. Make the ion</h3><p class="note">A full outer shell is stable. What does '+E.name+' do to get one?</p>'
   +'<div class="chips" style="max-height:none;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));margin-top:8px">'+[['lose','Loses electrons'],['gain','Gains electrons'],['neither','No simple ion']].map(a=>'<button class="chip" data-ar="act" data-a="'+a[0]+'" aria-pressed="'+(I.act===a[0])+'"><span class="f" style="font-family:var(--f-body)">'+a[1]+'</span></button>').join('')+'</div>';
  if(I.act==='lose'||I.act==='gain'){ h+='<div class="fld" style="margin-top:10px"><span>How many?</span><input type="text" data-arf="in" value="'+(I.n||'').replace(/"/g,'&quot;')+'" style="width:90px" autocomplete="off"'+(ir&&ir.n===false?' class="bad"':ir&&ir.n?' class="ok"':'')+'></div>'
    +'<div class="fld" style="margin-top:8px"><span>Charge on the ion</span><input type="text" data-arf="ic" value="'+(I.chg||'').replace(/"/g,'&quot;')+'" style="width:110px" placeholder="e.g. 2+" autocomplete="off"'+(ir&&ir.c===false?' class="bad"':ir&&ir.c?' class="ok"':'')+'></div>'
    +'<div class="fld" style="margin-top:8px"><span>Ion arrangement</span><input type="text" data-arf="icfg" value="'+(I.cfg||'').replace(/"/g,'&quot;')+'" style="width:140px" placeholder="e.g. 2,8" autocomplete="off"'+(ir&&ir.g===false?' class="bad"':ir&&ir.g?' class="ok"':'')+'></div>'; }
  h+='<div class="actions"><button class="btn" data-ar="icheck">Check the ion</button></div>';
  if(ir){ const good=ir.a&&(E.act==='neither'||(ir.n&&ir.c&&ir.g));
    let m;
    if(good){ if(E.act==='neither') m='Correct. '+cap(E.name)+(E.noble?' already has a full outer shell, so it does not form ions.':' usually shares electrons instead of forming a simple ion at this level.');
      else if(E.act==='lose') m='Correct. '+cap(E.name)+' loses '+E.n+' electron'+(E.n>1?'s':'')+' and becomes '+E.sym+'<sup>'+E.chg+'+</sup>.';
      else m='Correct. '+cap(E.name)+' gains '+E.n+' electron'+(E.n>1?'s':'')+' and becomes '+E.sym+'<sup>'+(-E.chg)+'\u2212</sup>.'; }
    else m='Not quite. '+(E.act==='lose'?'Metals lose their outer electrons.':E.act==='gain'?'Non-metals gain electrons to reach 8 in the outer shell.':'Think about whether the outer shell is already full.');
    h+='<p class="msg '+(good?'ok':'bad')+'">'+m+'</p>';
    if(good&&E.act!=='neither'){ const ic=E.chg>0?E.chg+'+':(-E.chg)+'−'; h+='<div style="display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap"><div class="canvas" style="min-height:0;text-align:center">'+arAtomSVG(E.cfg,E.sym,{})+'<p class="note" style="text-align:center">Atom '+E.cfg.join(',')+'</p></div><span style="font-size:28px">→</span><div class="canvas" style="min-height:0;text-align:center">'+arAtomSVG(E.icfg.length?E.icfg:[0],E.sym,{brackets:true,charge:ic,plain:true})+'<p class="note" style="text-align:center">Ion '+(E.icfg.length?E.icfg.join(','):'no electrons')+'</p></div></div>'; } }
  box.innerHTML=h;
}
document.addEventListener('input',e=>{ const t=e.target; if(!t||!t.dataset||t.dataset.arf===undefined) return; const k=t.dataset.arf;
  if(k==='in') AR.ion.n=t.value; else if(k==='ic') AR.ion.chg=t.value; else if(k==='icfg') AR.ion.cfg=t.value; else AR.v[k]=t.value;
  if(k==='cfg'){ const box=$('arrbox'); const pos=t.selectionStart; AR.shown=false; renderArr(); const n=box.querySelector('[data-arf=cfg]'); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(_){} } } });
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-ar]'); if(!t) return; const a=t.dataset.ar, E=arInfo(AR.z);
  if(a==='el'){ AR.z=+t.dataset.z; AR.v={}; AR.res=null; AR.shown=false; AR.ion={act:'',n:'',chg:'',cfg:''}; AR.ires=null; renderArr(); }
  else if(a==='check'){ const c=arParse(AR.v.cfg); AR.res={cfg:c.length===E.cfg.length&&c.every((n,i)=>n===E.cfg[i]),grp:(+AR.v.grp===E.group)||(E.noble&&+AR.v.grp===0),per:+AR.v.per===E.period}; renderArr(); }
  else if(a==='show'){ AR.shown=true; AR.res={cfg:true,grp:true,per:true}; renderArr(); }
  else if(a==='act'){ AR.ion.act=t.dataset.a; AR.ires=null; renderArr(); }
  else if(a==='icheck'){ const I=AR.ion; if(!I.act){ AR.ires={a:false}; renderArr(); return; }
    const ok=I.act===E.act; let n=false,c=false,g=false;
    if(ok&&E.act!=='neither'){ n=+I.n===E.n; c=dlParseCharge(I.chg)===E.chg; const ic=arParse(I.cfg); g=(E.icfg.length===0?(String(I.cfg).trim()==='0'||/none|no/i.test(String(I.cfg))):ic.length===E.icfg.length&&ic.every((x,i)=>x===E.icfg[i])); }
    AR.ires={a:ok,n,c,g}; renderArr(); }
});

/* ---------- Bulb test: why do some substances conduct? (light-touch) ---------- */
const CI=[
 {id:'nacls',n:'Sodium chloride (solid)',on:false,kind:'fixed',why:'The ions are held in fixed positions in the lattice, so no charged particles can move.'},
 {id:'nacll',n:'Sodium chloride (molten)',on:true,kind:'ions',why:'The lattice has melted, so the ions can move and carry the charge.'},
 {id:'nacla',n:'Sodium chloride dissolved in water',on:true,kind:'ions',why:'The ions are free to move in the solution, so they carry the charge.'},
 {id:'cu',n:'Copper (metal)',on:true,kind:'metal',why:'The delocalised electrons can move through the metal and carry the charge.'},
 {id:'eth',n:'Ethanol (simple covalent)',on:false,kind:'mol',why:'It is made of neutral molecules. There are no ions or free electrons to carry charge.'},
 {id:'sugar',n:'Sugar (simple covalent)',on:false,kind:'mol',why:'It is made of neutral molecules, so there is nothing charged to move.'}
];
const CIS={i:0,guess:null};
function ciParticles(k){
  const pts=[]; let s='<svg viewBox="0 0 220 120" style="width:min(100%,320px)" role="img" aria-label="Particles in the substance">'; s+='<rect x="4" y="4" width="212" height="112" rx="12" fill="var(--raise)" stroke="var(--line)"/>';
  const c=(x,y,r,fill,t,tc)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" opacity=".95"/><text x="'+x+'" y="'+(y+.5)+'" text-anchor="middle" dominant-baseline="central" font-size="'+(r*1.1)+'" font-weight="700" fill="'+tc+'">'+t+'</text>';
  if(k==='fixed'||k==='ions'){ for(let r=0;r<3;r++) for(let q=0;q<5;q++){ const pos=(r+q)%2===0, jx=k==='ions'?((q*7+r*5)%9)-4:0, jy=k==='ions'?((q*3+r*11)%9)-4:0; s+=c(30+q*40+jx,24+r*36+jy,13,pos?'var(--cross)':'var(--dot)',pos?'+':'−','var(--paper)'); }
    if(k==='ions') s+='<text x="110" y="112" text-anchor="middle" font-size="11" fill="var(--ink2)">ions moving freely</text>'; }
  else if(k==='metal'){ for(let r=0;r<3;r++) for(let q=0;q<5;q++) s+=c(30+q*40,24+r*36,13,'var(--cross)','+','var(--paper)'); for(let i=0;i<9;i++) s+='<circle cx="'+(48+(i%5)*40+((i*13)%11))+'" cy="'+(42+Math.floor(i/5)*36+((i*7)%9)-4)+'" r="4" fill="var(--dot)"/>'; s+='<text x="110" y="112" text-anchor="middle" font-size="11" fill="var(--ink2)">delocalised electrons moving</text>'; }
  else { for(let r=0;r<3;r++) for(let q=0;q<4;q++){ const x=34+q*48+(r%2)*14, y=26+r*34; s+='<circle cx="'+x+'" cy="'+y+'" r="9" fill="none" stroke="var(--ink2)" stroke-width="2"/><circle cx="'+(x+17)+'" cy="'+y+'" r="9" fill="none" stroke="var(--ink2)" stroke-width="2"/>'; } s+='<text x="110" y="112" text-anchor="middle" font-size="11" fill="var(--ink2)">neutral molecules</text>'; }
  return s+'</svg>';
}
function ciCircuit(on,reveal){
  const glow=reveal&&on;
  return '<svg viewBox="0 0 320 150" style="width:min(100%,420px)" role="img" aria-label="A battery, a bulb and the test substance in a circuit. The bulb is '+(glow?'lit':'off')+'">'
   +'<path d="M30 110V30H110M210 30H290V110H230M90 110H30" fill="none" stroke="var(--ink2)" stroke-width="3"/>'
   +'<rect x="100" y="100" width="130" height="20" rx="6" fill="var(--raise2)" stroke="var(--ink2)" stroke-width="2"/><text x="165" y="115" text-anchor="middle" font-size="12" fill="var(--ink)">substance</text>'
   +'<circle cx="160" cy="30" r="22" fill="'+(glow?'#FFD166':'var(--raise)')+'" stroke="var(--ink2)" stroke-width="3"/>'+(glow?'<g stroke="#FFD166" stroke-width="3" stroke-linecap="round"><path d="M160 -2v-6M184 6l5-5M136 6l-5-5M196 30h6M118 30h-6"/></g>':'')+'<path d="M150 40l6-14 4 8 4-8 6 14" fill="none" stroke="var(--ink2)" stroke-width="2"/>'
   +'<text x="160" y="145" text-anchor="middle" font-size="13" font-weight="700" fill="'+(!reveal?'var(--ink2)':glow?'var(--ok)':'var(--bad)')+'">'+(!reveal?'Predict first':glow?'✓ Bulb lights':'✗ Bulb stays off')+'</text></svg>';
}
function renderCircuit(){
  const box=$('circbox'); if(!box) return; const c=CI[CIS.i], g=CIS.guess;
  let h='<div class="probhead"><h2>Bulb test</h2></div><p class="q">Will the bulb light? Pick a substance, make a prediction, then see why. The reason depends on whether charged particles are free to move.</p>'
   +'<div class="chips" style="max-height:none;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">'+CI.map((x,i)=>'<button class="chip" data-ci="sel" data-n="'+i+'" aria-pressed="'+(i===CIS.i)+'"><span class="f" style="font-family:var(--f-body);font-size:15px">'+x.n+'</span></button>').join('')+'</div>'
   +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:16px;align-items:center"><div class="canvas" style="min-height:0;text-align:center">'+ciCircuit(c.on,g!==null)+'</div><div style="text-align:center">'+ciParticles(c.kind)+'</div></div>';
  if(g===null) h+='<p class="q" style="margin-top:12px"><b>Will the bulb light up with '+c.n.toLowerCase()+'?</b></p><div class="actions"><button class="btn" data-ci="yes">Yes, it lights</button><button class="btn ghost" data-ci="no">No, it stays off</button></div>';
  else h+='<p class="msg '+(g===c.on?'ok':'bad')+'">'+(g===c.on?'Correct. ':'Not quite. ')+(c.on?'The bulb lights. ':'The bulb stays off. ')+c.why+'</p><div class="actions"><button class="btn" data-ci="next">Next substance</button></div>';
  box.innerHTML=h;
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-ci]'); if(!t) return; const a=t.dataset.ci;
  if(a==='sel'){ CIS.i=+t.dataset.n; CIS.guess=null; } else if(a==='yes') CIS.guess=true; else if(a==='no') CIS.guess=false; else if(a==='next'){ CIS.i=(CIS.i+1)%CI.length; CIS.guess=null; }
  renderCircuit();
});
