const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ejs=require('/tmp/mikage-debug/node_modules/ejs'),root=path.resolve(__dirname,'..'),release=process.argv[2]||'1.49.21',legacy=process.argv.includes('--expect-legacy-replay');
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p)),clone=x=>JSON.parse(JSON.stringify(x));
const card=json(root+'/releases/'+release+'/card-source.json'),base=json(root+'/releases/1.49.20/card-source.json'),spec=json(root+'/releases/'+release+'/manifest.json');
const entry=(c,id)=>c.data.character_book.entries.find(e=>e.id===id).content;
const mvu=read(path.resolve(root,'..',spec.modules.find(x=>x.module_id==='mvu').path)),initial=JSON.parse(mvu.match(/const ShrineInitial = (.*);/)[1]);
function add(s,summary){const id='E'+(s.记录.事件.length+1);s.记录.事件.push({编号:id,类型:'日常',摘要:'已发生的事实'});s.记录.共同经历.push({编号:id,摘要:summary});return id;}
function state(){const s=clone(initial);for(const f of ['能力','照顾','担忧','修复'])add(s,'【相处·'+f+'】RT-'+f+'：已记事实，尚有未决事项。');
 for(const [actor,id]of [['player','daily'],['tomoe','usual'],['tomoe','school']]){for(const suffix of ['first','middle','last'])add(s,'【衣装记忆·'+actor+'·'+id+'】OM-'+actor+'-'+id+'-'+suffix);}
 for(const tag of ['听雨','修灯','赏月'])add(s,'【日常片刻·'+tag+'】QM-'+tag+'：实际一起度过的片刻。');return s;}
function render(s,user='',options={}){const frozen=JSON.stringify(s),snapshots=options.snapshots||{20:s},saved=JSON.stringify(snapshots);let reads=0,chatReads=0;const outputs={};
 for(const id of [64,71,73]){const locals={runType:options.runType||'generate',lastMessageId:20,getvar:(name,opt)=>{reads++;return clone(opt.withMsg.role?s:(snapshots[opt.withMsg.id]||{}));}};
 if(options.helper!=='missing')locals.getChatMessage=(offset,role)=>{chatReads++;assert.equal(offset,-1);assert.equal(role,'user');if(options.helper==='throw')throw Error('optional reader failed');return options.helper==='wrong-type'?{message:user}:user;};
 outputs[id]=ejs.render(entry(options.card||card,id),locals).trim();}
 assert.equal(JSON.stringify(s),frozen);assert.equal(JSON.stringify(snapshots),saved);assert(chatReads<=3);return {outputs,reads,chatReads};}
const all=r=>Object.values(r.outputs).join('\n'),s=state(),unrelated=render(s,'先核对这份奉纳账目。');
if(legacy){for(const [id,marker]of [[64,'RT-'],[71,'OM-'],[73,'QM-']])assert(unrelated.outputs[id].includes(marker));console.log('PASS legacy: unrelated ledger turn still replays relationship, outfit and quiet memories; fragment characters='+all(unrelated).length);process.exit(0);}
assert(Object.values(unrelated.outputs).every(x=>x===''));
for(const text of ['先查参道修复进度和祭典分工。','把今天的奉纳流水核对一下。','看看衣柜当前穿着。'])assert(Object.values(render(s,text).outputs).every(x=>x===''),text);
let out=render(s,'说说你以前怎么看我的能力和分工。').outputs[64];assert(out.includes('RT-能力'));for(const f of ['照顾','担忧','修复'])assert(!out.includes('RT-'+f));
out=render(s,'聊聊我们之间的相处。').outputs[64];assert.equal((out.match(/RT-/g)||[]).length,2);assert(out.includes('RT-担忧')&&out.includes('RT-修复'));
const updated=state();add(updated,'【相处·能力】RT-新能力：这一次才采纳了分工。');out=render(updated,'你的信任与我的能力呢？').outputs[64];assert(out.includes('RT-新能力'));assert(!out.includes('RT-能力：'));
const none=clone(initial);out=render(none,'我们之间的相处呢？').outputs[64];assert(out.includes('可核验相处记录'));assert(!out.includes('RT-'));
out=render(s,'还记得我们这套衣服以前的故事吗？').outputs[71];assert(out.includes('OM-player-daily-first'));assert(out.includes('OM-player-daily-last'));assert(out.includes('OM-tomoe-usual-first'));assert(!out.includes('middle'));assert(!out.includes('OM-tomoe-school'));
out=render(s,'还记得巴卫的樱坂薄暮那套衣服第一次穿过的事吗？').outputs[71];assert(out.includes('OM-tomoe-school-first'));assert(!out.includes('OM-tomoe-school-last'));assert(!out.includes('OM-tomoe-usual'));assert(!out.includes('OM-player'));assert(!out.includes('角色／当前外观'));
assert.equal(render(s,'你换了件衣服。').outputs[71],'','appearance alone must not replay memories');
const named=state();add(named,'【衣装命名·tomoe·school】'+JSON.stringify('旧日薄暮'));out=render(named,'巴卫的旧日薄暮这套衣服叫什么纪念名？').outputs[71];assert(out.includes('旧日薄暮'));assert(!out.includes('OM-'));
const variant=clone(s);variant.巴卫.服装='school-human';out=render(variant,'还记得你这套衣服以前的事吗？').outputs[71];assert(out.includes('OM-tomoe-school-first'));assert(!out.includes('OM-player'));
const recent=state();add(recent,'【衣装回提·tomoe·usual】已实际聊过');out=render(recent,'还记得你这套衣服以前的事吗？').outputs[71];assert(out.includes('最近三条事件内已经回提'));
out=render(s,'今天只想安静喝茶。').outputs[73];assert(out.includes('平静日常'));assert(!out.includes('QM-'));
out=render(s,'还记得那次听雨吗？').outputs[73];assert(out.includes('QM-听雨'));assert(!out.includes('QM-赏月'));assert(!out.includes('QM-修灯'));
out=render(s,'说说以前的日常片刻。').outputs[73];assert.equal((out.match(/QM-/g)||[]).length,2);
const older=state();for(let i=0;i<20;i++)add(older,'【日常片刻·新片刻'+i+'】QM-new-'+i);out=render(older,'还记得那次听雨吗？').outputs[73];assert(out.includes('QM-听雨'));assert(!out.includes('QM-new'));
out=render(older,'还记得新片刻10吗？').outputs[73];assert(out.includes('QM-new-10'));assert.equal((out.match(/已记录小片刻：/g)||[]).length,1);
for(const [id,text]of [[64,'先别提相处旧事了，核对账目。'],[64,'不想聊我们之间的往事。'],[71,'衣服先放一边，先看账目。'],[71,'别提衣服以前的回忆。'],[73,'先别聊旧事了，只想喝茶。'],[73,'回忆先搁下，今天休息。']])assert.equal(render(s,text).outputs[id],'',text);
const orphan=state();orphan.记录.共同经历.push({编号:'missing',摘要:'【相处·能力】FAKE-REL'},{编号:'missing',摘要:'【衣装记忆·tomoe·usual】FAKE-OUTFIT'},{编号:'missing',摘要:'【日常片刻·听雨】FAKE-QUIET'});assert(!all(render(orphan,'相处能力、你这套衣服以前的回忆和那次听雨。')).includes('FAKE'));
const unsafe=clone(initial);add(unsafe,'【相处·能力】<script>REL&');add(unsafe,'【衣装记忆·tomoe·usual】<script>OUTFIT&');add(unsafe,'【日常片刻·听雨】<script>QUIET&');out=all(render(unsafe,'记得那次听雨、你这套衣服以前的回忆与我的能力吗？'));assert(!out.includes('<script>'));assert(out.includes('&lt;script&gt;')&&out.includes('&amp;'));
const newFloor=state();add(newFloor,'【相处·能力】LATEST-FLOOR');out=render(s,'说说我的能力。',{snapshots:{20:{},19:newFloor,18:s}}).outputs[64];assert(out.includes('LATEST-FLOOR'));assert(!out.includes('RT-能力：'));
for(const helper of ['missing','throw','wrong-type'])assert(Object.values(render(s,'还记得我们的相处、这套衣服以前的回忆和那次听雨吗？',{helper}).outputs).every(x=>x===''));
for(const runType of ['display','other']){const r=render(s,'以前的日常和衣服回忆',{runType});assert.equal(all(r).trim(),'');assert.equal(r.reads,0);assert.equal(r.chatReads,0);}
assert.equal(all(render({},'核对账目。')).trim(),'');
for(const [id,file]of [[64,'relationship-facts.ejs'],[71,'outfit-facts.ejs'],[73,'quiet-facts.ejs']])assert.equal(entry(card,id),read(root+'/releases/1.49.21/'+file));
const before=all(render(s,'先核对这份奉纳账目。',{card:base})).length,after=all(unrelated).trim().length;
console.log('PASS topic/facet/named historical outfit+quiet, alias/private name/first/latest/deferral, event validation, escaping/latest floor/helper fallback/display mode/no writes; ledger fragments '+before+' -> '+after+' chars (three entries only, not total prompt/tokens)');
