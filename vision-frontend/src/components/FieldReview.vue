<script setup>
import { ref, onMounted } from 'vue'
const props = defineProps({ files: Object, result: Object, context: Object })
const plot = ref(''), notes = ref(''), records = ref([]), selected = ref(''), message = ref('')
let db
function request(req) { return new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error) }) }
onMounted(async () => {
  try {
    const open = indexedDB.open('wheat-field-review', 1)
    open.onupgradeneeded = () => open.result.createObjectStore('records', { keyPath: 'id' })
    db = await request(open)
    await refresh()
  } catch { message.value = '浏览器记录存储不可用；请勿依赖本页面保存档案。' }
})
async function refresh() { records.value = (await request(db.transaction('records').objectStore('records').getAll())).sort((a,b) => b.date.localeCompare(a.date)) }
async function save() {
  if (!db || !plot.value.trim() || !props.result) { message.value = '请填写地块名称，并先完成本轮分析。'; return }
  try {
    const tx = db.transaction('records', 'readwrite')
    const done = new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error) })
    tx.objectStore('records').put({ id: crypto.randomUUID(), plot: plot.value.trim(), date: new Date().toISOString(), notes: notes.value.trim(), files: { ...props.files }, context: { ...props.context }, result: JSON.parse(JSON.stringify(props.result)) })
    await done; await refresh(); message.value = '已保存到当前浏览器。清理网站数据会删除记录，请及时导出。'
  } catch { message.value = '保存失败，可能存储空间不足。请导出记录，当前图片未保存。' }
}
function picture(file) { return file ? URL.createObjectURL(file) : '' }
const urls = new Map()
function photo(record, key) { const id = record.id + key; if (!urls.has(id)) urls.set(id, picture(record.files[key])); return urls.get(id) }
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => { urls.forEach(url => URL.revokeObjectURL(url)); db?.close() })
async function exportRecord(record) {
  // Include original images so the exported record remains useful off-browser.
  const images = {}
  for (const [key, file] of Object.entries(record.files)) if (file) images[key] = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve({ name: file.name, data_url: reader.result }); reader.onerror = reject; reader.readAsDataURL(file) })
  const url = URL.createObjectURL(new Blob([JSON.stringify({ ...record, files: undefined, images }, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a'); link.href = url; link.download = `wheat-review-${record.id}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>
<template>
<section class="card"><h2>地块复查记录</h2><p class="muted">仅保存在此浏览器，不上传云端。照片并排人工比较，不自动计算病情变化百分比。</p>
  <label>地块名称<input v-model="plot" placeholder="例如：东地块 A" maxlength="100" /></label>
  <label>本次操作与复查记录<textarea v-model="notes" rows="3" placeholder="记录拍摄位置、观察日期、采取过的措施及变化" maxlength="2000" /></label>
  <button class="primary" :disabled="!result" @click="save">保存本轮地块记录</button><p role="status">{{ message }}</p>
  <label>选择历史记录<select v-model="selected"><option value="">请选择</option><option v-for="record in records.filter(r => !plot.trim() || r.plot === plot.trim())" :value="record.id" :key="record.id">{{ record.plot }} · {{ new Date(record.date).toLocaleString() }}</option></select></label>
  <template v-for="record in records.filter(r => r.id === selected)" :key="record.id"><p>{{ record.notes || '当次未填写操作记录' }}</p><button @click="exportRecord(record)">导出本条记录（含图片）</button>
  <div v-for="key in ['leaf', 'canopy', 'head'].filter(k => record.files[k] || files[k])" :key="key" class="comparison"><figure><img v-if="record.files[key]" :src="photo(record, key)" :alt="`历史${key}图片`" /><figcaption>历史 · {{ record.files[key]?.name || '未上传' }}</figcaption></figure><figure><img v-if="files[key]" :src="photo({ id: 'current-' + files[key].name + files[key].lastModified, files }, key)" :alt="`当前${key}图片`" /><figcaption>当前 · {{ files[key]?.name || '未上传' }}</figcaption></figure></div></template>
</section>
</template>
<style scoped>textarea{width:100%;box-sizing:border-box;border:1px solid #d9e4d2;border-radius:8px;padding:10px;font:inherit}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:12px}.comparison figure{margin:12px 0;min-width:0}.comparison img{width:100%;height:210px;object-fit:contain;background:#edf3e9}.comparison figcaption{overflow-wrap:anywhere;font-size:12px}</style>
