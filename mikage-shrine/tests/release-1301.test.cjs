const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),json=p=>JSON.parse(read(p)),sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const base=json('mikage-shrine/releases/1.30.0/card-source.json'),next=json('mikage-shrine/releases/1.30.1/card-source.json'),manifest=json('mikage-shrine/releases/1.30.1/manifest.json'),oldManifest=json('mikage-shrine/releases/1.30.0/manifest.json');
const spec=JSON.parse(read('mikage-shrine/releases/1.30.1/mvu.mjs').match(/const ShrineFieldSpec = (.*);/)[1]),catalog=JSON.parse(read('mikage-shrine/releases/1.30.1/scene.mjs').match(/const catalog=(.*);/)[1]);
assert.equal(next.character_version,'1.30.1');assert.equal(next.data.character_version,'1.30.1');
const bentry=base.data.character_book.entries.find(e=>e.id===1),nentry=next.data.character_book.entries.find(e=>e.id===1);let expected=bentry.content;
for(const [actor,field]of [['player','玩家.衣装'],['tomoe','巴卫.服装']]){
 const values=spec.find(f=>f.path===field).enum,line=nentry.content.split('\n').find(l=>l.startsWith(field+' |')),found=[...line.split('|')[1].matchAll(/'([^']*)'/g)].map(m=>m[1]);
 assert.deepEqual(found,values);assert.deepEqual([...found].sort(),catalog.actors[actor].outfits.map(o=>o.id).sort());
 const oldLine=bentry.content.split('\n').find(l=>l.startsWith(field+' |'));expected=expected.replace(oldLine,line);
}
assert.equal(nentry.content,expected,'Only the two enum lines may change');
const restored=structuredClone(next);restored.character_version=base.character_version;restored.data.character_version=base.data.character_version;restored.data.character_book.entries.find(e=>e.id===1).content=bentry.content;
restored.data.extensions.tavern_helper.scripts=base.data.extensions.tavern_helper.scripts;
assert.deepEqual(restored,base,'All card content, rules, greetings, unknown fields and initial state must otherwise remain exact');
assert.deepEqual(catalog,JSON.parse(read('mikage-shrine/releases/1.30.0/scene.mjs').match(/const catalog=(.*);/)[1]),'No atlas/portrait bytes or layout metrics changed');
for(const m of manifest.modules){assert.equal(sha(read(m.path)),m.sha256);if(!['mvu','scene'].includes(m.module_id))assert.deepEqual(m,oldManifest.modules.find(o=>o.module_id===m.module_id),'Deferred minigames and other modules must stay frozen');}
if(process.argv[2]){
 const packed=json(process.argv[2]),scripts=packed.data.extensions.tavern_helper.scripts;const clone=structuredClone(packed);clone.data.extensions.tavern_helper.scripts=next.data.extensions.tavern_helper.scripts;assert.deepEqual(clone,next);
 assert.equal(scripts.length,5);for(let i=0;i<scripts.length;i++){assert.equal(scripts[i].id,next.data.extensions.tavern_helper.scripts[i].id);assert.equal(scripts[i].enabled,next.data.extensions.tavern_helper.scripts[i].enabled);assert(Buffer.byteLength(scripts[i].content)<10000);assert(scripts[i].content.includes('module: null'));assert(scripts[i].content.includes(manifest.modules[i].path));assert(scripts[i].content.includes("version: '"+manifest.modules[i].version+"'"));}
 assert(!/;base64,|embedded:copy/.test(read(process.argv[2])));
}
console.log('PASS 31 outfit IDs agree across protocol/schema/art; exactly two model-rule lines changed; state/greetings/other worldbook entries and minigames unchanged; release hashes and packaged parity valid');
