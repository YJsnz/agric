<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 })
const paths: Record<string, string> = {
  panel: 'M3 4h18v16H3z M9 4v16 M5.5 8h1 M5.5 12h1',
  plus: 'M12 5v14 M5 12h14',
  search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  arrow: 'M12 19V5 M6 11l6-6 6 6',
  chevron: 'M9 5l7 7-7 7',
  close: 'M6 6l12 12 M18 6L6 18',
  leaf: 'M12 21v-9 M12 15C3 16 3 9 3 6c7-1 10 3 9 9 M12 12c0-6 4-9 9-9 0 6-3 10-9 9',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  book: 'M4 3h15v18H4z M4 17h15 M8 7h7 M8 11h5',
  chart: 'M4 3v17h17 M8 14l4-5 4 3 5-7',
  drop: 'M12 3C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-12z',
  check: 'M5 12l4 4L19 6',
  copy: 'M9 9h12v12H9z M15 9V3H3v12h6',
  sun: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1 1 M18 18l1 1 M5 19l1-1 M18 6l1-1',
  moon: 'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11z',
  settings: 'M4 7h16 M4 17h16 M8 4v6 M16 14v6',
  stop: 'M6 6h12v12H6z',
  clock: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18 M12 7v5l3 2',
  external: 'M14 3h7v7 M21 3L10 14 M10 3H3v18h18v-7',
  chat: 'M4 4h16v12H9l-5 4z M8 8h8 M8 12h5',
}
</script>
<template><svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name] || paths.chat" /></svg></template>
