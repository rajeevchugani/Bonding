
/* ---------- Floating periodic table ---------- */
(function(){
const RAW='H,Hydrogen,1;He,Helium,4;Li,Lithium,7;Be,Beryllium,9;B,Boron,11;C,Carbon,12;N,Nitrogen,14;O,Oxygen,16;F,Fluorine,19;Ne,Neon,20;Na,Sodium,23;Mg,Magnesium,24;Al,Aluminium,27;Si,Silicon,28;P,Phosphorus,31;S,Sulfur,32;Cl,Chlorine,35.5;Ar,Argon,40;K,Potassium,39;Ca,Calcium,40;Sc,Scandium,45;Ti,Titanium,48;V,Vanadium,51;Cr,Chromium,52;Mn,Manganese,55;Fe,Iron,56;Co,Cobalt,59;Ni,Nickel,59;Cu,Copper,64;Zn,Zinc,65;Ga,Gallium,70;Ge,Germanium,73;As,Arsenic,75;Se,Selenium,79;Br,Bromine,80;Kr,Krypton,84;Rb,Rubidium,85.5;Sr,Strontium,88;Y,Yttrium,89;Zr,Zirconium,91;Nb,Niobium,93;Mo,Molybdenum,96;Tc,Technetium,98;Ru,Ruthenium,101;Rh,Rhodium,103;Pd,Palladium,106;Ag,Silver,108;Cd,Cadmium,112;In,Indium,115;Sn,Tin,119;Sb,Antimony,122;Te,Tellurium,128;I,Iodine,127;Xe,Xenon,131;Cs,Caesium,133;Ba,Barium,137;La,Lanthanum,139;Ce,Cerium,140;Pr,Praseodymium,141;Nd,Neodymium,144;Pm,Promethium,145;Sm,Samarium,150;Eu,Europium,152;Gd,Gadolinium,157;Tb,Terbium,159;Dy,Dysprosium,163;Ho,Holmium,165;Er,Erbium,167;Tm,Thulium,169;Yb,Ytterbium,173;Lu,Lutetium,175;Hf,Hafnium,178.5;Ta,Tantalum,181;W,Tungsten,184;Re,Rhenium,186;Os,Osmium,190;Ir,Iridium,192;Pt,Platinum,195;Au,Gold,197;Hg,Mercury,201;Tl,Thallium,204;Pb,Lead,207;Bi,Bismuth,209;Po,Polonium,209;At,Astatine,210;Rn,Radon,222;Fr,Francium,223;Ra,Radium,226;Ac,Actinium,227;Th,Thorium,232;Pa,Protactinium,231;U,Uranium,238;Np,Neptunium,237;Pu,Plutonium,244;Am,Americium,243;Cm,Curium,247;Bk,Berkelium,247;Cf,Californium,251;Es,Einsteinium,252;Fm,Fermium,257;Md,Mendelevium,258;No,Nobelium,259;Lr,Lawrencium,262;Rf,Rutherfordium,267;Db,Dubnium,268;Sg,Seaborgium,269;Bh,Bohrium,270;Hs,Hassium,277;Mt,Meitnerium,278;Ds,Darmstadtium,281;Rg,Roentgenium,282;Cn,Copernicium,285;Nh,Nihonium,286;Fl,Flerovium,289;Mc,Moscovium,290;Lv,Livermorium,293;Ts,Tennessine,294;Og,Oganesson,294';
const CFG=['1','2','2,1','2,2','2,3','2,4','2,5','2,6','2,7','2,8','2,8,1','2,8,2','2,8,3','2,8,4','2,8,5','2,8,6','2,8,7','2,8,8','2,8,8,1','2,8,8,2','2,8,9,2','2,8,10,2','2,8,11,2','2,8,13,1','2,8,13,2','2,8,14,2','2,8,15,2','2,8,16,2','2,8,18,1','2,8,18,2','2,8,18,3','2,8,18,4','2,8,18,5','2,8,18,6','2,8,18,7','2,8,18,8'];
const E=RAW.split(';').map((s,i)=>{const a=s.split(','); return {z:i+1,s:a[0],n:a[1],m:a[2]};});
const BY={}; E.forEach(e=>BY[e.s]=e);
const CAT={
 alk:['Alkali metal','#d9534f','Li Na K Rb Cs Fr'],ae:['Alkaline earth metal','#e08a2c','Be Mg Ca Sr Ba Ra'],tm:['Transition metal','#4a8fd0','Sc Ti V Cr Mn Fe Co Ni Cu Zn Y Zr Nb Mo Tc Ru Rh Pd Ag Cd Hf Ta W Re Os Ir Pt Au Hg Rf Db Sg Bh Hs Mt Ds Rg Cn'],
 pt:['Post-transition metal','#6b8fa8','Al Ga In Sn Tl Pb Bi Po Nh Fl Mc Lv'],md:['Metalloid','#8aa63a','B Si Ge As Sb Te'],nm:['Non-metal','#2f9e6a','H C N O P S Se'],
 hal:['Halogen','#c45bb0','F Cl Br I At Ts'],ng:['Noble gas','#8a6bd0','He Ne Ar Kr Xe Rn Og'],la:['Lanthanide','#2aa5a0','La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu'],ac:['Actinide','#b08a3a','Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr']
};
Object.keys(CAT).forEach(k=>CAT[k][2].split(' ').forEach(s=>{ if(BY[s]) BY[s].c=k; }));
const rows=[
 ['H',...Array(16).fill(''),'He'],
 ['Li','Be',...Array(10).fill(''),'B','C','N','O','F','Ne'],
 ['Na','Mg',...Array(10).fill(''),'Al','Si','P','S','Cl','Ar'],
 'K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr'.split(' '),
 'Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe'.split(' '),
 ['Cs','Ba','*','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn'],
 ['Fr','Ra','**','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og']
];
rows.forEach((r,ri)=>r.forEach((s,ci)=>{ if(BY[s]){ BY[s].g=ci+1; BY[s].p=ri+1; } }));
E.forEach(e=>{ if(!e.g){ e.p=e.z<=71?6:7; e.g=null; } });
const IG=c=>c<=2?String(c):c>=13?(c===18?'8(0)':String(c-10)):'';
const css=document.createElement('style');
css.textContent='#ptbtn{position:fixed;right:16px;bottom:16px;z-index:60;border-radius:999px;border:1.5px solid var(--ink);background:var(--ink);color:var(--paper);font:600 14px var(--f-body,inherit);padding:10px 16px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25)}'
+'#ptbtn[aria-expanded=true]{background:var(--panel);color:var(--ink)}'
+'#ptp{position:fixed;right:16px;bottom:64px;z-index:59;--pw:920px;width:min(var(--pw),calc(100vw - 24px));max-height:calc(100vh - 90px);overflow:auto;background:var(--panel);border:1.5px solid var(--line);border-radius:14px;box-shadow:0 10px 34px rgba(0,0,0,.28);color:var(--ink)}'
+'#ptp[hidden]{display:none}#pth{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--line);cursor:grab;touch-action:none;position:sticky;top:0;background:var(--panel);z-index:2;font-weight:600;font-size:14px}'
+'#pth .sp{flex:1}#pth button{border:1px solid var(--line);background:transparent;color:var(--ink);border-radius:8px;padding:3px 9px;cursor:pointer;font-size:13px}'
+'#pti{display:flex;gap:14px;align-items:center;padding:10px 12px;min-height:86px;flex-wrap:wrap}'
+'#pti .big{width:70px;height:70px;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2px solid var(--c,var(--line));background:color-mix(in srgb,var(--c,var(--line)) 18%,var(--panel));flex:none}'
+'#pti .big i{font-style:normal;font-size:11px;color:var(--ink2)}#pti .big b{font:700 26px var(--f-mono,monospace)}'
+'#pti{font-size:max(12px,calc(min(var(--pw),100vw)/70))}#pti dl{font-size:inherit;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:4px 16px;margin:0;flex:1}#pti dt{font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--ink2)}#pti dd{margin:0;font-weight:600}'
+'#ptg{display:grid;grid-template-columns:1.6em repeat(18,minmax(0,1fr));gap:2px;padding:4px 12px 6px;min-width:520px}'
+'.ptc{aspect-ratio:1/1.05;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid color-mix(in srgb,var(--c) 55%,var(--panel));border-radius:4px;background:color-mix(in srgb,var(--c) 20%,var(--panel));color:var(--ink);padding:0;cursor:pointer;line-height:1.05;font:inherit}'
+'.ptc b{font-size:max(9px,calc(min(var(--pw),100vw)/72))}.ptc i{font-style:normal;font-size:max(6px,calc(min(var(--pw),100vw)/115));color:var(--ink2)}.ptc:hover,.ptc:focus-visible,.ptc.on{outline:2px solid var(--ink);z-index:1;transform:scale(1.12)}'
+'.ptlab{display:flex;align-items:center;justify-content:center;font-size:max(9px,calc(min(var(--pw),100vw)/90));font-weight:600;color:var(--ink2);border-radius:4px}.ptlab.on{background:var(--ink);color:var(--paper)}'
+'.ptc.dim{opacity:.28}.ptx{aspect-ratio:1/1.05}.ptn{font-size:10px;color:var(--ink2);display:flex;align-items:center;justify-content:center}'
+'#ptl{display:flex;flex-wrap:wrap;gap:4px 12px;padding:2px 12px 12px;font-size:12px;color:var(--ink2)}#ptl button{display:flex;gap:5px;align-items:center;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;padding:2px 4px;border-radius:6px}#ptl button.on{background:var(--grid);color:var(--ink)}#ptl i{width:11px;height:11px;border-radius:3px;display:inline-block}'
+'@media(max-width:640px){#ptp{right:6px;bottom:60px;width:calc(100vw - 12px)}#ptg{min-width:620px}#ptp{overflow:auto}}';
document.head.appendChild(css);
const btn=document.createElement('button'); btn.id='ptbtn'; btn.type='button'; btn.setAttribute('aria-expanded','false'); btn.setAttribute('aria-controls','ptp'); btn.textContent='Periodic table';
const pan=document.createElement('div'); pan.id='ptp'; pan.hidden=true; pan.setAttribute('role','dialog'); pan.setAttribute('aria-label','Periodic table');
function cell(e){ return '<button type="button" class="ptc" data-pz="'+e.z+'" style="--c:'+CAT[e.c][1]+'" aria-label="'+e.n+', atomic number '+e.z+'"><i>'+e.z+'</i><b>'+e.s+'</b></button>'; }
let g='<span></span>'+Array.from({length:18},(_,i)=>'<span class="ptlab" data-gl="'+(i+1)+'">'+IG(i+1)+'</span>').join('');
rows.forEach((r,ri)=>{ g+='<span class="ptlab" data-pl="'+(ri+1)+'">'+(ri+1)+'</span>'; r.forEach(s=>{ if(!s) g+='<span class="ptx"></span>'; else if(s==='*'||s==='**') g+='<span class="ptn">'+s+'</span>'; else g+=cell(BY[s]); }); });
g+='<span class="ptx" style="grid-column:span 19;aspect-ratio:auto;height:6px"></span>';
for(let i=0;i<2;i++){ g+='<span class="ptlab" data-pl="'+(i?7:6)+'">'+(i?7:6)+'</span><span class="ptn" style="grid-column:span 2">'+(i?'**':'*')+'</span>'; E.filter(e=>i?(e.z>=89&&e.z<=103):(e.z>=57&&e.z<=71)).forEach(e=>g+=cell(e)); g+='<span class="ptx" style="grid-column:span 1"></span>'; }
pan.innerHTML='<div id="pth"><span>Periodic table</span><span class="sp"></span><label style="font-weight:400;font-size:12px;color:var(--ink2);display:flex;align-items:center;gap:6px">Size <input type="range" id="pts" min="520" max="1500" step="20" value="920" aria-label="Periodic table size" style="width:110px"></label><button type="button" id="ptx" aria-label="Close periodic table">Close</button></div><div id="pti"></div><div style="overflow-x:auto"><div id="ptg">'+g+'</div></div><div id="ptl">'+Object.keys(CAT).map(k=>'<button type="button" data-pk="'+k+'"><i style="background:'+CAT[k][1]+'"></i>'+CAT[k][0]+'</button>').join('')+'</div>';
document.body.appendChild(pan); document.body.appendChild(btn);
function ion(e){ const g=e.g; if(!g) return 'Variable'; if(g===1) return '1+'; if(g===2) return '2+'; if(e.s==='Al') return '3+'; if(g===15&&(e.s==='N'||e.s==='P')) return '3−'; if(g===16&&e.z<=34) return '2−'; if(g===17&&e.z<=53) return '1−'; if(g===18) return 'Does not form ions'; if(g>=3&&g<=12) return 'Variable (transition metal)'; return '—'; }
function show(z){
  const e=E[z-1], c=CAT[e.c], g=e.g, main=g&&(g<=2||g>=13), ve=main?(g<=2?g:(g===18?(e.s==='He'?2:8):g-10)):null, metal=['alk','ae','tm','pt','la','ac'].includes(e.c);
  $('pti').innerHTML='<div class="big" style="--c:'+c[1]+'"><i>'+e.z+'</i><b>'+e.s+'</b><i>'+e.m+'</i></div><dl>'
   +'<div><dt>Element</dt><dd>'+e.n+'</dd></div><div><dt>Atomic number (protons)</dt><dd>'+e.z+'</dd></div><div><dt>Relative atomic mass</dt><dd>'+e.m+'</dd></div>'
   +'<div><dt>Group / period</dt><dd>'+(g?(IG(g)||'none (transition metal)'):'none (f-block)')+' / '+e.p+'</dd></div><div><dt>Type</dt><dd>'+c[0]+' ('+(e.c==='md'?'metalloid':metal?'metal':'non-metal')+')</dd></div>'
   +'<div><dt>Electronic structure</dt><dd>'+(CFG[z-1]||'Not needed at IGCSE')+'</dd></div>'+(ve!=null?'<div><dt>Outer electrons</dt><dd>'+ve+'</dd></div>':'')+'<div><dt>Typical ion</dt><dd>'+ion(e)+'</dd></div></dl>';
  pan.querySelectorAll('.ptc.on,.ptlab.on').forEach(x=>x.classList.remove('on')); if(g){ const a=pan.querySelector('[data-gl="'+g+'"]'); if(a) a.classList.add('on'); } const pp=pan.querySelector('[data-pl="'+e.p+'"]'); if(pp) pp.classList.add('on'); const b=pan.querySelector('[data-pz="'+z+'"]'); if(b) b.classList.add('on');
}
$('pti').innerHTML='<p style="margin:0;color:var(--ink2)">Hover over, or tap, an element to see its details. Drag the title bar to move the table and use the size slider to resize it.</p>';
pan.addEventListener('pointerover',e=>{ const b=e.target.closest('[data-pz]'); if(b) show(+b.dataset.pz); });
pan.addEventListener('focusin',e=>{ const b=e.target.closest('[data-pz]'); if(b) show(+b.dataset.pz); });
pan.addEventListener('click',e=>{
  const b=e.target.closest('[data-pz]'); if(b){ show(+b.dataset.pz); return; }
  const k=e.target.closest('[data-pk]'); if(k){ const on=!k.classList.contains('on'); pan.querySelectorAll('[data-pk]').forEach(x=>x.classList.remove('on')); if(on) k.classList.add('on');
    pan.querySelectorAll('.ptc').forEach(c=>c.classList.toggle('dim',on&&E[+c.dataset.pz-1].c!==k.dataset.pk)); return; }
  if(e.target.id==='ptx') setOpen(false);
});
function setOpen(o){ pan.hidden=!o; btn.setAttribute('aria-expanded',String(o)); btn.textContent=o?'Hide periodic table':'Periodic table'; }
btn.addEventListener('click',()=>setOpen(pan.hidden));
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!pan.hidden) setOpen(false); });
pan.addEventListener('input',e=>{ if(e.target.id==='pts') pan.style.setProperty('--pw',e.target.value+'px'); });
let dr=null;
pan.addEventListener('pointerdown',e=>{ const h=e.target.closest('#pth'); if(!h||e.target.closest('button')) return; const r=pan.getBoundingClientRect(); dr={dx:e.clientX-r.left,dy:e.clientY-r.top}; h.setPointerCapture(e.pointerId); });
pan.addEventListener('pointermove',e=>{ if(!dr) return; pan.style.left=Math.max(0,Math.min(innerWidth-120,e.clientX-dr.dx))+'px'; pan.style.top=Math.max(0,Math.min(innerHeight-60,e.clientY-dr.dy))+'px'; pan.style.right='auto'; pan.style.bottom='auto'; });
pan.addEventListener('pointerup',()=>{ dr=null; });
})();
