'use strict';
const warpTexture=new Image();warpTexture.src='warp-ring.png';
const portalTextures=[];
warpTexture.onload=()=>{
  // Cache small textures so the animation never resamples the full-size asset.
  for(let i=0;i<2;i++){
    const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
    if(i)g.filter='hue-rotate(285deg)';g.drawImage(warpTexture,0,0,256,256);portalTextures.push(c);
  }
};
function detailedPortal(x,y,r,exit,alpha){
  const time=reduced?0:now,dir=exit?-1:1,pulse=warp?Math.max(0,1-(now-(warp.pulseAt??-10))*2):0;
  const radius=r*(1+pulse*.18),col=exit?'#57eaff':'#ba87ff';
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;
  const halo=ctx.createRadialGradient(0,0,r*.2,0,0,r*1.7);halo.addColorStop(0,exit?'#113b58cc':'#170e32ee');halo.addColorStop(.6,exit?'#38d6ff30':'#a45fff30');halo.addColorStop(1,'#0000');ctx.fillStyle=halo;ctx.fillRect(-r*1.7,-r*1.7,r*3.4,r*3.4);
  ctx.fillStyle='#030611';ctx.beginPath();ctx.arc(0,0,r*.48,0,7);ctx.fill();
  if(portalTextures.length===2){
    for(let i=0;i<3;i++){
      ctx.save();ctx.rotate(dir*time*[.42,-.65,.95][i]+i*2.1);
      const size=radius*[2.7,2.1,1.65][i];ctx.globalCompositeOperation=i?'lighter':'source-over';ctx.globalAlpha=alpha*[.8,.36,.28][i];
      ctx.drawImage(portalTextures[exit?1:0],-size/2,-size/2,size,size);ctx.restore();
    }
  }else{
    ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.stroke();
  }
  ctx.globalCompositeOperation='lighter';ctx.strokeStyle=col;ctx.lineWidth=1;
  for(let i=0;i<18;i++){
    const angle=i*2.399+dir*time*(.6+i%3*.12),d=radius*(.7+(i%5)*.14),tail=.08+(i%3)*.04;
    ctx.globalAlpha=alpha*(.3+(i%4)*.15);ctx.beginPath();ctx.arc(0,0,d,angle,angle+tail);ctx.stroke();
  }
  if(pulse){ctx.globalAlpha=alpha*pulse*.7;ctx.strokeStyle='#effbff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*(1.1+(1-pulse)*.7),0,7);ctx.stroke();}
  ctx.restore();
  ctx.save();ctx.globalAlpha=alpha*.85;ctx.fillStyle=col;ctx.font='700 9px Segoe UI,sans-serif';ctx.textAlign='center';ctx.fillText(exit?'EXIT':'WARP IN',x,y+r*1.6);ctx.restore();
}
