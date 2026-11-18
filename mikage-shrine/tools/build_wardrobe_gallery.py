#!/usr/bin/env python3
"""Build the wardrobe presentation update from the released panel module."""

import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'releases/1.49.39/modules/panels.mjs'
BASE_SHA256 = '437e8403a4885b3af0d31dcd11dab799069e0c1584728a585f53148910953ade'
VERSION = '1.49.44'
SCRIPT_ID = '86a49572-142e-5d86-af3f-2e96d2f8a244'


def replace_once(text, old, new):
    if text.count(old) != 1:
        raise ValueError('Expected one occurrence of ' + old[:100])
    return text.replace(old, new, 1)


def build_panel():
    if hashlib.sha256(BASE.read_bytes()).hexdigest() != BASE_SHA256:
        raise ValueError('Unexpected base panel module')
    source = BASE.read_text()
    declaration = re.search(r'^const MikagePanelHTML=(.+);$', source, re.M)
    html = json.loads(declaration[1])
    style = (ROOT / 'src/wardrobe/gallery.css').read_text()
    script = (ROOT / 'src/wardrobe/gallery.js').read_text()
    html = html.replace('</head>', '<style id="mikage-wardrobe-gallery">\n' + style + '</style></head>', 1)

    stage = next(line.strip() for line in html.splitlines() if '<div class="wardrobe-portrait-wrap">' in line)
    portrait = stage.split('</span>', 1)[0] + '</span></div>'
    html = replace_once(html, stage, portrait)
    thumb_start = html.index(' function outfitThumb(')
    thumb_end = html.index(' function wardrobe(', thumb_start)
    html = html[:thumb_start] + html[thumb_end:]
    html = replace_once(html, 'outfitThumb,wardrobe', 'wardrobe')
    html = replace_once(html,
        '      window.MikagePanelPresentation?.outfitThumb(thumb,art,wardrobeActor,outfitId);\n', '')
    html = replace_once(html, 'extras.append(body);preview.append(extras);',
        "extras.append(body);preview.parentElement.append(extras);")
    html = replace_once(html,
        '<span class="wardrobe-mini-label">庭院形象</span>', '')
    html = replace_once(html, "    const host = $('.wardrobe-preview');",
        "    const host = $('#wardrobe-dialog');")
    html = replace_once(html,
        '<span>衣装图册</span><span class="wardrobe-collection-count">',
        '<h3>衣装图册</h3><span class="wardrobe-collection-count">')
    html = replace_once(html, 'input:not(:disabled), select:not(:disabled)',
        'input:not(:disabled), select:not(:disabled), summary')
    start = html.index('<script>/* Transient dressing-room gestures')
    end = html.index('</script>', start)
    html = html[:start] + '<script>\n' + script + html[end:]
    source = source[:declaration.start(1)] + json.dumps(html, ensure_ascii=False) + source[declaration.end(1):]
    source = replace_once(source, "const version = '1.49.32';", f"const version = '{VERSION}';")
    return source


def build_card(source, module, commit, *, version=VERSION):
    if not re.fullmatch(r'[0-9a-f]{40}', commit):
        raise ValueError('A complete immutable Git commit is required')
    card = json.loads(source.read_text())
    scripts = card['data']['extensions']['tavern_helper']['scripts']
    script, = [item for item in scripts if item['id'] == SCRIPT_ID]
    for field in (card, card['data']):
        field['character_version'] = version
    script['name'] = re.sub(r' \d+\.\d+\.\d+ CDN$', f' {version} CDN', script['name'])
    loader = (ROOT / 'tools/loader-template.js').read_text()
    for key, value in {
        'COMMIT': commit,
        'SCRIPT_ID': 'panels',
        'MODULE_PATH': f'mikage-shrine/releases/{version}/modules/panels.mjs',
        'VERSION': version,
        'SHA256': hashlib.sha256(module.read_bytes()).hexdigest(),
        'LABEL': script['name'].split(' ')[0],
    }.items():
        loader = loader.replace(f'__{key}__', value)
    script['content'] = loader
    return json.dumps(card, ensure_ascii=False, indent=2) + '\n'


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
        args.card_output.write_text(build_card(args.card_source, args.module, args.commit))
    else:
        args.module.parent.mkdir(parents=True, exist_ok=True)
        args.module.write_text(build_panel())
