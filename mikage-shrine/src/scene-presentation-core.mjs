/* Read-only scene projection. Chat prose stays in its original message. */
export function portraitPlacement(record,width,height,target){
  if(!record||!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return null;
  let scale,left,top;
  if(record.mode==='small'){
    const [x,y,right,bottom]=record.bounds,p=target.small;
    scale=Math.min(height*p.height/(bottom-y),width*p.widthLimit/(right-x));
    left=width/2-(x+right)/2*scale;top=height*p.baseline-bottom*scale;
  }else{
    const p=target.adult;
    scale=height*p.chinSpan/(record.chin-record.eye[1]);
    left=width*p.eyeX-record.eye[0]*scale;top=height*p.eyeY-record.eye[1]*scale;
  }
  return {width:record.width*scale,height:record.height*scale,left,top,scale};
}
export function presentationView(state) {
  const location = typeof state?.环境?.地点 === 'string' ? state.环境.地点 : '';
  const tomoe = typeof state?.巴卫?.位置 === 'string' ? state.巴卫.位置 : '';
  // Whole location segments only: “回廊” matches “御影神社·回廊”, not “另一条回廊”.
  const here = !!location && !!tomoe && (location === tomoe || location.split(/[·・/]/).includes(tomoe));
  const task = state?.委托;
  const title = typeof task?.诉求 === 'string' ? task.诉求 : '';
  const taskText = task?.编号 && title ? title : '暂未接下委托';
  return { portrait: here,
    outfit: typeof state?.巴卫?.服装 === 'string' ? state.巴卫.服装 : 'usual',
    location, period: typeof state?.环境?.时段 === 'string' ? state.环境.时段 : '',
    weather: typeof state?.环境?.天气 === 'string' ? state.环境.天气 : '',
    region: typeof state?.地图?.当前地区 === 'string' ? state.地图.当前地区 : '', taskText };
}
