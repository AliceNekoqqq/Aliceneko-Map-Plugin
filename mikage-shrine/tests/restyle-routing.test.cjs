const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const p='mikage-shrine/releases/1.30.0/scene.mjs',source=fs.readFileSync(p,'utf8');
const catalog=JSON.parse(source.match(/const catalog=(.*);/)[1]);
const old=JSON.parse(fs.readFileSync('mikage-shrine/releases/1.29.3/scene.mjs','utf8').match(/const catalog=(.*);/)[1]);
const ids=['tomoe-chibi','tomoe-kariginu','tomoe-butler','tomoe-wedding','player-kagura','player-shiromuku','player-gym','player-heian-travel'];
const start=source.indexOf('((host)=>{',source.indexOf('/* One immutable asset catalog')),end=source.indexOf('/* Tavern Helper adapter',start);
const ctx={Image:class{set src(url){this.url=url;queueMicrotask(()=>this.onload());} decode(){return Promise.resolve();}}};vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);
(async()=>{const api=ctx.MikageCharacterArt;
for(const actor of ['player','tomoe'])for(const item of catalog.actors[actor].outfits){
 if(!ids.includes(actor+'-'+item.id))assert.deepEqual(item,old.actors[actor].outfits.find(x=>x.id===item.id));
}
await api.preloadWalk();let count=0;
for(const id of ids){const split=id.indexOf('-'),actor=id.slice(0,split),outfit=id.slice(split+1);
 for(const [direction,col]of Object.entries(catalog.directions))for(const [frame,row]of [[0,0],[1,1],[2,0],[3,2]]){
  const s=api.sprite(actor,outfit,direction,frame);assert.equal(s.column,col);assert.equal(s.row,row);assert.equal(s.columns,4);assert.equal(s.rows,3);assert(s.url.includes('@35ae06bdc5375befe92c25503f165a3579941217/'));assert.equal(s.fit.bounds.length,12);count++;
 }
}
console.log('PASS '+count+' sprite routes across eight outfits; other 23 outfit records unchanged');
})().catch(e=>{console.error(e);process.exitCode=1;});
