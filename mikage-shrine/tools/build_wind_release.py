#!/usr/bin/env python3
"""Build the bounded R06 replacement from maintained 1.34.0 snapshots."""
from pathlib import Path
import argparse,json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.35.0'
ENTRY="  R06:['leaf','纸鹤御风','leaf','顺着山风送出纸鹤，穿过风门，再收回一页纸羽手记。'],"
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Anchor mismatch: '+a[:60])
 return s.replace(a,b,1)
def status(s):
 m=re.search(r'const StatusbarHTML=("(?:[^"\\]|\\.)*");',s);html=json.loads(m[1]);html,n=re.subn(r"^  R06:\['postcard'.*$",ENTRY,html,flags=re.M)
 if n!=1:raise ValueError('Statusbar R06 mismatch')
 return s[:m.start(1)]+json.dumps(html,ensure_ascii=False)+s[m.end(1):]
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--asset-commit',required=True);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--refresh-staging',action='store_true');a=ap.parse_args()
 if not re.fullmatch('[0-9a-f]{40}',a.asset_commit):raise ValueError('Immutable asset commit required')
 dest=ROOT/'releases'/VERSION
 if dest.exists() and not a.refresh_staging:raise ValueError('Release exists')
 if dest.exists() and json.loads((dest/'manifest.json').read_text())['release']!=VERSION:raise ValueError('Staging identity mismatch')
 base=ROOT/'releases/1.34.0';game=once((base/'minigames.mjs').read_text(),"const version = '1.34.0';","const version = '1.35.0';")
 m=re.search(r'const GAME_CSS = ("(?:[^"\\]|\\.)*");',game);css=json.loads(m[1])+'\n'+(ROOT/'src/wind/style.css').read_text();game=game[:m.start(1)]+json.dumps(css,ensure_ascii=False)+game[m.end(1):]
 asset='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@'+a.asset_commit+'/mikage-shrine/assets/activities/'
 addon='const WIND_ART_URL='+json.dumps(asset+'wind-v135-crane.webp')+';\nconst WIND_FONT_URL='+json.dumps(asset+'wind-v135-font.ttf')+';\n'+(ROOT/'src/wind/model.js').read_text()+'\n'+(ROOT/'src/wind/activity.js').read_text()+'\n'
 game=once(game,'function createMikageActivities(',addon+'function createMikageActivities(')
 anchor='    if (!META[region]) throw new RangeError('
 route="    if(region==='R06')return mountMikageWind(global,container,{...opts,getMemoryBook:readMemoryBook,onComplete:result=>{const memories=saveMemories('R06',result.detail,['R06-WIND']);opts.onComplete?.({...result,memories});return memories.every(m=>m.persistent!==false);}});\n"
 game=once(game,anchor,route+anchor);start=game.index('      R06(){\n');end=game.index('      R07(){\n',start);game=game[:start]+game[end:]
 game=once(game,"    mount.dataset.mikageMinigameHost = '';","    mount.dataset.mikageMinigameHost = '';\n    if(region==='R06'){mount.dataset.mikageWind='true';void installMikageWindFont(host,doc);}")
 game,n=re.subn(r"^    R06:\['tram'.*$","    R06:['leaf','鞍马山纸鹤御风','按住托起，借风穿过六道风门。','山风纸羽','通过几道，就如实记下几道。'],",game,flags=re.M);assert n==1
 memory="    {id:'R06-WIND',region:'R06',place:'鞍马山·万年大杉',item:'山风纸羽',line:'纸鹤收回廊下，纸羽上记着这一程。未过的风门留待下次。'},\n"
 game=once(game,"    {id:'R06',",memory+"    {id:'R06',")
 game,n=re.subn(r"^  R06: \{ place:.*$","  R06: { place:'鞍马山·万年大杉', title:'杉影借风·纸鹤过长门', note:'按住托起纸鹤，松手下落，借阵风穿过六道风门。每两道可在杉影里歇脚，巴卫也能替你挡风。偏出后从当前风门重来，想改日再走便先收鹤留记。', tags:['长按与点按御风','六道风门与段间选路','纸鹤回收与如实手记'] },",game,flags=re.M);assert n==1
 scene=once(status((base/'scene.mjs').read_text()),"const version = '1.34.0';","const version = '1.35.0';")
 roam=(ROOT/'src/roam-controller.js').read_text();roam,n=re.subn(r"^  R06:\['postcard'.*$",ENTRY,roam,flags=re.M)
 if n!=1 and ENTRY not in roam:raise ValueError('Maintained R06 mismatch')
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':script['name']='御影神社·衣装与散策 '+VERSION+' CDN';script['info']='R06入口接入纸鹤御风；保留当前衣柜、可见人物与图集单格裁切。'
  if script['id']=='d3560ad0-892c-4b31-b783-11f80a23b90f':script['name']='御影神社·独立小游戏 '+VERSION+' CDN';script['info']='逐项重做第6项R06：长按托起、六道风门、阵风/选路/挡风、当前门重试与纸羽手记；保留R01–R05。'
 manifest=json.loads((base/'manifest.json').read_text());manifest['release']=VERSION;manifest['source_name']='1.34.0/card-source.json';manifest['source_sha256']=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest()
 for module in manifest['modules']:
  if module['module_id'] in ['scene','minigames']:
   module['version']=VERSION;module['path']='mikage-shrine/releases/'+VERSION+'/'+module['module_id']+'.mjs';module['sha256']=hashlib.sha256((scene if module['module_id']=='scene' else game).encode()).hexdigest()
 manifest['deferred']='R07–R10 replacements pending; R01–R05 source blocks/CSS and R07–R10 handlers preserved'
 manifest['worldbook_policy']='All 37 entries, regexes, initial data and formal variables unchanged from 1.34.0'
 manifest['wind_art']={'commit':a.asset_commit,**json.loads((ROOT/'src/wind/art-manifest.json').read_text())}
 manifest['wind_font']={'commit':a.asset_commit,**json.loads((ROOT/'src/wind/font-manifest.json').read_text())}
 outputs={'minigames.mjs':game,'scene.mjs':scene,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(manifest,ensure_ascii=False,indent=2)+'\n'}
 print(json.dumps({'dry_run':a.dry_run,'release':VERSION,'outputs':list(outputs),'maintained':['src/roam-controller.js']}))
 if a.dry_run:return
 dest.mkdir(exist_ok=a.refresh_staging)
 for file,text in outputs.items():(dest/file).write_text(text)
 (ROOT/'src/roam-controller.js').write_text(roam)
if __name__=='__main__':main()
