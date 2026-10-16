/* Ground navigation for the COMPLETE 3:2 region image (never cover/crop).
 * Coordinates are image percentages, 0..100. Polygons describe foot contact,
 * not sprite bounding boxes. Atlas quadrants are individually 3:2.
 * R03=top-left, R04=top-right, R06=bottom-left, R08=bottom-right.
 */
(function (host) {
  'use strict';
  const point = (id, name, at, approach) => ({ id, name, x: at[0], y: at[1], approach });
  const regions = {
    R01: { name: '御影神社',
      // Courtyard only: avoid lantern plinths, flower boxes, offering box,
      // building veranda and its large support column. There is no pond.
      walkable: [
        [[24,97],[43,97],[57,87],[67,82],[72,72],[65,68],[53,69],[42,76],[23,82]],
        [[22,77],[42,77],[54,69],[60,67],[54,65],[43,66],[29,70],[22,71]],
        [[29,69],[42,68],[42,65],[36,62],[33,62],[30,65]]
      ], spawn: { player: [43,88], tomoe: [49,86] },
      patrol: [[32,87],[45,82],[58,76],[62,70],[43,70],[34,67]],
      points: [point('ema','神社拜殿',[68,61],[62,70]),point('bell','檐下风铃',[88,16],[62,70]),point('sweep','庭院扫叶',[44,76],[44,78])]
    },
    R02: { name: '门前住宅区',
      walkable: [[[7,97],[87,97],[77,81],[72,63],[70,60],[62,60],[56,66],[49,71],[35,79],[18,87]]],
      spawn: { player: [44,88], tomoe: [53,87] },
      patrol: [[27,90],[48,82],[60,72],[66,64]],
      points: [point('cat','坂道寻猫',[66,61],[66,64]),point('mail','街角邮筒',[89,66],[75,83]),point('bicycle','门前单车',[37,69],[42,80])]
    },
    R03: { name: '商店街',
      walkable: [[[7,98],[94,98],[84,84],[79,72],[74,65],[70,58],[67,56],[62,57],[57,59],[50,59],[45,62],[39,67],[29,76],[18,87]]],
      spawn: { player: [46,87], tomoe: [55,87] },
      patrol: [[28,89],[49,79],[63,68],[64,60],[77,81]],
      points: [point('dango','商店街小食',[14,70],[29,83]),point('craft','沿街小店',[37,57],[44,70]),point('shops','沿街商铺',[86,62],[74,74])]
    },
    R04: { name: '河岸公园',
      // Stay between the river fence and grass/bench; water is entirely excluded.
      walkable: [[[10,99],[53,99],[62,84],[72,68],[80,54],[85,45],[86,39],[84,38],[81,44],[76,52],[69,59],[58,70],[43,81],[26,91]]],
      spawn: { player: [35,91], tomoe: [44,92] },
      patrol: [[26,94],[43,87],[59,74],[72,59],[81,46]],
      points: [point('boat','河岸远眺',[43,56],[59,76]),point('wind','河畔微风',[89,79],[68,70]),point('bridge','远处桥梁',[44,44],[80,48])]
    },
    R05: { name: '站前街',
      // Left public apron and crossing; exclude bike racks, planter/railings.
      walkable: [
        [[22,97],[89,97],[85,91],[75,83],[68,77],[60,74],[27,74],[27,80],[29,86],[22,91]],
        [[16,67],[22,67],[23,71],[57,71],[57,65],[61,64],[59,59],[48,58],[42,57],[24,57],[19,62]],
        [[24,67],[55,67],[58,77],[27,78]]
      ], spawn: { player: [48,90], tomoe: [57,91] },
      patrol: [[38,89],[53,82],[45,72],[33,64],[23,65]],
      points: [point('ticket','车站检票口',[34,50],[34,60]),point('board','车站布告',[9,48],[20,65]),point('crossing','站前斑马线',[49,82],[48,85])]
    },
    R06: { name: '海滨电车沿线',
      // ONLY the left passenger platform. The track bends from x~12 at y55
      // to x~30 at y100; rail bed and the sea beyond remain impassable.
      walkable: [[[2,98],[25,98],[20,88],[16,79],[13,71],[11,64],[12,57],[11,55],[9,60],[7,67],[5,75],[2,80]]],
      spawn: { player: [10,91], tomoe: [17,92] },
      patrol: [[7,94],[12,86],[10,76],[9,66]],
      points: [point('postcard','站台明信片',[8,74],[8,79]),point('sea','海港远景',[70,63],[12,88]),point('train','等候电车',[25,91],[16,90])]
    },
    R07: { name: '城郊林道',
      // Winding stair path inside the wooden guardrail, not the hillside.
      walkable: [[[24,98],[65,98],[61,90],[56,80],[48,70],[40,63],[34,58],[30,54],[27,51],[25,52],[27,57],[29,63],[28,68],[25,73],[27,80],[30,86],[26,92]]],
      spawn: { player: [38,91], tomoe: [48,92] },
      patrol: [[48,94],[42,82],[35,72],[32,62],[28,56]],
      points: [point('leaves','林间落叶',[44,36],[36,74]),point('view','山下街景',[74,44],[48,82]),point('sign','参道石碑',[29,55],[30,60])]
    },
    R08: { name: '沼泽地',
      // Narrow boardwalk only; reeds, pond and railings are not ground.
      walkable: [[[45,98],[64,98],[72,88.5],[78,79.5],[84.5,70],[90,62.5],[92,58.8],[90.5,57.6],[89,58.5],[87,63],[82.5,67.5],[76.8,74],[70.5,80.5],[63.5,86.5],[55.5,92.5]]],
      spawn: { player: [58,94], tomoe: [65,93] },
      patrol: [[55,95],[66,86],[77,76],[87,64],[90.4,58.8]],
      points: [point('firefly','水边萤火',[37,69],[65,87]),point('water','栈道听水',[86,67],[85,67]),point('sunset','晚霞',[63,27],[90.4,58.8])]
    },
    R09: { name: '祭礼会所',
      // Street in front of the raised room; tables/chairs and interior are
      // not traversable. The threshold is approached from the pavement.
      walkable: [[[31,98],[97,98],[97,64],[94,65],[91,70],[89,76],[80,81],[66,86],[49,92]]],
      spawn: { player: [62,95], tomoe: [72,94] },
      patrol: [[52,95],[71,90],[85,85],[94,76]],
      points: [point('drum','祭典物资',[53,75],[61,91]),point('prep','活动室准备',[48,55],[71,90]),point('lane','神社小巷',[98,67],[94,75])]
    },
    R10: { name: '门前祭道',
      walkable: [[[22,98],[89,98],[86,91],[80,83],[74,77],[69,72],[65,69],[63,68],[57,68],[53,70],[50,73],[44,78],[38,85],[29,93]]],
      spawn: { player: [48,91], tomoe: [59,91] },
      patrol: [[38,93],[52,85],[63,78],[61,71],[75,87]],
      points: [point('lantern','祭典灯笼',[36,67],[46,83]),point('games','祭典摊位',[84,69],[72,83]),point('gate','灯火下的鸟居',[60,59],[60,72])]
    }
  };
  const EPS = 1e-8, NX = 100, NY = 67, gridCache = new WeakMap();
  const resolve = region => typeof region === 'string' ? regions[region] : region;
  const distance2 = (a,b) => (a[0]-b[0])**2*2.25+(a[1]-b[1])**2;
  const cross = (a,b) => a[0]*b[1]-a[1]*b[0];
  function onSegment(p,a,b) {
    return Math.abs(cross([p[0]-a[0],p[1]-a[1]],[b[0]-a[0],b[1]-a[1]])) < EPS &&
      p[0] >= Math.min(a[0],b[0])-EPS && p[0] <= Math.max(a[0],b[0])+EPS &&
      p[1] >= Math.min(a[1],b[1])-EPS && p[1] <= Math.max(a[1],b[1])+EPS;
  }
  function inPolygon(poly,x,y) {
    let inside=false;
    for(let i=0,j=poly.length-1;i<poly.length;j=i++) {
      const a=poly[j],b=poly[i];
      if(onSegment([x,y],a,b)) return true;
      if((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) inside=!inside;
    }
    return inside;
  }
  function contains(region,x,y) {
    const r=resolve(region);
    return !!r && Number.isFinite(x) && Number.isFinite(y) && r.walkable.some(poly=>inPolygon(poly,x,y));
  }
  function project(region,x,y) {
    const r=resolve(region);
    if(!r) throw new Error('Unknown navigation region');
    if(!Number.isFinite(x)||!Number.isFinite(y)) return r.spawn.player.slice();
    if(contains(r,x,y)) return [x,y];
    let best=null,bestD=Infinity;
    for(const poly of r.walkable) for(let i=0;i<poly.length;i++) {
      const a=poly[i],b=poly[(i+1)%poly.length],dx=b[0]-a[0],dy=b[1]-a[1];
      const denominator=dx*dx*2.25+dy*dy;
      const t=denominator ? Math.max(0,Math.min(1,((x-a[0])*dx*2.25+(y-a[1])*dy)/denominator)) : 0;
      const p=[a[0]+dx*t,a[1]+dy*t],d=distance2(p,[x,y]);
      if(d<bestD){best=p;bestD=d;}
    }
    return best;
  }
  // Exact visibility through a polygon union: partition the segment at every
  // polygon edge, then check every open interval. Thin gaps cannot be skipped.
  function visible(r,a,b) {
    if(!contains(r,...a)||!contains(r,...b)) return false;
    const d=[b[0]-a[0],b[1]-a[1]],length2=d[0]**2+d[1]**2;
    if(length2<EPS) return true;
    const ts=[0,1];
    for(const poly of r.walkable) for(let i=0;i<poly.length;i++) {
      const p=poly[i],q=poly[(i+1)%poly.length],e=[q[0]-p[0],q[1]-p[1]],pa=[p[0]-a[0],p[1]-a[1]],den=cross(d,e);
      if(Math.abs(den)>EPS) {
        const t=cross(pa,e)/den,u=cross(pa,d)/den;
        if(t>0&&t<1&&u>=-EPS&&u<=1+EPS) ts.push(t);
      } else if(Math.abs(cross(pa,d))<EPS) {
        for(const v of [p,q]){const t=((v[0]-a[0])*d[0]+(v[1]-a[1])*d[1])/length2;if(t>0&&t<1)ts.push(t);}
      }
    }
    ts.sort((x,y)=>x-y);
    for(let i=1;i<ts.length;i++) {const t=(ts[i-1]+ts[i])/2;if(!contains(r,a[0]+d[0]*t,a[1]+d[1]*t))return false;}
    return true;
  }
  function gridFor(r) {
    if(gridCache.has(r)) return gridCache.get(r);
    const points=[],valid=new Uint8Array((NX+1)*(NY+1));
    for(let y=0;y<=NY;y++) for(let x=0;x<=NX;x++) {
      const p=[x*100/NX,y*100/NY],id=y*(NX+1)+x;
      points[id]=p;valid[id]=contains(r,...p)?1:0;
    }
    const grid={points,valid};gridCache.set(r,grid);return grid;
  }
  function nearestVisible(r,grid,p) {
    let best=-1,distance=Infinity;
    for(let i=0;i<grid.points.length;i++) if(grid.valid[i]) {
      const d=distance2(p,grid.points[i]);
      if(d<distance&&visible(r,p,grid.points[i])){best=i;distance=d;}
    }
    return best;
  }
  class Heap {
    constructor(){this.items=[];}
    push(item){let i=this.items.length;this.items.push(item);while(i){let p=(i-1)>>1;if(this.items[p][0]<=item[0])break;this.items[i]=this.items[p];i=p;}this.items[i]=item;}
    pop(){const first=this.items[0],last=this.items.pop();if(this.items.length){let i=0;while(true){let c=i*2+1;if(c>=this.items.length)break;if(c+1<this.items.length&&this.items[c+1][0]<this.items[c][0])c++;if(this.items[c][0]>=last[0])break;this.items[i]=this.items[c];i=c;}this.items[i]=last;}return first;}
  }
  function route(region,from,to) {
    const r=resolve(region);if(!r)throw new Error('Unknown navigation region');
    const start=project(r,from?.[0],from?.[1]),end=project(r,to?.[0],to?.[1]);
    if(distance2(start,end)<EPS)return [start];
    if(visible(r,start,end))return [start,end];
    const grid=gridFor(r),source=nearestVisible(r,grid,start),target=nearestVisible(r,grid,end);
    if(source<0||target<0)return [start];
    const count=grid.points.length,g=new Float64Array(count);g.fill(Infinity);
    const parent=new Int32Array(count);parent.fill(-1);
    const closed=new Uint8Array(count),open=new Heap();g[source]=0;open.push([Math.sqrt(distance2(grid.points[source],end)),source]);
    while(open.items.length){
      const current=open.pop()[1];if(closed[current])continue;
      if(current===target)break;closed[current]=1;
      const cx=current%(NX+1),cy=Math.floor(current/(NX+1));
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        if(!dx&&!dy)continue;const x=cx+dx,y=cy+dy;
        if(x<0||x>NX||y<0||y>NY)continue;const next=y*(NX+1)+x;
        if(!grid.valid[next]||closed[next])continue;
        if(dx&&dy&&(!grid.valid[cy*(NX+1)+x]||!grid.valid[y*(NX+1)+cx]))continue;
        if(!visible(r,grid.points[current],grid.points[next]))continue;
        const cost=g[current]+Math.sqrt(distance2(grid.points[current],grid.points[next]));
        if(cost>=g[next])continue;g[next]=cost;parent[next]=current;
        open.push([cost+Math.sqrt(distance2(grid.points[next],grid.points[target])),next]);
      }
    }
    if(source!==target&&parent[target]<0)return [start];
    const raw=[];for(let id=target;id!==-1;id=parent[id]){raw.push(grid.points[id]);if(id===source)break;}raw.reverse();raw.unshift(start);raw.push(end);
    const result=[start];let anchor=0;
    while(anchor<raw.length-1){let far=raw.length-1;while(far>anchor+1&&!visible(r,raw[anchor],raw[far]))far--;if(distance2(result[result.length-1],raw[far])>EPS)result.push(raw[far].slice());anchor=far;}
    return result;
  }
  host.MikageNavigation={regions,contains,project,route};
})(typeof window==='undefined'?globalThis:window);
