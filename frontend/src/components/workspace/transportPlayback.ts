type Point={x:number;y:number}
export type PlaybackPose=Point&{heading:number}
type Graph={stops:(Point&{id:string})[];roads:{a:string;b:string;legal:boolean}[]}
type Sample=PlaybackPose&{time:number;key:string;path:Point[]}
const distance=(a:Point,b:Point)=>Math.hypot(b.x-a.x,b.y-a.y)
function onRoad(p:Point,a:Point,b:Point){
 const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy
 if(!length)return false
 const t=((p.x-a.x)*dx+(p.y-a.y)*dy)/length
 return t>=-.001&&t<=1.001&&Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)<=3.1
}
// Never interpolate a diagonal through fields when two samples straddle a road junction.
export function playbackPath(a:Point,b:Point,graph:Graph):Point[]{
 const roads=graph.roads.filter(r=>r.legal).map(r=>({a:graph.stops.find(n=>n.id===r.a)!,b:graph.stops.find(n=>n.id===r.b)!})).filter(r=>r.a&&r.b)
 if(roads.some(r=>onRoad(a,r.a,r.b)&&onRoad(b,r.a,r.b)))return [a,b]
 let best:Point[]=[] ,length=Infinity
 for(const first of roads.filter(r=>onRoad(a,r.a,r.b)))for(const last of roads.filter(r=>onRoad(b,r.a,r.b))){
  const junction=[first.a,first.b].find(n=>n.id===last.a.id||n.id===last.b.id)
  if(junction&&distance(a,junction)+distance(junction,b)<length){best=[a,junction,b];length=distance(a,junction)+distance(junction,b)}
 }
 return best
}
export class TransportPlayback {
 private samples:Sample[]=[]
 private running=false
 private version=-1
 private clockOffset:number|undefined
 private delay:number
 constructor(delay=800){this.delay=delay}
 push(pose:PlaybackPose,key:string,time:number,version:number,running:boolean,hardStop:boolean,graph:Graph,sourceTime?:number){
  const last=this.samples.at(-1)
  if(sourceTime!==undefined&&Number.isFinite(sourceTime)){
   if(!last||version!==this.version||hardStop||this.clockOffset===undefined||sourceTime+this.clockOffset<last.time)this.clockOffset=time-sourceTime
   time=sourceTime+this.clockOffset
  }
  if(!last||version!==this.version||hardStop){this.samples=[{...pose,key,time,path:[]}];this.version=version;this.running=false;return}
  this.running=running
  // Polling the same simulation tick must not restart its animation.
  if(last.key===key)return
  const path=playbackPath(last,pose,graph)
  if(distance(last,pose)>0.01&&!path.length){this.samples=[{...pose,key,time,path:[]}];return}
  this.samples.push({...pose,key,time,path});if(this.samples.length>20)this.samples.shift()
 }
 read(time:number):PlaybackPose{
  const target=time-this.delay,samples=this.samples
  if(!samples.length)return {x:1320,y:348,heading:0}
  if(samples.length===1||target<=samples[0].time)return samples[0]
  const next=samples.findIndex(s=>s.time>=target)
  if(next<0)return samples[samples.length-1]
  const a=samples[next-1],b=samples[next],t=Math.min(1,Math.max(0,(target-a.time)/(b.time-a.time)))
  const heading=a.heading+Math.atan2(Math.sin(b.heading-a.heading),Math.cos(b.heading-a.heading))*t
  const path=b.path.length?b.path:[a,b],lengths=path.slice(1).map((p,i)=>distance(path[i],p));let travel=lengths.reduce((sum,v)=>sum+v,0)*t
  for(let i=0;i<lengths.length;i++){if(travel<=lengths[i]||i===lengths.length-1){const f=lengths[i]?travel/lengths[i]:0;return {x:path[i].x+(path[i+1].x-path[i].x)*f,y:path[i].y+(path[i+1].y-path[i].y)*f,heading}}travel-=lengths[i]}
  return {...b,heading}
 }
 animating(time:number){const last=this.samples.at(-1),current=this.read(time);return this.running||!!last&&(distance(current,last)>.001||Math.abs(Math.atan2(Math.sin(last.heading-current.heading),Math.cos(last.heading-current.heading)))>.001)}
}
