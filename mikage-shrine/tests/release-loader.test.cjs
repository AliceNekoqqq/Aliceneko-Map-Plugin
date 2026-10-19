const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {pathToFileURL} = require('node:url');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const release = path.join(root, 'mikage-shrine/releases/1.29.1');
const manifest = JSON.parse(fs.readFileSync(path.join(release, 'manifest.json')));
const card = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const original = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const tick = () => new Promise(resolve => setImmediate(resolve));
const sha = data => crypto.createHash('sha256').update(data).digest('hex');

(async () => {
  assert.equal(sha(fs.readFileSync(process.argv[3])), manifest.source_sha256);
  const originalScripts = original.data.extensions.tavern_helper.scripts;
  // Reproduce the actual 1.29.0 bootstrap refusal, without calling its MVU start.
  const broken = vm.createContext({URL, console: {error(){}}, setTimeout, clearTimeout});
  vm.runInContext(originalScripts[0].content, broken);
  await tick();
  await broken.__MIKAGE_REMOTE_LOADERS__.mvu.promise;
  assert.equal(broken.__MIKAGE_REMOTE_LOADERS__.mvu.status, 'failed');
  assert.match(broken.__MIKAGE_REMOTE_LOADERS__.mvu.error, /版本或标识不匹配/);

  const scripts = card.data.extensions.tavern_helper.scripts;
  assert.equal(scripts.length, originalScripts.length);
  assert.equal(card.data.character_version, '1.29.1');
  for (const key of Object.keys(original.data)) {
    if (!['character_version', 'extensions'].includes(key)) assert.deepEqual(card.data[key], original.data[key], key);
  }
  for (const key of Object.keys(original.data.extensions)) {
    if (key !== 'tavern_helper') assert.deepEqual(card.data.extensions[key], original.data.extensions[key], key);
  }
  assert.deepEqual(card.data.extensions.tavern_helper.variables, original.data.extensions.tavern_helper.variables);
  for (let i = 0; i < manifest.modules.length; i++) {
    const entry = manifest.modules[i], script = scripts[i];
    assert.equal(script.id, originalScripts[i].id);
    assert.equal(script.enabled, originalScripts[i].enabled);
    assert(Buffer.byteLength(script.content) < 10000);
    assert(!/base64,|embedded:|bundledMvu|bundledPanel|embeddedCopyModule/.test(script.content));
    const file = path.join(root, entry.path);
    assert.equal(sha(fs.readFileSync(file)), entry.sha256);
    const module = await import(pathToFileURL(file).href);
    assert.equal(module.VERSION, entry.version);
    assert.equal(module.SCRIPT_ID, entry.module_id);
    assert.equal(typeof module.start, 'function');
    let starts = 0, imports = 0;
    const context = vm.createContext({URL, setTimeout, clearTimeout,
      window: {parent:{}, addEventListener(){}},
      console: {error(){}}, eventOn(){}, getButtonEvent:n=>n,
      mockImport: async url => {
        imports++;
        assert(url.includes('/' + entry.path));
        if (imports === 1) throw Error('primary CDN unavailable');
        return {...module, start(){starts++;}};
      }});
    const source = script.content.replace('import(url)', 'mockImport(url)');
    vm.runInContext(source, context);
    await tick();
    await context.__MIKAGE_REMOTE_LOADERS__[entry.module_id].promise;
    assert.equal(context.__MIKAGE_REMOTE_LOADERS__[entry.module_id].status, 'running');
    assert.equal(starts, 1);
    assert.equal(imports, 2);
    vm.runInContext(source, context);
    assert.equal(starts, 1);
  }
  const scene = fs.readFileSync(path.join(release, 'scene.mjs'), 'utf8');
  const catalog = JSON.parse(scene.match(/const catalog=(.*);/)[1]);
  assert.equal(catalog.actors.player.outfits.length + catalog.actors.tomoe.outfits.length, 31);
  const mvu = fs.readFileSync(path.join(release, 'mvu.mjs'), 'utf8');
  const fields = JSON.parse(mvu.match(/const ShrineFieldSpec = (.*);/)[1]);
  for (const [actor, field] of [['player','玩家.衣装'], ['tomoe','巴卫.服装']]) {
    const values = fields.find(x=>x.path === field).enum;
    for (const outfit of catalog.actors[actor].outfits) assert(values.includes(outfit.id), outfit.id);
  }
  for (const image of manifest.tomoe_asset_refs.images) {
    assert.equal(sha(fs.readFileSync(path.join(root, image.path))), image.sha256);
  }
  console.log('PASS: original MVU failure reproduced; all 5 remote loaders match actual exports, fall back and start once; worldbook/text/state preserved; 31 outfits accepted; 13 external images byte-identical. Real SillyTavern execution remains pending.');
})().catch(error => {console.error(error);process.exitCode=1;});
