import { authApi } from '@/api'

// 登入 API
export async function login({ email, password }) {
  const response = await authApi.post('/login', { email, password })
  return response.data
}

// google第三方登入 API
export async function googleLogin({ tokenId }) {
  const response = await authApi.post('/google-login', { tokenId })
  return response.data.data
}

// 註冊 API
export async function register({ name, email, password, checkPassword }) {
  const response = await authApi.post('/users/signup', {
    name,
    email,
    password,
    password_check: checkPassword
  })
  return response.data
}

// ✅ 驗證登入狀態（取得使用者資料）
export async function getUserProfile() {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('No token')

  const response = await authApi.get('/me', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data.data
}
