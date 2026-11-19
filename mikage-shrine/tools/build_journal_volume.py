#!/usr/bin/env python3
"""Assemble the shared journal cover and chapter layout around the released panel."""

import argparse
import hashlib
import json
import re
from pathlib import Path

from build_wardrobe_gallery import ROOT, build_card, replace_once

BASE = ROOT / 'releases/1.49.48/modules/panels.mjs'
BASE_SHA256 = '14ae1a228a8cc4391aec854549d5a9a05b7d1d9d4e3dee36796d28d23b17fd02'
VERSION = '1.49.49'


def build_module():
    if hashlib.sha256(BASE.read_bytes()).hexdigest() != BASE_SHA256:
        raise ValueError('Unexpected base panel module')
    source = BASE.read_text()
    declaration = re.search(r'^const MikagePanelHTML=(.+);$', source, re.M)
    html = json.loads(declaration[1])
    css = (ROOT / 'src/journal/volume.css').read_text()
    html = replace_once(html, '</head>', '<style id="mikage-journal-volume">\n' + css + '</style></head>')
    html = replace_once(html, '<nav class="experience-nav" aria-label="神社手帖">',
        '<div class="journal-volume">\n<nav class="experience-nav" aria-label="神社手帖">')
    html = replace_once(html, '  <div class="toast" id="toast"', '</div>\n  <div class="toast" id="toast"')
    html = replace_once(html, '<header class="ema-desk-header"><h2 id="board-title">',
        '<header class="journal-chapter"><h2 id="board-title">')
    bell = re.search(r'(data-ema-toy="bell" aria-label="轻摇狐铃">)(<svg.*?</svg>)</button>', html)
    if not bell:
        raise ValueError('Unexpected bell button')
    html = html[:bell.start(2)] + '铃' + html[bell.end(2):]
    chapter_headers = [
        ('<header class="map-desk-header"><h2 id="map-title" class="sr-only">神域图卷</h2></header>', 'map-title', '神域图卷'),
        ('<header class="life-desk-header"><div><h2 id="life-title">神社生活</h2><p>把日子，慢慢安放在檐下。</p></div></header>', 'life-title', '神社生活'),
        ('<header class="robe-header"><div><h2 id="wardrobe-title">御影更衣间</h2><p>挑一袭衣，共赴今日。</p></div></header>', 'wardrobe-title', '御影更衣间'),
        ('<header class="dialog-header journal-settings-header"><div class="header-copy"><h2 id="settings-title">心愿请求设置</h2></div></header>', 'settings-title', '心愿请求设置'),
    ]
    for original, heading_id, title in chapter_headers:
        html = replace_once(html, original, f'<header class="journal-chapter"><h2 id="{heading_id}">{title}</h2></header>')
    html = replace_once(html, '<header class="atlas-heading"><strong aria-hidden="true">神域图卷</strong></header>',
        '<p class="atlas-heading" title="当前所在地区"><strong id="journal-map-location"></strong></p>')
    html = replace_once(html, "    const location = String(mapState.当前地区 || 'R01');",
        "    const location = String(mapState.当前地区 || 'R01');\n    $('#journal-map-location').textContent = REGION_BY_ID.get(location)?.name || '';")
    html = replace_once(html, 'if(element.parentElement!==parent)parent.prepend(element);', '''if(element.parentElement!==parent){
        const heading=parent.querySelector('.journal-chapter');
        if(heading)heading.after(element);
        else parent.prepend(element);
      }''')
    source = source[:declaration.start(1)] + json.dumps(html, ensure_ascii=False) + source[declaration.end(1):]
    return replace_once(source, "const version = '1.49.48';", f"const version = '{VERSION}';")


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
