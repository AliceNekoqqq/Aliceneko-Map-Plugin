// Test the existing real module bridge against a complete valid economy fixture.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {state}=require('./economy.test.cjs');
const release=process.env.MIKAGE_ECONOMY_RELEASE||'1.49.2';
let suite=fs.readFileSync(path.join(__dirname,'startup-integration.test.cjs'),'utf8');
suite=suite.replace("const release=process.argv[2]||'1.29.3';","const release="+JSON.stringify(release)+";");
suite=suite.replace('const shared={z,Mvu,',`const shared={createChatMessages:async(updates)=>{for(const u of updates){const id=rows.at(-1).message_id+1;rows.push({...clone(u),message_id:id,swipe_id:0});const el=host.document.createElement('div');el.className='mes';el.setAttribute('mesid',String(id));const text=host.document.createElement('div');text.className='mes_text';text.textContent=u.message;el.append(text);host.document.querySelector('#chat').append(el);}emit(events.MESSAGE_RECEIVED);},z,Mvu,`);
const anchor="  host.MikageOpeningScreen.show(true);assert.equal(host.document.querySelectorAll('iframe[title=\"游戏标题页重播\"]').length,1);";
if(!suite.includes(anchor))throw Error('Established fixture anchor changed');
suite=suite.replace(anchor,`  rows.at(-1).data.stat_data=${JSON.stringify(state(2,10))};
  const prior=clone(rows.at(-1)),count=rows.length;await host.MikageShrinePanels.bridge.getState();
  await host.MikageShrinePanels.bridge.act('life',{kind:'buy',item:'tea_leaf',quantity:1});await tick();
  assert.equal(rows.length,count+1);assert.deepEqual(rows.at(-2),prior);const saved=rows.at(-1).data.stat_data;assert.equal(saved.神社.奉纳,8);assert.equal(saved.生活.库存.tea_leaf,4);assert.equal(saved.记录.资源流水.length,1);assert.equal(saved.记录.资源流水[0].变动,-2);assert.equal(rows.at(-1).is_hidden,false);await host.MikageShrinePanels.bridge.getState();assert.equal(rows.at(-1).data.stat_data.记录.资源流水.length,1);
  console.log('PASS actual life bridge creates one visible snapshot with debit, package units and one ledger; prior floor unchanged and reread stable');
${release==='1.49.3'?`  rows.at(-1).data.stat_data.生活.库存.herb=2;
  const salePrior=clone(rows.at(-1)),saleCount=rows.length;
  await host.MikageShrinePanels.bridge.getState();await host.MikageShrinePanels.bridge.act('life',{kind:'sell',item:'herb',quantity:1});await tick();
  assert.equal(rows.length,saleCount+1);assert.deepEqual(rows.at(-2),salePrior);const sold=rows.at(-1).data.stat_data;assert.equal(sold.神社.奉纳,9);assert.equal(sold.生活.库存.herb,0);assert.equal(sold.记录.资源流水.length,2);assert.equal(sold.记录.资源流水[1].变动,1);assert.equal(sold.记录.资源流水[1].来源,'妖怪横丁收购');assert.equal(rows.at(-1).is_hidden,false);await host.MikageShrinePanels.bridge.getState();assert.equal(rows.at(-1).data.stat_data.记录.资源流水.length,2);
  console.log('PASS actual life sale bridge persists inventory debit, positive receipt and income in one visible floor; predecessor unchanged and reread stable');`:''}
`+anchor);
vm.runInThisContext('(function(require,__dirname){'+suite+'\n})',{filename:__filename})(require,__dirname);
