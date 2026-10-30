/* Read-only presentation helpers. Never changes task or archive authority. */
export function panelEmaMatches(status, filter) {
  return filter === 'all' || ({active:'进行',paused:'暂停',completed:'已完成'})[filter] === status;
}
export function panelArchiveView(snapshot, expectedScope, taskId = '') {
  if (!expectedScope || snapshot?.scope !== expectedScope) return {status:'unavailable',records:[],truncated:false};
  const active=Array.isArray(snapshot?.status?.active)?snapshot.status.active:[];
  const tasks=Array.isArray(snapshot?.view?.tasks)?snapshot.view.tasks:[];
  const text=value=>typeof value==='string'?value.slice(0,2000):'';
  const lines=value=>Array.isArray(value)?value.filter(v=>typeof v==='string').slice(0,20).map(v=>v.slice(0,500)):[];
  const matches=active.filter(r=>r&&typeof r.taskId==='string'&&(!taskId||r.taskId===taskId)&&r.data&&typeof r.data==='object');
  return {status:'ready',truncated:matches.length>100,records:matches.slice(-100).map(r=>({
    taskId:text(r.taskId),eventId:text(r.eventId),wish:text(tasks.find(t=>t.id===r.taskId)?.wish),
    choice:text(r.data.choice),result:text(r.data.result),effects:lines(r.data.effects),unresolved:lines(r.data.unresolved)
  }))};
}
