<template>
  <div class="container">
    <div class="d-flex justify-content-center">
      <div class="learning-center row container">
        <div class="side-nav col-xl-3 d-xl-block d-none">
          <div class="px-3 py-5">
            <h3 class="fs-6 px-3 fw-bold">學習中心</h3>
            <hr class="divider my-5" />
            <ul class="list-group list-group-flush">
              <li
                class="list-group-item"
                :class="{ active: route.path === '/user/courses' }"
              >
                <router-link to="/user/courses" class="nav-link">
                  我的課程
                </router-link>
              </li>
              <li
                class="list-group-item"
                :class="{ active: route.path === '/user/subscriptions' }"
              >
                <router-link to="/user/subscriptions" class="nav-link">
                  訂閱紀錄
                </router-link>
              </li>
              <li
                class="list-group-item active"
                :class="{ active: route.path === '/user/profiles' }"
              >
                編輯個人資料
              </li>
            </ul>
          </div>
        </div>

        <div class="col-xl-9 p-lg-8 px-2 py-8" style="max-width: 1056px">
          <h2 class="fs-lg-4 mb-lg-8 mb-6">個人資料</h2>

          <div class="card-wrapper"></div>
          <div class="profile-group row card-content">
            <div class="col-12 col-md-6 text-center">
              <div
                class="profile-avatar ratio ratio-1x1 rounded-circle overflow-hidden mx-auto"
              >
                <img
                  v-if="userAvatar"
                  :src="userAvatar"
                  alt="個人照片"
                  class="object-fit-cover w-100 h-100"
                  @error="handleAvatarError"
                />
                <div
                  v-else
                  class="w-100 h-100 d-flex align-items-center justify-content-center bg-primary-600"
                >
                  <i
                    class="bi bi-person-fill text-white"
                    style="font-size: 200px"
                  ></i>
                </div>
              </div>
              <!-- 審核狀態標籤 -->
              <div class="mb-4">
                <span
                  class="badge fs-8 px-3 py-2"
                  :class="isEmailVerified ? 'badge-approved' : 'badge-pending'"
                >
                  {{ isEmailVerified ? '信箱已通過驗證' : '信箱尚未驗證' }}
                </span>
              </div>
              <div v-if="inputState === 'inEdit'" class="mt-3">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handleFileSelect"
                />
                <button
                  class="btn btn-primary-600"
                  :disabled="isUploading"
                  @click="triggerFileSelect"
                >
                  {{ isUploading ? '上傳中...' : '選擇照片' }}
                </button>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="mb-3">
                <label class="form-label fs-lg-5 fs-7 fw-bold">會員名稱</label>
                <input
                  v-model="userName"
                  type="text"
                  class="form-control"
                  :disabled="inputState === 'readOnly'"
                />
              </div>
              <div class="mb-3">
                <label class="form-label fs-lg-5 fs-7 fw-bold">Email</label>
                <input
                  v-model="userEmail"
                  type="email"
                  class="form-control"
                  disabled
                />

                <div v-if="inputState === 'readOnly'" class="my-5">
                  <div class="d-flex justify-content-evenly gap-3 flex-wrap">
                    <button
                      v-if="!isEmailVerified"
                      class="btn btn-primary-600"
                      :disabled="resending"
                      @click="resendVerifyEmail"
                    >
                      {{ resending ? '寄送中…' : '重新寄送驗證信' }}
                    </button>

                    <button class="btn btn-primary-600" @click="goEdit">
                      編輯個人資料
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="inputState === 'inEdit'">
                <div class="mb-3">
                  <label class="form-label fs-lg-5 fs-7 fw-bold"
                    >目前密碼</label
                  >
                  <input
                    v-model="userOldPwd"
                    type="password"
                    class="form-control"
                    placeholder="如需修改密碼，再輸入"
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label fs-lg-5 fs-7 fw-bold">新密碼</label>
                  <input
                    v-model="userNewPwd"
                    type="password"
                    class="form-control"
                    placeholder="如需修改密碼，再輸入"
                    :disabled="!isNewPwdEnabled"
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label fs-lg-5 fs-7 fw-bold"
                    >再輸入一次新密碼</label
                  >
                  <input
                    v-model="userCheckPwd"
                    type="password"
                    class="form-control"
                    placeholder="如需修改密碼，再輸入"
                    :disabled="!isCheckPwdEnabled"
                  />
                </div>
                <!-- 佔用於密碼狀態提示，後面可換成 vee-validation之類的? -->
                <p class="valid-message">{{ pwdValidMessage }}</p>
              </div>
              <div
                v-if="inputState === 'readOnly'"
                class="my-5 text-center"
              ></div>
              <div
                v-else-if="inputState === 'inEdit'"
                class="my-5 text-center d-flex justify-content-evenly"
              >
                <button class="btn btn-primary-600" @click="confirmEdit">
                  確定修改
                </button>
                <button class="btn btn-notification" @click="cancelEdit">
                  取消修改
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
// import axios from 'axios'
import { api } from '@/api'
import { useRoute } from 'vue-router'
import { user } from '@/store/user'

const route = useRoute()
const userToken = computed(() => user.value?.token)
const userId = ref(null)
const fileInput = ref(null)
const isUploading = ref(false)

const userName = ref('使用者名稱')
const userEmail = ref('使用者信箱')
const userAvatar = ref('')
const avatarPublicId = ref('')
const userOldPwd = ref('')
const userNewPwd = ref('')
const userCheckPwd = ref('')
// inputState 的值為 readOnly/inEdit，決定input可否輸入的狀態，與要呈現哪些button
const inputState = ref('readOnly')
const backupData = ref({})
const pwdValidMessage = ref('')
const pwdValidStatus = ref(false)
const editData = ref({})

const isNewPwdEnabled = computed(() => userOldPwd.value !== '')
const isCheckPwdEnabled = computed(() => userNewPwd.value !== '')

const pwdRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/

// 撰寫驗證訊息
watch([userOldPwd, userNewPwd, userCheckPwd], () => {
  pwdValidMessage.value = ''
  pwdValidStatus.value = false
  // 開始輸入新密碼後，才會顯示驗證訊息
  if (!userNewPwd.value.length) {
    return
  }
  // 新密碼不符合規則，顯示 "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
  if (!pwdRule.test(userNewPwd.value)) {
    pwdValidMessage.value =
      '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
    return
  }
  // 目前密碼 === 新密碼時，顯示 "新密碼請勿與舊密碼相同"
  if (userOldPwd.value === userNewPwd.value) {
    pwdValidMessage.value = '新密碼請勿與舊密碼相同'
    return
  }
  // 密碼欄位三缺一，顯示 "密碼欄位請填寫完整"
  if ([userOldPwd, userNewPwd, userCheckPwd].some(pwd => !pwd.value)) {
    pwdValidMessage.value = '密碼欄位請填寫完整'
    return
  }
  // 新密碼 !== 再輸入一次新密碼時，顯示 "密碼不一致，請重新輸入"
  if (userCheckPwd.value !== userNewPwd.value) {
    pwdValidMessage.value = '密碼不一致，請重新輸入'
  }
  pwdValidStatus.value = true
})

// 送 API 的欄位驗證，通過才放入
const validInput = () => {
  if (avatarPublicId.value) {
    editData.value.profile_image_url = userAvatar.value
    editData.value.profile_image_public_id = avatarPublicId.value
  }
  // 名稱沒輸入跳出
  // 名稱有更改 → 加入 editData
  // 名稱重複 → 不會被加入 editData
  if (!userName.value.trim()) {
    alert('請填寫使用者名稱')
    return false
  }
  if (userName.value.trim() !== backupData.value.name) {
    editData.value.name = userName.value
  }
  // 加入密碼
  // 密碼全空白 > 驗證通過，不加入資料
  // 密碼欄位全填且驗證通過 > 加入三個密碼欄位資料
  const allPwdEmpty =
    !userOldPwd.value && !userNewPwd.value && !userCheckPwd.value
  if (allPwdEmpty) return true

  if (!pwdValidStatus.value) {
    return false
  }
  editData.value.oldPassword = userOldPwd.value
  editData.value.newPassword = userNewPwd.value
  editData.value.newPassword_check = userCheckPwd.value
}

const resending = ref(false)
const isEmailVerified = ref(false)

onMounted(async () => {
  const auth = await getAuthInfo(userToken.value)
  if (!auth) return

  userId.value = await verifyLogin(userToken.value)
  const userData = await getUserData(userToken.value, userId.value)
  userName.value = userData.name
  userEmail.value = userData.email
  userAvatar.value = userData.profile_image_url
  isEmailVerified.value = Boolean(auth.is_verified)
})

// 驗證登入API
async function verifyLogin(token) {
  try {
    const {
      data: {
        data: { id }
      }
    } = await api.get('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return id
  } catch (error) {
    console.error(error)
  }
}
// 取得使用者資料API
async function getUserData(token, userId) {
  try {
    const {
      data: { data }
    } = await api.get(`/api/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  } catch (error) {
    console.error(error)
  }
}
async function getAuthInfo(token) {
  const { data } = await api.get('/api/v1/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data.data // { id, name, email, is_verified, ... }
}

// 重新寄出驗證信件
async function resendVerifyEmail() {
  try {
    resending.value = true
    await api.post(
      '/api/v1/auth/resend-verification',
      {},
      { headers: { Authorization: `Bearer ${userToken.value}` } }
    )

    alert('驗證信已重新寄出，請至信箱完成驗證！')
  } catch (err) {
    console.error('重寄驗證信失敗：', err)
    alert(err.response?.data?.message || '重寄失敗，請稍後再試')
  } finally {
    resending.value = false
  }
}

// 觸發檔案選擇
const triggerFileSelect = () => {
  fileInput.value?.click()
}

// 處理檔案選擇
const handleFileSelect = async event => {
  const file = event.target.files[0]
  if (!file) return
  // 檔案類型驗證
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    alert('僅支援圖片格式(JPG, JPEG, PNG)')
    return
  }

  // 檔案大小驗證 (2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('檔案大小不能超過 2MB')
    return
  }

  try {
    await uploadAvatarFile(file)
  } catch (error) {
    console.error('上傳失敗:', error)
    alert('照片上傳失敗，請稍後再試')
  }
}

// 上傳頭像檔案
const uploadAvatarFile = async file => {
  isUploading.value = true

  try {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await api.post('/api/v1/users/upload-avatar', formData, {
      headers: {
        Authorization: `Bearer ${userToken.value}`
      }
    })
    // 更新頭像 URL
    if (response.data.data.url) {
      userAvatar.value = response.data.data.url
      avatarPublicId.value = response.data.data.publicId
      alert('照片上傳成功！')
    } else {
      throw new Error('上傳回應格式錯誤')
    }
  } catch (error) {
    console.error('上傳照片失敗:', error)
    throw error
  } finally {
    isUploading.value = false
    // 清空檔案輸入框
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// 修改使用者資料API
async function editUserData(token, userId) {
  return await api.patch(`/api/v1/users/${userId}`, editData.value, {
    headers: { Authorization: `Bearer ${token}` }
  })
}

// 複製資料, 切換畫面
const goEdit = () => {
  backupData.value = {
    name: userName.value,
    email: userEmail.value,
    imageURL: userAvatar.value
  }
  inputState.value = 'inEdit'
}

// 取消修改
// 恢復畫面, 資料存回
const cancelEdit = () => {
  userName.value = backupData.value.name
  userEmail.value = backupData.value.email
  userAvatar.value = backupData.value.imageURL
  avatarPublicId.value = ''
  userOldPwd.value = ''
  userNewPwd.value = ''
  userCheckPwd.value = ''
  backupData.value = {}
  inputState.value = 'readOnly'
}

// 確認修改
// 戳 API, 恢復畫面
const confirmEdit = async () => {
  if (validInput() === false) {
    return
  }
  try {
    const { status, data } = await editUserData(userToken.value, userId.value)
    if (status === 200) {
      alert('更新成功')
      userName.value = data.data.name || backupData.value.name
      userAvatar.value =
        data.data.profile_image_url || backupData.value.imageURL
      avatarPublicId.value = ''
      backupData.value = {}
      userOldPwd.value = ''
      userNewPwd.value = ''
      userCheckPwd.value = ''
      inputState.value = 'readOnly'
    }
  } catch (err) {
    // 修改失敗
    // 保持現狀，使用提示視窗(先用原生的，後續再改為Bootstrap Modal或Sweet Alert套件)
    alert('請重新確認欄位')
    console.log(err)
    userName.value = backupData.value.name
    userAvatar.value = backupData.value.imageURL
    avatarPublicId.value = ''
    userOldPwd.value = ''
    userNewPwd.value = ''
    userCheckPwd.value = ''
  }
}
</script>

<style scoped lang="scss">
.side-nav {
  border-left: 1px solid $primary-100;
  border-right: 1px solid $primary-100;
  padding: 0;
  width: 240px;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: start;
}

.container > .d-flex {
  align-items: stretch;
  min-height: 100vh; // 關鍵：讓整個容器最小高度滿版
}

.divider {
  opacity: 1;
  border: 0;
  border-top: 1px solid $primary-000;
}

.list-group {
  .list-group-item {
    border: none;
    padding: 12px 16px;
    margin-bottom: 8px;
  }
  .active {
    border-radius: 4px;
    color: $primary-100;
  }
}

.user-profile {
  padding: 40px;

  .profile-avatar {
    width: 300px;
  }
  @media (max-width: 992px) {
    padding: 40px 12px;
  }
}
.profile-group {
  margin-top: 40px;
  padding: 24px;
  @media (max-width: 992px) {
    padding: 12px;
  }
}
// input的樣式，可以考慮放到全域
.form-control {
  background-color: $grey-000;
  border-color: $primary-700;
  color: $grey-700;
  &:disabled {
    background-color: $grey-200;
    border-color: $grey-300;
    color: $grey-500;
  }
  &::placeholder {
    color: $grey-500;
  }
}

.btn-primary {
  padding: 8px 16px;
}

.btn-notification {
  color: #fff0f0;
  &:hover {
    background-color: #ff8080;
    border-color: #ff8080;
    color: #800000;
  }
}

.valid-message {
  color: $notification;
}

@media (max-width: 1024px) {
  .side-nav {
    display: none;
  }
}
.card-wrapper {
  background-color: $primary-600;
  border-radius: 15px 15px 0 0;
  height: 50px;

  margin-left: -0.75rem;
  margin-right: -0.75rem;
}

.card-content {
  border-radius: 15px;
  background-color: $primary-000;
  margin-top: -38px;
  color: $grey-700;
  border: 1px solid rgba(236, 239, 253, 1);
  box-shadow: 0 0 5px 0 rgba(94, 142, 221, 1);
}
.badge {
  font-size: 0.75rem;
  padding: 8px 12px;
  border-radius: 100px;
  border: 1px solid $primary-400;
  line-height: 150%;
  font-weight: 600;
  margin-top: 8px;

  &.badge-approved {
    background-color: $success;
    color: $primary-000;
  }

  &.badge-pending {
    background-color: $notification;
    color: $primary-000;
  }
}
</style>
