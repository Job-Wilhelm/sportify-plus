<template>
  <div class="container mt-10">
    <div class="row">
      <div class="col-lg-6 mb-5">
        <div class="image-wrapper position-relative d-inline-block">
          <img src="@/assets/images/logo.png" alt="logo" class="img-fluid" />

          <!-- 模糊遮罩：右、上、下 -->
          <div class="blur-overlay right"></div>
          <div class="blur-overlay top"></div>
          <div class="blur-overlay bottom"></div>
        </div>
      </div>
      <div class="col-lg-6">
        <h2 class="mb-5">忘記密碼</h2>
        <p class="fs-5">輸入註冊帳號所使用的Email信箱，我們將發送連結給您。</p>
        <form @submit.prevent="handleForgotPassword">
          <div class="mb-3">
            <label class="form-label fs-5">Email</label>
            <input
              v-model="email"
              type="email"
              class="form-control"
              required
              :disabled="isLoading"
              @blur="validateEmail"
            />
            <p v-if="emailError" class="text-danger mt-1">
              *不是正確 Email 格式！
            </p>
          </div>

          <button
            class="btn btn-primary-600 btn-lg custom-btn mt-5"
            :disabled="emailError || isLoading"
          >
            {{ isLoading ? '發送中...' : '發送重設連結' }}
          </button>
        </form>

        <div class="d-flex justify-content-between mt-5">
          <p class="mb-0">
            已有帳號？<router-link
              to="/login"
              class="text-primary-500 text-decoration-underline"
              >立即登入</router-link
            >
          </p>
          <p class="mb-0">
            <router-link
              to="/users/signup"
              class="text-primary-500 text-decoration-underline"
              >建立新帳號</router-link
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// import axios from 'axios'
import { api } from '@/api'

const email = ref('')
const emailError = ref(false)
const isLoading = ref(false)
const router = useRouter()

function validateEmail() {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailError.value = !emailPattern.test(email.value)
}

// 忘記密碼處理
async function handleForgotPassword() {
  validateEmail()
  if (emailError.value) return

  isLoading.value = true

  try {
    await api.post('/api/v1/auth/forgot-password', {
      email: email.value
    })
    alert('已發送密碼重設連結至您的 Email，請查看信箱。')
    router.push('/login')
  } catch (error) {
    console.error(error)
    alert('無法發送密碼重設信，請稍後再試。')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.custom-btn {
  display: block;
  margin: 0 auto;
  width: 200px;
  max-width: 100%;
}
.blur-overlay {
  position: absolute;
  pointer-events: none;
  z-index: 2;

  &.right {
    top: 0;
    right: -19px;
    width: 80px;
    height: 216px;
    background: linear-gradient(to right, rgba(0, 0, 0, 0), #000918);

    @media (max-width: 991.98px) {
      right: -12px;
      width: 40px;
    }
  }

  &.top {
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background: linear-gradient(to bottom, #000918, rgba(0, 0, 0, 0));

    @media (max-width: 991.98px) {
      top: -3px;
      height: 30px;
    }
  }

  &.bottom {
    bottom: -23px;
    left: 0;
    width: 100%;
    height: 60px;
    background: linear-gradient(to top, #000918, rgba(0, 0, 0, 0));

    @media (max-width: 991.98px) {
      bottom: -2px;
      height: 30px;
    }
  }
}

.image-wrapper {
  position: relative;
  display: inline-block;
}
</style>
