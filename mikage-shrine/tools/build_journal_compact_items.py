#!/usr/bin/env python3
"""Build the compact life-item lists from the released journal module."""

import argparse
import hashlib
import json
import re
from pathlib import Path

from build_wardrobe_gallery import ROOT, build_card, replace_once

BASE = ROOT / 'releases/1.49.51/modules/panels.mjs'
BASE_SHA256 = '3b6b7a6c5912e739f9d45904f0c6f0ec3ba13e1f48fe62c1c4db82c255321d21'
VERSION = '1.49.52'


def build_module():
    if hashlib.sha256(BASE.read_bytes()).hexdigest() != BASE_SHA256:
        raise ValueError('Unexpected base panel module')
    source = BASE.read_text()
    declaration = re.search(r'^const MikagePanelHTML=(.+);$', source, re.M)
    html = json.loads(declaration[1])
    css = (ROOT / 'src/journal/compact-items.css').read_text()
    html = replace_once(html, '</head>', '<style id="mikage-compact-items">\n' + css + '</style></head>')
    html = replace_once(html,
        "const e=make('article','life-card');if(id)e.append(sprite(id));",
        "const e=make('article',id?'life-card life-item-row':'life-card');if(id)e.append(sprite(id));")
    source = source[:declaration.start(1)] + json.dumps(html, ensure_ascii=False) + source[declaration.end(1):]
    return replace_once(source, "const version = '1.49.51';", f"const version = '{VERSION}';")


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
        args.card_output.write_text(build_card(args.card_source, args.module, args.commit, version=VERSION))
    else:
        args.module.parent.mkdir(parents=True, exist_ok=True)
        args.module.write_text(build_module())
