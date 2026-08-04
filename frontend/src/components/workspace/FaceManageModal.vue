<script setup lang="ts">
import { ref, watch } from 'vue'
import FaceCapture from './FaceCapture.vue'
import { faceDelete, faceRegister, fetchMe, saveUser } from '@/api/auth'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const loading = ref(false)
const busy = ref(false)
const error = ref('')
const faceBound = ref(false)

async function refresh() {
  const me = await fetchMe()
  faceBound.value = me.faceBound
  saveUser(me)
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    error.value = ''
    loading.value = true
    try {
      await refresh()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }
)

async function handleBind(photo: Blob | File) {
  busy.value = true
  error.value = ''
  try {
    const me = await faceRegister(photo)
    faceBound.value = me.faceBound
    saveUser(me)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}

async function handleDelete() {
  busy.value = true
  error.value = ''
  try {
    const me = await faceDelete()
    faceBound.value = me.faceBound
    saveUser(me)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}

function close() {
  emit('close')
}
</script>

<template>
  <Transition name="mask">
    <div v-if="open" class="mask" @click.self="close">
      <section class="panel">
        <header>
          <div>
            <small>FACE · 百度云识别</small>
            <h2>人脸管理</h2>
          </div>
          <button aria-label="关闭" @click="close">×</button>
        </header>
        <div class="body">
          <p v-if="loading" class="hint">加载中…</p>
          <template v-else>
            <p class="status" :class="{ bound: faceBound }">
              <i></i>{{ faceBound ? '已绑定人脸，可在官网一键刷脸登录' : '未绑定人脸' }}
            </p>

            <FaceCapture v-if="!faceBound" :busy="busy" label="绑定人脸" @capture="handleBind" />
            <template v-else>
              <div class="bound-box">
                <span>✓</span>
                <p>你的人脸已录入人脸库，登录页切到「刷脸登录」即可直接进入平台。</p>
              </div>
              <button class="danger" :disabled="busy" @click="handleDelete">
                {{ busy ? '处理中…' : '解绑人脸' }}
              </button>
            </template>

            <p v-if="error" class="error" role="alert">{{ error }}</p>
          </template>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.mask { position: fixed; z-index: 90; inset: 0; display: grid; place-items: center; padding: 40px 20px; background: rgba(2,14,11,.55); backdrop-filter: blur(8px); }
.panel { width: min(420px, calc(100vw - 32px)); border: 1px solid rgba(255,255,255,.7); border-radius: 20px; background: rgba(245,247,240,.97); box-shadow: var(--shadow-lg); overflow: hidden; }
header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--border-soft); }
header small { display: block; font-size: 9px; letter-spacing: 1.6px; color: #4c895c; }
header h2 { margin: 3px 0 0; font-size: 18px; color: var(--text-primary); }
header button { width: 32px; height: 32px; border: 1px solid var(--border-soft); border-radius: 50%; background: transparent; color: var(--text-secondary); font-size: 18px; cursor: pointer; }
header button:hover { background: var(--bg-surface-strong); }
.body { display: flex; flex-direction: column; gap: 16px; padding: 20px; }
.status { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 13px; color: var(--text-secondary); }
.status i { width: 8px; height: 8px; border-radius: 50%; background: var(--warning); box-shadow: 0 0 0 4px rgba(209,170,60,.15); }
.status.bound i { background: var(--success); box-shadow: 0 0 0 4px rgba(102,129,80,.15); }
.hint { color: var(--text-tertiary); font-size: 12px; }
.bound-box { display: flex; align-items: flex-start; gap: 12px; padding: 14px; border: 1px solid rgba(102,129,80,.25); border-radius: 13px; background: rgba(102,129,80,.07); }
.bound-box span { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: var(--success); color: #fff; font-size: 13px; flex: none; }
.bound-box p { margin: 0; font-size: 12px; line-height: 1.7; color: var(--text-secondary); }
.danger { width: 100%; padding: 12px; border: 1px solid rgba(204,98,87,.35); border-radius: 12px; background: transparent; color: var(--danger); font-size: 13px; cursor: pointer; }
.danger:hover { background: rgba(204,98,87,.08); }
.danger:disabled { opacity: .55; cursor: wait; }
.error { margin: 0; padding: 10px 12px; border: 1px solid rgba(204,98,87,.3); border-radius: 10px; background: rgba(204,98,87,.06); color: var(--danger); font-size: 12px; }
.mask-enter-active, .mask-leave-active { transition: .2s; }
.mask-enter-from, .mask-leave-to { opacity: 0; }
.mask-enter-from .panel, .mask-leave-to .panel { transform: translateY(10px) scale(.98); }
</style>
