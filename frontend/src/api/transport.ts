import {ref} from 'vue'
import {getToken} from '@/api/auth'
import {TransportPlayback} from '@/components/workspace/transportPlayback'
export interface TransportStop {id:string;name:string;entityId:string;x:number;y:number}
export interface TransportRoad {id:string;a:string;b:string;blocked:boolean}
export interface TransportTask {id:string;source:string;destination:string;goods:string;unit:string;quantity:number;status:string;phase:string;route:string[];waypoint:number;loaded:boolean;automatic:boolean;notice:string;createdAt:string;completedAt?:string;arrivalConfirmed?:boolean;confirmationSource?:string;vehicleReceipts?:{simulated:boolean;receivedAt:string;signal:{event:string;occurredAt:string}}[]}
export interface TransportState {lastTick:number;mapVersion:number;farmId:string;stops:TransportStop[];roads:TransportRoad[];tasks:TransportTask[];inventory:{location:string;goods:string;unit:string;available:number;reserved:number}[];ledger:{id:string;taskId:string;location:string;goods:string;unit:string;quantity:number;type:string;time:string}[];obstacles:{id:string;x:number;y:number;radius:number;moving:boolean}[];vehicle:{x:number;y:number};heading:number;battery:number;emergency:boolean;algorithm:string;simulated:boolean}
export const transportState=ref<TransportState>(),transportRoadStatus=ref<{id:string;legal:boolean}[]>([]),transportError=ref('')
const playback=new TransportPlayback()
let timer=0,users=0,busy=false
export function transportPosition(time=performance.now()){const p=playback.read(time);return {x:p.x,y:p.y}}
export function transportHeading(time=performance.now()){return playback.read(time).heading}
export function transportAnimating(time=performance.now()){return playback.animating(time)}
export async function transportRequest(path='',method='GET',body?:unknown){const r=await fetch('/api/farms/yantian-01/transport'+path,{method,headers:{Authorization:'Bearer '+getToken(),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const value=await r.json();if(!r.ok)throw Error(value.message||'运输服务不可用');return value}
export async function refreshTransport(){
 if(busy)return;busy=true
 try{
  const data=await transportRequest(),s=data.state as TransportState
  const active=s.tasks.find(t=>['RUNNING','PAUSED','BLOCKED','WAIT_LOAD','WAIT_UNLOAD','WAIT_ARRIVAL'].includes(t.status))
  const hardStop=s.emergency||active?.status==='PAUSED'||active?.status==='BLOCKED'
  playback.push({...s.vehicle,heading:s.heading},`${s.lastTick}:${s.vehicle.x}:${s.vehicle.y}:${s.heading}`,performance.now(),s.mapVersion,active?.status==='RUNNING',!!hardStop,{stops:s.stops,roads:s.roads.map(r=>({...r,legal:!r.blocked&&data.roadStatus.some((status:{id:string;legal:boolean})=>status.id===r.id&&status.legal)}))},s.lastTick)
  transportState.value=s;transportRoadStatus.value=data.roadStatus;transportError.value=''
 }catch(e){transportError.value=(e as Error).message}finally{busy=false}
}
export function useTransport(){if(users++===0){refreshTransport();timer=window.setInterval(refreshTransport,250)}return ()=>{if(--users===0){clearInterval(timer);timer=0}}}
export const stopName=(id:string)=>transportState.value?.stops.find(s=>s.id===id)?.name||id
export const taskStatus:Record<string,string>={QUEUED:'待调度',RUNNING:'行驶中',PAUSED:'已暂停',WAIT_LOAD:'等待装货',WAIT_ARRIVAL:'等待车辆回报',WAIT_UNLOAD:'等待卸货',BLOCKED:'避障停车',COMPLETED:'已交付',CANCELLED:'已取消'}
