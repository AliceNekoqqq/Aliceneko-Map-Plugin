const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dir=root+'/releases/1.49.8',read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p)),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const base=json(root+'/releases/1.49.7/card-source.json'),card=json(dir+'/card-source.json'),before=json(root+'/releases/1.49.7/manifest.json'),spec=json(dir+'/manifest.json'),edits=json(dir+'/changes.json');
const get=(c,id)=>c.data.character_book.entries.find(e=>e.id===id),replay=structuredClone(base),inner=(c,id,tag)=>get(c,id).content.match(new RegExp('<'+tag+'>\\n([\\s\\S]*?)\\n</'+tag+'>'))[1];
for(const op of edits.operations){const e=get(replay,op.entry_id);assert.equal(e.content.split(op.old).length-1,1);e.content=e.content.replace(op.old,op.new);}
replay.character_version=replay.data.character_version='1.49.8';replay.data.character_book.description=replay.data.character_book.description.replace('v1.49.7','v1.49.8');assert.deepEqual(replay,card);
assert.deepEqual(spec.modules,before.modules);for(const m of spec.modules)assert.equal(sha(fs.readFileSync(path.resolve(root,'..',m.path))),m.sha256);
assert.equal(sha(read(dir+'/card-source.json')),spec.source_sha256);assert.equal(sha(JSON.stringify(card.data.character_book.entries,null,2)+'\n'),spec.bound_worldbook.entry_sha256);
assert.deepEqual(card.data.character_book.entries.filter(e=>e.content!==get(base,e.id).content).map(e=>e.id),[7,37,59,49,77]);
for(const e of card.data.character_book.entries){const old=get(base,e.id);assert.deepEqual({...e,content:''},{...old,content:''});assert.deepEqual(e.content.match(/<%[\s\S]*?%>/g),old.content.match(/<%[\s\S]*?%>/g));assert.deepEqual(e.content.match(/<\/?[A-Za-z_][A-Za-z_0-9]*>/g),old.content.match(/<\/?[A-Za-z_][A-Za-z_0-9]*>/g));}
for(const id of [1,0,55,5,17,56,84])assert.deepEqual(get(card,id),get(base,id));
for(const tag of ['outfit_unlocks_and_presentation','outfit_memories'])assert.equal(inner(card,49,tag),inner(base,49,tag));
const child=inner(card,49,'child_form_boundaries');for(const term of ['主动选择','chibi','儿童','非恋爱','非性化','对方愿意','拒绝时收手','实际年龄','人格','已有记忆'])assert(child.includes(term),term);
const ghost=get(card,37).content;for(const term of ['第三阶段','玩家兴趣','自愿','倾听','陪同','暂缓或拒绝','保持神社与关系状态','幽灵身份','既有记忆'])assert(ghost.includes(term),term);
const book=get(card,59).content;for(const term of ['以本人提供为准','现实回忆与虚构旧物短篇分别叙述','10种','3、7、10','当前设备','本地存储'])assert(book.includes(term),term);
assert.equal((book.match(/本人提供为准/g)||[]).length,1);assert(!book.includes('不得推断'));assert(!ghost.includes('不可替代:'));assert(!child.includes('强行喂食'));assert(!child.includes('下流'));
console.log('PASS 10 exact prose operations across five entries; all EJS, metadata, runtime pins, protocol, memory/wardrobe settlement and unchanged card fields; child/consent/identity/ghost/source-of-personal-facts semantics');
process.env.MIKAGE_SHOP_RELEASE='1.49.8';const {state}=require('./moonforest-shop.test.cjs'),ejs=require('/tmp/mikage-debug/node_modules/ejs');
for(const outfit of ['chibi','school-human','usual']){const s=state();s.巴卫.服装=outfit;const old=JSON.stringify(s),out=ejs.render(get(card,77).content,{runType:'generate',getvar:()=>s,lastMessageId:0});assert.equal(JSON.stringify(s),old);if(outfit==='chibi'){for(const term of ['幼狐儿童外观','非恋爱','非性化','对方愿意','拒绝时收手'])assert(out.includes(term));assert(!out.includes('当前造型为成年男子人形'));}else{assert(!out.includes('幼狐儿童外观'));if(outfit==='school-human'){assert(out.includes('狐耳与狐尾隐藏'));assert(!out.includes('当前显露狐妖本体法相'));}else assert(out.includes('当前显露狐妖本体法相'));}}
console.log('PASS actual chibi/adult-human/adult-fox EJS rendered branches, no child/adult scope leak and no state writes; 11 template missing/display/generate checks included');
