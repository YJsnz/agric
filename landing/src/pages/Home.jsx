import { ArrowRight, Play } from 'lucide-react'
import { PLATFORM_URL, ASSISTANT_URL } from '../links'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204103_f607742e-09da-4cf5-bb06-4e67b0a531de.mp4'

export default function Home() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* 背景：全屏循环背景视频，航拍图作为加载兜底 */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/farm-aerial.png"
          src={VIDEO_URL}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/65" />
      </div>

      {/* 内容层 */}
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center -translate-y-10 sm:-translate-y-14">
          <h1 className="font-instrument-serif max-w-5xl text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]">
            AI 原生 <span className="italic">与</span> 数字孪生
            <br />
            专为 <span className="italic">现代农业</span> 打造
            <br />
            让耕种更智慧
          </h1>

          <p className="mt-4 max-w-md font-light text-sm text-white/70 leading-relaxed md:mt-5 md:text-base">
            我们以自然语言为入口，以农场空间为主界面
            <br className="hidden sm:block" />
            用数据、视觉识别与 AI，覆盖种植到农事执行
          </p>

          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row md:mt-6">
            <a
              href={PLATFORM_URL}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition-colors duration-200 hover:bg-white/90"
            >
              进入平台
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a
              href={ASSISTANT_URL}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-white/60 hover:bg-white/10"
            >
              <Play className="h-4 w-4" />
              体验智能问农
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
