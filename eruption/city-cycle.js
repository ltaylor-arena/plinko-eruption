'use strict';
const cycle={phase:'play',t:0,won:0};
function finishCity(){
  if(cycle.phase!=='play')return;
  cycle.phase='settling';cycle.t=0;setAuto(false);banner=null;ui();
}
function updateCityCycle(dt){
  cycle.t+=dt;
  if(cycle.phase==='settling'&&balls.length===0){
    cycle.won=pot;balance=r2(balance+pot);pot=0;
    cycle.phase='award';cycle.t=0;warp=null;
    banner={title:'CITY COMPLETE',sub:`TOWER POT +${money(cycle.won)} CR`,t:0};ui();
  }else if(cycle.phase==='award'&&cycle.t>=2.2){
    cycle.phase='rebuild';cycle.t=0;banner=null;resetStreetActors();
    for(const b of buildings){b.dead=false;b.hp=b.maxHp;b.flash=0;initBlocks(b);}ui();
  }else if(cycle.phase==='rebuild'&&cycle.t>=2.8){
    city++;cycle.phase='play';cycle.t=0;cycle.won=0;nextWarpAt=now+3;ui();
  }
}
function cycleUI(){
  const phase=cycle.phase,tw=towerOf();
  const labels={play:'1 · ERUPT & DAMAGE',settling:'2 · SETTLING LAST BALLS',award:'3 · TOWER BONUS',rebuild:'4 · REBUILDING CITY'};
  const details={play:`${tw.maxHp-tw.hp}/${tw.maxHp} tower hits · ${buildings.filter(b=>b.dead).length} buildings down. Each ball pays its bay multiplier.`,settling:'New launches paused. Every ball already in flight will finish and pay out.',award:`${money(cycle.won)} CR Tower Pot added to your balance. The whole city rebuilds next.`,rebuild:'Cranes lifting. Crews rebuilding. Every building returns for the next city.'};
  $('phase-title').textContent=labels[phase];$('phase-detail').textContent=details[phase];
  $('erupt').disabled=phase!=='play';$('auto').disabled=phase!=='play';
  $('erupt').textContent=phase==='play'?'ERUPT':phase==='settling'?'SETTLING…':phase==='award'?'BONUS PAID':'REBUILDING…';
  const locked=phase!=='play'||balls.length>0;
  $('rows').disabled=locked;for(const x of $('risk').children)x.disabled=locked;
  $('crack').disabled=phase!=='play';$('force-warp').disabled=phase!=='play';
  for(const el of document.querySelectorAll('[data-phase]'))el.classList.toggle('active',el.dataset.phase===phase);
}
function drawCityBuilding(b){
  if(cycle.phase!=='rebuild'){pixelBuilding(b);return;}
  // Four construction snapshots, staggered from the outskirts toward the tower.
  const delay=(1-Math.abs(b.i-rows/2)/(rows/2))*.25;
  const t=Math.max(0,cycle.t-delay),u=Math.min(1,Math.max(0,(t-.35)/1.9));
  const scaffoldH=b.h0*Math.min(1,Math.ceil(t/.12)/4),x=b.x-b.w/2-5,w=b.w+10;
  ctx.save();ctx.lineWidth=1.5;
  ctx.globalAlpha=t>2.25?Math.max(0,1-(t-2.25)/.3):.8;
  ctx.strokeStyle='#98a2a5';
  for(const xx of [x,x+w]){ctx.beginPath();ctx.moveTo(xx,STREET);ctx.lineTo(xx,STREET-scaffoldH);ctx.stroke();}
  for(let h=18;h<scaffoldH;h+=24){
    ctx.strokeStyle='#9a8c68';ctx.beginPath();ctx.moveTo(x,STREET-h);ctx.lineTo(x+w,STREET-h);ctx.stroke();
    ctx.strokeStyle='#687e8a';ctx.beginPath();ctx.moveTo(x,STREET-h);ctx.lineTo(x+w,STREET-h+24);ctx.stroke();
  }
  ctx.restore();
  const maxRow=Math.max(...b.blocks.map(v=>v.row))+1,level=u*maxRow,done=Math.floor(level),fraction=level-done;
  ctx.save();ctx.beginPath();ctx.rect(x,STREET-done*b.unit,w,done*b.unit+2);ctx.clip();pixelBuilding(b);ctx.restore();
  if(u>0&&u<1)for(const v of b.blocks)if(v.row===done){
    const fall=reduced?0:(1-fraction)**2*(24+(v.col%3)*10);
    ctx.fillStyle=blockColor(b,v);ctx.fillRect(Math.round(v.x),Math.round(v.y-fall),Math.ceil(b.unit),Math.ceil(b.unit));
    ctx.fillStyle='#dcc5a888';ctx.fillRect(v.x,v.y-fall,b.unit,1);
  }
}
