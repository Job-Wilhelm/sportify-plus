<template>
  <div class="container mt-10">
    <div class="row">
      <div class="col-lg-6">
        <div class="image-wrapper">
          <img
            src="../assets/images/coach-logo.png"
            alt="教練圖片"
            class="crop-img"
          />
        </div>
      </div>
      <div class="col-lg-6">
        <h2>教練註冊</h2>
        <form @submit.prevent="handleRegister">
          <!-- 姓名 -->
          <p>*sportify+會保護您的個資，您將以暱稱授課</p>
          <div class="mb-3 mt-3">
            <label class="form-label fs-5">取個暱稱</label>
            <input
              v-model="nickname"
              type="text"
              class="form-control"
              required
            />
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
            <p v-if="passwordError" class="text-danger mt-1">*密碼格式錯誤!</p>
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
            class="btn btn-lg btn-primary custom-btn mt-5"
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
// import axios from 'axios'
import { api } from '@/api'
import { useRouter } from 'vue-router'

const nickname = ref('')
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
    await api.post('/api/v1/auth/coaches/signup', {
      nickname: nickname.value,
      email: email.value,
      password: password.value,
      password_check: checkPassword.value
    })

    alert('註冊成功')
    router.push('/login')
  } catch (error) {
    console.error(error)
    alert(error.response?.data?.message || '註冊失敗')
  }
}
</script>

<style scoped>
.custom-btn {
  display: block;
  margin: 0 auto;
  width: 200px;
  max-width: 100%;
}
.image-wrapper {
  width: 100%;
  height: 570px;
  overflow: hidden;
}

.crop-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center; /* 或 center center 視圖片位置而定 */
  display: block;
  border-radius: 12px;
}
</style>
