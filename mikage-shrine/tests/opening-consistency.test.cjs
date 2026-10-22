const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {isDeepStrictEqual:equal}=require('node:util');
const root=path.resolve(__dirname,'..'),release=process.env.MIKAGE_OPENING_RELEASE||'1.49.15';
const catalogPath=path.join(root,'releases/1.49.15/opening-stories.json');
const stories=JSON.parse(fs.readFileSync(catalogPath,'utf8'));
const spec=JSON.parse(fs.readFileSync(path.join(root,'releases',release,'manifest.json')));
const card=JSON.parse(fs.readFileSync(path.join(root,'releases',release,'card-source.json')));
const modulePath=path.resolve(root,'..',spec.modules.find(x=>x.module_id==='scene').path);
const read=p=>fs.readFileSync(p,'utf8');
function literal(source,marker){const start=source.indexOf(marker)+marker.length;assert(start>=marker.length);return JSON.parse(source.slice(start).split('\n')[0].slice(0,-1));}
function inline(html){return JSON.parse(html.split('window.OpeningStoryData=')[1].split(';window.OpeningPreview=')[0]);}
const runtime=read(modulePath),template=read(path.join(root,'src/scene-host.mjs'));
assert(equal(literal(runtime,'const OpeningStories='),stories),'Runtime start stories drifted from the canonical opening catalog');
assert(equal(inline(literal(runtime,'const OpeningHTML=')),stories),'Runtime preview differs');
assert(equal(literal(template,'const OpeningStories='),stories),'Maintenance scene differs');
assert(equal(inline(literal(template,'const OpeningHTML=')),stories),'Maintenance embedded HTML differs');
assert(equal(inline(read(path.join(root,'src/opening.html'))),stories),'Maintenance HTML differs');
assert(equal(card.data.alternate_greetings,stories.slice(1).map(x=>x.text)),'Native alternate greetings differ');
assert.equal(card.first_mes,'<MikageOpeningScreen/>');assert.equal(card.data.first_mes,card.first_mes);
assert.equal(spec.opening_content.source,'releases/1.49.15/opening-stories.json');
console.log('PASS canonical prose parity across maintenance HTML/template, runtime preview/start and native alternate greetings');

// Run the actual versioned modules in the established DOM/bridge fixture.
let suite=read(path.join(__dirname,'startup-integration.test.cjs'));
function inject(anchor,replacement){assert(suite.includes(anchor),'Fixture anchor changed');suite=suite.replace(anchor,replacement);}
inject("const release=process.argv[2]||'1.29.3';",'const release='+JSON.stringify(release)+';\nconst canonicalStories='+JSON.stringify(stories)+';');
inject('firstChoice.click();firstChoice.click();',`assert.deepEqual(clone(opening.OpeningStoryData),canonicalStories);const beforeOpening=JSON.stringify(rows[0].data.stat_data);firstChoice.click();firstChoice.click();`);
inject("assert(rows[0].message.includes('MikageOpeningStarted:opening-1'));",`assert.equal(rows[0].message,canonicalStories[0].text.replaceAll('{{user}}','测试玩家')+'\\n\\n<!--MikageOpeningStarted:opening-1-->');assert.equal(JSON.stringify(rows[0].data.stat_data),beforeOpening);`);
inject('await host.MikageOpeningScreen.bridge.start(branch);await tick();',`const beforeBranch=JSON.stringify(rows[0].data.stat_data);await host.MikageOpeningScreen.bridge.start(branch);await tick();assert.equal(rows[0].message,canonicalStories.find(x=>x.id===branch).text.replaceAll('{{user}}','测试玩家')+'\\n\\n<!--MikageOpeningStarted:'+branch+'-->');assert.equal(JSON.stringify(rows[0].data.stat_data),beforeBranch);`);
inject("  rows=[];host.document.querySelector('#chat').replaceChildren();emit(events.CHAT_CHANGED);",`  for(const story of canonicalStories.slice(1)){
    const message=story.text.replaceAll('{{user}}','测试玩家'),beforeWrites=messageWrites;
    rows=[{message_id:0,swipe_id:0,role:'assistant',message,data:{stat_data:clone(initial)}}];
    host.document.querySelector('#chat').innerHTML='<div class="mes" mesid="0"><div class="mes_text"></div></div>';
    host.document.querySelector('.mes_text').textContent=message;emit(events.CHAT_CHANGED);await tick();
    assert.equal(rows[0].message,message);assert.equal(messageWrites,beforeWrites);
    assert.equal(host.document.querySelectorAll('iframe[title="游戏标题页"]').length,0);
    assert.equal(host.document.querySelectorAll('iframe[title="御影神社状态栏"]').length,1);
  }
  console.log('PASS actual saved text equals catalog for all 3 branches; name expansion, duplicate guard and state unchanged; native alternates mount status without rewriting messages');
  rows=[];host.document.querySelector('#chat').replaceChildren();emit(events.CHAT_CHANGED);`);
vm.runInThisContext('(function(require,__dirname){'+suite+'\n})',{filename:__filename})(require,__dirname);
