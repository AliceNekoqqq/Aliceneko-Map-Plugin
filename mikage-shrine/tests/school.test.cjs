const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),code=fs.readFileSync(path.join(root,'src/school/model.js'),'utf8'),ctx={};vm.createContext(ctx);vm.runInContext(code+';this.M=MikageSchoolModel;',ctx);const M=ctx.M,clone=s=>JSON.parse(JSON.stringify(s));
function lane(s,wanted){while(s.lane<wanted)M.move(s,1);while(s.lane>wanted)M.move(s,-1);}
function play(route,perfect=true,mode='step'){
 const s=M.create();assert(M.start(s,mode));let n=0;
 while(s.phase!=='arrange'){
  if(s.phase==='rest'){assert(M.continueRoute(s,route));continue;}
  assert(n++<100);assert(M.advance(s,.3));assert(M.advance(s,.3));assert(M.advance(s,.15));
  const e=M.encounter(s),paper=M.target(s),target=paper!==null?(perfect?paper:(paper+1)%3):[0,1,2].find(i=>!e.blocked.includes(i));lane(s,target);
  assert(M.advance(s,.25));
 }
 return s;
}
for(const route of ['sakura','shade']){
 const s=play(route);assert.equal(s.notes.length,6);assert.equal(s.bumps,0);assert.equal(s.index,12);
 assert.equal(M.finish(s,'self'),null);for(const id of ['C','A','B'])M.choosePage(s,id);assert.equal(M.finish(s,'self'),null);for(const id of ['C','A','B'])M.choosePage(s,id);for(const id of ['A','B','C'])M.choosePage(s,id);const r=M.finish(s,'tomoe');assert.equal(r.notes,6);assert.equal(r.bumps,0);assert.equal(s.phase,'done');assert.equal(M.finish(s,'self'),null);
}
const empty=play('shade',false);assert.equal(empty.notes.length,0);['A','B','C'].forEach(id=>M.choosePage(empty,id));const r=M.finish(empty,'self');assert(r.detail.includes('说明了沿途见到'));assert(!r.detail.includes('将已拾回的纸页'));
const s=M.create();M.start(s,'walk');assert.equal(M.guard(s),false);M.advance(s,.3);s.paused=true;const frozen=clone(s);M.tick(s,1);M.move(s,1);assert.deepEqual(clone(s),frozen);s.paused=false;M.advance(s,.3);M.advance(s,.3);M.advance(s,.1);
assert.equal(s.index,1);lane(s,0);assert(M.guard(s));assert(!M.guard(s));for(let i=0;i<4;i++)M.advance(s,.25);assert.equal(s.bumps,0);assert.equal(s.helps,1);
const normal=M.create(),slow=M.create();M.start(normal,'walk');M.start(slow,'walk');slow.slow=true;M.tick(normal,.1);M.tick(slow,.1);assert(slow.progress<normal.progress);const step=M.create();M.start(step,'step');M.tick(step,100);assert.equal(step.progress,0);
console.log('PASS both paths: six notes, safe lanes, drift, rests, sorting, zero-note ending, assisted block, pause, slow/step, single completion');
const base=fs.readFileSync(path.join(root,'releases/1.29.1/minigames.mjs'),'utf8'),next=fs.readFileSync(path.join(root,'releases/1.31.0/minigames.mjs'),'utf8');
assert.equal(next.slice(next.indexOf('const MikageTeaModel='),next.indexOf('const SCHOOL_FONT_URL=')),base.slice(base.indexOf('const MikageTeaModel='),base.indexOf('function createMikageActivities('))+'\n');
for(let i=3;i<=10;i++){const id='R'+String(i).padStart(2,'0'),start='      '+id+'(){',end=i<10?'      R'+String(i+1).padStart(2,'0')+'(){':'    };';const cut=s=>s.slice(s.indexOf(start),s.indexOf(end,s.indexOf(start)+start.length));assert.equal(cut(next),cut(base),id+' legacy game changed');}
assert(!next.includes('蹲下身细看花猫'));assert(next.includes("if(region==='R02')return mountMikageSchool"));
const oldCard=JSON.parse(fs.readFileSync(path.join(root,'releases/1.30.1/card-source.json'))),card=JSON.parse(fs.readFileSync(path.join(root,'releases/1.31.0/card-source.json')));
assert.deepEqual(card.data.character_book,oldCard.data.character_book);assert.deepEqual(card.data.extensions.regex_scripts,oldCard.data.extensions.regex_scripts);assert.deepEqual(card.data.extensions.tavern_helper.variables,oldCard.data.extensions.tavern_helper.variables);
const restored=structuredClone(card);restored.character_version=oldCard.character_version;restored.data.character_version=oldCard.data.character_version;restored.data.extensions.tavern_helper.scripts=oldCard.data.extensions.tavern_helper.scripts;assert.deepEqual(restored,oldCard,'No other card content may change');
if(process.argv[2]){
 const packed=JSON.parse(fs.readFileSync(process.argv[2])),scripts=packed.data.extensions.tavern_helper.scripts,manifest=JSON.parse(fs.readFileSync(path.join(root,'releases/1.31.0/manifest.json'))),copy=structuredClone(packed);
 copy.data.extensions.tavern_helper.scripts=card.data.extensions.tavern_helper.scripts;assert.deepEqual(copy,card);assert.equal(scripts.length,5);
 scripts.forEach((script,i)=>{assert.equal(script.id,card.data.extensions.tavern_helper.scripts[i].id);assert.equal(script.enabled,card.data.extensions.tavern_helper.scripts[i].enabled);assert(Buffer.byteLength(script.content)<10000);assert(script.content.includes(manifest.modules[i].path));assert(script.content.includes("version: '"+manifest.modules[i].version+"'"));});
 assert(!fs.readFileSync(process.argv[2],'utf8').includes(';base64,'));
 console.log('PASS lightweight packed card parity, five stable script IDs/enabled states, module paths/versions and no embedded assets');
}
console.log('PASS R01 and R03–R10 handler bytes unchanged; R02 routes new game; worldbook/regex/variables preserved');
