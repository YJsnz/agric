import axios from 'axios'
const client=axios.create({baseURL:'',timeout:540000})
client.interceptors.request.use(config=>{
  if(config.data instanceof FormData){
    const bytes=[...config.data.values()].reduce((sum,value)=>sum+(value instanceof Blob?value.size:0),0)
    if(bytes>8*1024*1024){const error=new Error('所有上传图片总大小不能超过 8 MB');error.code='UPLOAD_TOO_LARGE';throw error}
  }
  const token=localStorage.getItem('ty_token')??sessionStorage.getItem('ty_token')
  if(token)config.headers.Authorization='Bearer '+token
  config.url=config.url.replace(/^\/api\//,'/api/multicrop/')
  return config
})
export default client
