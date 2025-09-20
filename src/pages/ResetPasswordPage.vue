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
        <h2 class="mb-5">重設密碼</h2>
        <p class="fs-5">請輸入您的新密碼</p>

        <form @submit.prevent="handleResetPassword">
          <!-- 新密碼 -->
          <div class="mb-3">
            <label class="form-label fs-5">新密碼</label>
            <input
              v-model="password"
              type="password"
              class="form-control"
              required
              :disabled="isLoading"
              @blur="validatePassword"
            />
            <p v-if="passwordError" class="text-danger mt-1">
              *密碼需包含英文數字大小寫，最短8個字，最長16個字
            </p>
          </div>

          <!-- 確認密碼 -->
          <div class="mb-3">
            <label class="form-label fs-5">確認新密碼</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="form-control"
              required
              :disabled="isLoading"
              @blur="validateConfirmPassword"
            />
            <p v-if="confirmPasswordError" class="text-danger mt-1">
              密碼不一致
            </p>
          </div>

          <button
            class="btn btn-primary-600 btn-lg custom-btn mt-5"
            :disabled="
              passwordError ||
              confirmPasswordError ||
              isLoading ||
              !password ||
              !confirmPassword
            "
          >
            {{ isLoading ? '重設中...' : '重設密碼' }}
          </button>
        </form>

        <div class="d-flex justify-content-center mt-5">
          <p class="mb-0">
            <router-link
              to="/login"
              class="text-primary-500 text-decoration-underline"
              >返回登入</router-link
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// import axios from 'axios'
import { api } from '@/api'

const password = ref('')
const confirmPassword = ref('')
const passwordError = ref(false)
const confirmPasswordError = ref(false)
const isLoading = ref(false)
const token = ref('')

const router = useRouter()
const route = useRoute()

function validatePassword() {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/
  passwordError.value = !pattern.test(password.value)
  validateConfirmPassword()
}

function validateConfirmPassword() {
  confirmPasswordError.value = password.value !== confirmPassword.value
}

// 重設密碼處理
async function handleResetPassword() {
  validatePassword()
  validateConfirmPassword()

  if (passwordError.value || confirmPasswordError.value) return

  if (!token.value) {
    alert('無效的重設連結，請重新申請忘記密碼')
    router.push('/forgot-password')
    return
  }

  isLoading.value = true

  try {
    await api.patch(`/api/v1/auth/reset-password?token=${token.value}`, {
      new_password: password.value,
      password_check: confirmPassword.value
    })

    alert('密碼重設成功！請使用新密碼登入。')
    router.push('/login')
  } catch (error) {
    console.error('重設密碼失敗:', error)
    alert(
      error.response?.data?.message || '重設密碼失敗，請稍後再試或重新申請。'
    )
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // 從 URL 查詢參數取得 token
  token.value = route.query.token

  if (!token.value) {
    alert('無效的重設連結，請重新申請忘記密碼')
    router.push('/forgot-password')
  }
})
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
