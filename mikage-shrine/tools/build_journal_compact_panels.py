#!/usr/bin/env python3
"""Build the compact journal home, map, board, wardrobe and guide."""

import argparse
import hashlib
import json
import re
from pathlib import Path

from build_wardrobe_gallery import ROOT, build_card, replace_once

BASE = ROOT / 'releases/1.49.52/modules/panels.mjs'
BASE_SHA256 = 'dadb10efe6ce3a1ee007c8b27ff9ee851c7853e1c2554d67a4b47fa98700d219'
VERSION = '1.49.53'

ARCHIVE = '<button type="button" class="panel-paper-button" data-panel-archive="">任务档案</button>'
COUNT = '<span id="panel-ema-count"></span>'
PATCHES = [
    (
        '<summary>心愿请求与类别</summary>',
        '<summary>绘马工具' + COUNT + '</summary>',
    ),
    (
        '<div id="panel-ema-focus"></div></details>',
        '<div id="panel-ema-focus"></div>' + ARCHIVE + '</details>',
    ),
    ('<div class="panel-board-caption">' + COUNT + ARCHIVE + '</div>', ''),
    (
        "  const summary = doc.createElement('summary');\n  const steps",
        "  const summary = doc.createElement('summary');\n"
        "  const title = doc.createElement('span');\n"
        "  const quick = doc.createElement('span');\n"
        "  quick.className = 'guide-quick';\n"
        "  summary.append(title, quick);\n"
        "  const steps",
    ),
    (
        "        summary.textContent = '玩法说明 · ' + entry[0];",
        "        title.textContent = '玩法说明 · ' + entry[0];\n"
        "        quick.textContent = seen.has(id) ? '' : entry[1];",
    ),
    ('        element.open = !seen.has(id);', '        element.open = false;'),
    (
        "const card = $('#place-card');\n    card.replaceChildren();",
        "const card = $('#place-card');\n"
        "    const showDetails = card.dataset.region === id && card.querySelector('.place-details')?.open;\n"
        "    card.dataset.region = id;\n"
        "    card.replaceChildren();\n"
        "    const overview = make('div', 'place-overview'), copy = make('div', 'place-overview-copy');\n"
        "    const details = make('details', 'place-details');\n"
        "    details.open = !!showDetails;\n"
        "    details.append(make('summary', '', '风景与散策'));\n"
        "    card.append(overview, details);",
    ),
    (
        "art.setAttribute('aria-label',region.name+'风景示意');card.append(art);",
        "art.setAttribute('aria-label',region.name+'风景示意');details.append(art);",
    ),
    (
        "card.append(make('span', 'place-code', String(mapState.当前地区||'R01')===id?"
        "'此刻所在':openRegions.includes(id)?'已开放 · 目的地':'尚未开放'), make('h3', '', region.name),"
        " make('p', '', region.description), make('span', 'place-stage', region.stageLabel + ' · ' + openLabel));",
        "copy.append(make('span', 'place-code', String(mapState.当前地区||'R01')===id?'此刻所在':openLabel),"
        " make('h3', '', region.name), make('span', 'place-stage', region.stageLabel));\n"
        "    details.append(make('p', '', region.description));",
    ),
    ('    card.append(travel);', '    overview.append(copy, travel);'),
    ('box.append(mark,body);card.append(box,', 'box.append(mark,body);details.append(box,'),
    ('    card.append(roster);', '    details.append(roster);'),
    (
        '<p id="wardrobe-look-source"></p></div>',
        '<p id="wardrobe-look-source"></p><p class="wardrobe-current" id="wardrobe-current" hidden></p></div>',
    ),
    ('      <div class="wardrobe-actions"><span class="wardrobe-current" id="wardrobe-current">当前服装：未记录</span></div>\n', ''),
    (
        "        copy.append(make('span', 'outfit-worn', '未获得 · 仅预览'));\n"
        "        copy.append(make('span', 'outfit-lock-source', rewardDetails(reward)));",
        "        copy.append(make('span', 'outfit-worn', '仅预览'));",
    ),
    (
        "      } else {\n        copy.append(make('span', 'outfit-worn', worn ? '已穿' : '点选即更换'));",
        "      } else if (worn) {\n        copy.append(make('span', 'outfit-worn', '已穿'));",
    ),
    (
        "    if (currentLabel) currentLabel.textContent = '当前服装：' + (outfits.find(item => item && String(item.id) === current)?.name || current);",
        "    if (currentLabel) {\n"
        "      currentLabel.hidden = preview === current;\n"
        "      currentLabel.textContent = '当前穿着：' + (outfits.find(item => item && String(item.id) === current)?.name || current);\n"
        "    }",
    ),
]


def build_module():
    if hashlib.sha256(BASE.read_bytes()).hexdigest() != BASE_SHA256:
        raise ValueError('Unexpected base panel module')
    source = BASE.read_text()
    declaration = re.search(r'^const MikagePanelHTML=(.+);$', source, re.M)
    html = json.loads(declaration[1])
    css = (ROOT / 'src/journal/compact-panels.css').read_text()
    html = replace_once(html, '</head>', '<style id="mikage-compact-panels">\n' + css + '</style></head>')
    for old, new in PATCHES:
        html = replace_once(html, old, new)
    source = source[:declaration.start(1)] + json.dumps(html, ensure_ascii=False) + source[declaration.end(1):]
    return replace_once(source, "const version = '1.49.52';", f"const version = '{VERSION}';")


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
