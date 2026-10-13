import {inside,type GroundPoint} from './orchardGeometry'
export interface BuildingObstacle {x:number;z:number;halfX:number;halfZ:number}
export interface BridgeSurface {start:GroundPoint;end:GroundPoint;width:number;height:number;rampLength:number}
export function bridgeHeight(x:number,z:number,bridge:BridgeSurface):number|null{
  if(!Number.isFinite(x)||!Number.isFinite(z))return null
  const dx=bridge.end[0]-bridge.start[0],dz=bridge.end[1]-bridge.start[1],length=Math.hypot(dx,dz)
  if(!length)return null
  const along=((x-bridge.start[0])*dx+(z-bridge.start[1])*dz)/length,lateral=Math.abs((x-bridge.start[0])*dz-(z-bridge.start[1])*dx)/length
  if(lateral>bridge.width/2-.3||along < -bridge.rampLength||along>length+bridge.rampLength)return null
  return along<0?.14+(bridge.height-.14)*(along+bridge.rampLength)/bridge.rampLength:along>length?bridge.height-(bridge.height-.14)*(along-length)/bridge.rampLength:bridge.height
}
export function canNavigate(x:number,z:number,boundary:GroundPoint[],water:GroundPoint[],buildings:BuildingObstacle[],trees:GroundPoint[],bridges:BridgeSurface[]=[]){
  return inside([x,z],boundary)&&(!inside([x,z],water)||bridges.some(bridge=>bridgeHeight(x,z,bridge)!==null))
    &&!trees.some(([tx,tz])=>Math.hypot(x-tx,z-tz)<.55)
    &&!buildings.some(o=>Math.abs(x-o.x)<o.halfX+.5&&Math.abs(z-o.z)<o.halfZ+.5)
}
