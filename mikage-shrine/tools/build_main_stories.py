"""Build story-bearing main ema from versioned data and one guarded factory edit."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'releases/1.49.19'
dump = lambda value: json.dumps(value, ensure_ascii=False, indent=2) + '\n'
sha = lambda text: hashlib.sha256(text.encode()).hexdigest()


def once(text, old, new):
    assert text.count(old) == 1, 'Main story anchor drifted'
    return text.replace(old, new, 1)


def build():
    plan = json.loads((OUT / 'plan.json').read_text())
    edits = json.loads((OUT / 'changes.json').read_text())
    stories = json.loads((OUT / 'main-stories.json').read_text())['stories']
    assert [s['编号'] for s in stories] == ['M01', 'M02', 'M03', 'M04', 'M05']
    assert len({s['心愿'] for s in stories}) == 5
    for s in stories:
        assert set(s) == {'编号', '祈愿人', '来客类型', '类型', '地区', '心愿', '补充说明', '幕后'}
        assert set(s['幕后']) == {'矛盾', '线索一', '线索二', '路径一', '路径二', '收束条件'}
        assert all(isinstance(v, str) and 0 < len(v) <= 300 for k, v in s.items() if k != '幕后')
        assert all(isinstance(v, str) and 0 < len(v) <= 300 for v in s['幕后'].values())
    base = ROOT / 'releases' / plan['base']
    spec = json.loads((base / 'manifest.json').read_text())
    source = (base / 'card-source.json').read_text()
    assert sha(source) == edits['base_source_sha256'] == spec['source_sha256']
    module = next(m for m in spec['modules'] if m['module_id'] == 'mvu')
    text = (ROOT.parent / module['path']).read_text()
    assert sha(text) == edits['base_mvu_sha256'] == module['sha256']
    assert len(edits['operations']) == 1
    op = edits['operations'][0]
    assert op['target'] == 'mvu' and op['data'] == 'main-stories.json/stories'
    new = once(op['new_template'], op['marker'], json.dumps(stories, ensure_ascii=False, separators=(',', ':')))
    text = once(text, op['old'], new)
    text = once(text, "const version = '" + module['version'] + "';",
                "const version = '" + plan['version'] + "';")
    module.update(version=plan['version'], path='mikage-shrine/releases/' + plan['version'] + '/mvu.mjs', sha256=sha(text))
    card = json.loads(source)
    card['character_version'] = card['data']['character_version'] = plan['version']
    book = card['data']['character_book']
    book['description'] = once(book['description'], 'v' + plan['base'], 'v' + plan['version'])
    outputs = {'card-source.json': dump(card), 'mvu.mjs': text}
    spec.update(release=plan['version'], source_name=plan['version'] + '/card-source.json', source_sha256=sha(outputs['card-source.json']))
    spec['ema_integration']['bound_worldbook']['version'] = plan['version']
    spec['reviewed_copy']['preserved_worldbook_version'] = plan['version']
    spec['bound_worldbook'].update(source='mikage-shrine/releases/' + plan['version'] + '/card-source.json',
                                  version=plan['version'], entry_sha256=sha(dump(book['entries'])))
    spec['checkpoint'].update(base=plan['base'], plan='mikage-shrine/releases/' + plan['version'] + '/plan.json',
                              gate='source_iteration', gameplay='five concrete main ema stories',
                              packaging='not requested', real_host='pending')
    spec['main_stories'] = {'source': 'mikage-shrine/releases/' + plan['version'] + '/main-stories.json',
                            'sha256': sha((OUT / 'main-stories.json').read_text()), 'count': 5,
                            'state_owner': 'ShrineCard.mainItem', 'schema': 'unchanged',
                            'existing_story_migration': False, 'real_host': 'pending'}
    outputs['manifest.json'] = dump(spec)
    return outputs


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    outputs = build()
    assert not any((OUT / name).exists() for name in outputs), 'Fresh outputs required'
    if not args.dry_run:
        for name, text in outputs.items():
            (OUT / name).write_text(text)
    print(dump({'dry_run': args.dry_run, 'outputs': {
        name: {'bytes': len(text.encode()), 'sha256': sha(text)} for name, text in outputs.items()}}))
