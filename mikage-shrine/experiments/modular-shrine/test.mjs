import fs from 'node:fs';
import assert from 'node:assert/strict';
import {project,facilities,unwrap} from './scene.mjs';
const raw=fs.readFileSync(new URL('../../releases/1.30.1/mvu.mjs',import.meta.url),'utf8');
const initial=JSON.parse(raw.match(/const ShrineInitial = (.*);/)[1]);
const freeze=o=>{if(o&&typeof o==='object'){Object.freeze(o);Object.values(o).forEach(freeze);}return o};
freeze(initial);
const before=JSON.stringify(initial);
for(let mask=0;mask<3125;mask++){
 let k=mask,state=structuredClone(initial);for(const name of facilities){state.神社[name]=k%5;k=Math.floor(k/5)}
 const snapshot=JSON.stringify(state),a=project(freeze(state));
 assert.equal(JSON.stringify(state),snapshot,'projection is read-only');
 assert.deepEqual(project({stat_data:state}),a);assert.deepEqual(project({data:{stat_data:state}}),a);
 for(const name of facilities){const changed=structuredClone(state);changed.神社[name]=state.神社[name]===4?1:4;const b=project(changed);
  assert.deepEqual(a.modules.filter(x=>x.owner!==name),b.modules.filter(x=>x.owner!==name),'independent facility: '+name);
  assert.deepEqual(a.decorations,b.decorations,'existing life decorations survive every transition');
 }
}
for(const name of facilities){const state=structuredClone(initial);state.神社[name]=4;const a=project(state);for(const stage of[1,2,3]){state.神社[name]=stage;const b=project(state);assert(!b.modules.some(x=>x.owner===name&&/Done$/.test(x.sprite)));}assert.equal(a.stages[name],4)}
const missing=structuredClone(initial);delete missing.神社.鸟居;assert.equal(project(missing).stages.鸟居,1);
for(const n of[-1,5,1.5,'4',NaN]){const s=structuredClone(initial);s.神社.鸟居=n;assert.throws(()=>project(s))}
assert.throws(()=>unwrap({}));assert.equal(project(initial).decorations.length,3);
assert.equal(JSON.stringify(initial),before);
console.log('PASS 3,125 old-state combinations, 15,625 independent transitions, immutable input, 3 wrappers, default/malformed stages, initial decorations');
