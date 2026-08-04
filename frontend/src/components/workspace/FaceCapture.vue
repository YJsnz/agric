<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const props = defineProps<{ busy?: boolean; label?: string }>()
const emit = defineEmits<{ (e: 'capture', photo: Blob | File): void }>()

const videoRef = ref<HTMLVideoElement | null>(null)
const camError = ref('')
const snap = ref('')
let stream: MediaStream | null = null

void startCamera()

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    })
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      void videoRef.value.play().catch(() => {})
    }
  } catch {
    camError.value = '无法打开摄像头，请允许权限或改用下方图片上传'
  }
}

onBeforeUnmount(() => stream?.getTracks().forEach((t) => t.stop()))

function capture() {
  const video = videoRef.value
  if (!video || !video.videoWidth) return
  const canvas = document.createElement('canvas')
  const scale = 512 / video.videoWidth
  canvas.width = 512
  canvas.height = Math.round(video.videoHeight * scale)
  canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
  snap.value = canvas.toDataURL('image/jpeg', 0.9)
}

function reset() {
  snap.value = ''
  camError.value = ''
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [, b64] = dataUrl.split(',')
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: 'image/jpeg' })
}

function submit() {
  if (snap.value) emit('capture', dataUrlToBlob(snap.value))
}

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) emit('capture', file)
}
</script>

<template>
  <div class="face-capture">
    <div class="stage">
      <img v-if="snap" :src="snap" alt="人脸预览" class="preview" />
      <video v-else ref="videoRef" playsinline muted class="preview" />
      <p v-if="camError && !snap" class="cam-error">{{ camError }}</p>
    </div>
    <div class="actions">
      <template v-if="snap">
        <button type="button" class="ghost" @click="reset">重拍</button>
        <button type="button" class="primary" :disabled="busy" @click="submit">{{ busy ? '识别中…' : props.label || '确认' }}</button>
      </template>
      <template v-else>
        <button type="button" class="primary" @click="capture">拍照</button>
        <label class="ghost upload">
          上传图片
          <input type="file" accept="image/*" hidden @change="onFile" />
        </label>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.face-capture { display: flex; flex-direction: column; gap: 12px; }
.stage { position: relative; aspect-ratio: 4/3; overflow: hidden; border-radius: 16px; background: #0f201a; }
.preview { width: 100%; height: 100%; object-fit: cover; display: block; }
.cam-error { position: absolute; inset: 0; display: grid; place-items: center; padding: 16px; text-align: center; font-size: 12px; color: rgba(255,255,255,.75); }
.actions { display: flex; justify-content: center; gap: 10px; }
.actions button, .actions label { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 20px; border-radius: 12px; font-size: 13px; cursor: pointer; }
.actions button { border: 0; }
.upload { border: 1px solid rgba(47,59,42,.18); background: transparent; color: #2f3b2a; }
.upload:hover { background: rgba(47,59,42,.06); }
.primary { background: #3e7c4f; color: #fff; }
.primary:hover { background: #356c44; }
.primary:disabled { opacity: .55; cursor: wait; }
</style>
