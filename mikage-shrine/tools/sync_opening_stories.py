"""Project a versioned opening catalog into the existing HTML, scene and card."""
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
dump = lambda value: json.dumps(value, ensure_ascii=False, indent=2) + '\n'
sha = lambda data: hashlib.sha256(data).hexdigest()


def read_literal(text, marker):
    assert text.count(marker) == 1, marker
    start = text.index(marker) + len(marker)
    while text[start].isspace():
        start += 1
    value, size = json.JSONDecoder().raw_decode(text[start:])
    return value, start, start + size


def put(text, marker, value):
    _, start, end = read_literal(text, marker)
    encoded = json.dumps(value, ensure_ascii=False).replace('</', '<\\/')
    return text[:start] + encoded + text[end:]


def html_projection(text, stories):
    return put(text, 'window.OpeningStoryData=', stories)


def scene_projection(text, stories):
    html, _, _ = read_literal(text, 'const OpeningHTML=')
    text = put(text, 'const OpeningHTML=', html_projection(html, stories))
    return put(text, 'const OpeningStories=', stories)


def build(release):
    assert re.fullmatch(r'\d+\.\d+\.\d+', release), 'Explicit version required'
    target = ROOT / 'releases' / release
    plan = json.loads((target / 'plan.json').read_text())
    assert plan['version'] == release
    catalog = ROOT / plan['story_source']
    assert catalog.resolve().is_relative_to(target.resolve())
    assert sha(catalog.read_bytes()) == plan['stories_sha256']
    stories = json.loads(catalog.read_text())
    assert [x['id'] for x in stories] == ['opening-1', 'opening-2', 'opening-3']
    for story in stories:
        assert set(story) == {'id', 'title', 'subtitle', 'text'}
        assert all(isinstance(x, str) and x.strip() for x in story.values())
        assert story['text'].count('<StatusPlaceHolderImpl/>') == 1
        assert '{{user}}' in story['text']
    base = ROOT / 'releases' / plan['base']
    card = json.loads((base / 'card-source.json').read_text())
    spec = json.loads((base / 'manifest.json').read_text())
    for module in spec['modules']:
        assert sha((ROOT.parent / module['path']).read_bytes()) == module['sha256']
    projections = {'src/opening.html': html_projection, 'src/scene-host.mjs': scene_projection}
    outputs = {}
    for name, digest in plan['input_sha256'].items():
        path = ROOT / name
        assert path.resolve().is_relative_to(ROOT.resolve())
        if name not in projections:
            assert sha(path.read_bytes()) == digest, name
    for name, project in projections.items():
        current = (ROOT / name).read_text()
        expected = project(current, stories)
        assert sha(project(current, []).encode()) == plan['projection_skeleton_sha256'][name], name
        assert sha(current.encode()) == plan['input_sha256'][name] or current == expected, name
        outputs[ROOT / name] = expected
    scene = next(x for x in spec['modules'] if x['module_id'] == 'scene')
    old_scene = (ROOT.parent / scene['path']).read_text()
    new_scene = scene_projection(old_scene, stories)
    old_version = "const version = '" + scene['version'] + "';"
    assert new_scene.count(old_version) == 1
    new_scene = new_scene.replace(old_version, "const version = '" + release + "';", 1)
    assert scene_projection(new_scene, []).replace("const version = '" + release + "';", old_version, 1) == scene_projection(old_scene, [])
    outputs[target / 'scene.mjs'] = new_scene
    scene.update(version=release, path='mikage-shrine/releases/' + release + '/scene.mjs', sha256=sha(new_scene.encode()))
    assert len(card['data']['alternate_greetings']) == 2
    card['data']['alternate_greetings'] = [x['text'] for x in stories[1:]]
    card['character_version'] = card['data']['character_version'] = release
    book = card['data']['character_book']
    assert book['description'].count('v' + plan['base']) == 1
    book['description'] = book['description'].replace('v' + plan['base'], 'v' + release)
    outputs[target / 'card-source.json'] = dump(card)
    spec.update(release=release, source_name=release + '/card-source.json', source_sha256=sha(dump(card).encode()))
    spec['ema_integration']['bound_worldbook']['version'] = release
    spec['reviewed_copy']['preserved_worldbook_version'] = release
    spec['bound_worldbook'].update(source='mikage-shrine/releases/' + release + '/card-source.json', version=release, entry_sha256=sha(dump(book['entries']).encode()))
    spec['checkpoint'].update(base=plan['base'], plan='mikage-shrine/releases/' + release + '/plan.json', gate='source_iteration', gameplay='one opening catalog; preview/start/alternate greeting parity; state and runtime logic unchanged', packaging='not requested')
    spec['opening_content'] = {'source': plan['story_source'], 'sha256': plan['stories_sha256'], 'ids': [x['id'] for x in stories], 'alternate_ids': [x['id'] for x in stories[1:]], 'scene_module': scene['path'], 'first_mes': 'existing title-page marker; unchanged', 'real_host_and_model': 'pending'}
    outputs[target / 'manifest.json'] = dump(spec)
    return outputs


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--release', required=True)
    mode = parser.add_mutually_exclusive_group(required=True)
    for flag in ['dry-run', 'apply', 'check']:
        mode.add_argument('--' + flag, action='store_true')
    args = parser.parse_args()
    outputs = build(args.release)
    if args.apply:
        assert all(not p.exists() for p in outputs if p.parent.name == args.release), 'Fresh version outputs required'
        for path, text in outputs.items():
            path.write_text(text)
    if args.check:
        for path, text in outputs.items():
            assert path.read_text() == text, 'Projection differs: ' + str(path)
    print(dump({'mode': 'check' if args.check else 'apply' if args.apply else 'dry-run', 'outputs': {str(p.relative_to(ROOT)): {'bytes': len(s.encode()), 'sha256': sha(s.encode())} for p, s in outputs.items()}}))
