const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function verify(source, label) {
  const code = ['settle', 'switchRegion'].map(name => {
    const line = source.split('\n').find(line => line.trimStart().startsWith('function ' + name + '('));
    assert(line, name + ' is present in ' + label);
    return line;
  }).join('\n');
  const nodes = new Map();
  function element() {
    const classes = new Set(['walking']);
    return { dataset: {}, setAttribute() {}, classList: { remove: x => classes.delete(x), toggle() {}, contains: x => classes.has(x) } };
  }
  const actors = Object.fromEntries(['player', 'tomoe'].map(who => [who, {
    x: 5, y: 6, tx: 90, ty: 80, route: [[90, 80]], direction: 'right', walkFrame: 3, walkElapsed: .14, el: element()
  }]));
  const paints = [];
  const context = {
    actors, pending: { region: 'R01', run: () => paints.push('arrival') }, regionId: 'R01',
    scene: element(), REGIONS: { R01: {}, R02: {} }, notebook: [], patrol: 8, listenIndex: 4,
    wanderTimer: 1, followTimer: 2, MOMENTS: { R02: ['one', 'title', 'leaf'] },
    $: id => { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); },
    position() {}, paint(who) { const a = actors[who]; paints.push({ who, direction: a.direction, frame: a.walkFrame, walking: a.el.classList.contains('walking') }); },
    drawRoute() {}, active: () => true, scheduleWander() {}, closeActivity() {}, closeProp() {},
    cfg: () => ({ name: 'next region', spawn: { player: [30, 40], tomoe: [50, 60] } }),
    nav: { project: (_id, x, y) => [x, y] }, clearTimeout() {}, groundOverlay() {}, renderHotspots() {}, icon: () => ''
  };
  vm.createContext(context); vm.runInContext(code, context);
  context.settle('player');
  assert.deepEqual(paints[0], { who: 'player', direction: 'front', frame: 0, walking: false }, 'arrival paints the final pose immediately');
  assert.equal(paints[1], 'arrival', 'interaction follows the final pose');
  paints.length = 0;
  context.switchRegion('R02');
  for (const a of Object.values(actors)) {
    assert.equal(a.route.length, 0); assert.equal(a.walkFrame, 0); assert.equal(a.walkElapsed, 0);
    assert.equal(a.direction, 'front'); assert.equal(a.el.classList.contains('walking'), false);
  }
  assert.equal(context.pending, null);
  assert.equal(paints.length, 2);
  assert(paints.every(p => p.frame === 0 && p.direction === 'front' && !p.walking), 'new region starts both actors in stable poses');
  console.log('PASS arrival and region transition: ' + label);
}

verify(fs.readFileSync(path.join(__dirname, '../src/roam-controller.js'), 'utf8'), 'source');
const runtimePath = process.argv[2];
if (runtimePath) {
  const runtime = fs.readFileSync(runtimePath, 'utf8');
  const html = runtime.match(/const StatusbarHTML=("(?:[^"\\]|\\.)*");/);
  assert(html, 'compiled statusbar is present');
  verify(JSON.parse(html[1]), 'compiled runtime');
}
