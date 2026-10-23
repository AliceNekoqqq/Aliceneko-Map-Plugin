"""Apply hash-guarded, read-only memory projection bodies to the next card source."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'releases/1.49.21'
dump = lambda value: json.dumps(value, ensure_ascii=False, indent=2) + '\n'
sha = lambda text: hashlib.sha256(text.encode()).hexdigest()


def build():
    plan = json.loads((OUT / 'plan.json').read_text())
    changes = json.loads((OUT / 'changes.json').read_text())
    base = ROOT / 'releases' / plan['base']
    spec = json.loads((base / 'manifest.json').read_text())
    source = (base / 'card-source.json').read_text()
    assert sha(source) == changes['base_source_sha256'] == spec['source_sha256']
    card = json.loads(source)
    book = card['data']['character_book']
    files = {64: 'relationship-facts.ejs', 71: 'outfit-facts.ejs', 73: 'quiet-facts.ejs'}
    assert [op['entry_id'] for op in changes['operations']] == list(files)
    for op in changes['operations']:
        assert op['source'] == files[op['entry_id']]
        entries = [e for e in book['entries'] if e['id'] == op['entry_id']]
        assert len(entries) == 1 and sha(entries[0]['content']) == op['old_sha256']
        body = (OUT / op['source']).read_text()
        assert sha(body) == op['new_sha256'] and '\ufffd' not in body
        entries[0]['content'] = body
    card['character_version'] = card['data']['character_version'] = plan['version']
    assert book['description'].count('v' + plan['base']) == 1
    book['description'] = book['description'].replace('v' + plan['base'], 'v' + plan['version'], 1)
    outputs = {'card-source.json': dump(card)}
    spec.update(release=plan['version'], source_name=plan['version'] + '/card-source.json',
                source_sha256=sha(outputs['card-source.json']))
    spec['ema_integration']['bound_worldbook']['version'] = plan['version']
    spec['reviewed_copy']['preserved_worldbook_version'] = plan['version']
    spec['bound_worldbook'].update(source='mikage-shrine/releases/' + plan['version'] + '/card-source.json',
                                  version=plan['version'], entry_sha256=sha(dump(book['entries'])))
    spec['checkpoint'].update(base=plan['base'], plan='mikage-shrine/releases/' + plan['version'] + '/plan.json',
                              gate='source_iteration', gameplay='topic-scoped relationship/outfit/quiet memories',
                              packaging='not requested', real_host='pending')
    spec['memory_context'] = {'entries': list(files), 'sources': files, 'read_only': True,
                              'record_deletion_or_migration': False,
                              'optional_reader': 'ST-Prompt-Template getChatMessage(-1,user)',
                              'missing_reader': 'omit these historical projections', 'real_host': 'pending'}
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
