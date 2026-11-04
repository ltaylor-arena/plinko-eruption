'use strict';
// Seeded detail keeps the scenery stable across resize and board changes.
function visualRandom(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/4294967296;};}
const volcanoBackdrop=new Image();
volcanoBackdrop.src='volcano-pixel.png';
volcanoBackdrop.onload=()=>{
  // A cached image can finish between script tags, before game globals exist.
  if(document.readyState==='loading')addEventListener('DOMContentLoaded',()=>render(),{once:true});
  else render();
};
function mountain(g){
  if(!volcanoBackdrop.complete||!volcanoBackdrop.naturalWidth)return;
  g.save();
  // Preserve sharp voxel detail and align the crater at 18% with the launch point.
  g.imageSmoothingEnabled=false;
  g.drawImage(volcanoBackdrop,0,-58,W,900);
  paintNightStars(g);
  const shade=g.createRadialGradient(CX,430,65,CX,430,410);
  shade.addColorStop(0,'#060d183d');shade.addColorStop(1,'#060d1800');
  g.fillStyle=shade;g.fillRect(0,150,W,650);
  g.globalCompositeOperation='destination-out';
  const fade=g.createLinearGradient(0,620,0,842);fade.addColorStop(0,'#0000');fade.addColorStop(1,'#000');
  g.fillStyle=fade;g.fillRect(0,620,W,224);
  g.restore();
}
function initBlocks(b){
  const random=visualRandom(900+b.i*77),cols=Math.max(4,Math.round(b.w/8));
  b.unit=b.w/cols;b.blocks=[];b.powerCut=false;
  const count=Math.ceil(b.h0/b.unit);
  for(let row=0;row<count;row++)for(let col=0;col<cols;col++){
    // Stepped cornices and a distinct block-built clock-tower crown.
    if(row===count-1&&(col===0||col===cols-1))continue;
    b.blocks.push({col,row,x:b.x-b.w/2+col*b.unit,y:STREET-(row+1)*b.unit,alive:true,tone:random(),window:row>0&&row<count-2&&col>0&&col<cols-1&&row%2===1});
  }
  b.totalBlocks=b.blocks.length;
  damageBlocks(b,false);
}
function damageBlocks(b,animate=true){
  const desired=b.dead?0:Math.ceil(b.totalBlocks*b.hp/b.maxHp);
  const live=b.blocks.filter(v=>v.alive);
  // A crater bites into the top and one flank, leaving a jagged, permanent silhouette.
  const hitCol=(b.maxHp-b.hp)*3%Math.max(1,Math.round(b.w/b.unit));
  live.sort((a,c)=>(c.row-Math.abs(c.col-hitCol)*.8+c.tone*2)-(a.row-Math.abs(a.col-hitCol)*.8+a.tone*2));
  for(const v of live.slice(0,Math.max(0,live.length-desired))){
    v.alive=false;
    if(animate&&parts.length<1600)parts.push({x:v.x+b.unit/2,y:v.y+b.unit/2,vx:(v.col-hitCol)*20+rnd(-65,65),vy:rnd(-180,-45),life:0,max:rnd(.65,1.4),size:b.unit,kind:'debris',color:blockColor(b,v),rot:0,g:420});
  }
  b.cur=target(b);
  if(b.cur<=b.h0*.5||b.hp<=0)b.powerCut=true;
}
function blockColor(b,v){
  const palettes=[['#38495b','#485d70','#60778a'],['#635052','#7c6560','#998176'],['#354f56','#486870','#66868b']];
  return (b.tower?['#625f5c','#696661','#706d67']:(civicStyles[b.kind]?.colors||palettes[b.i%3]))[Math.min(2,Math.floor(v.tone*3))];
}
function pixelBuilding(b){
  ctx.save();ctx.imageSmoothingEnabled=false;
  const u=b.unit,live=new Set(b.blocks.filter(v=>v.alive).map(v=>`${v.col},${v.row}`));
  for(const v of b.blocks){
    if(!v.alive)continue;
    const x=Math.round(v.x),y=Math.round(v.y),s=Math.ceil(u);
    ctx.fillStyle=blockColor(b,v);ctx.fillRect(x,y,s,s);
    ctx.fillStyle='#0b172a99';ctx.fillRect(x+s-2,y,2,s);ctx.fillStyle='#a4b7c230';ctx.fillRect(x,y,1,s);ctx.fillStyle='#0b172a33';ctx.fillRect(x,y+s-1,s,1);
    ctx.fillStyle=live.has(`${v.col},${v.row+1}`)?'#8798aa18':'#97a3a7';ctx.fillRect(x,y,s,1);
    if(v.window){ctx.fillStyle='#172737';ctx.fillRect(x+1,y+1,s-2,s-2);const lit=windowIsLit(b,v);ctx.fillStyle=lit?(v.tone>.22?'#efb96a':'#a8becd'):'#172739';ctx.fillRect(x+2,y+1,Math.max(2,s-4),Math.max(3,s-3));if(lit){ctx.fillStyle='#ffdca73d';ctx.fillRect(x+1,y,s-2,s-1);ctx.fillStyle='#4b3d3055';ctx.fillRect(x+2,y+s-3,Math.max(2,s-4),1);}}
    if(b.flash){ctx.fillStyle=`rgba(255,146,58,${b.flash*.4})`;ctx.fillRect(x,y,s,s);}
  }
  // Clock detail belongs to its masonry: it disappears when those blocks break away.
  const cy=STREET-b.h0+b.w*.55;
  ctx.save();ctx.beginPath();for(const v of b.blocks)if(v.alive)ctx.rect(v.x,v.y,u,u);ctx.clip();
  if(b.tower){const r=b.w*.29;ctx.fillStyle='#302b35';ctx.fillRect(b.x-r-3,cy-r-3,r*2+6,r*2+6);ctx.fillStyle='#f4d9a2';ctx.fillRect(b.x-r,cy-r,r*2,r*2);ctx.fillStyle='#514443';for(let j=0;j<4;j++){const a=j*Math.PI/2;ctx.fillRect(b.x+Math.sin(a)*(r-3)-1,cy+Math.cos(a)*(r-3)-1,3,3);}ctx.fillRect(b.x-1,cy-r*.65,2,r*.65);ctx.fillRect(b.x,cy-1,r*.6,2);}
  if(!b.tower)civicFacade(b);
  if(b.powerCut){ctx.fillStyle='#060d18a6';ctx.fillRect(b.x-b.w/2,STREET-b.h0-b.unit,b.w,b.h0+b.unit);}
  ctx.restore();
  if(b.hp<b.maxHp){for(let i=0;i<Math.min(12,(b.maxHp-b.hp)*3);i++){ctx.fillStyle=i%2?'#7b665c':'#3a414b';ctx.fillRect(b.x-b.w/2+(i*13%b.w),STREET-3-(i%3)*2,5,3);}}
  ctx.restore();
}
// Original smooth lava rendering, restored without the crust sprite overlay.
function drawLavaBall(b){
  if(b.demolition){drawDemolitionBall(b);return;}
  const r=ballR*b.scale;if(r<.5)return;
  ctx.save();
  ctx.globalCompositeOperation='lighter';const gl=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,r*3);gl.addColorStop(0,'rgba(255,140,40,.6)');gl.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(b.x,b.y,r*3,0,7);ctx.fill();ctx.globalCompositeOperation='source-over';
  const g=ctx.createRadialGradient(b.x-r*.3,b.y-r*.3,0,b.x,b.y,r);g.addColorStop(0,'#fff3b0');g.addColorStop(.45,'#ff8a1f');g.addColorStop(1,'#5a1405');ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,r,0,7);ctx.fill();
  ctx.restore();
}
function drawAtmosphere(){
  ctx.save();
  const time=reduced?0:now;
  for(let i=0;i<10;i++){
    const t=(time*.09+i/10)%1,x=Math.round((CX+Math.sin(i*13)*16+t*65)/4)*4,y=Math.round((CRATER-20-t*130)/4)*4,s=8+Math.floor(t*4)*4;
    ctx.fillStyle=`rgba(101,87,104,${(1-t)*.09})`;
    ctx.fillRect(x-s,y,s*2,s);ctx.fillRect(x-s*.5,y-s,s*1.5,s);ctx.fillRect(x,y+s,s,s*.5);
  }
  ctx.restore();
}

function drawRockPeg(p){
  const r=pegR;
  if(!p.sprite){
    const c=document.createElement('canvas');c.width=c.height=80;
    const g=c.getContext('2d'),random=visualRandom(Math.round(p.x*31+p.y*17));
    g.translate(40,36);g.scale(24/r,24/r);
    const shape=new Path2D();p.shape.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
    g.shadowColor='#000b';g.shadowBlur=3;g.shadowOffsetY=2;g.fillStyle='#29303a';g.fill(shape);g.shadowBlur=0;g.shadowOffsetY=0;
    g.save();g.clip(shape);
    const light=g.createRadialGradient(-r*.4,-r*.7,0,r*.2,r*.2,r*1.7);
    light.addColorStop(0,'#8d8b83');light.addColorStop(.28,'#62666a');light.addColorStop(.6,'#3a414a');light.addColorStop(1,'#161e2a');
    g.fillStyle=light;g.fillRect(-r*2,-r*2,r*4,r*4);
    for(let i=0;i<100;i++){g.fillStyle=i%3?'#050d192e':'#d1c4a52e';g.fillRect((random()*2-1)*r,(random()*2-1)*r,r*(.04+random()*.15),r*.06);}
    g.lineWidth=r*.07;g.strokeStyle='#141d2677';
    g.beginPath();g.moveTo(-r*.8,-r*.2);g.lineTo(-r*.15,-r*.45);g.lineTo(r*.2,r*.1);g.lineTo(r*.65,r*.4);g.stroke();
    g.restore();p.sprite=c;
  }
  ctx.save();
  ctx.drawImage(p.sprite,p.x-r*1.667,p.y-r*1.5,r*3.334,r*3.334);
  if(p.glow){
    ctx.globalCompositeOperation='lighter';
    const heat=ctx.createRadialGradient(p.x,p.y-r*.4,0,p.x,p.y,r*2.2);
    heat.addColorStop(0,`rgba(255,176,78,${p.glow*.8})`);heat.addColorStop(.4,`rgba(255,71,12,${p.glow*.35})`);heat.addColorStop(1,'#ff330000');
    ctx.fillStyle=heat;ctx.fillRect(p.x-r*2.2,p.y-r*2.2,r*4.4,r*4.4);
  }
  ctx.restore();
}
function drawCraterGlow(){
  const pulse=crater*(reduced?.5:1);
  ctx.save();ctx.globalCompositeOperation='lighter';
  // Light spills onto the rim and smoke, then decays with the launch pulse.
  const radius=85+pulse*105,g=ctx.createRadialGradient(CX,CRATER+8,2,CX,CRATER+8,radius);
  g.addColorStop(0,`rgba(255,184,65,${.16+pulse*.48})`);
  g.addColorStop(.3,`rgba(255,89,17,${.04+pulse*.27})`);g.addColorStop(1,'#ff330000');
  ctx.fillStyle=g;ctx.fillRect(CX-radius,CRATER+8-radius,radius*2,radius*2);
  ctx.translate(CX,CRATER+8);ctx.scale(1,.25);
  const vent=ctx.createRadialGradient(0,0,0,0,0,62);
  vent.addColorStop(0,`rgba(255,241,171,${pulse*.85})`);vent.addColorStop(.55,`rgba(255,145,35,${pulse*.65})`);vent.addColorStop(1,'#ff330000');
  ctx.fillStyle=vent;ctx.fillRect(-62,-62,124,124);ctx.restore();
}

function drawDemolitionBall(b){
  const r=ballR*b.scale;if(r<.5)return;
  ctx.save();ctx.translate(b.x,b.y);
  const glow=ctx.createRadialGradient(0,0,r*.5,0,0,r*3);glow.addColorStop(0,'#ffd86b99');glow.addColorStop(1,'#ffb33000');
  ctx.fillStyle=glow;ctx.fillRect(-r*3,-r*3,r*6,r*6);
  const gold=ctx.createRadialGradient(-r*.35,-r*.4,0,0,0,r);gold.addColorStop(0,'#fff8d3');gold.addColorStop(.5,'#ffd55b');gold.addColorStop(1,'#b56b12');
  ctx.fillStyle=gold;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();
  ctx.strokeStyle='#ffe69d';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r*1.35,0,7);ctx.stroke();
  ctx.fillStyle='#563509';ctx.font=`900 ${Math.max(8,r*.95)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('2×',0,.5);
  ctx.restore();
}

// Sparse fixed stars in the sky only, outside the crater plume and mountain silhouette.
function paintNightStars(g){
  const random=visualRandom(110426);
  g.save();
  for(let i=0;i<125;i++){
    const x=random()*W,y=random()*245,d=Math.abs(x-CX);
    const skyEdge=60+Math.max(0,d-100)*.57;
    if(y>skyEdge||d<100||x>CX&&y<78&&x<780)continue;
    const bright=random(),size=bright>.94?1.8:bright>.6?1.2:.8;
    g.fillStyle=`rgba(190,211,237,${.13+bright*.35})`;g.fillRect(Math.round(x),Math.round(y),size,size);
    if(bright>.97){g.fillStyle='#b7d4ee18';g.fillRect(x-2,y+.5,5,1);g.fillRect(x+.5,y-2,1,5);}
  }
  g.restore();
}
