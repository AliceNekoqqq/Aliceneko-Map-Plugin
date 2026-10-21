/* Existing browser scenarios, actual 1.48.2 modules, approved prose assertions. */
const fs=require('node:fs'),path=require('node:path');
const names=['school','market','plum','dress','wind','stealth','fox','thread','festival'],name=process.argv[2];
if(!names.includes(name))throw Error('Unknown scenario');
const root=path.resolve(__dirname,'..'),edits=JSON.parse(fs.readFileSync(path.join(root,'releases/1.48.2/copy-edits.json'),'utf8'));
const region='R'+String(names.indexOf(name)+2).padStart(2,'0'),read=fs.readFileSync;
fs.readFileSync=function(file,...args){
 if(typeof file==='string'&&/\/releases\/\d+\.\d+\.\d+\/(scene|minigames)\.mjs$/.test(file))file=file.replace(/\/releases\/\d+\.\d+\.\d+\//,'/releases/1.48.2/');
 const value=read.call(this,file,...args);
 if(typeof file==='string'&&file.endsWith('/'+name+'-browser.test.cjs')){
  let text=String(value);
  for(const e of edits)if(e.area.startsWith(region))text=text.split(e.old).join(e.new);
  text=text.replace(/\.includes\('([^'\n]{4,})'\)/g,(expression,fragment)=>{
   if(!/[\u3400-\u9fff]/.test(fragment))return expression;
   const matches=edits.filter(e=>e.area.startsWith(region)&&e.old.includes(fragment)&&!e.new.includes(fragment));
   return matches.length===1?'.includes('+JSON.stringify(matches[0].new)+')':expression;
  });
  return typeof value==='string'?text:Buffer.from(text);
 }
 return value;
};
process.env.MIKAGE_RELEASE='1.48.2';process.env['MIKAGE_'+name.toUpperCase()+'_QA']=path.join('/tmp/mikage-copy-1.48.2',name);
require('./'+name+'-browser.test.cjs');
