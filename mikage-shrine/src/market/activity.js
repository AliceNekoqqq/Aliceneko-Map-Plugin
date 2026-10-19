const MikageMarketFonts=new WeakMap();
function installMikageMarketFont(host,doc){
 if(MikageMarketFonts.has(doc))return MikageMarketFonts.get(doc);
 if(host.FontFace&&doc.fonts){try{const font=new host.FontFace('Mikage Market','url("'+MARKET_FONT_URL+'")');doc.fonts.add(font);const ready=font.load().catch(()=>{});MikageMarketFonts.set(doc,ready);return ready;}catch{}}
 return Promise.resolve();
}
function mountMikageMarket(host,container,options={}){
 const doc=container.ownerDocument,M=MikageMarketModel,stops=[],downloads=new Set();let seed=0,s=M.create(),disposed=false,recorded=false,outcome=null,storageNote='',look={player:'daily',tomoe:'usual'};
 const make=(tag,cls,text)=>{const e=doc.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const listen=(target,event,fn)=>{target.addEventListener(event,fn);stops.push(()=>target.removeEventListener(event,fn));};
 const root=make('section','mkmarket');root.dataset.region='R03';root.setAttribute('aria-label','妖怪横丁暗市鉴宝');root.tabIndex=-1;
 const header=make('header','mkm-header');header.append(make('p','mkm-place','妖怪横丁 · 百鬼暗市'),make('h3','','灯下，先看清再开口'));
 const banner=make('div','mkm-banner'),backdrop=make('img');backdrop.alt='妖怪横丁暗市的灯火';
 const art=options.art?.R03,url=typeof art==='string'?art:art?.[options.period||'night'];if(typeof url==='string'&&/^https:\/\/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)\//.test(url)){backdrop.src=url;backdrop.onerror=()=>backdrop.remove();banner.append(backdrop);}
 const figures=make('div','mkm-figures'),p=make('span'),t=make('span');figures.append(t,p);banner.append(figures);
 const content=make('div'),talk=make('p','mkm-talk');talk.setAttribute('role','status');talk.setAttribute('aria-live','polite');talk.setAttribute('aria-atomic','true');
 const footer=make('div','mkm-footer'),book=make('details','mkm-book'),summary=make('summary','','旧物回忆册'),bookBody=make('div');book.append(summary,bookBody);
 root.append(header,banner,content,talk,footer,book);container.append(root);
 function button(parent,label,fn,primary=false){const b=make('button',primary?'mkm-primary':'',label);b.type='button';b.onclick=()=>{if(!disposed)fn();};parent.append(b);return b;}
 const run=fn=>()=>{const active=root.getRootNode().activeElement||doc.activeElement,key=active?.dataset?.evidence||active?.dataset?.inspect,label=active?.textContent;fn();render();const nodes=[...content.querySelectorAll('button,input')],next=key?nodes.find(el=>el.dataset.evidence===key||el.dataset.inspect===key):nodes.find(el=>el.textContent===label);next?.focus({preventScroll:true});};
 button(footer,'再逛一圈',()=>{seed=(seed+1)%3;s=M.create(seed);recorded=false;outcome=null;storageNote='';render(true);});button(footer,'导出手记',exportBook);button(footer,'回到地图',()=>options.onClose?.());
 function readBook(){bookBody.replaceChildren();const entries=Object.values(options.getMemoryBook?.().entries||{});if(!entries.length)bookBody.append(make('p','','还没有收录。完成鉴物后会留下一张小笺。'));for(const e of entries)bookBody.append(make('p','',String(e.item||e.id)+' · '+String(e.detail||e.line||'')));}
 listen(book,'toggle',()=>{if(book.open)readBook();});
 function exportBook(){try{const data={schema:1,entries:options.getMemoryBook?.().entries||{},current:outcome};const url=host.URL.createObjectURL(new host.Blob([JSON.stringify(data,null,2)],{type:'application/json'}));downloads.add(url);const a=make('a');a.href=url;a.download='御影神社_暗市鉴物手记.json';doc.body.append(a);a.click();a.remove();}catch{talk.textContent='导出未成功。手记还留在当前页面，可以稍后重试。';}}
 function paint(){for(const [el,actor,outfit]of [[t,'tomoe',look.tomoe],[p,'player',look.player]]){try{if(!host.MikageCharacterArt?.paint)throw Error();host.MikageCharacterArt.paint(el,actor,outfit,'front',0);el.textContent='';el.classList.remove('mkm-fallback');}catch{el.style.backgroundImage='';el.style.clipPath='';el.textContent=actor==='tomoe'?'巴卫':'你';el.classList.add('mkm-fallback');}}}
 function appearance(v){if(disposed||!v)return;look={player:String(v.player||'daily'),tomoe:String(v.tomoe||'usual')};paint();}
 try{const api=host.MikageShrinePanels,v=api?.getAppearance?.();if(v?.then)v.then(appearance,()=>{});else if(v)appearance(v);if(typeof api?.subscribeAppearance==='function')stops.push(api.subscribeAppearance(appearance));}catch{}
 listen(host,'mikage:art-ready',paint);listen(host,'pagehide',dispose);
 function lead(title,text){content.append(make('h4','',title));if(text)content.append(make('p','mkm-lead',text));}
 function render(focus=false){if(disposed)return;content.replaceChildren();root.dataset.phase=s.phase;root.dataset.lot=M.current(s)?.id||'';
  if(s.phase==='ready'){
   lead('摊主的故事，听一半就够','纸灯一盏接着一盏。摊上摆着铜铃、手镜和折扇，个个都有来头。巴卫停在灯下：“要看就慢慢看，买不买又不由他。”');
   const notes=make('div','mkm-rules');notes.append(make('p','','翻看器物，收集线索；勾选依据后再判断。也可以随时留作待考。'),make('p','','没有倒计时，不动正式资源。纪念品是纸上纹样与手记。'));content.append(notes);
   const opts=make('div','mkm-actions');button(opts,'借面具遮住气息',run(()=>{M.start(s,'mask');}),true);button(opts,'沿摊外侧进去',run(()=>M.start(s,'follow')));content.append(opts);
  }else if(s.phase==='inspect'||s.phase==='reveal'){
   const lot=M.current(s);lead('第 '+(s.index+1)+' / 3 摊 · '+lot.name,lot.seller);
   const layout=make('div','mkm-layout'),tray=make('div','mkm-tray');tray.dataset.light=String(s.light);tray.dataset.view=s.view;
   const item=make('div','mkm-object');item.style.backgroundImage='url("'+MARKET_ART_URL+'")';item.style.backgroundPosition=({bell:'0%',mirror:'50%',fan:'100%'})[lot.id]+' center';item.setAttribute('role','img');item.setAttribute('aria-label',lot.name+'手绘示意；细节以右侧线索记录为准');tray.append(item,make('span','mkm-view-label',s.light?'狐火照物':{front:'正面',base:'底部与背面',ledger:'来历记录'}[s.view]));
   const paper=make('div','mkm-paper');paper.append(make('h5','','鉴物记录'));
   if(!s.seen.length)paper.append(make('p','mkm-empty','还没细看。先从下方选一个观察方式。'));
   for(const id of s.seen){const clue=lot.clues.find(c=>c.id===id),row=make('label','mkm-clue'),input=make('input');input.type='checkbox';input.checked=s.evidence.includes(id);input.disabled=s.phase!=='inspect';input.dataset.evidence=id;input.onchange=run(()=>M.select(s,id));const copy=make('span');copy.append(make('b','',clue.label),make('span','',clue.text));row.append(input,copy);paper.append(row);}
   layout.append(tray,paper);content.append(layout);
   if(s.phase==='inspect'){
    const tools=make('div','mkm-actions');for(const clue of lot.clues){const b=button(tools,clue.label,run(()=>M.inspect(s,clue.id)));b.dataset.inspect=clue.id;b.setAttribute('aria-pressed',String(s.view===clue.id&&s.seen.includes(clue.id)));}content.append(tools);
    content.append(make('p','mkm-instruction','勾选至少两条依据，再下结论。只凭妖气或摊主一句话不够。'));
    const verdict=make('div','mkm-actions');for(const [id,label]of Object.entries(M.verdicts)){const b=button(verdict,label,()=>{M.judge(s,id);render(true);},true);b.dataset.verdict=id;}content.append(verdict);
    const other=make('div','mkm-actions');button(other,'请巴卫看一眼',run(()=>M.hint(s)));button(other,'先不定论，记为待考',()=>{M.defer(s);render(true);});content.append(other);
   }else{
    const result=s.results.at(-1),seal=make('p','mkm-seal',result.status==='deferred'?'留待复查':M.verdicts[result.verdict]);content.append(seal);button(content,s.index===2?'收好鉴物记录':'去下一摊',()=>{M.next(s);render(true);},true);
   }
  }else if(s.phase==='receipt'){
   lead('摊货留在原处，带走一张小笺','挑一个纹样临摹在纸上，也可以只记结论。回去前想不想绕到笹平老酒铺，留张酒签拓记？');
   const form=make('div','mkm-receipt');const label=make('label','','纸上纹样'),select=make('select');select.setAttribute('aria-label','纸上纹样');for(const [id,name]of [['none','只记结论'],...M.lots.map(l=>[l.id,l.name+'纹样'])]){const opt=make('option','',name);opt.value=id;select.append(opt);}label.append(select);form.append(label);content.append(form);
   const opts=make('div','mkm-actions');button(opts,'留张酒签，收好手记',()=>finish(select.value,'label'),true);button(opts,'直接回去',()=>finish(select.value,'leave'));content.append(opts,make('p','mkm-instruction','只留纸上记录，不饮酒、不购买，也不把摊货记成已获得。'));
  }else if(s.phase==='done'&&outcome){lead(outcome.rank,outcome.detail);const receipt=make('div','mkm-result');for(const r of outcome.results){const row=make('p');row.append(make('strong','',r.name),make('span','',r.status==='deferred'?'留待复查':M.verdicts[r.verdict]));receipt.append(row);}content.append(receipt,make('p','mkm-instruction',storageNote||'暗市鉴物笺已收进旧物回忆册。'));}
  talk.textContent=s.message;paint();if(book.open)readBook();if(focus){const heading=content.querySelector('h4');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView({block:'nearest'});}}
 }
 function finish(keepsake,wine){const result=M.finish(s,keepsake,wine);if(!result)return;outcome=result;s.message='巴卫把折扇收回袖里。“看够了？那就走。”';if(!recorded){recorded=true;try{if(options.onComplete?.({...result,activityVersion:'market-1.32.0'})===false)storageNote='浏览器未允许本地保存，可用“导出手记”备份。';}catch{storageNote='记录回传未确认，可导出当前手记备份。';}}render(true);}
 function dispose(){if(disposed)return;disposed=true;stops.splice(0).forEach(fn=>{try{fn();}catch{}});downloads.forEach(url=>host.URL.revokeObjectURL(url));downloads.clear();root.remove();}
 render();void installMikageMarketFont(host,doc);Promise.resolve(host.MikageCharacterArt?.preloadWalk?.()).then(()=>{if(!disposed)paint();}).catch(()=>{});return {dispose,getState:()=>JSON.parse(JSON.stringify(s))};
}
