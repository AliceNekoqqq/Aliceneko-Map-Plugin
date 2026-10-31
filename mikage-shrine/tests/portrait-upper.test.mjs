import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {portraitPlacement} from '../src/scene-presentation-core.mjs';
const spec=JSON.parse((await readFile(new URL('../releases/1.49.36/statusbar.html',import.meta.url),'utf8')).match(/const SCENE_PORTRAIT_FRAMING=(.*);\n/)[1]);
assert.equal(Object.keys(spec.outfits).length,17);
const near=(a,b)=>assert(Math.abs(a-b)<1e-9);
for(const [id,r] of Object.entries(spec.outfits)){
 const data=await readFile(process.env.MIKAGE_ASSET_CACHE+'/'+createHash('sha256').update(r.source.url).digest('hex'));
 assert.equal(data.length,r.source.bytes);assert.equal(createHash('sha256').update(data).digest('hex'),r.source.sha256);
 for(const [w,h] of [[248,161],[291,189],[592,384]]){
  const p=portraitPlacement(r,w,h,spec.target);assert(p&&Object.values(p).every(Number.isFinite));
  if(r.mode==='adult'){const b=r.visibleBounds;assert(p.left+b[0]*p.scale>=0&&p.left+b[2]*p.scale<=w&&p.top+b[1]*p.scale>=0,id+' top/sides');near((p.left+r.eye[0]*p.scale)/w,.53);near((p.top+r.eye[1]*p.scale)/h,.34);near((r.chin-r.eye[1])*p.scale/h,.115);}
  else{const [x,y,right,bottom]=r.bounds;assert(p.left+x*p.scale>=0&&p.left+right*p.scale<=w);near((p.top+bottom*p.scale)/h,.98);assert((bottom-y)*p.scale<=h*.720001);}
 }
}
assert.equal(portraitPlacement(spec.outfits.usual,0,100,spec.target),null);
assert.equal(portraitPlacement(spec.outfits.usual,100,NaN,spec.target),null);
const read=async n=>JSON.parse(await readFile(new URL('../releases/'+n+'/card-source.json',import.meta.url)));
const before=await read('1.49.35'),after=await read('1.49.36'),normal=structuredClone(after);
normal.character_version=before.character_version;normal.data.character_version=before.data.character_version;normal.data.creator_notes=before.data.creator_notes;normal.data.character_book.description=before.data.character_book.description;
for(const s of normal.data.extensions.tavern_helper.scripts){const old=before.data.extensions.tavern_helper.scripts.find(o=>o.id===s.id);if(s.id==='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383'){s.name=old.name;s.info=old.info;}assert.deepEqual(s,old);}
assert.deepEqual(normal,before);
const a=JSON.parse(await readFile(new URL('../releases/1.49.35/manifest.json',import.meta.url))),b=JSON.parse(await readFile(new URL('../releases/1.49.36/manifest.json',import.meta.url)));
assert.deepEqual(a.modules.filter(x=>x.module_id!=='scene'),b.modules.filter(x=>x.module_id!=='scene'));
console.log('PASS17cached image hashes/bytes,16adult face anchors at3sizes,child bounds,invalid viewport,and complete card inverse/5other modules preservation.');
