#!/usr/bin/env python3
"""Build the bounded R08 replacement from immutable 1.36.0 snapshots."""
from pathlib import Path
import argparse,json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.37.0'
ENTRY="  R08:['leaf','檐下守护幼狐','leaf','解开雷网，布好避风处，再等幼狐巴卫自己回应。'],"
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Anchor mismatch: '+a[:60])
 return s.replace(a,b,1)
def status(s):
 m=re.search(r'const StatusbarHTML=("(?:[^"\\]|\\.)*");',s);html=json.loads(m[1]);html,n=re.subn(r"^  R08:\['firefly'.*$",ENTRY,html,flags=re.M)
 if n!=1:raise ValueError('Statusbar R08 mismatch')
 return s[:m.start(1)]+json.dumps(html,ensure_ascii=False)+s[m.end(1):]
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--asset-commit',required=True);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--refresh-staging',action='store_true');a=ap.parse_args()
 if not re.fullmatch('[0-9a-f]{40}',a.asset_commit):raise ValueError('Immutable asset commit required')
 dest=ROOT/'releases'/VERSION
 if dest.exists() and not a.refresh_staging:raise ValueError('Release exists')
 if dest.exists() and json.loads((dest/'manifest.json').read_text())['release']!=VERSION:raise ValueError('Staging identity mismatch')
 base=ROOT/'releases/1.36.0';game=once((base/'minigames.mjs').read_text(),"const version = '1.36.0';","const version = '1.37.0';")
 m=re.search(r'const GAME_CSS = ("(?:[^"\\]|\\.)*");',game);css=json.loads(m[1])+'\n'+(ROOT/'src/fox/style.css').read_text();game=game[:m.start(1)]+json.dumps(css,ensure_ascii=False)+game[m.end(1):]
 asset='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@'+a.asset_commit+'/mikage-shrine/assets/activities/'
 addon='const FOX_ART_URL='+json.dumps(asset+'fox-v137-poses.webp')+';\nconst FOX_FONT_URL='+json.dumps(asset+'fox-v137-font.ttf')+';\n'+(ROOT/'src/fox/model.js').read_text()+'\n'+(ROOT/'src/fox/activity.js').read_text()+'\n'
 game=once(game,'function createMikageActivities(',addon+'function createMikageActivities(')
 anchor='    if (!META[region]) throw new RangeError('
 route="    if(region==='R08')return mountMikageFox(global,container,{...opts,getMemoryBook:readMemoryBook,onComplete:result=>{const memories=saveMemories('R08',result.detail,['R08-FOX']);opts.onComplete?.({...result,memories});return memories.every(m=>m.persistent!==false);}});\n"
 game=once(game,anchor,route+anchor);start=game.index('      R08(){\n');end=game.index('      R09(){\n',start);game=game[:start]+game[end:]
 game=once(game,"    mount.dataset.mikageMinigameHost = '';","    mount.dataset.mikageMinigameHost = '';\n    if(region==='R08'){mount.dataset.mikageFox='true';void installMikageFoxFont(host,doc);}")
 game,n=re.subn(r"^    R08:\['firefly'.*$","    R08:['leaf','檐下守护幼狐','解开雷网，布好避风处，留出选择。','檐下守护笺','靠近、休息或离开，都由他自己决定。'],",game,flags=re.M);assert n==1
 memory="    {id:'R08-FOX',region:'R08',place:'鸣神殿·雷光神宫',item:'檐下守护笺',line:'先把退路清出来，再在檐边留一点空隙。守着他，不替他作选择。'},\n"
 game=once(game,"    {id:'R08',",memory+"    {id:'R08',")
 game,n=re.subn(r"^  R08: \{ place:.*$","  R08: { place:'鸣神殿·雷光神宫', title:'檐下守候·留一处避风地', note:'先沿线头解开三张雷网，再把垫子和挡风物布在檐下干地，留出台阶退路。站远些，观察幼狐巴卫的耳朵和尾尖，等他自己靠近、休息或离开；笹饼可放在远处，不强行投喂或触碰。', tags:['划线与点按解网','拖放布置避风处','观察与自主回应'] },",game,flags=re.M);assert n==1
 scene=once(status((base/'scene.mjs').read_text()),"const version = '1.36.0';","const version = '1.37.0';")
 roam=(ROOT/'src/roam-controller.js').read_text();roam,n=re.subn(r"^  R08:\['firefly'.*$",ENTRY,roam,flags=re.M)
 if n!=1 and ENTRY not in roam:raise ValueError('Maintained R08 mismatch')
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':script['name']='御影神社·衣装与散策 '+VERSION+' CDN';script['info']='R08入口接入檐下守护幼狐；保留当前玩家衣柜与图集单格裁切；幼狐使用本局独立状态图。'
  if script['id']=='d3560ad0-892c-4b31-b783-11f80a23b90f':script['name']='御影神社·独立小游戏 '+VERSION+' CDN';script['info']='逐项重做第8项R08：划线解网、拖放避风处、观察与自主回应；不强制投喂/触碰；保留R01–R07。'
 manifest=json.loads((base/'manifest.json').read_text());manifest['release']=VERSION;manifest['source_name']='1.36.0/card-source.json';manifest['source_sha256']=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest()
 for module in manifest['modules']:
  if module['module_id'] in ['scene','minigames']:
   module['version']=VERSION;module['path']='mikage-shrine/releases/'+VERSION+'/'+module['module_id']+'.mjs';module['sha256']=hashlib.sha256((scene if module['module_id']=='scene' else game).encode()).hexdigest()
 manifest['deferred']='R09–R10 replacements pending; R01–R07 source blocks/CSS and R09–R10 handlers preserved'
 manifest['worldbook_policy']='All 37 entries, regexes, initial data and formal variables unchanged from 1.36.0'
 manifest['fox_art']={'commit':a.asset_commit,**json.loads((ROOT/'src/fox/art-manifest.json').read_text())}
 manifest['fox_font']={'commit':a.asset_commit,**json.loads((ROOT/'src/fox/font-manifest.json').read_text())}
 outputs={'minigames.mjs':game,'scene.mjs':scene,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(manifest,ensure_ascii=False,indent=2)+'\n'}
 print(json.dumps({'dry_run':a.dry_run,'release':VERSION,'outputs':list(outputs),'maintained':['src/roam-controller.js']}))
 if a.dry_run:return
 dest.mkdir(exist_ok=a.refresh_staging)
 for file,text in outputs.items():(dest/file).write_text(text)
 (ROOT/'src/roam-controller.js').write_text(roam)
if __name__=='__main__':main()
