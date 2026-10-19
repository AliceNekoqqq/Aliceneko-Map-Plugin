const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require(path.join(process.env.MIKAGE_DEBUG_DEPS||'/tmp/mikage-debug/node_modules','jsdom'));
const root=path.resolve(__dirname,'..','..');
const release=process.argv[2]||'1.29.3';
const manifest=JSON.parse(fs.readFileSync(path.join(root,'mikage-shrine/releases',release,'manifest.json')));
const source=fs.readFileSync(path.join(root,manifest.modules.find(x=>x.module_id==='scene').path),'utf8');
const catalog=JSON.parse(source.match(/const catalog=(.*);/)[1]);
const start=source.indexOf('((host)=>{',source.indexOf('/* One immutable asset catalog'));
const end=source.indexOf('/* Tavern Helper adapter',start);
assert(start>=0&&end>start);
const d=new JSDOM('',{url:'https://fixture.invalid/',runScripts:'outside-only'}),w=d.window;
try{
 const old=fs.readFileSync(path.join(root,'mikage-shrine/releases/1.29.2/scene.mjs'),'utf8');
 const oldStart=old.indexOf('((host)=>{',old.indexOf('/* One immutable asset catalog')),oldEnd=old.indexOf('/* Tavern Helper adapter',oldStart);
 w.eval(old.slice(oldStart,oldEnd));const previous=w.MikageCharacterArt;
 w.eval(source.slice(start,end));const api=w.MikageCharacterArt;
 if(!process.argv.includes('--expect-failure')){assert.notEqual(api,previous,'New renderer must replace stale same-catalog API');w.eval(source.slice(start,end));assert.equal(w.MikageCharacterArt,api,'Same revision must reuse API');}
 let count=0;
 for(const actor of ['player','tomoe'])for(const outfit of catalog.actors[actor].outfits){
  const frame=w.document.createElement('span'),img=w.document.createElement('img');frame.append(img);w.document.body.append(frame);
  Object.defineProperties(frame,{clientWidth:{value:180},clientHeight:{value:340}});
  if(process.argv.includes('--expect-failure')){
   assert.throws(()=>api.paintPortrait(frame,actor,outfit.id),/item is not defined/);
   console.log('PASS old sized portrait paint reproduces ReferenceError before Tomoe src assignment');return;
  }
  api.paintPortrait(frame,actor,outfit.id);
  assert.equal(img.src,api.portrait(actor,outfit.id));
  assert.equal(img.style.imageRendering,outfit.imageRendering||'pixelated');
  assert(parseFloat(img.style.width)>0);assert(parseFloat(img.style.height)>0);
  assert.equal(frame.dataset.outfit,outfit.id);assert(+frame.dataset.portraitHeight>0);
  api.releasePortrait(frame);frame.remove();count++;
 }
 assert.equal(count,31);console.log('PASS 31 sized portrait frames receive URL, position, scale, rendering and metadata without throwing');
}finally{w.close();}
