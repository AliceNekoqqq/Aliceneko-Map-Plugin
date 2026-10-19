#!/usr/bin/env python3
"""Build R04 only from immutable 1.32.0 sources; preserve other games and content."""
from pathlib import Path
import argparse,json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.33.0'
ENTRY="  R04:['leaf','落梅封香','leaf','接取落梅与晨露，调配花香，封坛留待慢酿。'],"
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Anchor mismatch: '+a[:60])
 return s.replace(a,b,1)
def status(s):
 m=re.search(r'const StatusbarHTML=("(?:[^"\\]|\\.)*");',s);html=json.loads(m[1]);html,n=re.subn(r"^  R04:\['boat'.*$",ENTRY,html,flags=re.M)
 if n!=1:raise ValueError('Statusbar R04 mismatch')
 return s[:m.start(1)]+json.dumps(html,ensure_ascii=False)+s[m.end(1):]
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--asset-commit',required=True);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--refresh-staging',action='store_true');a=ap.parse_args()
 if not re.fullmatch('[0-9a-f]{40}',a.asset_commit):raise ValueError('Immutable asset commit required')
 dest=ROOT/'releases'/VERSION
 if dest.exists() and not a.refresh_staging:raise ValueError('Release exists')
 if dest.exists() and json.loads((dest/'manifest.json').read_text())['release']!=VERSION:raise ValueError('Staging identity mismatch')
 base=ROOT/'releases/1.32.0';game=once((base/'minigames.mjs').read_text(),"const version = '1.32.0';","const version = '1.33.0';")
 m=re.search(r'const GAME_CSS = ("(?:[^"\\]|\\.)*");',game);css=once(json.loads(m[1]),'.mkm-figures>span{display:block;flex-shrink:0}','.mkm-figures>span{display:block;flex-shrink:0;width:72px;height:72px}')+'\n'+(ROOT/'src/plum/style.css').read_text();game=game[:m.start(1)]+json.dumps(css,ensure_ascii=False)+game[m.end(1):]
 asset='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@'+a.asset_commit+'/mikage-shrine/assets/activities/'
 addon='const PLUM_ART_URL='+json.dumps(asset+'plum-v133-table.webp')+';\nconst PLUM_FONT_URL='+json.dumps(asset+'plum-v133-font.ttf')+';\nconst PLUM_CUP_URL="https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@'+a.asset_commit+'/mikage-shrine/assets/activities/tea-v128/cup.webp";\n'+(ROOT/'src/plum/model.js').read_text()+'\n'+(ROOT/'src/plum/activity.js').read_text()+'\n'
 game=once(game,'function createMikageActivities(',addon+'function createMikageActivities(')
 anchor='    if (!META[region]) throw new RangeError('
 route="    if(region==='R04')return mountMikagePlum(global,container,{...opts,getMemoryBook:readMemoryBook,onComplete:result=>{const memories=saveMemories('R04',result.detail,['R04-PLUM']);opts.onComplete?.({...result,memories});return memories.every(m=>m.persistent!==false);}});\n"
 game=once(game,anchor,route+anchor);start=game.index('      R04(){\n');end=game.index('      R05(){\n',start);game=game[:start]+game[end:]
 game=once(game,"    mount.dataset.mikageMinigameHost = '';","    mount.dataset.mikageMinigameHost = '';\n    if(region==='R04'){mount.dataset.mikagePlum='true';void installMikagePlumFont(host,doc);}")
 game,n=re.subn(r"^    R04:\['boat'.*$","    R04:['leaf','神梅树下·落梅封香','接取落梅，配六份花露，再对齐纸封。','落梅香方','梅树下封好一坛，留给时日慢慢酿。'],",game,flags=re.M);assert n==1
 memory="    {id:'R04-PLUM',region:'R04',place:'夜森神社·梅树下',item:'落梅香方',line:'花料来源与配比写在纸上。封坛仍须待酿，只留香笺也很好。'},\n"
 game=once(game,"    {id:'R04',",memory+"    {id:'R04',")
 game,n=re.subn(r"^  R04: \{ place:.*$","  R04: { place:'夜森神社·梅树下', title:'神梅树下·落梅封香', note:'移动青瓷盏接取梅花与晨露，避开枯枝，再按喜欢的香方调配、对齐纸封。瑞希备了花篮，巴卫也可以替你挡风；封好后留坛待酿，或只收下一张香笺。', tags:['移动盏身接花','三种香方与自选比例','纸封对齐与待酿手记'] },",game,flags=re.M);assert n==1
 scene=once(status((base/'scene.mjs').read_text()),"const version = '1.32.0';","const version = '1.33.0';")
 roam=(ROOT/'src/roam-controller.js').read_text();roam,n=re.subn(r"^  R04:\['boat'.*$",ENTRY,roam,flags=re.M)
 if n!=1 and ENTRY not in roam:raise ValueError('Maintained R04 mismatch')
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':script['name']='御影神社·衣装与散策 '+VERSION+' CDN';script['info']='R04接入落梅封香；修复R03人物容器零尺寸，保留衣柜与图集单格裁切。'
  if script['id']=='d3560ad0-892c-4b31-b783-11f80a23b90f':script['name']='御影神社·独立小游戏 '+VERSION+' CDN';script['info']='逐项重做第4项R04：三阵接花、晨露、风向与协助、六份调配、纸封对齐和待酿手记；保留R01–R03。'
 manifest=json.loads((base/'manifest.json').read_text());manifest['release']=VERSION;manifest['source_name']='1.32.0/card-source.json';manifest['source_sha256']=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest()
 for module in manifest['modules']:
  if module['module_id'] in ['scene','minigames']:
   module['version']=VERSION;module['path']='mikage-shrine/releases/'+VERSION+'/'+module['module_id']+'.mjs';module['sha256']=hashlib.sha256((scene if module['module_id']=='scene' else game).encode()).hexdigest()
 manifest['deferred']='R05–R10 replacements pending; R01–R03 logic and R05–R10 handlers preserved; R03 actor CSS dimensions fixed'
 manifest['worldbook_policy']='All 37 entries, regexes, initial data and formal variables unchanged from 1.32.0'
 manifest['plum_assets']={'commit':a.asset_commit,'image':'mikage-shrine/assets/activities/plum-v133-table.webp','sha256':hashlib.sha256((ROOT/'assets/activities/plum-v133-table.webp').read_bytes()).hexdigest(),'bytes':(ROOT/'assets/activities/plum-v133-table.webp').stat().st_size,'periods':'new day table; existing canon-v127/R04 dusk and night retained; no daylight tint substituted for night','cup':'existing tea-v128/cup.webp; unchanged'}
 manifest['regression_fix']='R03 sprite containers explicitly 72x72; model/activity unchanged; verified old artifact fails visibility assertion'
 manifest['plum_font']={'commit':a.asset_commit,**json.loads((ROOT/'src/plum/font-manifest.json').read_text())}
 outputs={'minigames.mjs':game,'scene.mjs':scene,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(manifest,ensure_ascii=False,indent=2)+'\n'}
 print(json.dumps({'dry_run':a.dry_run,'release':VERSION,'outputs':list(outputs),'maintained':['src/roam-controller.js','src/market/style.css']}))
 if a.dry_run:return
 dest.mkdir(exist_ok=a.refresh_staging)
 for file,text in outputs.items():(dest/file).write_text(text)
 (ROOT/'src/roam-controller.js').write_text(roam)
if __name__=='__main__':main()
