const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path').resolve(__dirname,'../src')+'/';
const pathModule=require('node:path');
const sceneSource=fs.readFileSync(pathModule.resolve(__dirname,'../src/scene-host.mjs'),'utf8');
const catalogStart=sceneSource.indexOf('const catalog=')+'const catalog='.length;
const catalogEnd=sceneSource.indexOf(';\n  if(host.MikageCharacterArt',catalogStart);
const sceneCatalog=JSON.parse(sceneSource.slice(catalogStart,catalogEnd));
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/tmp/mikage-audit/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:375,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdn.jsdelivr.net/gh/mikage-tests/**',async route=>{const name=new URL(route.request().url()).pathname.split('/').pop();const font=name.endsWith('.ttf');await route.fulfill({path:pathModule.resolve(__dirname,font?'../assets/opening/'+name:'../assets/activities/'+name),contentType:font?'font/ttf':'image/webp',headers:{'access-control-allow-origin':'*'}});});
  await page.setContent('<html><body style="margin:0;padding:12px"><main id="mount"></main></body></html>');
  await page.addStyleTag({path:path+'activities.css'});
  await page.evaluate(async({files})=>{document.body.style.fontFamily='"Mikage Serif",serif';const faces=files.map(({file,unicodeRange})=>{const options=unicodeRange?{unicodeRange}:undefined;const face=new FontFace('Mikage Serif',`url("https://cdn.jsdelivr.net/gh/mikage-tests/${file}")`,options);document.fonts.add(face);return face.load();});await Promise.all(faces);}, {files:[{file:sceneCatalog.font},...sceneCatalog.fontFallbacks]});
  assert.equal(await page.evaluate(()=>document.fonts.check('16px "Mikage Serif"','蘸')),true,'supplemental subset font loads new minigame copy');
  await page.addScriptTag({path:path+'activities.js'});
  async function mount(region,reducedMotion=true){await page.evaluate(({region,reducedMotion})=>{window.current?.dispose();window.results=[];window.closes=0;const base='https://cdn.jsdelivr.net/gh/mikage-tests/';window.current=MikageActivities.mount(document.querySelector('#mount'),{region,reducedMotion,period:region==='R06'?'dusk':'day',art:{R01:base+'r01-courtyard-v1.webp',R02:base+'r02-garden-v1.webp',R04:base+'r04-stream-v1.webp',R06:{day:base+'r06-coastal-platform-v1.webp',dusk:base+'r06-coastal-platform-v1.webp',night:base+'r06-coastal-platform-v1.webp'},cat:base+'neighborhood-cat-v1.webp'},onComplete:r=>results.push(r),onClose:()=>closes++});},{region,reducedMotion});}
  const click=name=>page.getByRole('button',{name,exact:true}).click();
  const count=()=>page.evaluate(()=>results.length);
  async function completed(region){assert.equal(await count(),1,region+' completes once');assert.equal(await page.evaluate(()=>results[0].region),region);assert.ok(await page.locator('.mka-result').isVisible());}
  await mount('R01');assert.equal(await page.locator('.mka-scene-art').evaluate(img=>img.decode().then(()=>img.naturalWidth)),1536,'courtyard illustration loads locally');await click('穿堂风');
  await page.getByRole('button',{name:'收起第1片落叶',exact:true}).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'收起第2片落叶','removed action transfers keyboard focus to next stage action');
  for(let i=2;i<=5;i++)await click(`收起第${i}片落叶`);await click('树下留几片，铺成柔软一角');await completed('R01');
  await click('再玩一次');await click('微风');for(let i=1;i<=5;i++)await click(`收起第${i}片落叶`);await click('扫净石阶，铺出清爽归路');assert.equal(await count(),2,'replay accepts a different wind and courtyard outcome');
  await mount('R02');assert.equal(await page.locator('.mka-cat-art').evaluate(img=>img.decode().then(()=>img.naturalWidth)),1536,'transparent cat art loads locally');await page.locator('.mka-stage').screenshot({path:'/tmp/mikage-audit/activity-cat-375.png'});await click('蹲下后移开视线');await click('继续安静陪它一会儿');await completed('R02');
  await mount('R03');
  await page.getByRole('button',{name:'樱粉',exact:true}).focus();await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'樱粉','persistent action retains keyboard focus');
  for(const c of ['米白','抹茶'])await click(c);await click('黑蜜黄豆粉');await click('完成这一签');await completed('R03');
  await mount('R04');await click('竹青');await click('尖首快行');await click('选好纸与船形');for(const c of ['对折纸角','折起两边','展开船身'])await click(c);await click('向右引导');assert.equal(await count(),0,'wrong route retries');for(const c of ['顺着中间','向左引导','向右引导'])await click(c);await completed('R04');
  await mount('R04');await click('樱色');await click('宽底稳航');await click('选好纸与船形');for(const c of ['对折纸角','折起两边','展开船身'])await click(c);
  await page.locator('.mka-stage').screenshot({path:'/tmp/mikage-audit/paperboat-mobile.png'});
  async function dragRiver(step,direction){
    const canvas=page.locator('.mka-river-canvas');const rect=await canvas.boundingBox();const lane={left:116,center:360,right:604}[direction],source=step?({left:116,center:360,right:604}[['left','right','center'][step-1]]):360;
    const from={x:source,y:step?([126,232][step-1]+36):43},gateY=[126,232,338][step];
    const xy=(p)=>({x:rect.x+p.x*rect.width/720,y:rect.y+p.y*rect.height/420});const a=xy(from),b=xy({x:lane,y:gateY}),c=xy({x:lane,y:gateY+42});
    await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:16});await page.mouse.move(c.x,c.y,{steps:6});await page.mouse.up();
  }
  await dragRiver(0,'center');assert.match(await page.locator('.mka-progress').innerText(),/水门边打了个转/,'wrong dragged water gate can recover');
  for(const [i,direction] of ['left','right','center'].entries())await dragRiver(i,direction);await completed('R04');
  await mount('R05');await click('往临海');await click('停靠展望坡');await click('沿途拍照');await click('把这段行程盖进票根');for(const c of ['盖一枚叶影','盖一枚花结','盖一枚电车'])await click(c);await completed('R05');
  await mount('R06');assert.equal(await page.locator('.mka-scene-art').evaluate(img=>img.decode().then(()=>img.naturalWidth)),1536,'coastal platform illustration loads locally');await page.locator('.mka-stage').screenshot({path:'/tmp/mikage-audit/activity-coast-375.png'});await click('海蓝胶片');await click('电车入站');await click('选好构图，开始留影');await click('盖下站台邮戳');await click('盖下海鸥邮戳');await click('愿每一次相逢都有回声。');await click('收好这张明信片');await completed('R06');assert.match(await page.locator('.mka-help').innerText(),/安全的站台/);
  await mount('R07');await click('看树皮的纹路');for(const c of ['寻找银杏','寻找蕨叶','寻找椿叶'])await click(c);await click('把叶片放到拓纸上');await click('樱粉');await click('轻轻压出叶脉');await completed('R07');
  await mount('R08');await click('看水纹');for(let i=1;i<=3;i++)await click(`第${i}簇萤火`);await click('第2簇萤火');assert.equal(await count(),0);await click('显示数字提示');for(const i of [3,2,1])await click(`第${i}簇萤火`);await completed('R08');
  await mount('R09');await click('自由敲一会儿');await click('咚 · 鼓心');assert.equal(await count(),0);await click('回到三拍练习');await click('轻快合拍');for(const b of ['咔','咚','咔','咚','咔','咚','咔','咔','咚'])await click(b==='咚'?'咚 · 鼓心':'咔 · 鼓沿');await completed('R09');
  await mount('R10');await click('并肩灯列');for(let i=1;i<=6;i++){await click(i%2?'暖金':'樱粉');await page.getByRole('button',{name:`第${i}盏灯，尚未点亮`,exact:true}).click();}await click('青灯');await page.getByRole('button',{name:'第1盏灯，已点亮，可换色',exact:true}).click();assert.equal(await count(),0,'lantern colours remain editable before explicit save');await click('收好这一幕');await completed('R10');assert.ok(await page.getByRole('button',{name:'青灯',exact:true}).isDisabled());
  await click('收起小舞台');assert.equal(await page.evaluate(()=>closes),1);
  for(const region of ['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10']){
    await mount(region);assert.equal(await page.locator('.mka').count(),1);
    const bad=await page.locator('.mka button').evaluateAll(nodes=>nodes.map(n=>({text:n.textContent,w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})).filter(n=>n.w<44||n.h<44));assert.deepEqual(bad,[],region+' 44px targets');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=375),region+' no page overflow');
    await page.locator('.mka button:not(:disabled)').first().focus();assert.equal(await page.evaluate(()=>document.activeElement.tagName),'BUTTON',region+' contains a focusable control');
  }
  await mount('R08',false);await click('听芦苇');for(let i=1;i<=3;i++)await click(`第${i}簇萤火`);
  await page.evaluate(()=>{const outside=document.createElement('button');outside.id='outside-focus';outside.textContent='outside';document.body.append(outside);outside.focus();});
  await page.waitForTimeout(2900);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'outside-focus','async render never steals external focus');
  await page.evaluate(()=>current.dispose());await page.waitForTimeout(2900);assert.equal(await page.locator('.mka').count(),0,'dispose during flashing cleans timers');
  assert.deepEqual(errors,[]);
  console.log('PASS: all ten completions; replay; cat patience; paper-boat drag and button routes; wrong-gate recovery; postcard context; firefly hints; drum freeplay; once-only callbacks; dispose; 375px overflow; keyboard/native controls; 44px hit targets');
  await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
