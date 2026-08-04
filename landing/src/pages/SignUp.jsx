import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignInPage } from '../components/ui/sign-in'
import FaceCapture from '../components/FaceCapture'
import { register, faceRegister, saveAuth } from '../api/auth'
import { ArrowRight } from 'lucide-react'

// 平台是独立的 Vue SPA（history 路由在 /platform/），注册/绑定成功后需整页跳转
const PLATFORM_URL = '/platform/'

const TESTIMONIALS = [
  {
    avatarSrc: 'https://randomuser.me/api/portraits/women/57.jpg',
    name: '李哲',
    handle: '温室种植主管',
    text: '把六座温室装进一个数字孪生里，巡场和查数据都省了太多时间。'
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/64.jpg',
    name: '王岚',
    handle: '农场运营经理',
    text: '一句话就能问出土壤湿度趋势，还能直接给灌溉建议，真不用翻报表了。'
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: '陈方',
    handle: '农业数字化顾问',
    text: '实景和 3D 共用一套坐标，给客户演示效果非常直观。'
  }
]

export default function SignUp() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [step, setStep] = useState('form') // 'form' | 'face'
  const [faceBusy, setFaceBusy] = useState(false)

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())
    if (data.password !== data.confirm) {
      setError('两次输入的密码不一致，请重新输入。')
      return
    }
    try {
      const auth = await register({ name: data.name, email: data.email, password: data.password })
      saveAuth(auth)
      setStep('face')
    } catch (err) {
      setError(err.message || '注册失败，请稍后再试')
    }
  }

  const handleFaceBind = async (photo) => {
    setError('')
    setFaceBusy(true)
    try {
      await faceRegister(photo)
      window.location.href = PLATFORM_URL
    } catch (err) {
      setError(err.message || '人脸绑定失败，请重试')
      setFaceBusy(false)
    }
  }

  // 注册成功后的可选「绑定人脸」步骤
  if (step === 'face') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-page p-8">
        <div className="flex w-full max-w-md flex-col gap-6 text-center">
          <span className="animate-element inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Face Binding
          </span>
          <h1 className="animate-element animate-delay-100 font-instrument-serif text-4xl text-ink md:text-5xl">绑定人脸</h1>
          <p className="animate-element animate-delay-200 font-light text-muted">
            注册成功！绑定人脸后，下次在官网即可直接刷脸登录。
          </p>
          <div className="animate-element animate-delay-300">
            <FaceCapture onCapture={handleFaceBind} busy={faceBusy} label="绑定并进入" />
          </div>
          {error && (
            <p className="animate-element rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600" role="alert">
              {error}
            </p>
          )}
          <button
            onClick={() => { window.location.href = PLATFORM_URL }}
            className="animate-element animate-delay-400 inline-flex items-center justify-center gap-1.5 text-sm font-light text-muted transition-colors hover:text-ink"
          >
            跳过，稍后在平台设置中绑定 <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <SignInPage
      mode="sign-up"
      title="创建账号"
      description="注册田言耕智，把数据带进你的农场。"
      heroImageSrc="/assets/uc.png"
      testimonials={TESTIMONIALS}
      error={error}
      onSignUp={handleSignUp}
      onGoogleSignIn={() => setError('演示环境：Google 登录暂未接入。')}
      onSignInLink={() => navigate('/sign-in')}
      backHref="/#/"
      backLabel="返回官网"
    />
  )
}
