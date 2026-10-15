const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path').resolve(__dirname,'../src')+'/';
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/tmp/mikage-audit/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:375,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setContent('<html><body style="margin:0;padding:12px"><main id="mount"></main></body></html>');
  await page.addStyleTag({path:path+'activities.css'});await page.addScriptTag({path:path+'activities.js'});
  async function mount(region,reducedMotion=true){await page.evaluate(({region,reducedMotion})=>{window.current?.dispose();window.results=[];window.closes=0;window.current=MikageActivities.mount(document.querySelector('#mount'),{region,reducedMotion,onComplete:r=>results.push(r),onClose:()=>closes++});},{region,reducedMotion});}
  const click=name=>page.getByRole('button',{name,exact:true}).click();
  const count=()=>page.evaluate(()=>results.length);
  async function completed(region){assert.equal(await count(),1,region+' completes once');assert.equal(await page.evaluate(()=>results[0].region),region);assert.ok(await page.locator('.mka-result').isVisible());}
  await mount('R01');
  await page.getByRole('button',{name:'收起第1片落叶',exact:true}).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'收起第2片落叶','removed action transfers keyboard focus to next stage action');
  for(let i=2;i<=5;i++)await click(`收起第${i}片落叶`);await completed('R01');
  await click('再玩一次');for(let i=1;i<=5;i++)await click(`收起第${i}片落叶`);assert.equal(await count(),2,'replay calls completion once for new session');
  await mount('R02');await click('慢慢蹲下');await click('轻声招呼');assert.equal(await count(),0);for(let i=0;i<3;i++)await click('安静等一会儿');await click('轻声招呼');await click('轻轻回应它');await completed('R02');
  await mount('R03');
  await page.getByRole('button',{name:'樱粉',exact:true}).focus();await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'樱粉','persistent action retains keyboard focus');
  for(const c of ['米白','抹茶'])await click(c);await click('串好这一签');await completed('R03');
  await mount('R04');await click('竹青');await click('就用这张纸');for(const c of ['对折纸角','折起两边','展开船身'])await click(c);await click('向右引导');assert.equal(await count(),0,'wrong route retries');for(const c of ['向左引导','向右引导','顺着中间'])await click(c);await completed('R04');
  await mount('R05');await click('往临海');await click('确定方向，开始盖章');for(const c of ['盖一枚叶影','盖一枚花结','盖一枚电车'])await click(c);await completed('R05');
  await mount('R06');for(const c of ['放入电车景戳','放入海面景戳','放入灯塔景戳'])await click(c);await click('把今天的海风寄给你。');await click('收好明信片');await completed('R06');assert.match(await page.locator('.mka-help').innerText(),/临海电车站台/);
  await mount('R07');for(const c of ['寻找银杏','寻找蕨叶','寻找椿叶'])await click(c);await click('把叶片放到拓纸上');await click('樱粉');await click('轻轻压出叶脉');await completed('R07');
  await mount('R08');for(let i=1;i<=3;i++)await click(`第${i}簇萤火`);await click('第3簇萤火');assert.equal(await count(),0);await click('显示数字提示');for(const i of [2,1,3])await click(`第${i}簇萤火`);await completed('R08');
  await mount('R09');await click('自由敲一会儿');await click('咚 · 鼓心');assert.equal(await count(),0);await click('回到三拍练习');await click('咔 · 鼓沿');for(const b of ['咚','咚','咔','咔','咚','咔','咚','咔','咚'])await click(b==='咚'?'咚 · 鼓心':'咔 · 鼓沿');await completed('R09');
  await mount('R10');for(let i=1;i<=6;i++){await click(i%2?'暖金':'樱粉');await page.getByRole('button',{name:`第${i}盏灯，尚未点亮`,exact:true}).click();}await click('青灯');await page.getByRole('button',{name:'第1盏灯，已点亮，可换色',exact:true}).click();assert.equal(await count(),0,'lantern colours remain editable before explicit save');await click('收好这一幕');await completed('R10');assert.ok(await page.getByRole('button',{name:'青灯',exact:true}).isDisabled());
  await click('收起小舞台');assert.equal(await page.evaluate(()=>closes),1);
  for(const region of ['R01','R02','R03','R04','R05','R06','R07','R08','R09','R10']){
    await mount(region);assert.equal(await page.locator('.mka').count(),1);
    const bad=await page.locator('.mka button').evaluateAll(nodes=>nodes.map(n=>({text:n.textContent,w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})).filter(n=>n.w<44||n.h<44));assert.deepEqual(bad,[],region+' 44px targets');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=375),region+' no page overflow');
    await page.getByRole('button').first().focus();assert.equal(await page.evaluate(()=>document.activeElement.tagName),'BUTTON');
  }
  await mount('R08',false);for(let i=1;i<=3;i++)await click(`第${i}簇萤火`);
  await page.evaluate(()=>{const outside=document.createElement('button');outside.id='outside-focus';outside.textContent='outside';document.body.append(outside);outside.focus();});
  await page.waitForTimeout(2900);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'outside-focus','async render never steals external focus');
  await page.evaluate(()=>current.dispose());await page.waitForTimeout(2900);assert.equal(await page.locator('.mka').count(),0,'dispose during flashing cleans timers');
  assert.deepEqual(errors,[]);
  console.log('PASS: all ten completions; replay; cat patience; route retry; postcard context; firefly hints; drum freeplay; once-only callbacks; dispose; 375px overflow; keyboard/native controls; 44px hit targets');
  await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
