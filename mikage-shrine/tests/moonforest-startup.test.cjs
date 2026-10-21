// Reuse the established full module/floor fixture and exercise the new real bridge.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
let suite=fs.readFileSync(path.join(__dirname,'startup-integration.test.cjs'),'utf8');
suite=suite.replace("const release=process.argv[2]||'1.29.3';","const release='1.49.0';");
suite=suite.replace('const shared={z,Mvu,',`const shared={createChatMessages:async(updates)=>{for(const u of updates){const id=rows.at(-1).message_id+1;rows.push({...clone(u),message_id:id,swipe_id:0});const el=host.document.createElement('div');el.className='mes';el.setAttribute('mesid',String(id));const text=host.document.createElement('div');text.className='mes_text';text.textContent=u.message;el.append(text);host.document.querySelector('#chat').append(el);}emit(events.MESSAGE_RECEIVED);},z,Mvu,`);
const anchor="  host.MikageOpeningScreen.show(true);assert.equal(host.document.querySelectorAll('iframe[title=\"游戏标题页重播\"]').length,1);";
if(!suite.includes(anchor))throw Error('Established fixture anchor changed');
suite=suite.replace(anchor,`  rows.at(-1).data.stat_data.环境.地点='宇庭老街·月之森和裁舍';rows.at(-1).data.stat_data.地图.当前地区='R02';rows.at(-1).data.stat_data.神社.奉纳=12;
  const untouchedFloor=clone(rows.at(-1));await host.MikageShrinePanels.bridge.getState();
  await host.MikageShrinePanels.bridge.act('shopDraft',{sku:'player:sakura'});assert(host.document.querySelector('#send_textarea').value.includes('月之森和裁舍'));assert.deepEqual(rows.at(-1),untouchedFloor);
  const beforePurchase=rows.length;await host.MikageShrinePanels.bridge.act('buyOutfit',{sku:'player:sakura'});await tick();assert.equal(rows.length,beforePurchase+1);assert.deepEqual(rows.at(-2),untouchedFloor);assert.equal(rows.at(-1).role,'assistant');assert.equal(rows.at(-1).is_hidden,false);assert.equal(rows.at(-1).data.stat_data.神社.奉纳,10);assert.equal(rows.at(-1).data.stat_data.玩家.衣装,'daily');
  const owned=rows.at(-1).data.stat_data.衣橱.已解锁;assert(owned.some(x=>x.编号==='player:sakura'));await host.MikageShrinePanels.bridge.getState();await assert.rejects(host.MikageShrinePanels.bridge.act('buyOutfit',{sku:'player:sakura'}),/已收录/);assert.equal(rows.length,beforePurchase+1);assert.equal((await host.MikageShrinePanels.bridge.getState()).衣装商店.products.find(x=>x.sku==='player:sakura').owned,true);
  console.log('PASS actual purchase bridge creates one new snapshot, retains preceding floor, appends no model reply, rejects repeat, and exposes persisted ownership');
`+anchor);
vm.runInThisContext('(function(require,__dirname){'+suite+'\n})', {filename:__filename})(require,__dirname);
