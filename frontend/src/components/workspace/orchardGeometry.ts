export type GroundPoint=[number,number]
// Stable concept-camera inverse perspective. Horizon is above the editable plots.
// An irregular parcel is never forced into a rectangle; this is not GIS calibration.
export function imageToGround(u:number,v:number):GroundPoint {
  const w=v-80,point:GroundPoint=[(u-768)*20/w,(v-520)*35/w]
  if(v<=100)throw Error('Geometry above calibrated ground horizon')
  if(point.some(v=>!Number.isFinite(v)||Math.abs(v)>500))throw Error('Geometry outside calibrated scene')
  return point
}
export function inside(point:GroundPoint,polygon:GroundPoint[]){let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit
}return hit}
export function bounds(points:GroundPoint[]){return {minX:Math.min(...points.map(p=>p[0])),maxX:Math.max(...points.map(p=>p[0])),minZ:Math.min(...points.map(p=>p[1])),maxZ:Math.max(...points.map(p=>p[1]))}}
export function grid(polygon:GroundPoint[],spacing:number,limit=1800):GroundPoint[]{const b=bounds(polygon),points:GroundPoint[]=[];
  for(let z=b.minZ+spacing/2;z<b.maxZ;z+=spacing)for(let x=b.minX+spacing/2;x<b.maxX;x+=spacing)if(inside([x,z],polygon)){points.push([x,z]);if(points.length>=limit)return points}
  return points
}
