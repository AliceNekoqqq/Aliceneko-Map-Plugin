#!/usr/bin/env python3
"""Subset licensed Noto Serif SC for all map copy, with a standalone font coverage check."""
import argparse,json,hashlib,re
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parents[1]
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--source',type=Path,required=True);a=p.parse_args()
 files=['src/map-desk.js','tools/build_map_desk.py','releases/1.27.0/config.json']
 text=''.join((ROOT/f).read_text() for f in files)+'神域图卷巡游绘马衣橱生活第阶段已开放处此刻所在尚未开放神社本地前往计划目的地手帖此地散策回到场景走近发光的小图标就能体验抵达后这段位置未记录'
 packed=(ROOT/'releases/1.29.1/panels.mjs').read_text();panel=json.loads(re.search(r'const MikagePanelHTML=("(?:[^"\\]|\\.)*");',packed)[1]);text+=panel[panel.index('  function renderMap()'):panel.index('  function render() {',panel.index('  function renderMap()'))]
 wanted={ord(c) for c in text if ord(c)>=0x3000}|set(range(32,127))
 font=TTFont(a.source);cmap=font.getBestCmap();missing=wanted-set(cmap)
 if missing:raise ValueError('Source lacks '+''.join(chr(c) for c in sorted(missing)))
 opts=subset.Options();sub=subset.Subsetter(options=opts);sub.populate(unicodes=wanted);sub.subset(font);font.flavor=None
 dest=ROOT/'assets/ui/map-desk-v144-font.ttf';font.save(dest)
 spec={'family':'Mikage Map Desk','source':'@fontsource/noto-serif-sc@'+json.loads((a.source.parents[1]/'package.json').read_text())['version'],'source_url':'https://github.com/notofonts/noto-cjk','license':'SIL Open Font License 1.1','inputs':files,'codepoints':sorted(wanted),'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}
 (ROOT/'src/map-desk-font.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n')
 (ROOT/'assets/ui/map-desk-font-OFL.txt').write_text((a.source.parents[1]/'LICENSE').read_text())
 print(json.dumps({k:spec[k] for k in ['source','bytes','sha256']},ensure_ascii=False))
