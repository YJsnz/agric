import atlasUrl from '@/assets/transport/rover-directions-v3.png'
import {transportDirection} from './transportDirections'
import type {MotionFrame} from './transportMotion'

type Frame={x:number;y:number;width:number;height:number}
let imagePromise:Promise<{image:HTMLImageElement;frames:Frame[];width:number;height:number}>|undefined
function loadAtlas(){
 return imagePromise??=new Promise((resolve,reject)=>{
  const image=new Image();image.onload=()=>{
   const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height
   const ctx=canvas.getContext('2d')!;ctx.drawImage(image,0,0)
   const alpha=ctx.getImageData(0,0,image.width,image.height).data,frames:Frame[]=[]
   // Generator spacing is not perfectly uniform: calibrated cells exclude adjacent tires.
   const cells=[[0,0,416,500],[416,0,384,500],[800,0,318,500],[1118,0,418,500],[0,512,412,512],[412,512,378,512],[790,512,332,512],[1122,512,414,512]]
   for(let i=0;i<8;i++){
    const [ox,oy,cw,ch]=cells[i];let left=cw,right=0,top=ch,bottom=0
    for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(alpha[((oy+y)*image.width+ox+x)*4+3]>32){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}
    frames.push({x:ox+left,y:oy+top,width:right-left+1,height:bottom-top+1})
   }
   resolve({image,frames,width:Math.max(...frames.map(f=>f.width)),height:Math.max(...frames.map(f=>f.height))})
  };image.onerror=()=>{imagePromise=undefined;reject(new Error('运输车方向图片加载失败'))};image.src=atlasUrl
 })
}
export async function acquireTransportSprite(){
 const atlas=await loadAtlas()
 const wheelPatches=new Map<string,HTMLCanvasElement>()
 let current=-1,previous=-1,changed=0,lastHeading=0
 return {
  draw(canvas:HTMLCanvasElement,heading:number,motion:MotionFrame,reduced:boolean,_loaded:boolean){
   const yaw=Math.atan2(Math.sin(heading-lastHeading),Math.cos(heading-lastHeading));lastHeading=heading
   const anticipation=motion.turning?Math.sign(yaw)*Math.min(.22,Math.abs(motion.steering)*.6):0
   const now=performance.now(),next=transportDirection(heading+anticipation)
   if(next!==current){previous=current;current=next;changed=now}
   const blend=reduced||previous<0?1:Math.min(1,(now-changed)/55),ctx=canvas.getContext('2d')!
   ctx.clearRect(0,0,canvas.width,canvas.height)
   const scale=Math.min(canvas.width*.88/atlas.width,canvas.height*.84/atlas.height)
   const drawFrame=(index:number,opacity:number)=>{
    const f=atlas.frames[index],w=f.width*scale,h=f.height*scale,x=(canvas.width-w)/2,y=canvas.height*.92-h+(reduced?0:motion.bob*1.2)
    ctx.save();ctx.globalAlpha=opacity
    // The final generated quarter view faces left; mirror it into the southeast sector.
    if(index===7){ctx.translate(canvas.width,0);ctx.scale(-1,1)}
    ctx.drawImage(atlas.image,f.x,f.y,f.width,f.height,x,y,w,h)
    // Animate visible rims in side and quarter views, while retaining the generated tires.
    const rims:Record<number,number[][]>={0:[[.2,.81,.049,.077],[.84,.81,.048,.077]],1:[[.2,.64,.025,.05],[.66,.8,.029,.065],[.93,.59,.023,.05]],3:[[.15,.6,.025,.05],[.41,.8,.03,.069],[.86,.66,.025,.055]],4:[[.15,.8,.045,.075],[.8,.8,.049,.075]],5:[[.17,.75,.02,.05],[.65,.82,.029,.068],[.93,.61,.023,.052]],7:[[.11,.72,.024,.049],[.57,.82,.028,.064],[.9,.65,.023,.054]]}
    const wheelPositions=rims[index]||[]
    for(let wheel=0;wheel<wheelPositions.length;wheel++){
     const [cx,cy,rx,ry]=wheelPositions[wheel],front=(index===0?cx>.5:index===4?cx<.5:[5,7].includes(index)?wheel<2:wheel===2)
     const phase=wheel%2?motion.rightRoll:motion.leftRoll,steer=front?motion.steering:0
     const key=index+':'+wheel;let patch=wheelPatches.get(key)
     if(!patch){patch=document.createElement('canvas');patch.width=64;patch.height=64;const pc=patch.getContext('2d')!;pc.drawImage(atlas.image,f.x+(cx-rx)*f.width,f.y+(cy-ry)*f.height,rx*2*f.width,ry*2*f.height,0,0,64,64);wheelPatches.set(key,patch)}
     ctx.save();ctx.translate(x+cx*w,y+cy*h);ctx.rotate(steer*.35);ctx.scale(rx*w*(1-Math.abs(steer)*.3),ry*h)
     ctx.beginPath();ctx.arc(0,0,.97,0,Math.PI*2);ctx.clip();ctx.rotate(phase);ctx.drawImage(patch,-1,-1,2,2)
     // A polished asymmetric rim highlight makes rotation readable at map scale.
     ctx.strokeStyle='#d6ddc9c9';ctx.lineWidth=.13;ctx.beginPath();ctx.arc(0,0,.66,-.3,.65);ctx.stroke()
     ctx.restore()
    }
    // Head-on views show tire tread rather than rims: translate tread bands along the tire.
    if(index===2||index===6)for(const cx of [.13,.87]){
     const tx=x+cx*w,ty=y+h*.79,tw=w*.14,th=h*.32
     ctx.save();ctx.beginPath();ctx.ellipse(tx,ty,tw/2,th/2,0,0,Math.PI*2);ctx.clip()
     ctx.strokeStyle='#a3ad9a88';ctx.lineWidth=Math.max(1,scale*1.8)
     const offset=((motion.leftRoll*6)%9+9)%9
     for(let tread=-4;tread<5;tread++){const yy=ty+tread*9+offset;ctx.beginPath();ctx.moveTo(tx-tw*.36,yy-2);ctx.lineTo(tx,yy+1);ctx.lineTo(tx+tw*.36,yy-2);ctx.stroke()}
     ctx.restore()
    }
    ctx.restore()
   }
   if(blend<1)drawFrame(previous,1-blend)
   drawFrame(current,blend);ctx.globalAlpha=1
   return {direction:current,transitioning:blend<1}
  },
  release(){wheelPatches.clear()}
 }
}
