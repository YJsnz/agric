import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignInPage } from '../components/ui/sign-in'
import { login, faceLogin, saveAuth } from '../api/auth'

// 平台是独立的 Vue SPA（history 路由在 /platform/），登录成功后需整页跳转
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

export default function SignIn() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [faceBusy, setFaceBusy] = useState(false)
  const [submitBusy, setSubmitBusy] = useState(false)

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())
    setSubmitBusy(true)
    try {
      const auth = await login({ email: data.email, password: data.password })
      saveAuth(auth, data.rememberMe === 'on')
      window.location.href = PLATFORM_URL
    } catch (err) {
      setError(err.message || '登录失败，请稍后再试')
      setSubmitBusy(false)
    }
  }

  const handleFaceLogin = async (photo) => {
    setError('')
    setFaceBusy(true)
    try {
      const auth = await faceLogin(photo)
      saveAuth(auth)
      window.location.href = PLATFORM_URL
    } catch (err) {
      setError(err.message || '人脸登录失败，请重试')
      setFaceBusy(false)
    }
  }

  return (
    <SignInPage
      mode="sign-in"
      title="欢迎回来"
      description="登录你的田言耕智账号，继续查看你的农场。"
      heroImageSrc="/assets/uc.png"
      testimonials={TESTIMONIALS}
      error={error}
      submitBusy={submitBusy}
      enableFace
      faceBusy={faceBusy}
      onFaceLogin={handleFaceLogin}
      onSignIn={handleSignIn}
      onResetPassword={() => { window.location.href = 'mailto:support@tianyan.agri?subject=田言耕智账号密码重置' }}
      onCreateAccount={() => navigate('/sign-up')}
      backHref="/#/"
      backLabel="返回官网"
    />
  )
}
