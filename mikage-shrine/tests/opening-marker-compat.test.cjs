const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const text=fs.readFileSync(__dirname+'/../releases/1.49.39/modules/scene.mjs','utf8');
let row;
const ctx={first:()=>row,marker:'<MikageOpeningScreen/>',getLastMessageId:()=>0,substitudeMacros:x=>x,OpeningStories:[{text:'canonical story'}]};vm.createContext(ctx);
const start=text.indexOf('  function eligible(){'),end=text.indexOf('  const tokenFor=',start);
vm.runInContext(text.slice(start,end)+'\nthis.testEligible=eligible;',ctx);
for(const message of ['<MikageOpeningScreen/>','  <MikageOpeningScreen/>\n','<MikageOpeningScreen/>\n\n<StatusPlaceHolderImpl/>','<MikageOpeningScreen/>\r\n<StatusPlaceHolderImpl/>\r\n']){
 row={id:0,message};assert.equal(ctx.testEligible().message,ctx.marker);assert.equal(ctx.testEligible().id,row.id);
}
for(const message of ['正文<MikageOpeningScreen/>','<MikageOpeningScreen/>正文','```<MikageOpeningScreen/>```','<StatusPlaceHolderImpl/>']){
 row={id:0,message};assert.equal(ctx.testEligible(),null);
}
assert(text.includes('if(/^\\s*<MikageOpeningScreen\\/>\\s*(?:<StatusPlaceHolderImpl\\/>\\s*)?$/.test(row.message))continue;'));
console.log('PASS fresh opening with optional host-added status marker; stable fresh token despite host marker insertion; prose/code stay outside opening; statusbar waits for story selection');
