/** Read-only DOM presentation. Built as a self-contained module for the existing CDN loader. */
export const VERSION = '1.0.0';
export const SCRIPT_ID = 'reading';
const HOST_CSS = '__HOST_CSS__';
const FRAME_CSS = '__FRAME_CSS__';
const ASSET_REF = 'e72763467967bffaabc77e7b1984ea6a91d92721';
const ASSET_ROOT = `https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@${ASSET_REF}/mikage-shrine/assets/`;
const STORAGE = 'mikage:reading:1';
const SCRIPT_UUID = '942e5145-090d-52b2-8e13-455609375d17';
const TITLES = {'opening-1':'修缮现场初遇','opening-2':'带着心愿的来访者','opening-3':'神社的安静午后'};
const DEFAULTS = Object.freeze({enabled:true,theme:'paper',size:16,decor:true,motion:true});
function normalized(value){
  return {enabled:value?.enabled!==false,theme:value?.theme==='night'?'night':'paper',size:[16,18,20].includes(value?.size)?value.size:16,decor:value?.decor!==false,motion:value?.motion!==false};
}
function svgURL(svg){return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';}
// Original UI ornament, independent of narrative content and remotely supplied markup.
const BRANCHES=svgURL('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><path d="M0 20Q95 72 210 55M55 43Q85 116 150 142M114 58Q165 15 250 17" fill="none" stroke="#553742" stroke-width="5"/><g fill="#e5acc0" stroke="#f7d8df" stroke-width="1.5"><path d="M45 42q-16-25-23-6t18 16q-18 15-3 23t15-19q23 15 27-2T54 42q5-23-9-16t0 16Z"/><path d="M116 63q-16-25-23-6t18 16q-18 15-3 23t15-19q23 15 27-2T125 63q5-23-9-16t0 16Z"/><path d="M192 49q-16-25-23-6t18 16q-18 15-3 23t15-19q23 15 27-2T201 49q5-23-9-16t0 16Z"/><path d="M145 130q-12-19-17-4t13 12q-13 11-2 17t11-14q17 11 20-2t-18-9q4-17-7-12t0 12Z"/></g></svg>');
const FLOWER=svgURL('<svg xmlns="http://www.w3.org/2000/svg" width="190" height="190" viewBox="0 0 190 190"><g opacity=".16"><path d="M190 180Q90 160 45 90M130 156Q120 75 70 40" fill="none" stroke="#9d536c" stroke-width="3"/><g fill="#bc718c"><path d="M72 90q-18-25-23-6t17 16q-17 15-2 23t14-18q23 14 26-3T81 90q5-23-9-16t0 16Z"/><path d="M135 140q-18-25-23-6t17 16q-17 15-2 23t14-18q23 14 26-3T144 140q5-23-9-16t0 16Z"/></g></g></svg>');

export function start(){
  let host,doc;
  try{host=window.parent;doc=host.document;if(!doc?.body)throw Error('页面未就绪');}catch{throw Object.assign(Error('正文美化暂时无法访问聊天页面'),{mikageRetryableStart:true});}
  if(typeof getChatMessages!=='function')throw Object.assign(Error('请启用酒馆助手后重试正文美化'),{mikageRetryableStart:true});
  host.MikageReading?.dispose?.();
  let settings={...DEFAULTS},disposed=false,queued=false,dialog=null,focusBefore=null;
  try{settings=normalized(JSON.parse(host.localStorage.getItem(STORAGE)||'null'));}catch{}
  const stops=[],owned=new Map(),frames=new Map(),styledDocs=new Map(),rowCache=new Map();
  const style=doc.createElement('style');style.dataset.mikageReadingStyle='host';style.textContent=HOST_CSS;doc.head.append(style);
  const node=(tag,text)=>{const el=doc.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
  function scopeActive(){
    // A character-bound helper iframe is the primary scope. A core context, when
    // exposed, also prevents a stale script from styling a different character.
    try{const c=host.SillyTavern?.getContext?.();if(!c)return true;if(c.groupId)return false;
      const scripts=c.characters?.[c.characterId]?.data?.extensions?.tavern_helper?.scripts;
      return Array.isArray(scripts)&&scripts.some(s=>s.id===SCRIPT_UUID&&s.enabled!==false);
    }catch{return false;}
  }
  function rowFor(el){
    const id=Number(el.getAttribute('mesid'));if(!Number.isInteger(id)||id<0)return null;
    if(rowCache.has(id)){const cached=rowCache.get(id);return cached?.role==='assistant'?cached:null;}
    try{const rows=getChatMessages(id,{include_swipes:false});const row=rows?.find(r=>Number(r.message_id)===id);if(row)rowCache.set(id,row);return row?.role==='assistant'?row:null;}catch{return null;}
  }
  function release(record){
    record.portraitResize?.disconnect();
    if(record.portrait)try{record.art?.releasePortrait?.(record.portrait);}catch{}
    for(const el of record.nodes)el.remove();
    record.body.removeAttribute('data-mikage-reading');record.body.removeAttribute('data-reading-theme');record.body.removeAttribute('data-reading-motion');record.body.removeAttribute('data-reading-decor');
    for(const key of ['--mr-size','--mr-flower','--mr-branches'])record.body.style.removeProperty(key);
    owned.delete(record.body);
  }
  function restoreDoc(child){const s=styledDocs.get(child);s?.remove();styledDocs.delete(child);try{for(const key of ['data-mikage-reading-theme','data-mikage-reading-motion','data-mikage-reading-decor'])child.documentElement.removeAttribute(key);}catch{}}
  function themeFrame(frame){
    try{const child=frame.contentDocument;if(!child?.head)return;
      if(!settings.enabled||!scopeActive()){restoreDoc(child);return;}
      let s=styledDocs.get(child);if(!s?.isConnected){s=child.createElement('style');s.dataset.mikageReadingStyle='frame';s.textContent=FRAME_CSS;child.head.append(s);styledDocs.set(child,s);}
      for(const [key,value] of Object.entries({'data-mikage-reading-theme':settings.theme,'data-mikage-reading-motion':String(settings.motion),'data-mikage-reading-decor':String(settings.decor)}))if(child.documentElement.getAttribute(key)!==value)child.documentElement.setAttribute(key,value);
    }catch{/* Cross-origin optional panels keep their original appearance. */}
  }
  function apply(record){
    const body=record.body;body.setAttribute('data-mikage-reading','1');body.setAttribute('data-reading-theme',settings.theme);body.setAttribute('data-reading-decor',String(settings.decor));
    if(!body.hasAttribute('data-reading-motion'))body.setAttribute('data-reading-motion',String(settings.motion));
    body.style.setProperty('--mr-size',(settings.size/16)+'rem');body.style.setProperty('--mr-flower',FLOWER);body.style.setProperty('--mr-branches',BRANCHES);
  }
  function header(record,row){
    const match=String(row.message||'').match(/<!--MikageOpeningStarted:(opening-[123])-->/);
    const toolbar=node('div');toolbar.className='mr-tools';toolbar.dataset.mrOwned='toolbar';
    toolbar.append(node('span','御影神社'));const button=node('button','阅读设置');button.type='button';button.addEventListener('click',showSettings);toolbar.append(button);
    record.body.prepend(toolbar);record.nodes.push(toolbar);
    if(!match)return;
    const hero=node('header');hero.className='mr-hero';hero.dataset.mrOwned='hero';hero.style.setProperty('--mr-hero-image',`url("${ASSET_ROOT}statusbar/shrine-courtyard-v1.webp")`);
    const copy=node('div');copy.className='mr-hero-copy';const title=node('span',TITLES[match[1]]);title.className='mr-hero-title';copy.append(title);
    const place=row.data?.stat_data?.环境?.所在位置||row.data?.stat_data?.环境?.地点;
    if(typeof place==='string'&&place){const sub=node('span',place.slice(0,120));sub.className='mr-hero-place';copy.append(sub);}
    hero.append(copy);const lantern=node('span');lantern.className='mr-lantern';lantern.setAttribute('aria-hidden','true');hero.append(lantern);
    record.body.insertBefore(hero,toolbar);record.nodes.push(hero);record.hero=hero;
    updatePortrait(record,row);
  }
  function updatePortrait(record,row){
    if(!record.hero)return;
    const art=host.MikageCharacterArt,outfit=row.data?.stat_data?.巴卫?.服装;
    try{const scene=art?.scene?.('courtyard');if(typeof scene==='string'&&/^https:\/\//.test(scene))record.hero.style.setProperty('--mr-hero-image',`url("${scene.replaceAll('"','%22')}")`);}catch{}
    if(!art?.portrait||!art?.portraitPlacement||typeof outfit!=='string'||!outfit)return;
    const signature=[art.fingerprint,art.rendererRevision,outfit].join(':');if(record.artSignature===signature)return;
    if(record.portrait){record.portraitResize?.disconnect();record.portrait.remove();record.portrait=null;}
    const portrait=node('div');portrait.className='mr-hero-art';const image=node('img');image.dataset.mrPortrait='true';image.alt='巴卫当前衣装';portrait.append(image);record.hero.append(portrait);
    try{
      const url=art.portrait('tomoe',outfit);if(typeof url!=='string'||!/^https:\/\//.test(url))throw Error('Invalid portrait URL');image.src=url;
      // Use the existing alpha-aware metrics, then align the visible head to the
      // top. The hero clips the lower body while preserving ears and shoulders.
      const place=()=>{const width=portrait.clientWidth;if(!width)return;const p=art.portraitPlacement('tomoe',outfit,width,width*1.9);Object.assign(image.style,{width:p.width+'px',height:p.height+'px',left:p.left+'px',top:(p.top-p.visibleTop)+'px'});};
      if(host.ResizeObserver){record.portraitResize=new host.ResizeObserver(place);record.portraitResize.observe(portrait);}place();
      image.addEventListener('error',()=>{portrait.hidden=true;},{once:true});record.portrait=portrait;record.art=art;record.artSignature=signature;
    }catch{portrait.remove();}
  }
  function refreshBridge(record){
    const anchor=record.body.querySelector('[data-mikage-status-host]');
    if(!anchor){record.bridge?.remove();record.bridge=null;return;}
    if(!record.bridge?.isConnected){const divider=node('div','檐下此刻');divider.className='mr-bridge';divider.dataset.mrOwned='bridge';record.bridge=divider;record.nodes.push(divider);}
    if(anchor.previousElementSibling!==record.bridge)anchor.before(record.bridge);
  }
  function scan(){
    queued=false;if(disposed)return;const active=settings.enabled&&scopeActive();
    for(const record of [...owned.values()])if(!active||!record.body.isConnected)release(record);
    if(active)for(const el of doc.querySelectorAll('#chat .mes[mesid]')){
      const body=el.querySelector('.mes_text');if(!body||body.querySelector('textarea')||el.querySelector('.edit_textarea')){if(owned.has(body))release(owned.get(body));continue;}
      const row=rowFor(el);const text=String(row?.message||'');
      if(!row||row.is_system===true||/^\s*<MikageOpeningScreen\/>\s*(?:<StatusPlaceHolderImpl\/>\s*)?$/.test(text)){
        if(owned.has(body))release(owned.get(body));continue;
      }
      const signature=String(row.swipe_id??0)+':'+(text.match(/<!--MikageOpeningStarted:[^>]+-->/)?.[0]||'');
      let record=owned.get(body);
      if(record&&(record.signature!==signature||!record.nodes[0]?.isConnected)){release(record);record=null;}
      if(!record){record={body,nodes:[],signature,portrait:null,bridge:null};owned.set(body,record);header(record,row);}
      apply(record);updatePortrait(record,row);refreshBridge(record);
    }
    const eligible=new Set(doc.querySelectorAll('iframe[title="游戏标题页"],iframe[title="游戏标题页重播"],iframe[title="御影神社状态栏"],iframe[data-mikage-panel-frame]'));
    for(const [frame,fn] of frames)if(!frame.isConnected||!eligible.has(frame)){frame.removeEventListener('load',fn);try{restoreDoc(frame.contentDocument);}catch{}frames.delete(frame);}
    for(const frame of eligible){if(!frames.has(frame)){const load=()=>themeFrame(frame);frame.addEventListener('load',load);frames.set(frame,load);}themeFrame(frame);}
    for(const child of [...styledDocs.keys()])if(!active||!child.defaultView?.frameElement?.isConnected)restoreDoc(child);
  }
  function schedule(){if(disposed||queued)return;queued=true;queueMicrotask(scan);}
  function invalidate(){rowCache.clear();schedule();}
  function save(){try{host.localStorage.setItem(STORAGE,JSON.stringify(settings));}catch{}schedule();}
  function closeSettings(){if(!dialog)return;dialog.remove();dialog=null;focusBefore?.focus?.();focusBefore=null;}
  function showSettings(){
    if(disposed)return;closeSettings();focusBefore=doc.activeElement;
    const backdrop=node('div');backdrop.className='mr-settings-backdrop';const panel=node('section');panel.className='mr-settings';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','正文阅读设置');
    const heading=node('header');heading.append(node('span','正文阅读设置'));const close=node('button','关闭');close.type='button';close.addEventListener('click',closeSettings);heading.append(close);panel.append(heading);
    function choices(label,key,items){const group=node('fieldset');group.append(node('legend',label));const options=node('div');options.className='mr-options';for(const [value,title]of items){const b=node('button',title);b.type='button';b.dataset.setting=key;b.dataset.value=String(value);b.setAttribute('aria-pressed',String(settings[key]===value));b.addEventListener('click',()=>{settings={...settings,[key]:value};save();for(const item of options.children)item.setAttribute('aria-pressed',String(item===b));});options.append(b);}group.append(options);panel.append(group);}
    choices('阅读底色','theme',[['paper','和纸'],['night','夜读']]);choices('正文字号','size',[[16,'标准'],[18,'大字'],[20,'更大']]);
    for(const [key,title]of [['decor','樱枝与装饰'],['motion','入场动效'],['enabled','启用正文美化']]){const label=node('label');const input=node('input');input.type='checkbox';input.checked=settings[key];input.addEventListener('change',()=>{settings={...settings,[key]:input.checked};save();});label.append(input,node('span',title));panel.append(label);}
    panel.append(node('p','设置只影响阅读显示，关闭后恢复原有正文。'));backdrop.append(panel);backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeSettings();});
    backdrop.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeSettings();return;}if(e.key!=='Tab')return;const list=[...panel.querySelectorAll('button,input')];const first=list[0],last=list.at(-1);if(e.shiftKey&&doc.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&doc.activeElement===last){e.preventDefault();first.focus();}});
    dialog=backdrop;doc.body.append(backdrop);close.focus();
  }
  const observer=new host.MutationObserver(records=>{if(records.some(r=>{const target=r.target.nodeType===1?r.target:r.target.parentElement;if(target?.closest?.('[data-mr-owned],.mr-settings-backdrop'))return false;if(r.type==='childList'&&[...r.addedNodes,...r.removedNodes].every(n=>n.nodeType===1&&(n.hasAttribute?.('data-mr-owned')||n.hasAttribute?.('data-mikage-reading-style'))))return false;return true;}))schedule();});
  observer.observe(doc.body,{childList:true,subtree:true,characterData:true});
  function onHost(name,fn=schedule){host.addEventListener(name,fn);stops.push(()=>host.removeEventListener(name,fn));}
  for(const event of ['mikage:art-ready','mikage:panels-ready','mikage:mvu-message-replaced','mikage:dev-changed'])onHost(event,invalidate);
  if(typeof eventOn==='function'&&typeof tavern_events==='object')for(const key of ['CHAT_CHANGED','MESSAGE_RECEIVED','MESSAGE_UPDATED','MESSAGE_SWIPED','MESSAGE_DELETED'])if(tavern_events[key]){const subscription=eventOn(tavern_events[key],()=>{if(key==='CHAT_CHANGED')closeSettings();invalidate();});stops.push(()=>subscription?.stop?.());}
  if(typeof eventOn==='function'&&typeof getButtonEvent==='function'){const sub=eventOn(getButtonEvent('正文阅读设置'),showSettings);stops.push(()=>sub?.stop?.());}
  function dispose(){if(disposed)return;disposed=true;observer.disconnect();closeSettings();for(const stop of stops)stop();for(const record of [...owned.values()])release(record);for(const [frame,fn]of frames)frame.removeEventListener('load',fn);frames.clear();for(const child of [...styledDocs.keys()])restoreDoc(child);style.remove();window.removeEventListener('pagehide',dispose);if(host.MikageReading===api)delete host.MikageReading;}
  const api={version:VERSION,showSettings,rescan:schedule,dispose,getSettings:()=>({...settings})};host.MikageReading=api;window.addEventListener('pagehide',dispose,{once:true});schedule();return api;
}
