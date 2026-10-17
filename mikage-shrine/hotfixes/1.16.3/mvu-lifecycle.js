// Install before importing the core: its first initialization may emit immediately.
const owns=v=>!!v?.stat_data?.巴卫&&!!v?.stat_data?.事件调度;
let lastUpdateWarning='',lastUpdateWarningTime=0;
function warnUpdate(error){
  const message=error?.message||String(error),now=Date.now();
  console.warn('[御影神社MVU] 本轮状态保留上一快照：',message);
  if(message===lastUpdateWarning&&now-lastUpdateWarningTime<5000)return;
  lastUpdateWarning=message;lastUpdateWarningTime=now;
  if(typeof toastr!=='undefined')toastr.warning('本轮状态未更新：'+message,'御影神社');
}
const prepare=v=>{
  if(owns(v))try{
    const result=ShrineCard.normalizeLegacyState(v.stat_data);
    v.stat_data=result.state;v.schema=ShrineCard.schema(result.state);
    if(result.changed){v.display_data=JSON.parse(JSON.stringify(result.state));v.delta_data={};}
  }catch(error){console.warn('[御影神社MVU] 当前记录结构待修复：',error.message);}
  dispatchShrineMvuStatus();
};
eventOn('mag_variable_initialized',prepare);
eventOn('mag_variable_update_started',prepare);
eventOn('mag_variable_update_ended',(variables,before)=>{
  if(!owns(variables)||!owns(before)){dispatchShrineMvuStatus();return;}
  let oldState;
  try{
    oldState=ShrineCard.normalizeLegacyState(before.stat_data).state;
    const candidate=ShrineCard.normalizeLegacyState(variables.stat_data).state;
    const result=ShrineCard.validate(candidate,oldState);
    variables.stat_data=result;variables.schema=ShrineCard.schema(result);
    variables.display_data=JSON.parse(JSON.stringify(result));
  }catch(error){
    variables.stat_data=JSON.parse(JSON.stringify(oldState||before.stat_data));
    if(oldState)variables.schema=ShrineCard.schema(oldState);
    else variables.schema=JSON.parse(JSON.stringify(before.schema||{}));
    variables.display_data=JSON.parse(JSON.stringify(oldState||before.display_data||before.stat_data));variables.delta_data={};
    warnUpdate(error);
  }
  dispatchShrineMvuStatus();
});

let migrationEpoch=0,migrationQueue=Promise.resolve();
function migrationContext(){
  try{if(typeof getCurrentChatId==='function')return String(getCurrentChatId());}catch{}
  try{return String(ShrineDiagnosticsHost?.SillyTavern?.getContext?.().chatId??'');}catch{return '';}
}
function rowStamp(id){
  try{const row=getChatMessages(id,{include_swipes:false})?.[0];return row?JSON.stringify([row.message_id,row.swipe_id??0,row.message]):null;}catch{return null;}
}
function containsSchema(actual,expected){
  if(expected&&typeof expected==='object'&&!Array.isArray(expected))return !!actual&&typeof actual==='object'&&!Array.isArray(actual)&&Object.entries(expected).every(([key,value])=>Object.hasOwn(actual,key)&&containsSchema(actual[key],value));
  return JSON.stringify(actual)===JSON.stringify(expected);
}
async function repairMessage(messageId){
  if(typeof Mvu==='undefined'||typeof Mvu.replaceMvuData!=='function'||!Number.isInteger(messageId)||messageId<0)return false;
  const epoch=migrationEpoch,context=migrationContext(),row=rowStamp(messageId);
  const table=Mvu.getMvuData({type:'message',message_id:messageId});
  if(!owns(table))return false;
  const original=JSON.stringify(table),result=ShrineCard.normalizeLegacyState(table.stat_data);
  const schema=ShrineCard.schema(result.state);
  if(!result.changed&&containsSchema(table.schema,schema))return false;
  // No await between this fence and the exact-floor write. A queued chat/swipe
  // change or another writer aborts the migration rather than replacing its data.
  if(epoch!==migrationEpoch||context!==migrationContext()||row!==rowStamp(messageId)||JSON.stringify(Mvu.getMvuData({type:'message',message_id:messageId}))!==original)return false;
  const next=JSON.parse(original);next.stat_data=result.state;next.schema=schema;
  if(result.changed){next.display_data=JSON.parse(JSON.stringify(result.state));next.delta_data={};}
  await Mvu.replaceMvuData(next,{type:'message',message_id:messageId});
  if(epoch!==migrationEpoch||context!==migrationContext())return true;
  try{const swipeId=Number(getChatMessages(messageId,{include_swipes:false})?.[0]?.swipe_id??0);ShrineDiagnosticsHost?.dispatchEvent?.(new ShrineDiagnosticsHost.CustomEvent('mikage:mvu-message-replaced',{detail:{messageId,swipeId}}));}catch{}
  dispatchShrineMvuStatus();
  return true;
}
function repairCurrentMessages(){
  const requestedEpoch=migrationEpoch,requestedContext=migrationContext();
  const run=async()=>{
    if(requestedEpoch!==migrationEpoch||requestedContext!==migrationContext())return 0;
    const last=typeof getLastMessageId==='function'?Number(getLastMessageId()):NaN;
    if(!Number.isInteger(last)||last<0)return 0;
    const ids=new Set([last]);
    for(const node of ShrineDiagnosticsHost?.document?.querySelectorAll?.('#chat .mes[mesid]')||[]){
      const raw=node.getAttribute('mesid');if(raw===null||raw==='')continue;
      const id=Number(raw);if(Number.isInteger(id)&&id>=0&&id<=last)ids.add(id);
    }
    let repaired=0;
    for(const id of ids){
      if(requestedEpoch!==migrationEpoch||requestedContext!==migrationContext())break;
      try{if(await repairMessage(id))repaired++;}catch(error){console.warn('[御影神社MVU] 第'+id+'楼未自动修复：',error.message);}
    }
    return repaired;
  };
  const task=migrationQueue.then(run,run);migrationQueue=task.catch(()=>{});return task;
}
