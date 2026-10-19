#!/usr/bin/env python3
"""Derive R09 from immutable 1.37.0; never rebuild historical shared bundles."""
from pathlib import Path
import argparse,hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.38.0'
ENTRY="  R09:['seal','出云红线结缘','seal','移动线结理顺红线，穿绳收结，再留下一页结缘笺。'],"
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Anchor mismatch: '+a[:70])
 return s.replace(a,b,1)
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--refresh-staging',action='store_true');a=ap.parse_args()
 dest=ROOT/'releases'/VERSION;base=ROOT/'releases/1.37.0'
 if dest.exists() and not a.refresh_staging:raise ValueError('Release exists')
 if dest.exists() and json.loads((dest/'manifest.json').read_text())['release']!=VERSION:raise ValueError('Staging identity mismatch')
 game=once((base/'minigames.mjs').read_text(),"const version = '1.37.0';","const version = '1.38.0';")
 m=re.search(r'const GAME_CSS = ("(?:[^"\\]|\\.)*");',game);css=json.loads(m[1])+'\n'+(ROOT/'src/thread/style.css').read_text();game=game[:m.start(1)]+json.dumps(css,ensure_ascii=False)+game[m.end(1):]
 addon='\n'.join((ROOT/'src/thread'/p).read_text() for p in ['model.js','activity.js'])+'\n'
 game=once(game,'function createMikageActivities(',addon+'function createMikageActivities(')
 route="    if(region==='R09')return mountMikageThread(global,container,{...opts,getMemoryBook:readMemoryBook,onComplete:result=>{const memories=saveMemories('R09',result.detail,['R09-THREAD']);opts.onComplete?.({...result,memories});return memories.every(m=>m.persistent!==false);}});\n"
 game=once(game,'    if (!META[region]) throw new RangeError(',route+'    if (!META[region]) throw new RangeError(')
 start=game.index('      R09(){\n');end=game.index('      R10(){\n',start);game=game[:start]+game[end:]
 game=once(game,"    mount.dataset.mikageMinigameHost = '';","    mount.dataset.mikageMinigameHost = '';\n    if(region==='R09')mount.dataset.mikageThread='true';")
 game,n=re.subn(r"^    R09:\['drum'.*$","    R09:['seal','出云红线结缘','移动线结理顺红线，穿绳收结，留下一页结缘笺。','出云结缘笺','把理过的心愿留在纸上。'],",game,flags=re.M);assert n==1
 game=once(game,"    {id:'R09',","    {id:'R09-THREAD',region:'R09',place:'出云大社·结缘台',item:'出云结缘笺',line:'红线由你慢慢理，心愿留在纸上。'},\n    {id:'R09',")
 game,n=re.subn(r"^  R09: \{ place:.*$","  R09: { place:'出云大社·八百万神议', title:'出云红线结缘', note:'在神议后的结缘台选一份心愿，移动线结解开三组交叉，再依纸样穿绳收结。巴卫可以帮你扶线，也会等你自己完成；最后留下一页结缘笺。', tags:['拖动与点选移动线结','三组解线与穿绳收结','可选对话与结缘笺'] },",game,flags=re.M);assert n==1
 scene=(base/'scene.mjs').read_text();m=re.search(r'const StatusbarHTML=("(?:[^"\\]|\\.)*");',scene);html=json.loads(m[1]);html,n=re.subn(r"^  R09:\['drum'.*$",ENTRY,html,flags=re.M);assert n==1
 html=html.replace('会所里有新裁的纸条和木头的气味，桌边还留着一张空凳。','神议散后，纸台上还留着几束红线，折好的祈愿纸压在一旁。').replace('巴卫轻轻扶稳鼓架，等你试下一拍。','巴卫将缠在一起的线头挑开，留出一端给你。')
 scene=once(scene[:m.start(1)]+json.dumps(html,ensure_ascii=False)+scene[m.end(1):],"const version = '1.37.0';","const version = '1.38.0';")
 roam=(ROOT/'src/roam-controller.js').read_text();roam,n=re.subn(r"^  R09:\['drum'.*$",ENTRY,roam,flags=re.M)
 if n!=1 and ENTRY not in roam:raise ValueError('Maintained R09 mismatch')
 roam=roam.replace('会所里有新裁的纸条和木头的气味，桌边还留着一张空凳。','神议散后，纸台上还留着几束红线，折好的祈愿纸压在一旁。').replace('巴卫轻轻扶稳鼓架，等你试下一拍。','巴卫将缠在一起的线头挑开，留出一端给你。')
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':script['name']='御影神社·衣装与散策 '+VERSION+' CDN';script['info']='R09入口同步出云红线结缘；保留R01–R08与衣柜。'
  if script['id']=='d3560ad0-892c-4b31-b783-11f80a23b90f':script['name']='御影神社·独立小游戏 '+VERSION+' CDN';script['info']='第9项R09：三组几何解线、穿绳收结、可选对话与如实留笺；保留R01–R08。'
 manifest=json.loads((base/'manifest.json').read_text());manifest['release']=VERSION;manifest['source_name']='1.37.0/card-source.json';manifest['source_sha256']=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest()
 for module in manifest['modules']:
  if module['module_id'] in ['scene','minigames']:
   module.update(version=VERSION,path='mikage-shrine/releases/'+VERSION+'/'+module['module_id']+'.mjs',sha256=hashlib.sha256((scene if module['module_id']=='scene' else game).encode()).hexdigest())
 manifest.update(deferred='R10 fireworks replacement pending; R01–R08 blocks/CSS and R10 handler unchanged',worldbook_policy='All 37 worldbook entries, regexes, initial variables and formal rules unchanged from 1.37.0',thread={'state_scope':'temporary session; only local R09-THREAD memory on confirmation','assets':'existing R09 period backgrounds and shared wardrobe; system serif fallback; no new external dependency','host_acceptance':'pending'})
 outputs={'minigames.mjs':game,'scene.mjs':scene,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(manifest,ensure_ascii=False,indent=2)+'\n'}
 print(json.dumps({'dry_run':a.dry_run,'release':VERSION,'outputs':list(outputs),'maintained':['src/roam-controller.js']}))
 if a.dry_run:return
 dest.mkdir(exist_ok=a.refresh_staging)
 for file,text in outputs.items():(dest/file).write_text(text)
 (ROOT/'src/roam-controller.js').write_text(roam)
if __name__=='__main__':main()
