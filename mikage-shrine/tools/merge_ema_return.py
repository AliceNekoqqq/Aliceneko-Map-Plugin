#!/usr/bin/env python3
"""Build the 1.48.1 Ema integration from immutable 1.48.0 inputs.

Incoming narrative text is copied verbatim. Only enum contracts, entry routing,
and release metadata are repaired. --dry-run calculates every output in memory.
"""
import argparse
import copy
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = '1.48.1'
BASE = ROOT / 'releases/1.48.0'
INPUT = ROOT / 'releases/1.48.1/incoming'
TYPE_PATHS = {'委托.类型', '记录.完成委托.*.快照.类型',
              '记录.暂停委托.*.快照.类型', '绘马板.绘马.*.类型'}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def dump(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'


def once(text, old, new):
    if text.count(old) != 1:
        raise ValueError('Expected exactly one replacement: ' + old[:100])
    return text.replace(old, new, 1)


def declaration(text, name):
    return json.loads(re.search(r'^const ' + name + r' = (.*);$', text, re.M)[1])


def replace_declaration(text, name, value):
    old = re.search(r'^const ' + name + r' = (.*);$', text, re.M)[0]
    return once(text, old, 'const ' + name + ' = ' + json.dumps(value, ensure_ascii=False, separators=(',', ':')) + ';')


def build():
    manifest = json.loads((BASE / 'manifest.json').read_text())
    modules = {m['module_id']: m for m in manifest['modules']}
    for m in modules.values():
        if sha((ROOT.parent / m['path']).read_bytes()) != m['sha256']:
            raise ValueError('Baseline module hash mismatch: ' + m['path'])
    mvu = (ROOT.parent / modules['mvu']['path']).read_text()
    panels = (ROOT.parent / modules['panels']['path']).read_text()
    original_fields = declaration(mvu, 'ShrineFieldSpec')
    fields = copy.deepcopy(original_fields)
    config = declaration(mvu, 'ShrineConfig')
    stages = json.loads((INPUT / 'chapter-rules.json').read_text())
    if len(stages) != len(config['stages']):
        raise ValueError('Chapter count mismatch')
    # Keep costs, rewards, capacities, facilities, IDs and chapter ordering.
    for old, incoming in zip(config['stages'], stages):
        if {k:v for k,v in old.items() if k != 'types'} != {k:v for k,v in incoming.items() if k != 'types'}:
            raise ValueError('Incoming chapter changes more than type selection')
        old['types'] = incoming['types']
    new_types = list(dict.fromkeys(t for s in stages for t in s['types']))
    for row in fields:
        if row['path'] in TYPE_PATHS:
            row['enum'] = list(dict.fromkeys(row['enum'] + new_types))
    mvu = replace_declaration(mvu, 'ShrineFieldSpec', fields)
    mvu = replace_declaration(mvu, 'ShrineConfig', config)
    # Four Zod consumers: active, completed, paused, board. Keep legacy values.
    for old, new in zip(original_fields, fields):
        if old['path'] not in TYPE_PATHS:
            continue
        a = '"类型": z.enum(' + json.dumps(old['enum'], ensure_ascii=False) + ')'
        b = '"类型": z.enum(' + json.dumps(new['enum'], ensure_ascii=False) + ')'
        if a in mvu:
            mvu = mvu.replace(a, b)
    mvu = once(mvu, "const version = '1.30.1';", "const version = '1.48.1';")
    prompt = (INPUT / 'active-prompt.md').read_text()
    old_prompt = re.search(r'^const MikageQuestPrompt=(.*);$', panels, re.M)[0]
    panels = once(panels, old_prompt, 'const MikageQuestPrompt=' + json.dumps(prompt, ensure_ascii=False) + ';')
    panels = once(panels, "const version = '1.47.0';", "const version = '1.48.1';")
    card = json.loads((BASE / 'card-source.json').read_text())
    entries = card['data']['character_book']['entries']
    target = [e for e in entries if e['id'] == 34 and e['name'] == '绘马与委托规则']
    if len(target) != 1:
        raise ValueError('Ambiguous Ema entry identity')
    target[0]['content'] = (INPUT / 'ema-rules.md').read_text()
    # These are generated machine-facing dictionaries, not rewritten narrative.
    for entry_id in [1, 55]:
        entry = next(e for e in entries if e['id'] == entry_id)
        lines = entry['content'].splitlines(keepends=True)
        for old, new in zip(original_fields, fields):
            if old['path'] not in TYPE_PATHS:
                continue
            matches = [i for i,l in enumerate(lines) if l.startswith(old['path'] + ' |')]
            if entry_id == 1 and old['path'] != '委托.类型':
                if matches:
                    raise ValueError('Unexpected derived field in model dictionary')
                continue
            if len(matches) != 1:
                raise ValueError('Dictionary field missing: ' + old['path'])
            i = matches[0]
            lines[i] = once(lines[i], str(old['enum']), str(new['enum']))
        entry['content'] = ''.join(lines)
    next(e for e in entries if e['id'] == 56)['content'] = prompt
    card['character_version'] = card['data']['character_version'] = VERSION
    book = card['data']['character_book']
    book['description'] = re.sub(r'^v[\d.]+', 'v' + VERSION, book['description'], count=1)
    for m, body in [('mvu', mvu), ('panels', panels)]:
        modules[m].update(version=VERSION, path='mikage-shrine/releases/' + VERSION + '/' + m + '.mjs', sha256=sha(body.encode()))
    manifest.update(release=VERSION, source_name='1.48.1/card-source.json',
                    source_sha256=sha(dump(card).encode()), host_acceptance='pending',
                    worldbook_policy='1.48.1: entry 34 incoming narrative verbatim; entry 5 preserved; enum dictionaries and disabled prompt synchronized',
                    ema_integration={'incoming_copy':'verbatim', 'base_release':'1.48.0',
                      'backward_compatible_types':True, 'bound_worldbook':{'name':book['name'],'version':VERSION,'entry_id':34},
                      'inputs':{p.name:sha(p.read_bytes()) for p in sorted(INPUT.iterdir()) if p.is_file()}})
    return {'mvu.mjs':mvu, 'panels.mjs':panels, 'card-source.json':dump(card),
            'manifest.json':dump(manifest), 'field-spec.json':dump(fields)}


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    outputs = build()
    if not args.dry_run:
        destination = ROOT / 'releases' / VERSION
        for name in outputs:
            if (destination / name).exists():
                raise ValueError('Refusing to overwrite: ' + name)
        for name, text in outputs.items():
            (destination / name).write_text(text)
    print(dump({'dry_run':args.dry_run, 'release':VERSION,
                'files':{k:{'bytes':len(v.encode()),'sha256':sha(v.encode())} for k,v in outputs.items()}}))
