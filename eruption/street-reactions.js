'use strict';
let fireEngine=null,fireEngineCooldown=0;
function dispatchFireEngine(car){
  if(fireEngine||now<fireEngineCooldown||!car.burning||car.wrecked||cycle.phase!=='play')return false;
  const dir=car.x<W/2?1:-1;
  fireEngine={x:dir>0?-65:W+65,dir,car,phase:'arrive',spray:0};
  car.burstAt=Math.max(car.burstAt,car.burnAge+8);
  fireEngineCooldown=now+18;
  return true;
}
function updateFireEngine(dt){
  const e=fireEngine;if(!e)return;
  const c=e.car;
  if(e.phase!=='leave'&&(!c.burning||c.wrecked))e.phase='leave';
  if(e.phase==='arrive'){
    const stop=c.x-e.dir*58,step=240*dt;
    if(Math.abs(stop-e.x)<=step){e.x=stop;e.phase='spray';}else e.x+=Math.sign(stop-e.x)*step;
  }else if(e.phase==='spray'){
    e.spray+=dt;
    if(e.spray>=1.6){c.burning=false;c.burnAge=0;c.brake=1;e.phase='leave';}
  }else{e.x+=e.dir*220*dt;if(e.x<-80||e.x>W+80)fireEngine=null;}
}
function igniteStreet(x,width){
  const radius=Math.max(30,Math.min(65,width*.8));
  for(const p of people){
    if(p.hidden||Math.abs(p.x-x)>radius)continue;
    p.burning=true;p.fleeing=true;p.panic=4;p.dir=Math.sign(p.x-x)||(p.x<CX?-1:1);
  }
  for(const c of cars){
    if(c.wrecked||Math.abs(c.x-x)>radius+12)continue;
    if(!c.burning){c.burning=true;c.burnAge=0;c.burstAt=1.1+(c.x%7)*.12;}
    if(Math.random()<.4)dispatchFireEngine(c);
  }
}
function updateStreetActors(dt){
  for(const p of people){
    if(p.hidden)continue;
    p.panic=Math.max(0,p.panic-dt);
    p.x+=p.dir*(p.fleeing?145:p.panic?90:p.v)*dt;
    p.ph+=dt*(p.fleeing||p.panic?22:8);
    if(p.fleeing){if(p.x<-20||p.x>W+20){p.hidden=true;p.burning=false;}}
    else{if(p.x<-8)p.x=W+8;if(p.x>W+8)p.x=-8;}
    if(p.burning)actorSmoke(p,p.x,STREET-18);
  }
  for(const c of cars){
    c.brake=Math.max(0,c.brake-dt);
    if(c.wrecked){actorSmoke(c,c.x,STREET-4);continue;}
    c.x+=c.dir*c.v*(fireEngine?.car===c&&fireEngine.phase!=='leave'?0:c.burning?.12:c.brake?.15:1)*dt;
    if(c.burning){
      c.burnAge+=dt;actorSmoke(c,c.x,STREET-8);
      if(c.burnAge>=c.burstAt){
        c.wrecked=true;c.burning=false;
        if(impactExplosions.length>=48)impactExplosions.shift();
        impactExplosions.push({x:c.x,y:STREET+(c.dir>0?16:5),age:0,size:72,duration:1.05,street:true});
        burst(c.x,STREET,6,'debris',{a0:-Math.PI,a1:0,s0:20,s1:65,z0:1,z1:3,l0:.3,l1:.6});
        noise(.18,.07,450);
      }
    }else{if(c.x<-30)c.x=W+30;if(c.x>W+30)c.x=-30;}
  }
  updateFireEngine(dt);
}
function actorSmoke(actor,x,y){
  if(now<(actor.smokeAt||0))return;
  actor.smokeAt=now+(reduced?.5:.2);
  burst(x,y,1,'smoke',{a0:-1.9,a1:-1.3,s0:12,s1:24,g:-5,l0:.4,l1:.9,z0:2,z1:4});
}
function resetStreetActors(){
  fireEngine=null;fireEngineCooldown=0;
  for(const p of people){p.x=rnd(10,W-10);p.hidden=false;p.burning=false;p.fleeing=false;p.panic=0;p.smokeAt=0;}
  for(const c of cars){c.x=rnd(10,W-10);c.burning=false;c.wrecked=false;c.burnAge=0;c.brake=0;c.smokeAt=0;}
  for(let i=impactExplosions.length-1;i>=0;i--)if(impactExplosions[i].street)impactExplosions.splice(i,1);
}
function drawActorFire(x,y,size,seed){
  ctx.save();ctx.translate(x,y);
  const time=reduced?0:now;
  for(let i=0;i<3;i++){
    const offset=(i-1)*size*.22,h=size*(.7+.2*Math.sin(time*13+i*2+seed)),sway=Math.sin(time*8+i+seed)*size*.15;
    const g=ctx.createLinearGradient(0,-h,0,3);g.addColorStop(0,'#ff532700');g.addColorStop(.28,'#ef5926bb');g.addColorStop(.65,'#ffad34e6');g.addColorStop(1,'#fff3a8');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(offset-size*.2,2);ctx.quadraticCurveTo(offset-size*.35,-h*.45,offset+sway,-h);ctx.quadraticCurveTo(offset+size*.38,-h*.35,offset+size*.2,2);ctx.closePath();ctx.fill();
  }
  ctx.restore();
}
