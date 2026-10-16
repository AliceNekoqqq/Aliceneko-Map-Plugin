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
    from wardrobe_worldbook import update
    card = update(card)
    template = (ROOT / 'tools/loader-template.js').read_text()
    ids = ['mvu', 'panels', 'scene']
    labels = ['御影神社·MVU', '御影神社·绘马与地图', '御影神社·衣装与散策']
    for i, script in enumerate(card['data']['extensions']['tavern_helper']['scripts']):
        code = template
        replacements = {'__COMMIT__': args.commit, '__SCRIPT_ID__': ids[i],
            '__MODULE_PATH__': 'mikage-shrine/runtime/' + ids[i] + '.mjs',
            '__VERSION__': '1.10.0', '__LABEL__': labels[i]}
        for before, after in replacements.items():
            code = code.replace(before, after)
        script['content'] = code
        script['name'] = labels[i] + ' 1.10.0 CDN'
        script['info'] = '固定远程版本1.10.0；保留内部0.6.0接口。新增五套衣装、DK人间伪装、四条衣装支线；十地三时景与散策保留。网络失败后可重新加载资源，无需重复导入独立脚本。'
        script['button']['enabled'] = True
        script['button']['buttons'] = [b for b in script['button']['buttons'] if b['name'] != '重新加载资源'] + [{'name': '重新加载资源', 'visible': True}]
        script['export_with']['button'] = True
    card['data']['character_version'] = '1.10.0'
    note = '\n\n【1.10.0 樱坂衣装版】新增巴卫野狐旧影、绀夜归途、檐下薄雪及双人JK樱坂晴日/DK樱坂薄暮，共五套与DK人间伪装差分。五套均有立绘、四向站立和两组行走帧，人物可见高度、居中与脚底基线统一。衣柜可预览解锁来源并主动悬挂四条固定衣装支线；达到原有章节/设施条件后接取，无需衣装生成API，暂停/恢复与永久收藏沿用存档规则。普通绘马结案给予原有材料回礼；校服双人同步解锁，解锁不自动换衣，DK可显露狐耳或人间伪装。保留十地三时景与旧存档，既有主线无需重玩。真实SillyTavern模型演出与插件顺序仍需实机验收。'
    card['data']['creator_notes'] = card['data'].get('creator_notes', '') + note
    card['creatorcomment'] = card.get('creatorcomment', '') + note
    assert len(card['data']['character_book']['entries']) == len(original['data']['character_book']['entries']) + 1
    for key in ['description', 'personality', 'scenario', 'first_mes', 'mes_example', 'alternate_greetings', 'system_prompt', 'post_history_instructions']:
        assert card['data'][key] == original['data'][key], key
    out = json.dumps(card, ensure_ascii=False, indent=2) + '\n'
    assert ';base64,' not in out
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(out)
    print(json.dumps({'file': str(args.output), 'bytes': len(out.encode()), 'version': '1.10.0'}))

if __name__ == '__main__':
    main()
