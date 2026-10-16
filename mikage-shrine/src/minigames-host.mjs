// Built as a self-contained remote module. The character card only stores its loader.
export const version = '1.12.0';
export const scriptId = 'minigames';
export const VERSION = version;
export const SCRIPT_ID = scriptId;

const GAME_CSS = __MINIGAME_CSS__;
const ART = __MINIGAME_ART__;
const GAME_FONT_URL = __MINIGAME_FONT_URL__;

__ACTIVITY_FACTORY__

const SCENES = {
  R01: { place:'御影神社', title:'庭前拾叶', note:'先听风，再把庭上的叶片收进竹篮。最后决定要留下哪一片秋色。', tags:['风向会改变这一幕','可以自己决定庭院的样子'] },
  R02: { place:'坂道住宅区', title:'与猫慢慢熟悉', note:'看看耳朵和尾巴的变化，再选择合适的距离。它会按自己的节奏回应，不必连续点击。', tags:['观察动作再做选择','没有倒计时'] },
  R03: { place:'团子小店', title:'串起一签春色', note:'搭配三颗团子，再选蘸料完成一签今天的口味。颜色和收尾都可以自己挑。', tags:['自由搭配','结果会记下你的口味'] },
  R04: { place:'清溪石桥', title:'让纸舟顺水走', note:'折好纸舟后拖动它穿过三道水门，船形决定可通行的水道。走错能重新尝试，也可以用按钮选路。', tags:['三道河道闯关','拖动或按钮操作','无需赶时间'] },
  R05: { place:'临海车站', title:'等车时的一枚票根', note:'选定方向、沿途停靠和旅途印章，把几站路排成自己的短途行程。', tags:['路线由你安排','可以重新规划'] },
  R06: { place:'海边电车站', title:'海风寄来的明信片', note:'选取景主题，等电车进站后再挑相框、邮戳和寄语，做成一张海边明信片。', tags:['站台取景与装帧','预绘海滨场景'] },
  R07: { place:'林间木道', title:'收集一页叶拓', note:'从脚印、树皮或落叶中选线索，找到三种叶片，再选拓色压出叶脉。', tags:['线索影响观察方向','三种叶片收集'] },
  R08: { place:'芦苇栈道', title:'跟着微光呼吸', note:'选择听芦苇还是看水面，再唤醒并跟随萤火的次序走过一小段夜色。', tags:['可重看微光顺序','没有计时惩罚'] },
  R09: { place:'神乐会所', title:'神乐前的三拍练习', note:'选择稳拍或轻快节奏，依次跟上鼓心与鼓沿；也可以切换自由合奏。', tags:['节奏练习与自由演奏','声音可关闭'] },
  R10: { place:'灯火参道', title:'把归途慢慢点亮', note:'先安排灯路和灯色，再逐盏点亮。完成前可以反复调整颜色与布局。', tags:['六盏灯自由布置','保存前仍可修改'] },
};

function artUrl(key, period) {
  const entry = ART[key];
  const url = typeof entry === 'string' ? entry : entry?.[period] || entry?.day || entry?.default;
  return typeof url === 'string' && /^https:\/\/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)\//.test(url) ? url : null;
}

export function start() {
  const host = window;
  const existing = host.MikageMinigames;
  if (existing?.version === version && typeof existing.open === 'function') return existing;
  existing?.dispose?.();
  const mountActivity = createMikageActivities(host).mount;
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
    note.textContent = '这段散策不会消耗道具。完成后会写进当前对话的散策手帖。';
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
    function focusables() {
      return [...shadow.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(node=>!node.hidden && node.getClientRects().length);
    }
    function onKeydown(event) {
      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) { event.preventDefault();dialog.focus();return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (shadow.activeElement === first || shadow.activeElement === dialog)) { event.preventDefault();last.focus(); }
      else if (!event.shiftKey && (shadow.activeElement === last || !dialog.contains(shadow.activeElement))) { event.preventDefault();first.focus(); }
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
      intro.hidden = true;
      foot.hidden = true;
      gameArea.hidden = false;
      game = mountActivity(gameArea,{
        region,
        reducedMotion:!!options.reducedMotion,
        period:options.period || 'day',
        art:ART,
        onClose:()=>close(),
        onComplete:result=>{
          try { options.onComplete?.(result); }
          catch (error) { console.error('[御影散策] completion callback failed',error); }
        },
      });
      dialog.scrollTop = 0;
      requestAnimationFrame(()=>gameArea.querySelector('button:not(:disabled)')?.focus({ preventScroll:true }));
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
      try{const face=new doc.defaultView.FontFace('Mikage Serif',`url("${GAME_FONT_URL}")`);doc.fonts.add(face);await face.load();}catch{}
    });
    requestAnimationFrame(()=>{if(!closed)begin.focus({ preventScroll:true });});
    return handle;
  }

  const api = {
    version,
    open,
    close(){ current?.close(); },
    dispose(){ current?.close({ notify:false });if(host.MikageMinigames===api)delete host.MikageMinigames; },
  };
  host.MikageMinigames = api;
  host.addEventListener?.('pagehide',api.dispose,{once:true});
  return api;
}
