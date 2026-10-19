#!/usr/bin/env python3
"""Derive R10 festival from the immutable 1.38.0 release snapshot."""
from pathlib import Path
import argparse,hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.39.0'
ENTRY="  R10:['lantern','万灯花火祭','lantern','用狐火点亮八盏小灯，接九拍花火，再留一页祭典手帖。'],"
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Anchor mismatch: '+a[:70])
 return s.replace(a,b,1)
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--refresh-staging',action='store_true');a=ap.parse_args()
 base=ROOT/'releases/1.38.0';dest=ROOT/'releases'/VERSION
 if dest.exists() and not a.refresh_staging:raise ValueError('Release exists')
 if dest.exists() and json.loads((dest/'manifest.json').read_text())['release']!=VERSION:raise ValueError('Staging identity mismatch')
 game=once((base/'minigames.mjs').read_text(),"const version = '1.38.0';","const version = '1.39.0';")
 m=re.search(r'const GAME_CSS = ("(?:[^"\\]|\\.)*");',game);css=json.loads(m[1])+'\n'+(ROOT/'src/festival/style.css').read_text();game=game[:m.start(1)]+json.dumps(css,ensure_ascii=False)+game[m.end(1):]
 addon='\n'.join((ROOT/'src/festival'/p).read_text() for p in ['model.js','sky.js','activity.js'])+'\n'
 game=once(game,'function createMikageActivities(',addon+'function createMikageActivities(')
 route="    if(region==='R10')return mountMikageFestival(global,container,{...opts,getMemoryBook:readMemoryBook,onComplete:result=>{const memories=saveMemories('R10',result.detail,['R10-FESTIVAL']);opts.onComplete?.({...result,memories});return memories.every(m=>m.persistent!==false);}});\n"
 game=once(game,'    if (!META[region]) throw new RangeError(',route+'    if (!META[region]) throw new RangeError(')
 start=game.index('      R10(){\n');end=game.index('\n    };',start);game=game[:start]+game[end:]
 game=once(game,"    mount.dataset.mikageMinigameHost = '';","    mount.dataset.mikageMinigameHost = '';\n    if(region==='R10')mount.dataset.mikageFestival='true';")
 game,n=re.subn(r"^    R10:\['lantern'.*$","    R10:['lantern','万灯花火祭','点亮八盏小灯，接九拍花火，再并肩看一会儿夜空。','祭典花火手帖','这一晚的灯色与余光，留在手帖里。'],",game,flags=re.M);assert n==1
 game=once(game,"    {id:'R10',","    {id:'R10-FESTIVAL',region:'R10',place:'缘结参道·万灯大祭',item:'祭典花火手帖',line:'点好灯，接住升起的光，再陪他看一会儿夜空。'},\n    {id:'R10',")
 game,n=re.subn(r"^  R10: \{ place:.*$","  R10: { place:'缘结参道·万灯大祭', title:'万灯花火祭', note:'用狐火点亮手边八盏新灯，再切入夜景，跟着升空光圈接九拍花火。可流动跟拍、逐拍观赏或请巴卫提示。看完后自选狐形、樱花与重环花火，留下一页如实的祭典手帖。', tags:['长按与划过点灯','九拍花火与逐拍观赏','双人夜景与自选花火'] },",game,flags=re.M);assert n==1
 scene=(base/'scene.mjs').read_text();m=re.search(r'const StatusbarHTML=("(?:[^"\\]|\\.)*");',scene);html=json.loads(m[1]);html,n=re.subn(r"^  R10:\['lantern'.*$",ENTRY,html,flags=re.M);assert n==1
 scene=once(scene[:m.start(1)]+json.dumps(html,ensure_ascii=False)+scene[m.end(1):],"const version = '1.38.0';","const version = '1.39.0';")
 roam=(ROOT/'src/roam-controller.js').read_text();roam,n=re.subn(r"^  R10:\['lantern'.*$",ENTRY,roam,flags=re.M)
 if n!=1 and ENTRY not in roam:raise ValueError('Maintained R10 mismatch')
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':script['name']='御影神社·衣装与散策 '+VERSION+' CDN';script['info']='R10入口同步万灯花火祭；前九项与当前两人衣柜保留。'
  if script['id']=='d3560ad0-892c-4b31-b783-11f80a23b90f':script['name']='御影神社·独立小游戏 '+VERSION+' CDN';script['info']='第10项R10：狐火点灯、九拍花火、并肩观赏与如实祭典手帖；十项小游戏源实现齐备，真实宿主验收待确认。'
 manifest=json.loads((base/'manifest.json').read_text());manifest['release']=VERSION;manifest['source_name']='1.38.0/card-source.json';manifest['source_sha256']=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest()
 for module in manifest['modules']:
  if module['module_id'] in ['scene','minigames']:
   module.update(version=VERSION,path='mikage-shrine/releases/'+VERSION+'/'+module['module_id']+'.mjs',sha256=hashlib.sha256((scene if module['module_id']=='scene' else game).encode()).hexdigest())
 manifest.update(deferred='All ten replacements implemented; real SillyTavern/Android and author acceptance pending',worldbook_policy='All 37 worldbook entries, regexes, initial variables and formal rules unchanged from 1.38.0',festival={'state_scope':'temporary session; local R10-FESTIVAL memory on confirmation only','assets':'existing R10 day/dusk/night and shared wardrobe; deterministic local canvas sky; no new remote dependency','host_acceptance':'pending'})
 outputs={'minigames.mjs':game,'scene.mjs':scene,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(manifest,ensure_ascii=False,indent=2)+'\n'}
 print(json.dumps({'dry_run':a.dry_run,'release':VERSION,'outputs':list(outputs),'maintained':['src/roam-controller.js']}))
 if a.dry_run:return
 dest.mkdir(exist_ok=a.refresh_staging)
 for file,text in outputs.items():(dest/file).write_text(text)
 (ROOT/'src/roam-controller.js').write_text(roam)
if __name__=='__main__':main()
