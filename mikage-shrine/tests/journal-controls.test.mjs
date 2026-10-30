import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8'),json=p=>JSON.parse(read(p));
const old=json('releases/1.49.30/card-source.json'),next=json('releases/1.49.31/card-source.json'),manifest=json('releases/1.49.31/manifest.json');
const baseline=json('releases/1.49.30/manifest.json');
assert.equal(next.data.character_version,'1.49.31');assert.equal(next.character_version,'1.49.31');
assert.deepEqual(next.data.character_book.entries,old.data.character_book.entries);assert.equal(next.data.character_book.entries.length,39);
assert.deepEqual(next.data.extensions.regex_scripts,old.data.extensions.regex_scripts);assert.equal(next.data.extensions.regex_scripts.length,5);
assert.equal(next.data.extensions.tavern_helper.scripts.length,6);
const normalized=structuredClone(next);
normalized.character_version=old.character_version;normalized.data.character_version=old.data.character_version;
normalized.data.creator_notes=old.data.creator_notes;normalized.data.character_book.description=old.data.character_book.description;
for(const script of normalized.data.extensions.tavern_helper.scripts){const before=old.data.extensions.tavern_helper.scripts.find(x=>x.id===script.id);script.name=before.name;script.info=before.info;}
assert.deepEqual(normalized,old,'Only declared version/notes and changed-script metadata may differ');
for(const m of manifest.modules){assert.equal(createHash('sha256').update(readFileSync(new URL('../'+m.path,root)) ).digest('hex'),m.sha256);if(!['panels','archive'].includes(m.module_id))assert.deepEqual(m,baseline.modules.find(x=>x.module_id===m.module_id));}
const panel=read('releases/1.49.31/panels.mjs'),before=read('releases/1.49.30/panels.mjs');
const slice=(s,a,b)=>s.slice(s.lastIndexOf(a),s.lastIndexOf(b));
assert.equal(slice(panel,'  async function act(','  async function prepareShopDraft'),slice(before,'  async function act(','  async function prepareShopDraft'),'Actual action/transaction/generation handler is preserved');
const h=read('releases/1.49.31/panels.html'),oldH=read('releases/1.49.30/panels.html');
const lifeBlock=s=>{const a=s.indexOf('/* Life menu:');assert(a>=0);return s.slice(a,s.indexOf('</script>',a));};
assert.equal(lifeBlock(h),lifeBlock(oldH));
const archive=read('releases/1.49.31/archive.mjs'),oldArchive=read('releases/1.49.28/archive.mjs');
assert.equal(slice(archive,"  const NS='mikage_task_archives_v1'",'  function close()').replace(/\n  \/\/ Font-face[^\n]*\n  const archiveFontStyle[^\n]*\n/,'\n'),slice(oldArchive,"  const NS='mikage_task_archives_v1'",'  function close()'),'Archive persistence, prompts, API, scopes and lifecycle scans are preserved');
assert.equal(archive.slice(archive.indexOf('  function onKey')).replace('archiveFontStyle.remove();',''),oldArchive.slice(oldArchive.indexOf('  function onKey')),'Existing cleanup, events and focus trap are preserved');
assert(archive.startsWith(read('src/task-archive-core.mjs')),'Actual archive domain is bundled verbatim');
console.log('PASS journal source:39worldbook/5regex/6scripts, all undeclared fields,4untouched modules, panel act handler, archive domain/transactions/API/event cleanup and core preserved');
