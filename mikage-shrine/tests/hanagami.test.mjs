import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8'),json=p=>JSON.parse(read(p));
const base=json('releases/1.49.31/manifest.json'),next=json('releases/1.49.32/manifest.json');
function stringSlot(s,marker){const a=s.indexOf(marker)+marker.length;assert(a>=marker.length&&s[a]==='"',marker);let b=a+1;for(;b<s.length;b++){if(s[b]==='\\')b++;else if(s[b]==='"')break;}return {text:JSON.parse(s.slice(a,b+1)),outer:s.slice(0,a)+'<STRING>'+s.slice(b+1)};}
for(const m of next.modules){
 const old=base.modules.find(x=>x.module_id===m.module_id);assert(old);
 assert.equal(createHash('sha256').update(readFileSync(new URL('../'+m.path,root))).digest('hex'),m.sha256);
 if(!['panels','scene','archive'].includes(m.module_id)){assert.deepEqual(m,old);continue;}
 const a=read('../'+old.path),b=read('../'+m.path),kind=m.module_id;
 if(kind==='archive'){
  const x=stringSlot(a,'const ARCHIVE_STYLE='),y=stringSlot(b,'const ARCHIVE_STYLE=');assert(y.text.startsWith(x.text+'\n'));
  assert.equal(y.outer.replace("export const VERSION='1.49.32';","export const VERSION='1.49.31';"),x.outer,'Archive JavaScript remains byte-identical');
 }else{
  const marker='const '+(kind==='panels'?'MikagePanelHTML':'StatusbarHTML')+'=',x=stringSlot(a,marker),y=stringSlot(b,marker);
  assert.equal(y.text.replace(new RegExp('<style id="mikage-hanagami-'+kind+'">[\\s\\S]*?</style>'),''),x.text,'Existing HTML/content/controls remain byte-identical');
  assert.equal(y.outer.replace("const version = '1.49.32';","const version = '"+old.version+"';"),x.outer,'Host JavaScript remains byte-identical');
 }
}
const before=json('releases/1.49.31/card-source.json'),card=json('releases/1.49.32/card-source.json');
assert.equal(card.data.character_version,'1.49.32');assert.equal(card.data.character_book.entries.length,39);assert.equal(card.data.extensions.regex_scripts.length,5);assert.equal(card.data.extensions.tavern_helper.scripts.length,6);
const normalized=structuredClone(card);normalized.character_version=before.character_version;normalized.data.character_version=before.data.character_version;normalized.data.creator_notes=before.data.creator_notes;normalized.data.character_book.description=before.data.character_book.description;
for(const s of normalized.data.extensions.tavern_helper.scripts){const old=before.data.extensions.tavern_helper.scripts.find(x=>x.id===s.id);s.name=old.name;s.info=old.info;}
assert.deepEqual(normalized,before,'Only declared version/notes metadata may change');
const art=json('src/hanagami-art.json');assert.match(art.commit,/^[a-f0-9]{40}$/);assert.equal(art.assets.length,2);assert(art.assets.reduce((n,x)=>n+x.bytes,0)<400000);
for(const a of art.assets)assert.equal(createHash('sha256').update(readFileSync(new URL('../'+a.path,root))).digest('hex'),a.sha256);
for(const name of ['theme','scene','archive']){const css=read('src/hanagami-'+name+'.css');assert(css.includes('prefers-reduced-motion:reduce'));assert(!/@import|<script|javascript:|data:/i.test(css));}
console.log('PASS Hanagami: full inverse parity for3runtime modules, existing HTML/actions/prompt and save logic,39worldbook/5regex/6IDs,3untouched modules,2pinned assets under400KB and reduced-motion styles');
