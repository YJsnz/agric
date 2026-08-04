import { createRouter, createWebHistory } from 'vue-router'
import FarmWorkspaceView from '@/views/FarmWorkspaceView.vue'
import AssistantPreviewView from '@/views/AssistantPreviewView.vue'

const router = createRouter({
  history: createWebHistory('/platform/'),
  routes: [
    { path: '/', redirect: '/workspaces/farm-01' },
    { path: '/assistant', component: AssistantPreviewView, meta: { title: '智能问农' } },
    { path: '/workspaces/:id', component: FarmWorkspaceView, meta: { title: '数据工作台' } },
    { path: '/digital-twin', component: FarmWorkspaceView, meta: { title: '数字孪生' } },
    { path: '/:pathMatch(.*)*', redirect: '/workspaces/farm-01' }
  ]
})

router.afterEach(to => { document.title = `${String(to.meta.title || '数据工作台')} · 田言耕智` })

export default router
