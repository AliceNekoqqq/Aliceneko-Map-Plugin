/* Mikage Shrine · ten replayable, choice-led moments. Small DOM/SVG scenes, with project art loaded on demand. */
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
    R01:['leaf','一篮庭院秋色','先听风，再把散落的叶子拢起来，决定庭院要留下怎样的秋色。','庭前拾叶','把庭院收拾成自己喜欢的样子。'],
    R02:['cat','与猫慢慢熟悉','蹲下来观察它的耳朵和尾巴，再选择一种它觉得舒服的相处方式。','猫的信任','猫记住了你的动作，也按自己的节奏回应了你。'],
    R03:['dango','串起一签春色','搭配三颗团子、逐颗调好火候，再选蘸料与点缀，做成只属于今天的一签点心。','春日手作','按喜欢的顺序搭配团子，观察火候烤出金边，再配上蘸料与最后点缀。'],
    R04:['boat','让纸舟顺水走','先决定船形与纸色，再观察水流，给小舟选一条合适的路线。没有时间限制。','纸舟顺流','为纸舟选好船形，在不同水势间调整航线，让它沿溪漂远。'],
    R05:['ticket','等车时的一枚票根','挑定目的方向，串起两处停靠站，再逐站盖印，排成一段完整的小旅行。','站前旅票','从站前出发，按顺序安排两处停靠与终点，再为每一站盖上不同纪念印。'],
    R06:['tram','海风寄来的明信片','与巴卫在候车区共同取景，亲手排版装饰，再选一句你想对他说的话。','海风邮戳','从临海电车站台拍下一张构图与装饰都由自己选择的明信片。'],
    R07:['fern','收集一页叶拓','沿着脚印、树皮或落叶找到三种叶片，再在拓纸上亲手来回压印。','草木叶拓','循着林间线索找到三种叶片，在拓纸上慢慢压出带颜色的叶脉。'],
    R08:['firefly','跟着微光呼吸','选择听芦苇还是看水面，记住两段逐渐变长的萤火顺序；可以随时重看。','微光同行','循着自己选择的线索，记住两段萤火顺序，在夜色里慢慢跟上。'],
    R09:['drum','神乐前的三拍练习','选择稳拍或轻快合拍，跟着三段逐渐变化的四拍节奏敲鼓；也能自由合奏。','太鼓三拍','选好节奏后跟上三段四拍节奏，敲出属于今晚的合奏。'],
    R10:['lantern','把归途慢慢点亮','先挑灯路和灯色，再逐盏点亮，可以随时改动摆放前的配色。','灯下归途','选好灯路与灯色，点亮六盏纸灯，为归途留下一片温柔的光。'],
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
    const root=el('section','mka'+(opts.reducedMotion?' mka-reduced':''));root.dataset.region=region;root.dataset.period=opts.period||'day';root.setAttribute('aria-label',meta[1]);
    const heading=el('header','mka-heading');const emblem=el('span','mka-emblem');emblem.append(icon(meta[0]));
    const headingText=el('div');headingText.append(el('span','mka-kicker','御影 · 漫游小事'),el('h3','mka-title',meta[1]));heading.append(emblem,headingText);
    const help=el('p','mka-help',meta[2]);
    const stage=el('div',`mka-stage mka-stage-${region}`);
    stage.dataset.period=opts.period||'day';
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
    function assetUrl(assetKey){const source=assetKey&&opts.art?.[assetKey];const url=typeof source==='string'?source:(source?.[opts.period]||source?.default);return typeof url==='string'&&/^https:\/\/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)\//.test(url)?url:null;}
    function finish(detail, extra){
      if(completed||disposed)return;completed=true;
      result.hidden=false;result.replaceChildren(icon('seal'),el('div','',`小事完成 · ${meta[3]}`),el('p','',detail||meta[4]));
      say('这一刻已经收好。也可以再玩一次，换一种搭配。');
      if(typeof opts.onComplete==='function')opts.onComplete({region,title:meta[1],detail:detail||meta[4],stamp:meta[3],...(extra||{})});
    }
    function sceneCaption(text){stage.append(el('div','mka-scene-caption',text));}
    function scenery(kind,assetKey){
      const n=el('div',`mka-scenery mka-scenery-${kind}`);n.setAttribute('aria-hidden','true');
      const url=assetUrl(assetKey);
      if(url){
        const art=el('img','mka-scene-art');art.alt='';art.decoding='async';art.loading='eager';art.src=url;art.addEventListener('error',()=>art.remove(),{once:true});n.append(art);
      }
      stage.append(n);return n;
    }
    function choice(text,action,selected=false){const b=button(text,action,selected?'mka-selected':'');b.setAttribute('aria-pressed',String(selected));return b;}
    function reset(){
      cancelTimers();generation++;completed=false;result.hidden=true;
      state={step:0,selected:[],count:0,stage:0};clear();render();
    }
    function render(){
      if(disposed)return;
      const active=root.getRootNode()?.activeElement||document.activeElement;
      const restoreFocus=!!active&&root.contains(active);
      const activeLabel=restoreFocus?active.getAttribute('aria-label'):null;
      clear();handlers[region]();
      if(restoreFocus){
        const available=Array.from(root.querySelectorAll('button')).filter(b=>!b.disabled);
        const matching=activeLabel?available.find(b=>b.getAttribute('aria-label')===activeLabel):null;
        const target=matching||stage.querySelector('button:not(:disabled)')||controls.querySelector('button:not(:disabled)')||available[0];
        target?.focus({preventScroll:true});
      }
    }
    function workflow(labels){
      const n=el('div','mka-workflow');labels.forEach((label,i)=>n.append(el('span',i===state.step?'is-current':i<state.step?'is-done':'',`${i+1} · ${label}`)));stage.append(n);
    }
    function story(tomoe,player){
      const n=el('div','mka-story mka-duet');
      [['tomoe','巴卫',tomoe],['heroine','你',player]].forEach(([key,name,line])=>{if(!line)return;const row=el('div',`mka-duet-row mka-duet-${key}`);const url=assetUrl(key);if(url){const img=el('img','mka-duet-portrait');img.alt='';img.setAttribute('aria-hidden','true');img.src=url;const avatar=el('span','mka-duet-avatar');avatar.append(img);img.addEventListener('error',()=>avatar.remove(),{once:true});row.append(avatar);}row.append(el('p',key==='tomoe'?'mka-story-tomoe':'mka-story-player',`${name}：${line}`));n.append(row);});controls.append(n);
      state.companion={tomoe,player:player||''};
    }
    function finishMoment(detail,choices){finish(detail,{activityVersion:3,choices,companion:state.companion});}
    const handlers={
      R01(){
        scenery('courtyard','R01');workflow(['听风','合力扫叶','安排秋色','收好这一刻']);
        const wind={east:{name:'东风',arrow:'←',hint:'叶尖都指向左边，左侧背风处能拢住落叶。',side:'left'},west:{name:'西风',arrow:'→',hint:'叶片正向右边滑动，右侧石灯后是背风处。',side:'right'}};
        state.wind ||= generation%2===1?'east':'west';const breeze=wind[state.wind];
        const positions=[[14,23,-24],[39,18,28],[70,28,-8],[27,57,49],[58,62,-30],[83,56,15]];
        state.swept ||= [];state.layout ||= 'clear';
        if(state.step===0){
          sceneCaption('先看叶尖的方向，再请巴卫把竹篮放到背风处。');
          const cue=el('div','mka-yard-wind',`${breeze.arrow} ${breeze.name} · ${breeze.hint}`);stage.append(cue);
          story('先别急着追着叶子跑。看看风往哪边吹，你来指路，我拿篮子。');
          say(state.feedback||'观察风向，选择竹篮的位置。选错可以重新放。');
          [['left','请巴卫把竹篮放在左侧'],['right','请巴卫把竹篮放在右侧']].forEach(([side,label])=>button(label,()=>{if(side!==breeze.side){state.feedback='一阵风把叶子吹出了篮边。巴卫提起篮子，等你重新选个背风处。';render();return;}state.step=1;state.feedback='';render();}));return;
        }
        if(state.step===1){
          sceneCaption('按住落叶，顺着风拖到竹篮；也能逐片收拢。');
          const board=el('div','mka-yard-board');board.style.touchAction='pan-y';board.dataset.side=breeze.side;
          board.append(el('div','mka-yard-wind',`${breeze.arrow} ${breeze.name} · 巴卫稳稳扶着竹篮`));
          const basket=el('div','mka-yard-basket',`竹篮 ${state.swept.length}/6`);basket.style.left=breeze.side==='left'?'3%':'77%';basket.style.right='auto';basket.style.width='20%';board.append(basket);
          const gather=i=>{if(state.swept.includes(i)||completed)return;state.swept.push(i);state.feedback=state.swept.length===3?'巴卫把最后几片叶子拢到你面前：「慢慢来，石阶已经露出来了。」':'';render();};
          positions.forEach(([x,y,r],i)=>{if(state.swept.includes(i))return;
            const leaf=button(`收拢第${i+1}片落叶`,()=>gather(i),'mka-yard-leaf',board);leaf.replaceChildren(icon(i%2?'ginkgo':'leaf'));leaf.style.cssText=`--x:${x}%;--y:${y}%;--turn:${r}deg;left:${x}%;top:${y}%;touch-action:none`;
            let dragging=false,moved=false,suppress=false;let startX=0,startY=0;
            leaf.addEventListener('pointerdown',event=>{dragging=true;moved=false;startX=event.clientX;startY=event.clientY;leaf.setPointerCapture(event.pointerId);});
            leaf.addEventListener('pointermove',event=>{if(!dragging)return;const rect=board.getBoundingClientRect();if(Math.hypot(event.clientX-startX,event.clientY-startY)>5)moved=true;if(!moved)return;leaf.style.left=`${Math.max(0,Math.min(95,(event.clientX-rect.left)/rect.width*100))}%`;leaf.style.top=`${Math.max(0,Math.min(85,(event.clientY-rect.top)/rect.height*100))}%`;});
            leaf.addEventListener('pointerup',event=>{if(!dragging)return;dragging=false;if(!moved)return;suppress=true;const rect=basket.getBoundingClientRect();if(event.clientX>=rect.left-24&&event.clientX<=rect.right+24&&event.clientY>=rect.top-24&&event.clientY<=rect.bottom+24)gather(i);else{leaf.style.left=`${x}%`;leaf.style.top=`${y}%`;say('叶子还没进篮，再顺着风拖一次；也可以用下方按钮。');}later(()=>{suppress=false;},0);});
            leaf.addEventListener('click',event=>{if(suppress||moved){event.stopImmediatePropagation();event.preventDefault();}},true);
            leaf.addEventListener('pointercancel',()=>{dragging=false;moved=false;leaf.style.left=`${x}%`;leaf.style.top=`${y}%`;});
          });stage.append(board);
          story(state.feedback||'你扫过来，我接着。别把参道边的小草也扫进去了。');
          say(`已经合力收好 ${state.swept.length}/6 片。拖进篮子或点击叶片，下方也有等效按钮。`);
          const next=positions.findIndex((_,i)=>!state.swept.includes(i));if(next>=0)button('顺风收拢下一片',()=>gather(next));else button('一起安排庭院秋色',()=>{state.step=2;render();});return;
        }
        const layouts={clear:{label:'石阶留白',line:'把石阶扫干净，树下留一小堆吧。',tomoe:'参拜的人走得稳，树根也有落叶护着。你想得倒周全。'},heart:{label:'树下心形',line:'树下拼个小小的心形，你帮我扶住这一边。',tomoe:'这么讲究……好，左边我来。风吹散之前，先陪你看一会儿。'},ring:{label:'围树秋环',line:'围着树根铺一圈，把参道留出来。',tomoe:'好。叶子围着树，人走石阶，谁也不挡谁的路。'}};
        const layout=layouts[state.layout];const art=el('div','mka-yard-arrangement');art.dataset.layout=state.layout;
        positions.forEach(([x,y,r],i)=>{const n=el('span','mka-yard-token');n.append(icon(i%2?'ginkgo':'leaf'));let px=x,py=y;if(state.layout==='heart'){px=[32,43,55,66,42,56][i];py=[35,29,29,35,50,50][i];}else if(state.layout==='ring'){px=50+25*Math.cos(i*Math.PI/3);py=45+22*Math.sin(i*Math.PI/3);}else{px=20+i*11;py=65+(i%2)*8;}n.style.cssText=`--x:${px}%;--y:${py}%;--turn:${r}deg;left:${px}%;top:${py}%`;art.append(n);});stage.append(art);
        if(state.step===2){sceneCaption('参道保持通畅，树下的秋色由你安排。');story('石阶已经干净了。剩下这些叶子，想怎么摆？');say('三种安排都能完成；预览后可随时换一种。');Object.entries(layouts).forEach(([key,item])=>choice(item.label,()=>{state.layout=key;render();},key===state.layout));button('就这样，和巴卫一起摆好',()=>{state.step=3;render();finishMoment(`与巴卫听${breeze.name}、合力收好六片落叶，在不挡参道的树下布置「${layout.label}」。你说：「${layout.line}」巴卫回应：「${layout.tomoe}」`,{wind:state.wind,layout:state.layout});});return;}
        sceneCaption(`庭院已布置 · ${layout.label}`);story(layout.tomoe,layout.line);say('石阶清爽，树下留着你们一起摆好的秋色。');
      },
      R02(){
        scenery('garden','R02');workflow(['观察姿态','留出距离','等待回应','共同记忆']);
        state.distance ??= 2;const mood=state.feedback?'cautious':state.step===0?'watch':state.step<3?'curious':state.catEnding==='nap'?'sleepy':'relaxed';
        const cat=el('div','mka-cat-scene');cat.dataset.mood=mood;
        const url=assetUrl('cat');if(url){const img=el('img','mka-cat-portrait');img.src=url;img.alt='花盆边的小猫';img.addEventListener('error',()=>img.replaceWith(icon('cat')),{once:true});const window=el('div','mka-cat-art-window');window.append(img);cat.append(window);}else cat.append(icon('cat','mka-cat-portrait'));
        cat.append(el('span','mka-cat-tail'),el('p','mka-cat-caption',state.feedback?'它缩在花盆边，身体压低，先给它多一点空间。':state.step===0?'耳朵朝向你，尾巴贴着爪边，还没有主动靠近。':state.step<3?'它嗅了嗅空气，耳朵转向你们，仍站在自己的位置。':state.catEnding==='nap'?'它把尾巴绕住爪子，安静地望着你们。':state.catEnding==='play'?'它伸出爪子拨了一下玩具，又抬头看看你们。':'它自己走近半步，轻轻闻了闻你停住的手。'));stage.append(cat);
        const signs=el('div','mka-cat-signs');(state.feedback?['身体压低：有些紧张','停下动作，留出退路','重新拉开距离']:state.step>=3?['身体放松：可以安心停留','猫自己选择了回应','慢慢结束，不强行抱起']:['耳朵朝向你：还在观察','尾巴收在身边：暂未靠近','让猫决定是否靠近']).forEach(text=>signs.append(el('span','',text)));stage.append(signs);
        if(state.step===0){story('它还在看我们。先蹲下来，别堵着花盆旁的出口。你觉得它现在想怎样？');say(state.feedback||'观察姿态，选择下一步。这里没有必须摸到猫的目标。');button('它还在观察，我们先留出空间',()=>{state.step=1;state.feedback='';render();});button('我想先伸手摸摸它',()=>{state.feedback='猫把身体往花盆后缩了一点。巴卫放低声音：「先把手收回来，让它看清楚。」可以重新观察。';render();});return;}
        if(state.step===1){
          const distance=el('div','mka-cat-distance');['一臂以内','一臂之外','两步之外'].forEach((label,i)=>{const n=el('i',state.distance===i?'is-active':'');n.textContent=label;distance.append(n);});stage.append(distance);
          story('我替你挡着路过的人。距离由你决定，让它随时能走开。');say(state.feedback||'挑一个距离和招呼方式，再看看它自己的回应。');
          ['一臂以内','一臂之外','两步之外'].forEach((label,i)=>choice(label,()=>{state.distance=i;render();},state.distance===i));
          [['toy','把玩具放在它够得到的地方'],['quiet','侧身坐下，移开视线'],['hand','把手停住，让它自己来闻']].forEach(([key,label])=>button(label,()=>{if(state.distance===0){state.feedback='这个位置让它有些紧张。你与巴卫一起退开，重新选一个更宽松的距离。';state.distance=1;render();return;}state.approach=key;state.step=2;state.feedback='';render();}));return;
        }
        if(state.step===2){
          story(state.approach==='toy'?'玩具放稳了，别往它身上晃。它想玩时自然会过来。':state.approach==='hand'?'手就停在那里。它不靠近也没关系，我陪你等。':'这会儿安静些也好。它看起来没那么绷着了。');say('你来选怎样结束这次相处。每种结果都会留下不同的记忆。');
          [['play','请巴卫轻轻挪动玩具，我留出退路'],['sniff','我把手放低，等它闻一闻'],['nap','和巴卫安静坐着，让猫休息']].forEach(([key,label])=>button(label,()=>{state.catEnding=key;state.step=3;render();const endings={play:'你留出退路，巴卫把玩具轻轻挪开半寸。猫自己拨动了玩具，你与巴卫一起等它的下一次动作。',sniff:'你把手停在低处，巴卫安静守在一旁。猫自己靠近闻了闻，你没有继续伸手催它。',nap:'你与巴卫侧身安静坐着，猫在花盆边放松地坐着。巴卫也放轻了整理衣袖的动作。'};finishMoment(endings[key],{distance:state.distance,approach:state.approach,ending:key});}));return;
        }
        const lines={play:['看吧，它玩得挺认真。我再把玩具轻轻挪开一点。','我留出退路，你轻轻挪动玩具。'],sniff:['嗯，它记住这股气味了。今天就到这里也很好。','我把手放低，等它自己来闻。'],nap:['我也坐这里。让它安心休息一会儿。','我们安静坐着，让它休息吧。']};story(...lines[state.catEnding]);say('猫按自己的节奏回应，你和巴卫一起收好这段相处。');
      },
      R03(){
        scenery('dango','R03');
        sceneCaption(['捏制三颗团子','看香气调火候 · 不限时','选蘸料与最后点缀','春日小签已完成'][state.step]||'串起一签春色');
        const palette=[['樱粉','#e5a0ae'],['米白','#f5e7c9'],['抹茶','#8fae78']];
        const sauces=[['honey','黑蜜黄豆粉'],['berry','樱花糖霜'],['tea','抹茶碎']];
        const toppings=[['petal','盐渍樱花'],['kinako','黄豆粉'],['tea','茶叶细末']];
        state.roastIndex ??= 0;state.heat ??= 1;state.roasted ||= [];
        const phase=Math.min(state.step,2);
        const steps=el('div','mka-dango-steps');
        [['捏制',0],['烘烤',1],['点睛',2]].forEach(([label,index])=>{const item=el('span',`mka-dango-step${phase===index?' is-current':''}${phase>index?' is-done':''}`);item.append(el('i','',phase>index?'✓':String(index+1)),el('b','',label));steps.append(item);});stage.append(steps);
        const stick=el('div',`mka-dango-stick${state.step>=3?' is-finished':''}`);stick.setAttribute('aria-label','三颗团子串');
        for(let i=0;i<3;i++){
          const dot=el('span',`mka-dango-ball${state.roasted[i]?' is-roasted':''}`);const value=state.selected[i];
          if(value!==undefined){dot.style.setProperty('--ball-color',palette[value][1]);dot.dataset.flavor=['sakura','milk','matcha'][value];dot.setAttribute('aria-label',`${palette[value][0]}团子${state.roasted[i]?'，已烤好':''}`);}
          else {dot.textContent='+';dot.setAttribute('aria-label',`第${i+1}颗待选`);}
          if(state.step===1&&i===state.roastIndex)dot.classList.add('is-current');
          if(state.justAdded===i)dot.classList.add('mka-dango-added');
          if(state.sauce)dot.dataset.sauce=state.sauce;
          stick.append(dot);
        }
        if(state.garnish)stick.dataset.garnish=state.garnish;
        stage.append(stick);state.justAdded=null;

        if(state.step===0){
          say(`捏制面团 · ${state.selected.length}/3。按顺序挑颜色，重复搭配也可以。`);
          palette.forEach(([name,color],i)=>{const b=button(name,()=>{if(state.selected.length<3){state.selected.push(i);state.justAdded=state.selected.length-1;}render();});b.style.setProperty('--swatch',color);b.classList.add('mka-swatch');b.disabled=state.selected.length>=3;});
          const undo=button('撤回最后一颗',()=>{state.selected.pop();render();},'mka-quiet');undo.disabled=!state.selected.length;
          if(state.selected.length===3)button('开始慢火烘烤',()=>{state.step=1;state.roastIndex=0;state.heat=1;render();});
          return;
        }

        if(state.step===1){
          const index=state.roastIndex,colorIndex=state.selected[index],name=palette[colorIndex][0];
          const target=(colorIndex+index)%3;
          const roast=el('div',`mka-roast-card heat-${state.heat}`);
          roast.append(el('span','mka-roast-label',`第 ${index+1} 颗 · ${name}`),el('strong','mka-roast-message',state.roastFeedback||'看着团子表面的细纹，慢慢调火。'));
          const meter=el('div','mka-heat-meter');meter.setAttribute('aria-label',`当前${['微火','中火','旺火'][state.heat]}`);
          ['微火','中火','旺火'].forEach((label,i)=>{const cell=el('span',`mka-heat-cell${state.heat===i?' is-active':''}`);cell.append(el('i',''),el('b','',label));meter.append(cell);});
          roast.append(meter);stage.append(roast);
          say(`慢火烘烤 · ${index+1}/3。先试火候，再翻面观察；不合适可以调火重试。`);
          if(state.heat>0)button('收一档火',()=>{state.heat--;state.roastFeedback='火苗收稳了，再翻面看看。';render();});
          if(state.heat<2)button('添一档火',()=>{state.heat++;state.roastFeedback='火力升了一档，再翻面看看。';render();});
          button('翻面看火候',()=>{
            if(state.heat!==target){state.roastFeedback=state.heat<target?'香气还没醒，添一档火再看看。':'边缘起焦香了，收一档火再翻面。';render();return;}
            state.roasted[index]=true;state.roastFeedback='';state.roastIndex++;state.heat=1;
            if(state.roastIndex>=3){state.step=2;state.roastIndex=2;}
            render();
          });
          return;
        }

        if(state.step===2){
          const sauceLabel=sauces.find(x=>x[0]===state.sauce)?.[1];
          const toppingLabel=toppings.find(x=>x[0]===state.garnish)?.[1];
          if(sauceLabel&&toppingLabel){const plate=el('div','mka-finish-note');plate.append(el('b','',`${sauceLabel} · ${toppingLabel}`),el('span','','火候恰好，香气正好落在这一签里。'));stage.append(plate);}
          say('三颗都烤好了。选一道蘸料，再添一笔点缀，做成自己的配方。');
          sauces.forEach(([key,label])=>choice(label,()=>{state.sauce=key;render();},state.sauce===key));
          toppings.forEach(([key,label])=>choice(`点缀：${label}`,()=>{state.garnish=key;render();},state.garnish===key));
          const done=button('盖印收好这一签',()=>{state.step=3;const detail=`按${state.selected.map(i=>palette[i][0]).join('、')}的顺序串成三颗团子，逐颗观察火候烤出金边，再配上${sauceLabel}与${toppingLabel}。`;render();finish(detail);});
          done.disabled=!state.sauce||!state.garnish;
          return;
        }

        const sauceLabel=sauces.find(x=>x[0]===state.sauce)?.[1]||'';
        const toppingLabel=toppings.find(x=>x[0]===state.garnish)?.[1]||'';
        const seal=el('div','mka-dango-seal');seal.append(icon('seal'),el('span','',`春日手作 · ${sauceLabel}`),el('b','',toppingLabel));stage.append(seal);
        say('这张配方已经盖印收好。散策手帖会记下你的搭配。');
      },
      R04(){
        const papers=[['樱色','#edb6bf'],['竹青','#9bb8aa'],['月白','#eee5cd']];
        const boats=[['flat','宽底稳航'],['swift','尖首快行'],['charm','双纸饰船']];
        if(state.step===0){scenery('stream','R04');sceneCaption('纸色与船形会留下不同的旅程。');const paper=el('div',`mka-paper ${state.boat?'mka-fold-'+state.boat:''}`);paper.style.background=papers[state.paper??0][1];paper.append(icon('boat'));stage.append(paper);papers.forEach(([name],i)=>choice(name,()=>{state.paper=i;render();},(state.paper??0)===i));boats.forEach(([key,label])=>choice(label,()=>{state.boat=key;render();},state.boat===key));button('选好纸与船形',()=>{state.step=1;render();});say('先挑纸色和船形；之后每次都能根据水面的提示慢慢选路。');}
        else if(state.step<4){scenery('stream','R04');sceneCaption(['','对齐纸角，留下一条折痕。','收好两边，让船身站起来。','轻轻展开，让纸舟鼓起。'][state.step]);const paper=el('div',`mka-paper mka-fold-${state.step}`);paper.style.background=papers[state.paper||0][1];paper.append(icon(state.step===3?'boat':'ticket'));stage.append(paper);say(`折纸 · ${state.step-1}/3`);button(['','对折纸角','折起两边','展开船身'][state.step],()=>{state.step++;render();});}
        else{
          scenery('stream','R04');sceneCaption('按住纸舟，拖过下一道水门；也可以用下方按钮选路。');
          const courses={flat:{routes:['left','right','center'],hints:['右侧石头密，左边水面更宽。','左边水流急，右侧水面平稳。','两岸石头靠拢，中间留有一条窄水道。']},swift:{routes:['center','left','right'],hints:['水草向两边分开，中间水流最快。','右岸石头凸出，左侧能顺势绕开。','左边水花回旋，右侧水道更直。']},charm:{routes:['right','center','left'],hints:['左岸有浅滩，右侧水线连贯。','石头向右侧聚拢，中间留出空隙。','右岸水花回旋，左侧能平稳靠岸。']}};
          const course=courses[state.boat||'flat'];
          if(state.count>=3){say('纸舟越过三处石头，顺着清溪漂远了。');return;}
          const lanes={left:116,center:360,right:604},gates=[126,232,338];
          state.riverPath=state.riverPath||[];
          const board=el('canvas','mka-river-canvas');board.width=720;board.height=420;board.setAttribute('role','application');board.setAttribute('aria-label',`纸舟河道，第 ${state.count+1} 道水门，共三道。按住小舟拖过正确水道，或使用下方方向按钮。`);board.tabIndex=0;stage.append(board);
          let attempt=[];let dragging=false;
          const draw=()=>{
            const ctx=board.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,720,420);
            ctx.save();ctx.beginPath();ctx.moveTo(78,0);ctx.bezierCurveTo(155,110,92,290,156,420);ctx.lineTo(564,420);ctx.bezierCurveTo(625,275,556,125,642,0);ctx.closePath();ctx.fillStyle='#d9ebe0b8';ctx.fill();
            ctx.strokeStyle='#f8fff0a8';ctx.lineWidth=4;for(let i=0;i<7;i++){const x=152+i*68;ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x+36,110,x-29,270,x+8,420);ctx.stroke();}ctx.restore();
            const laneX=direction=>lanes[direction];
            state.riverPath.forEach((direction,i)=>{const x=laneX(direction),y=gates[i];ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fillStyle='#8ba995';ctx.fill();ctx.strokeStyle='#f8f4df';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✓',x,y);});
            for(let i=state.count;i<3;i++){
              const open=laneX(course.routes[i]);const y=gates[i];
              ctx.setLineDash([7,7]);ctx.strokeStyle='#f7fff0a0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(56,y);ctx.lineTo(664,y);ctx.stroke();ctx.setLineDash([]);
              ctx.fillStyle='#344c3fe8';ctx.font='bold 22px sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(`水门 ${i+1}`,72,y);
              for(const x of Object.values(lanes))if(x!==open){ctx.fillStyle='#71847b';ctx.beginPath();ctx.ellipse(x,y,39,17,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff35';ctx.beginPath();ctx.ellipse(x-10,y-5,13,4,-.2,0,Math.PI*2);ctx.fill();}
              ctx.fillStyle='#617e69';ctx.beginPath();ctx.arc(open,y,25,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f9f4df';ctx.lineWidth=2;ctx.setLineDash([3,4]);ctx.stroke();ctx.setLineDash([]);
            }
            const boatX=state.count?laneX(state.riverPath[state.count-1]):360;const boatY=state.count?gates[state.count-1]+36:43;
            const path=attempt;
            if(path.length){ctx.beginPath();ctx.moveTo(boatX,boatY);for(const p of path)ctx.lineTo(p.x,p.y);ctx.strokeStyle='#fff7d9';ctx.lineWidth=5;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.strokeStyle='#719782';ctx.lineWidth=2;ctx.stroke();}
            const current=attempt.length?attempt[attempt.length-1]:{x:boatX,y:boatY};
            ctx.save();ctx.translate(current.x,current.y);ctx.rotate(-.08);ctx.shadowColor='#2b423855';ctx.shadowBlur=9;ctx.shadowOffsetY=4;
            ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(-22,17);ctx.lineTo(23,17);ctx.lineTo(35,0);ctx.closePath();ctx.fillStyle=papers[state.paper||0][1];ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#536f69';ctx.stroke();ctx.shadowColor='transparent';ctx.beginPath();ctx.moveTo(0,-24);ctx.lineTo(0,0);ctx.moveTo(-13,0);ctx.lineTo(0,-21);ctx.lineTo(14,0);ctx.stroke();ctx.restore();
            ctx.fillStyle='#344b40';ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText(`水门 ${state.count+1} / 3`,360,405);
          };
          const point=event=>{const rect=board.getBoundingClientRect();return{x:(event.clientX-rect.left)*720/rect.width,y:(event.clientY-rect.top)*420/rect.height};};
          const currentBoat=()=>({x:state.count?lanes[state.riverPath[state.count-1]]:360,y:state.count?gates[state.count-1]+36:43});
          const fail=()=>{attempt=[];draw();say(`小舟在水门边打了个转。${course.hints[state.count]}再拖一次，或用方向按钮。`);};
          const steer=direction=>{if(direction!==course.routes[state.count]){fail();return;}state.route=direction;state.riverPath.push(direction);state.count++;render();if(state.count===3)finish(`${boats.find(x=>x[0]===state.boat)?.[1]||'纸舟'}沿着清溪越过三处石头，最后从${papers[state.paper||0][0]}纸面上泛起一圈微光。`);};
          board.addEventListener('pointerdown',event=>{const p=point(event),boat=currentBoat();if(Math.hypot(p.x-boat.x,p.y-boat.y)>54)return;dragging=true;attempt=[p];board.setPointerCapture(event.pointerId);board.focus({preventScroll:true});say(`水道 · ${state.count+1}/3。${course.hints[state.count]}把纸舟拖过虚线水门。`);draw();});
          board.addEventListener('pointermove',event=>{if(!dragging)return;const p=point(event);if(Math.hypot(p.x-attempt[attempt.length-1].x,p.y-attempt[attempt.length-1].y)>2)attempt.push(p);draw();});
          board.addEventListener('pointerup',event=>{if(!dragging)return;dragging=false;const p=point(event);if(Math.hypot(p.x-attempt[attempt.length-1].x,p.y-attempt[attempt.length-1].y)>2)attempt.push(p);const gateY=gates[state.count];let crossing=null;for(let i=1;i<attempt.length;i++){const a=attempt[i-1],b=attempt[i];if(a.y<=gateY&&b.y>=gateY){const t=(gateY-a.y)/(b.y-a.y||1);crossing={x:a.x+(b.x-a.x)*t,y:gateY};break;}}if(!crossing||p.y<gateY+22){fail();return;}const lane=Object.entries(lanes).sort((a,b)=>Math.abs(a[1]-crossing.x)-Math.abs(b[1]-crossing.x))[0];if(Math.abs(lane[1]-crossing.x)>76){fail();return;}steer(lane[0]);});
          board.addEventListener('pointercancel',()=>{if(dragging){dragging=false;fail();}});
          draw();say(`水道 · ${state.count+1}/3。${course.hints[state.count]}拖动纸舟穿过正确水门，或者使用方向按钮。`);
          [['left','向左引导'],['center','顺着中间'],['right','向右引导']].forEach(([direction,label])=>button(label,()=>steer(direction)));
        }
      },
      R05(){
        scenery('platform','R05');sceneCaption('从站前出发，按顺序串起沿途的三站小旅行。');
        const destinations={山侧:['hill','展望坡'],临海:['coast','海边站台'],旧街:['old','旧街口']};
        const stops=[['old','旧街口','巷口的木牌被风吹响'],['hill','展望坡','远山在夕光里连成一线'],['market','小店街','橱窗里刚摆好一篮春日点心'],['coast','海边站台','潮声刚好盖过车铃']];
        const patterns=[['leaf','叶影'],['seal','花结'],['tram','电车'],['firefly','海鸥']];
        state.route ||= [];state.stamps ||= [];
        const destination=destinations[state.direction];
        const route=state.direction?[...state.route,destination[0]]:state.route;
        const ticket=el('div',`mka-ticket${state.step===2?' mka-ticket-ready':''}`);
        ticket.append(el('span','mka-ticket-label',`MIKAGE · ${state.step===2?'旅程已盖印':'站前旅票'}`),el('strong','',`往 ${destination?.[1]||'选择方向'}`),el('small','mka-ticket-stop',`${state.theme||'先选一段路，再慢慢出发'}`));
        const track=el('div','mka-route-track');
        const routeLabels=['站前',...route.map(key=>stops.find(x=>x[0]===key)?.[1]||key)];
        routeLabels.forEach((label,i)=>{const node=el('span',`mka-route-stop${i>0&&i<=state.route.length?' is-planned':''}${i===routeLabels.length-1&&state.step>0?' is-destination':''}`);node.append(el('i','',i===0?'出':String(i)),el('b','',label));track.append(node);});
        if(state.step===0&&state.route.length<2){const placeholder=el('span','mka-route-stop is-next');placeholder.append(el('i','','·'),el('b','','待安排'));track.append(placeholder);}
        ticket.append(track);
        const stamps=el('div','mka-ticket-stamps');for(let i=0;i<3;i++){const cell=el('span',`mka-stamp-slot${i===state.stamps.length&&state.step===1?' is-active':''}`);cell.append(el('small','',route[i+1]?stops.find(x=>x[0]===route[i+1])?.[1]||'终点':'终点'));if(state.stamps[i]!==undefined)cell.append(icon(patterns[state.stamps[i]][0]));else cell.append(el('b','','+'));stamps.append(cell);}ticket.append(stamps);stage.append(ticket);
        if(state.step===0){
          ['山侧','临海','旧街'].forEach(v=>choice(`往${v}`,()=>{if(state.direction!==v){state.direction=v;state.route=[];state.stamps=[];}render();},state.direction===v));
          ['慢慢散步','沿途拍照','尝一份点心'].forEach(v=>choice(v,()=>{state.theme=v;render();},state.theme===v));
          say(state.direction?`行程 · ${state.route.length}/2 处中途站。选站的先后会保留在旅票上。`:'先选目的方向与行程心情，再安排两处中途站。');
          if(destination){
            const choices=stops.filter(x=>x[0]!==destination[0]&&!state.route.includes(x[0]));
            choices.forEach(([key,label])=>button(`加入第${state.route.length+1}站：${label}`,()=>{if(state.route.length<2)state.route.push(key);render();},'mka-route-choice'));
            const undo=button('撤回上一站',()=>{state.route.pop();render();},'mka-quiet');undo.disabled=!state.route.length;
            if(state.route.length===2)button('检票出发',()=>{state.step=1;render();});
          }
          return;
        }
        if(state.step===1){
          const index=state.stamps.length,current=route[index+1],stop=stops.find(x=>x[0]===current);const eventText=stop?.[2]||'窗外的景色一段段慢下来。';
          say(`第 ${index+1}/3 站 · ${stop?.[1]||'沿途一站'}。${eventText}为这一站盖一枚印。`);
          patterns.forEach(([_,label],i)=>button(`盖一枚${label}`,()=>{state.stamps.push(i);if(state.stamps.length===3)state.step=2;render();},'mka-stamp-choice'));
          return;
        }
        const stampNames=state.stamps.map(i=>patterns[i]?.[1]||'旅途印');
        say('三站路线排好了。看一眼每站的印记，喜欢的话就收进手帖。');
        button('收好这张旅票',()=>finish(`以「${state.theme||'慢慢散步'}」为心情，从站前往${destination?.[1]||'远方'}；按${route.map(key=>stops.find(x=>x[0]===key)?.[1]).join(' → ')}的顺序停靠，依次盖下${stampNames.join('、')}。`));
      },
      R06(){
        const periodLabel={day:'白昼',dusk:'黄昏',night:'夜色'}[opts.period]||'白昼';
        scenery('coast-platform','R06');workflow(['共同取景','装饰排版','选择寄语','成品预览']);
        state.view ||= 'sea';state.frame ||= 'cream';state.panX ??= 50;state.panY ??= 50;state.zoom ??= 1;state.stickers ||= [];state.note ||= '';
        const themes={sea:'海风与远方',tram:'站台与旅途',lighthouse:'灯塔与归路'},frames={cream:'奶油纸边',blue:'海蓝胶片',pink:'樱粉纸边'};
        const marks={seal:['seal','今日邮戳'],tram:['tram','小电车'],heart:['heart','一颗心意'],leaf:['leaf','叶片书签']};
        const card=el('div','mka-post-card');card.dataset.frame=state.frame;card.dataset.theme=state.view;
        const photo=el('div','mka-post-window');const photoUrl=assetUrl('R06');if(photoUrl)photo.style.backgroundImage=`url(${JSON.stringify(photoUrl)})`;photo.style.backgroundPosition=`${state.panX}% ${state.panY}%`;photo.style.backgroundSize=`${state.zoom*150}% auto`;photo.style.setProperty('--view-x',`${state.panX}%`);photo.style.setProperty('--view-y',`${state.panY}%`);photo.style.setProperty('--view-scale',state.zoom);
        if(state.step===0){const guide=el('span','mka-post-guide');guide.setAttribute('aria-hidden','true');photo.append(guide);
          let dragging=false,lastX=0,lastY=0;photo.style.touchAction='none';
          photo.addEventListener('pointerdown',event=>{dragging=true;lastX=event.clientX;lastY=event.clientY;photo.setPointerCapture(event.pointerId);});
          photo.addEventListener('pointermove',event=>{if(!dragging)return;const rect=photo.getBoundingClientRect();state.panX=Math.max(0,Math.min(100,state.panX-(event.clientX-lastX)/rect.width*140));state.panY=Math.max(0,Math.min(100,state.panY-(event.clientY-lastY)/rect.height*140));lastX=event.clientX;lastY=event.clientY;photo.style.backgroundPosition=`${state.panX}% ${state.panY}%`;photo.style.setProperty('--view-x',`${state.panX}%`);photo.style.setProperty('--view-y',`${state.panY}%`);});
          photo.addEventListener('pointerup',()=>{dragging=false;});photo.addEventListener('pointercancel',()=>{dragging=false;});
        }card.append(photo,el('h4','mka-post-title',`${themes[state.view]} · ${periodLabel}`));
        const collage=el('div','mka-post-stickers');
        state.stickers.forEach((item,i)=>{const mark=marks[item.key],n=button(`选中${mark[1]}装饰`,()=>{state.activeSticker=i;render();},`mka-post-sticker${state.activeSticker===i?' is-active':''}`,collage);n.replaceChildren(icon(mark[0]));n.style.cssText=`--x:${item.x}%;--y:${item.y}%;--turn:${item.turn}deg;left:${item.x}%;top:${item.y}%;transform:translate(-50%,-50%) rotate(${item.turn}deg)`;n.disabled=state.step!==1;
          if(state.step===1){let dragging=false,moved=false;let startX=0,startY=0;n.style.touchAction='none';n.addEventListener('pointerdown',event=>{dragging=true;moved=false;startX=event.clientX;startY=event.clientY;state.activeSticker=i;n.setPointerCapture(event.pointerId);});n.addEventListener('pointermove',event=>{if(!dragging)return;if(Math.hypot(event.clientX-startX,event.clientY-startY)>4)moved=true;if(!moved)return;const rect=collage.getBoundingClientRect();item.x=Math.max(8,Math.min(92,(event.clientX-rect.left)/rect.width*100));item.y=Math.max(12,Math.min(88,(event.clientY-rect.top)/rect.height*100));n.style.left=`${item.x}%`;n.style.top=`${item.y}%`;});n.addEventListener('pointerup',()=>{dragging=false;if(moved)render();});n.addEventListener('pointercancel',()=>{dragging=false;render();});}
        });photo.append(collage);card.append(el('p','mka-post-message',state.note||'留一句你想对他说的话。'));stage.append(card);
        if(state.step===0){
          story('站在候车线里面就好。我替你扶住相机带，画面由你来定。');say('在安全的候车区调整取景。主题决定这张卡片的题名，拖动画面或用方向与远近按钮调整构图。');
          Object.entries(themes).forEach(([key,label])=>choice(label,()=>{state.view=key;render();},state.view===key));
          [['向左取景',-15,0],['向右取景',15,0],['镜头抬高',0,-15],['镜头放低',0,15]].forEach(([label,x,y])=>button(label,()=>{state.panX=Math.max(0,Math.min(100,state.panX+x));state.panY=Math.max(0,Math.min(100,state.panY+y));render();},'mka-quiet'));
          button(state.zoom===1?'拉近画面':'还原远景',()=>{state.zoom=state.zoom===1?1.35:1;render();});button('请巴卫帮我稳住，按下快门',()=>{state.step=1;render();});return;
        }
        if(state.step===1){
          story('拍得不错。纸边和邮戳你来挑，我把卡片按稳。');say(`装饰 ${state.stickers.length}/3。最多三枚，可拖动排版，也可选中后用按钮微调。`);
          Object.entries(frames).forEach(([key,label])=>choice(label,()=>{state.frame=key;render();},state.frame===key));
          Object.entries(marks).forEach(([key,mark])=>{const b=button(`添加${mark[1]}`,()=>{state.stickers.push({key,x:22+state.stickers.length*28,y:50,turn:0});state.activeSticker=state.stickers.length-1;render();});b.disabled=state.stickers.length>=3;});
          const active=state.stickers[state.activeSticker??-1];if(active){[['装饰左移',-8,0],['装饰右移',8,0],['装饰上移',0,-12],['装饰下移',0,12]].forEach(([label,x,y])=>button(label,()=>{active.x=Math.max(8,Math.min(92,active.x+x));active.y=Math.max(12,Math.min(88,active.y+y));render();},'mka-quiet'));button('转动选中装饰',()=>{active.turn=(active.turn+15)%360;render();},'mka-quiet');button('移除选中装饰',()=>{state.stickers.splice(state.activeSticker,1);state.activeSticker=state.stickers.length-1;render();},'mka-quiet');}
          button('重新取景',()=>{state.step=0;render();},'mka-quiet');button('排版完成，写下寄语',()=>{state.step=2;render();});return;
        }
        const notes={'把今天的海风寄给你。':'那我收好了。下次想来，也叫上我。','下次还一起等这班电车吧。':'好。只是下次出门前，记得把外套带上。','今天有你陪着，很开心。':'……我也是。卡片收好，别让海风吹走了。'};
        if(state.step===2){story('还差一句话。想写什么，就照你的意思写。',state.note);say('选择你想表达的寄语，再查看完整成品。');Object.keys(notes).forEach(note=>choice(note,()=>{state.note=note;render();},state.note===note));button('返回调整排版',()=>{state.step=1;render();},'mka-quiet');const done=button('给巴卫看成品',()=>{state.step=3;render();});done.disabled=!state.note;return;}
        story(notes[state.note],state.note);sceneCaption('由你取景、排版、写下寄语的海风明信片。');say('成品已展开，可以返回修改，或者收好这次共同留影。');
        if(!completed){button('返回修改',()=>{state.step=2;render();},'mka-quiet');button('收好这张共同明信片',()=>{finishMoment(`${periodLabel}与巴卫在候车区共同留影，以「${themes[state.view]}」为题，用${frames[state.frame]}排版${state.stickers.length}枚装饰。你写下：「${state.note}」巴卫回应：「${notes[state.note]}」`,{view:state.view,frame:state.frame,crop:{x:state.panX,y:state.panY,zoom:state.zoom},stickers:state.stickers.map(item=>({...item})),note:state.note});controls.querySelectorAll('button').forEach(b=>{b.disabled=true;});});}
      },
      R07(){
        const species=[['ginkgo','银杏','mka-ginkgo'],['fern','蕨叶','mka-fern'],['camellia','椿叶','mka-camellia']];
        scenery('grove','R07');sceneCaption('循着林间线索找到叶片，再亲手把纹路压进纸里。');
        if(state.step===0){
          if(!state.clue){say('先选一个观察方向，再沿着线索找叶子。');[['foot','循着细小脚印'],['bark','看树皮的纹路'],['leaf','观察叶片落点']].forEach(([key,label])=>choice(label,()=>{state.clue=key;render();},state.clue===key));return;}
          const grove=el('div','mka-grove');species.forEach(([name,label,cls],i)=>{const b=button(`寻找${label}`,()=>{if(!state.selected.includes(i))state.selected.push(i);render();},`mka-found-leaf ${cls} ${state.selected.includes(i)?'mka-found':''}`,grove);b.replaceChildren(icon(name),el('span','',state.selected.includes(i)?`${label} · 已找到`:label));b.disabled=state.selected.includes(i);});stage.append(grove);
          say(`${{foot:'脚印指向湿润的溪边，',bark:'树皮的纹路绕过低枝，',leaf:'落叶在背风处聚成小堆，'}[state.clue]}找到 ${state.selected.length}/3 种叶片。`);if(state.selected.length===3)button('铺开拓纸',()=>{state.step=1;state.rubPaths=[];render();});
          return;
        }
        if(state.step===1){
          state.rubPaths ||= [];
          const paper=el('div',`mka-rubbing ${state.ink||''}`),canvas=el('canvas','mka-rubbing-canvas');canvas.width=640;canvas.height=320;canvas.setAttribute('role','application');canvas.setAttribute('aria-label','草木拓纸。选好拓色后，用手指或鼠标在纸面上来回涂抹；也可以按压印一笔。');canvas.tabIndex=0;paper.append(canvas);stage.append(paper);
          const inkColors={moss:'#657f56',rose:'#b87183',ochre:'#9c8245'};
          const draw=paths=>{const ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,640,320);ctx.fillStyle='#f8f0dc';ctx.fillRect(0,0,640,320);ctx.strokeStyle='#d3c4a4';ctx.lineWidth=2;ctx.strokeRect(9,9,622,302);
            const progress=Math.min(paths.length,6)/6,ink=inkColors[state.ink]||'#8b9c7c',imprintAlpha=.24+progress*.55;
            const leaf=(x,y,type,angle)=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=imprintAlpha;ctx.fillStyle=ink;ctx.strokeStyle=ink;ctx.lineWidth=2.2;ctx.lineCap='round';ctx.lineJoin='round';
              if(type==='ginkgo'){
                ctx.beginPath();ctx.moveTo(0,72);ctx.quadraticCurveTo(-7,48,-5,27);ctx.quadraticCurveTo(-28,21,-48,13);ctx.quadraticCurveTo(-58,6,-48,-2);ctx.quadraticCurveTo(-54,-13,-39,-18);ctx.quadraticCurveTo(-39,-33,-24,-37);ctx.quadraticCurveTo(-18,-54,-5,-48);ctx.quadraticCurveTo(0,-62,7,-48);ctx.quadraticCurveTo(21,-54,26,-37);ctx.quadraticCurveTo(42,-32,40,-17);ctx.quadraticCurveTo(55,-12,48,-1);ctx.quadraticCurveTo(59,8,47,15);ctx.quadraticCurveTo(25,23,5,28);ctx.quadraticCurveTo(7,51,0,72);ctx.closePath();ctx.fill();ctx.stroke();
                ctx.beginPath();ctx.moveTo(0,69);ctx.lineTo(0,20);for(let j=0;j<7;j++){const a=-2.65+j*.44;ctx.moveTo(0,23);ctx.lineTo(Math.cos(a)*48,Math.sin(a)*43-3);}ctx.stroke();
              }else if(type==='fern'){
                ctx.beginPath();ctx.moveTo(0,70);ctx.lineTo(0,-67);ctx.stroke();for(let j=0;j<7;j++){const yy=48-j*17,length=31-j*2.1;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(0,yy);ctx.quadraticCurveTo(side*length*.43,yy-4,side*length,yy-19);ctx.quadraticCurveTo(side*length*.55,yy-12,0,yy);ctx.closePath();ctx.fill();ctx.stroke();}}
              }else{
                ctx.beginPath();ctx.moveTo(0,68);ctx.quadraticCurveTo(-19,27,-38,-34);ctx.quadraticCurveTo(-42,-52,-28,-56);ctx.quadraticCurveTo(-9,-58,0,-68);ctx.quadraticCurveTo(9,-58,28,-56);ctx.quadraticCurveTo(42,-52,38,-34);ctx.quadraticCurveTo(19,27,0,68);ctx.closePath();ctx.fill();ctx.stroke();
                ctx.beginPath();ctx.moveTo(0,64);ctx.lineTo(0,-62);for(let j=1;j<=7;j++){const yy=58-j*15;ctx.moveTo(0,yy);ctx.quadraticCurveTo(-16,yy-3,-29,yy-16);ctx.moveTo(0,yy);ctx.quadraticCurveTo(16,yy-3,29,yy-16);}ctx.stroke();
              }
              ctx.restore();};
            leaf(135,166,'ginkgo',-.36);leaf(320,164,'fern',.04);leaf(505,166,'camellia',.42);ctx.globalAlpha=1;
            ctx.save();ctx.globalCompositeOperation='multiply';ctx.strokeStyle=ink;ctx.lineCap='round';ctx.lineJoin='round';paths.forEach((path,index)=>{if(!path?.length)return;ctx.beginPath();ctx.moveTo(path[0].x*640,path[0].y*320);for(let i=1;i<path.length;i++)ctx.lineTo(path[i].x*640,path[i].y*320);ctx.globalAlpha=.045+index*.006;ctx.lineWidth=5;ctx.stroke();ctx.globalAlpha=.1+index*.01;ctx.lineWidth=1.2;ctx.stroke();});ctx.restore();};
          draw(state.rubPaths);
          const point=event=>{const rect=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))};};
          let drawing=null;
          canvas.addEventListener('pointerdown',event=>{if(!state.ink){say('先选一层拓色，再压印叶脉。');return;}drawing=[point(event)];canvas.setPointerCapture(event.pointerId);canvas.focus({preventScroll:true});});
          canvas.addEventListener('pointermove',event=>{if(!drawing)return;const next=point(event);if(Math.hypot(next.x-drawing[drawing.length-1].x,next.y-drawing[drawing.length-1].y)>.008)drawing.push(next);draw([...state.rubPaths,drawing]);});
          canvas.addEventListener('pointerup',()=>{if(!drawing)return;if(drawing.length>1){state.rubPaths.push(drawing);render();}drawing=null;});
          canvas.addEventListener('pointercancel',()=>{drawing=null;draw(state.rubPaths);});
          say(`选择拓色，再在纸上来回压印 · ${state.rubPaths.length}/6 笔。来回几次，叶脉会逐渐显出来。`);
          [['moss','苔绿'],['rose','樱粉'],['ochre','赭金']].forEach(([value,label])=>{const b=choice(label,()=>{state.ink=value;render();},state.ink===value);b.disabled=completed;});
          const tap=button('压印一笔',()=>{if(!state.ink)return;const n=state.rubPaths.length,y=.18+(n%6)*.12;state.rubPaths.push(Array.from({length:8},(_,i)=>({x:.12+i*.11,y:y+Math.sin(i*.7+n)*.025})));render();},'mka-quiet');tap.disabled=!state.ink||state.rubPaths.length>=6||completed;
          if(state.rubPaths.length>=6)button('收好这一页叶拓',()=>{state.step=2;const detail=`循着${{foot:'脚印',bark:'树皮纹路',leaf:'落叶方向'}[state.clue]}找到银杏、蕨叶和椿叶，在拓纸上来回压印${state.rubPaths.length}笔，显出一页${{moss:'苔绿',rose:'樱粉',ochre:'赭金'}[state.ink]}草木纹样。`;render();finish(detail);});
          return;
        }
        const done=el('div','mka-rubbing-done');done.append(icon('seal'),el('b','','草木纹样已拓好'));stage.append(done);say('这一页叶拓已经收进散策手帖。');
      },
      R08(){
        scenery('night','R08');sceneCaption('微光不催促你。忘记顺序了，随时可以再看一遍。');
        const sequences={reeds:[[0,2,1,0],[0,2,1,0,2,3]],water:[[3,1,2,0],[3,1,2,0,1,3]]};state.round ??= 0;
        if(!state.mode){say('选择一处观察线索，萤火会用不同的节奏回应。');[['reeds','听芦苇'],['water','看水纹']].forEach(([key,label])=>choice(label,()=>{state.mode=key;state.round=0;state.order=sequences[key][0];state.input=0;render();flash();},state.mode===key));}
        const group=el('div','mka-fireflies');
        const fireflyCount=4;
        const accept=i=>{
          if(state.busy||completed||!state.mode)return;
          if(i!==state.order[state.input]){state.input=0;render();say('微光还在。可以重看这段顺序，再从第一簇慢慢跟上。');return;}
          state.input++;
          if(state.input>=state.order.length){
            if(state.round===0){state.round=1;state.order=sequences[state.mode][1];state.input=0;render();say('第一段跟上了。稍长的一段微光正在回应你……');flash();return;}
            state.step=2;const detail=`你选择${state.mode==='reeds'?'听芦苇里的风':'看水面的波纹'}，跟上两段由${state.order.length}簇微光组成的次序，在夜色里留下了一次安静的回应。`;render();finish(detail);return;
          }
          render();
        };
        for(let i=0;i<fireflyCount;i++){
          const b=button(`第${i+1}簇萤火`,()=>accept(i),`mka-firefly${state.mode?' mka-awake':''}`,group);b.dataset.fly=String(i);b.replaceChildren(el('i','mka-firefly-sprite'),el('span','',`${i+1}`));b.disabled=!state.mode||!!state.busy||completed||state.step===2;
        }
        stage.append(group);
        if(state.mode&&state.step!==2){const round=state.round||0;say(state.busy?'看看微光闪亮的顺序……':`第 ${round+1}/2 段 · 跟随微光 ${state.input||0}/${state.order?.length||4}。不计时，也不会失去已完成的第一段。`);
          const hint=button('重看当前光序',flash);hint.disabled=!!state.busy||completed;button('显示数字提示',()=>say(`这一段的光序是：${state.order.map(i=>i+1).join(' → ')}。`),'mka-quiet');}
        else if(state.step===2)say('两段微光都跟上了。今晚的路线已经记在心里。');
        function flash(){
          if(state.busy||disposed||completed||!state.mode)return;state.input=0;
          if(opts.reducedMotion){say(`第${(state.round||0)+1}段光序：${state.order.map(i=>i+1).join(' → ')}。按顺序轻点即可。`);return;}
          state.busy=true;const gen=generation;render();
          state.order.forEach((i,j)=>{
            later(()=>{if(gen!==generation)return;stage.querySelector(`[data-fly="${i}"]`)?.classList.add('mka-glow');},j*850+150);
            later(()=>{if(gen!==generation)return;stage.querySelector(`[data-fly="${i}"]`)?.classList.remove('mka-glow');},j*850+700);
          });
          later(()=>{if(gen!==generation)return;state.busy=false;render();},state.order.length*850+900);
        }
      },
      R09(){
        const patterns=state.tempo==='lively'?[['咔','咚','咔','咚'],['咚','咔','咔','咚'],['咔','咔','咚','咔']]:[['咚','咚','咔','咚'],['咔','咚','咔','咚'],['咚','咔','咚','咔']];
        scenery('kagura','R09');sceneCaption('先看完这一句节奏，再敲鼓心「咚」和鼓沿「咔」。');
        if(!state.tempo&&!state.free){say('先选今晚的合奏气氛。节拍图样会跟着变化。');choice('稳稳跟拍',()=>{state.tempo='steady';render();});choice('轻快合拍',()=>{state.tempo='lively';render();});}
        const drum=el('div','mka-drum'),canvas=el('canvas','mka-drum-canvas');canvas.width=360;canvas.height=210;canvas.setAttribute('aria-hidden','true');drum.append(canvas);stage.append(drum);
        const ctx=canvas.getContext('2d');if(ctx){const wood=ctx.createLinearGradient(54,44,306,174);wood.addColorStop(0,'#6a302b');wood.addColorStop(.48,'#aa5745');wood.addColorStop(1,'#572a28');ctx.fillStyle=wood;ctx.beginPath();ctx.ellipse(180,54,112,40,0,0,Math.PI*2);ctx.fill();ctx.fillRect(68,54,224,90);ctx.beginPath();ctx.ellipse(180,144,112,40,0,0,Math.PI);ctx.fill();ctx.strokeStyle='#efc78d';ctx.lineWidth=7;for(let i=0;i<7;i++){const x=84+i*32;ctx.beginPath();ctx.moveTo(x,57);ctx.lineTo(x+(i%2?24:-24),140);ctx.stroke();}ctx.beginPath();ctx.ellipse(180,54,112,40,0,0,Math.PI*2);ctx.fillStyle='#f0d9ad';ctx.fill();ctx.strokeStyle='#75473b';ctx.lineWidth=5;ctx.stroke();ctx.beginPath();ctx.ellipse(180,54,97,31,0,0,Math.PI*2);ctx.strokeStyle='#fff0d0';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#ead9bb';ctx.beginPath();ctx.ellipse(180,54,89,25,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#bb9870';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(180,54,65,17,0,0,Math.PI*2);ctx.stroke();}
        const pattern=patterns[Math.min(state.count,2)];const beats=el('div','mka-beats');pattern.forEach((beat,i)=>beats.append(el('span',`mka-beat ${i<(state.input||0)?'mka-beat-done':''} ${i===(state.input||0)?'mka-beat-next':''}`,beat)));stage.append(beats);
        say(state.free?'自由敲击中，不计对错。切回练习可继续。':`第 ${Math.min(state.count+1,3)}/3 句 · 已跟上 ${state.input||0}/4 拍。`);
        ['咚','咔'].forEach(beat=>{const b=button(beat==='咚'?'咚 · 鼓心':'咔 · 鼓沿',()=>{
          tone(beat);drum.classList.remove('mka-hit');void drum.offsetWidth;drum.classList.add('mka-hit');
          if(state.free){say(`你敲了一声「${beat}」，鼓声轻轻荡开。`);return;}if(completed||!state.tempo)return;
          if(beat!==pattern[state.input||0]){state.input=0;say('差一点点。照着图样，从第一拍重新试试。');beats.querySelectorAll('.mka-beat').forEach((n,i)=>{n.classList.remove('mka-beat-done');n.classList.toggle('mka-beat-next',i===0);});return;}
          state.input=(state.input||0)+1;if(state.input===4){state.count++;state.input=0;if(state.count===3){state.step=1;render();finish(`你选了${state.tempo==='lively'?'轻快合拍':'稳稳跟拍'}，跟着三句各四拍的节奏完成了今晚的太鼓练习。`);return;}}render();
        },'mka-drum-button');b.disabled=(completed&&!state.free)||(!state.tempo&&!state.free);});
        button(state.free?'回到三拍练习':'自由敲一会儿',()=>{state.free=!state.free;render();},'mka-quiet');
        const soundButton=button(sound?'声音已开启 · 点击静音':'声音关闭 · 点击开启',async()=>{if(sound){sound=false;render();return;}try{const Audio=global.AudioContext||global.webkitAudioContext;if(!Audio){say('当前环境不支持声音，仍然可以看图样练习。');return;}audio ||= new Audio();await audio.resume();if(disposed)return;sound=true;render();}catch(_){say('声音暂时无法开启，仍然可以看图样练习。');}},'mka-quiet');soundButton.setAttribute('aria-pressed',String(sound));
        function tone(beat){if(!sound||!audio)return;try{const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime;osc.type='sine';osc.frequency.setValueAtTime(beat==='咚'?160:420,t);osc.frequency.exponentialRampToValueAtTime(beat==='咚'?65:210,t+.15);gain.gain.setValueAtTime(.13,t);gain.gain.exponentialRampToValueAtTime(.001,t+.2);osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+.22);}catch(_){sound=false;}}
      },
      R10(){
        const colors=[['warm','暖金'],['sakura','樱粉'],['jade','青灯']];state.color ||= 'warm';
        scenery('night-path','R10');sceneCaption('先排一条灯路，再逐盏点亮。保存前还能反复改色。');
        const layouts=[['path','参道弧线'],['row','并肩灯列'],['arc','回游灯环']];const row=el('div',`mka-lanterns mka-layout-${state.layout||'path'}`);for(let i=0;i<6;i++){const lit=state.selected[i];const b=button(`第${i+1}盏灯${lit?'，已点亮，可换色':'，尚未点亮'}`,()=>{if(completed)return;state.selected[i]=state.color;render();},`mka-lantern ${lit?'mka-lantern-lit mka-'+lit:''}`,row);b.replaceChildren(el('i','mka-lantern-sprite'),el('span','',String(i+1)));b.disabled=completed;}stage.append(row);
        layouts.forEach(([key,label])=>{const b=choice(label,()=>{if(completed)return;state.layout=key;render();},(state.layout||'path')===key);b.disabled=completed;});
        colors.forEach(([key,label])=>{const b=choice(label,()=>{if(completed)return;state.color=key;render();},state.color===key);b.disabled=completed;});
        const litCount=state.selected.filter(Boolean).length;
        say(completed?'灯路与灯色已经收进这一幕。再玩一次，可以重新安排夜路。':`先排成${layouts.find(x=>x[0]===(state.layout||'path'))[1]}，再选颜色点灯 · ${litCount}/6。点亮后也可以换色。`);
        if(litCount===6){const save=button('收好这一幕',()=>{finish(`按${layouts.find(x=>x[0]===(state.layout||'path'))[1]}排好六盏纸灯：${colors.map(([key,label])=>`${label}${state.selected.filter(c=>c===key).length}盏`).join('、')}。`);render();});save.disabled=completed;}
      },
    };
    reset();
    return {dispose(){if(disposed)return;disposed=true;generation++;cancelTimers();if(audio){try{const closing=audio.close();closing?.catch?.(()=>{});}catch(_){}audio=null;}root.remove();}};
  }
  global.MikageActivities={mount};
})(window);
