
/* ---------- Group ions: guided build, common mistakes ---------- */
const gb={on:false,step:0};
function gbP(co){
  const c=co.c,a=co.a; if(c.poly||a.poly||!EL[c.plain]||!EL[a.plain]||!EL[c.plain].metal||EL[a.plain].metal) return null;
  try{ return makeIonic(c.plain,a.plain); }catch(e){ return null; }
}
const gbActive=co=>gb.on&&!!gbP(co);
function gbSteps(co){
  const P=gbP(co), M=EL[P.M].n, X=EL[P.X].n, ve=EL[P.X].ve;
  return [
    {t:'1. Start with the atoms',x:'A '+M+' atom has <b>'+P.cm+'</b> outer electron'+(P.cm>1?'s':'')+' (red ×). A '+X+' atom has <b>'+ve+'</b> (blue •) and needs <b>'+P.an+'</b> more to have a full outer shell of 8.',sc:ionScene(P,'atoms'),arrows:false},
    {t:'2. Transfer the electrons',x:'The metal gives its outer electron'+(P.cm>1?'s':'')+' to the non-metal. These <b>red crosses come from the metal</b> and land on the '+X+'. Each '+M+' atom loses '+P.cm+' and each '+X+' atom gains '+P.an+'.',sc:ionScene(P,'atoms'),arrows:true},
    {t:'3. Ions with full outer shells',x:'The '+M+' atom is now <b>'+P.M+'<sup>'+chargeText(P.cm,'+')+'</sup></b> (it lost negative electrons, so it is positive). The '+X+' atom is now <b>'+P.X+'<sup>'+chargeText(P.an,'-')+'</sup></b>. The brackets show the charge belongs to the whole ion.',sc:ionScene(P,'final'),arrows:false},
    {t:'4. Balance the charges',x:'Opposite charges attract. This electrostatic attraction is the <b>ionic bond</b>. To balance: '+P.a+' × ('+chargeText(P.cm,'+')+') and '+P.b+' × ('+chargeText(P.an,'-')+'), so the formula is <b>'+P.html+'</b>.',sc:ionScene(P,'final'),arrows:false}
  ];
}
function gbDiagram(co){
  const st=gbSteps(co)[Math.min(gb.step,3)], sc=Object.assign({},st.sc,{arrows:st.arrows?st.sc.arrows:[]});
  if(st.sc.ions.length) sc.slots=st.sc.slots.map(s=>Object.assign({},s,{fixed:true}));
  return drawScene(sc,{label:st.t})+'<div class="legend" style="justify-content:center">'+legendHTML({legend:[{t:'cross',txt:'from the metal'},{t:'dot',txt:'from the non-metal'}]})+'</div>';
}
function gbControls(co){
  return '<div class="actions" style="margin-top:10px"><button class="btn ghost" data-gbx="back"'+(gb.step===0?' disabled':'')+'>Back</button><button class="btn" data-gbx="next">'+(gb.step>=3?'Finish':'Next step')+'</button><span class="progress" style="align-self:center">Step '+(gb.step+1)+' of 4</span></div>';
}
function gbCard(co){
  if(!gbP(co)) return '<div class="card"><p class="note" style="margin:0">The step-by-step build is available for simple ionic compounds such as sodium chloride or magnesium oxide.</p></div>';
  if(!gb.on) return '<div class="card"><div class="actions"><button class="btn" data-gbx="on">Show me how it forms</button></div></div>';
  const st=gbSteps(co)[Math.min(gb.step,3)];
  return '<div class="card"><div class="explain"><p><b>'+st.t+'</b></p><p>'+st.x+'</p></div><div class="actions" style="margin-top:10px"><button class="btn ghost" data-gbx="off">Close the walkthrough</button></div></div>';
}
function mistakesCard(co){
  const c=co.c,a=co.a, L=[];
  const wrong=part(c,co.na)+part(a,co.nc);
  if(co.nc!==co.na&&wrong!==co.plain) L.push(['Why is it not '+sub(wrong)+'?','The numbers must make the total charges balance. '+co.nc+' × '+chargeText(c.q,'+')+' = '+co.nc*c.q+'+ and '+co.na+' × '+chargeText(a.q,'−')+' = '+co.na*a.q+'−. In '+sub(wrong)+' the totals would be '+co.na*c.q+'+ and '+co.nc*a.q+'−, which do not cancel.']);
  if((c.poly&&co.nc>1)||(a.poly&&co.na>1)){ const g=c.poly&&co.nc>1?c:a, n=g===c?co.nc:co.na; L.push(['Why the brackets in '+co.html+'?','The '+n+' applies to the whole group <b>'+sub(g.plain)+'</b>. Without brackets, '+sub(co.plain.replace('('+g.plain+')',g.plain))+' would only double the last atom in the group.']); }
  if(co.nc===1&&co.na===1&&c.q>1) L.push(['Why is it '+co.html+' and not '+sub(c.plain+c.q+a.plain+a.q)+'?','Formulae show the simplest ratio of ions. One '+ionLabel(c)+' ion exactly balances one '+ionLabel(a)+' ion.']);
  L.push(['Why does the metal lose electrons instead of gaining them?','Metal atoms have only 1 to 3 outer electrons, so losing them is easier than gaining 5 to 7. Losing them leaves a full shell underneath.']);
  L.push(['Why are the charges not written in the formula?','The formula shows the ratio of ions in the whole compound. The compound has no overall charge because the positive and negative charges cancel.']);
  return '<div class="card"><h3 style="margin:0 0 6px">Common mistakes</h3>'+L.map(x=>'<details style="margin:4px 0"><summary style="cursor:pointer;font-weight:600">'+x[0]+'</summary><p style="margin:6px 0 4px">'+x[1]+'</p></details>').join('')+'</div>';
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-gbx]'); if(!t) return; const v=t.dataset.gbx;
  if(v==='on'){ gb.on=true; gb.step=0; } else if(v==='off') gb.on=false; else if(v==='back') gb.step=Math.max(0,gb.step-1); else if(v==='next'){ if(gb.step>=3) gb.on=false; else gb.step++; }
  renderGroups();
});

/* ---------- Revision sheet ---------- */
let shBlank=false;
function renderSheet(){
  const T=(h,rows,cls)=>'<div style="overflow-x:auto"><table class="tbl '+(cls||'')+'"><thead><tr>'+h.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map((x,i)=>(i===0?'<th>':'<td>')+x+(i===0?'</th>':'</td>')).join('')+'</tr>').join('')+'</tbody></table></div>';
  const S=(t,b)=>'<section class="sheetsec"><h3>'+t+'</h3>'+b+'</section>';
  const simpleC=CATS.filter(c=>!c.poly), simpleA=ANS.filter(a=>!a.poly), grpI=CATS.filter(c=>c.poly).concat(ANS.filter(a=>a.poly));
  let h='<div class="probhead"><h2>Bonding revision sheet</h2><button class="btn noprint" data-sheet="print">Print or save as PDF</button></div><div class="tabs noprint"><button class="tab" aria-selected="'+(!shBlank)+'" data-shbl="key">Answer key</button><button class="tab" aria-selected="'+shBlank+'" data-shbl="blank">Student copy (blanks to fill in)</button></div><p class="note">'+(shBlank?'Student copy: fill in the tables from your notes, the periodic table and this site.':'Answer key: everything from this site on one page.')+'</p>';
  h+=S('1. Types of bonding',T(['','Ionic','Simple covalent','Metallic'],[
    ['Between','Metal and non-metal','Non-metal atoms','Metal atoms'],['Electrons','Transferred from metal to non-metal','Shared in pairs','Outer electrons are delocalised'],
    ['Particles','Positive and negative ions','Small molecules','Positive ions in a sea of electrons'],['Structure','Giant ionic lattice','Small molecules, weak forces between them','Giant metallic lattice'],
    ['Melting point','High','Low','High'],['Conducts electricity?','Only when molten or dissolved','No','Yes, as a solid and a liquid'],['Examples','NaCl, MgO','H₂O, CO₂, CH₄','Cu, Fe, Mg']]));
  h+=S('2. Dot-and-cross reminders','<ul class="note" style="padding-left:18px;margin:0"><li>Ionic: draw the ions in square brackets with the charge. The metal ion has lost its outer electrons. The non-metal ion has a full outer shell of 8.</li><li>Show electrons from the metal as crosses and electrons from the non-metal as dots.</li><li>Covalent: each shared pair is a bond. Show only the outer shell. Check each atom has a full outer shell (2 for hydrogen, 8 for the others).</li><li>Single bond = 1 shared pair, double = 2, triple = 3.</li></ul>');
  h+=S('3. Ion charges by group',T(['Group','1','2','3','5','6','7','8(0)'],[['Ion charge','1+','2+','3+','3−','2−','1−','No ions'],['Example','Na⁺','Mg²⁺','Al³⁺','N³⁻','O²⁻','Cl⁻','Ne stays as atoms']])+'<p class="note">Transition metals have variable charges, for example iron(II) Fe²⁺ and iron(III) Fe³⁺.</p>');
  h+=S('4. Ions to know','<p class="note"><b>Positive:</b> '+simpleC.map(ionLabel).join(', ')+'</p><p class="note"><b>Negative:</b> '+simpleA.map(ionLabel).join(', ')+'</p>');
  h+=S('5. Writing ionic formulae','<ol class="note" style="padding-left:18px;margin:0"><li>Write the ions with their charges.</li><li>Balance the charges using the smallest numbers.</li><li>Do not write the charges in the final formula.</li></ol>'+T(['Compound','Ions','Formula'],[['Sodium chloride','Na⁺, Cl⁻','NaCl'],['Magnesium oxide','Mg²⁺, O²⁻','MgO'],['Calcium chloride','Ca²⁺, 2 × Cl⁻','CaCl₂'],['Aluminium oxide','2 × Al³⁺, 3 × O²⁻','Al₂O₃']]));
  h+=S('6. Giant structures',T([''].concat(GS.map(g=>g.name),EXTRA.map(x=>x.name)),CMPROWS.map((r,k)=>[r].concat(GS.map(g=>g.cmp[k]),EXTRA.map(x=>x.cmp[k])))));
  h+=S('7. Molecule shapes',T(['Molecule','Shape','Bond angle','Lone pairs on central atom'],SH.map(m=>[sub(m.f)+' ('+m.name+')',m.shape,m.ang||'—',m.central?m.lp:'—'])));
  h+=S('8. Alloys','<p class="note">An alloy is a mixture of a metal with at least one other element. The different-sized atoms stop the layers sliding, so alloys are harder than the pure metal.</p>'+T(['Alloy','Made from','Properties','Uses'],ALLOYS));
  $('sheetbox').className='card'+(shBlank?' sheetblank':''); $('sheetbox').innerHTML=h;
}
document.addEventListener('click',e=>{ if(e.target.closest('[data-sheet=print]')) window.print(); const b=e.target.closest('[data-shbl]'); if(b){ shBlank=b.dataset.shbl==='blank'; renderSheet(); } });
(function(){ const c=document.createElement('style'); c.textContent='.sheetsec{margin-top:18px;break-inside:avoid}.sheetsec h3{margin:0 0 6px}.sheetsec .tbl{font-size:13px}.probhead .btn{margin-left:auto}@media print{:root:root:root{--paper:#fff;--panel:#fff;--ink:#111;--ink2:#444;--line:#aaa;--grid:#eee}body{background:#fff!important}.views,#ptbtn,#ptp,header .sub,.noprint{display:none!important}.card{box-shadow:none!important;border:0!important}.sheetsec{break-inside:avoid}}'; document.head.appendChild(c); })();
