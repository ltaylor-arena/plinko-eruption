from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1100},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8000/eruption/',wait_until='networkidle')
    page.locator('#sound').uncheck()
    page.wait_for_function('portalTextures.length===2 && explosionFrames.length===6 && trafficCars.every(i=>i.complete&&i.naturalWidth)')
    page.evaluate("""() => {
      fireEngineCooldown=Infinity;
      Object.assign(people[0],{x:450,hidden:false,burning:false,fleeing:false});
      Object.assign(people[1],{x:460,hidden:false,burning:false,fleeing:false});
      Object.assign(people[2],{x:820,hidden:false,burning:false,fleeing:false});
      Object.assign(cars[0],{x:455,wrecked:false,burning:false});
      igniteStreet(450,60);
      if(!people[0].burning||!people[0].fleeing||!cars[0].burning||people[2].burning)throw Error('Street ignition radius failed');
    }""")
    page.wait_for_timeout(200)
    page.screenshot(path=str(ROOT/'artifacts/eruption-street-fire.png'),full_page=True)
    page.wait_for_function('cars[0].wrecked')
    page.evaluate("""() => {
      if(cars[0].burning)throw Error('Wreck still in ignition state');
      const p=people[0];p.x=W+21;p.dir=1;updateStreetActors(.01);
      if(!p.hidden||p.burning||p.x<W)throw Error('Fleeing person wrapped back on screen');
      resetStreetActors();impactExplosions.length=0;
      if(people.some(p=>p.hidden||p.burning||p.fleeing)||cars.some(c=>c.burning||c.wrecked))throw Error('Street reset failed');
    }""")
    page.evaluate("""() => {
      const before=balance,c=cars[0];
      Object.assign(c,{x:300,burning:true,burnAge:0,burstAt:1.2,wrecked:false});
      if(!dispatchFireEngine(c)||dispatchFireEngine(c))throw Error('Dispatch guard failed');
      for(let i=0;i<150&&fireEngine.phase!=='spray';i++)updateStreetActors(.02);
      if(fireEngine.phase!=='spray')throw Error('Engine did not reach fire');
      window.rescueBalance=before;
    }""")
    page.wait_for_timeout(350)
    page.screenshot(path=str(ROOT/'artifacts/eruption-fire-engine.png'),full_page=True)
    page.evaluate("""() => {
      for(let i=0;i<400;i++)updateStreetActors(.02);
      if(cars[0].burning||cars[0].wrecked||fireEngine)throw Error('Rescue or departure failed');
      if(balance!==rescueBalance)throw Error('Rescue changed payout');
      resetStreetActors();
      Object.assign(cars[0],{x:650,burning:true,burnAge:0,burstAt:1.2});
      dispatchFireEngine(cars[0]);if(fireEngine.dir!==-1)throw Error('Wrong arrival side');
      resetStreetActors();if(fireEngine)throw Error('Rebuild retained engine');
    }""")
    page.evaluate("""() => {
      const b=towerOf(),windows=b.blocks.filter(v=>v.window);
      if(!windows.some(v=>windowIsLit(b,v,0))||!windows.some(v=>!windowIsLit(b,v,0)))throw Error('Missing mixed window lighting');
      if(!windows.some(v=>windowIsLit(b,v,0)!==windowIsLit(b,v,30)))throw Error('Windows never switch');
      while(b.hp>2&&!b.powerCut){b.hp--;damageBlocks(b,false);}
      if(!b.powerCut||target(b)>b.h0*.5)throw Error('Height blackout not triggered');
      if(windows.some(v=>windowIsLit(b,v,0)||windowIsLit(b,v,30)))throw Error('Blackout windows still lit');
      impact({slot:b.i,payout:0,stake:10,multiplier:0});
      if(impactExplosions.length!==1)throw Error('Impact sprite missing');
    }""")
    page.wait_for_timeout(210)
    page.screenshot(path=str(ROOT/'artifacts/eruption-explosion-blackout.png'),full_page=True)
    page.evaluate("""() => {
      const b=towerOf();b.hp=b.maxHp;initBlocks(b);
      if(b.powerCut||!b.blocks.some(v=>v.window&&windowIsLit(b,v,0)))throw Error('Power not restored');
      updateImpactEffects(2);if(impactExplosions.length)throw Error('Expired explosions leaked');
    }""")
    page.locator('#rules-open').click()
    page.locator('.demo summary').click()
    page.locator('#force-warp').click()
    page.locator('#rules-close').click()
    page.wait_for_timeout(800)
    page.screenshot(path=str(ROOT/'artifacts/eruption-warp-city.png'),full_page=True)
    page.evaluate('''() => {
      const b=buildings[0];impact({slot:0,payout:0,stake:10,multiplier:0});
      if(!b.dead||b.blocks.some(v=>v.alive))throw Error('Collapse incomplete');
      update(6);if(!b.dead)throw Error('Rubble rebuilt before finale');
      erupt();window.pendingPayout=balls[0].payout;
      window.potBefore=pot;window.balanceBefore=balance;window.cityBefore=city;
      const t=towerOf(),positions=t.blocks.map(v=>[v.x,v.y]);
      for(let i=0;i<t.maxHp;i++)impact({slot:t.i,payout:0,stake:10,multiplier:0});
      if(cycle.phase!=='settling'||auto)throw Error('Finale did not stop launches');
      if(t.blocks.some((v,i)=>v.x!==positions[i][0]||v.y!==positions[i][1]))throw Error('Blocks moved');
      if(balance!==balanceBefore||pot!==potBefore)throw Error('Pot paid before settlement');
      if(erupt()!==false||balance!==balanceBefore)throw Error('Bet allowed during settlement');
      updateCityCycle(.1);if(cycle.phase!=='settling')throw Error('Skipped airborne ball');
    }''')
    page.wait_for_function("cycle.phase==='award'",timeout=15000)
    page.evaluate('''() => {
      if(balance!==r2(balanceBefore+pendingPayout+potBefore)||pot!==0)throw Error('Incorrect payout');
      window.paidBalance=balance;updateCityCycle(.1);
      if(balance!==paidBalance)throw Error('Duplicate pot payout');
    }''')
    page.screenshot(path=str(ROOT/'artifacts/eruption-city-bonus.png'),full_page=True)
    page.wait_for_function("cycle.phase==='rebuild'")
    page.wait_for_timeout(800)
    page.screenshot(path=str(ROOT/'artifacts/eruption-scaffolding.png'),full_page=True)
    page.wait_for_function("cycle.phase==='play' && city>cityBefore")
    page.evaluate('''() => {
      if(city!==cityBefore+1||buildings.some(b=>b.dead||b.hp!==b.maxHp||b.blocks.some(v=>!v.alive)))throw Error('City not restored');
      if(balance!==paidBalance)throw Error('Rebuild changed balance');
    }''')
    assert page.locator('#erupt').is_enabled()
    assert page.locator('#next-city').count()==0
    assert page.evaluate("cycle.phase==='play' && balls.length===0 && balance===paidBalance")
    for rows in ['8','10','12','14','16']:
        page.locator('#rows').select_option(rows)
        page.evaluate("() => {if(buildings.some(b=>!b.blocks.length))throw Error('Missing blocks'); for(const kind of ['cobalt','silver','teal','vault'])if(!buildings.some(b=>b.kind===kind))throw Error('Missing tower variant '+kind); if(buildings[0].kind!=='vault'||buildings.at(-1).kind!=='vault'||buildings.some(b=>!b.tower&&b.h0>=towerOf().h0))throw Error('Incorrect city hierarchy'); for(let i=0;i<rows/2;i++){if(buildings[i].h0>=buildings[i+1].h0||buildings[i].h0!==buildings[rows-i].h0)throw Error('City is not a symmetric bell curve'); if(target(buildings[i])>=target(buildings[i+1]))throw Error('Block rounding flattened height steps');}}")
    page.locator('#rows').select_option('12')
    page.set_viewport_size({'width':390,'height':844})
    page.wait_for_timeout(300)
    page.screenshot(path=str(ROOT/'artifacts/eruption-cycle-mobile.png'),full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    for width,height in [(1366,768),(1024,768),(390,844),(375,667),(320,568),(844,390)]:
        page.set_viewport_size({'width':width,'height':height})
        page.wait_for_timeout(150)
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), f'Overflow at {width}'
        assert page.locator('#erupt').is_visible()
        if width>=1000: assert page.evaluate('document.documentElement.scrollHeight<=innerHeight'), 'Desktop frame exceeds viewport'
        page.screenshot(path=str(ROOT/f'artifacts/eruption-layout-{width}x{height}.png'),full_page=True)
        page.locator('#rules-open').click()
        assert page.locator('#rules').is_visible()
        page.keyboard.press('Escape')
        assert not page.locator('#rules').is_visible()
    page.set_viewport_size({'width':390,'height':844})
    page.locator('#stake').fill('20')
    page.locator('#half').click()
    assert page.locator('#stake').input_value()=='10'
    page.locator('#dbl').click()
    assert page.locator('#stake').input_value()=='20'
    page.locator('#max-stake').click()
    assert int(page.locator('#stake').input_value())<=1000
    page.locator('#risk [data-v="high"]').click()
    assert page.locator('#risk [data-v="high"]').get_attribute('aria-pressed')=='true'
    page.evaluate("""() => {
      const b=buildings[1];b.dead=false;b.hp=b.maxHp;initBlocks(b);
      impact({slot:b.i,payout:0,stake:10,multiplier:0,demolition:true});
      if(!b.dead||b.hp!==0||b.blocks.some(v=>v.alive))throw Error('Demolition did not destroy building');
      impact({slot:b.i,payout:4,stake:10,multiplier:.4,demolition:true});
      if(cycle.phase!=='play')throw Error('Ordinary demolition triggered tower finale');
      $('stake').value=10;
      const random=PanicMath.randomInt,plinko=PanicMath.plinko;
      window.bonusBalance=balance;window.bonusCity=city;
      try{
        PanicMath.randomInt=()=>0;PanicMath.plinko=()=>({slot:rows/2});
        if(!erupt())throw Error('Bonus drop rejected');
      }finally{PanicMath.randomInt=random;PanicMath.plinko=plinko;}
      const ball=balls.at(-1),base=PanicMath.settlePlinko(rows/2,10,rows,risk);
      if(!ball.demolition||ball.payout!==r2(base.payout*2)||ball.multiplier!==r2(base.multiplier*2))throw Error('Bonus multiplier incorrect');
      window.bonusReturn=ball.payout;window.bonusPot=pot;
    }""")
    page.wait_for_timeout(1200)
    page.screenshot(path=str(ROOT/'artifacts/eruption-gold-ball.png'),full_page=True)
    page.wait_for_function("cycle.phase==='award'",timeout=15000)
    page.evaluate("""() => {
      if(!towerOf().dead||balance!==r2(bonusBalance-10+bonusReturn+bonusPot)||pot!==0)throw Error('Bonus tower settlement wrong');
      const paid=balance;updateCityCycle(.1);if(balance!==paid)throw Error('Duplicate bonus');
    }""")
    page.wait_for_function("cycle.phase==='play' && city>bonusCity")
    assert page.evaluate('city===bonusCity+1 && !towerOf().dead')
    page.emulate_media(reduced_motion='reduce')
    page.reload(wait_until='networkidle')
    assert page.evaluate('reduced')
    page.locator('#sound').uncheck()
    page.locator('#rules-open').click()
    page.locator('.demo summary').click()
    page.locator('#force-warp').click()
    page.locator('#rules-close').click()
    page.wait_for_timeout(600)
    assert not errors,errors
    print('PASS: fleeing pedestrians, car ignition and wrecks, street reset, rounded explosion frames, lighting changes, height blackout and restoration, warp/car assets, rubble persistence, airborne settlement, single pot payout, launch lock, full rebuild, automatic next city, all layouts, mobile, reduced motion, no browser errors')
    browser.close()
