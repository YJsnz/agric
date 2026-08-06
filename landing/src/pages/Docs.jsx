import { BookOpen, Code2, ArrowRight, Clock3, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero } from '../components/ui'

const DOCUMENTS = [
  {
    slug: 'user-manual',
    icon: BookOpen,
    eyebrow: 'USER GUIDE',
    title: '用户使用手册',
    description: '从账号登录到智能问农、数字孪生、设备控制与告警处理，按实际操作流程快速上手。',
    audience: '平台使用者与农场管理人员',
    reading: '约 25 分钟',
    tone: 'bg-emerald-100 text-emerald-700'
  },
  {
    slug: 'technical-manual',
    icon: Code2,
    eyebrow: 'TECHNICAL GUIDE',
    title: '技术说明手册',
    description: '涵盖系统架构、开发环境、数据库、接口、前后端构建与生产部署，帮助研发人员维护平台。',
    audience: '开发、测试与运维人员',
    reading: '约 35 分钟',
    tone: 'bg-sky-100 text-sky-700'
  }
]

export default function Docs() {
  return (
    <>
      <PageHero
        eyebrow="Documentation"
        title={<>文档说明<br />从使用到开发，一站查阅</>}
        subtitle="选择适合你的手册，了解田言耕智的完整操作流程与技术实现。文档内容随项目版本同步更新。"
      />

      <section className="px-6 pb-24 md:px-12 lg:px-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {DOCUMENTS.map(document => {
            const Icon = document.icon
            return (
              <Link
                key={document.slug}
                to={`/docs/${document.slug}`}
                className="group flex min-h-[330px] flex-col rounded-[2rem] border border-slate-200 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-card-hover md:p-10"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${document.tone}`}>
                  <Icon className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <p className="mt-8 text-[11px] font-semibold tracking-[0.2em] text-emerald-700">{document.eyebrow}</p>
                <h2 className="mt-3 font-instrument-serif text-3xl text-ink">{document.title}</h2>
                <p className="mt-4 flex-1 text-sm font-light leading-7 text-muted">{document.description}</p>
                <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-5 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{document.audience}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{document.reading}</span>
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                  阅读文档 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
