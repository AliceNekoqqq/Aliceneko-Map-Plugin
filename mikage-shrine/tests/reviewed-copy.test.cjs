const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'releases/1.48.2');
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const manifest=JSON.parse(read('releases/1.48.2/manifest.json')),base=JSON.parse(read('releases/1.48.1/manifest.json')),edits=JSON.parse(read('releases/1.48.2/copy-edits.json')),ops=JSON.parse(read('releases/1.48.2/transformations.json'));
assert.equal(edits.length,77);const ids=new Set();let applied=0;
for(const name of ['minigames','panels','scene']){
 let text=read('releases/1.48.2/'+name+'.mjs');assert.equal(sha(text),manifest.modules.find(x=>x.module_id===name).sha256);
 for(const op of ops[name])if(op.kind==='approved-copy'){
  const row=edits.find(e=>e.id===op.id);assert(row);assert.equal(row.old,op.old);assert.equal(row.new,op.new);assert.equal(sha(row.old),row.old_sha256);assert(!ids.has(row.id));ids.add(row.id);applied++;
 }
 // Every byte outside the approved literals, font declarations and release
 // versions must be identical to the exact previously shipped module.
 for(const op of [...ops[name]].reverse()){
  assert.equal(text.slice(op.start,op.start+op.new.length),op.new);text=text.slice(0,op.start)+op.old+text.slice(op.start+op.new.length);
 }
 assert.equal(sha(text),base.modules.find(x=>x.module_id===name).sha256);
}
assert.equal(applied,77);assert.equal(ids.size,77);
const oldCard=JSON.parse(read('releases/1.48.1/card-source.json')),card=JSON.parse(read('releases/1.48.2/card-source.json'));
card.character_version=oldCard.character_version;card.data.character_version=oldCard.data.character_version;assert.deepEqual(card,oldCard,'card text, all worldbooks, regexes, init and script identities unchanged');
for(const name of ['mvu','tomoe'])assert.deepEqual(manifest.modules.find(x=>x.module_id===name),base.modules.find(x=>x.module_id===name));
// Execute existing meaningful domain tests against pure model blocks extracted
// from the NEW complete module, rather than accidentally testing older src files.
const complete=read('releases/1.48.2/minigames.mjs');
const names={school:'School',market:'Market',plum:'Plum',dress:'Dress',wind:'Wind',stealth:'Stealth',fox:'Fox',thread:'Thread',festival:'Festival'};
for(const [file,token] of Object.entries(names)){
 const begin=complete.indexOf('const Mikage'+token+'Model=');assert(begin>=0);
 const end=complete.indexOf('\n})();',begin)+6;assert(end>begin);
 const model=complete.slice(begin,end);
 const patchedFs={...fs,readFileSync(p,...args){return String(p).endsWith('/src/'+file+'/model.js')?model:fs.readFileSync(p,...args);}};
 const test=path.join(root,'tests',file+'.test.cjs');
 let suite=fs.readFileSync(test,'utf8');
 // Exact wording assertions follow the approved manuscript. No state or
 // completion assertion is removed or relaxed.
 const region='R'+String(Object.keys(names).indexOf(file)+2).padStart(2,'0');
 suite=suite.replace(/\.includes\('([^'\n]{4,})'\)/g,(expression,fragment)=>{
  if(!/[\u3400-\u9fff]/.test(fragment))return expression;
  const matches=edits.filter(e=>e.area.startsWith(region)&&e.old.includes(fragment)&&!e.new.includes(fragment));
  return matches.length===1?'.includes('+JSON.stringify(matches[0].new)+')':expression;
 });
 const historical=suite.search(/\nconst (?:base|old)=/);assert(historical>0,'separate historical packaging checks from model scenarios');
 // Historical per-release packaging gates are replaced by the current exact
 // reverse-byte and card-parity gates above; preserve every model scenario.
 vm.runInNewContext(suite.slice(0,historical),{require(name){return name==='fs'||name==='node:fs'?patchedFs:require(name)},__dirname:path.dirname(test),process,console,Buffer,setTimeout,clearTimeout,structuredClone},{filename:test});
 console.log('PASS actual release model scenarios:',file);
}
console.log('PASS 77 approved edits exactly once; reverse module byte parity; 9 actual release models; all rules, worldbook, Ema, MVU, wardrobes and initial data preserved');
