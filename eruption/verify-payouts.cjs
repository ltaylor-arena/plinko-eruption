'use strict';
const assert=require('node:assert/strict');
const m=require('./payouts.js');
let min=1,max=0;
for(const [risk,tables] of Object.entries(m.paytables))for(const [key,table] of Object.entries(tables)){
  const rows=+key,counts=Array(rows+1).fill(0);
  // Enumerate every equally likely bounce sequence independently of probability helper.
  for(let bits=0;bits<2**rows;bits++){let n=bits,k=0;while(n){k+=n&1;n>>>=1;}counts[k]++;}
  for(const stake of [1,10,999,1000]){
    let total=0;
    for(let slot=0;slot<=rows;slot++){
      assert.equal(table[slot],table[rows-slot]);
      const normal=m.settle(slot,stake,rows,risk);
      assert.ok(normal.payout>=0);
      total+=counts[slot]*normal.payout*(1+(m.demolitionMultiplier-1)/m.demolitionOdds);
    }
    const rtp=total/(2**rows*stake)+m.potRate;
    assert.ok(rtp>=.9575&&rtp<=.9625,`${risk}/${rows}: ${rtp}`);
    min=Math.min(min,rtp);max=Math.max(max,rtp);
  }
}
console.log(`All risks, rows and stake sizes: ${(min*100).toFixed(3)}–${(max*100).toFixed(3)}% total theoretical RTP, including gold balls and completed-city pots.`);
