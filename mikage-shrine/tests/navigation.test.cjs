'use strict';
const assert=require('node:assert/strict');
require('../src/navigation.js');
const nav=globalThis.MikageNavigation;
let checked=0,segments=0;
function safeRoute(region,from,to){
  const path=nav.route(region,from,to);
  assert(path.length>=1);
  for(const p of path)assert(nav.contains(region,...p),`${region}: point outside ground ${p}`);
  for(let i=1;i<path.length;i++){
    const a=path[i-1],b=path[i],n=Math.max(10,Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])*30));
    for(let j=0;j<=n;j++){let t=j/n;assert(nav.contains(region,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t),`${region}: unsafe edge ${a}->${b}`);}
    segments++;
  }
  checked++;return path;
}
for(const [id,r] of Object.entries(nav.regions)){
  const goals=[...r.patrol,...r.points.map(p=>p.approach)];
  for(const p of Object.values(r.spawn))assert(nav.contains(id,...p),`${id}: spawn outside ${p}`);
  for(const p of goals)assert(nav.contains(id,...p),`${id}: patrol/approach outside ${p}`);
  for(const p of goals){
    const path=safeRoute(id,r.spawn.player,p);
    assert(Math.hypot(path.at(-1)[0]-p[0],path.at(-1)[1]-p[1])<1e-6,`${id}: intended ground unreachable ${p}`);
  }
  // Grid across the entire picture includes water, roofs, railings and foliage.
  for(let y=0;y<=100;y+=20)for(let x=0;x<=100;x+=20)safeRoute(id,r.spawn.player,[x,y]);
  for(const p of [[0,0],[100,0],[0,100],[100,100]])safeRoute(id,p,r.spawn.player);
}
const island={walkable:[[[0,0],[10,0],[10,10],[0,10]],[[50,0],[60,0],[60,10],[50,10]]],spawn:{player:[5,5]}};
assert.deepEqual(nav.route(island,[5,5],[55,5]),[[5,5]],'must not cross an impassable gap');
const lShape={walkable:[[[0,0],[20,0],[20,5],[5,5],[5,20],[0,20]]],spawn:{player:[2,18]}};
const turn=safeRoute(lShape,[2,18],[18,2]);
assert(turn.length>=3,'must route around concave corner');
assert(!nav.contains('R06',60,80),'R06 sea must be blocked');
assert(!nav.contains('R06',35,95),'R06 tracks must be blocked');
assert(!nav.contains('R08',40,75),'R08 wetland must be blocked');
console.log(`navigation: ${checked} routes, ${segments} densely sampled edges; all passed`);
