'use strict';
// Small native-resolution sprites: solid silhouettes, restrained palettes,
// directional shading and four-frame gait, without subpixel strokes.
const streetSprites=new Map();
// Digital Realms Studio pack; original license retained alongside the assets.
const trafficCars=Array.from({length:9},(_,i)=>{const img=new Image();img.src=`assets/cars/${String(i+1).padStart(2,'0')}.png`;return img;});
function spriteCanvas(w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');const rect=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h);};paint(rect);return c;}
function personSprite(index,frame,running){
  const key=`p${index%6}:${frame}:${running}`;if(streetSprites.has(key))return streetSprites.get(key);
  const coats=['#718c98','#aa7958','#778468','#9a6970','#b0a492','#5a768b'],skin=['#d1a780','#a77960','#e0bb94'];
  const c=spriteCanvas(14,24,r=>{
    const stride=[0,2,0,-2][frame]*(running?1.5:1),lean=running?2:0;
    r(5+lean,1,4,2,'#29272a');r(4+lean,3,6,2,'#383033');
    r(5+lean,4,4,4,skin[index%3]);r(8+lean,5,2,2,skin[index%3]);
    r(5+lean,4,1,3,'#87664f');r(6+lean,8,2,1,skin[index%3]);
    r(4+lean,9,5,8,coats[index%6]);r(4+lean,9,1,7,'#303c4b');r(8+lean,10,1,5,'#bbc2b466');
    r(4,16,5,3,'#303646');
    r(4-stride,18,2,4,'#303646');r(7+stride,18,2,4,'#455061');
    r(3-stride,22,3,2,'#171d29');r(7+stride,22,3,2,'#171d29');
    const swing=frame%2?2:0;
    r(3+lean,10,2,5-swing,coats[index%6]);r(2+lean+swing,14-swing,2,2,skin[index%3]);
    r(8+lean,10,2,4+swing,coats[index%6]);r(9+lean-swing,14+swing,2,2,skin[index%3]);
  });streetSprites.set(key,c);return c;
}
function vehicleSprite(index,brake){
  const key=`c${index%4}:${brake}`;if(streetSprites.has(key))return streetSprites.get(key);
  const colors=[['#576e83','#8da2b2'],['#91584d','#bd8570'],['#b09d6c','#d4c193'],['#667c70','#9aafa0']][index%4];
  const c=spriteCanvas(40,18,r=>{
    const van=index%4===3;
    r(2,14,35,3,'#070d18');r(9,van?1:3,19,8,colors[0]);r(8,5,23,6,colors[0]);
    r(11,van?2:4,8,5,'#8cabb8');r(21,van?2:4,6,5,'#6c8b9e');r(12,5,6,1,'#c8d0c6');
    r(5,9,31,6,colors[0]);r(3,11,35,3,colors[0]);r(6,9,29,1,colors[1]);
    r(4,13,33,2,'#34414d');r(19,10,1,4,'#425464');r(21,10,3,1,'#d2c9b4');
    r(7,13,7,5,'#101621');r(28,13,7,5,'#101621');r(9,14,3,3,'#89929a');r(30,14,3,3,'#89929a');
    r(35,10,3,2,'#f4e5b5');r(3,10,2,2,brake?'#ff684b':'#a33936');r(36,14,3,1,'#aeb8ba');
    if(van){r(10,2,8,6,colors[0]);r(10,2,16,1,colors[1]);}
  });streetSprites.set(key,c);return c;
}
function pixelStreet(){
  ctx.save();ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='#26303a';ctx.fillRect(0,STREET-2,W,5);ctx.fillStyle='#899095';ctx.fillRect(0,STREET-2,W,1);
  ctx.fillStyle='#111923';ctx.fillRect(0,STREET+3,W,29);
  ctx.fillStyle='#5e6263';for(let x=0;x<W;x+=35)ctx.fillRect(x,STREET+18,16,1);
  for(let i=0;i<cars.length;i++){
    const c=cars[i],y=c.dir>0?STREET+17:STREET+5;
    ctx.save();ctx.translate(Math.round(c.x),y);ctx.scale(c.dir,1);
    ctx.fillStyle='#ebdfae0b';ctx.beginPath();ctx.moveTo(18,3);ctx.lineTo(48,-1);ctx.lineTo(48,9);ctx.closePath();ctx.fill();
    if(c.wrecked)ctx.filter='brightness(.3) saturate(.2)';
    const car=trafficCars[i%trafficCars.length];
    if(i===cars.length-1){
      ctx.drawImage(policeCarSprite(),-23,-12);
      if(!c.wrecked){
        const pulse=reduced?.65:.55+.25*Math.sin(now*7);
        ctx.fillStyle=`rgba(92,170,242,${pulse})`;ctx.fillRect(-3,-13,4,2);
        ctx.fillStyle=`rgba(232,81,83,${1-pulse})`;ctx.fillRect(2,-13,4,2);
      }
    }else if(car.complete&&car.naturalWidth){
      const w=Math.round(car.naturalWidth*.72),h=Math.round(car.naturalHeight*.72);
      ctx.drawImage(car,-Math.round(w/2),8-h,w,h);
      if(c.brake){ctx.fillStyle='#ff684b';ctx.fillRect(-Math.round(w/2)+1,2,2,2);}
    }else ctx.drawImage(vehicleSprite(i,c.brake>0),-20,-8);
    ctx.restore();
    if(c.burning)drawActorFire(c.x+c.dir*9,y,22,i);
  }
  for(let i=0;i<people.length;i++){
    const p=people[i];if(p.hidden)continue;const frame=Math.floor(p.ph/Math.PI*2)%4;
    ctx.save();ctx.translate(Math.round(p.x),STREET);ctx.scale(p.dir,1);
    ctx.drawImage(personSprite(i,frame,!!p.panic||!!p.fleeing),-5,-18,10.5,18);ctx.restore();
    if(p.burning)drawActorFire(p.x,STREET-5,15,i);
  }
  drawFireEngine();
  ctx.restore();
}
function policeCarSprite(){
  if(streetSprites.has('police-car'))return streetSprites.get('police-car');
  const sprite=spriteCanvas(46,22,r=>{
    r(10,4,23,9,'#d4dfe3');r(8,7,28,6,'#d4dfe3');
    r(12,5,8,6,'#7dacc2');r(22,5,8,6,'#8abbd0');
    r(13,5,6,1,'#c9e7eb');r(23,5,5,1,'#c9e7eb');
    r(3,12,39,6,'#263c69');r(1,15,44,3,'#243556');
    r(14,12,17,6,'#d5dfe2');r(21,12,1,6,'#7f94a3');
    r(17,13,3,3,'#c1a459');r(16,14,5,1,'#d9bd70');r(24,13,3,1,'#62798d');
    r(3,18,41,2,'#91a0aa');r(7,17,8,5,'#101722');r(32,17,8,5,'#101722');
    r(9,18,4,3,'#aebdc5');r(34,18,4,3,'#aebdc5');
    r(41,13,3,2,'#ffe2a4');r(2,13,2,2,'#d34a50');
    r(18,3,12,1,'#24344d');r(19,1,5,2,'#549bd7');r(25,1,4,2,'#d95963');
  });streetSprites.set('police-car',sprite);return sprite;
}
// Original side-on sprite inspired by the supplied red ladder-truck reference.
function fireEngineSprite(){
  if(streetSprites.has('fire-engine'))return streetSprites.get('fire-engine');
  const sprite=spriteCanvas(62,29,r=>{
    r(2,7,34,17,'#bd1830');r(3,6,31,2,'#e13842');
    r(39,5,15,19,'#c91b32');r(42,3,11,3,'#d92b3e');
    r(53,9,4,15,'#c91b32');r(57,15,3,9,'#b7162b');
    r(4,9,29,2,'#611b28');r(4,13,29,2,'#e3dfcf');r(4,18,29,2,'#e3dfcf');
    for(let x=6;x<33;x+=5)r(x,14,1,4,'#e3dfcf');
    r(35,9,5,15,'#687482');for(let y=10;y<24;y+=4)r(36,y,3,2,'#a2aab1');
    r(42,7,5,8,'#83bdd1');r(49,7,4,9,'#a1d6e3');r(53,11,3,5,'#83bdd1');
    r(42,7,1,7,'#d3eced');r(50,18,3,1,'#351e29');
    r(23,22,3,1,'#ebbd49');r(28,22,3,1,'#ebbd49');r(57,20,3,2,'#ffdf9b');
    r(1,24,60,2,'#919ba1');r(7,23,10,6,'#101722');r(46,23,10,6,'#101722');
    r(10,24,4,4,'#c1c8ca');r(49,24,4,4,'#c1c8ca');
    r(46,2,5,2,'#292b32');r(47,0,3,2,'#ffca40');
  });streetSprites.set('fire-engine',sprite);return sprite;
}
function drawFireEngine(){
  const e=fireEngine;if(!e)return;
  const y=STREET+23;
  ctx.save();ctx.translate(Math.round(e.x),y);ctx.scale(e.dir,1);
  ctx.drawImage(fireEngineSprite(),-31,-22);
  ctx.fillStyle=reduced?'#ffc84a':`rgba(255,198,48,${.35+.4*(1+Math.sin(now*9))/2})`;
  ctx.fillRect(15,-24,6,3);ctx.restore();
  if(e.phase!=='spray')return;
  const sx=e.x+e.dir*11,sy=y-16,tx=e.car.x,ty=STREET+(e.car.dir>0?15:3);
  ctx.save();
  for(let i=0;i<23;i++){
    const t=((i/23)+(reduced?0:now*1.8))%1;
    const x=sx+(tx-sx)*t,wy=sy+(ty-sy)*t-Math.sin(t*Math.PI)*22;
    ctx.fillStyle=i%3?'#b4e7edb0':'#e6faffdb';ctx.fillRect(Math.round(x),Math.round(wy),3,2);
    if(i%3===0){ctx.fillStyle='#9cdce96a';ctx.fillRect(Math.round(tx+Math.sin(i*8+now*9)*9),ty-3+(i%4),2,2);}
  }
  ctx.restore();
}
