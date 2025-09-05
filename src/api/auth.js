import axios from 'axios'
// https://sportify.zeabur.app/
const api = axios.create({
  baseURL: 'https://sportifyplus.zeabur.app/api/v1/auth',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 登入 API
export async function login({ email, password }) {
  const response = await api.post('/login', { email, password })
  return response.data
}

// google第三方登入 API
export async function googleLogin({ tokenId }) {
  const response = await api.post('/google-login', { tokenId })
  return response.data.data
}

// 註冊 API
export async function register({ name, email, password, checkPassword }) {
  const response = await api.post('/users/signup', {
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

  const response = await api.get('/me', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data.data
}
