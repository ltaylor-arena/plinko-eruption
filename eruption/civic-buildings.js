'use strict';
const civicStyles={
  cobalt:{colors:['#164366','#1b5076','#225c83'],trim:'#8bdaef',glass:'#347eaa'},
  silver:{colors:['#344f65','#405f75','#4c6c81'],trim:'#c5e5ee',glass:'#739eb3'},
  teal:{colors:['#143f4c','#194c59','#205865'],trim:'#72e0d5',glass:'#328e96'},
  midnight:{colors:['#1c2e51','#253b62','#2d476e'],trim:'#90b7f2',glass:'#466da9'},
  violet:{colors:['#343858','#42476b','#50577c'],trim:'#b9c6ef',glass:'#6b76a7'},
  vault:{colors:['#34464f','#40545d','#4b6169'],trim:'#d6bd86',glass:'#648e9c'}
};
function civicKind(index,count){
  const d=Math.abs(index-count/2),half=count/2;
  if(!d)return 'tower';
  if(d===half)return 'vault';
  return ['cobalt','silver','teal','midnight','violet'][Math.min(4,Math.floor((d-1)*5/Math.max(5,half-1)))];
}
function civicFacade(b){
  const style=civicStyles[b.kind];if(!style)return;
  const x=b.x-b.w/2,w=b.w,top=STREET-b.h0,u=b.unit;
  const rect=(a,y,width,height,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(a),Math.round(y),Math.round(width),Math.round(height));};
  // Entire curtain wall stays inside the surviving block mask used by the caller.
  const glass=ctx.createLinearGradient(x,0,x+w,0);
  glass.addColorStop(0,style.colors[0]);glass.addColorStop(.35,style.glass);glass.addColorStop(.45,style.colors[1]);glass.addColorStop(1,'#101e32');
  ctx.fillStyle=glass;ctx.fillRect(x,top,w,b.h0);
  // Broad angled sky reflections read as glass even at the smallest board scale.
  ctx.fillStyle='#a3dbf528';ctx.beginPath();ctx.moveTo(x,top+12);ctx.lineTo(x+w,top+42);ctx.lineTo(x+w,top+66);ctx.lineTo(x,top+35);ctx.closePath();ctx.fill();
  ctx.fillStyle='#7ac9e21c';ctx.beginPath();ctx.moveTo(x,top+b.h0*.52);ctx.lineTo(x+w,top+b.h0*.36);ctx.lineTo(x+w,top+b.h0*.55);ctx.lineTo(x,top+b.h0*.71);ctx.closePath();ctx.fill();
  for(let xx=x+u;xx<x+w;xx+=u){rect(xx,top,1,b.h0,'#0b172b99');rect(xx+1,top,1,b.h0,b.kind==='silver'?'#bbdae377':'#96cbe52b');}
  for(let yy=STREET-12;yy>top;yy-=u*2){rect(x,yy,w,1,'#071a2b99');rect(x,yy+1,w,1,'#b2dbf12b');}
  for(const v of b.blocks){
    if(!v.alive||!v.window||v.y<top+13||v.y>STREET-25)continue;
    if(windowIsLit(b,v)){
      const light=v.tone>.55?'#f2c989':v.tone>.18?'#b8e9f3':'#cbbdf1';
      rect(v.x+2,v.y+1,Math.max(2,u-4),Math.max(3,u-2),light);
      rect(v.x+2,v.y+u-3,Math.max(2,u-4),1,'#233d5066');
    }
  }
  // Different structural systems, not civic signs or decorative badges.
  if(b.kind==='silver')for(let xx=x+3;xx<x+w;xx+=w/3)rect(xx,top+6,2,b.h0-25,'#b5d0da88');
  if(b.kind==='teal')for(let yy=top+18;yy<STREET-25;yy+=30){rect(x,yy,w,2,'#65c1c988');rect(x,yy+2,w,2,'#102e43');}
  if(b.kind==='midnight'){
    ctx.strokeStyle='#93bce178';ctx.lineWidth=1.5;
    for(let yy=top+15;yy<STREET-30;yy+=40){ctx.beginPath();ctx.moveTo(x+2,yy);ctx.lineTo(x+w-2,yy+38);ctx.moveTo(x+w-2,yy);ctx.lineTo(x+2,yy+38);ctx.stroke();}
  }
  if(b.kind==='violet'){rect(x+w*.3,top+8,2,b.h0-30,'#adbcf199');rect(x+w*.68,top+8,2,b.h0-30,'#adbcf199');}
  rect(x,top+4,w,2,style.trim);rect(x+2,top+7,w-4,3,'#142336');
  rect(x+5,top+1,w-10,3,'#6e8b9f');rect(x+7,top+1,1,3,'#bbd5e2');
  rect(x,top+6,1,b.h0-6,'#b3dce76b');rect(x+w-3,top+6,3,b.h0-6,'#09132188');
  // Subdued recessed glass keeps the street-level detail below the tower lights.
  rect(x+4,STREET-21,w-8,18,'#142533');
  for(let xx=x+7;xx<x+w-6;xx+=6){rect(xx,STREET-18,4,13,b.powerCut?'#182533':'#3e5662');rect(xx,STREET-18,4,1,b.powerCut?'#182533':'#526c77');}
  rect(x+2,STREET-24,w-4,1,'#526a79');rect(x+2,STREET-22,w-4,2,'#263747');rect(x,STREET-3,w,3,'#394c59');
  if(b.kind==='vault'){
    // Retain the bank identity through its vault door and restrained brass frame.
    const size=Math.min(w*.49,29),cy=STREET-27;
    rect(x+4,top+12,2,b.h0-15,style.trim);rect(x+w-6,top+12,2,b.h0-15,style.trim);
    rect(b.x-size*.7,cy-size*.7,size*1.4,size*1.4,'#192632');
    ctx.fillStyle='#b2c3c8';ctx.beginPath();for(let i=0;i<8;i++){const a=(i+.5)*Math.PI/4,xx=b.x+Math.cos(a)*size*.57,yy=cy+Math.sin(a)*size*.57;i?ctx.lineTo(Math.round(xx),Math.round(yy)):ctx.moveTo(Math.round(xx),Math.round(yy));}ctx.closePath();ctx.fill();
    rect(b.x-2,cy-8,4,16,'#4b6573');rect(b.x-8,cy-2,16,4,'#4b6573');rect(b.x-2,cy-2,4,4,'#ead7a4');
    rect(b.x-10,STREET-10,8,3,'#eac374');rect(b.x+1,STREET-10,8,3,'#cda65d');
  }
}
function constructionWorker(frame,carry){
  const key=`builder:${frame}:${carry}`;if(streetSprites.has(key))return streetSprites.get(key);
  const sprite=spriteCanvas(16,23,r=>{
    const step=[-2,0,2,0][frame];
    r(5,1,6,2,'#ffd35f');r(4,3,9,2,'#e8ac35');r(7,1,1,3,'#fff0a4');
    r(6,5,5,4,'#cfa17a');r(10,5,2,2,'#deb58d');
    r(4,9,7,8,'#d77835');r(5,10,1,6,'#f5e9a7');r(9,10,1,6,'#f5e9a7');r(4,14,7,1,'#f5e9a7');
    r(4,17,3,3,'#34475b');r(8,17,3,3,'#34475b');r(4-step,19,3,3,'#34475b');r(8+step,19,3,3,'#34475b');r(3-step,22,4,1,'#1b222c');r(8+step,22,4,1,'#1b222c');
    r(11,10,2,5,'#d77835');r(12,14,2,2,'#cfa17a');
    if(carry){r(10,11,6,4,'#96948a');r(10,11,6,1,'#d6c5a5');}else{r(2,11,2,5,'#d77835');r(1,15,3,2,'#cfa17a');}
  });streetSprites.set(key,sprite);return sprite;
}
function drawConstructionCrew(){
  if(cycle.phase!=='rebuild')return;
  const t=cycle.t,fade=Math.min(1,t*6,(2.8-t)*5);
  ctx.save();ctx.globalAlpha=Math.max(0,fade);ctx.imageSmoothingEnabled=false;
  for(const b of buildings){
    for(let j=0;j<2;j++){
      const phase=reduced?.3:(t*(j?1.8:1.25)+b.i*.17+j*.5)%2,dir=phase<1?1:-1,u=phase<1?phase:2-phase;
      const x=b.x-b.w*.55+u*b.w*1.1,frame=reduced?0:Math.floor(t*16+b.i+j)%4;
      // A second crew works from the rising scaffold platform.
      const scaffoldLevel=Math.min(Math.floor((b.h0-38)/24),Math.floor(Math.max(0,t-.2)*b.h0/48));
      const platform=j&&t>.25?18+Math.max(0,scaffoldLevel)*24:0;
      ctx.save();ctx.translate(Math.round(x),STREET-platform);ctx.scale(dir,1);ctx.drawImage(constructionWorker(frame,(b.i+j)%2===0),-6,-19,13,19);ctx.restore();
    }
  }
  ctx.restore();
}
function drawConstructionCranes(){
  if(cycle.phase!=='rebuild')return;
  const t=cycle.t;ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,t*5,(2.8-t)*4));
  for(const [index,x] of [155,410,745].entries()){
    const height=index===1?310:235,top=STREET-height,boom=130;
    ctx.lineWidth=2;ctx.strokeStyle='#d3a44e';
    for(const xx of [x,x+9]){ctx.beginPath();ctx.moveTo(xx,STREET);ctx.lineTo(xx,top-15);ctx.stroke();}
    for(let y=STREET;y>top;y-=18){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+9,y-18);ctx.lineTo(x,y-18);ctx.stroke();}
    ctx.fillStyle='#c49a49';ctx.fillRect(x-30,top,boom,3);ctx.fillRect(x-30,top-10,boom,2);
    for(let xx=x-30;xx<x+boom-30;xx+=15){ctx.beginPath();ctx.moveTo(xx,top);ctx.lineTo(xx+8,top-10);ctx.lineTo(xx+15,top);ctx.stroke();}
    ctx.fillStyle='#46515e';ctx.fillRect(x-27,top+3,18,10);ctx.fillStyle='#edbb5f';ctx.fillRect(x+9,top+3,14,12);ctx.fillStyle='#486a7a';ctx.fillRect(x+12,top+5,9,6);
    const phase=reduced?.5:(t*.75+index*.32)%1,hookX=x+25+(reduced?20:Math.sin(t*2+index)*22),hookY=top+30+phase*85;
    ctx.strokeStyle='#a8b4bb';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hookX,top);ctx.lineTo(hookX,hookY);ctx.stroke();
    ctx.strokeStyle='#d3a44e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(hookX,hookY);ctx.lineTo(hookX,hookY+5);ctx.lineTo(hookX+4,hookY+5);ctx.stroke();
    ctx.strokeStyle='#9b9b8d';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hookX,hookY+5);ctx.lineTo(hookX-10,hookY+14);ctx.lineTo(hookX+10,hookY+14);ctx.closePath();ctx.stroke();
    ctx.fillStyle='#b3a48b';for(let k=0;k<3;k++)ctx.fillRect(hookX-10+k*7,hookY+13,6,6);ctx.fillStyle='#6d5540';ctx.fillRect(hookX-12,hookY+19,25,3);
  }
  ctx.restore();
}
