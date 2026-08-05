<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps<{
  title: string
  content: string
  updatedAt: string
  imageMap?: Record<string, string>
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'attach'): void
}>()

const articleRef = ref<HTMLElement>()
const query = ref('')

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function inlineMarkdown(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt: string, source: string) => {
      const resolved = props.imageMap?.[source] || source
      return `<figure><img src="${escapeHtml(resolved)}" alt="${alt}" loading="lazy"><figcaption>${alt}</figcaption></figure>`
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

function slugify(value: string, index: number) {
  return `section-${index}-${value.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase()}`
}

const parsed = computed(() => {
  const source = props.content.replace(/\r\n/g, '\n')
  const lines = source.split('\n')
  const headings: Array<{ id: string; text: string; level: number }> = []
  const html: string[] = []
  let index = 0
  let inCode = false
  let codeLanguage = ''
  let codeLines: string[] = []
  let listType: 'ul' | 'ol' | null = null
  let quoteOpen = false

  const closeList = () => {
    if (listType) html.push(`</${listType}>`)
    listType = null
  }
  const closeQuote = () => {
    if (quoteOpen) html.push('</blockquote>')
    quoteOpen = false
  }

  while (index < lines.length) {
    const raw = lines[index]
    const trimmed = raw.trim()

    if (trimmed.startsWith('```')) {
      closeList(); closeQuote()
      if (!inCode) {
        inCode = true
        codeLanguage = trimmed.slice(3).trim()
        codeLines = []
      } else {
        html.push(`<pre data-language="${escapeHtml(codeLanguage || 'text')}"><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
        inCode = false
      }
      index += 1
      continue
    }
    if (inCode) {
      codeLines.push(raw)
      index += 1
      continue
    }

    const heading = raw.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      closeList(); closeQuote()
      const level = heading[1].length
      const text = heading[2].replace(/[*`]/g, '')
      const id = slugify(text, headings.length)
      headings.push({ id, text, level })
      html.push(`<h${level} id="${id}">${inlineMarkdown(escapeHtml(heading[2]))}</h${level}>`)
      index += 1
      continue
    }

    if (trimmed.startsWith('|') && lines[index + 1]?.trim().match(/^\|?\s*:?-+/)) {
      closeList(); closeQuote()
      const rows: string[][] = []
      const header = trimmed.split('|').slice(1, -1).map(cell => cell.trim())
      index += 2
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(lines[index].trim().split('|').slice(1, -1).map(cell => cell.trim()))
        index += 1
      }
      html.push('<div class="table-scroll"><table><thead><tr>', ...header.map(cell => `<th>${inlineMarkdown(escapeHtml(cell))}</th>`), '</tr></thead><tbody>')
      rows.forEach(row => html.push('<tr>', ...row.map(cell => `<td>${inlineMarkdown(escapeHtml(cell))}</td>`), '</tr>'))
      html.push('</tbody></table></div>')
      continue
    }

    const unordered = raw.match(/^\s*[-*]\s+(.+)$/)
    const ordered = raw.match(/^\s*\d+[.)]\s+(.+)$/)
    if (unordered || ordered) {
      closeQuote()
      const desired = unordered ? 'ul' : 'ol'
      if (listType !== desired) { closeList(); listType = desired; html.push(`<${desired}>`) }
      html.push(`<li>${inlineMarkdown(escapeHtml((unordered || ordered)![1]))}</li>`)
      index += 1
      continue
    }

    if (trimmed.startsWith('>')) {
      closeList()
      if (!quoteOpen) { quoteOpen = true; html.push('<blockquote>') }
      html.push(`<p>${inlineMarkdown(escapeHtml(trimmed.replace(/^>\s?/, '')))}</p>`)
      index += 1
      continue
    }

    if (!trimmed || trimmed === '---') {
      closeList(); closeQuote()
      if (trimmed === '---') html.push('<hr>')
      index += 1
      continue
    }

    closeList(); closeQuote()
    html.push(`<p>${inlineMarkdown(escapeHtml(trimmed))}</p>`)
    index += 1
  }
  closeList(); closeQuote()
  if (inCode) html.push(`<pre data-language="${escapeHtml(codeLanguage || 'text')}"><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
  return { html: html.join(''), headings: headings.filter(item => item.level <= 3) }
})

const visibleHeadings = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return parsed.value.headings
  return parsed.value.headings.filter(item => item.text.toLowerCase().includes(keyword))
})

function jumpTo(id: string) {
  articleRef.value?.querySelector<HTMLElement>(`#${CSS.escape(id)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(() => props.content, async () => {
  query.value = ''
  await nextTick()
  if (articleRef.value) articleRef.value.scrollTop = 0
})
</script>

<template>
  <section class="document-reader" role="dialog" aria-modal="true" :aria-label="title">
    <header class="reader-header">
      <button class="reader-back" @click="emit('close')" aria-label="返回文件库">
        <svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
        文件库
      </button>
      <div><h2>{{ title }}</h2><p>项目内置文档 · 更新于 {{ updatedAt }}</p></div>
      <button class="reader-attach" @click="emit('attach')">加入当前问农上下文</button>
    </header>
    <div class="reader-layout">
      <aside class="reader-toc">
        <label><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg><input v-model="query" placeholder="搜索章节" /></label>
        <nav aria-label="文档目录">
          <button v-for="item in visibleHeadings" :key="item.id" :class="`level-${item.level}`" @click="jumpTo(item.id)">{{ item.text }}</button>
          <p v-if="!visibleHeadings.length">没有匹配的章节</p>
        </nav>
      </aside>
      <article ref="articleRef" class="reader-article markdown-body" v-html="parsed.html"></article>
    </div>
  </section>
</template>

<style scoped lang="scss">
svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.document-reader{width:min(1180px,calc(100vw - 48px));height:min(850px,calc(100vh - 48px));display:flex;flex-direction:column;border:1px solid rgba(255,255,255,.82);border-radius:18px;background:#f7faf5;box-shadow:0 30px 100px rgba(5,31,17,.42);overflow:hidden}.reader-header{min-height:78px;display:grid;grid-template-columns:180px 1fr 220px;align-items:center;gap:16px;padding:14px 20px;border-bottom:1px solid #dfe8dd;background:#fff}.reader-header>div{text-align:center}.reader-header h2{margin:0;color:#203d29;font-size:19px;letter-spacing:-.2px}.reader-header p{margin:4px 0 0;color:#7a887c;font-size:10px}.reader-back,.reader-attach{border:0;cursor:pointer}.reader-back{display:flex;align-items:center;gap:6px;padding:9px 10px;border-radius:10px;background:transparent;color:#4c6853;font-weight:650}.reader-back:hover{background:#edf4eb}.reader-attach{justify-self:end;padding:10px 14px;border-radius:10px;background:#36774a;color:#fff;font-size:11px;font-weight:650;box-shadow:0 8px 20px rgba(41,111,65,.18)}.reader-layout{min-height:0;flex:1;display:grid;grid-template-columns:270px 1fr}.reader-toc{min-height:0;padding:18px 14px;border-right:1px solid #e0e8de;background:#f0f5ee}.reader-toc label{height:38px;display:flex;align-items:center;gap:8px;padding:0 10px;border:1px solid #dbe6da;border-radius:10px;background:#fff;color:#78907c}.reader-toc input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:#2d4533;font-size:11px}.reader-toc nav{height:calc(100% - 52px);margin-top:14px;overflow:auto}.reader-toc button{width:100%;display:block;padding:7px 9px;border:0;border-radius:8px;background:transparent;color:#566b5b;text-align:left;font-size:10px;line-height:1.5;cursor:pointer}.reader-toc button:hover,.reader-toc button:focus-visible{background:#fff;color:#2e7145;outline:2px solid rgba(60,126,77,.16)}.reader-toc .level-1{color:#274d33;font-size:12px;font-weight:750}.reader-toc .level-2{margin-top:4px;font-weight:650}.reader-toc .level-3{padding-left:19px;color:#718075}.reader-toc nav>p{color:#849187;font-size:11px;text-align:center}.reader-article{min-width:0;padding:42px clamp(24px,6vw,84px) 80px;overflow:auto;scroll-behavior:smooth;background:#fff}.markdown-body{color:#35443a;font-size:14px;line-height:1.86}.markdown-body :deep(h1),.markdown-body :deep(h2),.markdown-body :deep(h3),.markdown-body :deep(h4){scroll-margin-top:24px;color:#1e3d29;line-height:1.35}.markdown-body :deep(h1){margin:0 0 28px;font-size:32px}.markdown-body :deep(h2){margin:48px 0 16px;padding-bottom:10px;border-bottom:1px solid #e2e9e0;font-size:24px}.markdown-body :deep(h3){margin:32px 0 10px;font-size:18px}.markdown-body :deep(h4){margin:24px 0 8px;font-size:15px}.markdown-body :deep(p){max-width:74ch;margin:10px 0}.markdown-body :deep(a){color:#28734a;text-decoration-thickness:1px;text-underline-offset:3px}.markdown-body :deep(ul),.markdown-body :deep(ol){max-width:74ch;padding-left:24px}.markdown-body :deep(li){margin:5px 0}.markdown-body :deep(blockquote){max-width:72ch;margin:20px 0;padding:13px 16px;border:1px solid #dce8da;border-radius:12px;background:#f2f7f0;color:#526558}.markdown-body :deep(blockquote p){margin:0}.markdown-body :deep(code){padding:2px 5px;border-radius:5px;background:#edf3eb;color:#28633e;font:12px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace}.markdown-body :deep(pre){position:relative;margin:20px 0;padding:35px 18px 18px;border-radius:13px;background:#173a2b;color:#dfeee2;overflow:auto}.markdown-body :deep(pre::before){content:attr(data-language);position:absolute;left:18px;top:10px;color:#8db59a;font-size:9px;text-transform:uppercase}.markdown-body :deep(pre code){padding:0;background:transparent;color:inherit}.markdown-body :deep(.table-scroll){max-width:100%;margin:18px 0;overflow:auto;border:1px solid #dde6db;border-radius:12px}.markdown-body :deep(table){width:100%;border-collapse:collapse;font-size:12px}.markdown-body :deep(th){background:#edf4eb;color:#2d5739;text-align:left}.markdown-body :deep(th),.markdown-body :deep(td){min-width:120px;padding:10px 12px;border-bottom:1px solid #e5ece3;vertical-align:top}.markdown-body :deep(figure){max-width:100%;margin:28px 0}.markdown-body :deep(figure img){max-width:100%;height:auto;display:block;border-radius:12px;box-shadow:0 14px 36px rgba(24,57,33,.12)}.markdown-body :deep(figcaption){margin-top:8px;color:#7d887e;font-size:10px;text-align:center}.markdown-body :deep(hr){margin:36px 0;border:0;border-top:1px solid #e1e8df}@media(max-width:800px){.document-reader{width:100vw;height:100vh;border:0;border-radius:0}.reader-header{grid-template-columns:auto 1fr;padding:10px 12px}.reader-header>div{text-align:left}.reader-header h2{max-width:46vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px}.reader-header p{display:none}.reader-attach{grid-column:2;padding:8px 10px;font-size:9px}.reader-layout{display:block}.reader-toc{height:auto;padding:10px 12px;border:0;border-bottom:1px solid #e1e8df}.reader-toc nav{display:none}.reader-article{height:calc(100vh - 136px);padding:24px 18px 60px}.markdown-body{font-size:13px}.markdown-body :deep(h1){font-size:25px}.markdown-body :deep(h2){font-size:20px}}
</style>
