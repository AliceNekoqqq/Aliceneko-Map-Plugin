const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dir=root+'/releases/1.49.7',read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p)),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const base=json(root+'/releases/1.49.6/card-source.json'),card=json(dir+'/card-source.json'),spec=json(dir+'/manifest.json'),previous=json(root+'/releases/1.49.6/manifest.json'),changes=json(dir+'/changes.json');
const get=(c,id)=>c.data.character_book.entries.find(e=>e.id===id),restored=structuredClone(card);
assert.equal(changes.reviewed_entries.length,39);assert.equal(new Set(changes.reviewed_entries.map(e=>e.id)).size,39);
for(const op of [...changes.operations].reverse()){
 const target=op.entry_id===undefined?restored.data:get(restored,op.entry_id),key=op.entry_id===undefined?op.field:'content';
 // A removed sentence leaves no unique new anchor; undo through forward replay below.
 if(op.new){assert(target[key].includes(op.new));}
}
const replay=structuredClone(base);
for(const op of changes.operations){const target=op.entry_id===undefined?replay.data:get(replay,op.entry_id),key=op.entry_id===undefined?op.field:'content';assert.equal(target[key].split(op.old).length-1,1);target[key]=target[key].replace(op.old,op.new);}
replay.character_version=replay.data.character_version='1.49.7';replay.data.character_book.description=replay.data.character_book.description.replace('v1.49.6','v1.49.7');assert.deepEqual(replay,card,'all changes are explicit reviewed prose operations');
for(const e of card.data.character_book.entries){
 const old=get(base,e.id);assert.deepEqual({...e,content:''},{...old,content:''});
 for(const re of [/<%[\s\S]*?%>/g,/<\/?[A-Za-z_][A-Za-z_0-9]*>/g,/【固定规则，不参与润色】[^\n]*/g])assert.deepEqual(e.content.match(re),old.content.match(re),'protected template/tag/constraint '+e.id);
}
const inner=(c,id,tag)=>get(c,id).content.match(new RegExp('<'+tag+'>\\n([\\s\\S]*?)\\n</'+tag+'>'))[1];
for(const [id,tags]of [[5,['material_boundaries','current_state_priority','relationship_memory_constraints']],[41,['divine_seal_and_contract']],[11,['life_interaction_settlement','life_shop_packages','production_income','production_batches']],[49,['outfit_unlocks_and_presentation','current_appearance_limits','child_form_boundaries','costume_only_boundaries']],[52,['festival_completion_and_events']]])for(const tag of tags)assert.equal(inner(card,id,tag),inner(base,id,tag),id+'/'+tag);
for(const id of [1,4,57,64,67,69,71,73,76,77,0,55,58,83,84])assert.deepEqual(get(card,id),get(base,id));
const changedIds=card.data.character_book.entries.filter(e=>e.content!==get(base,e.id).content).map(e=>e.id);assert.deepEqual(changedIds,spec.prose_review.changed_entries);assert.equal(changedIds.length,24);
assert.equal(sha(read(dir+'/card-source.json')),spec.source_sha256);assert.equal(spec.bound_worldbook.version,'1.49.7');assert.equal(sha(JSON.stringify(card.data.character_book.entries,null,2)+'\n'),spec.bound_worldbook.entry_sha256);
const moduleText=(s,id)=>read(path.resolve(root,'..',s.modules.find(m=>m.module_id===id).path));
for(const m of spec.modules){assert.equal(sha(read(path.resolve(root,'..',m.path))),m.sha256);if(m.module_id!=='panels')assert.deepEqual(m,previous.modules.find(x=>x.module_id===m.module_id));}
const beforePanel=moduleText(previous,'panels'),afterPanel=moduleText(spec,'panels'),promptRE=/const MikageQuestPrompt=("(?:[^"\\]|\\.)*");/,htmlRE=/const MikagePanelHTML=("(?:[^"\\]|\\.)*");/;
const oldPrompt=beforePanel.match(promptRE),newPrompt=afterPanel.match(promptRE);assert.equal(JSON.parse(newPrompt[1]),get(card,56).content);assert.equal(JSON.parse(oldPrompt[1]),get(base,56).content);
assert.equal(afterPanel.replace(newPrompt[0],oldPrompt[0]).replace("const version = '1.49.7';","const version = '1.49.6';"),beforePanel,'only prompt literal/version changed in actual panel module');assert.equal(afterPanel.match(htmlRE)[1],beforePanel.match(htmlRE)[1]);
const example=c=>JSON.parse(get(c,56).content.slice(get(c,56).content.lastIndexOf('\n{'))),shape=v=>Array.isArray(v)?[shape(v[0])]:v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,shape(x)])):typeof v;
assert.deepEqual(shape(example(card)),shape(example(base)));
const technicalLines=s=>s.split('\n').filter(l=>l.startsWith('【后台执行规则')||l.startsWith('|S')||l.startsWith('- S')||l.startsWith('本章普通委托结案门槛')||l.startsWith('每次刷新只补空位'));
assert.deepEqual(technicalLines(get(card,56).content),technicalLines(get(base,56).content));
assert.equal(card.data.mes_example.split('<START>').length-1,6);assert(card.data.mes_example.includes('四份木材、两份石材'));const last=card.data.mes_example.split('<START>').at(-1);assert(last.includes('弹珠'));assert(last.includes('千代'));assert(!/鞍马|黑毛|扔进后山/.test(last));
for(const bad of ['不是冷冰冰的地图','绝非围着女主团团转的挂件','和解的讯号从来不是','绝非毫无瑕疵的说教神像','神职可有可无，唯有','一袭衣衫，一段岁月','绝非枯燥的搬砖','世间安得双全法','必然引来巴卫打翻醋坛'])assert(!card.data.character_book.entries.filter(e=>e.enabled||e.id===56).some(e=>e.content.includes(bad)),bad);
console.log('PASS 39-entry review, explicit reviewed prose operations, 24 changed bodies/six examples, protected EJS/tags/fixed constraints/technical rules/schema shape and all untouched fields; exact panel prompt/version inverse and HTML parity');
// Use the real MVU and all established wardrobe/prose/template checks through manifest resolution.
process.env.MIKAGE_SHOP_RELEASE='1.49.7';const {C,state}=require('./moonforest-shop.test.cjs'),ejs=require('/tmp/mikage-debug/node_modules/ejs');
for(const affinity of [0,19,20,39,40,59,60,79,80,100])for(const affection of [0,19,20,39,40,59,60,79,80,100])for(const confirmed of [false,true]){
 const s=state();s.关系.亲近=affinity;s.关系.心动=affection;s.关系.双方确认=confirmed;const data=JSON.stringify(s),out=ejs.render(get(card,17).content,{runType:'generate',getvar:()=>s,lastMessageId:0});
 assert.equal((out.match(/【亲近\d/g)||[]).length,1);assert.equal((out.match(/【心动\d/g)||[]).length,1);assert(out.includes(confirmed?'双方已经明确确认恋爱关系':'双方尚未确认恋爱关系'));assert.equal(JSON.stringify(s),data);
}
assert.equal(C.life.config.buyback.perDay,5);assert.equal(C.life.config.crops.find(c=>c.id==='herb').yield.herb,3);
console.log('PASS actual MVU remains 1.49.6; 200 relation boundary/confirmation combinations and generation/display/missing-state EJS; economy/pacing preserved by unchanged module hash');
