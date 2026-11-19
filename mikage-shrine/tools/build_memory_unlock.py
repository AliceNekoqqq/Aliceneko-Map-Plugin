#!/usr/bin/env python3
"""Extend the published minigames module at its common memory save boundary."""

import argparse
import hashlib
import json
import re
from pathlib import Path

from build_wardrobe_gallery import ROOT, build_card, replace_once

BASE = ROOT / 'releases/1.49.46/modules/minigames.mjs'
BASE_SHA256 = '3231fb3607e87b36fdaf39865bf5dcaa93baae74ebd80304bcaa21366e4bb920'
VERSION = '1.49.47'
MINIGAMES_ID = 'd3560ad0-892c-4b31-b783-11f80a23b90f'


def build_module():
    if hashlib.sha256(BASE.read_bytes()).hexdigest() != BASE_SHA256:
        raise ValueError('Unexpected base minigames module')
    source = BASE.read_text()
    style = re.search(r'^const GAME_CSS = (.+);$', source, re.M)
    css = json.loads(style[1]) + '\n' + (ROOT / 'src/memory-unlock.css').read_text()
    source = source[:style.start(1)] + json.dumps(css, ensure_ascii=False) + source[style.end(1):]
    source = replace_once(source, "const version = '1.49.46';", f"const version = '{VERSION}';")
    source = replace_once(source, 'function createMikageActivities(global)', 'function createMikageActivities(global, onEpisodeUnlock)')
    source = replace_once(source, '  function saveMemories(region,detail,ids){', '''  function unlockedEpisodes(count){return MEMORY_EPISODES.filter(episode=>count>=episode.at);}
  function knownMemoryIds(book){return new Set(MEMORY_ITEMS.filter(item=>Object.hasOwn(book.entries,item.id)).map(item=>item.id));}
  function saveMemories(region,detail,ids){''')
    source = replace_once(source, '    for(const id of ids){', '''    const previousCount=knownMemoryIds(book).size;
    for(const id of ids){''')
    source = replace_once(source, '    const persistent=writeMemoryBook(book);', '''    const persistent=writeMemoryBook(book);
    const episodes=unlockedEpisodes(knownMemoryIds(book).size).slice(unlockedEpisodes(previousCount).length);
    if(episodes.length)onEpisodeUnlock(episodes.map(episode=>episode.title));''')
    source = replace_once(source, 'known=new Set(Object.keys(book.entries).filter(id=>MEMORY_ITEMS.some(item=>item.id===id)))', 'known=knownMemoryIds(book)')
    source = replace_once(source, "      MEMORY_EPISODES.forEach(episode=>{const unlocked=count>=episode.at,", "      const unlockedSet=new Set(unlockedEpisodes(count));\n      MEMORY_EPISODES.forEach(episode=>{const unlocked=unlockedSet.has(episode),")
    source = replace_once(source, '  const activities = createMikageActivities(host);', '  const activities = createMikageActivities(host,titles=>current?.showEpisodeUnlocks(titles));')
    source = replace_once(source, '    dialog.append(bar,intro,foot,gameArea);', '''    const unlockNote = doc.createElement('aside');
    unlockNote.className = 'mkg-memory-unlock';
    unlockNote.hidden = true;
    const unlockText = doc.createElement('div');
    unlockText.setAttribute('role','status');
    const unlockTitle = doc.createElement('strong');
    unlockTitle.textContent = '回忆短篇已解锁';
    const unlockNames = doc.createElement('span');
    unlockText.append(unlockTitle,unlockNames);
    const unlockBook = doc.createElement('button');
    unlockBook.type = 'button';
    unlockBook.className = 'mkg-leave';
    unlockBook.textContent = '翻开回忆册';
    unlockBook.addEventListener('click',()=>{if(!bookButton.disabled)activities.openMemoryBook(dialog,unlockBook);});
    unlockNote.append(unlockText,unlockBook);
    dialog.append(bar,intro,foot,gameArea,unlockNote);''')
    source = replace_once(source, '    function syncBookEntry(){const s=game?.getState?.();', '''    let previousPhase;
    function syncBookEntry(){const s=game?.getState?.();
      if(previousPhase==='done'&&s?.phase!=='done')unlockNote.hidden=true;
      previousPhase=s?.phase;''')
    return replace_once(source, '    const handle = { close };', '''    const handle = {
      close,
      showEpisodeUnlocks(titles){unlockNames.textContent=titles.join('、');unlockNote.hidden=false;},
    };''')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--module', required=True, type=Path)
    parser.add_argument('--card-source', type=Path)
    parser.add_argument('--card-output', type=Path)
    parser.add_argument('--commit')
    args = parser.parse_args()
    if any([args.card_source, args.card_output, args.commit]):
        if not all([args.card_source, args.card_output, args.commit]):
            parser.error('--card-source, --card-output and --commit are required together')
        args.card_output.write_text(build_card(args.card_source, args.module, args.commit,
            version=VERSION, script_id=MINIGAMES_ID, module_id='minigames'))
    else:
        args.module.parent.mkdir(parents=True, exist_ok=True)
        args.module.write_text(build_module())
