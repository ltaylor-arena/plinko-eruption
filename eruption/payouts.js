'use strict';
// Eruption owns its bonus budget; the shared game's paytables remain unchanged.
(() => {
  const source=typeof module!=='undefined'&&module.exports?require('../model.js'):PanicMath;
  const target=.96,potRate=.03,demolitionOdds=20,demolitionMultiplier=2;
  const bonusFactor=1+(demolitionMultiplier-1)/demolitionOdds;
  const probabilities=rows=>{const p=[2**-rows];for(let i=1;i<=rows;i++)p.push(p[i-1]*(rows-i+1)/i);return p;};
  const expected=(table,p)=>table.reduce((sum,m,i)=>sum+m*p[i],0);
  const paytables={};
  for(const risk of Object.keys(source.paytables)){
    paytables[risk]={};
    for(const [key,original] of Object.entries(source.paytables[risk])){
      const rows=+key,p=probabilities(rows),baseTarget=(target-potRate)/bonusFactor;
      const scale=baseTarget/expected(original,p);
      const table=original.map(m=>Math.round(m*scale*100)/100);
      // Correct rounding symmetrically at the centre; all payouts use exact cents.
      const centres=rows%2?[Math.floor(rows/2),Math.ceil(rows/2)]:[rows/2];
      const mass=centres.reduce((sum,i)=>sum+p[i],0);
      const cents=Math.round((baseTarget-expected(table,p))/mass*100);
      for(const i of centres)table[i]=Math.round((table[i]+cents/100)*100)/100;
      paytables[risk][rows]=Object.freeze(table);
    }
    Object.freeze(paytables[risk]);
  }
  function settle(slot,stake,rows,risk){
    const multiplier=paytables[risk]?.[rows]?.[slot];
    if(multiplier===undefined||!Number.isSafeInteger(stake)||stake<1)throw new RangeError('Invalid drop');
    return {multiplier,payout:Math.round(stake*multiplier*100)/100};
  }
  const api=Object.freeze({target,potRate,demolitionOdds,demolitionMultiplier,paytables:Object.freeze(paytables),settle,probabilities,expected});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else globalThis.EruptionPayouts=api;
})();
