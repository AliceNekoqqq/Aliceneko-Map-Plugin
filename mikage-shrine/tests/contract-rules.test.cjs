const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dir=root+'/releases/1.49.9',read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p)),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const base=json(root+'/releases/1.49.8/card-source.json'),card=json(dir+'/card-source.json'),before=json(root+'/releases/1.49.8/manifest.json'),spec=json(dir+'/manifest.json'),edits=json(dir+'/changes.json');
const get=(c,id)=>c.data.character_book.entries.find(e=>e.id===id),replay=structuredClone(base);
for(const op of edits.operations){const e=get(replay,op.entry_id);assert.equal(e.content.split(op.old).length-1,1);e.content=e.content.replace(op.old,op.new);}
replay.character_version=replay.data.character_version='1.49.9';replay.data.character_book.description=replay.data.character_book.description.replace('v1.49.8','v1.49.9');assert.deepEqual(replay,card);
assert.deepEqual(spec.modules,before.modules);for(const m of spec.modules)assert.equal(sha(fs.readFileSync(path.resolve(root,'..',m.path))),m.sha256);
assert.equal(sha(read(dir+'/card-source.json')),spec.source_sha256);assert.equal(sha(JSON.stringify(card.data.character_book.entries,null,2)+'\n'),spec.bound_worldbook.entry_sha256);
assert.deepEqual(card.data.character_book.entries.filter(e=>e.content!==get(base,e.id).content).map(e=>e.id),[5,41,1,17]);
for(const e of card.data.character_book.entries){const old=get(base,e.id);assert.deepEqual({...e,content:''},{...old,content:''});for(const re of [/<%[\s\S]*?%>/g,/<\/?[A-Za-z_][A-Za-z_0-9]*>/g])assert.deepEqual(e.content.match(re),old.content.match(re));}
for(const id of [0,49,55,56,77,84])assert.deepEqual(get(card,id),get(base,id));
// The sole changed fixed-rule line concerns romance versus compelled actions.
const fixed=c=>get(c,17).content.match(/【固定规则，不参与润色】[^\n]*/g);
assert.deepEqual(fixed(base).filter(x=>!x.includes('不以威胁、契约')),fixed(card).filter(x=>!x.includes('恋爱情意与交往确认')));
const protocol=get(card,1).content,contract=get(card,41).content,role=get(card,5).content;
for(const term of ['须以唇齿相触（口づけ）','危机、争执','情愿程度影响他的反应','身体仍须依令行动','一边执行一边怒斥或质问','主从关系','恋爱关系由双方另行确认'])assert(contract.includes(term),term);
assert(role.includes('巴卫即使尚不情愿'));assert(role.includes('玩家角色的主动行动与答复由玩家提供'));
assert(protocol.includes('实际完成与巴卫的口づけ缔约仪式、契约成立后设为true'));assert(protocol.includes('解除契约须有对应剧情事实'));
for(const term of ['实际同意并完成契约仪式','双方知悉其效力并明确选择后','双方意愿与仪式选择','契约不授予控制玩家的权力','缔约场景由双方明确选择推进'])assert(!card.data.character_book.entries.some(e=>e.content.includes(term)),term);
console.log('PASS guarded semantic changes, exact card replay, all unrelated fields, EJS, metadata and five executable modules unchanged');
process.env.MIKAGE_SHOP_RELEASE='1.49.9';const {C,initial,Schema,state}=require('./moonforest-shop.test.cjs'),ejs=require('/tmp/mikage-debug/node_modules/ejs');
assert.equal(initial.关系.神使契约,false);
// Actual state validator: a completed contract can coexist with zero affection and no romance confirmation.
const previous=state();previous.玩家.身份='土地神';const previousText=JSON.stringify(previous),next=structuredClone(previous);next.关系.神使契约=true;
assert.throws(()=>C.validate(next,previous),/关系变化需本轮关系或日常事件/);
next.记录.事件.push({编号:'E1',类型:'关系',摘要:'已具神职与神印的玩家在危机中与尚不情愿的巴卫完成口づけ，契约成立。',对象:'巴卫',来源:'当前剧情',方式:'口づけ缔约',资源:'无',数量:0,耗力:0,天数:0});
const committed=C.validate(next,previous);assert(Schema.safeParse(committed).success);assert.equal(committed.关系.神使契约,true);assert.equal(committed.关系.亲近,0);assert.equal(committed.关系.心动,0);assert.equal(committed.关系.双方确认,false);assert.equal(JSON.stringify(previous),previousText);
// Rendering the dynamic reader must distinguish contract/romance without mutating state.
let count=0;
for(const contract of [false,true])for(const near of [0,19,20,39,40,59,60,79,80,100])for(const heart of [0,19,20,39,40,59,60,79,80,100]){
 const s=state();s.关系.神使契约=contract;s.关系.亲近=near;s.关系.心动=heart;const old=JSON.stringify(s);
 const out=ejs.render(get(card,17).content,{runType:'generate',getvar:()=>s,lastMessageId:0});assert.equal(JSON.stringify(s),old);assert(out.includes(contract?'神使契约：已实际缔结':'神使契约：尚未实际缔结'));
 if(heart>=60&&heart<80){assert(out.includes('恋爱情意与交往确认依实际交流'));assert(out.includes('行动强制力按契约规则执行'));}
 count++;
}
console.log('PASS actual boolean schema/validator at zero affinity, romance independence and '+count+' dynamic relation boundary renders; this does not validate narrative truth or model performance');
