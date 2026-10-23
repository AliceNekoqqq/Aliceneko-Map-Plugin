"""Derive the bounded event-only life interaction fix from its guarded operation."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'releases/1.49.17'
dump = lambda value: json.dumps(value, ensure_ascii=False, indent=2) + '\n'
sha = lambda text: hashlib.sha256(text.encode()).hexdigest()


def once(text, old, new):
    assert text.count(old) == 1, 'Life interaction anchor drifted'
    return text.replace(old, new, 1)


def build():
    plan = json.loads((OUT / 'plan.json').read_text())
    edits = json.loads((OUT / 'changes.json').read_text())
    base = ROOT / 'releases' / plan['base']
    spec = json.loads((base / 'manifest.json').read_text())
    source = (base / 'card-source.json').read_text()
    assert sha(source) == edits['base_source_sha256'] == spec['source_sha256']
    module = next(m for m in spec['modules'] if m['module_id'] == 'mvu')
    text = (ROOT.parent / module['path']).read_text()
    assert sha(text) == edits['base_mvu_sha256'] == module['sha256']
    assert len(edits['operations']) == 1
    op = edits['operations'][0]
    assert op['target'] == 'mvu'
    text = once(text, op['old'], op['new'])
    text = once(text, "const version = '" + module['version'] + "';",
                "const version = '" + plan['version'] + "';")
    module.update(version=plan['version'],
                  path='mikage-shrine/releases/' + plan['version'] + '/mvu.mjs',
                  sha256=sha(text))
    card = json.loads(source)
    card['character_version'] = card['data']['character_version'] = plan['version']
    book = card['data']['character_book']
    book['description'] = once(book['description'], 'v' + plan['base'], 'v' + plan['version'])
    outputs = {'card-source.json': dump(card), 'mvu.mjs': text}
    spec.update(release=plan['version'], source_name=plan['version'] + '/card-source.json',
                source_sha256=sha(outputs['card-source.json']))
    spec['ema_integration']['bound_worldbook']['version'] = plan['version']
    spec['reviewed_copy']['preserved_worldbook_version'] = plan['version']
    spec['bound_worldbook'].update(source='mikage-shrine/releases/' + plan['version'] + '/card-source.json',
                                  version=plan['version'], entry_sha256=sha(dump(book['entries'])))
    spec['checkpoint'].update(base=plan['base'], plan='mikage-shrine/releases/' + plan['version'] + '/plan.json',
                              gate='source_iteration', gameplay='bounded life interactions derived from events',
                              packaging='not requested', real_host='pending')
    spec['life_interaction_events'] = {'plan': 'mikage-shrine/releases/' + plan['version'] + '/plan.json',
                                     'state_owner': 'ShrineLifeRuntime', 'schema': 'unchanged',
                                     'exact_result_compatibility': True, 'day_reconciliation': True,
                                     'real_host': 'pending', 'packaging': 'not requested'}
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
