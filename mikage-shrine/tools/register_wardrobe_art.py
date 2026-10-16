#!/usr/bin/env python3
"""Register generated assets without modifying image pixels; compute CSS placement."""
import json,re,hashlib,argparse
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import label,find_objects
ROOT=Path(__file__).resolve().parent.parent
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--asset-commit',required=True);args=ap.parse_args()
    if not re.fullmatch('[0-9a-f]{40}',args.asset_commit):raise ValueError('Use an immutable full asset commit')
    p=ROOT/'src/scene-host.mjs';s=p.read_text();m=re.search(r'const catalog=',s);catalog,n=json.JSONDecoder().raw_decode(s[m.end():])
    qs=json.loads((ROOT/'src/wardrobe-quests.json').read_text());portraits=json.loads((ROOT/'assets/wardrobe/v110-portraits.json').read_text());new=[]
    for r in portraits:
        actor,outfit=r['id'].split('-',1);definition=next(o for q in qs for o in q['outfits'] if o['actor']==actor and o['id']==outfit)
        sprite='assets/wardrobe/unlocks/'+r['id']+'-sprites.png';im=Image.open(ROOT/sprite);pixels=np.asarray(im.getchannel('A'));h,w=pixels.shape;boxes=[]
        for row in range(3):
            for col in range(4):
                x0,x1=round(col*w/4),round((col+1)*w/4);y0,y1=round(row*h/3),round((row+1)*h/3)
                lab,num=label(pixels[y0:y1,x0:x1]>100);counts=np.bincount(lab.ravel());counts[0]=0;sl=find_objects(lab)[counts.argmax()-1]
                boxes.append([round(sl[1].start/(x1-x0),6),round(sl[0].start/(y1-y0),6),round(sl[1].stop/(x1-x0),6),round(sl[0].stop/(y1-y0),6)])
        item={'id':outfit,'name':definition['name'],'portrait':r['asset'],'spriteSheet':{'atlas':sprite,'columns':4,'rows':3,'standingRow':0,'walkRows':[1,2],'fit':{'height':.88,'baseline':.94,'bounds':boxes}},'portraitMetrics':r['metrics']}
        if definition.get('variantOf'):item['variantOf']=definition['variantOf']
        catalog['actors'][actor]['outfits']=[o for o in catalog['actors'][actor]['outfits'] if o['id']!=outfit]+[item]
        for a in [r['asset'],sprite]:catalog['assets'][a]='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@'+args.asset_commit+'/mikage-shrine/'+a
        new.append(item)
    font=json.loads((ROOT/'src/wardrobe-font-manifest.json').read_text())
    catalog['fontFallbacks']=[f for f in catalog['fontFallbacks'] if f['file']!=font['file']]+[font]
    catalog['assets'][font['file']]='https://cdn.jsdelivr.net/gh/AliceNekoqqq/Aliceneko-Map-Plugin@'+args.asset_commit+'/mikage-shrine/'+font['file']
    catalog['version']='1.10.0';catalog['fingerprint']='mikage-1.10.0-'+hashlib.sha256(json.dumps([new,font,args.asset_commit],sort_keys=True).encode()).hexdigest()[:16]
    s=s[:m.end()]+json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+s[m.end()+n:]
    s=s.replace('rows:sheet.rows,frame:requested};','rows:sheet.rows,frame:requested,fit:sheet.fit};')
    anchor="    element.style.imageRendering='pixelated';"
    if 'spriteFrame.fit' not in s:
        s=s.replace(anchor,"""    if(spriteFrame.fit){
      const fit=spriteFrame.fit,box=fit.bounds[spriteFrame.row*spriteFrame.columns+spriteFrame.column];
      if(box){const scale=fit.height/(box[3]-box[1]),x=(.5-(box[0]+box[2])/2*scale-spriteFrame.column*scale)/(1-spriteFrame.columns*scale)*100,y=(fit.baseline-box[3]*scale-spriteFrame.row*scale)/(1-spriteFrame.rows*scale)*100;
        element.style.backgroundSize=(spriteFrame.columns*scale*100)+'% '+(spriteFrame.rows*scale*100)+'%';element.style.backgroundPosition=x+'% '+y+'%';
      }
    }
"""+anchor)
    p.write_text(s);print(json.dumps({'newAppearances':len(new),'assets':len(new)*2,'catalogVersion':catalog['version']}))
if __name__=='__main__':main()
