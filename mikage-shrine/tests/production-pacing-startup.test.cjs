// Actual pinned modules + the established simulated multi-floor host.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.env.MIKAGE_ECONOMY_RELEASE ||= '1.49.6';
const {state}=require('./economy.test.cjs');
let suite=fs.readFileSync(path.join(__dirname,'startup-integration.test.cjs'),'utf8');
suite=suite.replace("const release=process.argv[2]||'1.29.3';","const release="+JSON.stringify(process.env.MIKAGE_ECONOMY_RELEASE)+";");
suite=suite.replace('const shared={z,Mvu,',`const shared={createChatMessages:async(updates)=>{for(const u of updates){const id=rows.at(-1).message_id+1;rows.push({...clone(u),message_id:id,swipe_id:0});const el=host.document.createElement('div');el.className='mes';el.setAttribute('mesid',String(id));const text=host.document.createElement('div');text.className='mes_text';text.textContent=u.message;el.append(text);host.document.querySelector('#chat').append(el);}emit(events.MESSAGE_RECEIVED);},z,Mvu,`);
const anchor="  host.MikageOpeningScreen.show(true);assert.equal(host.document.querySelectorAll('iframe[title=\"游戏标题页重播\"]').length,1);";
if(!suite.includes(anchor))throw Error('Established fixture anchor changed');
suite=suite.replace(anchor,`  rows.at(-1).data.stat_data=${JSON.stringify(state(2,10))};
  rows.at(-1).data.stat_data.生活.库存.wood_scrap=0;rows.at(-1).data.stat_data.生活.库存.cloth=0;
  async function batchAction(payload){const prior=clone(rows.at(-1)),count=rows.length;await host.MikageShrinePanels.bridge.getState();await host.MikageShrinePanels.bridge.act('life',payload);await tick();assert.equal(rows.length,count+1);assert.deepEqual(rows.at(-2),prior);assert.equal(rows.at(-1).is_hidden,false);return rows.at(-1).data.stat_data;}
  for(const item of ['wood_scrap','cloth'])await batchAction({kind:'buy',item,quantity:1});
  rows.at(-1).data.stat_data.地图.当前地区='R01';rows.at(-1).data.stat_data.环境.地点='御影神社·庭院';
  let saved=await batchAction({kind:'craft',recipe:'wood_charm',quantity:3});assert.equal(saved.生活.库存.wood_charm,3);assert.equal(saved.生活.库存.cloth,0);assert.equal(saved.神社.奉纳,7);assert.equal(saved.记录.资源流水.length,2);
  const plots=saved.生活.菜圃;Object.assign(plots[0],{crop:'herb',plantedDay:1});Object.assign(plots[1],{crop:'tomato',plantedDay:2});saved.环境.天数=4;
  const refusal=clone(rows.at(-1)),refusalCount=rows.length;await host.MikageShrinePanels.bridge.getState();await assert.rejects(host.MikageShrinePanels.bridge.act('life',{kind:'harvest',plots:['plot_1','plot_2']}),/成熟/);assert.equal(rows.length,refusalCount);assert.deepEqual(rows.at(-1),refusal);
  rows.at(-1).data.stat_data.环境.天数=5;saved=await batchAction({kind:'harvest',plots:['plot_1','plot_2']});assert.equal(saved.生活.库存.herb,3);assert.equal(saved.生活.库存.tomato,2);assert(saved.生活.菜圃.every(x=>!x.crop));assert.equal(saved.记录.资源流水.length,2);
  saved.地图.当前地区='R03';saved.环境.地点='妖怪横丁';saved.生活.库存.herb=6;
  saved=await batchAction({kind:'sell',item:'herb',quantity:3});assert.equal(saved.生活.库存.herb,0);assert.equal(saved.神社.奉纳,10);assert.equal(saved.记录.资源流水.length,3);assert.equal(saved.记录.资源流水.at(-1).变动,3);
  const persisted=clone(saved);for(let i=0;i<3;i++)await host.MikageShrinePanels.bridge.getState();assert.deepEqual(rows.at(-1).data.stat_data,persisted);
  console.log('PASS actual batch bridge: one visible snapshot per craft/harvest/sale, exact totals and ledger, mixed-maturity refusal unchanged, preceding floors preserved, reread stable');
  async function waitBatch(test){for(let i=0;i<160;i++){if(test())return;await tick();}assert(test(),'UI did not settle: '+host.document.querySelector('[data-mikage-panel-frame]')?.contentDocument?.querySelector('#life-feedback')?.textContent);}
  saved.地图.当前地区='R01';saved.环境.地点='御影神社·庭院';saved.生活.库存.wood_scrap=3;saved.生活.库存.cloth=3;
  await host.MikageShrinePanels.open('life');const batchFrame=host.document.querySelector('[data-mikage-panel-frame]');batchFrame.dispatchEvent(new host.Event('load'));
  const batchUI=mountChild(batchFrame,{ShrineUIBridge:host.MikageShrinePanels.bridge,ShrineGameConfig:host.MikageShrinePanels.config,ShrineLifeConfig:host.MikageShrinePanels.lifeConfig});await tick();batchUI.ShrinePanel.openLife();await tick();
  batchUI.document.querySelector('[data-life-tab="craft"]').click();await tick();const quantity=batchUI.document.querySelector('#life-craft-quantity-wood_charm');assert.equal(quantity.options.length,3);assert.equal(quantity.labels[0].textContent,'制作批数');quantity.value='3';
  const craftButton=batchUI.document.querySelector('[data-life-craft="wood_charm"]'),uiBefore=rows.length;craftButton.click();craftButton.click();await tick();await tick();assert.equal(rows.length,uiBefore+1);assert.equal(rows.at(-1).data.stat_data.生活.库存.wood_charm,6);await waitBatch(()=>batchUI.document.querySelector('[data-life-craft="wood_charm"]')?.disabled===true);
  saved=rows.at(-1).data.stat_data;Object.assign(saved.生活.菜圃[0],{crop:'herb',plantedDay:1});Object.assign(saved.生活.菜圃[1],{crop:'tomato',plantedDay:4});
  await host.MikageShrinePanels.bridge.getState();batchUI.document.querySelector('[data-life-tab="garden"]').click();await tick();const harvestButton=batchUI.document.querySelector('[data-life-harvest-all]');assert(harvestButton.textContent.includes('1块'));const beforeHarvestUI=rows.length;harvestButton.click();await waitBatch(()=>rows.length===beforeHarvestUI+1);await tick();saved=rows.at(-1).data.stat_data;assert.equal(saved.生活.菜圃[0].crop,'');assert.equal(saved.生活.菜圃[1].crop,'tomato');assert.equal(batchUI.document.querySelector('[data-life-harvest-all]').disabled,true);
  saved.地图.当前地区='R03';saved.环境.地点='妖怪横丁';saved.生活.库存.herb=6;
  await host.MikageShrinePanels.bridge.getState();batchUI.document.querySelector('[data-life-tab="shop"]').click();await tick();const saleQuantity=batchUI.document.querySelector('#life-sell-quantity-herb');assert.equal(saleQuantity.options.length,2);assert(saleQuantity.options[1].textContent.includes('交出 4 份 · 获得 2 奉纳'));saleQuantity.value='2';const sales=rows.length;batchUI.document.querySelector('[data-life-sell="herb"]').click();await tick();await tick();saved=rows.at(-1).data.stat_data;assert.equal(rows.length,sales+1);assert.equal(saved.生活.库存.herb,2);assert.equal(saved.神社.奉纳,12);assert.equal(batchUI.document.querySelector('[data-life-sell="herb"]').disabled,true);
  host.MikageShrinePanels.close();console.log('PASS maintained iframe UI clicks: labelled batch quantities/output totals, double-click singleflight, depleted inputs, mature-only bulk harvest and capped multi-batch sale');
`+anchor);
vm.runInThisContext('(function(require,__dirname){'+suite+'\n})',{filename:__filename})(require,__dirname);
