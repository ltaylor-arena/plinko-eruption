'use strict';
const impactExplosions=[],explosionFrames=[];
const explosionSheet=new Image();explosionSheet.src='explosion-rounded.png';
explosionSheet.onload=()=>{
  const w=explosionSheet.naturalWidth/3,h=explosionSheet.naturalHeight/2;
  for(let i=0;i<6;i++){
    const c=document.createElement('canvas');c.width=c.height=256;
    c.getContext('2d').drawImage(explosionSheet,(i%3)*w,Math.floor(i/3)*h,w,h,0,0,256,256);
    explosionFrames.push(c);
  }
};
function buildingExplosion(b,x,y){
  if(impactExplosions.length>=48)impactExplosions.shift();
  impactExplosions.push({x,y,age:0,size:Math.min(155,Math.max(85,b.w*1.8)),duration:1.05});
}
function updateImpactEffects(dt){
  for(let i=impactExplosions.length-1;i>=0;i--){
    const e=impactExplosions[i];e.age+=dt;if(e.age>=e.duration)impactExplosions.splice(i,1);
  }
}
function drawImpactExplosions(street=false){
  const timings=[0,.07,.17,.32,.53,.77,1.05];
  for(const e of impactExplosions){
    if(!!e.street!==street)continue;
    let frame=0;while(frame<5&&e.age>=timings[frame+1])frame++;
    const mix=Math.min(1,(e.age-timings[frame])/(timings[frame+1]-timings[frame]));
    const fade=frame===5?1-mix:1;
    ctx.save();
    // Brief reflected light on the impact surface; no strobing or screen flash.
    const light=Math.max(0,1-e.age/.35)*(reduced?.15:.4);
    if(light){
      const g=ctx.createRadialGradient(e.x,e.y,1,e.x,e.y,e.size*.65);
      g.addColorStop(0,`rgba(255,165,66,${light})`);g.addColorStop(1,'#ff5a0000');
      ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.fillRect(e.x-e.size,e.y-e.size,e.size*2,e.size*2);ctx.globalCompositeOperation='source-over';
    }
    if(explosionFrames.length===6){
      const size=e.size,x=e.x-size/2,y=e.y-size*.5;
      // Cached, consistently anchored frames blend into each other without rotation.
      ctx.globalAlpha=(reduced?.65:1)*fade*(frame===5?1:1-mix);
      ctx.drawImage(explosionFrames[frame],x,y,size,size);
      if(frame<5){ctx.globalAlpha=(reduced?.65:1)*mix;ctx.drawImage(explosionFrames[frame+1],x,y,size,size);}
    }
    ctx.restore();
  }
}
function windowIsLit(b,v,time=now){
  if(b.powerCut||b.dead||cycle.phase==='rebuild')return false;
  const epoch=reduced?0:Math.floor((time+v.row*1.7+v.col*3.1)/(7+v.tone*11));
  let hash=(b.i*173+v.row*197+v.col*137+epoch*997)|0;
  hash=Math.imul(hash^(hash>>>16),0x45d9f3b);hash=Math.imul(hash^(hash>>>16),0x45d9f3b);
  return ((hash^(hash>>>16))>>>0)%100<28;
}
