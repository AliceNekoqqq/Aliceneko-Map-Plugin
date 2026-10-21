"""Create a small licensed supplement for WQ09 and the economy additions."""
import argparse, hashlib, json, re
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
ROOT=Path(__file__).resolve().parents[1]
SOURCE_HASH='050080d9255a86808f2945bffac582b31ef32bc36411ce29563b4961670c66f9'
def build(source):
    assert hashlib.sha256(source.read_bytes()).hexdigest()==SOURCE_HASH
    module=(ROOT/'releases/1.49.3/mvu.mjs').read_text()
    cfg=json.loads(re.search(r'^const ShrineConfig = (.*);$',module,re.M)[1])
    quest=next(x for x in cfg['wardrobeQuests'] if x['id']=='WQ09')
    reward=next(x for x in cfg['wardrobeRewards'] if x['id']=='UW-KOZUCHI')
    quest_text=json.dumps([quest,reward],ensure_ascii=False)
    paths=['releases/1.49.3/life-config.json','src/economy-buyback-domain.js','src/economy-buyback-ui.js']
    text=quest_text+''.join((ROOT/p).read_text() for p in paths)+'额外奉纳单次上限为今日额外奉纳额度不足生活操作奉纳扣账须与实际收支一致'
    html=(ROOT/'releases/1.49.3/wardrobe-panel.html').read_text()
    active=sorted(set(re.findall(r'mikage-shrine/(assets/[^"\s)]+\.ttf)',html)))
    covered=set()
    for name in active:
        f=TTFont(ROOT/name);covered.update(f.getBestCmap());f.close()
    required={ord(c) for c in text if '\u3400'<=c<='\u9fff'}-covered
    quest_missing={ord(c) for c in quest_text if '\u3400'<=c<='\u9fff'}-covered
    font=TTFont(source);assert required<=set(font.getBestCmap())
    font=instantiateVariableFont(font,{'wght':500},inplace=True);font.recalcTimestamp=False
    opts=subset.Options();opts.name_IDs=['*'];opts.name_legacy=True;opts.name_languages=['*'];opts.recalc_timestamp=False
    sub=subset.Subsetter(options=opts);sub.populate(unicodes=required);sub.subset(font)
    import io
    target=io.BytesIO();font.save(target);data=target.getvalue()
    meta={'file':'mikage-shrine/assets/ui/economy-kozuchi-v1494.ttf','sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'source_url':'https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf','source_sha256':SOURCE_HASH,'weight':500,'license':'mikage-shrine/assets/ui/shrine-serif-v145-OFL.txt','codepoints':sorted(required),'characters':''.join(map(chr,sorted(required))),'WQ09_preexisting_gaps':len(quest_missing),'baseline_TTFs':active,'coverage_inputs':['releases/1.49.3/mvu.mjs:WQ09 and UW-KOZUCHI',*paths],'unicode_range':','.join('U+'+format(c,'X') for c in sorted(required)),'policy':'append supplement to existing face; preserve every prior font and approved edit'}
    return data,meta
if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--font-source',type=Path,required=True);ap.add_argument('--dry-run',action='store_true');args=ap.parse_args()
    data,meta=build(args.font_source);out=ROOT/'assets/ui/economy-kozuchi-v1494.ttf';record=out.with_name('economy-kozuchi-v1494-font.json')
    assert not out.exists() and not record.exists(),'Fresh output files required'
    if not args.dry_run:out.write_bytes(data);record.write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'dry_run':args.dry_run,**meta},ensure_ascii=False))
