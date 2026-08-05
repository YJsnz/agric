import { useEffect, useRef, useState } from 'react'
import { Camera, RefreshCw, Upload } from 'lucide-react'

/**
 * 人脸采集组件：优先摄像头实时取景拍照；人脸绑定场景可选择允许图片上传。
 * 拍照结果压缩为 ~512px JPEG，通过 onCapture(blob) 回调交给调用方。
 */
export default function FaceCapture({ onCapture, busy = false, label = '识别', allowUpload = true }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [camError, setCamError] = useState('')
  const [snap, setSnap] = useState(null) // dataURL

  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      } catch {
        if (!cancelled) {
          setCamError(allowUpload
            ? '无法打开摄像头，请允许访问权限，或改用下方图片上传'
            : '无法打开摄像头，请允许浏览器访问摄像头后重试')
        }
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  function capture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    const scale = 512 / video.videoWidth
    canvas.width = 512
    canvas.height = Math.round(video.videoHeight * scale)
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    setSnap(canvas.toDataURL('image/jpeg', 0.9))
  }

  function reset() {
    setSnap(null)
    setCamError('')
  }

  function dataUrlToBlob(dataUrl) {
    const [meta, b64] = dataUrl.split(',')
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return new Blob([bytes], { type: 'image/jpeg' })
  }

  function submit() {
    if (snap) onCapture(dataUrlToBlob(snap))
  }

  function onFile(e) {
    const file = e.target.files?.[0]
    if (file) onCapture(file)
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-foreground/5">
        {snap ? (
          <img src={snap} alt="captured face" className="h-full w-full object-cover" />
        ) : (
          <>
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
            {camError && (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
                {camError}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        {snap ? (
          <>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm transition-colors hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" /> 重拍
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={submit}
              className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              <Camera className="h-4 w-4" /> {busy ? '识别中…' : label}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={capture}
              className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Camera className="h-4 w-4" /> 拍照
            </button>
            {allowUpload && (
              <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm transition-colors hover:bg-secondary">
                <Upload className="h-4 w-4" /> 上传图片
                <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              </label>
            )}
          </>
        )}
      </div>
    </div>
  )
}
