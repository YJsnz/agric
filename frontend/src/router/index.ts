import { createRouter, createWebHistory } from 'vue-router'
import FarmWorkspaceView from '@/views/FarmWorkspaceView.vue'
import AssistantPreviewView from '@/views/AssistantPreviewView.vue'
import GreenhouseInteriorView from '@/views/GreenhouseInteriorView.vue'
import { fetchMe, getToken, saveUser } from '@/api/auth'

const router = createRouter({
  history: createWebHistory('/platform/'),
  routes: [
    { path: '/', redirect: '/workspaces/farm-01' },
    { path: '/assistant', component: AssistantPreviewView, meta: { title: '智能问农' } },
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

router.afterEach(to => { document.title = `${String(to.meta.title || '数据工作台')} · 田言耕智` })

export default router
