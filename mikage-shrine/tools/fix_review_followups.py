"""Build guarded fixes for the three 1.49.22 post-package findings."""
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'releases/1.49.23'
dump = lambda value: json.dumps(value, ensure_ascii=False, indent=2) + '\n'
sha = lambda text: hashlib.sha256(text.encode()).hexdigest()


def once(text, old, new):
    assert text.count(old) == 1, 'Review-followup anchor drifted'
    return text.replace(old, new, 1)


def build():
    plan = json.loads((OUT / 'plan.json').read_text())
    changes = json.loads((OUT / 'changes.json').read_text())
    base = ROOT / 'releases' / plan['base']
    spec = json.loads((base / 'manifest.json').read_text())
    source = (base / 'card-source.json').read_text()
    assert sha(source) == changes['base_source_sha256'] == spec['source_sha256']
    card = json.loads(source)
    module = next(m for m in spec['modules'] if m['module_id'] == 'mvu')
    text = (ROOT.parent / module['path']).read_text()
    assert sha(text) == changes['base_mvu_sha256'] == module['sha256']
    book = card['data']['character_book']
    entry = next(e for e in book['entries'] if e['id'] == 1)
    for op in changes['operations']:
        if op['target'] == 'mvu':
            text = once(text, op['old'], op['new'])
        else:
            assert op['target'] == 'entry1'
            entry['content'] = once(entry['content'], op['old'], op['new'])
    text = once(text, "const version = '" + module['version'] + "';",
                "const version = '" + plan['version'] + "';")
    module.update(version=plan['version'], path='mikage-shrine/releases/' + plan['version'] + '/mvu.mjs', sha256=sha(text))
    for script in card['data']['extensions']['tavern_helper']['scripts']:
        current = next(m for m in spec['modules'] if m['script_id'] == script['id'])
        script['name'], count = re.subn(r'\d+\.\d+\.\d+', current['version'], script['name'], count=1)
        assert count == 1
        if current['module_id'] == 'mvu':
            script['info'] = '1.49.23：玩家仅换衣可随设定或日常事件保存；身份等其他设置继续使用设定事件。内部依赖失败可安全重试，成功后不重复初始化，保留既有存档。'
    card['character_version'] = card['data']['character_version'] = plan['version']
    card['data']['creator_notes'] = once(card['data']['creator_notes'], 'v' + plan['base'], 'v' + plan['version'])
    book['description'] = once(book['description'], 'v' + plan['base'], 'v' + plan['version'])
    outputs = {'card-source.json': dump(card), 'mvu.mjs': text}
    spec.update(release=plan['version'], source_name=plan['version'] + '/card-source.json', source_sha256=sha(outputs['card-source.json']))
    spec['ema_integration']['bound_worldbook']['version'] = plan['version']
    spec['reviewed_copy']['preserved_worldbook_version'] = plan['version']
    spec['bound_worldbook'].update(source='mikage-shrine/releases/' + plan['version'] + '/card-source.json', version=plan['version'], entry_sha256=sha(dump(book['entries'])))
    spec['checkpoint'].update(base=plan['base'], plan='mikage-shrine/releases/' + plan['version'] + '/plan.json', gate='checkpoint_package', gameplay='player outfit event contract and review metadata alignment', packaging='requested continuation', real_host='pending')
    outputs['creator-notes.md'] = card['data']['creator_notes']
    spec['creator_notes'].update(source='mikage-shrine/releases/' + plan['version'] + '/creator-notes.md', sha256=sha(outputs['creator-notes.md']))
    spec['review_followups'] = {'findings': ['R22-01', 'R22-02', 'R22-03'], 'player_other_fields': 'setting event required', 'schema_and_initial': 'unchanged', 'real_host': 'pending'}
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
    print(dump({'dry_run': args.dry_run, 'outputs': {name: {'bytes': len(text.encode()), 'sha256': sha(text)} for name, text in outputs.items()}}))
