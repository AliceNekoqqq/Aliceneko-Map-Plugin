#!/usr/bin/env python3
"""Build the bounded R02 replacement from 1.30.1; never rebuild with legacy tools."""
from pathlib import Path
import argparse,json,re,hashlib,copy
ROOT=Path(__file__).resolve().parents[1]
VERSION='1.31.0'
def once(text,old,new):
    if text.count(old)!=1:raise ValueError('Patch anchor mismatch: '+old[:70])
    return text.replace(old,new,1)
def status(text,optional=False):
    match=re.search(r'const StatusbarHTML=("(?:[^"\\]|\\.)*");',text)
    html=json.loads(match[1])
    html,count=re.subn(r"^  R02:\['cat'.*$","  R02:['mail','樱坂拾页记','mail','沿三条小径拾回风中的纸页，避开黑羽与人群，再把便签按时刻排好。'],",html,flags=re.M)
    if count==0 and optional:return text
    if count!=1:raise ValueError('R02 status entry mismatch')
    return text[:match.start(1)]+json.dumps(html,ensure_ascii=False)+text[match.end(1):]
def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--dry-run',action='store_true');ap.add_argument('--refresh-staging',action='store_true');ap.add_argument('--asset-commit',required=True);args=ap.parse_args()
    if not re.fullmatch('[0-9a-f]{40}',args.asset_commit):raise ValueError('Use an immutable asset commit')
    dest=ROOT/'releases'/VERSION
    if dest.exists() and not args.refresh_staging:raise ValueError('Refusing to overwrite release '+VERSION)
    if dest.exists() and json.loads((dest/'manifest.json').read_text())['release']!=VERSION:raise ValueError('Staging identity mismatch')
    previous=ROOT/'releases/1.29.1/minigames.mjs'
    game=previous.read_text()
    game=once(game,"const version = '1.28.0';","const version = '"+VERSION+"';")
    match=re.search(r'const GAME_CSS = ("(?:[^"\\]|\\.)*");',game)
    css=json.loads(match[1])+'\n'+(ROOT/'src/school/style.css').read_text()
    game=game[:match.start(1)]+json.dumps(css,ensure_ascii=False)+game[match.end(1):]
    index=game.index('function createMikageActivities(')
    font_url='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@'+args.asset_commit+'/mikage-shrine/assets/activities/school-v131-font.ttf'
    school='\nconst SCHOOL_FONT_URL='+json.dumps(font_url)+';\n'+(ROOT/'src/school/model.js').read_text()+'\n'+(ROOT/'src/school/activity.js').read_text()+'\n'
    game=game[:index]+school+game[index:]
    anchor="    if (!META[region]) throw new RangeError("
    if game.count(anchor)!=1:raise ValueError('mount route anchor mismatch')
    game=game.replace(anchor,"    if(region==='R02')return mountMikageSchool(global,container,{...opts,getMemoryBook:readMemoryBook,onComplete:result=>{const memories=saveMemories('R02',result.detail,['R02']);opts.onComplete?.({...result,memories});return memories.every(m=>m.persistent!==false);}});\n"+anchor,1)
    game=once(game,"    mount.dataset.mikageMinigameHost = '';","    mount.dataset.mikageMinigameHost = '';\n    if(region==='R02'){mount.dataset.mikageSchool='true';void installMikageSchoolFont(host,doc);}")
    start=game.index('      R02(){\n');end=game.index('      R03(){\n',start)
    game=game[:start]+game[end:]
    game,count=re.subn(r"^    R02:\['cat'.*$","    R02:['mail','樱坂拾页记','换道拾页，留意黑羽与路过的人。','樱坂散页夹','在樱坂收好纸页，沿着风向走过一段路。'],",game,flags=re.M)
    if count!=1:raise ValueError('META entry mismatch')
    game,count=re.subn(r"^    \{id:'R02',region:'R02'.*$","    {id:'R02',region:'R02',place:'宇庭高校外·樱坂',item:'樱坂散页夹',line:'纸页按时刻排在一起，夹进一枚小小的纸夹。巴卫收起折扇，等你把东西交还。'},",game,flags=re.M)
    if count!=1:raise ValueError('memory entry mismatch')
    game,count=re.subn(r"^  R02: \{ place:.*$","  R02: { place:'宇庭高校外·樱坂', title:'樱坂拾页记', note:'风把几张笔记吹到了校门外。沿三条小径拾页，避开黑羽与路过的人，在坡下把便签排好。巴卫会看风，也可以请他协助；沿用衣柜当前穿着。', tags:['三段路与两次选路','自动或逐步操作','散页整理与交还'] },",game,flags=re.M)
    if count!=1:raise ValueError('SCENES entry mismatch')
    cat_start=game.index("    if (region === 'R02') {")
    cat_end=game.index("    const placard = doc.createElement('span');",cat_start)
    game=game[:cat_start]+game[cat_end:]
    scene=status((ROOT/'releases/1.30.1/scene.mjs').read_text())
    scene=once(scene,"const version = '1.30.1';","const version = '"+VERSION+"';")
    maintained=status((ROOT/'src/scene-host.mjs').read_text(),optional=True)
    roam=(ROOT/'src/roam-controller.js').read_text()
    roam,count=re.subn(r"^  R02:\['cat'.*$","  R02:['mail','樱坂拾页记','mail','沿三条小径拾回风中的纸页，避开黑羽与人群，再把便签按时刻排好。'],",roam,flags=re.M)
    if count!=1 and roam.count("R02:['mail','樱坂拾页记'")!=1:raise ValueError('Maintained R02 entry mismatch')
    card=json.loads((ROOT/'releases/1.30.1/card-source.json').read_text());card['character_version']=card['data']['character_version']=VERSION
    for script in card['data']['extensions']['tavern_helper']['scripts']:
        if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':script['name']='御影神社·衣装与散策 '+VERSION+' CDN';script['info']='R02入口接入樱坂拾页记；保留1.30.1图集裁切及31套衣装。'
        if script['id']=='d3560ad0-892c-4b31-b783-11f80a23b90f':script['name']='御影神社·独立小游戏 '+VERSION+' CDN';script['info']='逐项重做第2项R02：三段避障拾页、选路、阵风与便签排序；保留R01茶席，R03–R10等待后续改造。'
    manifest=json.loads((ROOT/'releases/1.30.1/manifest.json').read_text());manifest['release']=VERSION
    manifest['source_name']='1.30.1/card-source.json';manifest['source_sha256']=hashlib.sha256((ROOT/'releases/1.30.1/card-source.json').read_bytes()).hexdigest()
    for module in manifest['modules']:
        if module['module_id'] in ['scene','minigames']:
            module['version']=VERSION;module['path']='mikage-shrine/releases/'+VERSION+'/'+module['module_id']+'.mjs'
            module['sha256']=hashlib.sha256((scene if module['module_id']=='scene' else game).encode()).hexdigest()
    manifest['worldbook_policy']='All entries and all game state definitions unchanged from 1.30.1'
    manifest['deferred']='R03–R10 full gameplay replacements remain pending; original implementations retained'
    manifest['school_assets']='Reuse canon-v127/R02 day/dusk/night and current shared wardrobe API, pinned URLs unchanged'
    manifest['school_font']={'asset_commit':args.asset_commit,**json.loads((ROOT/'src/school/font-manifest.json').read_text())}
    outputs={'minigames.mjs':game,'scene.mjs':scene,'card-source.json':json.dumps(card,ensure_ascii=False,indent=2)+'\n','manifest.json':json.dumps(manifest,ensure_ascii=False,indent=2)+'\n'}
    print(json.dumps({'dry_run':args.dry_run,'outputs':list(outputs),'maintained':['src/scene-host.mjs','src/roam-controller.js'],'release':VERSION}))
    if args.dry_run:return
    dest.mkdir(exist_ok=args.refresh_staging)
    for file,text in outputs.items():(dest/file).write_text(text)
    (ROOT/'src/scene-host.mjs').write_text(maintained);(ROOT/'src/roam-controller.js').write_text(roam)
if __name__=='__main__':main()
