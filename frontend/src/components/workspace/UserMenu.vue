<script setup lang="ts">
import { ref } from 'vue'
import { clearAuth, getUser } from '@/api/auth'
import FaceManageModal from './FaceManageModal.vue'

defineProps<{ dark?: boolean }>()
const user = ref(getUser())
const open = ref(false)
const faceModalOpen = ref(false)

function toggle() {
  open.value = !open.value
}

function openFace() {
  open.value = false
  faceModalOpen.value = true
}

function logout() {
  clearAuth()
  open.value = false
  window.location.href = '/#/'
}

function goSignIn() {
  window.location.href = '/#/sign-in'
}
</script>

<template>
  <div class="user-menu">
    <button class="avatar" :class="{ dark }" @click="toggle" :aria-label="user ? `用户 ${user.name}` : '登录'">
      <span v-if="user" class="avatar-inner">{{ user.name?.slice(0, 1) || '用' }}</span>
      <span v-else>登录</span>
    </button>

    <Transition name="menu">
      <div v-if="open" class="dropdown" @click.self="open = false">
        <template v-if="user">
          <div class="info">
            <strong>{{ user.name }}</strong>
            <small>{{ user.email }}</small>
          </div>
          <button class="item" @click="openFace">人脸管理</button>
          <button class="item" @click="logout">退出登录</button>
        </template>
        <template v-else>
          <button class="item" @click="goSignIn">登录 / 注册</button>
        </template>
      </div>
    </Transition>

    <FaceManageModal :open="faceModalOpen" @close="faceModalOpen = false" />
  </div>
</template>

<style scoped lang="scss">
.user-menu { position: relative; }
.avatar { height: 42px; padding: 0 15px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,.34); background: rgba(255,255,255,.3); backdrop-filter: blur(18px); border-radius: 999px; color: #15251c; font-size: 13px; font-weight: 600; cursor: pointer; }
.avatar.dark { background: rgba(7,35,28,.32); border-color: rgba(255,255,255,.14); color: #fff; }
.avatar-inner { display: grid; place-items: center; width: 25px; height: 25px; border-radius: 50%; background: #3e7c4f; color: #fff; font-size: 11px; }
.dropdown { position: absolute; right: 0; top: 50px; width: 210px; padding: 8px; border: 1px solid rgba(255,255,255,.7); border-radius: 14px; background: rgba(245,247,240,.96); box-shadow: var(--shadow-lg); backdrop-filter: blur(24px); z-index: 60; }
.dropdown .info { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px 10px; border-bottom: 1px solid var(--border-soft); margin-bottom: 6px; }
.dropdown .info strong { font-size: 14px; color: var(--text-primary); }
.dropdown .info small { font-size: 12px; color: var(--text-tertiary); }
.item { width: 100%; text-align: left; padding: 10px; border: 0; border-radius: 9px; background: transparent; font-size: 13px; color: var(--text-primary); cursor: pointer; }
.item:hover { background: #e8ece2; color: #3e5b44; }
.menu-enter-active, .menu-leave-active { transition: .18s; }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
