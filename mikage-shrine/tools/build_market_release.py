#!/usr/bin/env python3
"""Bounded R03 replacement of the verified 1.31.0 release; preserve all other games."""
from pathlib import Path
import argparse,json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.32.0'
ENTRY="  R03:['craft','暗市鉴物','craft','翻看器物，选取证据，辨别摊主的说法。'],"
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Anchor mismatch: '+a[:60])
 return s.replace(a,b,1)
def status(s):
 m=re.search(r'const StatusbarHTML=("(?:[^"\\]|\\.)*");',s);html=json.loads(m[1])
 html,n=re.subn(r"^  R03:\['dango'.*$",ENTRY,html,flags=re.M)
 if n!=1:raise ValueError('Statusbar R03 mismatch')
 return s[:m.start(1)]+json.dumps(html,ensure_ascii=False)+s[m.end(1):]
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--asset-commit',required=True);ap.add_argument('--font-commit',required=True);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--refresh-staging',action='store_true');a=ap.parse_args()
 if not re.fullmatch('[0-9a-f]{40}',a.font_commit):raise ValueError('Immutable font commit required')
 if not re.fullmatch('[0-9a-f]{40}',a.asset_commit):raise ValueError('Immutable asset commit required')
 dest=ROOT/'releases'/VERSION
 if dest.exists() and not a.refresh_staging:raise ValueError('Release already exists')
 if dest.exists() and json.loads((dest/'manifest.json').read_text())['release']!=VERSION:raise ValueError('Staging identity mismatch')
 base=ROOT/'releases/1.31.0';game=(base/'minigames.mjs').read_text();game=once(game,"const version = '1.31.0';","const version = '1.32.0';")
 m=re.search(r'const GAME_CSS = ("(?:[^"\\]|\\.)*");',game);css=json.loads(m[1])+'\n'+(ROOT/'src/market/style.css').read_text();game=game[:m.start(1)]+json.dumps(css,ensure_ascii=False)+game[m.end(1):]
 url='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@'+a.asset_commit+'/mikage-shrine/assets/activities/market-v132-props.webp'
 font_url='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@'+a.font_commit+'/mikage-shrine/assets/activities/market-v132-font.ttf'
 addon='const MARKET_ART_URL='+json.dumps(url)+';\nconst MARKET_FONT_URL='+json.dumps(font_url)+';\n'+(ROOT/'src/market/model.js').read_text()+'\n'+(ROOT/'src/market/activity.js').read_text()+'\n'
 game=once(game,'function createMikageActivities(',addon+'function createMikageActivities(')
 anchor='    if (!META[region]) throw new RangeError('
 route="    if(region==='R03')return mountMikageMarket(global,container,{...opts,getMemoryBook:readMemoryBook,onComplete:result=>{const memories=saveMemories('R03',result.detail,['R03-APPRAISAL']);opts.onComplete?.({...result,memories});return memories.every(m=>m.persistent!==false);}});\n"
 game=once(game,anchor,route+anchor)
 start=game.index('      R03(){\n');end=game.index('      R04(){\n',start);game=game[:start]+game[end:]
 game=once(game,"    mount.dataset.mikageMinigameHost = '';","    mount.dataset.mikageMinigameHost = '';\n    if(region==='R03'){mount.dataset.mikageMarket='true';void installMikageMarketFont(host,doc);}")
 game,n=re.subn(r"^    R03:\['dango'.*$","    R03:['seal','妖怪横丁暗市鉴宝','看清线索，勾选依据，再下判断。','暗市鉴物笺','灯下记下三件摊货的来历。'],",game,flags=re.M);assert n==1
 memory="    {id:'R03-APPRAISAL',region:'R03',place:'妖怪横丁·百鬼暗市',item:'暗市鉴物笺',line:'摊货留在原处。看准的记下，存疑的留着，纸上还压着一笔纹样。'},\n"
 game=once(game,"    {id:'R03-DANGO'",memory+"    {id:'R03-DANGO'")
 game,n=re.subn(r"^  R03: \{ place:.*$","  R03: { place:'妖怪横丁·百鬼暗市', title:'灯下淘鉴·暗市鉴物', note:'沿摊位查看铜铃、手镜与折扇。翻看器物，对照来历，也可借巴卫的狐火照看。勾选依据再判断，存疑便留作待考；摊货留在原处，只收纸上记录。', tags:['翻看与狐火照物','证据支持判断','待考与鉴物小笺'] },",game,flags=re.M);assert n==1
 scene=status((base/'scene.mjs').read_text());scene=once(scene,"const version = '1.31.0';","const version = '1.32.0';")
 roam=(ROOT/'src/roam-controller.js').read_text();roam,n=re.subn(r"^  R03:\['dango'.*$",ENTRY,roam,flags=re.M)
 if n!=1 and ENTRY not in roam:raise ValueError('Maintained R03 mismatch')
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':script['name']='御影神社·衣装与散策 '+VERSION+' CDN';script['info']='R03入口接入暗市鉴宝；保留当前衣柜与图集单格裁切。'
  if script['id']=='d3560ad0-892c-4b31-b783-11f80a23b90f':script['name']='御影神社·独立小游戏 '+VERSION+' CDN';script['info']='逐项重做第3项R03：三件摊货、证据判断、可选协助、待考与鉴物手记；保留R01/R02。'
 manifest=json.loads((base/'manifest.json').read_text());manifest['release']=VERSION;manifest['source_name']='1.31.0/card-source.json';manifest['source_sha256']=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest()
 for module in manifest['modules']:
  if module['module_id'] in ['scene','minigames']:
   module['version']=VERSION;module['path']='mikage-shrine/releases/'+VERSION+'/'+module['module_id']+'.mjs';module['sha256']=hashlib.sha256((scene if module['module_id']=='scene' else game).encode()).hexdigest()
 manifest['deferred']='R04–R10 full gameplay replacement pending; R01/R02 and R04–R10 bytes preserved'
 manifest['worldbook_policy']='All 37 entries, regexes, initial data and formal variables unchanged from 1.31.0'
 manifest['market_asset']={'commit':a.asset_commit,'path':'mikage-shrine/assets/activities/market-v132-props.webp','sha256':hashlib.sha256((ROOT/'assets/activities/market-v132-props.webp').read_bytes()).hexdigest(),'bytes':(ROOT/'assets/activities/market-v132-props.webp').stat().st_size,'origin':'original imagegen atlas, encoded WebP; no external image or new dependency'}
 manifest['market_font']={'commit':a.font_commit,**json.loads((ROOT/'src/market/font-manifest.json').read_text())}
 outputs={'minigames.mjs':game,'scene.mjs':scene,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(manifest,ensure_ascii=False,indent=2)+'\n'}
 print(json.dumps({'dry_run':a.dry_run,'release':VERSION,'outputs':list(outputs),'maintained':['src/roam-controller.js']}))
 if a.dry_run:return
 dest.mkdir(exist_ok=a.refresh_staging)
 for file,text in outputs.items():(dest/file).write_text(text)
 (ROOT/'src/roam-controller.js').write_text(roam)
if __name__=='__main__':main()
