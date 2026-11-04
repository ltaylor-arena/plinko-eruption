'use strict';
function paintDistantCity(g){
  const random=visualRandom(4071);
  // Three front-facing skyline planes: cooler, softer and less detailed with distance.
  for(let plane=0;plane<3;plane++){
    const baseline=STREET-28+plane*12;
    g.save();g.globalAlpha=[.43,.63,.9][plane];
    for(let x=-20;x<W;){
      const w=24+Math.floor(random()*48),h=55+random()*(plane===0?230:plane===1?170:110),top=Math.round(baseline-h);
      g.fillStyle=['#30455f','#1c3049','#102137'][plane];g.fillRect(x,top,w,h);
      const roof=4+random()*10;g.fillRect(x+w*.18,top-roof,w*.64,roof);
      g.fillStyle=['#405974','#2c425b','#22354b'][plane];g.fillRect(x,top,1,h);g.fillRect(x,top,w,1);
      if(random()>.6){g.fillRect(x+w*.55,top-roof-12,1,12);}
      for(let yy=top+8;yy<baseline-5;yy+=8)for(let xx=x+5;xx<x+w-4;xx+=6){
        if(random()>.19)continue;
        g.fillStyle=random()>.25?['#70809555','#9b9b8c55','#c4b79366'][plane]:'#9bb5cc44';g.fillRect(xx,yy,1.5,3);
      }
      x+=w+8+random()*18;
    }
    g.restore();
  }
  const mist=g.createLinearGradient(0,STREET-200,0,STREET);mist.addColorStop(0,'#192e4400');mist.addColorStop(1,'#16283e40');g.fillStyle=mist;g.fillRect(0,STREET-200,W,200);
}
