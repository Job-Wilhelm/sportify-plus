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
        <h2>註冊</h2>
        <form @submit.prevent="handleRegister">
          <!-- 姓名 -->
          <div class="mb-3 mt-3">
            <label class="form-label fs-5">姓名</label>
            <input v-model="name" type="text" class="form-control" required />
          </div>

          <!-- Email -->
          <div class="mb-3 mt-3">
            <label class="form-label fs-5">Email</label>
            <input
              v-model="email"
              type="email"
              class="form-control"
              required
              @blur="validateEmail"
            />
            <p v-if="emailError" class="text-danger mt-1">
              *不是正確Email格式!
            </p>
          </div>

          <!-- 密碼 -->
          <div class="mb-3">
            <label class="form-label fs-5">密碼</label>
            <input
              v-model="password"
              type="password"
              class="form-control"
              required
              @blur="validatePassword"
            />
            <p v-if="passwordError" class="text-danger mt-1">
              *密碼格式錯誤!密碼需 8–16 碼，且同時包含大寫、小寫字母與數字。
            </p>
          </div>

          <!-- 確認密碼 -->
          <div class="mb-3">
            <label class="form-label fs-5">確認密碼</label>
            <input
              v-model="checkPassword"
              type="password"
              class="form-control"
              required
              @blur="validateCheckPassword"
            />
            <p v-if="checkPasswordError" class="text-danger mt-1">密碼不一致</p>
          </div>

          <button
            class="btn btn-primary-600 custom-btn mt-5"
            :disabled="emailError || passwordError || checkPasswordError"
          >
            註冊
          </button>
        </form>

        <div class="d-flex justify-content-between mt-5">
          <p class="mb-0">
            已有帳號？
            <router-link
              to="/login"
              class="text-primary-500 text-decoration-underline"
            >
              立即登入
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {api} from '@/api'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const checkPassword = ref('')
const emailError = ref(false)
const passwordError = ref(false)
const checkPasswordError = ref(false)
const router = useRouter()

function validateEmail() {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailError.value = !pattern.test(email.value)
}

function validatePassword() {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/
  passwordError.value = !pattern.test(password.value)
  validateCheckPassword()
}

function validateCheckPassword() {
  checkPasswordError.value = password.value !== checkPassword.value
}

async function handleRegister() {
  validateEmail()
  validatePassword()
  validateCheckPassword()
  if (emailError.value || passwordError.value || checkPasswordError.value)
    return

  try {
    await api.post('/api/v1/auth/users/signup', {
      name: name.value,
      email: email.value,
      password: password.value,
      password_check: checkPassword.value
    })

    alert(
      '註冊成功！驗證信已寄出，請至您的信箱完成驗證，即可立即開啟 7 日 Eagerness 免費試用。'
    )
    router.push('/login')
  } catch (error) {
    console.error(error)
    alert(error.response?.data?.message || '註冊失敗')
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
  }

  &.top {
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background: linear-gradient(to bottom, #000918, rgba(0, 0, 0, 0));
  }

  &.bottom {
    bottom: -23px;
    left: 0;
    width: 100%;
    height: 60px;
    background: linear-gradient(to top, #000918, rgba(0, 0, 0, 0));
  }
  @media (max-width: 991.98px) {
    &.right {
      right: -12px;
      width: 40px;
    }
    &.top {
      top: -3x;
      height: 30px;
    }
    &.bottom {
      bottom: -2px;
      height: 30px;
    }
  }
}
</style>
