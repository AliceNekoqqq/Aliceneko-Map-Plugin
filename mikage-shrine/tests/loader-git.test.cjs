const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {webcrypto,createHash}=require('node:crypto');
const body='export const VERSION="test"; export const SCRIPT_ID="test"; export function start() {}';
const digest=createHash('sha256').update(body).digest('hex');
const template=fs.readFileSync(__dirname+'/../tools/loader-template.js','utf8');
async function scenario({text=body,crypto=webcrypto,header='0',badVersion=false,timeout=false}={}){
 let starts=0,imports=0,blobs=0,revoked=0,requests=0;
 class TestURL extends URL{static createObjectURL(b){blobs++;return URL.createObjectURL(b)}static revokeObjectURL(u){revoked++;URL.revokeObjectURL(u)}}
 const context=vm.createContext({URL:TestURL,Blob,crypto,AbortController,setTimeout,clearTimeout,console:{error(){}},
   async fetch(url,options){requests++;assert(url.startsWith('https://raw.githubusercontent.com/'));assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');
     if(timeout)return await new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted')),{once:true}));
     return new Response(text,{headers:{'content-type':'text/plain','content-length':header}});
   },async mockImport(url){imports++;if(!url.startsWith('blob:'))throw Error('CDN unavailable');return {VERSION:badVersion?'wrong':'test',SCRIPT_ID:'test',start(){starts++}}}
 });
 let code=template.replace('import(url)','mockImport(url)').replaceAll('__COMMIT__','0'.repeat(40)).replaceAll('__MODULE_PATH__','module.mjs').replaceAll('__SCRIPT_ID__','test').replaceAll('__VERSION__','test').replaceAll('__LABEL__','test').replaceAll('__SHA256__',digest);
 if(timeout)code=code.replace('timeoutMs: 15000','timeoutMs: 15');
 vm.runInContext(code,context);await new Promise(r=>setTimeout(r,0));const state=context.__MIKAGE_REMOTE_LOADERS__.test;if(state.promise)await state.promise;
 return {context,state,stats:()=>({starts,imports,blobs,revoked,requests}),code};
}
(async()=>{
 const good=await scenario();assert.equal(good.state.status,'running');assert.deepEqual(good.stats(),{starts:1,imports:4,blobs:1,revoked:1,requests:1});
 vm.runInContext(good.code,good.context);await good.state.retry();assert.equal(good.stats().starts,1);
 console.log('PASS raw text/plain verified fallback, URL cleanup and once-only start');
 const mismatch=await scenario({text:body+'// unexpected bytes'});assert.equal(mismatch.state.status,'failed');assert.equal(mismatch.stats().starts,0);assert.equal(mismatch.stats().blobs,0);assert.match(mismatch.state.error,/SHA256/);
 console.log('PASS changed source rejected before execution');
 const large=await scenario({header:String(5*1024*1024)});assert.equal(large.state.status,'failed');assert.equal(large.stats().starts,0);assert.match(large.state.error,/大小/);
 const missing=await scenario({crypto:null});assert.equal(missing.state.status,'failed');assert.equal(missing.stats().requests,0);
 const wrong=await scenario({badVersion:true});assert.equal(wrong.state.status,'failed');assert.equal(wrong.stats().starts,0);assert.equal(wrong.stats().revoked,1);
 const slow=await scenario({timeout:true});assert.equal(slow.state.status,'failed');assert.equal(slow.stats().starts,0);
 console.log('PASS size limit, unavailable secure crypto, wrong module version and aborted fetch');
})().catch(e=>{console.error(e);process.exitCode=1});
