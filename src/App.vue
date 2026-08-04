<template>
  <div class="layout-container">
    <!-- 左侧侧边栏 -->
    <aside class="sidebar">
      <!-- Logo区 -->
<div class="logo-area">
  <div class="logo-title">
    <span class="logo-emoji">🌱</span>
    <div class="logo-text-group">
      <div class="main-title">田言耕智</div>
      <div class="sub-title">智慧农业 AI 平台</div>
    </div>
  </div>
  <div class="logo-buttons">
    <el-button circle size="small">
      <el-icon><ArrowLeft /></el-icon>
    </el-button>
    <el-button circle size="small">
      <el-icon><Search /></el-icon>
    </el-button>
  </div>
</div>

      <el-button type="success" class="new-chat-btn" block>
        <el-icon><Plus /></el-icon>
        新聊天
      </el-button>

      <!-- 侧边菜单 -->
      <div class="menu-list">
        <div class="menu-item">
          <el-icon><Document /></el-icon>
          <span>文件库</span>
        </div>
        <div class="menu-item">
          <el-icon><Tickets /></el-icon>
          <span>项目</span>
        </div>
        <div class="menu-item menu-more">
          <el-icon><More /></el-icon>
          <span>更多</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
      </div>

      
  <div class="container">
  <div class="recent-title">最近聊天</div>
  <div class="chat-list">
    <!-- 循环动态渲染历史记录，每条自动带气泡图标 -->
    <div class="chat-item" v-for="(item, index) in chatHistoryList" :key="index">
      <div class="chat-left">
        <el-icon><ChatDotRound /></el-icon>
        <span>{{ item.title }}</span>
      </div>
      <span class="time">{{ item.time }}</span>
    </div>
    <!-- 查看更多 -->
    <div class="chat-item more-item">
      <span>查看更多</span>
      <el-icon><ArrowDown /></el-icon>
    </div>
  </div>
</div>

      <!-- 底部用户栏 -->
      <div class="user-footer">
        <el-avatar size="36">GE</el-avatar>
        <div class="user-info">
          <div>geqingyu</div>
          <div class="sub-text">管理员</div>
        </div>
        <el-icon><Menu /></el-icon>
      </div>
    </aside>

    <!-- 右侧主内容 -->
    <main class="main-content">
      <!-- 顶部切换标签 -->
      <div class="top-tab">
        <el-button round>
          <el-icon><ChatDotRound /></el-icon>
          智能问农
        </el-button>
        <el-button round text>
          <el-icon><Grid /></el-icon>
          数据工作台
        </el-button>
      </div>

      <!-- 中心欢迎区域 -->
      <div class="center-welcome">
  <h1>早上好 🌱</h1>
  <p>我是 田言耕智 智能助手，随时为您提供农场数据和分析建议</p>

  <!-- 聊天输入框 -->
  <div class="input-box">
  <el-input
    placeholder="询问农场，获取数据或创建面板..."
    v-model="msg"
  />
  <div class="input-tools">
    <div class="tool-left">
      <!-- 加号按钮 -->
      <el-button circle size="default">
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>
    <div class="tool-right">
      <!-- 麦克风按钮 -->
      <el-button circle size="default">
        <el-icon><Microphone /></el-icon>
      </el-button>
      <!-- 绿色回形针发送按钮 -->
      <el-button circle size="default" type="success">
        <el-icon><Paperclip /></el-icon>
      </el-button>
    </div>
  </div>
</div>

  
  <div class="quick-buttons">
    <el-button round plain>分析今日状态</el-button>
    <el-button round plain>查看异常地块</el-button>
    <el-button round plain>生成灌溉方案</el-button>
    <el-button round plain>对比温室数据</el-button> 
    <el-button round plain>创建工作台</el-button>
   </div>
</div>


      <!-- 底部悬浮工具栏 -->
      <!-- 底部悬浮工具栏 -->
<div class="bottom-toolbar">
  <div class="tool-item" @click="handleCreatePanel">
    <el-icon size="24"><Plus /></el-icon>
    <span>新建面板</span>
  </div>
  <div class="tool-item" @click="handleFilter">
    <el-icon size="24"><Filter /></el-icon>
    <span>筛选条件</span>
  </div>
  <div class="tool-item" @click="handleSnapshot">
    <el-icon size="24"><Camera /></el-icon>
    <span>快照</span>
  </div>
  <div class="tool-item" @click="handlePlay">
    <el-icon size="24"><VideoPlay /></el-icon>
    <span>演示模式</span>
  </div>
  <div class="tool-item" @click="handleAllApp">
    <el-icon size="24"><Grid /></el-icon>
    <span>全部应用</span>
  </div>
</div>
            </main> 
              </div> </template>




<script setup>
import { ref } from 'vue'

// 全局已经一次性注册所有ElementPlus图标，删掉图标局部导入语句
const msg = ref('')

// 聊天历史动态数组
const chatHistoryList = ref([
  { title: '分析今日农场状态', time: '10:23' },
  { title: '查看2号温室异常原因', time: '09:48' },
  { title: '生成灌溉建议方案', time: '昨天' },
  { title: '对比1号和2号温室', time: '昨天' },
  { title: '查看设备异常', time: '2天前' },
])

// 三个按钮点击事件
const openUpload = () => {
  console.log('唤起文件上传')
}
const voiceInput = () => {
  console.log('开启语音输入')
}
const submitSend = () => {
  console.log('发送文本消息')
}

// 新增聊天记录，放到列表最上方
const addNewChat = (title) => {
  chatHistoryList.value.unshift({
    title: title,
    time: '刚刚'
  })
}
const handleCreatePanel = () => console.log('新建面板')
const handleFilter = () => console.log('筛选条件')
const handleSnapshot = () => console.log('快照')
const handlePlay = () => console.log('演示模式')
const handleAllApp = () => console.log('全部应用')

</script>

<style scoped>
/* 你原有所有css样式保留写在这里 */
</style>

<style scoped>

.container {
  display: flex;
  flex-direction: column;
  gap: 0px; /* 0 = 完全紧贴，想要微小距离改成4px/6px */
}
.recent-title {
  line-height: 1.1;
}
.chat-list {
  padding-top: 0;
}


.recent-title {
  margin-bottom: 12px;  /* 原来数值太大，调小！比如原先30、40改成12~16 */
  font-size: 20px;
  font-weight: 500;
}
.recent-list {
  gap: 14px; /* 每条记录上下间距也可以微调 */
  display: flex;
  flex-direction: column;
}

.logo-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.logo-title {
  display: flex;
  align-items: center;
  gap:10px;
}
.logo-emoji{
  font-size:36px;
}
.main-title{
  font-size:32px;
  font-weight: bold;
  color:#111;
  line-height:1.2;
}
.sub-title{
  font-size:16px;
  color:#333;
  line-height:1.2;
}
.logo-buttons{
  display:flex;
  gap:10px;
}

.layout-container {
  display: flex;
  height: 100vh;
  margin: 0;
}

/* 侧边栏 */
.sidebar {
  width: 280px;
  background: #f8faf7;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.logo-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.new-chat-btn {
  margin-bottom: 24px;
  background-color: #477c46;
}
.menu-item {
  display: flex;
  gap: 10px;
  padding: 10px 8px;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
}
.menu-item:hover {
  background: #e9efe8;
}
.chat-item {
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px;
  cursor: pointer;
}
.chat-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.chat-item:hover {
  background: #e9efe8;
}
.time {
  font-size: 12px;
  color: #888;
}
.more-item {
  margin-top: 6px;
}
.user-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
  padding:8px;
  background:#e9efe8;
  border-radius:12px;
}

/* 右侧主区域 */
.main-content {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  /* 底色保留 */
  background-color: #f7f9f5;
}

/* 单独创建背景层，只模糊图片，不影响文字 */
.main-content::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("/56d5568814d848c63c757295ac80dbd1.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* 仅背景模糊 */
  filter: blur(6px);
  background-blend-mode: soft-light;
  z-index: 1;
}

/* 上下白渐变蒙版 */
.main-content::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(255, 255, 255, 0.35) 35%,
    rgba(255, 255, 255, 0.35) 65%,
    rgba(255, 255, 255, 0.85) 100%
  );
  z-index: 2;
}

/* 内容层级高于背景和蒙版，清晰显示 */
.main-content > * {
  position: relative;
  z-index: 3;
}
.top-tab {
  margin-bottom: 60px;
}
.center-welcome{
  text-align:center;
}
.center-welcome h1{
  color:#2b572a;
  font-size:42px;
  margin:0;
}
.input-box{
  width:600px;
  background:white;
  border-radius:16px;
  padding:16px;
  margin:30px 0;
}
.input-tools{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}
.tool-right{
  display: flex;
  gap: 16px;
  align-items: center;
}
/* 麦克风图标统一居中尺寸 */
.tool-right .el-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
/* 发送圆圈和麦克风尺寸完全一致 */
.send-circle {
  width: 34px;
  height: 34px;
  background-color: #387c46;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}


.quick-buttons-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 14px 18px;
  margin-top: 24px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.quick-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.quick-buttons .el-button {
  color: #2b572a;
  font-weight: 400;
  padding: 6px 14px;
  border-radius: 20px;
}

.quick-buttons{
  display:flex;
  gap:12px;
}

/* 底部悬浮栏 */
.bottom-toolbar{
  position: fixed;
  bottom:30px;
  display:flex;
  gap:40px;
  padding:16px 40px;
  background:rgba(255,255,255,0.65);
  backdrop-filter: blur(8px);
  border-radius:999px;
}
.tool-item{
  display:flex;
  flex-direction:column;
  align-items:center;
  font-size:13px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}
.tool-item:hover {
  background: rgba(0,0,0,0.08);
}
</style>