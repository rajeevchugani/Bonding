/* ---------- Light / dark theme switch (dark is the default) ---------- */
(function(){
  const KEY='bondinglab-theme', root=document.documentElement;
  let theme='dark';
  try{ const v=localStorage.getItem(KEY); if(v==='light'||v==='dark') theme=v; }catch(e){}
  const hb=document.getElementById('hbtns')||document.querySelector('header'); const b=document.createElement('button'); b.type='button'; b.className='hbtn'; b.id='thbtn';
  function apply(){
    root.setAttribute('data-theme',theme);
    const light=theme==='light';
    b.textContent=light?'☾ Dark mode':'☀ Light mode';
    b.setAttribute('aria-label',light?'Switch to dark theme':'Switch to light theme');
    b.title=b.getAttribute('aria-label');
  }
  b.addEventListener('click',()=>{ theme=theme==='light'?'dark':'light'; try{ localStorage.setItem(KEY,theme); }catch(e){} apply(); });
  apply(); if(hb) hb.insertBefore(b,hb.firstChild);
})();
