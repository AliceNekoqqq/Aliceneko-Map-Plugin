#!/usr/bin/env python3
"""Build the bounded R05 replacement from maintained 1.33.0 snapshots."""
from pathlib import Path
import argparse,json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.34.0'
ENTRY="  R05:['craft','浮桥梳妆','craft','陪沼皇女试搭衣簪，摆稳绿叶，留一张赴约准备笺。'],"
def once(s,a,b):
 if s.count(a)!=1:raise ValueError('Anchor mismatch: '+a[:60])
 return s.replace(a,b,1)
def status(s):
 m=re.search(r'const StatusbarHTML=("(?:[^"\\]|\\.)*");',s);html=json.loads(m[1]);html,n=re.subn(r"^  R05:\['ticket'.*$",ENTRY,html,flags=re.M)
 if n!=1:raise ValueError('Statusbar R05 mismatch')
 return s[:m.start(1)]+json.dumps(html,ensure_ascii=False)+s[m.end(1):]
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--asset-commit',required=True);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--refresh-staging',action='store_true');a=ap.parse_args()
 if not re.fullmatch('[0-9a-f]{40}',a.asset_commit):raise ValueError('Immutable asset commit required')
 dest=ROOT/'releases'/VERSION
 if dest.exists() and not a.refresh_staging:raise ValueError('Release exists')
 if dest.exists() and json.loads((dest/'manifest.json').read_text())['release']!=VERSION:raise ValueError('Staging identity mismatch')
 base=ROOT/'releases/1.33.0';game=once((base/'minigames.mjs').read_text(),"const version = '1.33.0';","const version = '1.34.0';")
 m=re.search(r'const GAME_CSS = ("(?:[^"\\]|\\.)*");',game);css=json.loads(m[1])+'\n'+(ROOT/'src/dress/style.css').read_text();game=game[:m.start(1)]+json.dumps(css,ensure_ascii=False)+game[m.end(1):]
 asset='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@'+a.asset_commit+'/mikage-shrine/assets/activities/'
 addon='const DRESS_ART_URL='+json.dumps(asset+'dress-v134-himemiko.webp')+';\nconst DRESS_FONT_URL='+json.dumps(asset+'dress-v134-font.ttf')+';\n'+(ROOT/'src/dress/model.js').read_text()+'\n'+(ROOT/'src/dress/activity.js').read_text()+'\n'
 game=once(game,'function createMikageActivities(',addon+'function createMikageActivities(')
 anchor='    if (!META[region]) throw new RangeError('
 route="    if(region==='R05')return mountMikageDress(global,container,{...opts,getMemoryBook:readMemoryBook,onComplete:result=>{const memories=saveMemories('R05',result.detail,['R05-DRESS']);opts.onComplete?.({...result,memories});return memories.every(m=>m.persistent!==false);}});\n"
 game=once(game,anchor,route+anchor);start=game.index('      R05(){\n');end=game.index('      R06(){\n',start);game=game[:start]+game[end:]
 game=once(game,"    mount.dataset.mikageMinigameHost = '';","    mount.dataset.mikageMinigameHost = '';\n    if(region==='R05'){mount.dataset.mikageDress='true';void installMikageDressFont(host,doc);}")
 game,n=re.subn(r"^    R05:\['ticket'.*$","    R05:['seal','沼皇女梳妆赴约','试搭衣装与簪饰，摆稳三枚绿叶，问过她再出门。','浮桥梳妆笺','镜前的试搭与准备过程，留在一页小笺里。'],",game,flags=re.M);assert n==1
 memory="    {id:'R05-DRESS',region:'R05',place:'多满沼·水神浮桥',item:'浮桥梳妆笺',line:'衣样与簪饰记在纸上。是否出门，由沼皇女自己决定；约会的结果不在这张笺上。'},\n"
 game=once(game,"    {id:'R05',",memory+"    {id:'R05',")
 game,n=re.subn(r"^  R05: \{ place:.*$","  R05: { place:'多满沼·水神浮桥', title:'绿叶化形·沼皇女梳妆赴约', note:'听过沼皇女的心意，再试搭三套衣装与发簪。镜前的位置可以调整，绿叶化形也可请巴卫示范。准备好了，送到浮桥边；想改日再去，也能只留一张搭配笺。', tags:['三套预绘试搭','发簪位置可调整','绿叶对齐与灵力稳定'] },",game,flags=re.M);assert n==1
 scene=once(status((base/'scene.mjs').read_text()),"const version = '1.33.0';","const version = '1.34.0';")
 roam=(ROOT/'src/roam-controller.js').read_text();roam,n=re.subn(r"^  R05:\['ticket'.*$",ENTRY,roam,flags=re.M)
 if n!=1 and ENTRY not in roam:raise ValueError('Maintained R05 mismatch')
 card=json.loads((base/'card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
 for script in card['data']['extensions']['tavern_helper']['scripts']:
  if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':script['name']='御影神社·衣装与散策 '+VERSION+' CDN';script['info']='R05入口接入沼皇女梳妆；保留衣柜、72px人物与图集单格裁切。'
  if script['id']=='d3560ad0-892c-4b31-b783-11f80a23b90f':script['name']='御影神社·独立小游戏 '+VERSION+' CDN';script['info']='逐项重做第5项R05：三套预绘衣装、可调发簪、可撤回试搭、三枚绿叶与稳定灵力；保留R01–R04。'
 manifest=json.loads((base/'manifest.json').read_text());manifest['release']=VERSION;manifest['source_name']='1.33.0/card-source.json';manifest['source_sha256']=hashlib.sha256((base/'card-source.json').read_bytes()).hexdigest()
 for module in manifest['modules']:
  if module['module_id'] in ['scene','minigames']:
   module['version']=VERSION;module['path']='mikage-shrine/releases/'+VERSION+'/'+module['module_id']+'.mjs';module['sha256']=hashlib.sha256((scene if module['module_id']=='scene' else game).encode()).hexdigest()
 manifest['deferred']='R06–R10 replacements pending; R01–R04 source blocks/CSS and R06–R10 handlers preserved'
 manifest['worldbook_policy']='All 37 entries, regexes, initial data and formal variables unchanged from 1.33.0'
 manifest['dress_art']={'commit':a.asset_commit,**json.loads((ROOT/'src/dress/art-manifest.json').read_text())}
 manifest['dress_font']={'commit':a.asset_commit,**json.loads((ROOT/'src/dress/font-manifest.json').read_text())}
 outputs={'minigames.mjs':game,'scene.mjs':scene,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(manifest,ensure_ascii=False,indent=2)+'\n'}
 print(json.dumps({'dry_run':a.dry_run,'release':VERSION,'outputs':list(outputs),'maintained':['src/roam-controller.js']}))
 if a.dry_run:return
 dest.mkdir(exist_ok=a.refresh_staging)
 for file,text in outputs.items():(dest/file).write_text(text)
 (ROOT/'src/roam-controller.js').write_text(roam)
if __name__=='__main__':main()
