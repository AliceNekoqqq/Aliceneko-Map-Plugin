"""Apply the guarded WQ09 prose revision to new maintenance sources only."""
import argparse, copy, hashlib, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'releases/1.49.1'
compact = lambda value: json.dumps(value, ensure_ascii=False, separators=(',', ':'))
dump = lambda value: json.dumps(value, ensure_ascii=False, indent=2) + '\n'
sha = lambda text: hashlib.sha256(text.encode()).hexdigest()

def once(text, old, new):
    assert text.count(old) == 1, 'Expected exactly one guarded source match'
    return text.replace(old, new, 1)

def build():
    plan = json.loads((OUT / 'changes.json').read_text())
    base = ROOT / 'releases' / plan['base_release']
    spec = json.loads((base / 'manifest.json').read_text())
    mod = next(m for m in spec['modules'] if m['module_id'] == 'mvu')
    original = (ROOT.parent / mod['path']).read_text()
    assert sha(original) == mod['sha256']
    cfg = json.loads((base / 'config.json').read_text())
    oldcfg = copy.deepcopy(cfg)
    old = next(q for q in cfg['wardrobeQuests'] if q['id'] == 'WQ09')
    assert sha(compact(old)) == plan['base_quest_sha256']
    new = plan['quest']
    for key in ['id', 'rewardId', 'mainId', 'region', 'type', 'condition', 'outfits']:
        assert new[key] == old[key], 'Protected quest field: ' + key
    assert len(new['clues']) == len(new['paths']) == 2
    cfg['wardrobeQuests'][cfg['wardrobeQuests'].index(old)] = new
    reward = next(r for r in cfg['wardrobeRewards'] if r['id'] == new['rewardId'])
    reward['narrativeSource'] = new['delivery']
    mvu = once(original, 'const ShrineConfig = ' + compact(oldcfg) + ';', 'const ShrineConfig = ' + compact(cfg) + ';')
    mvu = once(mvu, "const version = '" + mod['version'] + "';", "const version = '" + plan['release'] + "';")
    restored = once(mvu, 'const ShrineConfig = ' + compact(cfg) + ';', 'const ShrineConfig = ' + compact(oldcfg) + ';')
    assert restored.replace("const version = '" + plan['release'] + "';", "const version = '" + mod['version'] + "';", 1) == original
    card = json.loads((base / 'card-source.json').read_text())
    assert sha(dump(card)) == spec['source_sha256']
    entry = next(e for e in card['data']['character_book']['entries'] if e['id'] == 57)
    entry['content'] = once(entry['content'], 'var wardrobeQuestCatalog=' + compact(oldcfg['wardrobeQuests']) + ';', 'var wardrobeQuestCatalog=' + compact(cfg['wardrobeQuests']) + ';')
    card['character_version'] = card['data']['character_version'] = plan['release']
    book = card['data']['character_book']
    book['description'] = book['description'].replace('v' + plan['base_release'], 'v' + plan['release'])
    mod.update(version=plan['release'], path='mikage-shrine/releases/' + plan['release'] + '/mvu.mjs', sha256=sha(mvu))
    spec.update(release=plan['release'], source_name=plan['release'] + '/card-source.json', source_sha256=sha(dump(card)))
    spec['ema_integration']['bound_worldbook']['version'] = plan['release']
    spec['reviewed_copy']['preserved_worldbook_version'] = plan['release']
    spec['kozuchi_copy'] = {'plan': 'mikage-shrine/releases/1.49.1/changes.json', 'gate': 'source_iteration', 'scope': 'WQ09 narrative text; executable behavior preserved', 'packaging': 'not requested in this iteration'}
    return {'config.json': dump(cfg), 'mvu.mjs': mvu, 'card-source.json': dump(card), 'manifest.json': dump(spec)}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    outputs = build()
    if not args.dry_run:
        assert not any((OUT / name).exists() for name in outputs), 'Use fresh output files'
        for name, text in outputs.items():
            (OUT / name).write_text(text)
    print(dump({'dry_run': args.dry_run, 'outputs': {name: {'bytes': len(text.encode()), 'sha256': sha(text)} for name, text in outputs.items()}}))
