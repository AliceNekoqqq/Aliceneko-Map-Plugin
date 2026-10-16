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
    scripts = card['data']['extensions']['tavern_helper']['scripts']
    if len(scripts) != 3:
        raise ValueError('Build from the three-loader 1.10 base card')
    ids = ['mvu', 'panels', 'scene']
    labels = ['御影神社·MVU', '御影神社·绘马与地图', '御影神社·衣装与散策']
    for i, script in enumerate(card['data']['extensions']['tavern_helper']['scripts']):
        code = template
        replacements = {'__COMMIT__': args.commit, '__SCRIPT_ID__': ids[i],
            '__MODULE_PATH__': 'mikage-shrine/runtime/' + ids[i] + '.mjs',
            '__VERSION__': '1.11.0', '__LABEL__': labels[i]}
        for before, after in replacements.items():
            code = code.replace(before, after)
        script['content'] = code
        script['name'] = labels[i] + ' 1.11.0 CDN'
        script['info'] = '固定远程版本1.11.0；保留内部0.6.0接口。状态栏负责角色漫游与地图入口，独立小游戏由第四个远程脚本按需弹出。图片与字库远程加载；网络失败后可重新加载资源，无需重复导入独立脚本。'
        script['button']['enabled'] = True
        script['button']['buttons'] = [b for b in script['button']['buttons'] if b['name'] != '重新加载资源'] + [{'name': '重新加载资源', 'visible': True}]
        script['export_with']['button'] = True
    game_script = copy.deepcopy(scripts[2])
    game_script['id'] = 'd3560ad0-892c-4b31-b783-11f80a23b90f'
    game_script['name'] = '御影神社·独立小游戏 1.13.0 CDN'
    game_script['content'] = template
    replacements = {'__COMMIT__': args.commit, '__SCRIPT_ID__': 'minigames',
        '__MODULE_PATH__': 'mikage-shrine/runtime/minigames.mjs',
        '__VERSION__': '1.13.0', '__LABEL__': '御影神社·独立小游戏'}
    for before, after in replacements.items():
        game_script['content'] = game_script['content'].replace(before, after)
    game_script['info'] = '独立加载的散策小游戏插件。地图内点击互动点后，在独立弹窗中先查看专属场景与玩法提示，再进入完整游戏；弹窗样式与酒馆页面隔离，关闭后回到原地图。1.13.0升级团子手作、旅票规划、叶拓涂印、萤火记忆、太鼓跟奏和灯路布置。角色卡只保存约5KB的固定版本加载器，游戏源码、样式与图片存放在仓库并按需加载。网络失败后可点“重新加载资源”。'
    game_script['button']['enabled'] = True
    game_script['button']['buttons'] = [{'name': '重新加载资源', 'visible': True}]
    game_script['export_with']['button'] = True
    scripts.append(game_script)
    card['data']['character_version'] = '1.13.0'
    note = '\n\n【1.10.0 樱坂衣装版】新增巴卫野狐旧影、绀夜归途、檐下薄雪及双人JK樱坂晴日/DK樱坂薄暮，共五套与DK人间伪装差分。五套均有立绘、四向站立和两组行走帧，人物可见高度、居中与脚底基线统一。衣柜可预览解锁来源并主动悬挂四条固定衣装支线；达到原有章节/设施条件后接取，无需衣装生成API，暂停/恢复与永久收藏沿用存档规则。普通绘马结案给予原有材料回礼；校服双人同步解锁，解锁不自动换衣，DK可显露狐耳或人间伪装。保留十地三时景与旧存档，既有主线无需重玩。真实SillyTavern模型演出与插件顺序仍需实机验收。'
    note += '\n\n【1.11.0 十地互动升级版】十张地图各自增加可变化的选择与结果：庭院拾叶受风向影响，住宅区可按猫的节奏相处，团子可选蘸料，纸舟会依船形调整水路，旅行票根可规划停靠，临海站台可制作明信片，林间叶拓跟随线索完成，萤火顺序随观察方式变化，太鼓可选节奏或自由合奏，灯阵可自选布局与配色。神社、住宅庭院、溪流与海滨新增四张场景图，并为猫咪绘制透明立绘；插画与补充字库按需加载。触控按钮至少44像素，支持键盘操作与减少动态效果设置。小游戏不增加MVU根状态、货币或好感，完成记录沿用当前页面会话的散策手帖。\n\n素材生成提示、来源和版本记录见 assets/activities/imagegen-brief-v1.json。\n'
    note += '\n【1.12.0 独立散策舞台版】散策小游戏拆为第四个酒馆助手远程脚本，点击地图互动点后打开独立全屏弹窗，状态栏只保留地图与入口，不再随游戏向下扩展。弹窗先展示场景、玩法提示和无倒计时/可重试规则，再进入活动；视觉样式由 Shadow DOM 隔离，支持键盘关闭、焦点返回、触控与减少动态效果。保留十地原有玩法及手帖结果；R04 纸舟追加三道水门的 Canvas 拖动闯关，并保留按钮路线操作。卡片仍只保存四个约5KB加载器，互动引擎与独立弹窗样式放在仓库按需载入。\n'
    note += '\n【1.13.0 第二批小游戏体验升级】为六个互动点新增专属预绘场景：R03团子、R05旅票、R07叶拓、R08萤火、R09太鼓、R10灯阵。玩法分别加入三阶段团子手作与逐颗调火、规划三站旅行并逐站盖印、循线索找叶后在画布亲手涂印、两段递增的萤火记忆、三段四拍太鼓跟奏、可调整布局与灯色的六盏灯路。全程无倒计时并可重试；叶拓和太鼓使用Canvas操作面板，其他交互由HTML/CSS呈现，SVG只用于少量图标，不把小游戏做成SVG画面。场景画与小游戏代码按需从仓库加载，角色卡仍只保存四个约5KB固定版本加载器。实机SillyTavern加载顺序仍需玩家导入后验收。\n'
    card['creatorcomment'] = card.get('creatorcomment', '') + note
    assert len(card['data']['character_book']['entries']) == len(original['data']['character_book']['entries']) + 1
    for key in ['description', 'personality', 'scenario', 'first_mes', 'mes_example', 'alternate_greetings', 'system_prompt', 'post_history_instructions']:
        assert card['data'][key] == original['data'][key], key
    out = json.dumps(card, ensure_ascii=False, indent=2) + '\n'
    assert ';base64,' not in out
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(out)
    print(json.dumps({'file': str(args.output), 'bytes': len(out.encode()), 'version': '1.13.0'}))

if __name__ == '__main__':
    main()
