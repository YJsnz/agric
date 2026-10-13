import { getToken } from './auth'
export interface VisionDetection {classId:number;className:string;label:string;confidence:number;box:[number,number,number,number]}
export interface VisionResult {modelId:string;modelSha256:string;imageWidth:number;imageHeight:number;durationMs:number;detections:VisionDetection[];warnings:string[];limitations:string[]}
export interface VisionRecord {id:string;farmId:string;plotId:string;status:string;filename:string;sha256:string;createdAt:string;error:string|null;result:VisionResult|null}
export interface VisionModel {ready:boolean;message?:string;manifest?:{modelId:string;source:string;limitations:string[];classes:Record<string,string>}}
async function call<T>(url:string,options:RequestInit={}):Promise<T> {
  const response=await fetch(`/api/vision${url}`,{...options,headers:{Authorization:`Bearer ${getToken()}`,...options.headers}})
  const data=await response.json();if(!response.ok)throw Error(data.message||'视觉请求失败');return data
}
export const visionModel=()=>call<VisionModel>('/model')
export const visionList=(farm:string)=>call<VisionRecord[]>(`/jobs?farmId=${encodeURIComponent(farm)}`)
export const visionGet=(id:string)=>call<VisionRecord>(`/jobs/${id}`)
export function visionUpload(farm:string,plot:string,file:File){const form=new FormData();form.append('farmId',farm);form.append('plotId',plot);form.append('file',file);return call<VisionRecord>('/jobs',{method:'POST',body:form})}
export async function visionImage(id:string){const response=await fetch(`/api/vision/jobs/${id}/image`,{headers:{Authorization:`Bearer ${getToken()}`}});if(!response.ok)throw Error('读取原图失败');return URL.createObjectURL(await response.blob())}

export interface VisionReview {id:number;recordId:string;decision:string;note:string;createdAt:string}
export const visionReviews=(id:string)=>call<VisionReview[]>(`/jobs/${id}/reviews`)
export const visionReview=(id:string,decision:string,note:string)=>call<VisionReview>(`/jobs/${id}/reviews`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({decision,note})})
