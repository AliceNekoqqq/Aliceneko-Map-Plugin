/** Run the project's existing iframe integration harness with the actual reader. */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const filename=path.join(__dirname,'startup-integration.test.cjs');let source=fs.readFileSync(filename,'utf8');
const anchor="const src=id=>fs.readFileSync(path.resolve(project,'..',manifest.modules.find(m=>m.module_id===id).path),'utf8');";
if(!source.includes(anchor))throw Error('Integration harness changed');
source=source.replace(anchor,"const src=id=>id==='reading'?fs.readFileSync(path.resolve(project,'releases/reading-1.1.5/reading.mjs'),'utf8').replace(/^export /gm,''):fs.readFileSync(path.resolve(project,'..',manifest.modules.find(m=>m.module_id===id).path),'utf8');");
source=source.replace("run('scene');run('panels');run('minigames');run('mvu');await tick();await tick();","run('scene');run('panels');run('minigames');run('mvu');run('reading');await tick();await tick();");
const checkpoint="assert.equal(host.document.querySelectorAll('iframe[title=\"御影神社状态栏\"]').length,1,'Statusbar should mount after starting');";
if(!source.includes(checkpoint))throw Error('Integration checkpoint changed');
source=source.replace(checkpoint,checkpoint+"\n assert(host.document.querySelector('[data-mikage-reading]'),'Reader must decorate the real opened message');assert.equal(host.document.querySelectorAll('.mr-hero').length,1);assert.equal(host.document.querySelectorAll('.mr-bridge').length,1);const readBefore=rows[0].message;host.MikageReading.showSettings();host.document.querySelector('[data-setting=theme][data-value=night]').click();await tick();assert.equal(rows[0].message,readBefore);host.document.querySelector('.mr-settings-backdrop').dispatchEvent(new host.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));");
const m=new Module(filename,module);m.filename=filename;m.paths=module.paths;m._compile(source,filename);
