/* Local testing sandbox. Password gate is an unobtrusive convenience, not
 * server-side identity or copy protection. Never writes message/MVU data. */
(function(host, initial) {
 'use strict';
 const expected='ee47c2335166e2a33b65fcf352b899a7ce910a48eec614e7122f2e2c88d78918';
 const copy=v=>JSON.parse(JSON.stringify(v));
 let state=null,serial=0;
 const engine=()=>{const e=host.MikageShrineRuntime?.engine;if(!e)throw Error('请等神社记录准备好。');return e;};
 function notify(){host.dispatchEvent(new host.Event('mikage:dev-changed'));}
 function build(){const e=engine(),s=copy(initial);for(const name of ['鸟居','参道','拜殿','社务所','庭院'])s.神社[name]=4;s.神社.当前施工='';s.神社.建设计划={设施:'',说明:'',已确认:false};for(const k of e.config.resources)s.神社[k]=9999;s.主线.已完成=Array.from({length:5},(_,i)=>({编号:'M0'+(i+1)}));s.主线.已显现=copy(s.主线.已完成);s.衣橱.待呈现=[];s.衣橱.已呈现=e.config.wardrobeRewards.map(r=>r.id);for(const item of e.life.config.items)s.生活.库存[item.id]=99;s.环境.天数=10;s.绘马板.绘马.forEach(row=>{row.材料档=5;row.奖励=copy(e.config.stages[4].reward);});for(const q of e.config.wardrobeQuests||[]){const snapshot={...copy(initial.委托),编号:q.id,绘马编号:q.id,祈愿人:q.person,诉求:q.wish,类型:q.type,地区:q.region,性质:'普通',材料档:4,阶段:'收束',结算档位:'完整',结果:'独立测试副本：支线已完成'};s.记录.完成委托.push({编号:q.id,快照:snapshot});}e.deriveProgress(s);e.checkFields(s);return s;}
 function travel(id){if(!state)throw Error('测试模式未开启。');const place=engine().config.regions.find(r=>r.id===id);if(!place)throw Error('无效地区。');state.地图.当前地区=id;state.地图.目标地区='';state.环境.地点=place.name;state.巴卫.位置=place.name;state.生活.场景摘要='';notify();return true;}
 async function enter(password){if(!host.crypto?.subtle)throw Error('当前浏览器无法校验测试口令。');const hash=await host.crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(password)));const value=Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('');if(value!==expected)throw Error('口令不匹配。');state=build();serial=0;notify();return true;}
 function exit(){if(!state)return;state=null;notify();}
 function act(name,payload={}){if(!state)throw Error('测试模式未开启。');const e=engine();if(name==='travel')return travel(payload.regionId);if(['openBoard','openMap','openWardrobe','openLife','closePanel'].includes(name))return true;let generated;
  if(name==='refreshBoard'){const occupied=state.绘马板.绘马.filter(r=>r.性质==='普通'&&['未接','进行','暂停'].includes(r.状态)).length,slots=e.config.stages[4].boardCap-occupied;if(slots<=0)throw Error('测试绘马板已满。');generated={绘马:Array.from({length:slots},(_,i)=>{const row=copy(initial.绘马板.绘马[i%initial.绘马板.绘马.length]),n=++serial;return {标题:'散策测试 '+n,祈愿人:row.祈愿人,来客类型:row.来客类型,类型:row.类型,地区:row.地区,心愿:row.心愿+' · '+n,补充说明:row.补充说明,幕后:row.幕后};})};}
  state=e.action(state,name,{...payload,generated});notify();return true;
 }
 const api={get active(){return !!state;},getState:()=>state?copy(state):null,enter,exit,travel,act};
 host.MikageDeveloperSandbox?.exit?.();host.MikageDeveloperSandbox=api;window.addEventListener?.('pagehide',()=>{if(host.MikageDeveloperSandbox===api){api.exit();delete host.MikageDeveloperSandbox;}},{once:true});
})(window.parent, __MIKAGE_INITIAL__);
