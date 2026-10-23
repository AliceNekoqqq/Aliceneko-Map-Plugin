"""Build the author-notes-only source iteration from guarded inputs."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'releases/1.49.22'
dump = lambda obj: json.dumps(obj, ensure_ascii=False, indent=2) + '\n'
sha = lambda text: hashlib.sha256(text.encode()).hexdigest()


def build():
    plan = json.loads((OUT / 'plan.json').read_text())
    base = ROOT / 'releases' / plan['base']
    text = (base / 'card-source.json').read_text()
    spec = json.loads((base / 'manifest.json').read_text())
    assert sha(text) == plan['base_source_sha256'] == spec['source_sha256']
    card = json.loads(text)
    assert sha(card['data']['creator_notes']) == plan['old_notes_sha256']
    notes = (OUT / 'creator-notes.md').read_text()
    assert sha(notes) == plan['new_notes_sha256'] and '\ufffd' not in notes
    card['data']['creator_notes'] = notes
    card['character_version'] = card['data']['character_version'] = plan['version']
    book = card['data']['character_book']
    assert book['description'].count('v' + plan['base']) == 1
    book['description'] = book['description'].replace('v' + plan['base'], 'v' + plan['version'], 1)
    outputs = {'card-source.json': dump(card)}
    spec.update(release=plan['version'], source_name=plan['version'] + '/card-source.json',
                source_sha256=sha(outputs['card-source.json']))
    spec['ema_integration']['bound_worldbook']['version'] = plan['version']
    spec['reviewed_copy']['preserved_worldbook_version'] = plan['version']
    spec['bound_worldbook'].update(source='mikage-shrine/releases/' + plan['version'] + '/card-source.json',
                                  version=plan['version'])
    spec['checkpoint'].update(base=plan['base'], plan='mikage-shrine/releases/' + plan['version'] + '/plan.json',
                              gate='source_iteration', gameplay='unchanged; creator notes refreshed',
                              packaging='not requested', real_host='pending')
    spec['creator_notes'] = {'source': 'mikage-shrine/releases/' + plan['version'] + '/creator-notes.md',
                             'sha256': sha(notes), 'historical_notes': 'retained in earlier source snapshots'}
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
