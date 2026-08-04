// 平台端登录态 / 人脸 API 封装。token 与官网 landing 共用 localStorage。
const TOKEN_KEY = 'ty_token'
const USER_KEY = 'ty_user'

function readStorage(key: string): string | null {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key)
}

export function getToken(): string | null {
  return readStorage(TOKEN_KEY)
}

export function getUser(): { name?: string; email?: string } | null {
  try {
    return JSON.parse(readStorage(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function saveUser(user: unknown) {
  const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage
  storage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(TOKEN_KEY)
    storage.removeItem(USER_KEY)
  }
}

async function request<T = unknown>(
  path: string,
  { headers = {}, ...rest }: RequestInit & { headers?: Record<string, string> } = {}
): Promise<T> {
  const isForm = rest.body instanceof FormData
  const res = await fetch(`/api${path}`, {
    ...rest,
    headers: { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...headers }
  })
  const data = (await res.json().catch(() => ({}))) as { message?: string } & T
  if (!res.ok) {
    if (res.status === 401) {
      clearAuth()
      window.location.replace('/#/sign-in')
    }
    throw new Error(data.message || `请求失败（${res.status}）`)
  }
  return data
}

export interface UserInfo {
  id: number
  name: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
  role: string
  faceBound: boolean
  createdAt: string
}

export function fetchMe(token = getToken()): Promise<UserInfo> {
  return request<UserInfo>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  })
}

export function faceRegister(photo: Blob | File): Promise<UserInfo> {
  const fd = new FormData()
  fd.append('photo', photo, 'face.jpg')
  return request<UserInfo>('/auth/face-register', {
    method: 'POST',
    body: fd,
    headers: { Authorization: `Bearer ${getToken()}` }
  })
}

export function faceDelete(): Promise<UserInfo> {
  return request<UserInfo>('/auth/face-delete', {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` }
  })
}
