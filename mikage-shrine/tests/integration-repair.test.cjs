const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),version=process.env.MIKAGE_REPAIR_RELEASE||'1.48.3';
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),clone=x=>JSON.parse(JSON.stringify(x));
const manifest=JSON.parse(read('releases/'+version+'/manifest.json')),prior=JSON.parse(read('releases/1.48.2/manifest.json'));
const source=id=>read(manifest.modules.find(x=>x.module_id===id).path.replace('mikage-shrine/',''));
const oldSource=id=>read(prior.modules.find(x=>x.module_id===id).path.replace('mikage-shrine/',''));
for(const m of manifest.modules)assert.equal(crypto.createHash('sha256').update(read(m.path.replace('mikage-shrine/',''))).digest('hex'),m.sha256);
function engine(text){const c=vm.createContext({console,structuredClone});vm.runInContext(text.slice(text.indexOf('const ShrineFieldSpec ='),text.indexOf('// Install before importing the core:'))+';this.E=ShrineCard;this.initial=ShrineInitial;',c);return c;}
const ctx=engine(source('mvu')),old=engine(oldSource('mvu')),E=ctx.E;
const destinations={WQ01:'R03',WQ02:'R06',WQ03:'R03',WQ04:'R01',WQ05:'R03',WQ06:'R09',WQ07:'R06',WQ08:'R09'};
function state(C=E,initial=ctx.initial,count=5){const s=clone(initial);for(const f of ['鸟居','参道','社务所','拜殿','庭院'])s.神社[f]=4;s.主线.已完成=Array.from({length:count},(_,i)=>({编号:'M0'+(i+1)}));s.衣橱.已呈现=C.config.wardrobeRewards.filter(r=>!r.sideQuest&&s.主线.已完成.some(m=>m.编号===r.mainId)).map(r=>r.id);s.衣橱.待呈现=[];s.绘马板.绘马=[];C.deriveProgress(s);return s;}
for(const [id,region] of Object.entries(destinations)){
 const q=E.config.wardrobeQuests.find(q=>q.id===id),before=old.E.config.wardrobeQuests.find(q=>q.id===id);
 assert.equal(q.region,region);assert.equal(q.mainId,before.mainId);assert.deepEqual(clone(q.outfits),clone(before.outfits));
 const gate=Number(q.mainId.slice(1));assert.equal(E.wardrobeQuestView(state(E,ctx.initial,gate-1),id).ready,false,'chapter gate preserved');
 let s=state();const untouched=clone(s);s=E.action(s,'addWardrobeQuest',{id});const row=s.绘马板.绘马.find(x=>x.编号===id);assert.equal(row.地区,region);assert.equal(s.委托.编号,'');
 s=E.action(s,'acceptEma',{id});assert.equal(s.委托.地区,region);assert.equal(s.地图.当前地区,untouched.地图.当前地区,'accepting must not teleport');
 for(const [stage,type] of [['查访','查访'],['商议','商议'],['行动','行动'],['收束','结案']]){const n=clone(s);n.委托.阶段=stage;if(stage==='收束'){n.委托.结果='实际完成当事人同意的帮助';n.委托.结算档位='完整';}n.记录.事件.push({编号:'E'+(s.记录.事件.length+1),类型:type,摘要:'实际发生的支线进展',对象:id,来源:'正文',方式:'',资源:'无',数量:0,耗力:0,天数:0});s=E.validate(n,s);}
 for(const o of q.outfits)assert(s.衣橱.已解锁.some(x=>x.角色===o.actor&&x.衣装===o.id));
}
// Existing saves retain actual locations, history, pending rewards and snapshots.
for(const id of ['WQ01','WQ02','WQ03','WQ05','WQ07']){let s=old.E.action(state(old.E,old.initial),'addWardrobeQuest',{id});s=old.E.action(s,'acceptEma',{id});s=old.E.action(s,'pauseEma',{id});const snapshot=clone(s.记录.暂停委托);const normalized=E.normalizeLegacyState(s);assert.deepEqual(clone(normalized.state),clone(s));let resumed=E.action(normalized.state,'resumeEma',{id});assert.equal(resumed.委托.地区,snapshot[0].快照.地区);assert.deepEqual(clone(s.记录.暂停委托),snapshot);}
const card=JSON.parse(read('releases/'+version+'/card-source.json')),base=JSON.parse(read('releases/1.48.2/card-source.json'));
const entry=(c,id)=>c.data.character_book.entries.find(e=>e.id===id);
const catalog=c=>JSON.parse(entry(c,57).content.match(/var wardrobeQuestCatalog=(.*);/)[1]);
assert.deepEqual(catalog(card),clone(E.config.wardrobeQuests));
const restored=clone(card);restored.character_version=base.character_version;restored.data.character_version=base.data.character_version;restored.data.character_book.description=base.data.character_book.description;entry(restored,57).content=entry(base,57).content;assert.deepEqual(restored,base,'all other card prose, Ema, rules, regex and opening bytes retained');
// Runtime code and state shape are byte-identical apart from config and version.
const normalize=s=>s.replace(/^const ShrineConfig = .*;$/m,'CONFIG').replace(/^const version = .*;$/m,'VERSION');assert.equal(normalize(source('mvu')),normalize(oldSource('mvu')));
for(const name of ['panels','scene','tomoe'])assert.deepEqual(manifest.modules.find(x=>x.module_id===name),prior.modules.find(x=>x.module_id===name));
const game=source('minigames'),oldGame=oldSource('minigames');const gameBody=s=>s.slice(0,s.indexOf('function createMikageActivities')).replace(/^const version = .*;$/m,'VERSION').replace(/^const GAME_CSS = .*;$/m,'CSS');assert.equal(gameBody(game),gameBody(oldGame),'all ten game models and renderers unchanged');
const css=s=>JSON.parse(s.match(/^const GAME_CSS = (.*);$/m)[1]);assert(css(game).startsWith(css(oldGame)),'all adopted styles retained');assert(css(game).slice(css(oldGame).length).includes('Mikage Memory Serif'));
for(const e of JSON.parse(read('releases/1.48.2/copy-edits.json'))){const names=['minigames','panels','scene'];assert(names.some(n=>source(n).includes(e.new)),'approved text lost: '+e.id);}
const active=JSON.parse(game.match(/const ACTIVE_MEMORY_IDS=(.*);/)[1]);assert.equal(active.length,10);const rows=[...game.matchAll(/if\(region==='(R\d+)'\)return mount[^\n]+?saveMemories\('[^']+',result.detail,\['([^']+)'\]/g)];assert.equal(rows.length,10);assert.deepEqual(rows.map(r=>r[2]),active);assert(game.includes("{at:10,title:'灯火收摊后'"));
console.log('PASS 8 quest routes/gates/full closures; old paused saves resume without teleport or rewrite; runtime logic and 77 approved edits preserved; 10 reachable collection milestones');
