'use strict';
// Route a lava ball down the board to a slot that ../model.js has already drawn.
// The slot alone decides the payout; the route, and any warp detour, is cosmetic.
(() => {
  const bits=(n,ones,rand)=>{const a=Array.from({length:n},(_,i)=>+(i<ones));for(let i=n-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const walk=(from,steps)=>{let k=from.k;return steps.map((s,i)=>({r:from.r+i+1,k:k+=s}));};
  // warp = {a,p,b,q}: a ball at row a, position p (rightward bounces so far) enters; it exits at row b, position q.
  const feasible=(slot,rows,w)=>w.p<=w.a&&w.q<=w.b&&w.a<w.b&&slot-w.q>=0&&slot-w.q<=rows-w.b;
  function route(slot,rows,warp=null,take=false,rand=Math.random){
    const start={r:0,k:0};
    if(warp&&take&&feasible(slot,rows,warp)){
      const exit={r:warp.b,k:warp.q,warped:true};
      return [start,...walk(start,bits(warp.a,warp.p,rand)),exit,...walk(exit,bits(rows-warp.b,slot-warp.q,rand))];
    }
    // ponytail: rejection-sample a route that misses both portals; after 50 tries the ball just rolls over one.
    for(let i=0;;i++){
      const nodes=[start,...walk(start,bits(rows,slot,rand))];
      if(!warp||i>=50||!nodes.some(n=>(n.r===warp.a&&n.k===warp.p)||(n.r===warp.b&&n.k===warp.q)))return nodes;
    }
  }
  const api={route,feasible};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else globalThis.EruptionPaths=api;
})();
