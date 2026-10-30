import { ARCHIVE_OWNER, DEFAULT_SETTINGS, fingerprint, normalizeSettings, stripControl, validateArchive, parseArchives, collectTasks, reconcileArchives, archiveText, makePrompt, summaryRequest, projectWorldbook } from './task-archive-core.mjs';
export const VERSION='1.49.28';
export const SCRIPT_ID='archive';
export function start(){
  const host=window.parent||window,doc=host.document;
  if(host.MikageTaskArchives?.version===VERSION)return host.MikageTaskArchives;
  host.MikageTaskArchives?.dispose?.();
  const required={getChatMessages:typeof getChatMessages==='function',getLastMessageId:typeof getLastMessageId==='function',getVariables:typeof getVariables==='function',updateVariablesWith:typeof updateVariablesWith==='function',injectPrompts:typeof injectPrompts==='function',eventOn:typeof eventOn==='function'};
  const missing=Object.keys(required).filter(k=>!required[k]);
  if(missing.length)throw Error('任务档案需要酒馆助手消息、变量、提示注入接口，请更新助手后重启脚本');
  const NS='mikage_task_archives_v1',SETTINGS_KEY='mikage.task-archive.settings.v1',PROMPT_ID='mikage-task-archive-v1';
  let disposed=false,epoch=0,queue=Promise.resolve(),summarizing=false,scanned=false,statusText='',panel=null,opener=null,scope='',view={tasks:[],state:null,rows:[]},status={records:[],active:[],pending:[]},seen=new Set(),settings={...DEFAULT_SETTINGS};
  const stops=[],attempted=new Set(),mirrored=new Map();let injection=null,runId='',timer=0;
  function identity(){try{const s=host.SillyTavern?.getContext?.()||(typeof SillyTavern!=='undefined'?SillyTavern:null);const chat=s?.getCurrentChatId?.()||s?.chatId;return chat?JSON.stringify([s.characterId??'',s.groupId??'',chat]):'';}catch{return '';}}
  function live(s=scope,e=epoch){return !disposed&&s&&identity()===s&&scope===s&&epoch===e;}
  function loadSettings(){try{return normalizeSettings(JSON.parse(host.localStorage.getItem(SETTINGS_KEY)||'{}'));}catch{return {...DEFAULT_SETTINGS};}}
  settings=loadSettings();
  function readStore(){const raw=getVariables({type:'chat'})?.[NS];return raw&&raw.version===1?JSON.parse(JSON.stringify(raw)):{version:1,records:[],attempts:[]};}
  function saveStore(next,s=scope,e=epoch){if(!live(s,e))return false;updateVariablesWith(vars=>{if(!live(s,e))return vars;return {...vars,[NS]:next};},{type:'chat'});return live(s,e);}
  function tell(text){statusText=text;if(panel)draw();}
  function clearPrompt(){injection?.uninject?.();injection=null;}
  function installPrompt(){clearPrompt();if(!live())return;const content=makePrompt(view,status,settings);if(!content)return;
    const ownScope=scope,ownEpoch=epoch;
    injection=injectPrompts([{id:PROMPT_ID,position:'in_chat',depth:0,role:'system',content,should_scan:false,filter:()=>live(ownScope,ownEpoch)&&!summarizing}],{once:false});}
  function readRows(){const last=Number(getLastMessageId());if(!Number.isInteger(last)||last<0)return [];
    return getChatMessages('0-'+last,{include_swipes:true,hide_state:'all'}).map(row=>{const swipe=row.swipe_id??0;let state=null;
      try{const vars=typeof Mvu!=='undefined'&&typeof Mvu.getMvuData==='function'?Mvu.getMvuData({type:'message',message_id:row.message_id}):getVariables({type:'message',message_id:row.message_id});state=vars?.stat_data||null;}catch{}
      return {id:row.message_id,swipe,role:row.role,text:row.swipes?.[swipe]??row.message??'',state};});}
  async function mirror(s=scope,e=epoch){
    if(!live(s,e)||!status.records.length)return;
    const names=typeof getWorldbookNames==='function'?getWorldbookNames():null;
    if(!names||typeof createWorldbook!=='function'||typeof updateWorldbookWith!=='function'){tell('档案已保存在当前聊天；世界书接口待就绪');return;}
    const name='御影任务档案-'+fingerprint(s),records=JSON.parse(JSON.stringify(status.records)),signature=fingerprint(JSON.stringify(records));
    if(mirrored.get(s)===signature)return;
    try{if(!names.includes(name)){await createWorldbook(name,[]);if(!live(s,e))return;}
      const book=typeof getWorldbook==='function'?await getWorldbook(name):null;if(!live(s,e))return;
      const projected=book?projectWorldbook(book,records,s):null;
      if(book&&JSON.stringify(book)===JSON.stringify(projected)){mirrored.set(s,signature);return;}
      if(fingerprint(JSON.stringify(readStore().records))!==signature)return;
      await updateWorldbookWith(name,entries=>projectWorldbook(entries,records,s),{render:'debounced'});
      if(live(s,e)){mirrored.set(s,signature);const st=readStore();if(st.book!==name)saveStore({...st,book:name},s,e);}
    }catch{if(live(s,e))tell('聊天档案已保存，世界书副本待重试；可点击刷新');}
  }
  async function scan({allowAuto=true,mirrorBook=true}={}){
    const current=identity();if(!current){clearPrompt();return;}
    if(current!==scope){epoch++;scope=current;scanned=false;seen=new Set();attempted.clear();clearPrompt();}
    const s=scope,e=epoch;clearPrompt();const store=readStore();view=collectTasks(readRows());status=reconcileArchives(view,store.records,settings.summaryLimit);
    if(JSON.stringify(status.records)!==JSON.stringify(store.records)&&!saveStore({...store,records:status.records},s,e))return;
    const newcomers=status.pending.filter(t=>!seen.has(t.key));const initialized=scanned;scanned=true;
    for(const t of view.tasks)seen.add(t.key);
    if(live(s,e)){installPrompt();if(panel)draw();}
    if(mirrorBook)await mirror(s,e);
    if(allowAuto&&initialized&&live(s,e)&&settings.mode==='independent'&&settings.auto&&!summarizing){
      const pending=newcomers.filter(t=>!store.attempts?.includes(t.key)&&!attempted.has(t.key)).slice(0,5);
      if(pending.length)await summarize(pending.map(t=>t.id),true);
    }
  }
  function schedule(){if(disposed)return;clearTimeout(timer);timer=setTimeout(()=>{timer=0;enqueue();},80);}
  function enqueue(){const next=queue.then(()=>scan()).catch(()=>tell('记录读取暂未完成，稍后可刷新重试'));queue=next;return next;}
  async function summarize(ids,automatic=false){
    if(summarizing)throw Error('已有一批档案正在整理');
    const s=scope,e=epoch,chosen=ids.map(id=>view.tasks.find(t=>t.id===id));if(chosen.some(t=>!t))throw Error('任务记录已变化，请刷新');
    const request=summaryRequest(chosen,settings);if(typeof generateRaw!=='function')throw Error('当前助手尚未提供独立整理接口');
    if(settings.mode==='independent'&&(!settings.url||!settings.model))throw Error('请先填写独立API地址和模型');
    if(!live(s,e))return;
    const st=readStore();for(const t of chosen)attempted.add(t.key);
    saveStore({...st,attempts:[...new Set([...(st.attempts||[]),...chosen.map(t=>t.key)])]},s,e);
    summarizing=true;runId='mikage-archive-'+Date.now();tell('正在整理这一批档案…');
    try{
      const config={generation_id:runId,should_stream:false,should_silence:true,max_chat_history:0,ordered_prompts:[{role:'system',content:request.system},{role:'user',content:request.content}],custom_api:{max_tokens:settings.maxTokens,temperature:0.2}};
      if(settings.mode==='independent')Object.assign(config.custom_api,{apiurl:settings.url,key:settings.key,model:settings.model,source:'openai'});
      const response=await generateRaw(config);if(!live(s,e))return;
      const fresh=collectTasks(readRows()),parsed=parseArchives(typeof response==='string'?response:'',settings.summaryLimit);
      const latest=readStore();let count=0;
      for(const data of parsed.valid){const original=chosen.find(t=>t.id===data.task_id&&t.eventId===data.event_id);const task=original&&fresh.tasks.find(t=>t.key===original.key&&t.recordable);if(!task)continue;
        const r={key:task.key,taskId:task.id,eventId:task.eventId,fingerprint:task.fingerprint,data,source:'api'};
        const index=latest.records.findIndex(x=>x.key===r.key);if(index<0)latest.records.push(r);else latest.records[index]={...r,lineage:latest.records[index].lineage||[]};count++;}
      if(!live(s,e))return;saveStore(latest,s,e);tell(count?'已整理'+count+'项，其余可稍后补档':'本次结果未通过核验，原文已保留，可手动重试');
      await scan({allowAuto:false});
    }catch{if(live(s,e))tell((automatic?'自动整理已停止':'整理未完成')+'，原文保留；点击整理可重试');}
    finally{summarizing=false;runId='';if(live(s,e)){installPrompt();if(panel)draw();}}
  }
  function close(){if(!panel)return;panel.host.remove();panel=null;opener?.focus?.();}
  function element(tag,text,cls){const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
  function button(text,fn){const b=element('button',text),s=scope,e=epoch;b.type='button';b.addEventListener('click',()=>Promise.resolve().then(()=>{if(s&&!live(s,e))throw Error('聊天已切换，请重新打开任务档案');return fn();}).catch(err=>tell(err.message||'操作未完成')));return b;}
  function draw(){if(!panel)return;const root=panel.body;root.replaceChildren();
    root.append(element('p','随正文归档 · 默认零次额外调用','intro'),element('p',statusText||'任务实际结案后保存；相关人物或地点出现时带回记忆。','status'));
    const tools=element('div',undefined,'tools');tools.append(button('刷新记录',()=>enqueue()),button('整理选中任务 · 调用1次',()=>{const ids=[...root.querySelectorAll('[data-task]:checked')].map(x=>x.dataset.task);return summarize(ids);}));root.append(tools);
    const list=element('section');
    for(const task of view.tasks){const record=status.active.find(r=>r.key===task.key),card=element('article');const heading=element('div',undefined,'row');
      if(task.recordable){const check=element('input');check.type='checkbox';check.dataset.task=task.id;check.setAttribute('aria-label','选择'+task.id);heading.append(check);}
      heading.append(element('strong',task.id+' · '+task.person),element('span',record?'已归档':task.closed?(task.recordable?'待补档':'缺少完整起止记录'):task.paused?'已暂停':'记录中','badge'));card.append(heading,element('p',task.wish));
      if(record){const details=element('details'),sum=element('summary','查看与修改档案');details.append(sum);
        const fields={choice:'最终选择',result:'实际结果',effects:'持续影响（每行一项）',unresolved:'未决事项（每行一项）',known_by:'知情人物（每行一项）'},inputs={};
        for(const [key,label] of Object.entries(fields)){const lab=element('label',label),input=element('textarea');input.value=Array.isArray(record.data[key])?record.data[key].join('\n'):record.data[key];input.rows=2;lab.append(input);inputs[key]=input;details.append(lab);}
        details.append(button('保存修改',async()=>{const data={...record.data};for(const [key,input]of Object.entries(inputs))data[key]=Array.isArray(data[key])?input.value.split('\n').map(x=>x.trim()).filter(Boolean):input.value;validateArchive(data,settings.summaryLimit);
          const fresh=collectTasks(readRows());if(!fresh.tasks.some(t=>t.key===task.key))throw Error('任务原文已变化，请刷新后修改');
          const st=readStore(),index=st.records.findIndex(x=>x.key===task.key);if(index<0)throw Error('档案已变化，请刷新');st.records[index]={...record,data,source:'manual',marker:undefined};saveStore(st);tell('修改已保存');await scan({allowAuto:false});}));card.append(details);}
      if(task.closed)card.append(element('small',task.evidence.length+'条相关对话 · '+(task.recordable?'原文可追溯':'早期记录不足，保留现有结案事实')));list.append(card);}
    if(!view.tasks.length)list.append(element('p','接取任务后，这里会显示记录进度。'));root.append(list);
    const config=element('details');config.open=panel.configOpen;config.addEventListener('toggle',()=>{if(panel)panel.configOpen=config.open;});config.append(element('summary','归档方式与API设置'));
    const form=element('div'),mode=element('select');for(const [value,name]of [['inline','随正文生成（零额外调用）'],['independent','使用独立API整理']]){const o=element('option',name);o.value=value;mode.append(o);}mode.value=settings.mode;
    const modeLabel=element('label','归档方式');modeLabel.append(mode);form.append(modeLabel);
    const auto=element('input');auto.type='checkbox';auto.checked=settings.auto;const autoLabel=element('label','独立模式下，结案后自动整理（每批调用一次）');autoLabel.prepend(auto);form.append(autoLabel);
    const inputs={};for(const [key,label,type]of [['url','独立API地址','url'],['key','API Key（保存在本机设置）','password'],['model','模型名称','text'],['summaryLimit','每份摘要字数上限','number'],['inputLimit','每批原文字数上限','number'],['maxTokens','额外整理回复token上限','number']]){const l=element('label',label),i=element('input');i.type=type;i.value=String(settings[key]);i.autocomplete='off';l.append(i);form.append(l);inputs[key]=i;}
    form.append(element('p','保存设置、刷新、查看和修改均不调用模型。独立整理每批最多五项；失败保留原文，手动重试。专用世界书保存档案副本，当前分支由本模块筛选后带入正文。','intro'));
    form.append(button('保存设置',()=>{const next=normalizeSettings({...settings,mode:mode.value,auto:auto.checked,...Object.fromEntries(Object.entries(inputs).map(([key,i])=>[key,i.value]))});host.localStorage.setItem(SETTINGS_KEY,JSON.stringify(next));settings=next;installPrompt();tell('设置已保存；本次未调用API');}));
    form.append(button('测试独立API · 调用1次',async()=>{if(summarizing)throw Error('请等当前整理结束');const s=scope,e=epoch,c=normalizeSettings({...settings,...Object.fromEntries(Object.entries(inputs).map(([key,i])=>[key,i.value]))});if(!c.url||!c.model)throw Error('请填写API地址和模型');if(typeof generateRaw!=='function')throw Error('独立生成接口不可用');
      summarizing=true;try{await generateRaw({should_stream:false,should_silence:true,max_chat_history:0,ordered_prompts:[{role:'user',content:'Reply OK.'}],custom_api:{apiurl:c.url,key:c.key,model:c.model,source:'openai',max_tokens:16}});if(live(s,e))tell('API连接测试完成');}catch{if(live(s,e))tell('连接未成功，请核对地址、Key和模型');}finally{summarizing=false;}}));
    config.append(form);root.append(config);
  }
  function open(){if(disposed)return;if(!scope)scope=identity();if(!scope){statusText='请先打开巴卫聊天';return;}opener=doc.activeElement;close();const mount=element('div');mount.style.cssText='position:fixed;inset:0;z-index:2147483001';const shadow=mount.attachShadow({mode:'open'}),style=element('style');
    style.textContent=':host{font:15px/1.6 system-ui;color:#44372e}*{box-sizing:border-box}.shade{position:absolute;inset:0;background:#15120db3;display:grid;place-items:center;padding:12px}.dialog{background:#fff9ee;border:1px solid #b79966;border-radius:14px;width:min(780px,100%);max-height:92dvh;overflow:auto;box-shadow:0 18px 70px #0005}header{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:#eee1c9;position:sticky;top:0;z-index:1}h2{margin:0;font-size:20px}.body{padding:16px}button,select,input,textarea{font:inherit;color:inherit}button{background:#f4e5c7;border:1px solid #ac8d5d;border-radius:8px;padding:8px 12px;min-height:44px;cursor:pointer}button:focus-visible,input:focus-visible,textarea:focus-visible,summary:focus-visible,select:focus-visible{outline:3px solid #986b45;outline-offset:2px}button:hover{background:#ead2a8}.tools,.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.intro,small{font-size:13px;color:#756655}.status{background:#f0e7d5;padding:10px;border-radius:8px}article{border-bottom:1px solid #dacdb8;padding:16px 0}article p{white-space:pre-wrap;overflow-wrap:anywhere}.badge{font-size:12px;background:#e7dcc8;border-radius:12px;padding:2px 8px}details{margin-top:14px}summary{cursor:pointer;min-height:44px;padding-top:8px}label{display:block;margin:12px 0}input:not([type=checkbox]),textarea,select{display:block;width:100%;background:#fffef9;border:1px solid #bbae98;border-radius:6px;padding:9px}textarea{resize:vertical}input[type=checkbox]{width:20px;height:20px;vertical-align:middle;margin-right:8px}@media(max-width:400px){.body{padding:12px}.tools button{width:100%}}';
    const shade=element('div',undefined,'shade'),dialog=element('div',undefined,'dialog');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','任务档案');dialog.tabIndex=-1;const header=element('header');header.append(element('h2','任务档案'),button('关闭',close));const body=element('div',undefined,'body');dialog.append(header,body);shade.append(dialog);shadow.append(style,shade);doc.body.append(mount);panel={host:mount,body,dialog,configOpen:false};
    shade.addEventListener('click',e=>{if(e.target===shade)close();});draw();dialog.focus();void enqueue();
  }
  function onKey(e){if(!panel)return;if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key==='Tab'){const ns=[...panel.host.shadowRoot.querySelectorAll('button,input,textarea,select,summary,[tabindex="-1"]')].filter(n=>n.getClientRects().length&&!n.disabled);if(!ns.length)return;const current=panel.host.shadowRoot.activeElement,first=ns[0],last=ns.at(-1);if(e.shiftKey&&current===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&current===last){e.preventDefault();first.focus();}}}
  const launcher=button('任务档案',open);launcher.style.cssText='position:fixed;right:12px;bottom:86px;z-index:2147482000;border:1px solid #a68b61;border-radius:20px;background:#f9ecd3;color:#493e30;padding:8px 13px;font:14px system-ui;min-height:40px';doc.body.append(launcher);doc.addEventListener('keydown',onKey,true);
  function chatChanged(){epoch++;scope='';clearPrompt();close();if(runId&&typeof stopGenerationById==='function')try{stopGenerationById(runId);}catch{}schedule();}
  const events=typeof tavern_events!=='undefined'?tavern_events:{};
  for(const key of ['MESSAGE_RECEIVED','MESSAGE_UPDATED','MESSAGE_EDITED','MESSAGE_DELETED','MESSAGE_SWIPED','GENERATION_ENDED'])if(events[key])stops.push(eventOn(events[key],schedule));
  if(events.CHAT_CHANGED)stops.push(eventOn(events.CHAT_CHANGED,chatChanged));
  if(events.GENERATION_AFTER_COMMANDS)stops.push(eventOn(events.GENERATION_AFTER_COMMANDS,()=>scan({allowAuto:false,mirrorBook:false}).catch(()=>{clearPrompt();tell('本轮档案读取暂缓，正文可继续');})));
  host.addEventListener('mikage:mvu-message-replaced',schedule);host.addEventListener('mikage:mvu-status',schedule);
  if(typeof getButtonEvent==='function')stops.push(eventOn(getButtonEvent('任务档案'),open));
  const api={version:VERSION,open,refresh:enqueue,inspect:()=>({scope,view,status,settings:{...settings,key:settings.key?'已设置':''},statusText,summarizing}),dispose(){if(disposed)return;disposed=true;epoch++;clearTimeout(timer);clearPrompt();close();launcher.remove();doc.removeEventListener('keydown',onKey,true);host.removeEventListener('mikage:mvu-message-replaced',schedule);host.removeEventListener('mikage:mvu-status',schedule);for(const sub of stops)sub?.stop?.();if(runId&&typeof stopGenerationById==='function')try{stopGenerationById(runId);}catch{}if(host.MikageTaskArchives===api)delete host.MikageTaskArchives;}};
  host.MikageTaskArchives=api;window.addEventListener('pagehide',api.dispose,{once:true});void enqueue();return api;
}
