#!/usr/bin/env python3
"""Build the bounded R07 replacement from immutable 1.35.0 snapshots."""
from pathlib import Path
import argparse,json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.36.0'
ENTRY="  R07:['craft','龙宫潜行寻宝','craft','借珊瑚遮光穿过巡灯回廊，找齐纹片，再解开藏潮匣。'],"
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Anchor mismatch: '+a[:60])
 return s.replace(a,b,1)
def status(s):
 m=re.search(r'const StatusbarHTML=("(?:[^"\\]|\\.)*");',s);html=json.loads(m[1]);html,n=re.subn(r"^  R07:\['leaves'.*$",ENTRY,html,flags=re.M)
 if n!=1:raise ValueError('Statusbar R07 mismatch')
 return s[:m.start(1)]+json.dumps(html,ensure_ascii=False)+s[m.end(1):]
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--asset-commit',required=True);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--refresh-staging',action='store_true');a=ap.parse_args()
 if not re.fullmatch('[0-9a-f]{40}',a.asset_commit):raise ValueError('Immutable asset commit required')
 dest=ROOT/'releases'/VERSION
 if dest.exists() and not a.refresh_staging:raise ValueError('Release exists')
 if dest.exists() and json.loads((dest/'manifest.json').read_text())['release']!=VERSION:raise ValueError('Staging identity mismatch')
 base=ROOT/'releases/1.35.0';game=once((base/'minigames.mjs').read_text(),"const version = '1.35.0';","const version = '1.36.0';")
 m=re.search(r'const GAME_CSS = ("(?:[^"\\]|\\.)*");',game);css=json.loads(m[1])+'\n'+(ROOT/'src/stealth/style.css').read_text();game=game[:m.start(1)]+json.dumps(css,ensure_ascii=False)+game[m.end(1):]
 asset='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@'+a.asset_commit+'/mikage-shrine/assets/activities/'
 addon='const STEALTH_ART_URL='+json.dumps(asset+'stealth-v136-props.webp')+';\nconst STEALTH_FONT_URL='+json.dumps(asset+'stealth-v136-font.ttf')+';\n'+(ROOT/'src/stealth/model.js').read_text()+'\n'+(ROOT/'src/stealth/activity.js').read_text()+'\n'
 game=once(game,'function createMikageActivities(',addon+'function createMikageActivities(')
 anchor='    if (!META[region]) throw new RangeError('
 route="    if(region==='R07')return mountMikageStealth(global,container,{...opts,getMemoryBook:readMemoryBook,onComplete:result=>{const memories=saveMemories('R07',result.detail,['R07-STEALTH']);opts.onComplete?.({...result,memories});return memories.every(m=>m.persistent!==false);}});\n"
 game=once(game,anchor,route+anchor);start=game.index('      R07(){\n');end=game.index('      R08(){\n',start);game=game[:start]+game[end:]
 game=once(game,"    mount.dataset.mikageMinigameHost = '';","    mount.dataset.mikageMinigameHost = '';\n    if(region==='R07'){mount.dataset.mikageStealth='true';void installMikageStealthFont(host,doc);}")
 game,n=re.subn(r"^    R07:\['fern'.*$","    R07:['craft','龙宫潜行寻宝','借珊瑚遮光，找纹片，转动藏潮匣三环。','藏潮寻宝手记','走完几段，就记下几段；宝匣未开不会写成已开。'],",game,flags=re.M);assert n==1
 memory="    {id:'R07-STEALTH',region:'R07',place:'龙宫城·深海琉璃阁',item:'藏潮寻宝手记',line:'沿水光走过回廊，摹下纹片与匣上水纹。只留手记，不带走龙宫藏物。'},\n"
 game=once(game,"    {id:'R07',",memory+"    {id:'R07',")
 game,n=re.subn(r"^  R07: \{ place:.*$","  R07: { place:'龙宫城·深海琉璃阁', title:'藏潮回廊·循水光寻匣', note:'你走一步，巡灯才走一步。借珊瑚避开当前与下一拍的灯光，找齐三段纹片，再转开宝匣三环；若想先走，便沿来路收步，留下一页如实手记。', tags:['按步潜行与巡查预告','珊瑚遮光与廊口重试','三环宝匣与寻宝手记'] },",game,flags=re.M);assert n==1
 scene=once(status((base/'scene.mjs').read_text()),"const version = '1.35.0';","const version = '1.36.0';")
 roam=(ROOT/'src/roam-controller.js').read_text();roam,n=re.subn(r"^  R07:\['leaves'.*$",ENTRY,roam,flags=re.M)
 if n!=1 and ENTRY not in roam:raise ValueError('Maintained R07 mismatch')
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':script['name']='御影神社·衣装与散策 '+VERSION+' CDN';script['info']='R07入口接入龙宫潜行寻宝；保留当前衣柜、可见人物与图集单格裁切。'
  if script['id']=='d3560ad0-892c-4b31-b783-11f80a23b90f':script['name']='御影神社·独立小游戏 '+VERSION+' CDN';script['info']='逐项重做第7项R07：三段潜行、巡查预告、遮光/掩护、廊口重试、三环宝匣与寻宝手记；保留R01–R06。'
 manifest=json.loads((base/'manifest.json').read_text());manifest['release']=VERSION;manifest['source_name']='1.35.0/card-source.json';manifest['source_sha256']=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest()
 for module in manifest['modules']:
  if module['module_id'] in ['scene','minigames']:
   module['version']=VERSION;module['path']='mikage-shrine/releases/'+VERSION+'/'+module['module_id']+'.mjs';module['sha256']=hashlib.sha256((scene if module['module_id']=='scene' else game).encode()).hexdigest()
 manifest['deferred']='R08–R10 replacements pending; R01–R06 source blocks/CSS and R08–R10 handlers preserved'
 manifest['worldbook_policy']='All 37 entries, regexes, initial data and formal variables unchanged from 1.35.0'
 manifest['stealth_art']={'commit':a.asset_commit,**json.loads((ROOT/'src/stealth/art-manifest.json').read_text())}
 manifest['stealth_font']={'commit':a.asset_commit,**json.loads((ROOT/'src/stealth/font-manifest.json').read_text())}
 outputs={'minigames.mjs':game,'scene.mjs':scene,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(manifest,ensure_ascii=False,indent=2)+'\n'}
 print(json.dumps({'dry_run':a.dry_run,'release':VERSION,'outputs':list(outputs),'maintained':['src/roam-controller.js']}))
 if a.dry_run:return
 dest.mkdir(exist_ok=a.refresh_staging)
 for file,text in outputs.items():(dest/file).write_text(text)
 (ROOT/'src/roam-controller.js').write_text(roam)
if __name__=='__main__':main()
