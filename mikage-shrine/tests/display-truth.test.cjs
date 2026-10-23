const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {z}=require((process.env.MIKAGE_DEBUG_DEPS||'/tmp/mikage-debug/node_modules')+'/zod');
const {JSDOM}=require((process.env.MIKAGE_DOM_DEPS||'/workspace/scratch/7decd27be3a9/opening-check-deps/node_modules')+'/jsdom');
const root=path.resolve(__dirname,'..'),release=process.argv[2]||'1.49.20',legacy=process.argv.includes('--expect-legacy-errors');
const clone=x=>JSON.parse(JSON.stringify(x)),equal=(a,b)=>assert.deepEqual(clone(a),clone(b));
const spec=JSON.parse(fs.readFileSync(root+'/releases/'+release+'/manifest.json'));
const readModule=id=>fs.readFileSync(path.resolve(root,'..',spec.modules.find(x=>x.module_id===id).path),'utf8');
const mvu=readModule('mvu'),panels=readModule('panels');
const code=mvu.slice(mvu.indexOf('const ShrineFieldSpec ='),mvu.indexOf('// Install before importing the core:'));
const schema=mvu.slice(mvu.indexOf('  const Schema = ')+2,mvu.indexOf('\n  bootstrapCommitted=true;'));
const {C,initial}=vm.runInNewContext(code+'\n'+schema+'\nShrineCard.installZodSchema(Schema);({C:ShrineCard,initial:ShrineInitial})',{z,console});
const quiet=panels.slice(panels.indexOf('function quietChoices(state)'),panels.indexOf('function quietMemories(state)'));
const strange=panels.slice(panels.indexOf('const StrangeCatalog='),panels.indexOf('  function getLifeView(){'));
const {choices,journal}=vm.runInNewContext(quiet+'\n'+strange+'\n({choices:quietChoices,journal:strangeJournal})',{engine:()=>C});
function served(items){const s=clone(initial);s.环境.时段='白昼';s.环境.天气='晴';s.环境.地点='茶室';s.巴卫.位置='厨房';s.生活.桌面=items.map((item,i)=>({id:'F-'+i,item,source:'实际制作',day:1}));return s;}
function creek(){const s=clone(initial);s.主线.已完成=[{编号:'M01'}];C.deriveProgress(s);s.地图.当前地区='R04';s.环境.地点='白梅旧庭外';return s;}
const table=s=>choices(s).find(x=>x.id==='table');
if(legacy){assert(table(served(['bento'])).detail.includes('白玉团子'));const seed=journal(creek()).available.find(x=>x.id==='A03');assert(/逆流/.test(seed.title+seed.teaser));assert(/小妖|障眼法/.test(seed.draft));console.log('PASS legacy: bento misreported as hot tea/dango; undiscovered A03 title/teaser/draft reveal phenomenon and speculate a cause');process.exit(0);}
for(const item of C.life.config.items.filter(x=>x.kind==='food')){
 const s=served([item.id]),frozen=JSON.stringify(s),choice=table(s);assert(choice);assert(choice.detail.includes(item.name));assert(choice.text.includes(item.name));
 for(const other of C.life.config.items.filter(x=>x.kind==='food'&&x.id!==item.id))assert(!choice.detail.includes(other.name));
 assert(!/正滚热|新蒸|白玉团子|汤吗/.test(choice.detail+choice.text));assert.equal(JSON.stringify(s),frozen);
}
const mixed=table(served(['bento','tea_set','bento']));assert(mixed.detail.includes('便当、茶点'));assert.equal((mixed.detail.match(/便当/g)||[]).length,1);
for(const items of [[],['unknown'],['lantern'],[null]])assert(!table(served(items)));
const missing=clone(initial);delete missing.生活;assert(!table(missing));assert(!table({}));
const remote=served(['bento']);remote.地图.当前地区='R04';assert(!table(remote));
const start=creek(),frozen=JSON.stringify(start),available=journal(start).available.find(x=>x.id==='A03');
assert.equal(available.title,'白梅溪畔');assert(!/逆流|荧光|小妖|障眼法/.test(JSON.stringify(available)));assert.equal(JSON.stringify(start),frozen);
const observed=clone(start);observed.记录.事件.push({编号:'E1',类型:'日常'});observed.记录.共同经历.push({编号:'E1',摘要:'【街区异样·A03·发现】正文实际观察到一片叶子逆着水流漂回浅滩。'});
assert.equal(journal(observed).active.title,'逆流而溯的古木叶');assert.equal(journal(observed).available.length,0);
for(const kind of ['暂放','继续','收束']){const s=clone(observed);s.记录.事件.push({编号:'E2',类型:'日常'});s.记录.共同经历.push({编号:'E2',摘要:'【街区异样·A03·'+kind+'】本轮实际回应'});const j=journal(s);assert.equal(kind==='收束'?j.completed[0].status:j.active.status,kind);assert.equal(j.available.length,0);}
const unlinked=clone(start);unlinked.记录.共同经历.push({编号:'missing',摘要:'【街区异样·A03·发现】无事件的伪记录'});assert.equal(journal(unlinked).active,null);assert(journal(unlinked).available.some(x=>x.id==='A03'));
const locked=creek();locked.地图.开放地区=[];assert.equal(journal(locked).available.length,0);
const occupied=creek();occupied.委托.编号='W-active';assert.equal(journal(occupied).available.length,0);
const a01=clone(initial);assert(journal(a01).available.find(x=>x.id==='A01').draft.includes('青苔'));const a02=creek();a02.地图.当前地区='R03';assert(journal(a02).available.find(x=>x.id==='A02').title.includes('招牌'));
async function drafts(){
 const dom=new JSDOM('<textarea id="send_textarea"></textarea>'),doc=dom.window.document,input=doc.querySelector('textarea');input.value='原有输入';let row={revision:'r1',table:{stat_data:served(['bento'])}},inputs=0;input.addEventListener('input',()=>inputs++);
 const put=panels.slice(panels.indexOf('function putQuietDraft(doc,text)'),panels.indexOf('const StrangeCatalog='));
 const prepare=panels.slice(panels.indexOf('  async function prepareQuiet(id){'),panels.indexOf('\n  const bridge={'));
 const context={engine:()=>C,read:()=>row,presented:'r1',token:r=>r.revision,assert:(ok,message)=>assert(ok,message),playable:s=>s,host:{document:doc},Event:dom.window.Event};
 const api=vm.runInNewContext(quiet+'\n'+strange+'\n'+put+'\n'+prepare+'\n({prepareQuiet,prepareStrange})',context);
 let before=JSON.stringify(row);await api.prepareQuiet('table');assert(input.value.startsWith('原有输入\n'));assert(input.value.includes('便当'));assert.equal(JSON.stringify(row),before);assert.equal(inputs,1);
 const saved=input.value;await api.prepareQuiet('table');assert.equal(input.value,saved);assert.equal(inputs,1);
 row={revision:'r1',table:{stat_data:creek()}};input.value='原有输入';before=JSON.stringify(row);await api.prepareStrange('A03','start');assert(!/逆流|荧光|小妖|障眼/.test(input.value));assert.equal(JSON.stringify(row),before);
 row={revision:'r1',table:{stat_data:observed}};await api.prepareStrange('A03','continue');assert(input.value.includes('沿用之前确实发现的线索'));await api.prepareStrange('A03','rest');assert(input.value.includes('先不追查'));
 const held=input.value;row.revision='r2';await assert.rejects(api.prepareQuiet('table'),/场景已经变化/);await assert.rejects(api.prepareStrange('A03','start'),/场景已经变化/);assert.equal(input.value,held);dom.window.close();
 console.log('PASS actual prepare functions + DOM input: names/neutral drafts, original input retained, dedup, linked discovery/continue/rest, stale rejection; no send or MVU write path invoked');
}
drafts().then(()=>console.log('PASS food empty/single/mixed/duplicate/unknown/missing/remote, neutral A03 preview, discovery lifecycle/event/region/quest guards; state reads are immutable')).catch(e=>{console.error(e);process.exitCode=1;});
