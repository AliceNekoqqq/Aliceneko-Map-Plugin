#!/usr/bin/env python3
"""Subset the R03 text from the documented Noto Serif SC source; no runtime dependency."""
from pathlib import Path
import argparse,hashlib,json
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
ROOT=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser();ap.add_argument('--font-source',type=Path,required=True);args=ap.parse_args()
source=args.font_source;required=set(range(32,127))|{ord(c)for p in (ROOT/'src/market').glob('*')if p.suffix in ['.js','.css']for c in p.read_text()if ord(c)>127};required|={0x2190,0x2192}
ui=(ROOT/'releases/1.32.0/minigames.mjs').read_text();ui=ui[ui.index('const SCENES ='):];required|={ord(c)for c in ui if ord(c)>127};
font=TTFont(source);missing={x for x in required-set(font.getBestCmap())if x>=0x3400};assert not missing,missing
font=instantiateVariableFont(font,{'wght':500},inplace=True);options=subset.Options();options.name_IDs=['*'];options.name_legacy=True;options.name_languages=['*'];options.recalc_timestamp=False
subsetter=subset.Subsetter(options=options);subsetter.populate(unicodes=required);subsetter.subset(font)
out=ROOT/'assets/activities/market-v132-font.ttf';font.save(out)
manifest={'source_url':'https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf','source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'font_path':out.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'bytes':out.stat().st_size,'weight':500,'glyphs':len(TTFont(out).getBestCmap()),'license':'assets/activities/market-v132-font-OFL.txt'}
(ROOT/'src/market/font-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print(json.dumps(manifest))
