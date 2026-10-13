import {ref} from 'vue'
import {getToken} from '@/api/auth'
export interface TransportStop {id:string;name:string;entityId:string;x:number;y:number}
export interface TransportRoad {id:string;a:string;b:string;blocked:boolean}
export interface TransportTask {id:string;source:string;destination:string;goods:string;unit:string;quantity:number;status:string;phase:string;route:string[];waypoint:number;loaded:boolean;automatic:boolean;notice:string;createdAt:string;completedAt?:string}
export interface TransportState {farmId:string;stops:TransportStop[];roads:TransportRoad[];tasks:TransportTask[];inventory:{location:string;goods:string;unit:string;available:number;reserved:number}[];ledger:{id:string;taskId:string;location:string;goods:string;unit:string;quantity:number;type:string;time:string}[];obstacles:{id:string;x:number;y:number;radius:number;moving:boolean}[];vehicle:{x:number;y:number};heading:number;battery:number;emergency:boolean;algorithm:string;simulated:boolean}
export const transportState=ref<TransportState>(),transportRoadStatus=ref<{id:string;legal:boolean}[]>([]),transportError=ref('')
let previous={x:1400,y:300},received=0,timer=0,users=0,busy=false
export function transportPosition(){const v=transportState.value?.vehicle||previous;const t=Math.max(0,Math.min(1,(performance.now()-received)/500));return {x:previous.x+(v.x-previous.x)*t,y:previous.y+(v.y-previous.y)*t}}
export async function transportRequest(path='',method='GET',body?:unknown){const r=await fetch('/api/farms/yantian-01/transport'+path,{method,headers:{Authorization:'Bearer '+getToken(),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const value=await r.json();if(!r.ok)throw Error(value.message||'运输服务不可用');return value}
export async function refreshTransport(){if(busy)return;busy=true;try{const data=await transportRequest();previous=transportPosition();received=performance.now();transportState.value=data.state;transportRoadStatus.value=data.roadStatus;transportError.value=''}catch(e){transportError.value=(e as Error).message}finally{busy=false}}
export function useTransport(){if(users++===0){refreshTransport();timer=window.setInterval(refreshTransport,500)}return ()=>{if(--users===0){clearInterval(timer);timer=0}}}
export const stopName=(id:string)=>transportState.value?.stops.find(s=>s.id===id)?.name||id
export const taskStatus:Record<string,string>={QUEUED:'待调度',RUNNING:'行驶中',PAUSED:'已暂停',WAIT_LOAD:'等待装货',WAIT_UNLOAD:'等待卸货',BLOCKED:'避障停车',COMPLETED:'已交付',CANCELLED:'已取消'}
