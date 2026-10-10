import { reactive } from 'vue'
import type { WheatResult } from '@/api/wheat'
// Memory only: images and observations are not persisted in localStorage.
export const wheatDiagnosis = reactive({ result: null as WheatResult | null, previews: {} as Record<string, string> })

