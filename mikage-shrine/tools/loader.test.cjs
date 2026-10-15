const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(__dirname + '/loader-template.js', 'utf8').replace('import(url)', 'mockImport(url)');
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
async function settle(context) {
  await tick();
  const state = context.__MIKAGE_REMOTE_LOADERS__.__SCRIPT_ID__;
  if (state.promise) await state.promise;
  return state;
}
function setup(mockImport) {
  let bindings = 0;
  const context = vm.createContext({URL,setTimeout,clearTimeout,mockImport,console:{error(){}},eventOn(){bindings++;},getButtonEvent:n=>n});
  vm.runInContext(source,context);
  return {context,bindings:()=>bindings};
}
const moduleFor = start => ({VERSION:'__VERSION__',SCRIPT_ID:'__SCRIPT_ID__',start});
(async () => {
  let imports=0,starts=0;
  let env=setup(async()=>{imports++; if(imports<3) throw Error('offline'); return moduleFor(()=>{starts++;});});
  assert.equal((await settle(env.context)).status,'running');
  assert.equal(imports,3); assert.equal(starts,1);
  vm.runInContext(source,env.context);
  await env.context.__MIKAGE_REMOTE_RETRY__.__SCRIPT_ID__();
  assert.equal(starts,1); assert.equal(env.bindings(),1);

  imports=0; starts=0;
  env=setup(async()=>{imports++;return moduleFor(()=>{starts++;throw Error('partial side effects');});});
  assert.equal((await settle(env.context)).status,'blocked');
  await env.context.__MIKAGE_REMOTE_RETRY__.__SCRIPT_ID__();
  assert.equal(imports,1); assert.equal(starts,1);

  imports=0; starts=0; let offline=true;
  env=setup(async()=>{imports++;if(offline)throw Error('offline');return moduleFor(()=>{starts++;});});
  assert.equal((await settle(env.context)).status,'failed');
  assert.equal(imports,3);offline=false;
  await env.context.__MIKAGE_REMOTE_RETRY__.__SCRIPT_ID__();
  assert.equal(env.context.__MIKAGE_REMOTE_LOADERS__.__SCRIPT_ID__.status,'running');
  assert.equal(starts,1);

  imports=0; starts=0;
  env=setup(async()=>{imports++;return imports===1?{VERSION:'bad',SCRIPT_ID:'__SCRIPT_ID__',start(){starts++;}}:moduleFor(()=>{starts++;});});
  assert.equal((await settle(env.context)).status,'running');
  assert.equal(imports,2);assert.equal(starts,1);

  // A different VM represents another Tavern Helper iframe: same ID must run there too.
  const second=setup(async()=>moduleFor(()=>{starts++;}));
  assert.equal((await settle(second.context)).status,'running');assert.equal(starts,2);
  console.log('PASS: CDN fallback, local deduplication, start-failure blocking, network retry, version validation, independent iframe execution');
})().catch(error=>{console.error(error);process.exitCode=1;});
