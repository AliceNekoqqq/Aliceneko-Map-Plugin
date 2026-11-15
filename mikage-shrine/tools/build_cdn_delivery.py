#!/usr/bin/env python3
"""Compose a delivery release from exact pinned modules, asset mappings and bounded compatibility patches."""
import argparse,copy,hashlib,json,re
from pathlib import Path

REPO='AliceNekoqqq/Aliceneko-Map-Plugin'
URL=re.compile(r'(https://(?:cdn|testingcf|fastly)\.jsdelivr\.net/gh/'+re.escape(REPO)+r'@)([0-9a-f]{40})/([^\s"\x27<>`\\]+)')
ROOT=Path(__file__).resolve().parents[2]
def sha(b):return hashlib.sha256(b).hexdigest()
def build(args):
    args.out=args.out.resolve()
    args.out.relative_to(ROOT)
    source=args.source.read_bytes();card=json.loads(source)
    assets=json.loads(args.assets.read_text());inventory=json.loads(args.inventory.read_text())
    mapping={(x['ref'],x['path']):x for x in assets['mapping']}
    targets={(x['commit'],x['targetPath']):x for x in assets['mapping']}
    files={};modules=[];by_path={x['path']:x for x in inventory}
    def identify(match,lookup):
        key=(match[2],match[3].split('?')[0]);entry=lookup.get(key)
        if not entry:raise ValueError('Unmapped asset URL: '+match[0])
        return entry
    def replace(match):
        entry=identify(match,mapping);suffix=('?'+match[3].split('?',1)[1])if'?'in match[3]else''
        return match[1]+entry['commit']+'/'+entry['targetPath']+suffix
    def canonical(text,lookup):
        return URL.sub(lambda m:'asset:'+identify(m,lookup)['blob'],text)
    for script in card['data']['extensions']['tavern_helper']['scripts']:
        content=script['content']
        module_id=re.search(r"scriptId: '([^']+)'",content)[1]
        version=re.search(r"version: '([^']+)'",content)[1]
        old_path=re.search(r"modulePath: '([^']+)'",content)[1]
        ref=re.search(r"commit: '([^']+)'",content)[1]
        metadata=by_path[old_path]
        raw=(args.module_cache/old_path).read_bytes()
        if metadata['commit']!=ref or sha(raw)!=metadata['sha256']:raise ValueError('Pinned module drift: '+old_path)
        text=raw.decode();updated=URL.sub(replace,text)
        if canonical(text,mapping)!=canonical(updated,targets):raise ValueError('Changes outside asset URLs: '+old_path)
        compatibility=[]
        if module_id=='scene':
            fresh=r'/^\s*<MikageOpeningScreen\/>\s*(?:<StatusPlaceHolderImpl\/>\s*)?$/.test(row.message)'
            patches=[
                ('if(row.message===marker)return row;','if('+fresh+')return {...row,message:marker};'),
                ('const {id,swipe,row}=selected;if(!Number.isInteger(id)',
                 'const {id,swipe,row}=selected;if('+fresh+')continue;if(!Number.isInteger(id)'),
                ("const version = '"+version+"';","const version = '"+args.version+"';"),
            ]
            before=updated
            for old,new in patches:
                if updated.count(old)!=1:raise ValueError('Opening compatibility anchor drift: '+old)
                updated=updated.replace(old,new,1)
            restored=updated
            for old,new in reversed(patches):restored=restored.replace(new,old,1)
            if restored!=before:raise ValueError('Opening patch changed unrelated code')
            version=args.version;compatibility=['allow-optional-opening-status-marker','defer-statusbar-until-opening-completes']
        if re.search(r"(?:from|import)\s*\(?\s*['\"]\.",updated):raise ValueError('Relative import incompatible with verified Blob fallback')
        result=updated.encode();rel=f'modules/{module_id}.mjs';files[rel]=result
        module_path=(args.out/rel).relative_to(ROOT).as_posix()
        modules.append({'module_id':module_id,'script_id':script['id'],'path':module_path,'version':version,
                        'sha256':sha(result),'git_blob':hashlib.sha1(b'blob '+str(len(result)).encode()+b'\0'+result).hexdigest(),
                        'bytes':len(result),'asset_url_replacements':len(URL.findall(text)),
                        'compatibility_patches':compatibility,
                        'source':{'commit':ref,'path':old_path,'sha256':metadata['sha256']}})
    if sum(m['bytes']for m in modules)>4*1024*1024:raise ValueError('Runtime snapshot budget exceeded')
    manifest={'release':args.version,'source_card_sha256':sha(source),'source_card_path':'authoring/current-card.json',
              'loader_template':'mikage-shrine/tools/loader-template.js','modules':modules,
              'asset_groups':assets['groups'],'asset_refs_preserved':True,'transport_only':False,
              'scope':'asset URL delivery plus two bounded opening-marker compatibility guards',
              'runtime_snapshot_bytes':sum(m['bytes']for m in modules)}
    files['manifest.json']=(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode()
    files['assets-map.json']=(json.dumps(assets,ensure_ascii=False,indent=2)+'\n').encode()
    card=copy.deepcopy(card);card['character_version']=args.version;card['data']['character_version']=args.version
    files['card-source.json']=(json.dumps(card,ensure_ascii=False,indent=2)+'\n').encode()
    if args.out.exists():raise ValueError('Refusing to replace existing release directory')
    if not args.dry_run:
        args.out.mkdir(parents=True)
        for name,body in files.items():
            path=args.out/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(body)
    print(json.dumps({'dry_run':args.dry_run,'output':str(args.out),'runtime_bytes':manifest['runtime_snapshot_bytes'],
                      'module_ids':[m['module_id']for m in modules],'files':len(files),
                      'asset_url_replacements':sum(m['asset_url_replacements']for m in modules)},ensure_ascii=False))
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source',type=Path,required=True);p.add_argument('--assets',type=Path,required=True)
    p.add_argument('--inventory',type=Path,required=True);p.add_argument('--module-cache',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True);p.add_argument('--version',required=True);p.add_argument('--dry-run',action='store_true')
    build(p.parse_args())
if __name__=='__main__':main()
