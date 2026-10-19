#!/usr/bin/env python3
"""Sample actual paint() CSS against atlas alpha; prove no neighbouring cells leak."""
from pathlib import Path
import subprocess,json,re,argparse
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
ap=argparse.ArgumentParser();ap.add_argument('release',nargs='?',default='1.30.1');ap.add_argument('--expect-bleed',action='store_true');args=ap.parse_args()
js=r'''
const fs=require('fs'),path=require('path'),{JSDOM}=require('/tmp/mikage-debug/node_modules/jsdom');
const source=fs.readFileSync(process.argv[1],'utf8'),catalog=JSON.parse(source.match(/const catalog=(.*);/)[1]);
const d=new JSDOM('',{runScripts:'outside-only',url:'https://fixture.invalid/'}),w=d.window;
w.Image=class{set src(url){queueMicrotask(()=>this.onload());}decode(){return Promise.resolve();}};
const a=source.indexOf('((host)=>{',source.indexOf('/* One immutable asset catalog')),b=source.indexOf('/* Tavern Helper adapter',a);w.eval(source.slice(a,b));
(async()=>{const api=w.MikageCharacterArt;await api.preloadWalk();const result=[];let basic=0;
for(const [actor,record]of Object.entries(catalog.actors))for(const item of record.outfits)for(const direction of Object.keys(catalog.directions))for(const frame of [0,1,3]){
 const el=w.document.createElement('span');api.paint(el,actor,item.id,direction,frame);const sprite=api.sprite(actor,item.id,direction,frame);
 if(sprite.fit)result.push({id:actor+'-'+item.id,...sprite,clip:el.style.clipPath,prefixedClip:el.style.webkitClipPath});else{if(el.style.clipPath)throw Error('Unexpected crop on legacy non-fit atlas');basic++;}
 api.paint(el,actor,record.default,direction,0);if(el.style.clipPath)throw Error('Crop retained after switching to ordinary atlas');
}
console.log(JSON.stringify({result,basic}));w.close();})().catch(e=>{console.error(e);process.exitCode=1});
'''
source=ROOT/'mikage-shrine/releases'/args.release/'scene.mjs'
data=json.loads(subprocess.check_output(['node','-e',js,str(source)],text=True));wrong=0;lost=0;samples=0
cache={}
for item in data['result']:
    atlas=item['atlas']
    if atlas not in cache:cache[atlas]=np.array(Image.open(ROOT/'mikage-shrine'/atlas).getchannel('A'))
    alpha=cache[atlas];H,W=alpha.shape;col,row=item['column'],item['row'];fit=item['fit'];box=fit['bounds'][row*item['columns']+col];scale=fit['height']/(box[3]-box[1]);clip=item['clip'];insets=[0,0,0,0]
    if clip:
        assert clip==item['prefixedClip'];insets=[float(x)/100 for x in re.findall(r'(-?[\d.]+)%',clip)];assert len(insets)==4
    elif not args.expect_bleed:raise AssertionError('Missing current-cell clip: '+item['id'])
    for size in [37,45,100]:
        y,x=np.indices((size,size));tx=(x+.5)/size;ty=(y+.5)/size
        sx=(tx-.5)/scale+(box[0]+box[2])/2+col;sy=(ty-fit['baseline'])/scale+box[3]+row
        px=np.floor(sx*W/item['columns']).astype(int);py=np.floor(sy*H/item['rows']).astype(int)
        valid=(px>=0)&(px<W)&(py>=0)&(py<H);a=np.zeros((size,size),dtype=np.uint8);yy,xx=np.where(valid);a[yy,xx]=alpha[py[yy,xx],px[yy,xx]]
        neighbour=(np.floor(sx)!=col)|(np.floor(sy)!=row);visible=(ty>=insets[0])&(tx<=1-insets[1])&(ty<=1-insets[2])&(tx>=insets[3])
        wrong+=int(np.sum(visible&neighbour&(a>100)));lost+=int(np.sum(~visible&~neighbour&(a>100)));samples+=1
if args.expect_bleed:
    assert wrong>0;print('PASS old atlas leakage reproduced:',wrong,'neighbour pixels across',samples,'size/frame samples')
else:
    assert wrong==0,(wrong,'neighbour pixels remain');assert lost==0,(lost,'own-cell pixels clipped');print('PASS',samples,'size/frame samples: zero neighbour pixels, zero own-cell pixel loss;',data['basic'],'non-fit poses retain original rendering')
