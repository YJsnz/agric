// 登录/注册/人脸 API 封装。token 存 localStorage，官网与 Vue 平台共用。
const API_BASE = '/api'

const TOKEN_KEY = 'ty_token'
const USER_KEY = 'ty_user'

function readStorage(key) {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key)
}

async function request(path, { headers = {}, body, ...rest } = {}) {
  const isForm = body instanceof FormData
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    body,
    headers: { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...headers }
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `请求失败（${res.status}）`)
  }
  return data
}

export function register({ name, email, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  })
}

export function login({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

export function fetchMe(token = getToken()) {
  return request('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  })
}

/** 绑定人脸（需登录）：photo 为 Blob/File */
export function faceRegister(photo) {
  const fd = new FormData()
  fd.append('photo', photo, 'face.jpg')
  return request('/auth/face-register', {
    method: 'POST',
    body: fd,
    headers: { Authorization: `Bearer ${getToken()}` }
  })
}

/** 刷脸登录：photo 为 Blob/File */
export function faceLogin(photo) {
  const fd = new FormData()
  fd.append('photo', photo, 'face.jpg')
  return request('/auth/face-login', { method: 'POST', body: fd })
}

export function saveAuth({ token, user }, remember = true) {
  clearAuth()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
  storage.setItem(USER_KEY, JSON.stringify(user))
}

export function getToken() {
  return readStorage(TOKEN_KEY)
}

export function getUser() {
  try {
    return JSON.parse(readStorage(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function clearAuth() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(TOKEN_KEY)
    storage.removeItem(USER_KEY)
  }
}
