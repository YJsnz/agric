import { ArrowRight, Bell, Camera, Check, Cpu, Droplets, LineChart, Radar, Sprout, Thermometer, Workflow } from 'lucide-react'
import { PageHero, IconChip, StatBand, CtaBand, SectionTitle, PrimaryButton, OutlineButton } from '../components/ui'
import { PLATFORM_URL, ASSISTANT_URL } from '../links'

const SOLUTIONS = [
  {
    icon: Droplets,
    tone: 'emerald',
    name: '智能灌溉控制',
    desc: '可视化渠道与可控灌溉单元，支持一键开停、灌溉时长设定与计划保存，精准用水、不浪费一滴。'
  },
  {
    icon: Thermometer,
    tone: 'amber',
    name: '环境中心',
    desc: '温度、空气湿度、土壤湿度、光照与 CO₂ 实时监测，24 小时趋势分析，附 AI 调控建议。'
  },
  {
    icon: Cpu,
    tone: 'teal',
    name: '设备管理',
    desc: '地图选机、在线与异常状态识别，支持设备开关、自检与参数配置入口。'
  },
  {
    icon: Camera,
    tone: 'violet',
    name: '园区监控',
    desc: '选择任意温室或种植区打开实时画面，摄像头切换、AI 识别（人员与作物）与截图录像。'
  },
  {
    icon: Sprout,
    tone: 'emerald',
    name: '作物档案',
    desc: '按温室或地块展示长势、生育阶段、病虫害风险与农事任务，种植全程可追溯。'
  },
  {
    icon: Bell,
    tone: 'rose',
    name: '告警中心',
    desc: '实时告警事件与异常定位，空间对象标注风险点，快速响应不遗漏。'
  }
]

const STEPS = [
  {
    icon: Radar,
    step: '01',
    title: '感知监测',
    desc: '环境传感器、设备状态与监控画面接入，形成一张会说话的农场数字底图。',
    tone: 'emerald'
  },
  {
    icon: LineChart,
    step: '02',
    title: 'AI 诊断',
    desc: '24 小时趋势分析、异常标记与 AI 调控建议，把数据变成可执行的结论。',
    tone: 'amber'
  },
  {
    icon: Workflow,
    step: '03',
    title: '农事执行',
    desc: '灌溉开停、设备开关与农事任务一键下发，让结论真正落地到田间。',
    tone: 'sky'
  }
]

const REASONS = [
  { title: '空间即界面', desc: '在农场地图上直接点选与操作，告别复杂的报表迷宫。' },
  { title: '双视图孪生', desc: '2.5D 实景与 3D 数字孪生共享一套坐标与对象。' },
  { title: 'AI 原生入口', desc: '自然语言直达数据、分析与行动，无需学习成本。' },
  { title: '团队协作开发', desc: '按模块分工，官网、工作台、智能问农各自演进、随时拼装。' }
]

const CARD = 'rounded-2xl border border-slate-200 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-card-hover'

export default function Solutions() {
  return (
    <>
      {/* Hero */}
      <PageHero
        eyebrow="Solutions"
        title={
          <>
            从种植到农事执行的<br />全链路数字化
          </>
        }
        subtitle="围绕温室的灌溉、环境、设备、监控与农事，提供一套可落地的智慧农业解决方案。"
      >
        <PrimaryButton href={PLATFORM_URL}>进入平台体验</PrimaryButton>
        <OutlineButton href={ASSISTANT_URL}>咨询智能问农</OutlineButton>
      </PageHero>

      {/* 六大解决方案 */}
      <section className="px-6 pb-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            eyebrow="Six Solutions"
            title="六大解决方案"
            subtitle="从水、光、温、气到设备与农事，覆盖温室种植的每一个环节。"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SOLUTIONS.map((solution, index) => (
              <div key={solution.name} className={`group ${CARD}`}>
                <div className="flex items-center justify-between">
                  <IconChip icon={solution.icon} tone={solution.tone} />
                  <span className="font-instrument-serif text-3xl text-slate-200 transition-colors duration-300 group-hover:text-emerald-300">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-ink">{solution.name}</h3>
                <p className="mt-3 text-sm font-light text-muted leading-relaxed">{solution.desc}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  了解详情 <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 数据统计条 */}
      <StatBand
        stats={[
          { value: '6', label: '解决方案' },
          { value: '5', label: '类环境指标' },
          { value: '7×24', label: '实时监测' },
          { value: '25', label: 'FPS 智能分析' }
        ]}
      />

      {/* 三步闭环 */}
      <section className="bg-white px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            eyebrow="How It Works"
            title="感知 — 诊断 — 执行"
            subtitle="一套从数据到行动的完整闭环，让种植决策有据可依。"
          />
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {STEPS.map(step => (
              <div key={step.step} className={`relative ${CARD}`}>
                <div className="flex items-center justify-between">
                  <IconChip icon={step.icon} tone={step.tone} className="h-14 w-14 rounded-2xl" />
                  <span className="font-instrument-serif text-5xl text-slate-100">{step.step}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-3 text-sm font-light text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 为什么选择我们 */}
      <section className="px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            eyebrow="Why Us"
            title="为什么选择田言耕智"
            subtitle="不是又一个农业报表系统，而是一套以空间和自然语言为中心的 AI 工作空间。"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {REASONS.map(reason => (
              <div key={reason.title} className={CARD}>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-4 w-4" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="font-medium text-ink">{reason.title}</h4>
                    <p className="mt-1 text-sm font-light text-muted leading-relaxed">{reason.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaBand
        title="开始构建你的数字化农场"
        subtitle="灌溉、环境、设备、监控与农事，从今天起都在一个工作台里完成。"
        href={PLATFORM_URL}
        label="进入平台"
      />
    </>
  )
}
