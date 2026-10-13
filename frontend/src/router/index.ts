import { createRouter, createWebHistory } from 'vue-router'
import FarmWorkspaceView from '@/views/FarmWorkspaceView.vue'
const AssistantPreviewView = () => import('@/views/AssistantPreviewView.vue')
const AgentWorkspaceView = () => import('@/views/AgentWorkspaceView.vue')
import GreenhouseInteriorView from '@/views/GreenhouseInteriorView.vue'
import { fetchMe, getToken, saveUser } from '@/api/auth'

const router = createRouter({
  history: createWebHistory('/platform/'),
  routes: [
    { path: '/crops', component: () => import('@/views/CropCenterView.vue'), meta: { title: '作物中心' } },
    { path: '/multicrop', component: () => import('@/views/MultiCropWorkspaceView.vue'), meta: { title: '多作物研判' } },
    { path: '/wheat-diagnosis', redirect: '/multicrop?crop=wheat' },
    { path: '/', redirect: '/workspaces/farm-01' },
    { path: '/assistant', component: AgentWorkspaceView, meta: { title: '盐田丰语 · 智能问农' } },
    { path: '/assistant/legacy', component: AssistantPreviewView, meta: { title: '原问农工作台' } },
    { path: '/workspaces/:id', component: FarmWorkspaceView, meta: { title: '数据工作台' } },
    { path: '/workspaces/:id/greenhouses/:greenhouseId', component: GreenhouseInteriorView, meta: { title: '大棚内部' } },
    { path: '/digital-twin', component: FarmWorkspaceView, meta: { title: '数字孪生' } },
    { path: '/:pathMatch(.*)*', redirect: '/workspaces/farm-01' }
  ]
})

router.beforeEach(async () => {
  const token = getToken()
  if (!token) {
    window.location.replace('/#/sign-in')
    return false
  }

  try {
    saveUser(await fetchMe(token))
    return true
  } catch {
    return false
  }
})

router.afterEach(to => { document.title = `${String(to.meta.title || '数据工作台')} · 盐田丰语` })

export default router
