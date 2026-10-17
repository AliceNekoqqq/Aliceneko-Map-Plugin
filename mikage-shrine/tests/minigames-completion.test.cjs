const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.resolve(__dirname,'../runtime/minigames.mjs'),'utf8');
const url='data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const shell='<!doctype html><button id="outside">外部按钮</button><iframe id="helper" style="display:none"></iframe>';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/tmp/mikage-chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],issues=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**',route=>route.request().url()==='https://mikage.test/'?route.fulfill({body:shell,contentType:'text/html'}):route.abort());
 await page.goto('https://mikage.test/');
 async function install(){const frame=await page.locator('#helper').elementHandle().then(h=>h.contentFrame());await frame.evaluate(async u=>(await import(u)).start(),url);return frame;}
 await install();
 const click=name=>page.getByRole('button',{name,exact:true}).click();
 async function steps(names){for(const name of names)await click(name);}
 async function open(region){
  await page.evaluate(region=>{window.results=[];window.closes=0;MikageMinigames.open({region,reducedMotion:true,onComplete:r=>results.push(r),onClose:()=>closes++});},region);
  await page.waitForLoadState('networkidle');
  const broken=await page.locator('[data-mikage-minigame-host] img').evaluateAll(xs=>xs.filter(x=>x.complete&&!x.naturalWidth).map(x=>x.className));
  if(broken.length)issues.push({region,broken});
  await click('开始这段散策');
 }
 async function complete(region){
  assert.equal(await page.evaluate(()=>results.length),1,region+' completes once');
  assert.equal(await page.evaluate(()=>results[0].region),region);
  assert.equal(await page.evaluate(()=>results[0].memories.every(x=>x.persistent===true)),true,region+' persists memories on the host origin');
  assert(await page.locator('.mka-result').isVisible());
  await click('关闭互动弹窗');assert.equal(await page.evaluate(()=>closes),1);
  assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  console.log('PASS',region,'complete + persistent keepsake + callback once + body scrolling restored');
 }
 await open('R01');await click('请巴卫把竹篮放在左侧');for(let i=0;i<6;i++)await click('顺风收拢下一片');await steps(['一起安排庭院秋色','树下心形','就这样，和巴卫一起摆好']);await complete('R01');
 await open('R02');await steps(['我想先伸手摸摸它','它还在观察，我们先留出空间','侧身坐下，移开视线','和巴卫安静坐着，让猫休息']);await complete('R02');
 await open('R03');await steps(['樱粉','米白','抹茶','开始慢火烘烤','收一档火','翻面看火候','翻面看火候','添一档火','翻面看火候','翻面看火候','黑蜜黄豆粉','点缀：黄豆粉','加玩三局玻璃弹珠','贴左木沿','轻推','弹出玻璃珠','绕过右挡片','稳推','弹出玻璃珠','穿过中间','稍用力','弹出玻璃珠']);await complete('R03');
 await open('R04');await steps(['竹青','尖首快行','选好纸与船形','对折纸角','折起两边','展开船身','向右引导','顺着中间','向左引导','向右引导']);await complete('R04');
 await open('R05');await steps(['往临海','沿途拍照','加入第1站：旧街口','加入第2站：展望坡','检票出发','盖一枚叶影','盖一枚花结','盖一枚电车','收好这张旅票']);await complete('R05');
 await open('R06');await steps(['站台与旅途','向左取景','拉近画面','请巴卫帮我稳住，按下快门','海蓝胶片','添加小电车','装饰右移','转动选中装饰','排版完成，写下寄语','今天有你陪着，很开心。','给巴卫看成品','返回修改','下次还一起等这班电车吧。','给巴卫看成品','收好这张共同明信片']);await complete('R06');
 await open('R07');await steps(['看树皮的纹路','寻找银杏','寻找蕨叶','寻找椿叶','铺开拓纸','樱粉']);for(let i=0;i<6;i++)await click('压印一笔');await click('收好这一页叶拓');await complete('R07');
 await open('R08');await steps(['看水纹','第1簇萤火','显示数字提示']);for(const n of [4,2,3,1,4,2,3,1,2,4])await click(`第${n}簇萤火`);await complete('R08');
 await open('R09');await steps(['自由敲一会儿','咚 · 鼓心','回到三拍练习','稳稳跟拍']);for(const n of ['咚','咚','咔','咚','咔','咚','咔','咚','咚','咔','咚','咔'])await click(n==='咚'?'咚 · 鼓心':'咔 · 鼓沿');await complete('R09');
 await open('R10');await click('并肩灯列');for(let i=1;i<=6;i++){await click(i%2?'暖金':'樱粉');await click(`第${i}盏灯，尚未点亮`);}await click('收好这一幕');await complete('R10');
 const memories=await page.evaluate(()=>MikageMinigames.getMemoryBook());assert.equal(Object.keys(memories.entries).length,11,'ten regions plus marbles persist eleven distinct keepsakes');
 await page.reload();await install();assert.equal(await page.evaluate(()=>Object.keys(MikageMinigames.getMemoryBook().entries).length),11,'keepsakes survive a full host and helper reload');
 await open('R01');await click('旧物回忆册');
 assert(await page.getByText('已收录 11/11 件',{exact:false}).count());
 await page.keyboard.press('Escape');
 const outerRemaining=await page.locator('[data-mikage-minigame-host]').count();
 if(!outerRemaining)issues.push({memoryBook:'Escape closes the outer game instead of the topmost memory book'});
 console.log('PERSISTENCE',Object.keys(memories.entries).length,'ISSUES',JSON.stringify(issues));
 assert.deepEqual(errors,[]);await browser.close();
 if(issues.length)process.exitCode=2;
})().catch(e=>{console.error(e);process.exit(1);});
