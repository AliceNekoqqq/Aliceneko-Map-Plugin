#!/usr/bin/env python3
"""Build the corrected tea animation from the deployed minigames module."""

import argparse
import hashlib
import json
import re
from pathlib import Path

from build_wardrobe_gallery import ROOT, build_card, replace_once

BASE = ROOT / 'releases/1.49.39/modules/minigames.mjs'
BASE_SHA256 = '45a18be123a2f9ad6a6fbda9c3d6163686dcc29d932ed330757aaa2cec7b8e1d'
VERSION = '1.49.46'
MINIGAMES_ID = 'd3560ad0-892c-4b31-b783-11f80a23b90f'


def build_module():
    if hashlib.sha256(BASE.read_bytes()).hexdigest() != BASE_SHA256:
        raise ValueError('Unexpected minigames module')
    source = BASE.read_text()
    style = re.search(r'^const GAME_CSS = (.+);$', source, re.M)
    css = json.loads(style[1])
    css, count = re.subn(
        r'\.tea-pot\.pouring\{[^}]+\}|(?:\.tea-stage\[data-pour=[^\]]+\] )?\.tea-stream\{[^}]+\}', '', css)
    if count != 4:
        raise ValueError('Unexpected number of old tea motion rules')
    css += '\n' + (ROOT / 'src/tea/pour-visual.css').read_text()
    source = source[:style.start(1)] + json.dumps(css, ensure_ascii=False) + source[style.end(1):]

    mount = 'function mountMikageTea(host,container,options={}){'
    visual = (ROOT / 'src/tea/pour-visual.js').read_text()
    source = replace_once(source, mount, visual + '\n' + mount)
    source = replace_once(source,
        "pot.append(picture('tea-pot'));const steam",
        "const potImage=picture('tea-pot');pot.append(potImage);const steam")
    source = replace_once(source,
        "const stream=node('div','tea-stream');stage.append(stove,fire,pot,steam,stream);",
        """const svg=(tag,cls)=>{const element=doc.createElementNS('http://www.w3.org/2000/svg',tag);element.setAttribute('class',cls);return element;};
 const stream=svg('svg','tea-flow'),ribbon=svg('path','tea-flow-ribbon'),glint=svg('path','tea-flow-glint');
 stream.setAttribute('aria-hidden','true');stream.append(ribbon,glint);stage.append(stove,fire,pot,steam,stream);""")
    source = replace_once(source, 'return {button:b,liquid,label};});', 'return {button:b,image:img,liquid,label};});')
    source = replace_once(source,
        " const temperature=node('div','tea-temperature')",
        """ const pourVisual=createTeaPourVisual(host,stage,pot,potImage,cups,stream,ribbon,glint);
 let sipTimer=0,sipCup=-1;
 function stopSip(){host.clearTimeout(sipTimer);sipTimer=0;sipCup=-1;}
 function showSip(cup){
  stopSip();
  sipCup=cup;
  sipTimer=host.setTimeout(()=>{stopSip();sync();},520);
 }
 const temperature=node('div','tea-temperature')""")
    source = replace_once(source, 'function release(){M.off(s);', 'function release(){stopSip();M.off(s);')
    source = replace_once(source, 'e.preventDefault();holding=b;start();', 'e.preventDefault();stopSip();holding=b;start();')
    source = replace_once(source, "pot.classList.toggle('pouring',s.pour>=0);", 'pourVisual.show(s.pour>=0?s.pour:sipCup);')
    source = replace_once(source, 's.cups[i]=Math.min(100,s.cups[i]+8);sync();',
        's.cups[i]=Math.min(100,s.cups[i]+8);showSip(i);sync();')
    source = replace_once(source, 'phase();return {dispose(){if(disposed)return;release();disposed=true;',
        'phase();return {dispose(){if(disposed)return;release();pourVisual.dispose();disposed=true;')
    return replace_once(source, "const version = '1.48.3';", f"const version = '{VERSION}';")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--module', required=True, type=Path)
    parser.add_argument('--card-source', type=Path)
    parser.add_argument('--card-output', type=Path)
    parser.add_argument('--commit')
    args = parser.parse_args()
    if any([args.card_source, args.card_output, args.commit]):
        if not all([args.card_source, args.card_output, args.commit]):
            parser.error('--card-source, --card-output and --commit are required together')
        args.card_output.write_text(build_card(args.card_source, args.module, args.commit,
            version=VERSION, script_id=MINIGAMES_ID, module_id='minigames'))
    else:
        args.module.parent.mkdir(parents=True, exist_ok=True)
        args.module.write_text(build_module())
