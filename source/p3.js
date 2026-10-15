/* ---------- Renderer ---------- */
const f1=v=>Math.round(v*10)/10;
function glyph(kind,x,y,extra){
  if(kind==='gain') return '<circle class="e-ring" cx="'+f1(x)+'" cy="'+f1(y)+'" r="7.4"/>'+glyph('cross',x,y,extra);
  if(kind==='dot') return '<circle class="e-dot" cx="'+f1(x)+'" cy="'+f1(y)+'" r="3.6"'+(extra||'')+'/>';
  const a=3.4;
  return '<path class="e-cross" d="M'+f1(x-a)+' '+f1(y-a)+'L'+f1(x+a)+' '+f1(y+a)+'M'+f1(x-a)+' '+f1(y+a)+'L'+f1(x+a)+' '+f1(y-a)+'"'+(extra||'')+'/>';
}
function legendHTML(sc){
  return (sc.legend||[]).map(l=>'<span><svg width="14" height="14" viewBox="-7 -7 14 14">'+glyph(l.t,0,0)+'</svg> '+l.txt+'</span>').join('');
}
/* o: {user:[0|1|2], pre:[bool], bad:[idx], hinted:[idx], interactive:bool, label:str} */
function drawScene(sc,o){
  o=o||{};
  const user=o.user||[], pre=o.pre||[], bad=new Set(o.bad||[]), hinted=new Set(o.hinted||[]);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  const grow=(x,y)=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);};
  sc.circles.forEach(c=>{ const e=c.ion?10:0; grow(c.x-c.R-e,c.y-c.R-e); grow(c.x+c.R+(c.ion?32:e),c.y+c.R+e); });
  sc.arrows.forEach(a=>grow(Math.min(a.x1,a.x2),Math.min(a.y1,a.y2)-44));
  const P=16; x0-=P; y0-=P; x1+=P; y1+=P;
  const w=x1-x0,h=y1-y0;
  let s='<svg viewBox="'+f1(x0)+' '+f1(y0)+' '+f1(w)+' '+f1(h)+'" style="width:min(100%,'+Math.round(w*1.9)+'px)" role="img" aria-label="'+(o.label||'Dot-and-cross diagram')+'">';
  s+='<defs><marker id="ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="var(--ink2)"/></marker></defs>';
  if(sc.sea){ const lx0=Math.min(...sc.circles.map(c=>c.x-c.R))-14, lx1=Math.max(...sc.circles.map(c=>c.x+c.R))+14, ly0=Math.min(...sc.circles.map(c=>c.y-c.R))-14, ly1=Math.max(...sc.circles.map(c=>c.y+c.R))+14;
    s+='<rect class="sea" x="'+f1(lx0)+'" y="'+f1(ly0)+'" width="'+f1(lx1-lx0)+'" height="'+f1(ly1-ly0)+'" rx="26"/>'; }
  sc.circles.forEach(c=>{
    s+='<circle class="shell'+(c.ion?' ion':'')+'" cx="'+f1(c.x)+'" cy="'+f1(c.y)+'" r="'+c.R+'"'+(c.metal?' style="fill:var(--panel)"':'')+'/>';
  });
  sc.ions.forEach(c=>{
    const a=c.x-c.R-7,b=c.x+c.R+7,t=c.y-c.R-7,u=c.y+c.R+7;
    s+='<path class="brk" d="M'+f1(a+7)+' '+f1(t)+'H'+f1(a)+'V'+f1(u)+'H'+f1(a+7)+'M'+f1(b-7)+' '+f1(t)+'H'+f1(b)+'V'+f1(u)+'H'+f1(b-7)+'"/>';
    s+='<text class="chg" x="'+f1(b+4)+'" y="'+f1(t+6)+'">'+c.charge+'</text>';
  });
  sc.circles.forEach(c=>{
    if(c.charge) s+='<text class="sym sm" x="'+f1(c.x)+'" y="'+f1(c.y)+'">'+c.label+'<tspan dy="-5" font-size="10">'+c.charge+'</tspan></text>';
    else s+='<text class="sym'+(c.small?' sm':'')+'" x="'+f1(c.x)+'" y="'+f1(c.y)+'">'+c.label+'</text>';
  });
  sc.arrows.forEach(a=>{
    const mx=(a.x1+a.x2)/2, my=Math.min(a.y1,a.y2)-34;
    s+='<path class="arrow" marker-end="url(#ah)" d="M'+f1(a.x1)+' '+f1(a.y1-5)+'Q'+f1(mx)+' '+f1(my)+' '+f1(a.x2)+' '+f1(a.y2-5)+'"/>';
  });
  sc.slots.forEach((sl,i)=>{
    if(sl.target){ s+='<circle class="ring target" cx="'+f1(sl.x)+'" cy="'+f1(sl.y)+'" r="5.2"/>'; return; }
    if(sl.fixed){
      const ex=sl.drift!=null?' style="animation-delay:-'+((sl.drift*0.37)%3.2).toFixed(2)+'s"':'';
      s+=(sl.drift!=null?'<g class="drift"'+ex+'>':'')+glyph(sl.expect,sl.x,sl.y)+(sl.drift!=null?'</g>':'');
      return;
    }
    const code=pre[i]?(sl.expect==='dot'?1:2):(user[i]||0);
    if(code===0){
      s+='<circle class="ring'+(bad.has(i)?' bad':'')+(hinted.has(i)?' hinted':'')+'" cx="'+f1(sl.x)+'" cy="'+f1(sl.y)+'" r="5.4"/>';
    } else {
      s+=glyph(code===1?'dot':'cross',sl.x,sl.y);
      if(bad.has(i)) s+='<circle class="ring bad" cx="'+f1(sl.x)+'" cy="'+f1(sl.y)+'" r="6.6"/>';
      else if(hinted.has(i)) s+='<circle class="ring hinted" cx="'+f1(sl.x)+'" cy="'+f1(sl.y)+'" r="6.6"/>';
    }
    if(o.interactive && !pre[i]) s+='<circle class="hit" data-i="'+i+'" cx="'+f1(sl.x)+'" cy="'+f1(sl.y)+'" r="9" tabindex="0" role="button" aria-label="Electron position '+(i+1)+'"/>';
  });
  return s+'</svg>';
}
