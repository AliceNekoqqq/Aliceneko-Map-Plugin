#!/usr/bin/env python3
"""Pack a recovered release source using a manifest of immutable remote modules."""
import argparse
import copy
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def build(source, manifest, commit):
    if not re.fullmatch(r'[0-9a-f]{40}', commit):
        raise ValueError('A complete immutable Git commit is required')
    card = copy.deepcopy(json.loads(source.read_text()))
    spec = json.loads(manifest.read_text())
    template = (ROOT / spec['loader_template']).read_text()
    scripts = card['data']['extensions']['tavern_helper']['scripts']
    by_id = {s['id']: s for s in scripts}
    if len(by_id) != len(scripts) or set(by_id) != {m['script_id'] for m in spec['modules']}:
        raise ValueError('Script identities differ from the release manifest')
    for module in spec['modules']:
        path = (ROOT / module['path']).resolve()
        path.relative_to(ROOT)
        if hashlib.sha256(path.read_bytes()).hexdigest() != module['sha256']:
            raise ValueError('Module source differs: ' + module['path'])
        script = by_id[module['script_id']]
        code = template
        for key, value in {
            '__COMMIT__': commit, '__SCRIPT_ID__': module['module_id'],
            '__MODULE_PATH__': module['path'], '__VERSION__': module['version'],
            '__LABEL__': script['name'].split(' ')[0],
        }.items():
            code = code.replace(key, value)
        if re.search(r'__[A-Z_]+__', code.replace('__MIKAGE_REMOTE_LOADERS__', '').replace('__MIKAGE_REMOTE_RETRY__', '')):
            raise ValueError('Unresolved loader placeholder')
        script['content'] = code
        buttons = script['button']['buttons']
        if not any(b['name'] == '重新加载资源' for b in buttons):
            buttons.append({'name': '重新加载资源', 'visible': True})
        script['export_with']['button'] = True
    result = json.dumps(card, ensure_ascii=False, indent=2) + '\n'
    if ';base64,' in result or 'embedded:copy' in result:
        raise ValueError('Embedded runtime or media is forbidden in the lightweight card')
    return result


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--source', type=Path, required=True)
    ap.add_argument('--manifest', type=Path, required=True)
    ap.add_argument('--commit', required=True)
    ap.add_argument('--output', type=Path, required=True)
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    result = build(args.source, args.manifest, args.commit)
    if args.output.exists():
        raise ValueError('Refusing to overwrite an existing artifact')
    if not args.dry_run:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(result)
    print(json.dumps({'dry_run': args.dry_run, 'output': str(args.output.resolve()),
                      'bytes': len(result.encode()), 'sha256': hashlib.sha256(result.encode()).hexdigest()}))


if __name__ == '__main__':
    main()
