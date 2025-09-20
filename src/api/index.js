import axios from 'axios'
const BASE = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
    baseURL: BASE,
    withCredentials: true //因應cookie權限需求
})

//保留領域別client
export const authApi = axios.create({
  baseURL: `${BASE}/api/v1/auth`,
  headers: { 'Content-Type': 'application/json' },
})

//除錯時看請求打到哪的工具
api.interceptors.request.use(cfg=>{
    console.log('[API]', cfg.method?.toUpperCase(), cfg.baseURL + cfg.url)
  return cfg
})