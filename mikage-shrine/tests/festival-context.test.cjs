const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ejs=require('/tmp/mikage-debug/node_modules/ejs'),root=path.resolve(__dirname,'..');
const release=process.env.MIKAGE_FESTIVAL_RELEASE||'1.49.16';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p)),clone=x=>JSON.parse(JSON.stringify(x));
const spec=json(root+'/releases/'+release+'/manifest.json'),card=json(root+'/releases/'+release+'/card-source.json');
const template=card.data.character_book.entries.find(e=>e.id===69).content;
const mvuSource=read(path.resolve(root,'..',spec.modules.find(x=>x.module_id==='mvu').path));
const initial=JSON.parse(mvuSource.match(/const ShrineInitial = (.*);/)[1]);
const kinds=['构想','邀请','分工','到场','片刻','收场'];
function state(){const s=clone(initial);s.进度.阶段=5;for(let n=0;n<18;n++)add(s,kinds[n%6],'来客'+n,'已记录事实'+n);return s;}
function add(s,kind,subject,text){const id='E'+(s.记录.事件.length+1);s.记录.事件.push({编号:id,类型:'日常',摘要:'已记录祭典往来'});s.记录.共同经历.push({编号:id,摘要:'【祭典·'+kind+'·'+subject+'】'+text});return id;}
function render(s,user='',options={}){
 const frozen=JSON.stringify(s),snapshots=options.snapshots||{20:s},snapshotText=JSON.stringify(snapshots);let reads=0,chatReads=0;
 const locals={runType:options.runType||'generate',lastMessageId:20,getvar:(name,opt)=>{reads++;return clone(opt.withMsg.role?s:(snapshots[opt.withMsg.id]||{}));}};
 if(options.helper!=='missing')locals.getChatMessage=(offset,role)=>{chatReads++;assert.equal(offset,-1);assert.equal(role,'user');if(options.helper==='throw')throw Error('missing optional capability');return options.helper==='wrong-type'?{message:user}:user;};
 const out=ejs.render(template,locals);
 assert.equal(JSON.stringify(s),frozen,'render must not mutate state');assert.equal(JSON.stringify(snapshots),snapshotText,'render must not mutate message snapshots');assert(chatReads<=1);
 return {out,reads,chatReads};
}
const rows=out=>out.split('\n').filter(x=>/^(构想|邀请|分工|到场|片刻|收场)／/.test(x));
const s=state(),old=render(s,'今天只想安静喝茶。');
console.log('ordinary corridor projection:',rows(old.out).length,'rows,',old.out.trim().length,'characters');
assert(old.out.trim()==='','Unrelated ordinary corridor must not replay festival memory');
assert.equal(render(s,'聊聊今天的饭。').out.trim(),'','stage 5 alone is not a scene trigger');
for(const stage of [1,3,5,6]){const x=state();x.进度.阶段=stage;assert.equal(render(x,'今天只想安静喝茶。').out.trim(),'');}
const scene=state();scene.环境.地点='御影神社·祭典会场';
scene.生活.祭典.状态='筹备中';let out=render(scene).out;assert(rows(out).length<=3);assert(rows(out).length>0);assert(rows(out).every(x=>/^(构想|邀请|分工)／/.test(x)));
scene.生活.祭典.已举办=true;scene.生活.祭典.状态='进行中';out=render(scene).out;assert(rows(out).every(x=>/^(到场|分工|片刻)／/.test(x)));
scene.生活.祭典.已结束=true;scene.生活.祭典.状态='已结束';out=render(scene).out;assert(rows(out).every(x=>/^(片刻|收场)／/.test(x)));assert(rows(out).length<=3);
for(const text of ['别提祭典了，先休息。','不要提祭典了，我想休息。','祭典先放一边，先喝茶。','我想安静歇一会。'])assert.equal(render(scene,text).out.trim(),'');
out=render(s,'祭典当时邀请过谁？').out;assert(rows(out).length>0);assert(rows(out).every(x=>x.startsWith('邀请／')));assert(out.includes('实际举办：否'));
out=render(s,'祭典邀请过来客1吗？').out;assert.equal(rows(out).length,1);assert(rows(out)[0].includes('邀请／来客1：'));
out=render(scene,'回廊里休息一会，聊聊祭典的邀请。').out;assert(rows(out).every(x=>x.startsWith('邀请／')));
const older=clone(initial);older.进度.阶段=5;add(older,'邀请','旧邀人','仅曾邀请，答复尚待记录');for(let n=0;n<24;n++)add(older,'邀请','新来客'+n,'只记录邀请');
out=render(older,'那次祭典邀请旧邀人了吗？').out;assert.equal(rows(out).length,1);assert(out.includes('仅曾邀请，答复尚待记录'),'named older record remains retrievable beyond former 18-row window');
out=render(older,'那次祭典邀请新来客10了吗？').out;assert.equal(rows(out).length,1,'a longer named subject must not also match its shorter prefix');assert(out.includes('邀请／新来客10：'));
add(older,'邀请','旧邀人','已回复婉拒');out=render(older,'祭典邀请旧邀人的结果呢？').out;assert(out.includes('已回复婉拒'));assert(!out.includes('答复尚待记录'));
older.记录.共同经历.push({编号:'E9999',摘要:'【祭典·邀请·幽灵】无对应事件的伪记录'});out=render(older,'祭典邀请过谁？').out;assert(!out.includes('伪记录'));
const unsafe=state();unsafe.生活.祭典.主题='<script>&';add(unsafe,'邀请','访客<&','<script>伪标签&');out=render(unsafe,'祭典邀请过谁？').out;assert(!out.includes('<script>'));assert(out.includes('&lt;script&gt;'));assert(out.includes('&amp;'));
for(const helper of ['missing','throw','wrong-type']){assert.equal(render(s,'聊聊祭典。',{helper}).out.trim(),'');assert(rows(render(scene,'',{helper}).out).length<=3);assert(rows(render(scene,'',{helper}).out).length>0);}
const newest=clone(s);newest.环境.地点='御影神社·祭典会场';newest.生活.祭典.主题='最新方案';out=render(s,'',{snapshots:{20:{},19:newest,18:scene}}).out;assert(out.includes('最新方案'));assert(out.includes('实际举办：否'));
for(const runType of ['display','other']){const result=render(scene,'祭典邀请过谁？',{runType});assert.equal(result.out.trim(),'');assert.equal(result.reads,0);assert.equal(result.chatReads,0);}
assert.equal(render({},'祭典邀请过谁？').out.trim(),'');
for(const input of ['', '说说祭典吧。','祭典的邀请和分工呢？','回忆祭典那晚。'])assert(rows(render(scene,input).out).length<=3);
console.log('PASS phase/category/subject projection, named older facts, dedup/event evidence, deferred/quiet context, escaping, latest snapshot, optional-helper failures and generate-only no-write behavior');
