import { useState } from 'react'
import { ArrowRight, Bot, Boxes, CheckCircle2, Loader2, Mail, Send, XCircle } from 'lucide-react'
import { PageHero } from '../components/ui'
import { CONTACT_EMAIL, PLATFORM_URL, ASSISTANT_URL } from '../links'

const CHANNELS = [
  { icon: Mail, label: '邮件联系', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { icon: Boxes, label: '数据工作台', value: '进入平台体验', href: PLATFORM_URL },
  { icon: Bot, label: '智能问农', value: '自然语言问农', href: ASSISTANT_URL }
]

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100'

const labelCls = 'mb-1.5 block text-sm font-medium text-ink'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', _honey: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  function update(key) {
    return e => setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form._honey) return // 蜜罐：机器人会自动填写，直接忽略
    setStatus('sending')
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `官网留言：${form.subject || '（未填写主题）'}`,
          name: form.name,
          email: form.email,
          message: form.message,
          _honey: form._honey
        })
      })
      const data = await res.json()
      if (res.ok && data.success === 'true') {
        setStatus('success')
        setForm({ name: '', email: '', subject: '', message: '', _honey: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            和我们聊聊<br />你的农场
          </>
        }
        subtitle="无论是了解平台、咨询解决方案，还是想一起推进智慧农业，都欢迎留言。"
      />

      <section className="px-6 pb-24 md:px-12 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.2fr]">
          {/* 左侧联系渠道 */}
          <div className="space-y-4">
            {CHANNELS.map(channel => (
              <a
                key={channel.label}
                href={channel.href}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-card-hover"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <channel.icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted">{channel.label}</p>
                  <p className="truncate text-sm font-medium text-ink group-hover:text-emerald-700">{channel.value}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-emerald-500" />
              </a>
            ))}
            <p className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 text-xs font-light text-muted leading-relaxed">
              表单通过 FormSubmit 发送到指定邮箱，无需注册后端；提交后会收到「官网留言」主题的邮件。
            </p>
          </div>

          {/* 右侧表单 */}
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card-hover md:p-10">
            <h2 className="font-instrument-serif text-2xl text-ink">留下你的信息</h2>
            <p className="mt-2 text-sm font-light text-muted">我们会在收到留言后尽快与你联系。</p>

            {/* 蜜罐字段（对用户隐藏） */}
            <input
              type="text"
              name="_honey"
              value={form._honey}
              onChange={update('_honey')}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelCls}>称呼</label>
                <input id="name" type="text" required value={form.name} onChange={update('name')} placeholder="怎么称呼你" className={inputCls} />
              </div>
              <div>
                <label htmlFor="email" className={labelCls}>邮箱</label>
                <input id="email" type="email" required value={form.email} onChange={update('email')} placeholder="you@example.com" className={inputCls} />
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="subject" className={labelCls}>主题</label>
              <input id="subject" type="text" value={form.subject} onChange={update('subject')} placeholder="想聊点什么（可选）" className={inputCls} />
            </div>
            <div className="mt-6">
              <label htmlFor="message" className={labelCls}>留言内容</label>
              <textarea
                id="message"
                required
                rows={6}
                value={form.message}
                onChange={update('message')}
                placeholder="想了解平台、解决方案，或任何建议…"
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* 状态反馈 */}
            {status === 'success' && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                留言已发送，我们会尽快回复你！
              </div>
            )}
            {status === 'error' && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">
                <XCircle className="h-5 w-5 shrink-0" />
                发送失败，请稍后再试或直接邮件联系。
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> 发送中…
                </>
              ) : (
                <>
                  发送留言
                  <Send className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
