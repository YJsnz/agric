import { createRouter, createWebHistory } from 'vue-router'
import FarmWorkspaceView from '@/views/FarmWorkspaceView.vue'
import AssistantPreviewView from '@/views/AssistantPreviewView.vue'
import GreenhouseInteriorView from '@/views/GreenhouseInteriorView.vue'
import { fetchMe, getToken, saveUser } from '@/api/auth'

const router = createRouter({
  history: createWebHistory('/platform/'),
  routes: [
    { path: '/crops/wheat/vision', name: 'wheat-vision', component: () => import('@/views/WheatDiagnosisView.vue'), meta: { title: '旱碱麦AI视觉识别' } },
    { path: '/crops/wheat/risk', name: 'wheat-risk', component: () => import('@/views/WheatDiagnosisView.vue'), meta: { title: '旱碱麦AI风险详情' } },
    { path: '/', redirect: '/workspaces/farm-01' },
    { path: '/assistant', component: AssistantPreviewView, meta: { title: '智能问农' } },
    { path: '/workspaces/:id', component: FarmWorkspaceView, meta: { title: '数据工作台' } },
    { path: '/workspaces/:id/greenhouses/:greenhouseId', component: GreenhouseInteriorView, meta: { title: '大棚内部' } },
    { path: '/digital-twin', component: FarmWorkspaceView, meta: { title: '数字孪生' } },
    { path: '/:pathMatch(.*)*', redirect: '/workspaces/farm-01' }
  ]
})

router.beforeEach(async to => {
  // Resume only this known local destination after the existing sign-in flow.
  const visionDestination = '/workspaces/farm-01?module=vision'
  if (to.path === '/workspaces/farm-01' && to.query.module === 'vision') {
    sessionStorage.setItem('ty_pending_vision', visionDestination)
  }
  const token = getToken()
  if (!token) {
    window.location.replace('/#/sign-in')
    return false
  }

  try {
    saveUser(await fetchMe(token))
    if (sessionStorage.getItem('ty_pending_vision') === visionDestination) {
      sessionStorage.removeItem('ty_pending_vision')
      if (to.fullPath !== visionDestination) return visionDestination
    }
    return true
  } catch {
    return false
  }
})

router.afterEach(to => { document.title = `${String(to.meta.title || '数据工作台')} · 田言耕智` })

export default router
