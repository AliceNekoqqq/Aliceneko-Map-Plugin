const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),legacy=process.argv.includes('--legacy');
const text=fs.readFileSync(path.join(root,legacy?'releases/1.49.20/panels.mjs':'releases/1.49.25/panels.mjs'),'utf8');
const code=text.slice(text.indexOf('  async function act(name,payload={}){'),text.indexOf('  async function prepareShopDraft'));
async function run(name,mode){
 let resolve,reject;const saved=[],triggers=[];let publishes=0,closes=0;
 const state={记录:{事件:[]},委托:{编号:'Q1'},绘马板:{绘马:[{编号:'Q1',标题:'试验'}]}};
 const ctx={host:{},busy:false,disposed:false,epoch:0,presented:'valid',generationId:'',read:()=>({id:0,swipe:0,table:{stat_data:state}}),token:()=> 'valid',playable:s=>s,clone:x=>JSON.parse(JSON.stringify(x)),assert:(x,m)=>{if(!x)throw Error(m)},engine:()=>({action:s=>s,schema:()=>({}),config:{regions:[{id:'R02',name:'宇庭高校'}]}}),createChatMessages:rows=>{saved.push(rows);return new Promise((a,b)=>{resolve=a;reject=b})},publish:()=>{publishes++;if(mode==='publish-switch')ctx.epoch++},close:()=>{closes++},triggerSlash:async c=>triggers.push(c)};
 const act=vm.runInNewContext(code+'\nact',ctx);const pending=act(name,{regionId:'R02',id:'Q1'});
 assert.equal(saved.length,1);
 if(['chat','swipe'].includes(mode))ctx.epoch++;
 if(mode==='dispose')ctx.disposed=true;
 if(mode==='save-fail'){reject(Error('save failed'));await assert.rejects(pending,/save failed/);assert.equal(ctx.busy,false);assert.equal(triggers.length,0);return;}
 resolve();const result=await pending;assert.equal(ctx.busy,false);assert.equal(saved.length,1);
 const normal=mode==='normal'||legacy;
 assert.equal(triggers.length,normal?1:0);assert.equal(closes,normal?1:0);
 if(!legacy&&['chat','swipe','dispose'].includes(mode)){assert.equal(publishes,0);assert.equal(result.generationSkipped,true);}
}
(async()=>{for(const name of ['travel','acceptEma','resumeEma'])for(const mode of ['normal','chat','swipe','dispose','publish-switch','save-fail'])await run(name,mode);console.log(legacy?'PASS legacy failure reproduced: stale continuation still generates':'PASS 18 actual-act cases: normal generates once, stale/disposed/publish-switch skips, failed save releases busy; submitted choice retained');})().catch(e=>{console.error(e);process.exitCode=1});
