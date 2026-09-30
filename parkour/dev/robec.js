/* ===== Level 2 preview: Rue Eau-de-Robec by day =====
   Dev-only. build.sh splices this file into the core at the LEVEL2 marker for the
   preview page; the game Abel gets is built without it. The level is a fixed,
   hand-built course played by a scripted autopilot (demo only). */
const R2={acts:[],ai:0,backs:[]};
const DAY_FAR={hill:'#8cc7a3',sil:'#86a3d6',lat:'#a4bde6',glow:'rgba(255,255,255,0)'};
const R2PAL=[{wall:'#e8846a',timber:'#3b2418'},{wall:'#7fc8c0',timber:'#2c3e66'},{wall:'#efe6d6',timber:'#5a2e1a'},{wall:'#ef9fb5',timber:'#4a2a4a'},{wall:'#a8d58a',timber:'#3d2a17'},{wall:'#9fb8ec',timber:'#2a2f5a'},{wall:'#f4b860',timber:'#5a2e1a'},{wall:'#c98f6b',timber:'#3a2216'},{wall:'#d7c9ef',timber:'#3a2f5a'}];
const SHUT=['#2f7fbf','#3a9a5b','#c8453b','#e5a32e','#7a4fb0'];
const FLOW=['#e0393e','#ff7ad9','#ffcd3c','#ffffff','#b14fe0'];
let clouds=[], stOuen=null;

/* game-accurate flight time: from height 0 with vertical speed vy (negative = up) until,
   while falling, the body is back down to height H (positive = above start) */
const upList=u=>u?(Array.isArray(u)?u.slice():[u]):[];
function simT(vy,H,dj,up){
  let y=0,v=vy,t=0,didDj=false; const dt=1/60, ups=upList(up);
  for(let i=0;i<600;i++){
    if(dj&&!didDj&&t>=dj){ v=-DJUMPV; didDj=true; }
    if(ups.length&&t>=ups[0]){ ups.shift(); if(v>0) v*=.35; }
    v+=GRAV*dt; y+=v*dt; t+=dt;
    if(v>0&&-y<=H) return t;
  }
  return t;
}
function arcCoins(x0,y0,vy,H,dj,up,v){
  let y=0,vv=vy,t=0,k=0,didDj=false; const dt=1/60, ups=upList(up);
  for(let i=0;i<600;i++){
    if(dj&&!didDj&&t>=dj){ vv=-DJUMPV; didDj=true; }
    if(ups.length&&t>=ups[0]){ ups.shift(); if(vv>0) vv*=.35; }
    vv+=GRAV*dt; y+=vv*dt; t+=dt;
    if(vv>0&&-y<=H) break;
    if(++k%5===0) coins.push({x:x0+v*t,y:y0+y-26,t:false});
  }
}

const LV2={
  speed:()=>260,
  init(){
    const v=260, S=BASE; R2.acts=[]; R2.ai=0; R2.backs=[]; R2.lastCh=-9;
    const act=(x,a,c)=>R2.acts.push({x,a,c});
    const plat=(x,w,h,kind,o)=>{ const p=Object.assign({x,w,y:S-h,kind},o||{}); plats.push(p); return p; };
    const back=(x,w,h)=>{ const i=R2.backs.length, ch=i-R2.lastCh>=3&&Math.random()<.45; if(ch) R2.lastCh=i; R2.backs.push({x,w,top:S-h,pal:R2PAL[i%R2PAL.length],seed:i*7+3+(i%3),ch,fl:ch&&Math.random()<.35}); };
    const row=(x1,x2,y)=>{ for(let x=x1;x<x2;x+=26) coins.push({x,y,t:false}); };
    const obs=(type,x,w,box,o)=>{ const ob=makeObst(type,x,S); ob.w=w; ob.box=box; Object.assign(ob,{over:false},o||{}); return ob; };
    const bench=x=>obs('banc',x,62,[x+2,S-30,x+60,S],{vault:true});
    const lift=(g,w)=>{ gaps.push([g,g+w]); return plat(g,w,0,'lift',{trig:380,a:0}); };
    const gaps=[], houses=[];
    const jumpFrom=(x,h0,H,c,dj,up)=>{ act(x,'jump',c); if(dj){ act(x+v*dj,'jump'); } for(const u of upList(up)) act(x+v*u,'up'); arcCoins(x,S-h0,-JUMPV,H-h0,dj,up,v); return x+v*simT(-JUMPV,H-h0,dj,up); };

    // 1. warm-up on the quay: a pot of geraniums, then a football
    row(120,300,S-22);
    obs('pot',380,24,[382,S-26,402,S]);
    jumpFrom(380-40,0,0,'Il saute par-dessus le pot de fleurs');
    placeFoot(590,S,760); act(560,null,'Un ballon ! Il tire dans le but…');

    // 2. café terrace: street -> table -> striped awning (bounce) -> balcony -> street
    let l1=jumpFrom(880,0,30,'Il saute sur la table du café !');
    const t1=plat(l1-16,50,30,'table');
    plat(t1.x-26,18,16,'chair',{deco:true}); plat(t1.x+t1.w+8,18,16,'chair',{deco:true});
    let l2=jumpFrom(l1+10,30,70);
    plat(l2-22,86,70,'awning',{bounce:1050});
    let l3=l2+v*simT(-1050,100); arcCoins(l2,S-70,-1050,100,0,0,v);
    const bal=plat(l3-30,150,170,'balcony'); act(l3+2,null,'Il atterrit sur un balcon !');
    row(bal.x+50,bal.x+bal.w-20,S-192);
    let l4=jumpFrom(bal.x+bal.w-12,170,0,'Il saute du balcon !');

    // 3. hanging café sign: slide, then a kong vault over a bench
    const s1=l4+300;
    obs('sign',s1,72,[s1,S-400,s1+60,S-34],{over:true});
    act(s1-32,'slide','Il glisse sous l’enseigne du café');
    row(s1-10,s1+70,S-14);
    const bn1=s1+240; bench(bn1);
    jumpFrom(bn1-46,0,0,'Saut de chat par-dessus le banc !');

    // 4. the first drawbridge opens: double jump over the Robec
    const g1=bn1+52+300; lift(g1,210);
    act(g1-420,null,'Attention, le pont se lève !');
    jumpFrom(g1-18,0,0,'Double saut par-dessus le pont levé !',.345);

    // 4b. little footbridge, then balance along a handrail
    const g2=g1+210+300; gaps.push([g2,g2+240]);
    plat(g2-6,252,0,'bridge'); act(g2+30,null,'Il passe sur la petite passerelle');
    row(g2+20,g2+230,S-22);
    const ra=jumpFrom(g2+240+170,0,34,'Il saute sur la rambarde…');
    const rail=plat(ra-16,240,34,'rail'); act(ra+12,null,'ÉQUILIBRE sur la rambarde !');
    row(rail.x+40,rail.x+rail.w-20,S-58);
    const re=jumpFrom(rail.x+rail.w-12,34,0);

    // 5. pigeons: slide; street football
    const p1=re+220; makeObst('pigeons',p1,S);
    act(p1-30,'slide','Il glisse sous les pigeons');
    placeFoot(p1+150,S,p1+410); act(p1+110,null,'Un ballon ! Il tire…');

    // 5b. the golden record's bubble protects him from a bike
    items.push({type:'disque',x:p1+530,y:S-48,t:false}); act(p1+500,null,'Disque d’or : une bulle de protection !');
    const bk=p1+780; obs('velo',bk,48,[bk+2,S-32,bk+46,S]);
    act(bk-90,null,'Pas besoin de sauter : la bulle le protège !');

    // 5c. the Paris ball pulls in the coins; a washing line of jerseys to slide under
    items.push({type:'ballon',x:bk+230,y:S-48,t:false}); act(bk+200,null,'Le ballon aimant attire les pièces !');
    for(let i=0;i<14;i++) coins.push({x:bk+300+i*22,y:S-60-Math.sin(i*.7)*50,t:false});
    const lg=bk+520; makeObst('linge',lg,S); act(lg-32,'slide','Il glisse sous les maillots');

    // 5d. the UFO carries him over a wide stretch of the Robec
    const uf=lg+300; items.push({type:'ovni',x:uf,y:S-48,t:false});
    act(uf-30,null,'MODE OVNI : il vole au-dessus de la Robec !');
    gaps.push([uf+380,uf+1000]);

    // 6. Spider-Man: climb a house wall, run on the roof, jump down with flips and roll
    const hx=uf+1750; houses.push({x:hx,w:300,h:190});
    row(hx+40,hx+270,S-212);
    items.push({type:'chest',x:hx+160,y:S-202,t:false});
    const l5=jumpFrom(hx+300-14,190,0,'Il saute du toit : DOUBLE SALTO !',.3,.66);

    // 6b. another kong vault
    const bn2=l5+230; bench(bn2);
    jumpFrom(bn2-46,0,0,'Encore un saut de chat !');

    // 6c. a big Paris banner to slide under
    const bnr=bn2+62+260; makeObst('banner',bnr,S); act(bnr-32,'slide','Il glisse sous la banderole ICI C’EST PARIS');

    // 7. the big drawbridge: double jump + flips
    const g3=bnr+80+340; lift(g3,240);
    act(g3-420,null,'Le grand pont s’ouvre !');
    const jx=g3-18, land3=jx+v*simT(-JUMPV,0,.345,.345+.36);
    jumpFrom(jx,0,0,'Double saut + salto au-dessus du pont !',.345,.345+.36);

    // 8. second terrace: two tables, awning, high balcony, onto a roof
    const tx=land3+220;
    let m1=jumpFrom(tx,0,30,'De table en table !');
    const ta=plat(m1-16,50,30,'table'); plat(ta.x-26,18,16,'chair',{deco:true});
    let m2=jumpFrom(m1+10,30,30);
    const tb=plat(m2-16,50,30,'table'); plat(tb.x+tb.w+8,18,16,'chair',{deco:true});
    let m3=jumpFrom(m2+10,30,70);
    plat(m3-22,86,70,'awning',{bounce:1050});
    let m4=m3+v*simT(-1050,110); arcCoins(m3,S-70,-1050,110,0,0,v);
    const b2=plat(m4-30,140,180,'balcony'); act(m4+2,null,'Encore un balcon !');
    const jr=b2.x+b2.w-12;
    act(jr,'jump','Il saute sur le toit !');
    let tUp=0; { let y=0,vv=-JUMPV; const dt=1/60; for(let i=0;i<200;i++){ vv+=GRAV*dt; y+=vv*dt; tUp+=dt; if(-y>=46) break; } }
    const h2x=jr+v*tUp+6, m5=jr+v*simT(-JUMPV,40);
    houses.push({x:h2x,w:Math.max(260,m5-h2x+200),h:220});
    arcCoins(jr,S-180,-JUMPV,40,0,0,v);
    const h2=houses[houses.length-1];
    row(m5+20,h2x+h2.w-30,S-242);
    const l6=jumpFrom(h2x+h2.w-14,220,0,'Il saute du toit : TRIPLE SALTO !',.3,[.66,1.02]);

    // 9. finish
    const fx=l6+420; G.finishX=fx;
    const fo=makeObst('finish',fx,S); fo.box=[-1e9,-1e9,-1e9,-1e9]; fo.over=false; fo.passed=true;
    row(l6+60,fx-30,S-22);

    // one continuous row of houses along the street (balconies, awnings and signs hang on it)
    for(let bx=-400;bx<fx+2600;){ const w=150+Math.random()*130; let h=92+Math.random()*38;
      for(const p of plats) if(p.kind==='balcony'&&p.x<bx+w&&p.x+p.w>bx) h=Math.max(h,S-p.y+40);
      back(bx,w,h); bx+=w; }

    // quays everywhere except the river gaps; houses on top
    let x=-400; const end=fx+2600;
    for(const [a,b] of gaps.sort((p,q)=>p[0]-q[0])){ addBuilding(x,a-x,S,'quai'); x=b; }
    addBuilding(x,end-x,S,'quai');
    for(const h of houses){ const b=addBuilding(h.x,h.w,S-h.h,'maison'); b.climb=true; b.pal=R2PAL[(h.x|0)%R2PAL.length]; }
    G.genX=end; G.prevTop=S;
    buildings.sort((p,q)=>(p.style==='maison')-(q.style==='maison')||p.x-q.x);
  },
  gen(){ addBuilding(G.genX,2000,BASE,'quai'); },
  bot(){
    const px=G.cam+PX;
    while(R2.ai<R2.acts.length&&px>=R2.acts[R2.ai].x){
      const a=R2.acts[R2.ai++];
      if(a.c) cap(a.c);
      if(a.a==='jump') jump(); else if(a.a==='slide') swipeDown(); else if(a.a==='up') swipeUp();
    }
  },
  build(){
    buildFar(DAY_FAR); buildMid2(); buildStOuen(); for(const b of R2.backs) b.img=null;
    clouds=[]; const r=rng(21); for(let i=0;i<7;i++) clouds.push({x:r()*1600,y:30+r()*Math.max(60,BASE-230),s:.7+r()*.8,p:.05+r()*.08});
  },
  sky(tt){
    const g=ctx.createLinearGradient(0,0,0,BASE+40); g.addColorStop(0,'#2f8fe0'); g.addColorStop(.65,'#7cc6f5'); g.addColorStop(1,'#ffe7b8');
    ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
    const sx=VW*.82, sy=Math.max(48,BASE-215);
    const sg=ctx.createRadialGradient(sx,sy,8,sx,sy,80); sg.addColorStop(0,'rgba(255,236,150,.95)'); sg.addColorStop(1,'rgba(255,236,150,0)');
    ctx.fillStyle=sg; ctx.fillRect(sx-80,sy-80,160,160); ctx.fillStyle='#fff3b0'; ctx.beginPath(); ctx.arc(sx,sy,19,0,TAU); ctx.fill();
    const off=G.cam+G.bgOff;
    ctx.fillStyle='rgba(255,255,255,.95)';
    for(const c of clouds){ const x=((c.x-off*c.p)%(VW+260)+VW+260)%(VW+260)-130; const s=c.s;
      ctx.beginPath(); ctx.arc(x,c.y,16*s,0,TAU); ctx.arc(x+18*s,c.y-8*s,20*s,0,TAU); ctx.arc(x+40*s,c.y,15*s,0,TAU); ctx.rect(x,c.y-2,40*s,16*s); ctx.fill(); }
  },
  bg(off,tt){
    drawLayers(off);
    if(stOuen){ const P2=2600, o=((off*.2)%P2+P2)%P2; const k=Math.min(.78,(BASE-20)/stOuen.h), sw=stOuen.w*k, shh=stOuen.h*k; for(const sx of [520-o,520-o+P2]) if(sx>-sw&&sx<VW) ctx.drawImage(stOuen.img,sx,BASE-shh+6,sw,shh); }
    ctx.fillStyle='#9a8470'; ctx.fillRect(-10,BASE,VW+20,26);
    const wg=ctx.createLinearGradient(0,BASE+26,0,VH); wg.addColorStop(0,'#3cc6dc'); wg.addColorStop(1,'#1c77a6');
    ctx.fillStyle=wg; ctx.fillRect(-10,BASE+26,VW+20,VH);
    ctx.fillStyle='rgba(255,255,255,.55)';
    for(let row=0,y=BASE+34;y<VH;y+=9,row++){ const dir=row%2?1:-1; for(let i=0;i<8;i++){ const x=(((i*131+row*57)+tt*28*dir-(off%400))%(VW+80)+VW+80)%(VW+80)-40; ctx.fillRect(x,y,14,1.6); } }
    for(const b of R2.backs){ const x=b.x-G.cam; if(x>VW||x+b.w<0) continue; if(!b.img) b.img=backImg(b); ctx.drawImage(b.img,x,b.top-RH,b.w,BASE-b.top+RH);
      if(b.chim&&G.state!=='pause'&&Math.random()<.4){ const fl=b.fl;
        parts.push({x:b.x+b.chim.dx+rand(-3,3),y:b.top+b.chim.dy,vx:rand(-45,-15),vy:rand(-85,-50),l:0,m:rand(1.6,2.4),s:rand(6,10),
          c:fl?(Math.random()<.5?'rgba(235,60,66,.55)':'rgba(60,105,235,.55)'):'rgba(245,245,250,.7)',g:-12,round:1}); } }
  },
  facade(c,b){ if(b.style==='maison') drawMaison(c,b); else drawQuai(c,b); },
  drawObst(o,x,t){
    const T=o.top;
    if(o.type==='pot'){
      ctx.fillStyle='#c0643b'; ctx.beginPath(); ctx.moveTo(x+4,T); ctx.lineTo(x+1,T-16); ctx.lineTo(x+23,T-16); ctx.lineTo(x+20,T); ctx.fill();
      ctx.fillStyle='#9c4d2b'; ctx.fillRect(x,T-18,24,3);
      ctx.fillStyle='#3f8a3a'; for(let i=0;i<5;i++){ ctx.beginPath(); ctx.arc(x+4+i*4,T-20-(i%2)*3,4,0,TAU); ctx.fill(); }
      ctx.fillStyle='#e0393e'; for(let i=0;i<4;i++){ ctx.beginPath(); ctx.arc(x+5+i*5,T-24-(i%2)*2,2.4,0,TAU); ctx.fill(); }
      return true;
    }
    if(o.type==='banc'){
      const a=.35+.25*Math.sin(t*6); ctx.fillStyle=`rgba(255,215,70,${a*.55})`; rr(ctx,x-6,T-40,74,44,10); ctx.fill();
      ctx.fillStyle='#10183a'; ctx.fillRect(x+3,T-18,6,18); ctx.fillRect(x+53,T-18,6,18); ctx.fillRect(x+5,T-36,4,18); ctx.fillRect(x+53,T-36,4,18);
      for(let i=0;i<2;i++){ ctx.fillStyle='#e0393e'; ctx.fillRect(x,T-22-i*6,62,5); ctx.strokeStyle='#10183a'; ctx.lineWidth=1.2; ctx.strokeRect(x,T-22-i*6,62,5); }
      for(let i=0;i<2;i++){ ctx.fillStyle='#1b2a5c'; ctx.fillRect(x+2,T-38+i*6,58,4.5); }
      ctx.fillStyle='#fff'; ctx.fillRect(x+28,T-38,6,10);
      return true;
    }
    if(o.type==='velo'){
      ctx.strokeStyle='#23232a'; ctx.lineWidth=2.4; ctx.beginPath(); ctx.arc(x+10,T-10,9,0,TAU); ctx.arc(x+38,T-10,9,0,TAU); ctx.stroke();
      ctx.strokeStyle='#e0393e'; ctx.lineWidth=2.6; ctx.beginPath(); ctx.moveTo(x+10,T-10); ctx.lineTo(x+20,T-24); ctx.lineTo(x+34,T-24); ctx.lineTo(x+38,T-10); ctx.moveTo(x+20,T-24); ctx.lineTo(x+24,T-10); ctx.lineTo(x+10,T-10); ctx.moveTo(x+34,T-24); ctx.lineTo(x+36,T-31); ctx.stroke();
      ctx.fillStyle='#23232a'; ctx.fillRect(x+16,T-28,9,3); ctx.fillRect(x+33,T-33,8,2.5);
      ctx.fillStyle='#c98e4f'; ctx.fillRect(x+30,T-38,14,6);
      return true;
    }
    if(o.type==='sign'){
      ctx.strokeStyle='#2b2b30'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x+72,T-128); ctx.lineTo(x+4,T-128); ctx.stroke();
      ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(x+72,T-112); ctx.lineTo(x+40,T-128); ctx.moveTo(x+14,T-128); ctx.lineTo(x+14,T-104); ctx.moveTo(x+54,T-128); ctx.lineTo(x+54,T-104); ctx.stroke();
      const sw=Math.sin(t*2+o.seed)*1.5;
      ctx.fillStyle='#1b2a5c'; rr(ctx,x+2+sw,T-104,64,62,6); ctx.fill();
      ctx.fillStyle='#e0393e'; ctx.fillRect(x+2+sw,T-60,64,10);
      ctx.fillStyle='#ffcd3c'; ctx.font='17px "Lilita One",sans-serif'; ctx.textAlign='center'; ctx.fillText('CAFÉ',x+34+sw,T-80);
      ctx.fillStyle='#fff'; ctx.font='8px "Nunito",sans-serif'; ctx.fillText('DU ROBEC',x+34+sw,T-66);
      return true;
    }
    return false;
  },
  overlay(cam,t){
    const S=BASE, pulse=.55+.45*Math.sin(t*6);
    for(const b of buildings){ if(!b.climb) continue; const x=b.x-cam; if(x>VW||x+b.w<0) continue;
      // bright climbing holds up the wall and a glowing roof edge: this is where he climbs and runs
      const hc=['#ff4d4d','#ffcd3c','#3fd16b','#2d8ef0','#ff7ad9'];
      for(let y=S-14,i=0;y>b.top+10;y-=22,i++){ ctx.fillStyle=hc[i%hc.length]; ctx.beginPath(); ctx.ellipse(x+6+(i%2)*7,y,4.5,3.5,.4,0,TAU); ctx.fill(); }
      ctx.strokeStyle=`rgba(255,205,60,${.5+.5*pulse})`; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x,S); ctx.lineTo(x,b.top); ctx.lineTo(x+b.w,b.top); ctx.stroke();
      if(x>PX+30&&x<VW) marker(x+b.w*.3,b.top-18,t,'GRIMPE');
    }
    for(const p of plats){ if(p.deco||p.kind==='lift'||p.kind==='bridge') continue; const x=p.x-cam; if(x<PX+30||x>VW) continue;
      marker(x+p.w/2,p.y-(p.kind==='balcony'?30:20),t,p.kind==='awning'?'REBOND':p.kind==='rail'?'ÉQUILIBRE':null); }
    for(const o of obst){ if(!o.vault) continue; const x=o.x-cam; if(x<PX+30||x>VW) continue; marker(x+31,S-48,t,'SAUT DE CHAT'); }
  },
  drawPlat(p,x,t){
    const y=p.y, S=BASE;
    if(!p.deco&&p.kind!=='bridge'&&p.kind!=='lift'){ const a=.35+.25*Math.sin(t*6); ctx.fillStyle=`rgba(255,215,70,${a*.5})`; ctx.fillRect(x-7,y-8,p.w+14,18); ctx.fillStyle=`rgba(255,215,70,${a})`; ctx.fillRect(x-3,y-4,p.w+6,10); }
    if(p.kind==='table'){
      ctx.fillStyle='#2d2d33'; ctx.fillRect(x+p.w/2-1.5,y,3,S-y); ctx.beginPath(); ctx.ellipse(x+p.w/2,S-1,9,2.5,0,0,TAU); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.rect(x-3,y-1,p.w+6,11); ctx.clip();
      for(let i=0;i<9;i++) for(let j=0;j<2;j++){ ctx.fillStyle=(i+j)%2?'#e0393e':'#ffffff'; ctx.fillRect(x-3+i*(p.w+6)/9,y-1+j*5.5,(p.w+6)/9+.5,5.5); }
      ctx.restore(); ctx.strokeStyle='#8a1f22'; ctx.lineWidth=1.2; ctx.strokeRect(x-3,y-1,p.w+6,11);
      ctx.fillStyle='#fff'; ctx.fillRect(x+p.w/2+6,y-5,5,5); ctx.fillStyle='#6b3f25'; ctx.fillRect(x+p.w/2+6.5,y-5,4,1.5);
    } else if(p.kind==='chair'){
      ctx.strokeStyle='#1f6f5c'; ctx.lineWidth=2; ctx.beginPath();
      ctx.moveTo(x+2,S); ctx.lineTo(x+3,y); ctx.moveTo(x+16,S); ctx.lineTo(x+15,y); ctx.moveTo(x+15,y); ctx.lineTo(x+17,y-16); ctx.stroke();
      ctx.fillStyle='#2fa37f'; ctx.fillRect(x,y-2,18,4); ctx.fillStyle='#1f6f5c'; ctx.fillRect(x+12,y-16,6,3);
    } else if(p.kind==='awning'){
      if(p.sq>0) p.sq=Math.max(0,p.sq-.06);
      const yy=y+(p.sq||0)*6;
      ctx.fillStyle='#55555c'; ctx.fillRect(x+3,yy,2,S-yy); ctx.fillRect(x+p.w-5,yy,2,S-yy);
      for(let i=0;i*10<p.w;i++){ ctx.fillStyle=['#1b2a5c','#ffffff','#e0393e','#ffffff'][i%4]; ctx.fillRect(x+i*10,yy-4,Math.min(10,p.w-i*10),14); }
      for(let i=0;i*10<p.w;i++){ ctx.fillStyle=['#1b2a5c','#ffffff','#e0393e','#ffffff'][i%4]; ctx.beginPath(); ctx.arc(x+i*10+5,yy+10,5,0,Math.PI); ctx.fill(); }
      ctx.strokeStyle='#10183a'; ctx.lineWidth=1.5; ctx.strokeRect(x,yy-4,p.w,14);
      ctx.fillStyle='rgba(0,0,0,.15)'; ctx.fillRect(x,yy+8,p.w,2);
    } else if(p.kind==='balcony'){
      ctx.fillStyle='#fff4d6'; ctx.fillRect(x,y,p.w,7); ctx.fillStyle='#ffcd3c'; ctx.fillRect(x,y,p.w,2.5); ctx.fillStyle='#b8ae9b'; ctx.fillRect(x,y+7,p.w,3);
      ctx.fillStyle='#b8ae9b'; tri(ctx,x+8,y+9,x+26,y+9,x+8,y+26); tri(ctx,x+p.w-8,y+9,x+p.w-26,y+9,x+p.w-8,y+26);
      ctx.strokeStyle='rgba(30,30,36,.55)'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(x,y-16); ctx.lineTo(x+p.w,y-16);
      for(let bx=x+4;bx<x+p.w;bx+=8){ ctx.moveTo(bx,y-16); ctx.lineTo(bx,y); } ctx.stroke();
      for(const fx of [x+6,x+p.w-20]){ ctx.fillStyle='#c0643b'; ctx.fillRect(fx,y-8,14,8); for(let i=0;i<3;i++){ ctx.fillStyle=FLOW[i]; ctx.beginPath(); ctx.arc(fx+3+i*4,y-10,2.6,0,TAU); ctx.fill(); } }
    } else if(p.kind==='rail'){
      ctx.fillStyle='#1f5a48'; for(let bx=x+6;bx<x+p.w;bx+=30) ctx.fillRect(bx,y,3,S-y);
      ctx.fillStyle='#2e7d63'; ctx.fillRect(x,y,p.w,5); ctx.fillStyle='#7fd6b5'; ctx.fillRect(x,y,p.w,1.5);
      ctx.fillStyle='#1f5a48'; ctx.fillRect(x,y+(S-y)/2,p.w,2.5);
    } else if(p.kind==='bridge'){
      ctx.fillStyle='#7a4e2a'; ctx.fillRect(x,y,p.w,7); ctx.fillStyle='#b5773f'; for(let bx=x;bx<x+p.w;bx+=12) ctx.fillRect(bx,y,11,5);
      ctx.strokeStyle='#6b4424'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(x,y-18); ctx.lineTo(x+p.w,y-18); ctx.stroke();
      ctx.lineWidth=2; ctx.beginPath(); for(let bx=x+2;bx<=x+p.w;bx+=30){ ctx.moveTo(bx,y); ctx.lineTo(bx,y-18); } ctx.stroke();
      ctx.strokeStyle='#5d3a1d'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x,y+7); ctx.quadraticCurveTo(x+p.w/2,y+30,x+p.w,y+7); ctx.stroke();
    } else if(p.kind==='lift'){
      // drawbridge: two leaves that swing up when the runner comes close
      const d=p.lt?Math.min(.05,t-p.lt):0; p.lt=t;
      if(G.state==='play'&&G.cam+PX>p.x-p.trig) p.a=Math.min(1.3,p.a+d*1.5);
      p.deco=p.a>.15;
      const L=p.w/2, blink=p.a>0&&Math.floor(t*4)%2===0;
      for(const side of [0,1]){
        const hx=side?x+p.w:x;
        ctx.fillStyle='#8c7b6a'; ctx.fillRect(side?hx:hx-14,y-64,14,64+40);
        ctx.fillStyle='#0055a4'; ctx.fillRect(side?hx:hx-14,y-64,14,5); ctx.fillStyle='#fff'; ctx.fillRect(side?hx:hx-14,y-59,14,4); ctx.fillStyle='#ef4135'; ctx.fillRect(side?hx:hx-14,y-55,14,4);
        ctx.fillStyle=blink?'#ff3b30':'#6b1f1c'; ctx.beginPath(); ctx.arc(side?hx+7:hx-7,y-70,4,0,TAU); ctx.fill();
        ctx.save(); ctx.translate(hx,y); ctx.rotate(side?p.a:-p.a);
        const x0=side?-L:0;
        ctx.fillStyle='#8a5a33'; ctx.fillRect(x0,-1,L,9); ctx.fillStyle='#b5773f'; for(let bx=0;bx<L;bx+=11) ctx.fillRect(x0+bx,-1,10,5);
        for(let i=0;i<4;i++){ ctx.fillStyle=i%2?'#fff':'#e0393e'; ctx.fillRect(side?x0+i*6:L-24+i*6,6,6,3); }
        ctx.restore();
        const ex=side?hx-L*Math.cos(p.a):hx+L*Math.cos(p.a), ey=y-L*Math.sin(p.a);
        ctx.strokeStyle='#3a3a40'; ctx.lineWidth=1.5; ctx.setLineDash([3,2]); ctx.beginPath(); ctx.moveTo(side?hx+7:hx-7,y-62); ctx.lineTo(ex,ey); ctx.stroke(); ctx.setLineDash([]);
      }
    }
  },
  onEnd(){
    $('o-title').textContent='FIN DU NIVEAU 2 !';
    $('o-done').textContent='Aperçu du niveau Rue Eau-de-Robec. Il n’est pas encore dans le jeu d’Abel.';
  }
};
function marker(x,y,t,label){ // bouncing arrow over the next place to land
  const by=y-Math.abs(Math.sin(t*5))*7;
  ctx.fillStyle='#ffcd3c'; ctx.strokeStyle='#10183a'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(x-8,by-12); ctx.lineTo(x+8,by-12); ctx.lineTo(x+8,by-6); ctx.lineTo(x+13,by-6); ctx.lineTo(x,by+4); ctx.lineTo(x-13,by-6); ctx.lineTo(x-8,by-6); ctx.closePath(); ctx.fill(); ctx.stroke();
  if(label){ ctx.font='11px "Lilita One",sans-serif'; ctx.textAlign='center'; ctx.lineWidth=3; ctx.strokeText(label,x,by-17); ctx.fillText(label,x,by-17); }
}
function drawQuai(c,b){
  const w=b.w,h=b.hgt;
  c.fillStyle='#d6b48a'; c.fillRect(0,0,w,h);
  c.strokeStyle='rgba(110,80,50,.28)'; c.lineWidth=1;
  for(let y=16;y<h;y+=12){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); for(let x=((y/12)%2)*18;x<w;x+=36){ c.beginPath(); c.moveTo(x,y); c.lineTo(x,y+12); c.stroke(); } }
  c.fillStyle='rgba(80,150,70,.5)'; c.fillRect(0,34,w,5);
  for(let x=10;x<w;x+=46){ c.fillStyle='rgba(60,140,60,.55)'; c.beginPath(); c.arc(x,40,5,0,Math.PI); c.fill(); }
  c.fillStyle='#8c7462'; c.fillRect(0,0,w,11);
  for(let x=2,i=0;x<w;x+=8,i++){ c.fillStyle=i%3?'#b09a86':'#a08a76'; c.beginPath(); c.ellipse(x+3,5.5,3.6,3.2,0,0,TAU); c.fill(); }
  c.fillStyle='rgba(0,0,0,.18)'; c.fillRect(0,0,4,h); c.fillRect(w-4,0,4,h);
}
function colomb(c,r,x0,y0,w,h,pal,flower){
  c.fillStyle=pal.wall; c.fillRect(x0,y0,w,h);
  const T=pal.timber, FH=40;
  for(let fy=y0+8;fy<y0+h-8;fy+=FH){
    c.fillStyle=T; c.fillRect(x0,fy,w,5); c.fillStyle='rgba(0,0,0,.14)'; c.fillRect(x0,fy+5,w,3);
    const bay=30+Math.floor(r()*8);
    c.strokeStyle=T; c.lineWidth=3.5;
    for(let x=x0;x+bay<=x0+w+1;x+=bay){
      c.fillStyle=T; c.fillRect(x-2,fy,4,FH);
      const k=r();
      if(k<.45){
        const wx=x+6,wy=fy+10,ww=bay-12,wh=22;
        c.fillStyle=T; c.fillRect(wx-3,wy-3,ww+6,wh+6);
        const g=c.createLinearGradient(0,wy,0,wy+wh); g.addColorStop(0,'#bfe6ff'); g.addColorStop(1,'#4f8fd0'); c.fillStyle=g; c.fillRect(wx,wy,ww,wh);
        c.fillStyle='rgba(255,255,255,.65)'; c.fillRect(wx+2,wy+2,3,wh-4);
        c.fillStyle=T; c.fillRect(wx+ww/2-1,wy,2,wh);
        if(r()<.55){ c.fillStyle=SHUT[(r()*SHUT.length)|0]; c.fillRect(wx-8,wy-2,5,wh+4); c.fillRect(wx+ww+3,wy-2,5,wh+4); }
        if(flower&&r()<.6){ c.fillStyle='#8a5a33'; c.fillRect(wx-3,wy+wh+3,ww+6,4); for(let i=0;i<4;i++){ c.fillStyle=FLOW[(i+((r()*5)|0))%FLOW.length]; c.beginPath(); c.arc(wx+i*(ww/3),wy+wh+2,2.6,0,TAU); c.fill(); } c.fillStyle='#3f8a3a'; c.fillRect(wx-2,wy+wh+2,ww+4,1.5); }
      } else if(k<.75){ c.beginPath(); c.moveTo(x,fy+5); c.lineTo(x+bay,fy+FH); c.moveTo(x+bay,fy+5); c.lineTo(x,fy+FH); c.stroke(); }
      else { c.beginPath(); c.moveTo(x,fy+FH); c.lineTo(x+bay,fy+5); c.stroke(); }
    }
  }
}
function drawMaison(c,b){
  const r=rng(b.seed), w=b.w, st=BASE-b.top;
  colomb(c,r,0,0,w,st-48,b.pal,true);
  c.fillStyle='#1b2a5c'; c.fillRect(0,st-50,w,50);
  for(let x=14;x<w-40;x+=70){ c.fillStyle='#a9d4ef'; c.fillRect(x,st-42,44,34); c.fillStyle='rgba(255,255,255,.5)'; c.fillRect(x+4,st-38,4,26); }
  c.fillStyle='#ffcd3c'; c.font='12px "Lilita One",sans-serif'; c.textAlign='left'; c.fillText('BOULANGERIE',10,st-44);
  if(w>220){ const fx=w-60; c.fillStyle='#1b2a5c'; c.fillRect(fx,30,26,40); c.fillStyle='#fff'; c.fillRect(fx+9,30,8,40); c.fillStyle='#e0393e'; c.fillRect(fx+10.5,30,5,40); }
  c.fillStyle='#d6b48a'; c.fillRect(0,st,w,b.hgt-st);
  c.fillStyle='#4a5670'; c.fillRect(0,0,w,9); c.fillStyle='#a9b8d2'; c.fillRect(0,0,w,2);
  c.fillStyle='rgba(0,0,0,.2)'; c.fillRect(0,0,5,st);
}
const RH=46; // room above each backdrop for its pointed roof
function backImg(b){
  const R=Math.min(DPR,2), h=BASE-b.top;
  const cvs=document.createElement('canvas'); cvs.width=Math.ceil(b.w*S*R); cvs.height=Math.ceil((h+RH)*S*R);
  const c=cvs.getContext('2d'); c.scale(S*R,S*R); c.translate(0,RH);
  const r=rng(b.seed);
  colomb(c,r,0,0,b.w,h,b.pal,true);
  const hR=Math.min(RH-8,b.w*.3);
  if(b.ch){ const cx=b.w*.7, cy=-hR*.6; c.fillStyle='#a4533a'; c.fillRect(cx,cy-18,11,22); c.fillStyle='#6d3526'; c.fillRect(cx-2,cy-20,15,4); b.chim={dx:cx+5.5,dy:cy-22}; }
  c.fillStyle=['#4d5f86','#7a4a3a','#3f5f5a'][b.seed%3]; c.beginPath(); c.moveTo(-2,2); c.lineTo(b.w/2,-hR); c.lineTo(b.w+2,2); c.fill();
  c.fillStyle='rgba(255,255,255,.15)'; for(let y=-6;y>-hR;y-=6){ const k=(-y)/hR; c.fillRect(b.w/2-(1-k)*b.w/2,y,(1-k)*b.w,1); }
  c.fillStyle='#2f3a55'; c.fillRect(-2,0,b.w+4,4);
  c.fillStyle='rgba(0,0,0,.12)'; c.fillRect(0,0,3,h);
  const k=b.seed%3;
  if(k===0){ const fx=b.w*.3; c.fillStyle='#cfd5e0'; c.fillRect(fx-1,40,2,8); c.fillStyle='#0055a4'; c.fillRect(fx,44,10,36); c.fillStyle='#fff'; c.fillRect(fx+10,44,10,36); c.fillStyle='#ef4135'; c.fillRect(fx+20,44,10,36); }
  if(k===1&&b.w>170){ const bw=128, mx=(b.w-bw)/2, my=h-92, txt=["ICI C'EST PARIS","ALLEZ PARIS !","PSG"][(b.seed>>2)%3];
    c.fillStyle='#1b2a5c'; c.fillRect(mx,my,bw,38); c.fillStyle='#fff'; c.fillRect(mx+bw/2-12,my,24,38); c.fillStyle='#e0393e'; c.fillRect(mx+bw/2-8,my,16,38);
    c.font=(txt.length>12?'14px':'20px')+' "Lilita One",sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.lineWidth=4; c.strokeStyle='#1b2a5c'; c.fillStyle='#fff';
    c.strokeText(txt,mx+bw/2,my+20); c.fillText(txt,mx+bw/2,my+20); }
  c.fillStyle='rgba(40,30,70,.08)'; c.fillRect(-2,-RH,b.w+4,h+RH);
  return cvs;
}
function buildStOuen(){ // Abbatiale Saint-Ouen: long gothic nave and its crowned lantern tower
  const W=440,H=340,R=Math.min(DPR,1.5);
  const cvs=document.createElement('canvas'); cvs.width=Math.ceil(W*S*R); cvs.height=Math.ceil(H*S*R);
  const c=cvs.getContext('2d'); c.scale(S*R,S*R);
  const g=H, st='#eadfc9', sh='#d2c4a8', dk='#b3a488', gl='#6f82ad', rf='#8e9ab8';
  c.fillStyle=sh; c.fillRect(30,g-105,390,105);
  c.fillStyle=st; c.fillRect(50,g-150,350,150);
  c.fillStyle=rf; c.beginPath(); c.moveTo(46,g-150); c.lineTo(60,g-176); c.lineTo(392,g-176); c.lineTo(404,g-150); c.fill();
  for(let x=58;x<400;x+=34){ c.fillStyle=dk; c.fillRect(x,g-120,6,120); tri(c,x-2,g-120,x+8,g-120,x+3,g-142);
    c.fillStyle=gl; c.beginPath(); c.moveTo(x+12,g-60); c.lineTo(x+12,g-132); c.lineTo(x+18,g-140); c.lineTo(x+24,g-132); c.lineTo(x+24,g-60); c.fill();
    c.fillStyle=st; c.fillRect(x+17,g-136,2,76); }
  for(const x of [30,70]){ c.fillStyle=st; c.fillRect(x,g-210,26,210); c.fillStyle=sh; tri(c,x-2,g-210,x+28,g-210,x+13,g-262); c.fillStyle=gl; c.fillRect(x+10,g-190,6,30); }
  c.fillStyle=gl; c.beginPath(); c.arc(63,g-118,12,0,TAU); c.fill(); c.strokeStyle=st; c.lineWidth=1.5; for(let i=0;i<8;i++){ const a=i/8*TAU; c.beginPath(); c.moveTo(63,g-118); c.lineTo(63+Math.cos(a)*12,g-118+Math.sin(a)*12); c.stroke(); }
  const tx=205;
  c.fillStyle=st; c.fillRect(tx,g-270,64,100); c.fillStyle=sh; c.fillRect(tx+48,g-270,16,100);
  for(const k of [0,1]){ c.fillStyle=gl; c.beginPath(); c.moveTo(tx+12+k*26,g-185); c.lineTo(tx+12+k*26,g-250); c.lineTo(tx+18+k*26,g-258); c.lineTo(tx+24+k*26,g-250); c.lineTo(tx+24+k*26,g-185); c.fill(); }
  for(const x of [tx-4,tx+60]){ c.fillStyle=dk; c.fillRect(x,g-282,8,112); tri(c,x-2,g-282,x+10,g-282,x+4,g-306); }
  c.fillStyle=st; c.fillRect(tx+12,g-312,40,42); c.fillStyle=sh; c.fillRect(tx+40,g-312,12,42);
  c.fillStyle=gl; for(let i=0;i<3;i++){ c.beginPath(); c.moveTo(tx+16+i*12,g-276); c.lineTo(tx+16+i*12,g-300); c.arc(tx+20+i*12,g-300,4,Math.PI,0); c.lineTo(tx+24+i*12,g-276); c.fill(); }
  c.fillStyle=dk; for(let i=0;i<6;i++) tri(c,tx+10+i*7.6,g-312,tx+16+i*7.6,g-312,tx+13+i*7.6,g-332);
  c.fillStyle='rgba(140,170,220,.22)'; c.fillRect(0,0,W,H);
  stOuen={img:cvs,w:W,h:H};
}
function buildMid2(){
  const MW=1400,MH=300,R=Math.min(DPR,1.5);
  const cvs=document.createElement('canvas'); cvs.width=Math.ceil(MW*S*R); cvs.height=Math.ceil(MH*S*R);
  const c=cvs.getContext('2d'); c.scale(S*R,S*R);
  const g=260, r=rng(31); let x=0,i=0;
  while(x<MW){
    let w=50+r()*45; if(x+w>MW-40) w=MW-x;
    const h=110+r()*85, top=g-h, pal=R2PAL[i++%R2PAL.length];
    colomb(c,r,x,top,w,h,pal,false);
    c.fillStyle='#5f6f95'; tri(c,x-2,top,x+w+2,top,x+w/2,top-Math.min(62,w*.8));
    c.fillStyle='rgba(120,160,220,.3)'; c.fillRect(x,top-64,w,h+64);
    x+=w;
  }
  mid={img:cvs,w:MW,h:MH,y0:BASE-260};
}
LV=LV2;
(function(){ // preview menu: only the level-2 demo
  const logo=document.querySelector('.logo'); if(logo) logo.innerHTML='<span>NIVEAU 2</span><span>RUE EAU-DE-ROBEC</span>';
  const t=document.querySelector('title'); if(t) t.textContent='Parkour Niveau 2';
  for(const id of ['b-play','b-shop','b-miss','b-savep','b-music']){ const e=$(id); if(e) e.hidden=true; }
  const st=document.querySelector('.stats'); if(st) st.hidden=true;
  const ht=document.querySelector('.howto'); if(ht) ht.textContent='Aperçu pour toi seulement : le jeu joue tout seul. Ce niveau n’est pas encore dans la version d’Abel.';
  const d=$('b-demo'); if(d){ d.textContent='VOIR LE NIVEAU 2'; d.style.flex='1'; }
})();
