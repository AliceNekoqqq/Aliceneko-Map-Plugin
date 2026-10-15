/* Mikage Shrine · ten small, replayable moments. Native DOM/SVG; no persistence. */
(function (global) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const ICONS = {
    retry:'M4 9a8 8 0 1 1 0 7M4 3v6h6',
    close:'M6 6l12 12M18 6 6 18',
    leaf:'M12 21C1 17 4 4 22 3c0 16-6 20-10 18ZM7 18 19 7m-9 8-1-5m5 1 4 1',
    ginkgo:'M12 22v-9M12 16C5 17 0 11 2 7l6-4 4 3 4-3 6 4c2 4-3 10-10 9ZM12 16 7 6m5 10 5-10M12 16V7',
    camellia:'M12 22V9M12 19C1 14 4 3 12 2c8 1 11 12 0 17ZM12 9 8 6m4 7 5-6m-5 9-5-5',
    cat:'M5 10 4 3l6 4h4l6-4-1 8c4 9-18 13-14-1ZM9 12h.1m6-.1h.1M11 16h2M2 14l5 1m10 0 5-1',
    dango:'M12 2v21M17 6a5 4 0 1 1-10 0 5 4 0 1 1 10 0Zm0 7a5 4 0 1 1-10 0 5 4 0 1 1 10 0Zm0 7a5 4 0 1 1-10 0 5 4 0 1 1 10 0Z',
    boat:'m2 14 6 7h10l4-7H2Zm5 0 5-11 5 11M12 3v11M1 23q5-3 10 0t12 0',
    ticket:'M3 5h18v5a3 3 0 0 0 0 6v4H3v-4a3 3 0 0 0 0-6V5Zm12 0v15M7 10h4m-4 5h4',
    tram:'M5 3h14v15H5V3Zm0 10h14M8 18l-2 4m10-4 2 4M8 16h.1m8 0h.1M9 3V1h6v2M5 9h14',
    fern:'M12 23V3m0 5C6 8 4 4 5 2c5 0 7 3 7 6Zm0 5C4 13 2 9 3 7c6 0 9 3 9 6Zm0 5C5 18 2 15 2 13c7-1 10 1 10 5ZM12 9c7-1 9-4 9-6-6 0-9 2-9 6Zm0 7c8 0 11-4 10-7-7 0-10 3-10 7Z',
    firefly:'M12 8v14m0-11c-8-9-12 4-1 4m2-4c8-9 12 4 1 4M9 4l3 4 3-4M9 19h6',
    drum:'M4 7c0-6 16-6 16 0v11c0 6-16 6-16 0V7Zm0 0c0 6 16 6 16 0M6 11l12 10M18 11 6 21M2 1l5 4m15-4-5 4',
    lantern:'M7 4h10l4 6v6l-4 5H7l-4-5v-6l4-6Zm0 0h10M8 2h8M8 23h8M8 5l-2 8 2 7m8-15 2 8-2 7M3 12h18',
    heart:'M12 21C-8 8 5-3 12 6c7-9 20 2 0 15Z',
    seal:'m12 2 3 3 4-1 1 4 3 3-2 4 1 4-5 1-3 3-4-2-4 1-1-5-3-3 2-4-1-4 5-1 3-3ZM8 12l3 3 5-6',
    lighthouse:'m8 21 2-13h4l2 13M7 8h10l-5-6-5 6ZM9 14h6M1 5l5 1m12 0 5-1M5 23h14',
  };
  const META = {
    R01:['leaf','一篮庭院秋色','轻点五片落叶，把它们一片片收进竹篮。','庭前拾叶','五片落叶收拢成了庭院里的一小篮秋色。'],
    R02:['cat','与猫慢慢熟悉','先蹲下来，给猫一点时间。轻轻等待三次，再试着招呼它。','猫的信任','蹲下、等候与轻声招呼之后，猫愿意靠近一点了。'],
    R03:['dango','串起一签春色','选三颗喜欢的颜色，自由搭配，再把团子串起来。','三色小签','亲手搭配了一签三色团子，留下今日的配色。'],
    R04:['boat','让纸舟顺水走','选一张纸，折三次，再看着水道选择绕石的方向。没有时间限制。','纸舟顺流','把纸折成小舟，沿着清溪绕过三处石头。'],
    R05:['ticket','等车时的一枚票根','选择一个方向，挑选三枚图样，为自己的旅票盖章。','站前旅票','候车时盖好了三枚旅途印章，收藏一张自己的票根。'],
    R06:['tram','海风寄来的明信片','这里是临海电车站台。把海、灯塔与电车景戳放进卡片，再写一句寄语。','海风邮戳','在临海电车站台，拼好海景、灯塔与电车的明信片。'],
    R07:['fern','收集一页叶拓','在草木间找出三种叶片，再为它们选择拓印的颜色。','草木叶拓','找到三种不同轮廓的叶片，完成一页草木拓印。'],
    R08:['firefly','跟着微光呼吸','依次唤醒三簇萤火，再按它们闪亮的顺序轻点。不记得时随时看提示。','微光同行','唤醒三簇萤火，跟着它们的微光走过夜色。'],
    R09:['drum','神乐前的三拍练习','看着三拍图样依次敲击鼓心或鼓沿。不限时，也可以自由敲一会儿。','太鼓三拍','跟着三组图样敲出了属于今晚的太鼓节拍。'],
    R10:['lantern','把归途慢慢点亮','先选灯色，再轻点六盏纸灯。可以随时换色，留下一条自己的夜路。','灯下归途','一盏一盏点亮六盏纸灯，为归途留下一片温柔的光。'],
  };
  function el(tag, cls, text) { const n=document.createElement(tag); if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n; }
  function icon(name, cls) {
    const s=document.createElementNS(NS,'svg'); s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');s.setAttribute('class',`mka-icon ${cls||''}`);
    const p=document.createElementNS(NS,'path');p.setAttribute('d',ICONS[name]||ICONS.seal);s.append(p);return s;
  }
  function mount(container, options) {
    if (!container || typeof container.append !== 'function') throw new TypeError('MikageActivities requires a DOM container');
    const opts=options||{};
    const region=typeof opts.region==='string'?opts.region:(opts.region?.id||opts.region?.key||opts.region?.code||'R01');
    if (!META[region]) throw new RangeError(`Unknown activity region: ${region}`);
    const meta=META[region];
    let disposed=false,completed=false,generation=0,audio=null,sound=false;
    const timers=new Set();
    let state;
    const root=el('section','mka'+(opts.reducedMotion?' mka-reduced':''));root.setAttribute('aria-label',meta[1]);
    const heading=el('header','mka-heading');const emblem=el('span','mka-emblem');emblem.append(icon(meta[0]));
    const headingText=el('div');headingText.append(el('span','mka-kicker','御影 · 漫游小事'),el('h3','mka-title',meta[1]));heading.append(emblem,headingText);
    const help=el('p','mka-help',meta[2]);
    const stage=el('div',`mka-stage mka-stage-${region}`);
    const progress=el('p','mka-progress');progress.setAttribute('role','status');progress.setAttribute('aria-live','polite');progress.setAttribute('aria-atomic','true');
    const controls=el('div','mka-controls');
    const result=el('div','mka-result');result.hidden=true;result.setAttribute('role','status');
    const footer=el('footer','mka-footer');
    function button(text, action, cls, parent=controls) {const b=el('button',`mka-button ${cls||''}`,text);b.type='button';b.setAttribute('aria-label',text);b.addEventListener('click',()=>{if(!disposed)action(b);});parent.append(b);return b;}
    const replay=button('再玩一次',reset,'mka-quiet',footer);replay.prepend(icon('retry'));
    const close=button('收起小舞台',()=>{if(typeof opts.onClose==='function')opts.onClose();},'mka-quiet',footer);close.prepend(icon('close'));
    root.append(heading,help,stage,progress,controls,result,footer);container.append(root);
    function say(text){progress.textContent=text;}
    function clear(){stage.replaceChildren();controls.replaceChildren();}
    function later(fn,ms){const t=setTimeout(()=>{timers.delete(t);if(!disposed)fn();},ms);timers.add(t);}
    function cancelTimers(){timers.forEach(clearTimeout);timers.clear();}
    function finish(detail){
      if(completed||disposed)return;completed=true;
      result.hidden=false;result.replaceChildren(icon('seal'),el('div','',`小事完成 · ${meta[3]}`),el('p','',detail||meta[4]));
      say('这一刻已经收好。也可以再玩一次，换一种搭配。');
      if(typeof opts.onComplete==='function')opts.onComplete({region,title:meta[1],detail:detail||meta[4],stamp:meta[3]});
    }
    function sceneCaption(text){stage.append(el('div','mka-scene-caption',text));}
    function scenery(kind){const n=el('div',`mka-scenery mka-scenery-${kind}`);n.setAttribute('aria-hidden','true');stage.append(n);return n;}
    function choice(text,action,selected=false){const b=button(text,action,selected?'mka-selected':'');b.setAttribute('aria-pressed',String(selected));return b;}
    function reset(){
      cancelTimers();generation++;completed=false;result.hidden=true;
      state={step:0,selected:[],count:0};clear();render();
    }
    function render(){
      if(disposed)return;
      const active=document.activeElement;
      const restoreFocus=!!active&&root.contains(active);
      const activeLabel=restoreFocus?active.getAttribute('aria-label'):null;
      clear();handlers[region]();
      if(restoreFocus){
        const available=Array.from(root.querySelectorAll('button')).filter(b=>!b.disabled);
        const matching=activeLabel?available.find(b=>b.getAttribute('aria-label')===activeLabel):null;
        const target=matching||stage.querySelector('button:not(:disabled)')||controls.querySelector('button:not(:disabled)');
        target?.focus({preventScroll:true});
      }
    }
    const handlers={
      R01(){
        scenery('courtyard');sceneCaption('石阶微凉，扫帚轻轻擦过庭前。');
        const pile=el('div','mka-leaves');
        const positions=[[15,20,-28],[65,12,35],[37,45,-15],[74,59,70],[11,65,10]];
        positions.forEach(([x,y,r],i)=>{
          if(state.selected.includes(i))return;
          const b=button(`收起第${i+1}片落叶`,()=>{state.selected.push(i);render();if(state.selected.length===5)finish();},'mka-leaf',pile);
          b.style.cssText=`left:${x}%;top:${y}%;--turn:${r}deg`;b.replaceChildren(icon('leaf'));b.setAttribute('aria-label',`收起第${i+1}片落叶`);
        });
        stage.append(pile);const basket=el('div','mka-basket');
        basket.append(el('span','',`竹篮 · ${state.selected.length}/5`));
        const gathered=el('div','mka-gathered');state.selected.forEach((_,i)=>{const n=icon('leaf');n.style.setProperty('--turn',`${i*23-35}deg`);gathered.append(n);});basket.append(gathered);stage.append(basket);
        say(state.selected.length?`已经收好 ${state.selected.length} 片，竹篮里有沙沙的声音。`:'五片叶子散在庭前，轻点它们收入竹篮。');
      },
      R02(){
        scenery('garden');sceneCaption('不要急，猫会自己决定靠近的距离。');
        const cat=el('div','mka-cat'+(state.count>=3?' mka-cat-near':''));cat.append(icon('cat'),el('span','',state.step===2?'呼噜……':state.count>=3?'它抬头看你':'耳朵轻轻转动'));stage.append(cat);
        const trail=el('div','mka-patience');for(let i=0;i<3;i++)trail.append(el('span',i<state.count?'mka-dot mka-lit':'mka-dot'));stage.append(trail);
        if(state.step===0){say('它还躲在花丛边。先让自己的身影低一些。');button('慢慢蹲下',()=>{state.step=1;render();});}
        else if(state.step===1){
          say(state.count<3?`你安静地蹲着。留给它一点空间 · ${state.count}/3`:'它向前挪了两步，现在可以轻声招呼了。');
          button(state.count<3?'安静等一会儿':'再陪它待一会儿',()=>{state.count=Math.min(3,state.count+1);render();});
          button('轻声招呼',()=>{if(state.count<3){say(`它听到了，但还想观察一会儿。已经等了 ${state.count}/3 次。`);return;}state.step=2;render();finish();});
        }else{say('它把额头轻轻凑了过来。');button('轻轻回应它',()=>{cat.classList.remove('mka-nuzzle');void cat.offsetWidth;cat.classList.add('mka-nuzzle');say('你轻轻伸出手，它用额头碰了碰指尖。');});}
      },
      R03(){
        sceneCaption('把喜欢的颜色串成今天的心情。');
        const palette=[['樱粉','#e6a6b7'],['米白','#faf0d3'],['抹茶','#94ac79']];
        const stick=el('div','mka-dango-stick');
        for(let i=0;i<3;i++){const dot=el('span','mka-dango-ball');const value=state.selected[i];if(value!==undefined){dot.style.background=palette[value][1];dot.textContent=palette[value][0];}else dot.textContent='待选';stick.append(dot);}stage.append(stick);
        say(`已选 ${state.selected.length}/3 颗。${state.step?'这签配色看起来很适合今天。':'可以重复颜色，顺序由你决定。'}`);
        palette.forEach(([name,color],i)=>{const b=button(name,()=>{if(state.step)return;if(state.selected.length<3)state.selected.push(i);render();});b.style.setProperty('--swatch',color);b.classList.add('mka-swatch');b.disabled=state.step>0||state.selected.length>=3;});
        const undo=button('取下最后一颗',()=>{state.selected.pop();render();},'mka-quiet');undo.disabled=!state.selected.length||state.step>0;
        const done=button('串好这一签',()=>{state.step=1;render();finish(`配好了${state.selected.map(i=>palette[i][0]).join('、')}的一签团子。`);});done.disabled=state.selected.length!==3||state.step>0;
      },
      R04(){
        const papers=[['樱色','#edb6bf'],['竹青','#9bb8aa'],['月白','#eee5cd']];
        if(state.step===0){sceneCaption('先为小舟挑一张纸。');const paper=el('div','mka-paper');paper.style.background=papers[state.paper||0][1];stage.append(paper);papers.forEach(([name],i)=>choice(name,()=>{state.paper=i;render();},(state.paper||0)===i));button('就用这张纸',()=>{state.step=1;render();});say('纸色不会改变路线，选你喜欢的就好。');}
        else if(state.step<4){sceneCaption(['','对齐纸角，留下一条折痕。','收好两边，让船身站起来。','轻轻展开，让纸舟鼓起。'][state.step]);const paper=el('div',`mka-paper mka-fold-${state.step}`);paper.style.background=papers[state.paper||0][1];paper.append(icon(state.step===3?'boat':'ticket'));stage.append(paper);say(`折纸 · ${state.step-1}/3`);button(['','对折纸角','折起两边','展开船身'][state.step],()=>{state.step++;render();});}
        else{
          scenery('stream');sceneCaption('看清石头的位置，慢慢选一条水路。');
          const routes=['left','right','center'],obstacles=['右侧有石头，左侧的水更宽。','左侧有石头，右侧的水更宽。','两边都有石头，从中间穿过去。'];
          const boat=el('div',`mka-boat mka-boat-${state.route||'center'}`);boat.style.color=papers[state.paper||0][1];boat.append(icon('boat'));stage.append(boat);
          const stone=el('div',`mka-stones mka-stones-${state.count}`);stone.setAttribute('aria-hidden','true');stone.append(el('span'),el('span'));stage.append(stone);
          if(state.count>=3){say('纸舟越过三处石头，顺着清溪漂远了。');return;}
          say(`水道 · ${state.count}/3。${obstacles[state.count]}`);
          [['left','向左引导'],['center','顺着中间'],['right','向右引导']].forEach(([direction,label])=>button(label,()=>{state.route=direction;if(direction!==routes[state.count]){say(`小舟在岸边打了个转，还可以重新选择。${obstacles[state.count]}`);boat.className=`mka-boat mka-boat-${direction}`;return;}state.count++;render();if(state.count===3)finish();}));
        }
      },
      R05(){
        scenery('platform');sceneCaption('还不急着出发，先把候车的这一刻留在票根上。');
        const patterns=[['leaf','叶影'],['seal','花结'],['tram','电车']];
        const ticket=el('div','mka-ticket');ticket.append(el('span','mka-ticket-label','MIKAGE · 旅票'),el('strong','',`往 ${state.direction||'山侧'} 方向`));
        const stamps=el('div','mka-ticket-stamps');for(let i=0;i<3;i++){const cell=el('span','mka-stamp-slot');if(state.selected[i]!==undefined)cell.append(icon(patterns[state.selected[i]][0]));else cell.textContent='·';stamps.append(cell);}ticket.append(stamps);stage.append(ticket);
        if(!state.step){['山侧','临海','旧街'].forEach(v=>choice(`往${v}`,()=>{state.direction=v;render();},(state.direction||'山侧')===v));button('确定方向，开始盖章',()=>{state.step=1;render();});say('这是一张纪念旅票，票面的方向由你决定。');}
        else{say(`旅票盖章 · ${state.selected.length}/3。每一格都可以选喜欢的图样。`);patterns.forEach(([_,label],i)=>{const b=button(`盖一枚${label}`,()=>{state.selected.push(i);render();if(state.selected.length===3)finish(`在往${state.direction||'山侧'}的纪念旅票上，盖下了${state.selected.map(j=>patterns[j][1]).join('、')}。`);});b.disabled=state.selected.length===3;});}
      },
      R06(){
        scenery('coast-platform');sceneCaption('轨道沿着海岸延伸，站台上有风，也有远处的灯塔。');
        const types=[['boat','海面'],['lighthouse','灯塔'],['tram','电车']];
        const card=el('div','mka-postcard');card.append(el('span','mka-ticket-label','海风邮便 · COASTAL PLATFORM'));
        const collage=el('div','mka-collage');for(let i=0;i<3;i++){const cell=el('div','mka-collage-slot');if(state.selected[i]!==undefined){const [name,label]=types[state.selected[i]];cell.append(icon(name),el('span','',label));}else cell.append(el('span','',`景戳 ${i+1}`));collage.append(cell);}card.append(collage,el('p','mka-card-note',state.note||'等风，也等下一班电车。'));stage.append(card);
        types.forEach(([_,label],i)=>{const b=button(`放入${label}景戳`,()=>{state.selected.push(i);render();});b.disabled=state.selected.includes(i)||state.selected.length>=3||completed;});
        if(state.selected.length<3){say(`景戳 · ${state.selected.length}/3。按你喜欢的顺序摆放三种景色。`);}
        else{say('三种景色都在了，再为卡片挑一句寄语。');['等风，也等下一班电车。','把今天的海风寄给你。','愿每一次相逢都有回声。'].forEach(note=>{const b=choice(note,()=>{state.note=note;render();},(state.note||'等风，也等下一班电车。')===note);b.disabled=completed;});const b=button('收好明信片',()=>finish(`在临海电车站台，按${state.selected.map(i=>types[i][1]).join('、')}的顺序拼好明信片。寄语：${state.note||'等风，也等下一班电车。'}`));b.disabled=completed;}
      },
      R07(){
        const species=[['ginkgo','银杏','mka-ginkgo'],['fern','蕨叶','mka-fern'],['camellia','椿叶','mka-camellia']];
        if(state.step===0){scenery('grove');sceneCaption('看看叶缘和叶脉，三种叶片有不同的轮廓。');
          const grove=el('div','mka-grove');species.forEach(([name,label,cls],i)=>{const b=button(`寻找${label}`,()=>{if(!state.selected.includes(i))state.selected.push(i);render();},`mka-found-leaf ${cls} ${state.selected.includes(i)?'mka-found':''}`,grove);b.replaceChildren(icon(name),el('span','',state.selected.includes(i)?`${label} · 已找到`:label));b.disabled=state.selected.includes(i);});stage.append(grove);
          say(`找到 ${state.selected.length}/3 种叶片。已经找到的会留在纸页上。`);if(state.selected.length===3)button('把叶片放到拓纸上',()=>{state.step=1;render();});
        }else{sceneCaption('纸下是叶脉，纸上是慢慢显现的草木。');const paper=el('div',`mka-rubbing ${state.ink||''}`);species.forEach(([name,label,cls])=>{const n=el('div',cls);n.append(icon(name),el('span','',label));paper.append(n);});stage.append(paper);
          say('选择一层拓色，再轻轻压印。');[['moss','苔绿'],['rose','樱粉'],['ochre','赭金']].forEach(([value,label])=>{const b=choice(label,()=>{state.ink=value;render();},state.ink===value);b.disabled=completed;});const b=button('轻轻压出叶脉',()=>finish(`将银杏、蕨叶和椿叶拓在同一页纸上，留下${{moss:'苔绿',rose:'樱粉',ochre:'赭金'}[state.ink]}的草木纹路。`));b.disabled=!state.ink||completed;}
      },
      R08(){
        scenery('night');sceneCaption('微光不催促你。忘记了，也可以再看一遍。');
        const group=el('div','mka-fireflies');
        [0,1,2].forEach(i=>{const b=button(`第${i+1}簇萤火`,()=>{
          if(state.busy||completed)return;
          if(state.step===0){if(i!==state.count){say(`先轻点第 ${state.count+1} 簇，让微光一点点醒来。`);return;}state.count++;render();if(state.count===3){state.step=1;state.input=0;render();flash();}return;}
          if(i!==state.order[state.input]){state.input=0;say('没有关系，微光还在。可以从第一簇重新跟上，或再看提示。');return;}
          state.input++;b.classList.add('mka-glow');later(()=>b.classList.remove('mka-glow'),400);say(`跟上微光 · ${state.input}/3`);if(state.input===3)finish();
        },`mka-firefly ${state.step||i<state.count?'mka-awake':''}`,group);b.dataset.fly=String(i);b.replaceChildren(icon('firefly'),el('span','',`${i+1}`));b.disabled=!!state.busy||completed;});stage.append(group);
        if(!state.step)say(`唤醒微光 · ${state.count}/3。先轻点第 ${state.count+1} 簇。`);
        else{state.order ||= [1,0,2];say(state.busy?'看看微光闪亮的顺序……':`跟随闪亮顺序 · ${state.input||0}/3。无需赶时间。`);const hint=button('再看一次闪烁',flash);hint.disabled=!!state.busy||completed;button('显示数字提示',()=>say(`微光的顺序是：${state.order.map(i=>i+1).join(' → ')}。`),'mka-quiet');}
        function flash(){
          if(state.busy||disposed||completed)return;state.order ||= [1,0,2];state.input=0;
          if(opts.reducedMotion){say(`微光的顺序是：${state.order.map(i=>i+1).join(' → ')}。按顺序轻点即可。`);return;}
          state.busy=true;const gen=generation;render();
          state.order.forEach((i,j)=>{
            later(()=>{if(gen!==generation)return;stage.querySelector(`[data-fly="${i}"]`)?.classList.add('mka-glow');},j*850+150);
            later(()=>{if(gen!==generation)return;stage.querySelector(`[data-fly="${i}"]`)?.classList.remove('mka-glow');},j*850+700);
          });
          later(()=>{if(gen!==generation)return;state.busy=false;render();},2800);
        }
      },
      R09(){
        const patterns=[['咚','咚','咔'],['咔','咚','咔'],['咚','咔','咚']];
        sceneCaption('鼓心是「咚」，鼓沿是「咔」。让手指跟着眼睛走。');
        const drum=el('div','mka-drum');drum.append(icon('drum'));stage.append(drum);
        const pattern=patterns[Math.min(state.count,2)];const beats=el('div','mka-beats');pattern.forEach((beat,i)=>beats.append(el('span',`mka-beat ${i<(state.input||0)?'mka-beat-done':''} ${i===(state.input||0)?'mka-beat-next':''}`,beat)));stage.append(beats);
        say(state.free?'自由敲击中，不计对错。切回练习可继续。':`第 ${Math.min(state.count+1,3)}/3 组 · 已跟上 ${state.input||0}/3 拍。`);
        ['咚','咔'].forEach(beat=>{const b=button(beat==='咚'?'咚 · 鼓心':'咔 · 鼓沿',()=>{
          tone(beat);drum.classList.remove('mka-hit');void drum.offsetWidth;drum.classList.add('mka-hit');
          if(state.free){say(`你敲了一声「${beat}」，鼓声轻轻荡开。`);return;}if(completed)return;
          if(beat!==pattern[state.input||0]){state.input=0;say('差一点点。照着图样，从第一拍重新试试。');beats.querySelectorAll('.mka-beat').forEach((n,i)=>{n.classList.remove('mka-beat-done');n.classList.toggle('mka-beat-next',i===0);});return;}
          state.input=(state.input||0)+1;if(state.input===3){state.count++;state.input=0;if(state.count===3){render();finish();return;}}render();
        },'mka-drum-button');b.disabled=completed&&!state.free;});
        button(state.free?'回到三拍练习':'自由敲一会儿',()=>{state.free=!state.free;render();},'mka-quiet');
        const soundButton=button(sound?'声音已开启 · 点击静音':'声音关闭 · 点击开启',async()=>{if(sound){sound=false;render();return;}try{const Audio=global.AudioContext||global.webkitAudioContext;if(!Audio){say('当前环境不支持声音，仍然可以看图样练习。');return;}audio ||= new Audio();await audio.resume();if(disposed)return;sound=true;render();}catch(_){say('声音暂时无法开启，仍然可以看图样练习。');}},'mka-quiet');soundButton.setAttribute('aria-pressed',String(sound));
        function tone(beat){if(!sound||!audio)return;try{const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime;osc.type='sine';osc.frequency.setValueAtTime(beat==='咚'?160:420,t);osc.frequency.exponentialRampToValueAtTime(beat==='咚'?65:210,t+.15);gain.gain.setValueAtTime(.13,t);gain.gain.exponentialRampToValueAtTime(.001,t+.2);osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+.22);}catch(_){sound=false;}}
      },
      R10(){
        const colors=[['warm','暖金'],['sakura','樱粉'],['jade','青灯']];state.color ||= 'warm';
        scenery('night-path');sceneCaption('天色深了，每一盏灯都可以有自己的颜色。');
        const row=el('div','mka-lanterns');for(let i=0;i<6;i++){const lit=state.selected[i];const b=button(`第${i+1}盏灯${lit?'，已点亮，可换色':'，尚未点亮'}`,()=>{if(completed)return;state.selected[i]=state.color;render();},`mka-lantern ${lit?'mka-lantern-lit mka-'+lit:''}`,row);b.replaceChildren(icon('lantern'),el('span','',String(i+1)));b.disabled=completed;}stage.append(row);
        colors.forEach(([key,label])=>{const b=choice(label,()=>{if(completed)return;state.color=key;render();},state.color===key);b.disabled=completed;});
        const litCount=state.selected.filter(Boolean).length;
        say(completed?'六盏灯的颜色已收进这一幕。再玩一次，可以点亮另一种夜色。':`已点亮 ${litCount}/6 盏。选好颜色后点灯，亮过的灯也可以换色。`);
        if(litCount===6){const save=button('收好这一幕',()=>{finish(`点亮六盏纸灯：${colors.map(([key,label])=>`${label}${state.selected.filter(c=>c===key).length}盏`).join('、')}。`);render();});save.disabled=completed;}
      },
    };
    reset();
    return {dispose(){if(disposed)return;disposed=true;generation++;cancelTimers();if(audio){try{const closing=audio.close();closing?.catch?.(()=>{});}catch(_){}audio=null;}root.remove();}};
  }
  global.MikageActivities={mount};
})(window);
