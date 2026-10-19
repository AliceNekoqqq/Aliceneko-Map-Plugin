const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),body=fs.readFileSync(path.join(root,'runtime/mvu.mjs'),'utf8').split('export function start() {\n')[1].split('// HOST_BOOTSTRAP:')[0];
const ctx=vm.createContext({console});vm.runInContext(body+';this.E=ShrineCard;this.initial=ShrineInitial',ctx);const E=ctx.E,clone=x=>JSON.parse(JSON.stringify(x));
if(process.env.MIKAGE_ZOD_MODULE){ctx.z=require(process.env.MIKAGE_ZOD_MODULE);const full=fs.readFileSync(path.join(root,'runtime/mvu.mjs'),'utf8');vm.runInContext(full.slice(full.indexOf('  const Schema = z.strictObject('),full.indexOf("  ShrineBootstrapState='ready';")),ctx);}
function state(count=2){const s=clone(ctx.initial);for(const f of ['鸟居','参道','拜殿','社务所','庭院'])s.神社[f]=4;s.主线.已完成=Array.from({length:count},(_,i)=>({编号:'M0'+(i+1)}));s.衣橱.已呈现=E.config.wardrobeRewards.filter(r=>!r.sideQuest&&s.主线.已完成.some(m=>m.编号===r.mainId)).map(r=>r.id);s.衣橱.待呈现=[];E.deriveProgress(s);return s;}
function event(s,type,object,summary='实际发生的支线进展'){return{编号:'E'+(s.记录.事件.length+1),类型:type,摘要:summary,对象:object,来源:'',方式:'',资源:'无',数量:0,耗力:0,天数:0};}
function advance(s,phase,type){const next=clone(s);next.委托.阶段=phase;if(phase==='收束'){next.委托.结果='经祈愿者同意完成帮助，制服已送达社务所妥存。';next.委托.结算档位='完整';}next.记录.事件.push(event(s,type,s.委托.编号));return E.validate(next,s);}
function finish(s,id){s=E.action(s,'addWardrobeQuest',{id});s=E.action(s,'acceptEma',{id});for(const [p,t]of [['查访','查访'],['商议','商议'],['行动','行动'],['收束','结案']])s=advance(s,p,t);return s;}
test('unavailable quest and locked outfits cannot be obtained',()=>{assert.throws(()=>E.action(state(0),'addWardrobeQuest',{id:'WQ01'}),/尚未开放/);assert.throws(()=>E.action(state(),'setOutfit',{actor:'tomoe',outfit:'school'}),/尚未解锁/);assert.throws(()=>E.action(state(),'addWardrobeQuest',{id:'unknown'}),/尚未开放/);});
test('wardrobe creates one fixed offer and never auto-accepts or duplicates',()=>{const s=E.action(state(),'addWardrobeQuest',{id:'WQ01'});assert.equal(s.委托.编号,'');assert.equal(s.绘马板.绘马.filter(x=>x.编号==='WQ01').length,1);assert.throws(()=>E.action(s,'addWardrobeQuest',{id:'WQ01'}),/已在绘马板/);assert(E.wardrobeQuestView(s,'WQ01').ready);});
test('school quest unlocks both uniforms and human variant once; presentation is tracked',()=>{let s=finish(state(),'WQ01');assert.equal(s.主线.已完成.length,2);for(const [actor,id]of [['player','school'],['tomoe','school'],['tomoe','school-human']])assert(s.衣橱.已解锁.some(x=>x.角色===actor&&x.衣装===id));assert(s.衣橱.待呈现.includes('UW-SCHOOL'));let n=clone(s);const e=event(s,'解锁呈现','UW-SCHOOL','JK和DK送到社务所供挑选');e.来源='正文';n.记录.事件.push(e);s=E.validate(n,s);assert(s.衣橱.已呈现.includes('UW-SCHOOL'));assert(!s.衣橱.待呈现.includes('UW-SCHOOL'));s=E.action(s,'setOutfit',{actor:'tomoe',outfit:'school-human'});assert.equal(s.巴卫.服装,'school-human');assert.throws(()=>E.action(s,'addWardrobeQuest',{id:'WQ01'}),/已完成/);assert(E.checkFields(s)===undefined);});
test('side quest survives main-stage change, can be dismissed/readded, paused and resumed',()=>{let s=E.action(state(),'addWardrobeQuest',{id:'WQ01'});s=E.action(s,'dismissEma',{id:'WQ01'});s=E.action(s,'addWardrobeQuest',{id:'WQ01'});assert.equal(s.绘马板.绘马.filter(x=>x.编号==='WQ01').length,1);s.主线.已完成.push({编号:'M03'});s.衣橱.已呈现.push('U04');E.deriveProgress(s);assert(s.绘马板.绘马.some(x=>x.编号==='WQ01'));s=E.action(s,'acceptEma',{id:'WQ01'});s=E.action(s,'pauseEma',{id:'WQ01'});assert.equal(E.wardrobeQuestView(s,'WQ01').status,'暂停');s=E.action(s,'resumeEma',{id:'WQ01'});assert.equal(s.委托.编号,'WQ01');});
test('all three Tomoe side quests award the intended outfit with no loss of existing clothes',()=>{for(const [id,outfit]of [['WQ02','yako'],['WQ03','city'],['WQ04','winter']]){const s=finish(state(3),id);assert(s.衣橱.已解锁.some(x=>x.角色==='tomoe'&&x.衣装===outfit));assert(s.衣橱.已解锁.some(x=>x.衣装==='aoba'));E.validate(clone(s),s);}});
test('full board rejects addition and previous save is unchanged',()=>{let s=state(),before=JSON.stringify(s);s=E.action(s,'addWardrobeQuest',{id:'WQ01'});assert.equal(JSON.stringify(state()),before);s=E.action(s,'addWardrobeQuest',{id:'WQ03'});const template=clone(s.绘马板.绘马[0]);template.编号='TEST-FULL';template.材料档=4;s.绘马板.绘马.push(template);s.主线.已完成.push({编号:'M03'});s.衣橱.已呈现.push('U04');E.deriveProgress(s);assert.throws(()=>E.action(s,'addWardrobeQuest',{id:'WQ04'}),/已满/);});
test('ordinary side quest supports same-reply delivery while rejecting premature reward claims',()=>{let s=E.action(state(),'addWardrobeQuest',{id:'WQ01'});let premature=clone(s),claim=event(s,'解锁呈现','UW-SCHOOL');claim.来源='正文';premature.记录.事件.push(claim);assert.throws(()=>E.validate(premature,s),/不待呈现/);s=E.action(s,'acceptEma',{id:'WQ01'});for(const [p,t]of [['查访','查访'],['商议','商议'],['行动','行动']])s=advance(s,p,t);const n=clone(s);n.委托.阶段='收束';n.委托.结果='邀请已按意愿处理，校服送达社务所供挑选';n.委托.结算档位='完整';const end=event(s,'结案','WQ01');n.记录.事件.push(end);const delivered=event(n,'解锁呈现','UW-SCHOOL','JK与DK已送至社务所');delivered.来源='正文';n.记录.事件.push(delivered);const done=E.validate(n,s);assert(done.衣橱.已呈现.includes('UW-SCHOOL'));assert(!done.衣橱.待呈现.includes('UW-SCHOOL'));});

test('v1.29 wardrobe quests unlock all eight new outfits only after sidequest closure',()=>{
  const cases=[
    ['WQ05',2,'UW-CULTURE',[['player','gym'],['tomoe','butler']]],
    ['WQ06',4,'UW-KAGURA',[['player','kagura'],['tomoe','kariginu']]],
    ['WQ07',3,'UW-ANCIENT',[['player','heian-travel'],['tomoe','chibi']]],
    ['WQ08',5,'UW-WEDDING',[['player','shiromuku'],['tomoe','wedding']]],
  ];
  for(const [quest,mainCount,reward,outfits] of cases){
    const done=finish(state(mainCount),quest);
    for(const [actor,outfit] of outfits)assert(done.衣橱.已解锁.some(x=>x.角色===actor&&x.衣装===outfit),`${quest} did not unlock ${actor}:${outfit}`);
    assert(done.衣橱.待呈现.includes(reward),`${quest} reward is not pending presentation`);
    assert(!done.衣橱.已呈现.includes(reward),`${quest} was presented without a正文 event`);
    assert(done.衣橱.已解锁.some(x=>x.角色==='tomoe'&&x.衣装==='aoba'),'existing rewards changed');
    assert(E.checkFields(done)===undefined);
  }
});

test('main quest completion alone does not unlock any of the new outfits',()=>{
  for(const [mainCount,actor,outfit] of [[2,'tomoe','butler'],[4,'player','kagura'],[3,'tomoe','chibi'],[5,'tomoe','wedding']]){
    const s=state(mainCount);
    assert(!s.衣橱.已解锁.some(x=>x.角色===actor&&x.衣装===outfit));
    assert.throws(()=>E.action(s,'setOutfit',{actor,outfit}),/尚未解锁/);
  }
});
