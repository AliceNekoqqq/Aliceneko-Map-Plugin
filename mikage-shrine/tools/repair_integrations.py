"""Derive 1.48.3 from the active manifest; preserve prose outside location metadata."""
import argparse, copy, hashlib, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'releases/1.48.2'
OUT = ROOT / 'releases/1.48.3'
VERSION = '1.48.3'
dump = lambda x: json.dumps(x, ensure_ascii=False, indent=2) + '\n'
compact = lambda x: json.dumps(x, ensure_ascii=False, separators=(',', ':'))
sha = lambda s: hashlib.sha256(s.encode()).hexdigest()
LOCATIONS = [
    ('商店街与河岸', '妖怪横丁与夜森神社'), ('站前与海滨', '多满沼与鞍马山'),
    ('车站与沿线海滨', '多满沼与鞍马山'), ('林道与湿地', '龙宫城与鸣神殿'),
    ('林道和湿地栈道', '龙宫城和鸣神殿'), ('会所与祭道', '出云大社与缘结参道'),
    ('祭礼会所', '出云大社祭礼处'), ('门前祭道', '缘结参道'),
    ('站前街', '妖怪横丁'), ('站前', '妖怪横丁'), ('城郊林道', '鞍马山山路'),
    ('林道巡护人', '鞍马山巡山人'), ('林道旧物整理人', '鞍马山旧物整理人'),
    ('林道', '鞍马山山路'),
]

def place_text(value):
    if isinstance(value, str):
        for old, new in LOCATIONS:
            value = value.replace(old, new)
    elif isinstance(value, list):
        value = [place_text(v) for v in value]
    elif isinstance(value, dict):
        value = {k: place_text(v) for k, v in value.items()}
    return value

def build(font_commit):
    assert re.fullmatch('[0-9a-f]{40}',font_commit)
    manifest = json.loads((BASE / 'manifest.json').read_text())
    modules = {m['module_id']: m for m in manifest['modules']}
    outputs, changes = {}, []
    def source(name):
        m = modules[name]
        text = (ROOT.parent / m['path']).read_text()
        assert sha(text) == m['sha256'], name
        return text
    def replace(text, old, new, label):
        assert text.count(old) == 1, (label, text.count(old))
        changes.append({'label': label, 'old_sha256': sha(old), 'new_sha256': sha(new)})
        return text.replace(old, new, 1)
    mvu = source('mvu')
    match = re.search(r'^const ShrineConfig = (.*);$', mvu, re.M)
    config = json.loads(match[1])
    old_config = copy.deepcopy(config)
    config['wardrobeRewards'] = place_text(config['wardrobeRewards'])
    config['wardrobeQuests'] = place_text(config['wardrobeQuests'])
    destinations = {'WQ01':'R03', 'WQ02':'R06', 'WQ03':'R03', 'WQ05':'R03', 'WQ07':'R06'}
    for quest in config['wardrobeQuests']:
        quest['region'] = destinations.get(quest['id'], quest['region'])
    mvu = replace(mvu, match[0], 'const ShrineConfig = ' + compact(config) + ';', 'runtime-location-metadata')
    outputs['mvu.mjs'] = mvu
    card = json.loads((BASE / 'card-source.json').read_text())
    entries = card['data']['character_book']['entries']
    for entry in entries:
        if entry['id'] == 57:
            match = re.search(r'var wardrobeQuestCatalog=(.*);', entry['content'])
            assert json.loads(match[1]) == old_config['wardrobeQuests']
            entry['content'] = replace(entry['content'], match[0], 'var wardrobeQuestCatalog=' + compact(config['wardrobeQuests']) + ';', 'worldbook-quest-location-metadata')
    game = source('minigames')
    font_meta=json.loads((ROOT/'assets/ui/memory-book-v1483-font.json').read_text())
    assert hashlib.sha256((ROOT.parent/font_meta['file']).read_bytes()).hexdigest()==font_meta['sha256']
    css_match=re.search(r'^const GAME_CSS = (.*);$',game,re.M)
    css=json.loads(css_match[1])
    css+='\n.mka-memory-overlay,.mka-memory-overlay button,.mka-memory-overlay .mka-memory-number{font-family:"Mikage Memory Serif","Mikage Serif",serif}.mka-memory-overlay{font-size:14px;line-height:1.8}.mka-memory-actions button{font-size:13px;min-height:44px}.mka-memory-card p,.mka-memory-episode p{font-size:13px;line-height:1.8}\n'
    game=replace(game,css_match[0],'const GAME_CSS = '+json.dumps(css,ensure_ascii=False)+';','restored-book-font')
    begin = game.index('    function showMemoryBook(){')
    end = game.index("    const replay=button('再玩一次'", begin)
    book = game[begin:end]
    book = book.replace('    function showMemoryBook(){', '  function openMemoryBook(root,bookButton){\n    function button(text,action,cls,parent){const b=el(\'button\',\'mka-button \'+cls,text);b.type=\'button\';b.addEventListener(\'click\',()=>{if(root.isConnected)action(b);});parent.append(b);return b;}')
    font_url='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@'+font_commit+'/'+font_meta['file']
    book=book.replace("      if(root.querySelector('.mka-memory-overlay'))return;", "      if(root.querySelector('.mka-memory-overlay'))return;\n      try{if(global.FontFace&&document.fonts&&![...document.fonts].some(f=>f.family.replace(/\"/g,'')==='Mikage Memory Serif')){const face=new global.FontFace('Mikage Memory Serif','url(\""+font_url+"\")',{weight:'500'});document.fonts.add(face);face.load().catch(()=>{});}}catch{}")
    book = book.replace('count=known.size;', 'count=known.size,activeCount=ACTIVE_MEMORY_IDS.filter(id=>known.has(id)).length;')
    book = book.replace('${count}/${MEMORY_ITEMS.length}', '${activeCount}/${ACTIVE_MEMORY_IDS.length}')
    book = book.replace('MEMORY_ITEMS.forEach((item,index)=>{', 'MEMORY_ITEMS.filter(item=>ACTIVE_MEMORY_IDS.includes(item.id)||known.has(item.id)).forEach((item,index)=>{')
    book = book.replace("card.dataset.memoryId=item.id;", "card.dataset.memoryId=item.id;if(!ACTIVE_MEMORY_IDS.includes(item.id))card.dataset.legacy='true';")
    book = book.replace("JSON.parse(await file.text()),incoming=parsed?.entries;if(!incoming||typeof incoming!=='object')", "JSON.parse(await file.text()),incoming=parsed?.entries;if(!overlay.isConnected||!root.isConnected)return;if(parsed?.schema!==1||!incoming||typeof incoming!=='object'||Array.isArray(incoming))")
    book = book.replace('overlay.remove();showMemoryBook();', 'overlay.remove();openMemoryBook(root,bookButton);')
    book = book.replace('area.remove();status.textContent=copied?', 'if(copied)area.remove();status.textContent=copied?')
    book = book.replace("if(event.target===overlay){overlay.remove();bookButton?.focus({preventScroll:true});}", 'if(event.target===overlay)closeBook();')
    game = replace(game, game[begin:end], '    function showMemoryBook(){return openMemoryBook(root,bookButton);}\n', 'extract-shared-memory-book')
    marker = '  function mount(container, options) {'
    ids = ['R01','R02','R03-APPRAISAL','R04-PLUM','R05-DRESS','R06-WIND','R07-STEALTH','R08-FOX','R09-THREAD','R10-FESTIVAL']
    game = replace(game, marker, '  const ACTIVE_MEMORY_IDS='+compact(ids)+';\n'+book+'\n'+marker, 'shared-memory-book')
    game = replace(game, "{at:11,title:'灯火收摊后'", "{at:10,title:'灯火收摊后'", 'attainable-memory-milestone')
    game = replace(game, 'return {mount,getMemoryBook:readMemoryBook};', 'return {mount,getMemoryBook:readMemoryBook,openMemoryBook};', 'memory-book-interface')
    game = replace(game, '    bar.append(brand,closeButton);', "    const bookButton=doc.createElement('button');bookButton.type='button';bookButton.className='mkg-leave';bookButton.textContent='旧物回忆册';bookButton.style.cssText='font-size:12px;padding:8px;min-height:44px;flex:none';\n    bookButton.addEventListener('click',()=>{if(!bookButton.disabled)activities.openMemoryBook(dialog,bookButton);});\n    bar.append(brand,bookButton,closeButton);", 'all-game-memory-entry')
    game = replace(game, '    let game = null;', "    let game = null;\n    function syncBookEntry(){const s=game?.getState?.();bookButton.disabled=!!s&&s.phase!=='done'&&s.phase!=='ready'&&s.paused!==true;bookButton.title=bookButton.disabled?'暂停或完成散策后可打开回忆册':'';}\n    const bookObserver=new host.MutationObserver(syncBookEntry);bookObserver.observe(gameArea,{subtree:true,childList:true,attributes:true,attributeFilter:['data-phase','data-paused']});", 'respect-active-game-pause')
    game = replace(game, '      game?.dispose?.();', '      bookObserver.disconnect();\n      game?.dispose?.();', 'memory-entry-cleanup')
    outputs['minigames.mjs'] = game
    for name in ['mvu','minigames']:
        old = "const version = '"+modules[name]['version']+"';"
        outputs[name+'.mjs'] = replace(outputs[name+'.mjs'], old, "const version = '"+VERSION+"';", name+'-version')
        modules[name].update(version=VERSION, path='mikage-shrine/releases/'+VERSION+'/'+name+'.mjs', sha256=sha(outputs[name+'.mjs']))
    card['character_version'] = card['data']['character_version'] = VERSION
    book_meta = card['data']['character_book']
    book_meta['description'] = book_meta['description'].replace('v1.48.1', 'v'+VERSION)
    outputs['card-source.json'] = dump(card)
    manifest.update(release=VERSION, source_name=VERSION+'/card-source.json', source_sha256=sha(outputs['card-source.json']), host_acceptance='pending')
    manifest['worldbook_policy'] = '1.48.3 location metadata for wardrobe catalog only; Ema entry 34 and all narrative prose preserved from 1.48.2'
    manifest['reviewed_copy']['preserved_worldbook_version'] = VERSION
    manifest['ema_integration']['bound_worldbook'].update(version=VERSION, entry_content_version='1.48.1')
    manifest['integration_repair'] = {'base':'1.48.2','quest_destinations':destinations,'active_memory_items':ids,'milestones':[3,7,10],'preserve_existing_quest_snapshots':True,'font_commit':font_commit,'font':font_meta,'changes':changes}
    outputs['manifest.json'] = dump(manifest)
    return outputs

if __name__ == '__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--font-commit',required=True);ap.add_argument('--dry-run',action='store_true');args=ap.parse_args()
    result=build(args.font_commit)
    if not args.dry_run:
        assert not any((OUT/name).exists() for name in result), 'Refusing to overwrite release outputs'
        OUT.mkdir(parents=True,exist_ok=True)
        for name,text in result.items():(OUT/name).write_text(text)
    print(dump({'dry_run':args.dry_run,'outputs':{name:{'bytes':len(text.encode()),'sha256':sha(text)} for name,text in result.items()}}))
