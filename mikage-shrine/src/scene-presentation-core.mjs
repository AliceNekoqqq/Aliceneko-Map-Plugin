/* Read-only projection. Message prose and MVU facts remain separate authorities. */
export function narrativeText(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<(UpdateVariable|MikageTaskArchive|think|thinking|analysis)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi, '')
    .replace(/```(?:html|xml|json|javascript|js)\b[\s\S]*?(?:```|$)/gi, '')
    .replace(/<StatusPlaceHolderImpl\s*\/?\s*>/gi, '')
    .replace(/<!--[\s\S]*?(?:-->|$)/g, '')
    .replace(/<(script|style|iframe)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi, '')
    .replace(/<[^>\n]+>/g, '')
    .replace(/\n{3,}/g, '\n\n').trim();
}

export function presentationView(state, raw) {
  const text = narrativeText(raw);
  const location = typeof state?.环境?.地点 === 'string' ? state.环境.地点 : '';
  const tomoe = typeof state?.巴卫?.位置 === 'string' ? state.巴卫.位置 : '';
  // Whole location segments only: “回廊” matches “御影神社·回廊”, not “另一条回廊”.
  const here = !!location && !!tomoe && (location === tomoe || location.split(/[·・/]/).includes(tomoe));
  const quote = text.match(/(?:^|[\n。！？])\s*巴卫(?:[：:]\s*|(?:低声道|冷声道|轻声道|说道|问道|说|道|问)[：:，,]?\s*)[“「]([^”」\n]{1,240})[”」]/)?.[1] || '';
  const speech = here ? quote : '';
  const preview = speech ? '“' + speech + '”' : text.slice(0, 190) + (text.length > 190 ? '…' : '');
  const task = state?.委托;
  const title = typeof task?.诉求 === 'string' ? task.诉求 : '';
  const taskText = task?.编号 && title ? title : '暂未接下委托';
  return { text, preview, speaker: speech ? '巴卫' : '本轮正文', portrait: here && !!text,
    outfit: typeof state?.巴卫?.服装 === 'string' ? state.巴卫.服装 : 'usual',
    location, period: typeof state?.环境?.时段 === 'string' ? state.环境.时段 : '',
    weather: typeof state?.环境?.天气 === 'string' ? state.环境.天气 : '',
    region: typeof state?.地图?.当前地区 === 'string' ? state.地图.当前地区 : '', taskText };
}
