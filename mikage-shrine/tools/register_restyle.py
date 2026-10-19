#!/usr/bin/env python3
"""Measure approved restyle PNGs and register immutable references; never edit pixels."""
import argparse,json,re,hashlib
from pathlib import Path
from PIL import Image
import numpy as np
from scipy.ndimage import label,find_objects
ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'assets/wardrobe/restyle-v130'
IDS=['tomoe-chibi','tomoe-kariginu','tomoe-butler','tomoe-wedding','player-kagura','player-shiromuku','player-gym','player-heian-travel']
def largest(a):
 labels,n=label(a>100);assert n;counts=np.bincount(labels.ravel());counts[0]=0;sl=find_objects(labels)[counts.argmax()-1];return list(map(int,[sl[1].start,sl[0].start,sl[1].stop,sl[0].stop]))
def measure():
 records=[];portraits=[]
 for id in IDS:
  for kind in ['portrait','sprites']:
   p=ASSETS/(id+'-'+kind+'.png');im=Image.open(p);assert im.mode=='RGBA';a=np.asarray(im.getchannel('A'));assert a.min()==0 and a.max()>200
   e={'id':id,'kind':kind,'path':p.relative_to(ROOT).as_posix(),'width':im.width,'height':im.height,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
   if kind=='portrait':
    assert im.size==(1024,1536);e['alphaBounds']=largest(a);portraits.append({'id':id,'portrait':{'alphaBounds':e['alphaBounds'],'width':im.width,'height':im.height}})
   else:
    assert abs(im.width/im.height-4/3)<.005;bounds=[]
    for row in range(3):
     for col in range(4):
      x0,x1=round(col*im.width/4),round((col+1)*im.width/4);y0,y1=round(row*im.height/3),round((row+1)*im.height/3);cw,ch=x1-x0,y1-y0;b=largest(a[y0:y1,x0:x1]);assert b[0]>0 and b[1]>0 and b[2]<cw and b[3]<ch,(id,row,col,b)
      bounds.append([round(b[0]/cw,6),round(b[1]/ch,6),round(b[2]/cw,6),round(b[3]/ch,6)])
    e['cellBounds']=bounds
   records.append(e)
 return records,portraits

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--asset-commit');args=ap.parse_args();records,portraits=measure()
 if args.asset_commit:
  assert re.fullmatch('[0-9a-f]{40}',args.asset_commit)
  by={(e['id'],e['kind']):e for e in records}
  paths=[ROOT/'src/scene-host.mjs',ROOT/'releases/1.30.0/scene.mjs']
  for p in paths:
   text=p.read_text();match=re.search(r'const catalog=(.*);',text);catalog=json.loads(match[1])
   for id in IDS:
    actor,outfit=id.split('-',1);item=next(x for x in catalog['actors'][actor]['outfits'] if x['id']==outfit);portrait=by[(id,'portrait')];sprite=by[(id,'sprites')];b=portrait['alphaBounds'].copy()
    if id=='tomoe-chibi':b[1]=b[3]-2*(b[3]-b[1])
    item['portrait']=portrait['path'];item['portraitMetrics']={'width':portrait['width'],'height':portrait['height'],'bounds':b};item['spriteSheet']={'atlas':sprite['path'],'columns':4,'rows':3,'standingRow':0,'walkRows':[1,2],'fit':{'height':.72 if id=='tomoe-chibi' else .88,'baseline':.94,'bounds':sprite['cellBounds']}}
    for e in [portrait,sprite]:catalog['assets'][e['path']]='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@'+args.asset_commit+'/mikage-shrine/'+e['path']
   catalog['portraitLayout']['maxAspect']=max((x['portraitMetrics']['bounds'][2]-x['portraitMetrics']['bounds'][0])/(x['portraitMetrics']['bounds'][3]-x['portraitMetrics']['bounds'][1]) for a in catalog['actors'].values() for x in a['outfits'])
   catalog['fingerprint']='mikage-1.30.0-'+args.asset_commit[:16]
   text=text[:match.start(1)]+json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+text[match.end(1):];p.write_text(text)
 else:
  (ASSETS/'provenance.json').write_text(json.dumps({'version':'1.30.0','method':'ImageGen edits using original portraits/school sprites; PNG pixels preserved unchanged; fractional CSS cells supported','assets':records},ensure_ascii=False,indent=2)+'\n')
  (ROOT/'assets/wardrobe/v130-portraits.json').write_text(json.dumps({'version':'1.30.0','portraits':portraits},ensure_ascii=False,indent=2)+'\n')
  p=ROOT/'asset-manifest.json';manifest=json.loads(p.read_text());manifest=[x for x in manifest if not x['path'].startswith('assets/wardrobe/restyle-v130/')];manifest.extend({k:e[k] for k in ['path','sha256','bytes']} for e in records);p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 print('PASS 8 portraits / 96 in-cell sprite components; no pixel edits')
if __name__=='__main__':main()
