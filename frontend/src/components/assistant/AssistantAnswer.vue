<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ content: string }>()

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function inlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

const html = computed(() => {
  const output: string[] = []
  let list: 'ul' | 'ol' | null = null
  const closeList = () => { if (list) output.push(`</${list}>`); list = null }

  for (const raw of props.content.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim()
    const heading = line.match(/^(#{1,4})\s+(.+)$/)
    const bullet = line.match(/^[-*]\s+(.+)$/)
    const numbered = line.match(/^\d+[.)]\s+(.+)$/)
    if (heading) {
      closeList()
      const level = heading[1].length
      output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`)
    } else if (bullet || numbered) {
      const desired = bullet ? 'ul' : 'ol'
      if (list !== desired) { closeList(); list = desired; output.push(`<${desired}>`) }
      output.push(`<li>${inlineMarkdown((bullet || numbered)![1])}</li>`)
    } else if (line.startsWith('>')) {
      closeList()
      output.push(`<blockquote>${inlineMarkdown(line.replace(/^>\s?/, ''))}</blockquote>`)
    } else if (!line) {
      closeList()
    } else if (/^---+$/.test(line)) {
      closeList()
      output.push('<hr>')
    } else {
      closeList()
      output.push(`<p>${inlineMarkdown(line)}</p>`)
    }
  }
  closeList()
  return output.join('')
})
</script>

<template><div class="assistant-answer" v-html="html"></div></template>

<style scoped>
.assistant-answer{overflow-wrap:anywhere;line-height:1.8}
.assistant-answer :deep(p){margin:0 0 .8em}
.assistant-answer :deep(h1),.assistant-answer :deep(h2),.assistant-answer :deep(h3),.assistant-answer :deep(h4){margin:.9em 0 .4em;font-weight:650;line-height:1.45}
.assistant-answer :deep(h1){font-size:1.2em}.assistant-answer :deep(h2){font-size:1.12em}.assistant-answer :deep(h3),.assistant-answer :deep(h4){font-size:1.04em}
.assistant-answer :deep(ul),.assistant-answer :deep(ol){margin:.35em 0 .85em;padding-left:1.5em}
.assistant-answer :deep(li){padding-left:.15em;margin:.2em 0}
.assistant-answer :deep(blockquote){margin:.5em 0;padding:.2em .8em;border-left:3px solid currentColor;opacity:.82}
.assistant-answer :deep(code){padding:.08em .35em;border-radius:4px;background:#80808020;font-family:Consolas,monospace;font-size:.92em}
.assistant-answer :deep(hr){margin:.8em 0;border:0;border-top:1px solid currentColor;opacity:.18}
</style>
