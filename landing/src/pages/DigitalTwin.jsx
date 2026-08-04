import { ArrowRight, Boxes, Check, Eye, MapPin, Moon, Sun, Wrench } from 'lucide-react'
import { PageHero, IconChip, StatBand, CtaBand, SectionTitle, PrimaryButton, OutlineButton } from '../components/ui'
import { TWIN_URL, PLATFORM_URL } from '../links'

const FEATURES = [
  {
    icon: Boxes,
    tone: 'emerald',
    title: '本地 GLB 公模',
    desc: '8 个 CC0 农业公模由本地加载，模型按包围盒自动归一化并落到地面，替换模型只需改资源地址与坐标。'
  },
  {
    icon: Sun,
    tone: 'amber',
    title: '昼夜光照同步',
    desc: '3D 天空按本地真实时间同步昼夜光照、晨昏色温、星空与缓慢移动的云层，光影真实可信。'
  },
  {
    icon: Eye,
    tone: 'sky',
    title: '第一人称巡场',
    desc: 'WASD 移动、鼠标控制视角、Shift 加速、准星选择设施、Esc 退出；温室与设备带碰撞箱并支持贴边滑动。'
  },
  {
    icon: MapPin,
    tone: 'violet',
    title: '六座温室',
    desc: '按业务数据分别种植番茄、草莓、黄瓜、育苗、叶菜与生态番茄，配有独立风机、控制箱、状态屏与指示灯。'
  },
  {
    icon: Moon,
    tone: 'teal',
    title: '双视图统一坐标',
    desc: '实景与 3D 共用对象 ID 与空间坐标，Hover 预览、单击详情、双击聚焦状态可连续传递。'
  },
  {
    icon: Wrench,
    tone: 'rose',
    title: '性能优化',
    desc: '重复作物以 InstancedMesh 批量渲染，独立像素比、静态阴影按需刷新，园区道路轻量化细节。'
  }
]

const KEYS = ['W', 'A', 'S', 'D', 'Shift', 'Esc']
const TOUR_POINTS = [
  '数字键 1–7 快速切换总览、监控、环境、设备、灌溉、作物与告警 Dock',
  '温室门口设置对应作物的卡通圆形徽章，近景即可识别棚内品种',
  '场景含可交互的渠道闸门、控制屏、增压泵组与运行灯',
  '鸟瞰视角支持拖动旋转、滚轮缩放与对象点击'
]

const CARD = 'rounded-2xl border border-slate-200 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-card-hover'

export default function DigitalTwin() {
  return (
    <>
      {/* Hero */}
      <PageHero
        eyebrow="Digital Twin"
        title={
          <>
            一个农场，两种视角<br />实景与数字孪生
          </>
        }
        subtitle="2.5D 航拍实景与 Three.js WebGL 数字孪生共用对象 ID 与空间坐标，交互状态在两种视角间连续传递。"
      >
        <PrimaryButton href={TWIN_URL}>进入数字孪生</PrimaryButton>
        <OutlineButton href={PLATFORM_URL}>返回实景工作台</OutlineButton>
      </PageHero>

      {/* 能力特性 */}
      <section className="px-6 pb-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            eyebrow="Capabilities"
            title="数字孪生能力"
            subtitle="从建模到渲染，从视角到交互，构建可实时互动的虚拟农场。"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(feature => (
              <div key={feature.title} className={CARD}>
                <IconChip icon={feature.icon} tone={feature.tone} />
                <h3 className="mt-6 text-lg font-semibold text-ink">{feature.title}</h3>
                <p className="mt-3 text-sm font-light text-muted leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 第一人称巡场 */}
      <section className="bg-white px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            {/* 3D 场景示意 */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 shadow-card-hover">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 h-5 max-w-[140px] flex-1 rounded-md bg-white/10" />
              </div>
              <div className="relative h-72">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#2f9e63_0%,transparent_55%),linear-gradient(180deg,#0d3322,#071a11)]" />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#071a11] to-transparent" />
                <div className="absolute left-8 top-8 grid grid-cols-3 gap-2 opacity-90">
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-6 w-10 rounded-t-md bg-emerald-400/60" />
                  ))}
                </div>
                <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-2 w-12 rounded-full bg-emerald-400/40" />
                  ))}
                </div>
                <div className="absolute right-8 top-6 h-2 w-14 rounded-full bg-emerald-400/60" />
                <div className="absolute bottom-8 right-8 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-white/80">3D 场景 · 实时渲染</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionTitle
              eyebrow="First Person Tour"
              title="第一人称巡场，像走进农场一样"
              subtitle="在 3D 场景里自由穿行，用准星选择温室与设备，像实地巡检一样查看每一处设施。"
            />
            <div className="mt-6 flex flex-wrap gap-2.5">
              {KEYS.map(key => (
                <kbd
                  key={key}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm"
                >
                  {key}
                </kbd>
              ))}
            </div>
            <ul className="mt-8 space-y-3.5">
              {TOUR_POINTS.map(point => (
                <li key={point} className="flex items-start gap-3 text-sm text-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3 w-3" strokeWidth={2.4} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <a
              href={TWIN_URL}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/20"
            >
              开始巡场 <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 数据统计条 */}
      <StatBand
        stats={[
          { value: '8', label: '本地 GLB 公模' },
          { value: '6', label: '座温室作物' },
          { value: '60', label: 'FPS 场景刷新' },
          { value: '1', label: '套共享坐标' }
        ]}
      />

      {/* CTA */}
      <CtaBand
        title="用三维视角，重新认识你的农场"
        subtitle="点击即可在 2.5D 实景与 3D 数字孪生之间切换，状态与对象全程一致。"
        href={TWIN_URL}
        label="进入数字孪生"
      />
    </>
  )
}
