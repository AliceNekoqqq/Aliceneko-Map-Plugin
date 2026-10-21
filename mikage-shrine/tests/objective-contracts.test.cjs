const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {z}=require('/tmp/mikage-debug/node_modules/zod'),ejs=require('/tmp/mikage-debug/node_modules/ejs');
const root=path.resolve(__dirname,'..'),arg=process.argv[2]||'1.49.5',dir=path.isAbsolute(arg)?arg:root+'/releases/'+arg,which=process.argv[3]||'all';
const source=fs.readFileSync(dir+'/mvu.mjs','utf8'),card=JSON.parse(fs.readFileSync(dir+'/card-source.json'));
const code=source.slice(source.indexOf('const ShrineFieldSpec ='),source.indexOf('// Install before importing the core:')),schema=source.slice(source.indexOf('  const Schema = ')+2,source.indexOf('\n  bootstrapCommitted=true;'));
const {C,initial}=vm.runInNewContext(code+'\n'+schema+'\nShrineCard.installZodSchema(Schema);({C:ShrineCard,initial:ShrineInitial})',{z,console}),clone=x=>JSON.parse(JSON.stringify(x));
const entry=id=>card.data.character_book.entries.find(e=>e.id===id),render=s=>ejs.render(entry(54).content,{runType:'generate',lastMessageId:0,getvar:()=>s});
function projection(n){const s=clone(initial),cfg=C.config.stages[n-1];s.进度={...s.进度,阶段:n,阶段完成数:2,阶段目标:2,阶段设施:cfg.facility};s.主线.当前章=cfg.mainId;s.神社[cfg.facility]=4;return s;}
if(['all','rewards'].includes(which)){
 const literal=JSON.parse(entry(54).content.match(/^var rewards = (.*?)(?:\.flat\(\))?;$/m)[1]).flat();assert.deepEqual(literal,clone(C.config.wardrobeRewards.filter(r=>!r.sideQuest)),'main template catalogue must match runtime authority');
 assert(!entry(1).content.includes('本版五套衣装与DK人间伪装由四条固定衣装支线结案解锁'));assert(entry(1).content.includes('生活衣装按 wardrobeShop 购买事件收录'));
 const shopNames=C.config.wardrobeShop.products.map(p=>p.name);
 for(const r of C.config.wardrobeRewards.filter(r=>!r.sideQuest))for(const postgame of [false,true]){const s=projection(Math.min(5,r.stage));s.衣橱.待呈现=[r.id];s.主线.通关=postgame;s.进度.阶段完成数=0;const before=JSON.stringify(s),out=render(s);assert(out.includes(r.id));assert.equal(JSON.stringify(s),before);if(!r.outfits.length){for(const name of shopNames)assert(!out.includes(name),'region-only presentation must not gift '+name);assert(!/衣物已送到|衣裳熨烫|纪念衣装已妥存/.test(out));assert(out.includes('月之森'));}else for(const o of r.outfits)assert(out.includes(o.name),'real M05 memorial retained');}
 console.log('PASS rewards: exact runtime catalogue, all five pending IDs before/after postgame, region-only text, real memorials and read-only state');
}
if(['all','closure'].includes(which)){
 for(let n=1;n<=5;n++){const s=projection(n);s.委托={...s.委托,编号:'M0'+n,性质:'主线',阶段:'行动'};if(n===5){s.生活.祭典.已举办=true;s.生活.祭典.已结束=true;}const out=render(s);assert(out.includes('[神域修葺圆满'),'ready chapter must enter same-turn presentation: M0'+n);if(n<5){assert(!out.includes('正文已实际举办并收场祭典且同楼状态有依据时'));assert(!out.includes('只有正文实际描写举办和收场'));assert(!out.includes('宾客散场'));}else{assert(out.includes('正文已实际举办并收场祭典且同楼状态有依据时'));for(const field of ['已举办','已结束']){const pending=clone(s);pending.生活.祭典[field]=false;assert(!render(pending).includes('[神域修葺圆满'));}}for(const level of [1,2,3]){const unfinished=clone(s);unfinished.神社[unfinished.进度.阶段设施]=level;assert(!render(unfinished).includes('[神域修葺圆满'));}const noShrine=clone(s);delete noShrine.神社;assert(!render(noShrine).includes('[神域修葺圆满'));const early=clone(s);early.委托.阶段='查访';assert(!render(early).includes('[神域修葺圆满'));}
 for(const s of [{},clone(initial)])for(const runType of ['generate','display'])ejs.render(entry(54).content,{runType,lastMessageId:0,getvar:()=>s});
 console.log('PASS closure: M01..M05 facility-ready branches, levels1..3/early/missing negatives, M05 start/end gates and display/missing state');
}
if(['all','location'].includes(which)){
 const shop=C.config.wardrobeShop,sku='player:sakura',event=s=>({编号:'E'+(s.记录.事件.length+1),类型:'衣装购买',摘要:'玩家明确确认选购，素世包装交付',对象:sku,来源:shop.name,方式:JSON.stringify({sku}),资源:'无',数量:0,耗力:0,天数:0});
 function state(location,region='R02'){const s=clone(initial);s.神社.奉纳=10;s.地图.当前地区=region;s.环境.地点=location;C.deriveProgress(s);return s;}
 for(const location of [shop.location,' '+shop.location+' ']){const s=state(location),n=C.action(s,'buyOutfit',{sku});assert.equal(n.神社.奉纳,8);assert.equal(n.记录.资源流水.length,1);assert.equal(n.玩家.衣装,s.玩家.衣装);assert.equal(n.巴卫.服装,s.巴卫.服装);assert(n.衣橱.已解锁.some(x=>x.编号===sku));}
 for(const [location,region]of [[shop.location+'门外','R02'],['宇庭老街·已经离开月之森和裁舍','R02'],['宇庭老街·月之森和裁舍附近街边','R02'],[shop.location,'R01']]){const s=state(location,region),before=JSON.stringify(s);assert.equal(C.shopView(s).atShop,false);assert.throws(()=>C.action(s,'buyOutfit',{sku}),/抵达/);const p=clone(s);p.记录.事件.push(event(s));assert.throws(()=>C.validate(p,s),/抵达/);assert.equal(JSON.stringify(s),before);}
 assert(entry(49).content.includes('地点字段采用「'+shop.location+'」'));
 console.log('PASS location: canonical UI/model purchases, whitespace, outside/departed/neighbouring/remote rejection, atomicity, ledger and unchanged wear');
}
if(which==='all'){
 const base=JSON.parse(fs.readFileSync(root+'/releases/1.49.4/card-source.json')),restored=clone(card);restored.character_version=base.character_version;restored.data.character_version=base.data.character_version;restored.data.character_book.description=base.data.character_book.description;for(const id of [1,49,54])restored.data.character_book.entries.find(e=>e.id===id).content=base.data.character_book.entries.find(e=>e.id===id).content;assert.deepEqual(restored,base);
 const prior=fs.readFileSync(root+'/releases/1.49.4/mvu.mjs','utf8');assert.equal(source.replace("const version = '1.49.5';","const version = '1.49.4';",1).replace('s.地图.当前地区===shopConfig.region&&String(s.环境.地点).trim()===shopConfig.location','s.地图.当前地区===shopConfig.region&&String(s.环境.地点).includes(shopConfig.name)'),prior);assert(source.includes(fs.readFileSync(root+'/src/wardrobe-shop-domain.js','utf8')));
 const spec=JSON.parse(fs.readFileSync(dir+'/manifest.json')),oldSpec=JSON.parse(fs.readFileSync(root+'/releases/1.49.4/manifest.json'));assert.deepEqual(spec.modules.filter(m=>m.module_id!=='mvu'),oldSpec.modules.filter(m=>m.module_id!=='mvu'));
 console.log('PASS protected scope: exact source inverse, schema/initial/config/prose/extensions/IDs and four other module pins');
 function step(s,type,patch=()=>{},extra={}){const n=clone(s);patch(n);n.记录.事件.push({编号:'E'+(s.记录.事件.length+1),类型:type,摘要:'核实实际主线步骤',对象:s.委托.编号,来源:'实际剧情',方式:'',资源:'无',数量:0,耗力:0,天数:0,...extra});return C.validate(n,s);}
 const clear=s=>step(step(s,'休整',n=>n.委托.阶段='休整'),'休整',n=>n.委托=clone(initial.委托));
 let s=clone(initial);
 for(let i=0;i<2;i++){if(!s.绘马板.绘马.some(x=>x.性质==='普通'&&x.状态==='未接'))s=C.action(s,'refreshBoard',{generated:{绘马:[{标题:'实际来访'+i,祈愿人:'山下居民',来客类型:'人类',类型:C.config.stages[0].types[0],地区:'R01',心愿:'核对并处理来客的实际托付',补充说明:'回归夹具',幕后:Object.fromEntries(Object.keys(initial.委托.幕后).map(k=>[k,'可查的现场事实']))}]}});s=C.action(s,'acceptEma',{id:s.绘马板.绘马.find(x=>x.状态==='未接').编号});for(const [phase,type]of [['查访','查访'],['商议','商议'],['行动','行动'],['收束','结案']])s=step(s,type,n=>{n.委托.阶段=phase;if(phase==='收束'){n.委托.结果='当事人核实并完成实际托付';n.委托.结算档位='完整';}});s=clear(s);}
 s=step(s,'规划',n=>n.神社.建设计划={设施:'鸟居',说明:'实际确认修缮方案',已确认:true},{对象:'鸟居'});for(const [level,type]of [[2,'开工'],[3,'施工'],[4,'施工']])s=step(s,type,n=>n.神社.鸟居=level,{对象:'鸟居'});
 s=step(s,'主线显现',()=>{},{对象:'M01'});s=C.action(s,'acceptEma',{id:'M01'});for(const [phase,type]of [['查访','查访'],['商议','商议'],['行动','行动']])s=step(s,type,n=>n.委托.阶段=phase);
 assert(render(s).includes('[神域修葺圆满'));assert(!render(s).includes('正文已实际举办并收场祭典且同楼状态有依据时'));
 s=step(s,'结案',n=>{n.委托.阶段='收束';n.委托.结果='修缮与山下往来按实际回应完成';n.委托.结算档位='完整';});s=clear(s);
 assert(s.衣橱.待呈现.includes('U02'));assert(!s.衣橱.已解锁.some(x=>x.编号==='player:sakura'));const out=render(s);assert(out.includes('本次呈现为地区开放说明'));assert(!out.includes('樱染散策'));assert(!out.includes('衣物已送到'));
 console.log('PASS actual first chapter from InitVar: two ordinary cases, repair, ready presentation, closure and slot clearing; no phantom clothes or early festival demand');
}
