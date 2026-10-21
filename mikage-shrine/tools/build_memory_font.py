"""Retain the existing Noto Serif SC face and cover the restored memory book."""
import argparse,hashlib,json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.varLib.instancer import instantiateVariableFont
root=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--font-source',type=Path,required=True);args=ap.parse_args()
source_hash=hashlib.sha256(args.font_source.read_bytes()).hexdigest()
assert source_hash=='050080d9255a86808f2945bffac582b31ef32bc36411ce29563b4961670c66f9'
text=(root/'releases/1.48.2/minigames.mjs').read_text();begin=text.index('const MEMORY_ITEMS');end=text.index('    const replay=button(',begin)
required=set(TTFont(root/'assets/ui/copy-reviewed-v1482.ttf').getBestCmap())|{ord(c) for c in text[begin:end]}|{ord(c) for c in '暂停或完成散策后可打开回忆册真实测试记录旧版海边电车记录保留原事实'}
required={c for c in required if c>=32}
font=TTFont(args.font_source);assert not {c for c in required-set(font.getBestCmap()) if 0x3400<=c<=0x9fff}
font=instantiateVariableFont(font,{'wght':500},inplace=True)
options=subset.Options();options.name_IDs=['*'];options.name_legacy=True;options.name_languages=['*'];options.recalc_timestamp=False
sub=subset.Subsetter(options=options);sub.populate(unicodes=required);sub.subset(font)
out=root/'assets/ui/memory-book-v1483.ttf';assert not out.exists();font.save(out)
meta={'file':'mikage-shrine/assets/ui/'+out.name,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'bytes':out.stat().st_size,'source_url':'https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf','source_sha256':source_hash,'weight':500,'glyphs':len(font.getBestCmap()),'coverage':'restored memory book labels and all original narratives plus prior approved-copy glyphs','license':'mikage-shrine/assets/ui/shrine-serif-v145-OFL.txt'}
(root/'assets/ui/memory-book-v1483-font.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n');print(json.dumps(meta))
