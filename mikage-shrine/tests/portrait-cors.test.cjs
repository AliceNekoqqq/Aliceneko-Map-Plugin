const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),file=process.argv[2]||'releases/1.49.24/tomoe.mjs';
const text=fs.readFileSync(path.join(root,file),'utf8'),html=JSON.parse(text.match(/^const html=(.*);$/m)[1]);
const assets=JSON.parse(html.match(/window.TOMOE_ASSETS=(.*);/)[1]);
const load=html.slice(html.indexOf('function loadImage(id)'),html.indexOf('function upload(im)'));
let failNext=false;const calls=[];
class ImageStub{set src(url){calls.push({url,cors:this.crossOrigin});queueMicrotask(()=>{if(failNext){failNext=false;this.onerror();}else this.onload();});}}
const {loadImage}=vm.runInNewContext(load+'\n({loadImage})',{Image:ImageStub,assets,cache:new Map()});
(async()=>{
 for(const id of Object.keys(assets)){const im=await loadImage(id);assert.equal(calls.at(-1).url,assets[id].src);assert.equal(calls.at(-1).cors,'anonymous');const count=calls.length;assert.equal(await loadImage(id),im);assert.equal(calls.length,count);}
 const cache=new Map();const retry=vm.runInNewContext(load+'\nloadImage',{Image:ImageStub,assets,cache});
 failNext=true;await assert.rejects(retry('usual'),/衣装图像无法载入/);assert.equal(cache.size,0);await retry('usual');assert.equal(cache.size,1);assert.equal(calls.at(-1).cors,'anonymous');
 const old=fs.readFileSync(path.join(root,'releases/1.29.1/tomoe.mjs'),'utf8');
 assert.equal(text.replace("im.crossOrigin='anonymous';",'').replace("VERSION = '0.1.1'","VERSION = '0.1.0'").replace("version:'0.1.1'","version:'0.1.0'"),old);
 console.log('PASS '+Object.keys(assets).length+' outfits: CORS before request, cache reuse, failed load eviction/retry, exact inverse parity; GPU/remote CORS acceptance pending');
})().catch(e=>{console.error(e);process.exitCode=1});
