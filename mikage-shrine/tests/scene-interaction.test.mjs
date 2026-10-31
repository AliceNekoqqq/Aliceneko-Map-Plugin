import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {portraitPlacement} from '../src/scene-presentation-core.mjs';
const read=n=>readFile(new URL('../releases/'+n,import.meta.url),'utf8');
const before=JSON.parse(await read('1.49.37/card-source.json')),after=JSON.parse(await read('1.49.38/card-source.json')),normal=structuredClone(after);
normal.character_version=before.character_version;normal.data.character_version=before.data.character_version;normal.data.creator_notes=before.data.creator_notes;normal.data.character_book.description=before.data.character_book.description;
for(const s of normal.data.extensions.tavern_helper.scripts){const old=before.data.extensions.tavern_helper.scripts.find(o=>o.id===s.id);if(s.id==='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383'){s.name=old.name;s.info=old.info;}assert.deepEqual(s,old);}
assert.deepEqual(normal,before);
const a=JSON.parse(await read('1.49.37/manifest.json')),b=JSON.parse(await read('1.49.38/manifest.json'));assert.deepEqual(a.modules.filter(x=>x.module_id!=='scene'),b.modules.filter(x=>x.module_id!=='scene'));
const old=await read('1.49.37/statusbar.html'),html=await read('1.49.38/statusbar.html'),marker='/* 1.8 scene controller:';
const original=old.slice(old.indexOf(marker));let inverse=html.slice(html.indexOf(marker));
for(const signature of [' function active(){',' function walkTogether(',' function pause(']){const a=original.split('\n').find(l=>l.startsWith(signature)),b=inverse.split('\n').find(l=>l.startsWith(signature));assert(a&&b);inverse=inverse.replace(b,a);}
const lifecycle=inverse.split('\n').find(l=>l.includes("on(root,'mikage:scene-view'"));assert(lifecycle);inverse=inverse.replace(lifecycle+'\n','');assert.equal(inverse,original,'other walking/gameplay controller bytes unchanged');
assert.equal(await read('1.49.38/media-manifest.json'),await read('1.49.37/media-manifest.json'));
const spec=JSON.parse(await readFile(new URL('../src/scene-portrait-framing.json',import.meta.url)));
for(const [id,r] of Object.entries(spec.outfits)){
 const data=await readFile(process.env.MIKAGE_ASSET_CACHE+'/'+createHash('sha256').update(r.source.url).digest('hex'));assert.equal(createHash('sha256').update(data).digest('hex'),r.source.sha256);assert.equal(data.length,r.source.bytes);
 for(const [w,h] of [[284,200],[340,240],[690,490]]){const p=portraitPlacement(r,w,h,spec.target),bb=r.visibleBounds;assert(p.left+bb[0]*p.scale>=-1&&p.left+bb[2]*p.scale<=w+1&&p.top+bb[1]*p.scale>=-1,id+' head/sides');}
}
console.log('PASS original walking controller inverse except audited lifecycle integration; full card inverse,5other modules,17 original image hashes and new showcase head/lateral bounds.');
