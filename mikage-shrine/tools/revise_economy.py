"""Derive the bounded economy iteration from its pinned source manifest."""
import argparse, copy, hashlib, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'releases/1.49.2'
dump = lambda x: json.dumps(x, ensure_ascii=False, indent=2) + '\n'
compact = lambda x: json.dumps(x, ensure_ascii=False, separators=(',', ':'))
sha = lambda x: hashlib.sha256(x.encode()).hexdigest()

def once(text, old, new):
    assert text.count(old) == 1, (old[:80], text.count(old))
    return text.replace(old, new, 1)

def build():
    plan = json.loads((OUT / 'plan.json').read_text())
    base = ROOT / 'releases' / plan['base']
    spec = json.loads((base / 'manifest.json').read_text())
    mods = {m['module_id']: m for m in spec['modules']}
    def load(id):
        text = (ROOT.parent / mods[id]['path']).read_text()
        assert sha(text) == mods[id]['sha256']
        return text
    mvu, panel = load('mvu'), load('panels')
    main = json.loads(re.search(r'^const ShrineConfig = (.*);$', mvu, re.M)[1])
    life = json.loads(re.search(r'^  const config = (.*);$', mvu, re.M)[1])
    oldlife = copy.deepcopy(life)
    for row in life['shop']:
        row['units'] = plan['units'].get(row['item'], 1)
    mvu = once(mvu, '  const config = ' + compact(oldlife) + ';', '  const config = ' + compact(life) + ';')
    mvu = once(mvu, 'item: row.item, price: row.price, available:', 'item: row.item, price: row.price, units: row.units, available:')
    mvu = once(mvu, 'add(payload.item, payload.quantity); next.购入', 'add(payload.item, payload.quantity * row.units); next.购入')
    mvu = once(mvu, '${itemName(payload.item)}×${payload.quantity}', '${itemName(payload.item)}×${payload.quantity * row.units}（${payload.quantity}包/件）')
    old = '''      for (const [resource, amount] of Object.entries(expected.spend)) {
        if (candidate.神社[resource] !== previous.神社[resource] - amount) fail('采购资源扣账不一致');
      }'''
    new = '''      const amount = expected.spend.奉纳 || 0;
      if (candidate.神社.奉纳 !== previous.神社.奉纳 - amount) fail('生活操作奉纳扣账须与实际采购一致');
      if (amount) candidate.记录.资源流水.push({编号:event.编号+'-奉纳',事件编号:event.编号,
        资源:'奉纳',变动:-amount,来源:expected.event.来源,
        方式:'生活采购:'+payload.item+'×'+payload.quantity,天数:candidate.环境.天数});'''
    mvu = once(mvu, old, new)
    match = re.search(r'const MikagePanelHTML=("(?:[^"\\]|\\.)*");', panel)
    html = json.loads(match[1])
    html = once(html, "'奉纳 '+s.price+' · 每次购买一份'", "'奉纳 '+s.price+' · '+(s.units>1?'每包 '+s.units+' 份':'每次一件')+' · 今日余量 '+s.available+(s.units>1?' 包':' 件')")
    html = once(html, "button(s.canBuy?'购买':'需到店且有可用余款'", "button(s.canBuy?(s.units>1?'购买一包':'购买一件'):'需到店且有可用余款'")
    panel = panel[:match.start(1)] + json.dumps(html, ensure_ascii=False) + panel[match.end(1):]
    card = json.loads((base / 'card-source.json').read_text())
    assert sha(dump(card)) == spec['source_sha256']
    entries = card['data']['character_book']['entries']
    oldcost = '''      - 鸟居=木4石2
      - 参道=木1石3良木3陶瓦2
      - 拜殿=良木3陶瓦2朱砂4灵绢3奉纳3
      - 社务所=灵木4月石3朱砂3奉纳5
      - 庭院=灵木8月石6灵绢5奉纳8。按阶段开放设施
      - 须有足够资源，不临时改价。'''
    newcost = '\n'.join('      - ' + st['facility'] + '=' + ''.join(k + str(n) for k,n in st['cost'].items()) for st in main['stages'])
    newcost += '\n      - 设施按阶段开放；成本沿当前配置，开工时由领域脚本一次扣款并记入资源流水。'
    for id in [1]:
        entry = next(e for e in entries if e['id'] == id)
        entry['content'] = once(entry['content'], oldcost, newcost)
    entry = next(e for e in entries if e['id'] == 11)
    entry['content'] += '\n<life_shop_packages>\n生活采购按当前目录标明的每包份量交付，显示的奉纳价格对应整包或整件。成交时由脚本同步扣款、增加实际份数并记录资源流水。正文沿成交事实与库存展开，日常取用遵循原有生活互动规则。\n</life_shop_packages>'
    card['character_version'] = card['data']['character_version'] = plan['version']
    book = card['data']['character_book']
    book['description'] = book['description'].replace('v' + plan['base'], 'v' + plan['version'])
    outputs = {'card-source.json': dump(card), 'life-config.json': dump(life), 'wardrobe-panel.html': html}
    for id, text in [('mvu', mvu), ('panels', panel)]:
        text = once(text, "const version = '" + mods[id]['version'] + "';", "const version = '" + plan['version'] + "';")
        outputs[id + '.mjs'] = text
        mods[id].update(version=plan['version'], path='mikage-shrine/releases/' + plan['version'] + '/' + id + '.mjs', sha256=sha(text))
    spec.update(release=plan['version'], source_name=plan['version'] + '/card-source.json', source_sha256=sha(outputs['card-source.json']))
    spec['ema_integration']['bound_worldbook']['version'] = plan['version']
    spec['reviewed_copy']['preserved_worldbook_version'] = plan['version']
    spec['economy_iteration'] = {'base': plan['base'], 'plan': 'mikage-shrine/releases/1.49.2/plan.json', 'gate': 'source_iteration', 'packaging': 'not requested', 'life_config': 'mikage-shrine/releases/1.49.2/life-config.json'}
    outputs['manifest.json'] = dump(spec)
    return outputs

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    outputs = build()
    if not args.dry_run:
        assert not any((OUT / name).exists() for name in outputs), 'Use fresh output files'
        for name, text in outputs.items():
            (OUT / name).write_text(text)
    print(dump({'dry_run': args.dry_run, 'outputs': {name: {'bytes': len(text.encode()), 'sha256': sha(text)} for name,text in outputs.items()}}))
