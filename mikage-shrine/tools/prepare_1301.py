#!/usr/bin/env python3
"""Prepare 1.30.1 from immutable 1.30.0 inputs; preserve all unrelated card data."""
from pathlib import Path
import copy,hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
def replace_once(text,old,new):
    if text.count(old)!=1:raise ValueError('Expected exactly one patch anchor: '+old[:80])
    return text.replace(old,new,1)
def main():
    release=ROOT/'releases/1.30.1'
    if release.exists():raise ValueError('Refusing to overwrite existing release')
    # F1: retry only the existing dependency bootstrap, never the domain/listener setup.
    mvu=(ROOT/'releases/1.29.1/mvu.mjs').read_text()
    mvu=replace_once(mvu,"const version = '1.29.0';","const version = '1.30.1';")
    mvu=replace_once(mvu,'function start() {','let resumeMvuInitialization=null;\nfunction start() {\nif(resumeMvuInitialization)return resumeMvuInitialization();')
    mvu=replace_once(mvu,'void (async()=>{','let startupPromise=null,bootstrapCommitted=false;\nresumeMvuInitialization=()=>{\n  if(startupPromise)return startupPromise;\n  startupPromise=(async()=>{\n  ShrineBootstrapState=\'loading\';ShrineBootstrapError=null;')
    mvu=replace_once(mvu,'  ShrineCard.installZodSchema(Schema);','  bootstrapCommitted=true;\n  ShrineCard.installZodSchema(Schema);')
    mvu=replace_once(mvu,"  ShrineBootstrapError=error?.message||String(error);ShrineBootstrapState='error';dispatchShrineMvuStatus();", "  const retryable=!bootstrapCommitted;\n  ShrineBootstrapError=error?.message||String(error);ShrineBootstrapState='error';dispatchShrineMvuStatus();")
    tail="\n});\n\n}\n\nexport {VERSION,SCRIPT_ID,start};"
    mvu=replace_once(mvu,tail,"\n  const failure=new Error(ShrineBootstrapError);\n  if(retryable){startupPromise=null;failure.mikageRetryableStart=true;}\n  throw failure;\n});\n  return startupPromise;\n};\nreturn resumeMvuInitialization();\n\n}\n\nexport {VERSION,SCRIPT_ID,start};")
    # F3: clip to the transformed cell as well as the sprite's outer viewport.
    old="    if(spriteFrame.fit){\n      const fit=spriteFrame.fit,box=fit.bounds[spriteFrame.row*spriteFrame.columns+spriteFrame.column];"
    new="    element.style.clipPath='';element.style.webkitClipPath='';\n"+old
    old_fit="        element.style.backgroundSize=(spriteFrame.columns*scale*100)+'% '+(spriteFrame.rows*scale*100)+'%';element.style.backgroundPosition=x+'% '+y+'%';"
    new_fit=old_fit+"\n        const left=.5-(box[0]+box[2])/2*scale,top=fit.baseline-box[3]*scale;\n        const inset=[top,1-left-scale,1-top-scale,left].map(value=>Math.max(0,value)*100+'%');\n        const clip='inset('+inset.join(' ')+')';\n        element.style.clipPath=clip;element.style.webkitClipPath=clip;"
    def scene_patch(text):
        text=replace_once(text,"rendererRevision='1.30.0'","rendererRevision='1.30.1'")
        text=replace_once(text,old,new)
        return replace_once(text,old_fit,new_fit)
    scene=scene_patch((ROOT/'releases/1.30.0/scene.mjs').read_text())
    scene=replace_once(scene,"const version = '1.30.0';","const version = '1.30.1';")
    maintained_scene=(ROOT/'src/scene-host.mjs').read_text()
    if "rendererRevision='1.30.1'" in maintained_scene:
        if new_fit not in maintained_scene:raise ValueError('Maintained scene has incomplete 1.30.1 patch')
    else:
        maintained_scene=scene_patch(maintained_scene)
    # F2: derive just the two model-facing enumerations from the runtime spec.
    spec=json.loads(re.search(r'const ShrineFieldSpec = (.*);',mvu)[1])
    card=json.loads((ROOT/'releases/1.30.0/card-source.json').read_text())
    entry=next(e for e in card['data']['character_book']['entries'] if e['id']==1)
    for field in ['玩家.衣装','巴卫.服装']:
        values=next(f['enum'] for f in spec if f['path']==field)
        pattern=re.compile(r'(^'+re.escape(field)+r' \| string )\[[^\n]*?\]',re.M)
        content,count=pattern.subn(lambda match:match[1]+repr(values),entry['content'])
        if count!=1:raise ValueError('Field enum anchor mismatch '+field)
        entry['content']=content
    card['character_version']=card['data']['character_version']='1.30.1'
    for script in card['data']['extensions']['tavern_helper']['scripts']:
        if script['id']=='272c672c-6eed-5524-9d0b-1823b056fff4':
            script['name']='御影神社·MVU 1.30.1 CDN';script['info']='1.30.1：内部依赖失败可安全重试，成功后不重复初始化；保留既有变量与存档。'
        if script['id']=='f763b9d7-c17c-5f0f-b0bd-36d9f37a3383':
            script['name']='御影神社·衣装与散策 1.30.1 CDN';script['info']='1.30.1：修复图集相邻帧露边；保持31套衣装、原图与轻量固定Git加载。'
    manifest=json.loads((ROOT/'releases/1.30.0/manifest.json').read_text())
    manifest['release']='1.30.1';manifest['source_name']='1.30.0/card-source.json';manifest['source_sha256']=hashlib.sha256((ROOT/'releases/1.30.0/card-source.json').read_bytes()).hexdigest()
    for module in manifest['modules']:
        if module['module_id'] in ['mvu','scene']:
            module['version']='1.30.1';module['path']='mikage-shrine/releases/1.30.1/'+module['module_id']+'.mjs'
            module['sha256']=hashlib.sha256((mvu if module['module_id']=='mvu' else scene).encode()).hexdigest()
    manifest['worldbook_policy']='Only ID1 player/Tomoe outfit enumerations synchronized to runtime schema; all other entries byte-identical'
    manifest['deferred']='R06 and other incomplete minigame adaptations carried over from previous handoff; unchanged by explicit user scope'
    release.mkdir()
    for name,text in [('mvu.mjs',mvu),('scene.mjs',scene),('card-source.json',json.dumps(card,ensure_ascii=False,indent=2)+'\n'),('manifest.json',json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')]:
        (release/name).write_text(text)
    (ROOT/'src/scene-host.mjs').write_text(maintained_scene)
    print('Prepared 1.30.1: two enum lines, MVU bootstrap retry, sprite-cell clipping; minigames unchanged')
if __name__=='__main__':main()
