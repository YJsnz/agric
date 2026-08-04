import { ArrowRight, Quote, Users } from 'lucide-react'
import { PageHero, StatBand, CtaBand, SectionTitle, PrimaryButton, OutlineButton } from '../components/ui'
import { PLATFORM_URL, ASSISTANT_URL } from '../links'

const BRAND_WORDS = [
  { char: '田', title: '以农场、地块和大棚为核心空间', tone: 'bg-emerald-100 text-emerald-700' },
  { char: '言', title: '以自然语言作为系统入口', tone: 'bg-sky-100 text-sky-700' },
  { char: '耕', title: '覆盖种植、灌溉、巡检和农事执行', tone: 'bg-amber-100 text-amber-700' },
  { char: '智', title: '通过数据、视觉识别和 AI 辅助决策', tone: 'bg-violet-100 text-violet-700' }
]

const TEAM = [
  {
    initials: '数',
    module: '数据工作台',
    owner: '当前分支',
    desc: '全屏农场空间交互、2.5D/3D 双视图与七大业务模块。',
    tone: 'bg-emerald-100 text-emerald-700'
  },
  {
    initials: '问',
    module: '智能问农',
    owner: '团队其他模块',
    desc: '以自然语言为入口的 AI 对话、数据问答与操作建议。',
    tone: 'bg-sky-100 text-sky-700'
  },
  {
    initials: '棚',
    module: '大棚内部',
    owner: '团队其他模块',
    desc: '温室内部场景、作物细节与环境的深入数字孪生。',
    tone: 'bg-amber-100 text-amber-700'
  },
  {
    initials: '网',
    module: '官网营销',
    owner: '当前分支',
    desc: '多页营销站点与「官网 → 平台」的站内联动入口。',
    tone: 'bg-violet-100 text-violet-700'
  }
]

const CARD = 'rounded-2xl border border-slate-200 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-card-hover'

export default function About() {
  return (
    <>
      {/* Hero */}
      <PageHero
        eyebrow="About"
        title={
          <>
            田言耕智<br />为现代农业而生的 AI 平台
          </>
        }
        subtitle="我们相信农业的数据不该被藏在报表里。让自然语言成为入口，让农场空间成为界面。"
      >
        <PrimaryButton href={PLATFORM_URL}>进入平台</PrimaryButton>
        <OutlineButton href={ASSISTANT_URL}>了解更多</OutlineButton>
      </PageHero>

      {/* 品牌释义 */}
      <section className="px-6 pb-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            eyebrow="Brand"
            title="「田言耕智」四个字"
            subtitle="每一个字，都是一层产品哲学。"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BRAND_WORDS.map(word => (
              <div key={word.char} className={`text-center ${CARD}`}>
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl font-instrument-serif text-3xl ${word.tone}`}
                >
                  {word.char}
                </div>
                <p className="mt-5 text-sm font-light text-muted leading-relaxed">{word.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 产品口号 */}
      <section className="px-6 pb-20 md:px-12 lg:px-16">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-8 py-14 text-center shadow-2xl shadow-emerald-600/20 md:py-20">
          <Quote className="mx-auto h-10 w-10 text-white/60" strokeWidth={1.5} />
          <p className="mx-auto mt-6 max-w-3xl font-instrument-serif text-2xl text-white leading-relaxed sm:text-3xl">
            不用寻找数据，直接询问数据。<br />
            不必浏览报表，直接进入农场。<br />
            <span className="italic text-emerald-100">AI 不只回答问题，还能定位、解释和辅助行动。</span>
          </p>
        </div>
      </section>

      {/* 数据统计条 */}
      <StatBand
        stats={[
          { value: '4', label: '字品牌释义' },
          { value: '3', label: '种入口模式' },
          { value: '6', label: '座温室孪生' },
          { value: '1', label: '个共同使命' }
        ]}
      />

      {/* 团队与模块分工 */}
      <section className="bg-white px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            eyebrow="Team & Modules"
            title="团队协作，模块化演进"
            subtitle="不同专业页面由不同模块分工开发，既独立演进，又共享核心状态与坐标体系。"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map(member => (
              <div key={member.module} className={`text-center ${CARD}`}>
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full font-instrument-serif text-2xl ${member.tone}`}
                >
                  {member.initials}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-ink">{member.module}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-emerald-700">{member.owner}</p>
                <p className="mt-3 text-sm font-light text-muted leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 当前阶段 */}
      <section className="px-6 py-20 md:px-12 lg:px-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-3xl border border-emerald-100 bg-emerald-50/60 px-8 py-12 text-center">
          <Users className="h-8 w-8 text-emerald-600" strokeWidth={1.5} />
          <p className="max-w-xl text-sm font-light text-muted leading-relaxed">
            当前版本已接入 Spring Boot、MySQL 与虚拟传感器数据，支持登录注册、数据工作台、数字孪生、设备及灌溉控制、监控分析和智能问农。无实体传感器时由服务端持续生成演示数据。
          </p>
        </div>
      </section>

      {/* CTA */}
      <CtaBand
        title="和我们一起，让耕种更智慧"
        subtitle="从一块农田、一座温室开始，用 AI 原生体验重塑农业生产。"
        href={PLATFORM_URL}
        label="进入平台"
      />
    </>
  )
}
