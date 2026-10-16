#!/usr/bin/env python3
"""Build the lightweight card from its original character data and pinned release."""
import argparse
import copy
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--card', type=Path, required=True)
    ap.add_argument('--commit', required=True)
    ap.add_argument('--output', type=Path, required=True)
    args = ap.parse_args()
    if not re.fullmatch('[0-9a-f]{40}', args.commit):
        raise ValueError('Use the complete immutable runtime commit')
    original = json.loads(args.card.read_text())
    card = copy.deepcopy(original)
    template = (ROOT / 'tools/loader-template.js').read_text()
    ids = ['mvu', 'panels', 'scene']
    labels = ['御影神社·MVU', '御影神社·绘马与地图', '御影神社·治愈散策']
    for i, script in enumerate(card['data']['extensions']['tavern_helper']['scripts']):
        code = template
        replacements = {'__COMMIT__': args.commit, '__SCRIPT_ID__': ids[i],
            '__MODULE_PATH__': 'mikage-shrine/runtime/' + ids[i] + '.mjs',
            '__VERSION__': '1.8.1', '__LABEL__': labels[i]}
        for before, after in replacements.items():
            code = code.replace(before, after)
        script['content'] = code
        script['name'] = labels[i] + ' 1.8.1 CDN'
        script['info'] = '固定远程版本1.8.1；保留内部0.6.0接口。十地地面寻路、图标互动、散策小玩法与手帖。网络失败后可重新加载资源，无需重复导入独立脚本。'
        script['button']['enabled'] = True
        script['button']['buttons'] = [b for b in script['button']['buttons'] if b['name'] != '重新加载资源'] + [{'name': '重新加载资源', 'visible': True}]
        script['export_with']['button'] = True
    card['data']['character_version'] = '1.8.1'
    note = '\n\n【1.8.1 治愈散策版】十地按原图地面寻路，小图标高亮提示互动。庭前拾叶、等猫靠近、三色团子、折舟引流、票根盖章、海风明信片、林间叶拓、萤火回应、太鼓三拍与灯笼配色。完成后可收进临时散策小记，主动带入对话草稿。角色资料、开场白、世界书与原有存档规则保留。运行脚本、47张图片和5份字体由AliceNekoqqq/Aliceneko-Map-Plugin固定版本远程提供，首次使用需联网。'
    card['data']['creator_notes'] = card['data'].get('creator_notes', '') + note
    card['creatorcomment'] = card.get('creatorcomment', '') + note
    assert card['data']['character_book'] == original['data']['character_book']
    for key in ['description', 'personality', 'scenario', 'first_mes', 'mes_example', 'alternate_greetings', 'system_prompt', 'post_history_instructions']:
        assert card['data'][key] == original['data'][key], key
    out = json.dumps(card, ensure_ascii=False, indent=2) + '\n'
    assert ';base64,' not in out
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(out)
    print(json.dumps({'file': str(args.output), 'bytes': len(out.encode()), 'version': '1.8.1'}))

if __name__ == '__main__':
    main()
