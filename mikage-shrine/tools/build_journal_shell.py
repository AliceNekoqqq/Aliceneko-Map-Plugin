#!/usr/bin/env python3
"""Refresh the shared journal window from the verified wardrobe release."""

import argparse
import hashlib
import json
import re
from pathlib import Path

import build_wardrobe_gallery as delivery
from build_wardrobe_gallery import ROOT, replace_once

BASE = ROOT / 'releases/1.49.44/modules/panels.mjs'
BASE_SHA256 = 'ee33e1e24612e7edcf6138efdeff9766eb284c5e57e0a3ecb7f976c7ce4f21a4'
VERSION = '1.49.45'
CLOSE = (
    '<button class="journal-close" type="button" data-close="button" aria-label="关闭御影手帖">'
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" '
    'stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>'
)


def build_panel():
    if hashlib.sha256(BASE.read_bytes()).hexdigest() != BASE_SHA256:
        raise ValueError('Unexpected journal base module')
    source = BASE.read_text()
    declaration = re.search(r'^const MikagePanelHTML=(.+);$', source, re.M)
    html = json.loads(declaration[1])
    css = (ROOT / 'src/journal/shell.css').read_text()
    html = replace_once(html, '</head>', '<style id="mikage-journal-shell">\n' + css + '</style></head>')
    html = replace_once(html, '<span>御影手帖<small>MIKAGE JOURNAL</small></span>', '<span>御影手帖</span>')
    html = replace_once(html, '</div></nav>\n  <div class="dialog-layer"', '</div>' + CLOSE + '</nav>\n  <div class="dialog-layer"')
    old_closes = (
        '收起绘马板', '关闭请求设置', '收起神域图卷', '收起神社生活', '收起衣柜',
    )
    for label in old_closes:
        html = replace_once(html,
            '<button class="close-button" type="button" data-close="button" aria-label="' + label + '">×</button>', '')
    html = replace_once(html,
        "    document.body.classList.add('dialog-open');",
        "    document.body.classList.add('dialog-open');\n    window.scrollTo(0, 0);")
    source = source[:declaration.start(1)] + json.dumps(html, ensure_ascii=False) + source[declaration.end(1):]
    source = replace_once(source, "const version = '1.49.44';", f"const version = '{VERSION}';")
    start = source.index('  function applyPanelLayout(){')
    end = source.index('  function watchViewport(){', start)
    return source[:start] + (ROOT / 'src/journal/window-layout.js').read_text() + source[end:]


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
        args.card_output.write_text(delivery.build_card(
            args.card_source, args.module, args.commit, version=VERSION))
    else:
        args.module.parent.mkdir(parents=True, exist_ok=True)
        args.module.write_text(build_panel())
