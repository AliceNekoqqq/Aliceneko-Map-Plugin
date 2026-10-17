// Built as a self-contained remote module. The character card only stores its loader.
export const version = '1.16.5';
export const scriptId = 'minigames';
export const VERSION = version;
export const SCRIPT_ID = scriptId;

const GAME_CSS = __MINIGAME_CSS__;
const ART = __MINIGAME_ART__;
const GAME_FONT_URL = __MINIGAME_FONT_URL__;
const GAME_FONT_RANGE = __MINIGAME_FONT_RANGE__;

__ACTIVITY_FACTORY__

const SCENES = {
  R01: { place:'御影神社', title:'庭前拾叶', note:'和巴卫商量分工，看清风向，再沿着庭院把叶子扫进篮里。最后共同安排留下的秋色，并选择你想说的话。', tags:['拖扫与按钮均可操作','一起分工与布置','女主回应由你选择'] },
  R02: { place:'坂道住宅区', title:'与猫慢慢熟悉', note:'和巴卫一起观察猫的耳朵、尾巴与距离，选好分工，再按它的反应调整动作。猫会自己决定是否走近，最后留下一段你选择的对话。', tags:['观察姿态与距离','配合巴卫慢慢接近','不强求触摸'] },
  R03: { place:'团子小店', title:'串起一签春色', note:'按顺序挑三颗团子，逐颗观察火候并调节火力，最后选择蘸料和点缀。之后可以直接收好，也能和巴卫在街角旧货摊玩三局玻璃弹珠。', tags:['团子手作与火候选择','可选弹珠路线挑战','收录进可备份的旧物回忆册'] },
  R04: { place:'清溪石桥', title:'让纸舟顺水走', note:'折好纸舟后拖动它穿过三道水门，船形决定可通行的水道。走错能重新尝试，也可以用按钮选路。', tags:['三道河道闯关','拖动或按钮操作','无需赶时间'] },
  R05: { place:'临海车站', title:'等车时的一枚票根', note:'从站前出发，按顺序安排两处停靠与终点，再逐站盖上纪念印。可以回退重排路线。', tags:['三站路线规划','停靠顺序会改变票根','预绘车站场景'] },
  R06: { place:'海边电车站', title:'海风寄来的明信片', note:'和巴卫在安全站台上商量取景，调整画面，再给明信片安排邮戳、装饰与寄语。你可以选择如何回应他，把共同完成的画面收好。', tags:['调整取景与装饰位置','双人制作明信片','预览后再收好'] },
  R07: { place:'林间木道', title:'收集一页叶拓', note:'沿着脚印、树皮或落叶找到三种叶片，再用手指在拓纸上来回压出叶脉。', tags:['线索影响观察方向','手指涂抹与按钮辅助','预绘林间场景'] },
  R08: { place:'芦苇栈道', title:'跟着微光呼吸', note:'选择听芦苇还是看水面，记住两段逐渐变长的萤火顺序；可以随时重看。', tags:['两段记忆挑战','可重看光序','预绘夜间湿地'] },
  R09: { place:'神乐会所', title:'神乐前的三拍练习', note:'选择稳拍或轻快合拍，跟着三段逐渐变化的四拍节奏敲鼓；也可以自由合奏。', tags:['三段四拍练习','鼓面动态反馈','预绘神乐会所'] },
  R10: { place:'灯火参道', title:'把归途慢慢点亮', note:'先选一条灯路，再逐盏安排颜色点亮。六盏灯都能在保存前重新调整。', tags:['三种参道布局','六盏灯自由配色','预绘黄昏参道'] },
};

function artUrl(key, period) {
  const entry = ART[key];
  const url = typeof entry === 'string' ? entry : entry?.[period] || entry?.day || entry?.default;
  return typeof url === 'string' && /^https:\/\/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)\//.test(url) ? url : null;
}

export function start() {
  const owner = window;
  const host = owner.parent || owner;
  const existing = host.MikageMinigames;
  if (existing?.version === version && typeof existing.open === 'function') return existing;
  existing?.dispose?.();
  const activities = createMikageActivities(host);
  const mountActivity = activities.mount;
  let current = null;

  function open(options = {}) {
    const region = String(options.region || 'R01');
    const scene = SCENES[region];
    if (!scene) throw new RangeError(`未知散策地区：${region}`);
    const doc = host.document;
    if (!doc?.body) return null;
    current?.close({ notify:false });
    const mount = doc.createElement('div');
    mount.dataset.mikageMinigameHost = '';
    mount.style.cssText = 'position:fixed;inset:0;z-index:2147483600;';
    const shadow = mount.attachShadow({ mode:'open' });
    const style = doc.createElement('style');
    style.textContent = GAME_CSS;
    shadow.append(style);
    const overlay = doc.createElement('div');
    overlay.className = 'mkg-overlay';
    const dialog = doc.createElement('section');
    dialog.className = 'mkg-dialog';
    dialog.setAttribute('role','dialog');
    dialog.setAttribute('aria-modal','true');
    dialog.setAttribute('aria-labelledby','mkg-dialog-title');
    dialog.tabIndex = -1;
    const bar = doc.createElement('header');
    bar.className = 'mkg-topbar';
    const brand = doc.createElement('div');
    brand.className = 'mkg-brand';
    const eyebrow = doc.createElement('span');
    eyebrow.className = 'mkg-eyebrow';
    eyebrow.textContent = 'MIKAGE · INTERLUDE';
    const heading = doc.createElement('strong');
    heading.id = 'mkg-dialog-title';
    heading.textContent = scene.place + ' · 此地散策';
    brand.append(eyebrow,heading);
    const closeButton = doc.createElement('button');
    closeButton.className = 'mkg-close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label','关闭互动弹窗');
    closeButton.textContent = '×';
    bar.append(brand,closeButton);
    const intro = doc.createElement('div');
    intro.className = 'mkg-intro';
    intro.dataset.region = region;
    const visual = doc.createElement('div');
    visual.className = 'mkg-visual';
    visual.dataset.region = region;
    const cover = artUrl(region, options.period || 'day');
    if (cover) {
      const image = doc.createElement('img');
      image.className = 'mkg-cover';
      image.alt = scene.place + '的预绘场景';
      image.decoding = 'async';
      image.src = cover;
      image.addEventListener('error', () => image.remove(), { once:true });
      visual.append(image);
    }
    if (region === 'R02') {
      const catUrl = artUrl('cat', options.period || 'day');
      if (catUrl) {
        const cat = doc.createElement('img');
        cat.className = 'mkg-cat';
        cat.alt = '石墙边的一只猫';
        cat.decoding = 'async';
        cat.src = catUrl;
        cat.addEventListener('error', () => cat.remove(), { once:true });
        visual.append(cat);
      }
    }
    const placard = doc.createElement('span');
    placard.className = 'mkg-placard';
    placard.textContent = region + ' / ' + scene.place;
    visual.append(placard);
    const copy = doc.createElement('div');
    copy.className = 'mkg-copy';
    const label = doc.createElement('span');
    label.className = 'mkg-section-label';
    label.textContent = '散策前的小笺';
    const title = doc.createElement('h2');
    title.textContent = scene.title;
    const description = doc.createElement('p');
    description.className = 'mkg-description';
    description.textContent = scene.note;
    const tags = doc.createElement('ul');
    tags.className = 'mkg-tags';
    for (const text of scene.tags) {
      const item = doc.createElement('li');
      item.textContent = text;
      tags.append(item);
    }
    copy.append(label,title,description,tags);
    intro.append(visual,copy);
    const foot = doc.createElement('footer');
    foot.className = 'mkg-actions';
    const note = doc.createElement('p');
    note.className = 'mkg-footnote';
    note.textContent = '这段散策不会消耗道具。完成后会写进当前对话的散策手帖，并把一件小物收进本设备的旧物回忆册。';
    const actions = doc.createElement('div');
    actions.className = 'mkg-action-buttons';
    const begin = doc.createElement('button');
    begin.className = 'mkg-begin';
    begin.type = 'button';
    begin.textContent = '开始这段散策';
    const leave = doc.createElement('button');
    leave.className = 'mkg-leave';
    leave.type = 'button';
    leave.textContent = '先回地图';
    actions.append(begin,leave);
    foot.append(note,actions);
    const gameArea = doc.createElement('div');
    gameArea.className = 'mkg-game';
    gameArea.hidden = true;
    dialog.append(bar,intro,foot,gameArea);
    overlay.append(dialog);
    shadow.append(overlay);
    doc.body.append(mount);

    const previousOverflow = doc.body.style.overflow;
    doc.body.style.overflow = 'hidden';
    let closed = false;
    let game = null;
    const opener = doc.activeElement;
    function focusables(scope=dialog) {
      return [...scope.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(node=>!node.hidden && node.getClientRects().length);
    }
    function onKeydown(event) {
      const scope=[...shadow.querySelectorAll('[role="dialog"][aria-modal="true"]')].filter(node=>node.getClientRects().length).at(-1)||dialog;
      if (event.key === 'Escape') { event.preventDefault();event.stopPropagation();if(scope!==dialog)scope.querySelector('[data-dialog-close]')?.click();else close();return; }
      if (event.key !== 'Tab') return;
      const items = focusables(scope);
      if (!items.length) { event.preventDefault();scope.focus();return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (shadow.activeElement === first || shadow.activeElement === scope)) { event.preventDefault();last.focus(); }
      else if (!event.shiftKey && (shadow.activeElement === last || !scope.contains(shadow.activeElement))) { event.preventDefault();first.focus(); }
    }
    function close({ notify=true } = {}) {
      if (closed) return;
      closed = true;
      game?.dispose?.();
      doc.removeEventListener('keydown',onKeydown,true);
      mount.remove();
      if (doc.body.style.overflow === 'hidden') doc.body.style.overflow = previousOverflow;
      if (current === handle) current = null;
      if (opener?.isConnected) opener.focus?.({ preventScroll:true });
      if (notify) {
        try { options.onClose?.(); } catch (error) { console.error('[御影散策] close callback failed',error); }
      }
    }
    function beginGame() {
      if (closed || game) return;
      intro.hidden = true;
      foot.hidden = true;
      gameArea.hidden = false;
      const companionArt = { ...ART };
      // Reuse the existing wardrobe catalog; no portrait bytes enter the card.
      try {
        const appearance = host.MikageShrinePanels?.getAppearance?.() || {};
        const artApi = host.MikageCharacterArt;
        if (artApi?.portrait) {
          for (const [actor,key,fallback] of [['tomoe','tomoe','usual'],['player','heroine','daily']]) {
            try {
              const url = artApi.portrait(actor,appearance[actor] || fallback);
              if (typeof url === 'string' && /^https:\/\/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)\//.test(url)) companionArt[key] = url;
            } catch {}
          }
        }
      } catch {}
      game = mountActivity(gameArea,{
        region,
        reducedMotion:!!options.reducedMotion,
        period:options.period || 'day',
        art:companionArt,
        onClose:()=>close(),
        onComplete:result=>{
          try { options.onComplete?.(result); }
          catch (error) { console.error('[御影散策] completion callback failed',error); }
        },
      });
      dialog.scrollTop = 0;
      host.requestAnimationFrame(()=>gameArea.querySelector('button:not(:disabled)')?.focus({ preventScroll:true }));
    }
    const handle = { close };
    current = handle;
    closeButton.addEventListener('click',()=>close());
    leave.addEventListener('click',()=>close());
    overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
    begin.addEventListener('click',beginGame);
    doc.addEventListener('keydown',onKeydown,true);
    const art = host.MikageCharacterArt || host.parent?.MikageCharacterArt;
    Promise.resolve(art?.installFont?.(doc)).catch(()=>{}).then(async()=>{
      if(!/^https:\/\/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)\//.test(GAME_FONT_URL))return;
      try{const face=new doc.defaultView.FontFace('Mikage Serif',`url("${GAME_FONT_URL}")`,{unicodeRange:GAME_FONT_RANGE});doc.fonts.add(face);await face.load();}catch{}
    });
    host.requestAnimationFrame(()=>{if(!closed)begin.focus({ preventScroll:true });});
    return handle;
  }

  const api = {
    version,
    open,
    getMemoryBook: activities.getMemoryBook,
    close(){ current?.close(); },
    dispose(){ current?.close({ notify:false });if(host.MikageMinigames===api)delete host.MikageMinigames; },
  };
  host.MikageMinigames = api;
  owner.addEventListener?.('pagehide',api.dispose,{once:true});
  host.dispatchEvent?.(new host.CustomEvent('mikage:minigames-ready',{detail:{version}}));
  return api;
}
