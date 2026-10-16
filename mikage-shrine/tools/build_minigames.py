#!/usr/bin/env python3
"""Build the independently loaded minigame modal module."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'


def build():
    activity = (SRC / 'activities.js').read_text()
    activity, head_count = re.subn(r'\(function \(global\) \{', 'function createMikageActivities(global) {', activity, count=1)
    activity, tail_count = re.subn(r'\s*global\.MikageActivities=\{mount\};\s*\}\)\(window\);\s*$', '\n  return {mount};\n}', activity, count=1)
    if head_count != 1 or tail_count != 1:
        raise ValueError('Could not adapt the activity engine into a side-effect-free factory')
    art_path = SRC / 'activity-art.json'
    art = json.loads(art_path.read_text()) if art_path.exists() else {}
    font_manifest = json.loads((SRC / 'minigames-font-manifest.json').read_text())
    font_url = font_manifest.get('cdnUrl', '')
    template = (SRC / 'minigames-host.mjs').read_text()
    values = {
        '__MINIGAME_CSS__': json.dumps((SRC / 'activities.css').read_text() + '\n' + (SRC / 'minigames.css').read_text(), ensure_ascii=False).replace('</', r'<\/'),
        '__MINIGAME_ART__': json.dumps(art, ensure_ascii=False),
        '__MINIGAME_FONT_URL__': json.dumps(font_url),
        '__ACTIVITY_FACTORY__': activity,
    }
    for marker, value in values.items():
        if marker not in template:
            raise ValueError('Missing build marker: ' + marker)
        template = template.replace(marker, value, 1)
    if any(marker in template for marker in values):
        raise ValueError('Unresolved build marker in minigame module')
    out = ROOT / 'runtime/minigames.mjs'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(template)
    return out


if __name__ == '__main__':
    target = build()
    print(json.dumps({'file': str(target), 'bytes': target.stat().st_size, 'version': '1.13.0'}))
