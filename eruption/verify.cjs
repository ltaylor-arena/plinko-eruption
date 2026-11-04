'use strict';
// Every route ends in the drawn slot, moves one row and 0/1 bounce per step, and warps only when asked and possible.
const assert=require('node:assert/strict');
const {route,feasible}=require('./paths.js');
const int=(lo,hi)=>lo+Math.floor(Math.random()*(hi-lo+1));
let warped=0;
for(const rows of [8,10,12,14,16])for(let slot=0;slot<=rows;slot++)for(let t=0;t<300;t++){
  const a=int(2,Math.floor(rows*.45)),b=int(a+2,rows-2),w={a,p:int(0,a),b,q:int(0,b)},take=t%2===0;
  const n=route(slot,rows,w,take);
  assert.deepEqual(n[0],{r:0,k:0});
  assert.equal(n.at(-1).r,rows);assert.equal(n.at(-1).k,slot);
  const jumps=n.filter(x=>x.warped).length;
  assert.equal(jumps,take&&feasible(slot,rows,w)?1:0);
  for(let i=1;i<n.length;i++){
    const A=n[i-1],B=n[i];assert.ok(B.k>=0&&B.k<=B.r);
    if(B.warped){assert.deepEqual([A.r,A.k,B.r,B.k],[w.a,w.p,w.b,w.q]);warped++;}
    else{assert.equal(B.r,A.r+1);assert.ok(B.k-A.k===0||B.k-A.k===1);}
  }
}
assert.ok(warped>1000);
console.log('eruption paths ok,',warped,'warped routes');
