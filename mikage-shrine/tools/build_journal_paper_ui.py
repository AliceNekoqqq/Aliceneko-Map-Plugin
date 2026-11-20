#!/usr/bin/env python3
"""Apply the paper-craft theme to the released journal interface."""

import argparse
import hashlib
import json
import re
from pathlib import Path

from build_wardrobe_gallery import ROOT, build_card, replace_once

BASE = ROOT / 'releases/1.49.49/modules/panels.mjs'
BASE_SHA256 = '0b0c42eb8925c733a6a06f0e974d9c72ae656f08f8f093a7e26fbc848e991450'
VERSION = '1.49.50'
ASSET_COMMIT = '511aac4c4360d8371cb9ff8ba772b0b361b1f4c2'
ART_URL = ('https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@' +
           ASSET_COMMIT + '/mikage-shrine/assets/ui/journal-paper-cover.webp')


def build_module():
    if hashlib.sha256(BASE.read_bytes()).hexdigest() != BASE_SHA256:
        raise ValueError('Unexpected base panel module')
    source = BASE.read_text()
    declaration = re.search(r'^const MikagePanelHTML=(.+);$', source, re.M)
    html = json.loads(declaration[1])
    css = replace_once((ROOT / 'src/journal/paper-craft.css').read_text(), '__PAPER_COVER__', ART_URL)
    html = replace_once(html, '</head>', '<style id="mikage-journal-paper">\n' + css + '</style></head>')
    nav = re.search(r'<div class="nav-pages">(.+?)</div>', html, re.S)
    if not nav:
        raise ValueError('Journal navigation not found')
    start, end = nav.span(1)
    buttons, count = re.subn(r'(<svg\b.*?</svg>)', r'<span class="paper-nav-icon" aria-hidden="true">\1</span>', html[start:end], flags=re.S)
    if count != 4:
        raise ValueError('Unexpected chapter navigation')
    html = html[:start] + buttons + html[end:]
    source = source[:declaration.start(1)] + json.dumps(html, ensure_ascii=False) + source[declaration.end(1):]
    return replace_once(source, "const version = '1.49.49';", f"const version = '{VERSION}';")


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
        args.card_output.write_text(build_card(args.card_source,args.module,args.commit,version=VERSION))
    else:
        args.module.parent.mkdir(parents=True,exist_ok=True)
        args.module.write_text(build_module())
