import { ArrowLeft, BookOpen, Code2 } from 'lucide-react'
import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { marked } from 'marked'
import userManual from '../../../docs/用户使用手册.md?raw'
import technicalManual from '../../../docs/技术说明手册.md?raw'
import homeScreenshot from '../../../docs/截图/官网.png'
import loginScreenshot from '../../../docs/截图/登陆.png'
import workspaceScreenshot from '../../../docs/截图/主界面.png'
import customWorkspaceScreenshot from '../../../docs/截图/自定义工作台.png'
import assistantScreenshot from '../../../docs/截图/问农.png'
import firstPersonScreenshot from '../../../docs/截图/第一人称.png'
import twinScreenshot from '../../../docs/截图/3D.png'
import greenhouseScreenshot from '../../../docs/截图/大棚内部.png'

const screenshotUrls = {
  '官网.png': homeScreenshot,
  '登陆.png': loginScreenshot,
  '主界面.png': workspaceScreenshot,
  '自定义工作台.png': customWorkspaceScreenshot,
  '问农.png': assistantScreenshot,
  '第一人称.png': firstPersonScreenshot,
  '3D.png': twinScreenshot,
  '大棚内部.png': greenhouseScreenshot
}

const DOCUMENTS = {
  'user-manual': {
    title: '用户使用手册',
    label: 'USER GUIDE',
    description: '面向平台使用者与农场管理人员',
    icon: BookOpen,
    source: userManual
  },
  'technical-manual': {
    title: '技术说明手册',
    label: 'TECHNICAL GUIDE',
    description: '面向开发、测试与运维人员',
    icon: Code2,
    source: technicalManual
  }
}

function renderMarkdown(source) {
  const renderer = new marked.Renderer()
  renderer.image = (href, title, text) => {
    const filename = decodeURIComponent(String(href || '').split('/').pop())
    const resolved = screenshotUrls[filename] || href
    return `<img src="${resolved}" alt="${text || ''}"${title ? ` title="${title}"` : ''} loading="lazy">`
  }
  return marked.parse(source, { renderer, headerIds: true, mangle: false })
}

export default function DocumentReader() {
  const { slug } = useParams()
  const document = DOCUMENTS[slug]
  const html = useMemo(() => document ? renderMarkdown(document.source) : '', [document])

  if (!document) return <Navigate to="/docs" replace />
  const Icon = document.icon

  return (
    <main className="docs-reader px-6 pb-24 pt-32 md:px-12 md:pt-40 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <Link to="/docs" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-emerald-700">
          <ArrowLeft className="h-4 w-4" /> 返回文档说明
        </Link>
        <header className="mt-8 border-b border-slate-200 pb-10">
          <div className="flex items-center gap-3 text-emerald-700">
            <Icon className="h-5 w-5" strokeWidth={1.6} />
            <span className="text-[11px] font-semibold tracking-[0.2em]">{document.label}</span>
          </div>
          <h1 className="mt-5 font-instrument-serif text-4xl text-ink sm:text-5xl">{document.title}</h1>
          <p className="mt-4 text-sm font-light text-muted">{document.description} · 内容随项目版本同步更新</p>
        </header>
        <article className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </main>
  )
}
