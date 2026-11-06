from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parent.parent
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True)
    page=browser.new_page(viewport={'width':1366,'height':900})
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.goto('http://localhost:8000/eruption/',wait_until='networkidle')
    page.wait_for_function('lavaFlowGlow!==null')
    result=page.evaluate('''() => {
      const saved=now,glow=lavaFlowGlow;
      now=Math.PI/2/1.25;lavaFlowGlow=null;draw();
      const before=ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height).data;
      lavaFlowGlow=glow;draw();
      const after=ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height).data;
      let changed=0,peak=0;
      for(let i=0;i<before.length;i+=4){const d=after[i]-before[i];if(d>10)changed++;peak=Math.max(peak,d);}
      now=saved;return {changed,peak};
    }''')
    assert result['changed']>3000,result
    page.screenshot(path=str(root/'artifacts/eruption-glow-v2.png'))
    assert not errors,errors
    print(result)
    browser.close()
