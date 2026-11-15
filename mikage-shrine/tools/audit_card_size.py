#!/usr/bin/env python3
"""Inspect card size without printing card text, script bodies or asset payloads."""
import argparse
import json
import re
from pathlib import Path


def audit(path, max_card_kib=512, max_script_kib=16):
    raw = path.read_bytes()
    card = json.loads(raw)
    data = card.get('data', card)
    leaves = []

    def walk(value, pointer=''):
        if isinstance(value, dict):
            for key, child in value.items():
                key = str(key).replace('~', '~0').replace('/', '~1')
                walk(child, pointer + '/' + key)
        elif isinstance(value, list):
            for index, child in enumerate(value):
                walk(child, pointer + '/' + str(index))
        elif isinstance(value, str):
            leaves.append({'pointer': pointer, 'bytes': len(value.encode('utf-8'))})

    walk(card)
    issues = []
    if len(raw) > max_card_kib * 1024:
        issues.append('card_exceeds_byte_budget')
    scripts = data.get('extensions', {}).get('tavern_helper', {}).get('scripts', [])
    sizes = []
    for index, script in enumerate(scripts):
        content = script.get('content', '')
        size = len(content.encode('utf-8'))
        sizes.append({'index': index, 'bytes': size})
        if size > max_script_kib * 1024:
            issues.append('script_%d_exceeds_byte_budget' % index)
    if re.search(rb'data:[^;,\s"]+;base64,', raw, re.I):
        issues.append('embedded_base64_payload')
    return {'file': path.name, 'bytes': len(raw),
            'budgets_kib': {'card': max_card_kib, 'script': max_script_kib},
            'scripts': sizes, 'largest_fields': sorted(leaves, key=lambda x: x['bytes'], reverse=True)[:6],
            'issues': issues}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('card', type=Path)
    parser.add_argument('--max-card-kib', type=int, default=512)
    parser.add_argument('--max-script-kib', type=int, default=16)
    parser.add_argument('--strict', action='store_true')
    args = parser.parse_args()
    try:
        result = audit(args.card, args.max_card_kib, args.max_script_kib)
    except (OSError, ValueError, TypeError, AttributeError):
        print(json.dumps({'error': 'unreadable_or_invalid_card'}))
        return 2
    print(json.dumps(result, ensure_ascii=True, separators=(',', ':')))
    return int(args.strict and bool(result['issues']))


if __name__ == '__main__':
    raise SystemExit(main())
