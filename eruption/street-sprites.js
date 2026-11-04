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
  // Sidewalk, far lane, near lane: draw from back to front.
  for(let i=0;i<people.length;i++){
    const p=people[i];if(p.hidden)continue;const frame=Math.floor(p.ph/Math.PI*2)%4;
    ctx.save();ctx.translate(Math.round(p.x),STREET);ctx.scale(p.dir,1);
    ctx.drawImage(personSprite(i,frame,!!p.panic||!!p.fleeing),-5,-18,10.5,18);ctx.restore();
    if(p.burning)drawActorFire(p.x,STREET-5,15,i);
  }
  for(const i of cars.map((_,i)=>i).sort((a,b)=>cars[a].dir-cars[b].dir)){
    const c=cars[i],y=c.dir>0?STREET+17:STREET+5;
    ctx.save();ctx.translate(Math.round(c.x),y);ctx.scale(c.dir,1);
    ctx.fillStyle='#ebdfae0b';ctx.beginPath();ctx.moveTo(18,3);ctx.lineTo(48,-1);ctx.lineTo(48,9);ctx.closePath();ctx.fill();
    if(c.wrecked)ctx.filter='brightness(.3) saturate(.2)';
    const car=trafficCars[i%trafficCars.length];
    if(i===cars.length-1){
      ctx.drawImage(policeCarSprite(),-23,-8,47,15);
      if(!c.wrecked){
        const pulse=reduced?.65:.55+.25*Math.sin(now*7);
        ctx.fillStyle=`rgba(92,170,242,${pulse})`;ctx.fillRect(-3,-9,4,1);
        ctx.fillStyle=`rgba(232,81,83,${1-pulse})`;ctx.fillRect(2,-9,4,1);
      }
    }else if(car.complete&&car.naturalWidth){
      const w=Math.round(car.naturalWidth*.72),h=Math.round(car.naturalHeight*.72);
      ctx.drawImage(car,-Math.round(w/2),8-h,w,h);
      if(c.brake){ctx.fillStyle='#ff684b';ctx.fillRect(-Math.round(w/2)+1,2,2,2);}
    }else ctx.drawImage(vehicleSprite(i,c.brake>0),-20,-8);
    ctx.restore();
    if(c.burning)drawActorFire(c.x+c.dir*9,y,22,i);
  }
  drawFireEngine();
  ctx.restore();
}
function policeCarSprite(){
  if(streetSprites.has('police-car'))return streetSprites.get('police-car');
  const base=trafficCars[0];
  if(!base.complete||!base.naturalWidth)return vehicleSprite(0,false);
  const sprite=document.createElement('canvas');sprite.width=base.naturalWidth;sprite.height=base.naturalHeight;
  const g=sprite.getContext('2d');g.drawImage(base,0,0);
  // White doors, dark bonnet and restrained blue stripe over the original sedan.
  g.fillStyle='#d8dedc';g.fillRect(22,10,24,3);
  g.fillStyle='#9ca9ad';g.fillRect(22,13,24,1);
  g.fillStyle='#344b65';g.fillRect(22,12,24,1);
  g.fillStyle='#697980';g.fillRect(34,10,1,4);
  g.fillStyle='#cfb96d';g.fillRect(28,10,2,2);
  g.fillStyle='#e4e8e2';g.fillRect(25,10,2,1);g.fillRect(38,10,2,1);
  g.fillStyle='#252c36';g.fillRect(27,0,11,1);
  g.fillStyle='#619ec2';g.fillRect(28,0,4,1);
  g.fillStyle='#c26461';g.fillRect(34,0,3,1);
  streetSprites.set('police-car',sprite);return sprite;
}
function fireEngineSprite(){
  if(streetSprites.has('fire-engine'))return streetSprites.get('fire-engine');
  const sprite=spriteCanvas(56,22,r=>{
    // Final-resolution pixels: clean ladder silhouette, coachwork and pack-sized tyres.
    r(2,7,32,11,'#a3423e');r(3,6,30,1,'#d7866c');
    r(2,16,51,3,'#692c30');r(3,17,49,1,'#c5bbaa');
    r(35,4,11,14,'#b64b42');r(46,7,3,11,'#a03b37');r(49,12,5,6,'#993935');
    r(36,5,9,1,'#e29479');r(36,6,4,6,'#374b58');r(42,6,4,7,'#405b6a');
    r(36,6,4,1,'#9aafb5');r(42,6,3,1,'#b1c0c0');r(46,9,2,4,'#728a96');
    r(36,13,12,1,'#ce7563');r(41,13,1,4,'#7b3536');r(43,14,2,1,'#c6bbb0');
    r(4,8,12,7,'#6e797e');r(18,8,13,7,'#6e797e');
    for(const y of [9,11,13]){r(5,y,10,1,'#a5adb0');r(19,y,11,1,'#a5adb0');}
    r(8,14,4,1,'#414d56');r(23,14,4,1,'#414d56');
    r(3,3,29,1,'#adb8b9');r(3,5,29,1,'#74858f');
    for(let x=5;x<32;x+=4)r(x,4,1,1,'#cad0c9');
    r(32,9,2,6,'#35424b');r(32,10,1,1,'#d0c7a6');r(32,13,1,1,'#bb9564');
    r(1,18,54,1,'#9da9ac');r(2,19,52,1,'#303942');
    for(const x of [8,41]){r(x,17,7,4,'#17212a');r(x+1,16,5,1,'#283640');r(x+1,21,5,1,'#17212a');r(x+2,18,3,3,'#7d8a90');r(x+2,18,3,1,'#bdc5c3');r(x+3,19,1,1,'#465660');}
    r(51,14,3,2,'#e3d7ac');r(2,15,1,1,'#d18667');r(50,17,3,1,'#39434a');
    r(38,3,7,1,'#36424c');r(39,2,2,1,'#dc9c5c');r(43,2,2,1,'#dc9c5c');
  });streetSprites.set('fire-engine',sprite);return sprite;
}
function drawFireEngine(){
  const e=fireEngine;if(!e)return;
  const y=STREET+23;
  ctx.save();ctx.translate(Math.round(e.x),y);ctx.scale(e.dir,1);
  ctx.drawImage(fireEngineSprite(),-28,-15);
  ctx.fillStyle=reduced?'#ffc84a':`rgba(255,198,48,${.35+.4*(1+Math.sin(now*9))/2})`;
  ctx.fillRect(11,-13,4,1);ctx.restore();
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
