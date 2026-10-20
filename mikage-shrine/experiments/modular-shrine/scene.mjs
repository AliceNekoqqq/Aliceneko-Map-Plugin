// Read-only projection of the existing shrine domain. Repair stages are NOT upgrade tiers.
export const facilities = ['鸟居', '参道', '社务所', '拜殿', '庭院'];
export const changes = {
  鸟居: '鸟居换上注连绳与金饰，门前添上手水钵。',
  参道: '土径铺成石参道，两侧增设石灯笼。',
  社务所: '社务所展开接待侧屋，旁边立起绘马架。',
  拜殿: '拜殿换上完整屋顶、朱栏与奉纳箱。',
  庭院: '庭院新增水池、花丛与第二株樱树。'
};
export const sprites = {
  gate: [0,0,375,380], gateDone: [375,0,373,380],
  hall: [749,0,344,380], hallDone: [1095,0,441,380],
  office: [0,385,325,310], officeDone: [328,385,469,310],
  pond: [800,390,370,305], tree: [1170,385,366,310],
  lantern: [0,695,326,329], ema: [326,695,390,329],
  basin: [716,700,412,324], bush: [1128,700,408,324]
};
// Stable world anchors replace only the visual coordinates, never the saved zone/slot IDs.
export const slots = {
  veranda: {north_eave:[591,282],south_eave:[652,282],floor_left:[588,327],floor_right:[663,327]},
  courtyard: {garden_edge:[172,339],stone_path:[333,390]},
  gate: {gate_eave:[260,358],gate_stand:[190,435]},
  tea_table: {seat_left:[545,370],seat_right:[594,370]}
};
const decorAtlas = {wind_chime:[0,0],zabuton:[1,0],lantern:[2,0],herb_planter:[0,1],flower_vase:[1,1],morning_glory:[2,1]};
export function unwrap(value) {
  const s = value?.stat_data || value?.data?.stat_data || value;
  if (!s || typeof s !== 'object' || !s.神社 || typeof s.神社 !== 'object') throw Error('需要包含「神社」字段的 stat_data JSON。');
  return s;
}
export function project(value) {
  const state = unwrap(value), modules = [], stages = {};
  for (const name of facilities) {
    const n = state.神社[name] ?? 1;
    if (!Number.isInteger(n) || n < 0 || n > 4) throw Error(name + '修缮进度应为 0～4。');
    stages[name] = n;
  }
  const add = (id, sprite, x, y, w, h, owner) => modules.push({id,sprite,x,y,w,h,owner});
  if (stages.拜殿) add('hall',stages.拜殿===4?'hallDone':'hall',427,219,242,208,'拜殿');
  if (stages.社务所) add('office',stages.社务所===4?'officeDone':'office',628,332,209,141,'社务所');
  if (stages.鸟居) add('gate',stages.鸟居===4?'gateDone':'gate',260,447,151,158,'鸟居');
  if (stages.庭院) add('garden-tree','tree',116,295,146,136,'庭院');
  if (stages.鸟居===4) add('gate-basin','basin',159,437,66,54,'鸟居');
  if (stages.参道===4) {
    add('path-lantern-left','lantern',298,310,43,57,'参道');
    add('path-lantern-right','lantern',397,365,43,57,'参道');
  }
  if (stages.社务所===4) add('office-ema','ema',532,350,80,69,'社务所');
  if (stages.庭院===4) {
    add('garden-pond','pond',125,378,147,94,'庭院');
    add('garden-flower','bush',183,295,74,49,'庭院');
    add('garden-tree-2','tree',72,447,112,112,'庭院');
  }
  const decorations = (Array.isArray(state.生活?.布置) ? state.生活.布置 : []).flatMap(d => {
    const point = slots[d.zone]?.[d.slot];
    return point ? [{id:d.id,item:d.item,zone:d.zone,slot:d.slot,lit:!!d.state?.lit,x:point[0],y:point[1]}] : [];
  });
  return {stages,modules,decorations,period:state.环境?.时段 || '白昼'};
}
export async function mount(canvas, {getState, subscribe, atlasURL, decorURL, drawModules=true, drawDecorations=true, onRender=()=>{}}) {
  const ctx=canvas.getContext('2d'); canvas.width=768;canvas.height=512;
  const load=url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('场景部件未加载，请重新打开。'));im.src=url;});
  const [atlas,decor]=await Promise.all([load(atlasURL),drawDecorations?load(decorURL):Promise.resolve(null)]);
  let stopped=false, last=null;
  function render(value) {
    if(stopped)return;
    const view=project(value); last=view;
    ctx.imageSmoothingEnabled=false;
    ctx.fillStyle='#819370';ctx.fillRect(0,0,768,512);
    // Deterministic small ground pixels; no pre-painted buildings are hidden under modules.
    for(let i=0;i<1600;i++) {const x=(i*197+23)%768,y=(i*83+17)%512;ctx.fillStyle=i%3?'#8c9c7a':'#748667';ctx.fillRect(x,y,3,2);}
    const path=(stone)=>{
      for(let y=216;y<536;y+=12){const center=y>422?260:427-(y-216)*.81;
        for(let k=-2;k<3;k++){const x=Math.round((center+k*13)/4)*4;
          ctx.fillStyle=stone?(k%2?'#b6b5a4':'#c6c2ad'):'#aa9e7c';ctx.fillRect(x,y,stone?12:14,stone?10:13);
          if(stone){ctx.fillStyle='#d5d0b8';ctx.fillRect(x,y,12,2);}}
      }
    };
    if(view.stages.参道)path(view.stages.参道===4);
    // Permanent boundary planting belongs to terrain, independent of the five facilities.
    const draw=(sprite,x,y,w,h)=>ctx.drawImage(atlas,...sprites[sprite],Math.round(x-w/2),Math.round(y-h),w,h);
    [[35,150,130,126],[175,112,132,120],[615,116,130,120],[735,172,138,132]].forEach(a=>draw('tree',...a));
    // Quiet wooden tea platform remains available for old life decorations.
    ctx.fillStyle='#675547';ctx.fillRect(523,357,90,30);ctx.fillStyle='#a88a67';ctx.fillRect(523,353,90,28);
    for(let x=525;x<613;x+=12){ctx.fillStyle='#8e7256';ctx.fillRect(x,353,1,28);}
    const layers=(drawModules?view.modules:[]).map(m=>({...m,kind:'module'})).sort((a,b)=>a.y-b.y).concat((drawDecorations?view.decorations:[]).map(d=>({...d,kind:'decor'})));
    for(const item of layers){
      if(item.kind==='module')draw(item.sprite,item.x,item.y,item.w,item.h);
      else if(decorAtlas[item.item]) {
        const [c,r]=decorAtlas[item.item],sw=decor.width/3,sh=decor.height/2;
        if(item.lit){ctx.fillStyle='#e4bf6b66';ctx.beginPath();ctx.arc(item.x,item.y-14,18,0,Math.PI*2);ctx.fill();}
        ctx.drawImage(decor,c*sw,r*sh,sw,sh,item.x-18,item.y-36,36,36);
      }else {ctx.fillStyle='#d3b98a';ctx.fillRect(item.x-5,item.y-10,10,10);}
    }
    if(/夜|凌晨/.test(view.period)){ctx.fillStyle='#18254e77';ctx.fillRect(0,0,768,512);}
    else if(view.period==='傍晚'){ctx.fillStyle='#ce864a28';ctx.fillRect(0,0,768,512);}
    canvas.setAttribute('aria-label','御影神社：'+facilities.map(n=>n+(view.stages[n]===4?'已完工':view.stages[n]===0?'未放置':'原有外观')).join('，'));
    onRender(view); return view;
  }
  render(await getState());
  const unsubscribe=subscribe?.(value=>render(value));
  return {render,inspect:()=>last,dispose(){stopped=true;if(typeof unsubscribe==='function')unsubscribe();}};
}
