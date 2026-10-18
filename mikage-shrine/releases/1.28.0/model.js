const MikageTeaModel=(()=>{
 const blends={green:{name:'清茶',target:84},roast:{name:'焙茶',target:94},rice:{name:'米香茶',target:88}};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const distance=(a,b)=>Math.abs(((a-b+540)%360)-180);
 function create(){return {phase:'choose',blend:'green',temperature:24,fire:false,pour:-1,cups:[0,0],overflow:0,assisted:false,slow:false,leaf:0,angle:0,target:35,finished:false};}
 function tick(s,dt){dt=clamp(Number(dt)||0,0,.1)*(s.slow?.55:1);if(s.phase==='heat')s.temperature=clamp(s.temperature+(s.fire?9.5:-1.6)*dt,24,103);if(s.phase==='pour'&&s.pour>=0){const i=s.pour,amount=19*dt*(s.assisted?.75:1);s.overflow+=Math.max(0,s.cups[i]+amount-100);s.cups[i]=clamp(s.cups[i]+amount,0,100);}return s;}
 function start(s,blend){if(s.phase!=='choose'||!blends[blend])return false;s.blend=blend;s.phase='heat';s.target={green:35,roast:145,rice:265}[blend];return true;}
 function off(s){s.fire=false;s.pour=-1;}
 function heatDone(s){if(s.phase!=='heat'||s.temperature<55)return false;off(s);s.heatAtPour=s.temperature;s.heatScore=clamp(100-Math.abs(s.temperature-blends[s.blend].target)*4,0,100);s.phase='pour';return true;}
 function pourDone(s){if(s.phase!=='pour'||s.cups.some(v=>v<30))return false;off(s);s.pourScore=clamp(100-(Math.abs(s.cups[0]-72)+Math.abs(s.cups[1]-72))*1.7-s.overflow*2,0,100);s.phase='leaf';return true;}
 function finish(s){if(s.phase!=='leaf'||s.finished)return null;off(s);s.finished=true;s.phase='done';const leafScore=clamp(100-distance(s.angle,s.target)*1.6,0,100),score=Math.round(s.heatScore*.4+s.pourScore*.4+leafScore*.2);return {score,rank:score>=85?'茶香正好':score>=60?'留有余温':'微涩的一杯',heat:Math.round(s.heatAtPour),cups:s.cups.map(Math.round),leaf:s.leaf,leafAccuracy:Math.round(leafScore),blend:blends[s.blend].name,assisted:s.assisted};}
 return {create,tick,start,off,heatDone,pourDone,finish,blends,distance};
})();
