import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import FaceCapture from '../FaceCapture'

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
)

// --- TYPE DEFINITIONS ---

export const DEFAULT_TESTIMONIALS = [
  {
    avatarSrc: 'https://randomuser.me/api/portraits/women/57.jpg',
    name: 'Sarah Chen',
    handle: '@sarahdigital',
    text: 'Amazing platform! The user experience is seamless and the features are exactly what I needed.'
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/64.jpg',
    name: 'Marcus Johnson',
    handle: '@marcustech',
    text: 'This service has transformed how I work. Clean design, powerful features, and excellent support.'
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'David Martinez',
    handle: '@davidcreates',
    text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful for productivity."
  }
]

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    {children}
  </div>
)

const TestimonialCard = ({ testimonial, delay }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-card/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/10 p-5 w-64`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium text-foreground">{testimonial.name}</p>
      <p className="text-muted-foreground">{testimonial.handle}</p>
      <p className="mt-1 text-foreground/80">{testimonial.text}</p>
    </div>
  </div>
)

// --- MAIN COMPONENT ---

/**
 * 登录 / 注册 通用页面组件（按 shadcn 模板风格实现）
 *
 * props:
 *  - mode: 'sign-in' | 'sign-up'，决定渲染登录表单还是注册表单
 *  - title / description: 左侧标题与副文案（可传 ReactNode）
 *  - heroImageSrc: 右侧大图；传入时右侧面板才显示
 *  - testimonials: 评价卡片数组（含 avatarSrc/name/handle/text）
 *  - onSignIn: 登录表单提交回调
 *  - onSignUp: 注册表单提交回调
 *  - onFaceLogin: 刷脸登录回调（收到 Blob），配合 enableFace 使用
 *  - faceBusy / error: 人脸识别中的 loading 态与统一错误信息
 *  - enableFace: 是否显示「密码/刷脸」切换（仅登录页需要）
 *  - onGoogleSignIn / onResetPassword / onCreateAccount / onSignInLink: 各按钮/链接回调
 *  - backHref / backLabel: 可选返回链接（显示在标题上方）
 */
export const SignInPage = ({
  mode = 'sign-in',
  title = <span className="font-light text-foreground tracking-tighter">Welcome</span>,
  description = 'Access your account and continue your journey with us',
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onSignUp,
  onFaceLogin,
  faceBusy = false,
  submitBusy = false,
  enableFace = false,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  onSignInLink,
  backHref,
  backLabel,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [faceMode, setFaceMode] = useState(false)
  const isSignUp = mode === 'sign-up'

  // 注册模式多出 称呼 + 确认密码，入场动画延迟整体后移
  const d = {
    title: 'animate-delay-100',
    desc: 'animate-delay-200',
    name: isSignUp ? 'animate-delay-300' : '',
    email: isSignUp ? 'animate-delay-400' : 'animate-delay-300',
    password: isSignUp ? 'animate-delay-500' : 'animate-delay-400',
    confirm: isSignUp ? 'animate-delay-600' : '',
    extras: isSignUp ? '' : 'animate-delay-500',
    submit: isSignUp ? 'animate-delay-700' : 'animate-delay-600',
    divider: isSignUp ? 'animate-delay-800' : 'animate-delay-700',
    social: isSignUp ? 'animate-delay-900' : 'animate-delay-800',
    footer: isSignUp ? 'animate-delay-1000' : 'animate-delay-900'
  }

  const inputCls = 'w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none'

  const modeTabCls = (active) =>
    `flex-1 rounded-full py-2 transition-colors ${
      active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
    }`

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw]">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {backHref && (
              <a href={backHref} className="animate-element text-sm text-muted-foreground transition-colors hover:text-foreground">
                {backLabel || '← Back'}
              </a>
            )}

            {enableFace && (
              <div className="animate-element flex rounded-full border border-border p-1 text-sm">
                <button type="button" onClick={() => setFaceMode(false)} className={modeTabCls(!faceMode)}>
                  密码登录
                </button>
                <button type="button" onClick={() => setFaceMode(true)} className={modeTabCls(faceMode)}>
                  刷脸登录
                </button>
              </div>
            )}

            {faceMode ? (
              <>
                <div className="animate-element animate-delay-100">
                  <h1 className="text-4xl md:text-5xl font-semibold leading-tight">刷脸登录</h1>
                  <p className="mt-2 text-muted-foreground">保持面部正对摄像头，光线充足即可识别</p>
                </div>
                <div className="animate-element animate-delay-200">
                  <FaceCapture onCapture={onFaceLogin} busy={faceBusy} label="登录" allowUpload={false} />
                </div>
              </>
            ) : (
              <>
                <h1 className={`animate-element ${d.title} text-4xl md:text-5xl font-semibold leading-tight`}>{title}</h1>
                <p className={`animate-element ${d.desc} text-muted-foreground`}>{description}</p>

                <form className="space-y-5" onSubmit={isSignUp ? onSignUp : onSignIn}>
                  {isSignUp && (
                    <div className={`animate-element ${d.name}`}>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <GlassInputWrapper>
                        <input name="name" type="text" required placeholder="How should we address you" className={inputCls} />
                      </GlassInputWrapper>
                    </div>
                  )}

                  <div className={`animate-element ${d.email}`}>
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <GlassInputWrapper>
                      <input name="email" type="email" required placeholder="Enter your email address" className={inputCls} />
                    </GlassInputWrapper>
                  </div>

                  <div className={`animate-element ${d.password}`}>
                    <label className="text-sm font-medium text-muted-foreground">Password</label>
                    <GlassInputWrapper>
                      <div className="relative">
                        <input name="password" type={showPassword ? 'text' : 'password'} required minLength={isSignUp ? 6 : undefined} placeholder={isSignUp ? 'At least 6 characters' : 'Enter your password'} className={`${inputCls} pr-12`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-3 flex items-center">
                          {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
                        </button>
                      </div>
                    </GlassInputWrapper>
                  </div>

                  {isSignUp && (
                    <div className={`animate-element ${d.confirm}`}>
                      <label className="text-sm font-medium text-muted-foreground">Confirm Password</label>
                      <GlassInputWrapper>
                        <div className="relative">
                          <input name="confirm" type={showConfirm ? 'text' : 'password'} required placeholder="Re-enter your password" className={`${inputCls} pr-12`} />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-3 flex items-center">
                            {showConfirm ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
                          </button>
                        </div>
                      </GlassInputWrapper>
                    </div>
                  )}

                  {!isSignUp && (
                    <div className={`animate-element ${d.extras} flex items-center justify-between text-sm`}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                        <span className="text-foreground/90">Keep me signed in</span>
                      </label>
                      <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} className="hover:underline text-violet-400 transition-colors">Reset password</a>
                    </div>
                  )}

                  <button type="submit" disabled={submitBusy} className={`animate-element ${d.submit} w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-60`}>
                    {submitBusy ? '请稍候…' : (isSignUp ? 'Create Account' : 'Sign In')}
                  </button>
                </form>
              </>
            )}

            {error && (
              <div className="animate-element rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600" role="alert">
                {error}
              </div>
            )}

            {!faceMode && onGoogleSignIn && (
              <>
                <div className={`animate-element ${d.divider} relative flex items-center justify-center`}>
                  <span className="w-full border-t border-border"></span>
                  <span className="px-4 text-sm text-muted-foreground bg-background absolute">Or continue with</span>
                </div>

                <button onClick={onGoogleSignIn} className={`animate-element ${d.social} w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-colors`}>
                  <GoogleIcon />
                  Continue with Google
                </button>
              </>
            )}

            <button
              type="button"
              onClick={isSignUp ? onSignInLink : onCreateAccount}
              className={`animate-element ${d.footer} w-full rounded-2xl border border-border bg-background/55 py-3.5 text-sm font-medium text-foreground transition-all hover:border-primary/35 hover:bg-primary/5 hover:text-primary`}
            >
              {isSignUp ? '已有账号，返回登录' : '还没有账号？立即注册'}
            </button>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center" style={{ backgroundImage: `url(${heroImageSrc})` }}></div>
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" /></div>}
              {testimonials[2] && <div className="hidden 2xl:flex"><TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" /></div>}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default SignInPage
