import { ArrowRight, Bell, Bot, Boxes, Check, Cpu, Droplets, LayoutDashboard, LayoutGrid, Play, Sprout, Thermometer, Video } from 'lucide-react'
import { PageHero, IconChip, StatBand, CtaBand, SectionTitle, PrimaryButton, OutlineButton } from '../components/ui'
import { PLATFORM_URL, ASSISTANT_URL, TWIN_URL } from '../links'

const PRODUCTS = [
  {
    icon: LayoutDashboard,
    tone: 'emerald',
    name: '数据工作台',
    desc: '以全屏农场航拍实景为界面，地块、温室、气象站、蓄水池、设备、摄像头与机器人均可点选交互。',
    points: ['Hover 预览 · 单击详情 · 双击聚焦', '2.5D 实景与 3D 双视图切换', '空间对象实时状态与上下文抽屉'],
    href: PLATFORM_URL,
    cta: '进入数据工作台'
  },
  {
    icon: Bot,
    tone: 'sky',
    name: '智能问农',
    desc: '以自然语言为入口，一句话获取数据、图表、分析与操作建议，不再需要寻找菜单。',
    points: ['一句话获取实时指标', '24 小时趋势与异常标记', 'AI 建议与行动入口'],
    href: ASSISTANT_URL,
    cta: '体验智能问农'
  },
  {
    icon: Boxes,
    tone: 'violet',
    name: '数字孪生',
    desc: '2.5D 航拍实景与 Three.js WebGL 数字孪生共用对象 ID 与空间坐标，第一人称巡场身临其境。',
    points: ['共用空间坐标与对象 ID', '第一人称巡场模式', '昼夜光照与本地 3D 公模'],
    href: TWIN_URL,
    cta: '进入数字孪生'
  }
]

const DOCKS = [
  { icon: LayoutGrid, tone: 'sky', name: '总览', desc: '园区整体状态一屏尽览' },
  { icon: Video, tone: 'violet', name: '园区监控', desc: '温室与种植区实时画面' },
  { icon: Thermometer, tone: 'amber', name: '环境中心', desc: '五类指标与 AI 调控建议' },
  { icon: Cpu, tone: 'teal', name: '设备管理', desc: '地图选机、开关与自检' },
  { icon: Droplets, tone: 'emerald', name: '灌溉控制', desc: '开停、时长与计划保存' },
  { icon: Sprout, tone: 'emerald', name: '作物档案', desc: '长势、阶段与农事任务' },
  { icon: Bell, tone: 'rose', name: '告警中心', desc: '实时告警与异常处理' }
]

const HIGHLIGHTS = [
  { title: '空间对象交互', desc: '地块、温室、设备、摄像头与机器人，点击即获得上下文，无需在菜单里翻找。' },
  { title: '双视图连续传递', desc: '实景与 3D 共用对象 ID 与坐标，Hover、点击、聚焦状态在两种视角间无缝衔接。' },
  { title: '液态玻璃业务 Dock', desc: '总览、监控、环境、设备、灌溉、作物、告警七个入口，随时切换关注维度。' }
]

const CARD = 'rounded-2xl border border-slate-200 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-card-hover'

export default function Product() {
  return (
    <>
      {/* Hero */}
      <PageHero
        eyebrow="Product"
        title={
          <>
            以农场空间为主界面<br />的智慧农业工作台
          </>
        }
        subtitle="从数据工作台到智能问农，再到数字孪生，三个入口覆盖「查看 — 询问 — 身临其境」的完整体验。"
      >
        <PrimaryButton href={PLATFORM_URL}>进入平台</PrimaryButton>
        <OutlineButton href={ASSISTANT_URL}>
          <Play className="h-4 w-4" /> 体验智能问农
        </OutlineButton>
      </PageHero>

      {/* 三大核心产品 */}
      <section className="px-6 pb-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            eyebrow="Core Products"
            title="三大核心产品"
            subtitle="覆盖数据查看、自然语言询问与三维巡场三种使用方式。"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PRODUCTS.map(product => (
              <a key={product.name} href={product.href} className={`group ${CARD}`}>
                <div className="flex items-center justify-between">
                  <IconChip icon={product.icon} tone={product.tone} />
                  <ArrowRight className="h-5 w-5 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-emerald-500" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-ink">{product.name}</h3>
                <p className="mt-3 text-sm font-light text-muted leading-relaxed">{product.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {product.points.map(point => (
                    <li key={point} className="flex items-start gap-2 text-sm text-muted">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.2} />
                      {point}
                    </li>
                  ))}
                </ul>
                <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition-transform duration-200 group-hover:translate-x-1">
                  {product.cta}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 数据统计条 */}
      <StatBand
        stats={[
          { value: '3', label: '核心产品' },
          { value: '7', label: '业务模块' },
          { value: '10+', label: '空间对象' },
          { value: '2', label: '实景 / 3D 视角' }
        ]}
      />

      {/* 工作台亮点 */}
      <section className="bg-white px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionTitle
              eyebrow="Why Workbench"
              title="数据工作台为什么好用"
              subtitle="以空间为中心的交互，取代传统「左侧菜单 + 固定图表 + 大量卡片」的后台形态。"
            />
            <div className="mt-10 space-y-6">
              {HIGHLIGHTS.map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-4 w-4" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="font-medium text-ink">{item.title}</h4>
                    <p className="mt-1 text-sm font-light text-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <a
              href={PLATFORM_URL}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/20"
            >
              打开数据工作台 <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* 界面示意图（浏览器窗口 mock） */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-emerald-100/70 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card-hover">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 h-5 max-w-xs flex-1 rounded-md bg-slate-200" />
              </div>
              <div className="grid grid-cols-[1.2fr_1fr] gap-3 bg-gradient-to-br from-emerald-50/80 to-slate-50 p-5">
                <div className="space-y-2">
                  <div className="h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 opacity-90" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 rounded-lg bg-emerald-200" />
                    <div className="h-8 rounded-lg bg-teal-200" />
                  </div>
                  <div className="h-8 rounded-lg bg-slate-200" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-14 rounded-lg border-2 border-emerald-300 bg-white" />
                    <div className="h-14 rounded-lg border-2 border-slate-200 bg-white" />
                    <div className="h-14 rounded-lg border-2 border-slate-200 bg-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-2/3 rounded-md bg-emerald-300" />
                  <div className="h-3 w-full rounded-md bg-slate-200" />
                  <div className="h-3 w-5/6 rounded-md bg-slate-200" />
                  <div className="mt-3 h-10 rounded-lg bg-gradient-to-r from-emerald-500/80 to-teal-400/60" />
                  <div className="mt-2 flex gap-1.5">
                    <div className="h-10 w-10 rounded-full bg-emerald-200" />
                    <div className="h-10 w-10 rounded-full bg-teal-200" />
                    <div className="h-10 w-10 rounded-full bg-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 七大业务模块 */}
      <section className="px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            eyebrow="Seven Docks"
            title="七大业务模块"
            subtitle="液态玻璃 Dock 统一线性图标，一键切换关注维度。"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {DOCKS.map(dock => (
              <div key={dock.name} className={CARD}>
                <div className="flex items-start gap-4">
                  <IconChip icon={dock.icon} tone={dock.tone} className="h-11 w-11 shrink-0 rounded-xl" />
                  <div>
                    <h4 className="font-medium text-ink">{dock.name}</h4>
                    <p className="mt-1 text-xs font-light text-muted">{dock.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaBand
        title="现在就走进你的农场"
        subtitle="无需寻找数据，直接询问数据；不必浏览报表，直接进入农场。"
        href={PLATFORM_URL}
        label="进入平台"
      />
    </>
  )
}
