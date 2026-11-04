'use strict';
// Outcome generation is independent of trajectory and visual simulation.
(() => {
  const bands=Object.freeze([
    Object.freeze({min:0,max:24,multiplier:3.95}),
    Object.freeze({min:25,max:49,multiplier:3.95}),
    Object.freeze({min:50,max:74,multiplier:3.95}),
    Object.freeze({min:75,max:100,multiplier:3.52})
  ]);
  function randomInt(max,source=globalThis.crypto){
    if(!Number.isSafeInteger(max)||max<1||max>0x100000000)throw new RangeError('Invalid random bound');
    const limit=Math.floor(0x100000000/max)*max;
    const values=new Uint32Array(1);do{source.getRandomValues(values);}while(values[0]>=limit);return values[0]%max;
  }
  // Plinko: 8-16 rows, one fair left/right bounce per row (a single uniform draw of rows bits). Slot = rightward bounces.
  // Paytables per risk and row count; every table returns ~99% (checked exhaustively in verify.cjs).
  const paytables=Object.freeze({
low:{8:[5.6,2.1,1.1,1,.5,1,1.1,2.1,5.6],9:[5.6,2,1.6,1,.7,.7,1,1.6,2,5.6],10:[8.9,3,1.4,1.1,1,.5,1,1.1,1.4,3,8.9],11:[8.4,3,1.9,1.3,1,.7,.7,1,1.3,1.9,3,8.4],12:[10,3,1.6,1.4,1.1,1,.5,1,1.1,1.4,1.6,3,10],13:[8.1,4,3,1.9,1.2,.9,.7,.7,.9,1.2,1.9,3,4,8.1],14:[7.1,4,1.9,1.4,1.3,1.1,1,.5,1,1.1,1.3,1.4,1.9,4,7.1],15:[15,8,3,2,1.5,1.1,1,.7,.7,1,1.1,1.5,2,3,8,15],16:[16,9,2,1.4,1.4,1.2,1.1,1,.5,1,1.1,1.2,1.4,1.4,2,9,16]},
medium:{8:[13,3,1.3,.7,.4,.7,1.3,3,13],9:[18,4,1.7,.9,.5,.5,.9,1.7,4,18],10:[22,5,2,1.4,.6,.4,.6,1.4,2,5,22],11:[24,6,3,1.8,.7,.5,.5,.7,1.8,3,6,24],12:[33,11,4,2,1.1,.6,.3,.6,1.1,2,4,11,33],13:[43,13,6,3,1.3,.7,.4,.4,.7,1.3,3,6,13,43],14:[58,15,7,4,1.9,1,.5,.2,.5,1,1.9,4,7,15,58],15:[88,18,11,5,3,1.3,.5,.3,.3,.5,1.3,3,5,11,18,88],16:[110,41,10,5,3,1.5,1,.5,.3,.5,1,1.5,3,5,10,41,110]},
high:{8:[29,4,1.5,.3,.2,.3,1.5,4,29],9:[43,7,2,.6,.2,.2,.6,2,7,43],10:[76,10,3,.9,.3,.2,.3,.9,3,10,76],11:[120,14,5.2,1.4,.4,.2,.2,.4,1.4,5.2,14,120],12:[170,24,8.1,2,.7,.2,.2,.2,.7,2,8.1,24,170],13:[260,37,11,4,1,.2,.2,.2,.2,1,4,11,37,260],14:[420,56,18,5,1.9,.3,.2,.2,.2,.3,1.9,5,18,56,420],15:[620,83,27,8,3,.5,.2,.2,.2,.2,.5,3,8,27,83,620],16:[1000,130,26,9,4,2,.2,.2,.2,.2,.2,2,4,9,26,130,1000]}});
  const plinkoMultipliers=paytables.medium[8];
  function plinko(source,rows=8){if(!paytables.medium[rows])throw new RangeError('Rows must be 8-16');const bits=randomInt(2**rows,source),path=Array.from({length:rows},(_,i)=>bits>>i&1);return {path,slot:path.reduce((a,b)=>a+b,0)};}
  function settlePlinko(slot,stake,rows=8,risk='medium'){const m=paytables[risk]?.[rows]?.[slot];if(m===undefined||!Number.isSafeInteger(stake)||stake<1)throw new RangeError('Invalid drop');return {multiplier:m,payout:Math.round(stake*m*100)/100};}
  function outcome(source){const overload=randomInt(50,source)===0;return {overload,popped:overload?100:randomInt(101,source)};}
  function validStake(value,balance){return Number.isSafeInteger(value)&&value>=1&&value<=1000&&value<=balance;}
  function settle(popped,bandIndex,stake){const b=bands[bandIndex];if(!b||!Number.isInteger(popped)||popped<0||popped>100||!Number.isSafeInteger(stake)||stake<1)throw new RangeError('Invalid round');const won=popped>=b.min&&popped<=b.max;return {won,payout:won?Math.round(stake*b.multiplier*100)/100:0};}
  const api={bands,paytables,plinkoMultipliers,plinko,settlePlinko,randomInt,outcome,validStake,settle};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else globalThis.PanicMath=api;
})();
