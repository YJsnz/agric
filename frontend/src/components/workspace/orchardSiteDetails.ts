import * as THREE from 'three'
import {ModelBuilder,type OrchardMaterials} from './orchardModels'
import {imageToGround,inside,bounds,type GroundPoint} from './orchardGeometry'

export function buildSiteDetails(boundary:GroundPoint[],parcels:GroundPoint[][],materials:OrchardMaterials){
  const b=new ModelBuilder(materials),root=new THREE.Group(),signTextures:THREE.Texture[]=[]
  // Bollards, curbs and pavement joints on service lanes.
  const routes=[[[0,386],[370,343],[1150,531]],[[0,829],[312,747],[1137,550]],[[625,706],[982,916]],[[936,421],[1330,612]]] as GroundPoint[][]
  for(const route of routes){const points=route.map(p=>imageToGround(...p));for(let i=1;i<points.length;i++){const [a,c]=[points[i-1],points[i]],dx=c[0]-a[0],dz=c[1]-a[1],length=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),nx=dz/length,nz=-dx/length;for(const side of [-1,1])b.box(.16,.16,length,(a[0]+c[0])/2+nx*1.2*side,.18,(a[1]+c[1])/2+nz*1.2*side,0xc7cabc,undefined,new THREE.Euler(0,angle,0));for(let t=2;t<length;t+=5)b.box(2,.01,.04,a[0]+dx*t/length,.102,a[1]+dz*t/length,0x8c9b8c,undefined,new THREE.Euler(0,angle,0))}}
  // Perimeter lamps and layered fence rails, inset toward the field.
  const extent=bounds(boundary),cx=(extent.minX+extent.maxX)/2,cz=(extent.minZ+extent.maxZ)/2
  boundary.forEach((a,i)=>{const c=boundary[(i+1)%boundary.length],dx=c[0]-a[0],dz=c[1]-a[1],length=Math.hypot(dx,dz),angle=Math.atan2(dx,dz);b.box(.07,.07,length,(a[0]+c[0])/2,.65,(a[1]+c[1])/2,0xa0b2a0,undefined,new THREE.Euler(0,angle,0));for(let t=8;t<length;t+=18){const x=a[0]+dx*t/length,z=a[1]+dz*t/length,dir=new THREE.Vector2(cx-x,cz-z).normalize(),px=x+dir.x*1.8,pz=z+dir.y*1.8;b.cylinder(.065,4.2,px,2.1,pz,0x71887b);b.box(.9,.12,.45,px,4.2,pz,0x819d8c);b.box(.7,.04,.32,px,4.12,pz,0xe2e4bc)}})
  // Small planting basins and shallow row beds instead of uniformly flat parcels.
  for(const polygon of parcels){const e=bounds(polygon);for(let z=e.minZ+2;z<e.maxZ;z+=4){let from:number|null=null;for(let x=e.minX;x<=e.maxX+.5;x+=.5){const hit=x<=e.maxX&&inside([x,z],polygon);if(hit&&from===null)from=x;if(!hit&&from!==null){if(x-from>.5)b.box(x-from,.018,1.9,(from+x)/2,.17,z,0xc4cc98,'grass');from=null}}}}
  // Canal sluice and bank reeds sit inside the water edge, away from buildings.
  const sluice=imageToGround(1170,795)
  b.box(3,.3,1.6,sluice[0],.3,sluice[1],0xb6bbab);for(const x of [-1,1])b.box(.2,2.3,.3,sluice[0]+x,1.4,sluice[1],0x829987);b.box(2.3,.15,.3,sluice[0],2.6,sluice[1],0x809381);b.box(1.8,1.1,.12,sluice[0],.7,sluice[1],0x5e837c);b.cylinder(.04,2,sluice[0],1.6,sluice[1],0xa5b5a2);b.cylinder(.32,.05,sluice[0],2.85,sluice[1],0xa18a58)
  for(let k=0;k<16;k++){const [x,z]=imageToGround(1500-k*25,680+k*12);for(let j=0;j<3;j++){b.cylinder(.018,.6+j*.15,x+j*.1,.6,z,0x81945f);b.cylinder(.05,.18,x+j*.1,1+j*.15,z,0x8c7350)}}
  // Signs use a local canvas texture; all textures are returned for explicit disposal.
  function sign(text:string,sub:string,x:number,z:number){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d')!;c.fillStyle='#2f6251';c.fillRect(0,0,512,256);c.strokeStyle='#b9cfaa';c.lineWidth=8;c.strokeRect(12,12,488,232);c.fillStyle='#eef5e6';c.textAlign='center';c.font='bold 48px Microsoft YaHei';c.fillText(text,256,108);c.font='28px Microsoft YaHei';c.fillStyle='#cfdfc4';c.fillText(sub,256,172);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;signTextures.push(map);const panel=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.8),new THREE.MeshStandardMaterial({map,side:THREE.DoubleSide,roughness:.9}));panel.position.set(x,2.4,z);root.add(panel);for(const dx of [-1.4,1.4])b.cylinder(.045,2.8,x+dx,1.4,z,0x889d80)}
  const entrance=imageToGround(320,746);sign('盐田丰语植物园','专题植物展区 · 示意园景',entrance[0],entrance[1]);const orchard=imageToGround(370,343);sign('鸭梨观测区','泊头鸭梨 · 田间作业通道',orchard[0]-3,orchard[1]-2)
  root.add(b.finish());return {root,textures:signTextures}
}
