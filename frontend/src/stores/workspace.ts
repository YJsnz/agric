import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { BusinessModule, SceneEntity, ViewMode } from '@/types'
import { sceneEntities } from '@/data/farm'

export const useWorkspaceStore = defineStore('workspace', () => {
  const viewMode = ref<ViewMode>('aerial')
  const activeModule = ref<BusinessModule>('overview')
  const selectedEntityId = ref<string | null>('field-04')
  const drawerOpen = ref(true)
  const environmentMetric = ref('soilMoisture')
  const layersOpen = ref(false)
  const activeSubLayer = ref('health')

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

  return {
    viewMode,
    activeModule,
    selectedEntityId,
    selectedEntity,
    drawerOpen,
    environmentMetric,
    layersOpen,
    activeSubLayer,
    selectEntity,
    selectModule
  }
})
