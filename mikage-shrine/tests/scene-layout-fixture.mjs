/* Exact built scene host + srcdoc. Synthetic message/MVU APIs, cached art. */
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
export async function sceneFixture(viewport={width:375,height:1100},release=process.env.MIKAGE_SCENE_LAYOUT_RELEASE||'1.49.34'){
 const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
 const r=new URL('../releases/'+release+'/',import.meta.url);
 const code=await readFile(new URL('scene.mjs',r),'utf8'),html=await readFile(new URL('statusbar.html',r),'utf8');
 const card=JSON.parse(await readFile(new URL('card-source.json',r),'utf8'));
 const initial=JSON.parse(card.data.character_book.entries.find(e=>e.comment.includes('[InitVar]')).content);
 const art=code.slice(code.indexOf('/* One immutable asset catalog,'),code.indexOf('const OpeningHTML='));
 const host=code.slice(code.indexOf('const MikageStatusbarHost='),code.lastIndexOf('\n}\n\nexport'));
 const browser=await chromium.launch({headless:true,executablePath:process.env.MIKAGE_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[],missing=new Set();
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('https://**/*',async route=>{
  const u=route.request().url(),key=createHash('sha256').update(u).digest('hex');
  try{const body=await readFile(process.env.MIKAGE_ASSET_CACHE+'/'+key);await route.fulfill({body,contentType:u.endsWith('.ttf')?'font/ttf':u.endsWith('.woff2')?'font/woff2':u.endsWith('.png')?'image/png':'image/webp',headers:{'access-control-allow-origin':'*'}});}
  catch{missing.add(u);await route.abort();}
 });
 const prose='巴卫收起扫帚，侧过脸看你。风铃响了一声，他抬手指向廊下，示意你先坐。';
 await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#f5eee4"><div id="chat"><div class="mes" mesid="1"><div class="mes_text"><article id="normal-prose" style="font:16px/2 serif;padding:18px 16px;color:#493c40;white-space:pre-wrap">'+prose+'</article>&lt;StatusPlaceHolderImpl/&gt;</div></div></div></body></html>');
 await page.evaluate(({initial,prose})=>{
  window.test={initial,swipe:0,texts:[prose+'<StatusPlaceHolderImpl/>','另一页正文<StatusPlaceHolderImpl/>'],listeners:{},opens:[],calls:0};
  window.getLastMessageId=()=>1;
  window.getChatMessages=(range,opts)=>opts?.include_swipes?[{message_id:1,role:'assistant',swipe_id:test.swipe,swipes:test.texts,swipes_data:[{stat_data:test.initial},{stat_data:{...test.initial,环境:{...test.initial.环境,时段:'黄昏'}}}]}]:[{message_id:1,role:'assistant',message:test.texts[test.swipe],data:{stat_data:test.initial}}];
  window.eventOn=(name,fn)=>{(test.listeners[name]??=[]).push(fn);return{stop(){test.listeners[name]=test.listeners[name].filter(x=>x!==fn);}};};
  window.tavern_events={MESSAGE_RECEIVED:'received',MESSAGE_UPDATED:'updated',MESSAGE_DELETED:'deleted',MESSAGE_SWIPED:'swiped',CHAT_CHANGED:'chat'};
  window.Mvu={getMvuData:()=>({stat_data:{...test.initial,环境:{...test.initial.环境,时段:test.swipe?'黄昏':test.initial.环境.时段}}}),events:{VARIABLE_UPDATE_ENDED:'variables',VARIABLE_INITIALIZED:'initialized'}};
  window.MikageShrinePanels={open:async which=>test.opens.push(which)};
  window.generateRaw=async()=>{test.calls++;throw Error('No live model calls allowed');};
 },{initial,prose});
 await page.addScriptTag({content:art});
 const helper='const StatusbarHTML='+JSON.stringify(html)+';'+host;
 await page.evaluate(helper=>{
  const f=document.createElement('iframe');f.id='helper';f.style.display='none';f.setAttribute('sandbox','allow-scripts allow-same-origin');
  const shims='const getChatMessages=(...a)=>parent.getChatMessages(...a),getLastMessageId=()=>parent.getLastMessageId(),eventOn=(...a)=>parent.eventOn(...a),tavern_events=parent.tavern_events,Mvu=parent.Mvu;';
  f.srcdoc='<script>'+shims+helper.replaceAll('</script','<\\/script')+'</script>';document.body.append(f);
 },helper);
 await page.waitForFunction(()=>document.querySelector('[data-mikage-status-host] iframe')?.contentWindow?.MikagePresentation);
 const getFrame=async()=>await(await page.$('[data-mikage-status-host] iframe')).contentFrame();
 const frame=await getFrame();
 await frame.waitForFunction(()=>{
  const view=document.getElementById('scene-portrait-view');
  return view ? !view.disabled : document.getElementById('scene-portrait').dataset.loaded==='true';
 });
 if(!await frame.locator('#scene-portrait-view').count())await frame.locator('#scene-portrait-image').evaluate(n=>n.decode());
 await page.evaluate(async()=>{await MikageCharacterArt.installFont(document);document.getElementById('normal-prose').style.fontFamily='"Mikage Serif",serif';await document.fonts.ready;});
 return {page,frame,getFrame,browser,context,errors,missing,initial,prose,code,html,close:()=>browser.close()};
}
