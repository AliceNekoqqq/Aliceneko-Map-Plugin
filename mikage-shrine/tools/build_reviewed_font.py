"""Subset the existing Noto Serif SC source for approved copy and game glyphs."""
from pathlib import Path
import argparse,hashlib,json
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.varLib.instancer import instantiateVariableFont
ROOT=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser();ap.add_argument('--font-source',type=Path,required=True);ap.add_argument('--edits',type=Path,required=True);args=ap.parse_args()
edits=json.loads(args.edits.read_text());required=set(range(32,127))|{ord(c) for row in edits for c in row['new']}
fonts=[ROOT/'assets/activities'/name for name in ['school-v131-font.ttf','market-v132-font.ttf','plum-v133-font.ttf','dress-v134-font.ttf','wind-v135-font.ttf','stealth-v136-font.ttf','fox-v137-font.ttf']]+[ROOT/'assets/opening/minigames-v114-glyphs.ttf',ROOT/'assets/opening/title-font-0.ttf']
for file in fonts:required.update(TTFont(file).getBestCmap())
font=TTFont(args.font_source);assert not {c for c in required-set(font.getBestCmap()) if c>=0x3400}
font=instantiateVariableFont(font,{'wght':500},inplace=True);opts=subset.Options();opts.name_IDs=['*'];opts.name_legacy=True;opts.name_languages=['*'];opts.recalc_timestamp=False
sub=subset.Subsetter(options=opts);sub.populate(unicodes=required);sub.subset(font)
out=ROOT/'assets/ui/copy-reviewed-v1482.ttf';assert not out.exists();font.save(out)
meta={'file':'mikage-shrine/assets/ui/'+out.name,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'bytes':out.stat().st_size,'source_url':'https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf','source_sha256':hashlib.sha256(args.font_source.read_bytes()).hexdigest(),'weight':500,'glyphs':len(TTFont(out).getBestCmap()),'coverage':'all prior affected game font glyphs plus all 77 approved edits; no old asset overwritten','license':'mikage-shrine/assets/ui/shrine-serif-v145-OFL.txt'}
(ROOT/'assets/ui/copy-reviewed-v1482-font.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n');print(json.dumps(meta))
