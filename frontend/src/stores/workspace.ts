import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { BusinessModule, SceneEntity, ViewMode } from '@/types'
import { applyDashboard, sceneEntities } from '@/data/farm'
import { fetchDashboard } from '@/api/dashboard'

export const useWorkspaceStore = defineStore('workspace', () => {
  const viewMode = ref<ViewMode>('aerial')
  const activeModule = ref<BusinessModule>('overview')
  const selectedEntityId = ref<string | null>('field-04')
  const drawerOpen = ref(true)
  const environmentMetric = ref('soilMoisture')
  const layersOpen = ref(false)
  const activeSubLayer = ref('health')
  const loading = ref(false)
  const loadError = ref('')
  const lastSyncedAt = ref<string | null>(null)

  const selectedEntity = computed<SceneEntity | undefined>(() =>
    sceneEntities.find(item => item.id === selectedEntityId.value)
  )

  function selectEntity(id: string | null) {
    selectedEntityId.value = id
    drawerOpen.value = Boolean(id)
  }

  function selectModule(module: BusinessModule) {
    activeModule.value = module
    const defaults: Record<BusinessModule, string> = { overview: 'health', monitoring: 'all-cameras', environment: 'soilMoisture', devices: 'all-devices', irrigation: 'network', crops: 'health', alerts: 'all-alerts' }
    activeSubLayer.value = defaults[module]
    if (module === 'alerts') selectEntity('field-04')
  }

  async function loadDashboard(force = false) {
    if (loading.value || (lastSyncedAt.value && !force)) return
    loading.value = true
    loadError.value = ''
    try {
      const snapshot = await fetchDashboard('farm-01')
      applyDashboard(snapshot)
      lastSyncedAt.value = snapshot.generatedAt
    } catch (error) {
      loadError.value = error instanceof Error ? error.message : '数据加载失败'
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    viewMode,
    activeModule,
    selectedEntityId,
    selectedEntity,
    drawerOpen,
    environmentMetric,
    layersOpen,
    activeSubLayer,
    loading,
    loadError,
    lastSyncedAt,
    selectEntity,
    selectModule,
    loadDashboard
  }
})
