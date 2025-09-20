<template>
  <div class="container text-center py-10">
    <h2 v-if="status === 'loading'">驗證中，請稍候…</h2>
    <h2 v-else-if="status === 'success'">已完成信箱驗證！</h2>
    <h2 v-else>驗證失敗，連結可能已過期。</h2>

    <router-link class="btn btn-primary mt-4" to="/">返回首頁</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// import axios from 'axios'
import { api } from '@/api'

import { user } from '@/store/user'

const status = ref('loading')
const message = ref('')

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const { token = '' } = route.query
  if (!token) {
    status.value = 'fail'
    message.value = '缺少驗證 Token'
    return
  }

  const authToken = user.value?.token
  if (!authToken) {
    status.value = 'needLogin'
    return
  }

  try {
    await api.patch('/api/v1/auth/user-verification', null, {
      params: { token },
      headers: { Authorization: `Bearer ${authToken}` }
    })

    if (user.value) user.value.is_verified = true

    status.value = 'success'
    setTimeout(() => router.push('/'), 3000)
  } catch (err) {
    status.value = 'fail'
    message.value = err.response?.data?.message || '連結可能已過期或已使用'
  }
})
</script>
