<template>
  <div class="p-lg-8 px-2 py-8">
    <h2 class="fs-lg-4 mb-lg-8 mb-6">教練個人資料</h2>

    <div class="card-wrapper"></div>
    <div class="card-content p-5 mb-5">
      <form novalidate @submit.prevent="handleSubmit">
        <!-- 頭像與基本資訊區塊 -->
        <div class="row mb-lg-8 mb-6">
          <!-- 頭像區域 -->
          <div class="col-12 col-lg-4 text-center mb-5 mb-lg-0">
            <div
              class="profile-avatar ratio ratio-1x1 rounded-circle overflow-hidden mx-auto mb-4"
            >
              <img
                v-if="profileImageFile"
                :src="profileImageFile"
                alt="個人照片"
                class="object-fit-cover"
              />
              <div
                v-else
                class="w-100 h-100 d-flex align-items-center justify-content-center bg-primary-600"
              >
                <i
                  class="bi bi-person-fill text-white"
                  style="font-size: 150px"
                ></i>
              </div>
            </div>

            <!-- 審核狀態標籤 -->
            <div class="mb-4">
              <span
                class="badge fs-8 px-3 py-2"
                :class="
                  coachProfile.is_verified ? 'badge-approved' : 'badge-pending'
                "
              >
                {{ coachProfile.is_verified ? '已通過審核' : '資料待審核' }}
              </span>
            </div>

            <!-- 編輯模式時的上傳按鈕 -->
            <div v-if="inputState === 'inEdit'">
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileSelect($event, 'coachAvatar')"
              />
              <button
                type="button"
                class="btn btn-primary-600"
                :disabled="isUploading"
                @click="triggerAvatarSelect"
              >
                {{ isUploading ? '上傳中...' : '選擇照片' }}
              </button>
            </div>
          </div>

          <!-- 基本資料表單 -->
          <div class="col-12 col-lg-8">
            <div class="row">
              <div class="col-12 col-md-6 mb-4">
                <label for="coachName" class="form-label fw-bold"
                  >教練名稱</label
                >
                <input
                  id="coachName"
                  v-model="coachProfile.nickname"
                  type="text"
                  class="form-control"
                  :disabled="inputState === 'readOnly'"
                />
              </div>
              <div class="col-12 col-md-6 mb-4">
                <label for="name" class="form-label fw-bold">真實姓名</label>
                <input
                  id="name"
                  v-model="coachProfile.realname"
                  type="text"
                  class="form-control"
                  :disabled="inputState === 'readOnly'"
                />
              </div>
              <div class="col-12 col-md-6 mb-4">
                <label for="birthDay" class="form-label fw-bold"
                  >出生年月日</label
                >
                <div class="position-relative">
                  <VDatePicker
                    v-model="birthdayDate"
                    :disabled="inputState === 'readOnly'"
                    :min-date="birthdayLimit.minDate"
                    :max-date="birthdayLimit.maxDate"
                    mode="date"
                    :popover="{
                      placement: 'bottom-start',
                      visibility: 'click'
                    }"
                    :masks="{ input: 'YYYY-MM-DD' }"
                    @dayclick="handleDayClick"
                  >
                    <template #default="{ inputValue, inputEvents }">
                      <input
                        id="birthDay"
                        :value="inputValue"
                        class="form-control"
                        :disabled="inputState === 'readOnly'"
                        placeholder="請選擇出生年月日"
                        readonly
                        v-on="inputEvents"
                      />
                    </template>
                  </VDatePicker>
                </div>
              </div>
              <div class="col-12 col-md-6 mb-4">
                <label for="idNum" class="form-label fw-bold">身分證字號</label>
                <input
                  id="idNum"
                  v-model="coachProfile.id_number"
                  type="text"
                  class="form-control"
                  :disabled="inputState === 'readOnly'"
                />
              </div>
              <div class="col-12 col-md-6 mb-4">
                <label for="tel" class="form-label fw-bold">手機</label>
                <input
                  id="tel"
                  v-model="coachProfile.phone_number"
                  type="tel"
                  class="form-control"
                  :disabled="inputState === 'readOnly'"
                />
              </div>
              <div class="col-12 col-md-6 mb-4">
                <label for="title" class="form-label fw-bold">稱號</label>
                <input
                  id="title"
                  v-model="coachProfile.job_title"
                  type="text"
                  class="form-control"
                  :disabled="inputState === 'readOnly'"
                />
              </div>
            </div>
          </div>
        </div>

        <hr class="divider mb-lg-6 mb-4" />

        <!-- 銀行資訊區塊 -->
        <div class="mb-lg-6 mb-5">
          <h4 class="fs-5 fw-bold mb-4 text-primary-900">銀行資訊</h4>
          <div class="row">
            <div class="col-12 col-md-6 mb-4">
              <label for="bankCode" class="form-label fw-bold">銀行代號</label>
              <input
                id="bankCode"
                v-model="coachProfile.bank_code"
                type="text"
                class="form-control"
                :disabled="inputState === 'readOnly'"
              />
            </div>
            <div class="col-12 col-md-6 mb-4">
              <label for="bankAccount" class="form-label fw-bold"
                >銀行帳號</label
              >
              <input
                id="bankAccount"
                v-model="coachProfile.bank_account"
                type="text"
                class="form-control"
                :disabled="inputState === 'readOnly'"
              />
            </div>
          </div>
        </div>

        <hr class="divider mb-lg-6 mb-4" />

        <!-- 專業資訊區塊 -->
        <div class="mb-lg-6 mb-5">
          <h4 class="fs-5 fw-bold mb-4 text-primary-900">專業資訊</h4>
          <div class="row">
            <div class="col-12 col-md-6 mb-4">
              <label for="specialtyIntro" class="form-label fw-bold"
                >專長類別</label
              >
              <input
                id="specialtyIntro"
                v-model="skills"
                type="text"
                class="form-control"
                :disabled="inputState === 'readOnly'"
              />
            </div>
            <div class="col-12 col-md-6 mb-4">
              <label for="years" class="form-label fw-bold">教學經驗(年)</label>
              <input
                id="years"
                v-model="coachProfile.experience_years"
                type="text"
                class="form-control"
                :disabled="inputState === 'readOnly'"
              />
            </div>
            <div class="col-12 mb-4">
              <label for="category" class="form-label fw-bold">專長介紹</label>
              <input
                id="category"
                v-model="coachProfile.skill_description"
                type="text"
                class="form-control"
                :disabled="inputState === 'readOnly'"
              />
            </div>
          </div>
        </div>

        <hr class="divider mb-lg-6 mb-4" />

        <!-- 個人資訊區塊 -->
        <div class="mb-lg-6 mb-5">
          <h4 class="fs-5 fw-bold mb-4 text-primary-900">個人資訊</h4>
          <div class="row">
            <div class="col-12 mb-4">
              <label for="experience" class="form-label fw-bold"
                >學經歷與得獎經歷</label
              >
              <textarea
                id="experience"
                v-model="coachProfile.experience"
                class="form-control"
                rows="4"
                :disabled="inputState === 'readOnly'"
              ></textarea>
            </div>
            <div class="col-12 col-md-6 mb-4">
              <label for="hobby" class="form-label fw-bold">興趣</label>
              <input
                id="hobby"
                v-model="coachProfile.hobby"
                type="text"
                class="form-control"
                :disabled="inputState === 'readOnly'"
              />
            </div>
            <div class="col-12 col-md-6 mb-4">
              <label for="motto" class="form-label fw-bold">座右銘</label>
              <input
                id="motto"
                v-model="coachProfile.motto"
                type="text"
                class="form-control"
                :disabled="inputState === 'readOnly'"
              />
            </div>
            <div class="col-12 mb-4">
              <label for="aboutMe" class="form-label fw-bold">自我介紹</label>
              <textarea
                id="aboutMe"
                v-model="coachProfile.about_me"
                class="form-control"
                rows="5"
                :disabled="inputState === 'readOnly'"
              ></textarea>
            </div>
          </div>
        </div>

        <hr class="divider mb-lg-6 mb-4" />

        <!-- 檔案上傳區塊 -->
        <div class="mb-lg-6 mb-5">
          <h4 class="fs-5 fw-bold mb-4 text-primary-900">相關文件</h4>

          <!-- 存摺封面上傳 -->
          <div class="mb-5">
            <label class="form-label fw-bold">存摺封面</label>
            <div
              v-if="inputState === 'inEdit'"
              class="d-flex flex-column gap-3"
            >
              <!-- 隱藏的檔案輸入框 -->
              <input
                id="bankbook"
                ref="bankbookInput"
                type="file"
                class="d-none"
                accept="image/*"
                :disabled="isBankBookloading"
                @change="handleFileSelect($event, 'bankbook')"
              />

              <!-- 自訂樣式的上傳按鈕 -->
              <button
                type="button"
                class="btn btn-outline-primary"
                :disabled="isBankBookloading"
                @click="$refs.bankbookInput?.click()"
              >
                <i
                  v-if="!isBankBookloading"
                  class="bi bi-cloud-upload me-2"
                ></i>
                <span
                  v-if="isBankBookloading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                {{ isBankBookloading ? '上傳中...' : '選擇存摺封面' }}
              </button>

              <!-- 上傳進度提示 -->
              <div v-if="isBankBookloading" class="text-primary-600 small">
                <i class="bi bi-info-circle me-1"></i>
                正在上傳存摺封面，請稍候...
              </div>
            </div>

            <!-- 圖片預覽 -->
            <div v-if="bankBookFile" class="mt-3">
              <img :src="bankBookFile" class="img-preview rounded" />
            </div>
          </div>

          <!-- 證照上傳 -->
          <div class="mb-4">
            <label class="form-label fw-bold">證照與資格證明</label>

            <!-- 現有證照列表 -->
            <div v-if="coachLicenses.length > 0" class="mt-3">
              <div class="row">
                <div
                  v-for="(license, index) in coachLicenses"
                  :key="license.file_public_id || index"
                  class="col-md-6 col-lg-4 mb-3"
                >
                  <div class="license-card">
                    <div class="position-relative mb-3">
                      <img
                        :src="license.file_url"
                        class="license-image w-100 rounded"
                      />
                      <button
                        v-if="inputState === 'inEdit'"
                        type="button"
                        class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                        @click="removeLicense(index)"
                      >
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                    <div>
                      <label class="form-label small fw-bold">證照名稱</label>
                      <input
                        v-model="license.filename"
                        type="text"
                        class="form-control form-control-sm"
                        placeholder="請輸入證照名稱"
                        :disabled="
                          inputState === 'readOnly' || !license.file_url
                        "
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 新增證照按鈕 -->
            <div v-if="inputState === 'inEdit'" class="mt-3">
              <div class="d-flex flex-column gap-3">
                <input
                  ref="licenseInput"
                  type="file"
                  class="d-none"
                  accept="image/*"
                  @change="handleFileSelect($event, 'license')"
                />
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  :disabled="isLicenseloading"
                  @click="triggerLicenseSelect"
                >
                  <i
                    v-if="!isLicenseloading"
                    class="bi bi-cloud-upload me-2"
                  ></i>
                  <span
                    v-if="isLicenseloading"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  {{ isLicenseloading ? '上傳中...' : '新增證照' }}
                </button>

                <!-- 上傳進度提示 -->
                <div v-if="isLicenseloading" class="text-primary-600 small">
                  <i class="bi bi-info-circle me-1"></i>
                  正在上傳證照，請稍候...
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按鈕區 -->
        <div class="text-center pt-4">
          <div v-if="inputState === 'readOnly'">
            <button
              type="button"
              class="btn btn-primary-600 px-5 py-3"
              @click="toEdit"
            >
              <i class="bi bi-pencil me-2"></i>
              編輯個人資料
            </button>
          </div>
          <div
            v-else-if="inputState === 'inEdit'"
            class="d-flex justify-content-center gap-4"
          >
            <button
              type="submit"
              class="btn btn-primary-600 px-5 py-3"
              :disabled="isSubmitting"
            >
              <span
                v-if="isSubmitting"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i v-else class="bi bi-check-circle me-2"></i>
              {{ isSubmitting ? '儲存中...' : '確定修改' }}
            </button>
            <button
              type="button"
              class="btn btn-grey-400 px-5 py-3"
              :disabled="isSubmitting"
              @click="cancelEdit"
            >
              <i class="bi bi-x-circle me-2"></i>
              取消修改
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// import axios from 'axios'
import { api } from '@/api'
import { user, initUser } from '@/store/user'
import { DatePicker as VDatePicker } from 'v-calendar'
import 'v-calendar/style.css'

const inputState = ref('readOnly')
const avatarInput = ref(null)
const skills = ref(null)
const isSubmitting = ref(false)
const isUploading = ref(false)
const isBankBookloading = ref(false)
const isLicenseloading = ref(false)

const coachProfile = ref({})
const coachLicenses = ref([])
const submitData = ref({})

// 備份資料
const backupData = ref({})
const backupImage = ref({})

// 圖片相關狀態
const profileImageFile = ref(null)
const profileImageId = ref(null)
const bankBookFile = ref(null)
const bankBookId = ref(null)
const licenseInput = ref(null)

// 顯示技能列表
const skillsDisplay = computed(() => {
  if (!coachProfile.value.skills || !Array.isArray(coachProfile.value.skills)) {
    return ''
  }
  return coachProfile.value.skills.map(skill => skill).join('、')
})

const birthdayLimit = computed(() => ({
  min: birthday(100),
  max: birthday(18),
  minDate: new Date(birthday(100)),
  maxDate: new Date(birthday(18))
}))

// 出生日期的計算屬性，用於 VCalendar
const birthdayDate = computed({
  get() {
    return coachProfile.value.birthday
      ? new Date(coachProfile.value.birthday)
      : null
  },
  set(value) {
    if (value) {
      const year = value.getFullYear()
      const month = String(value.getMonth() + 1).padStart(2, '0')
      const day = String(value.getDate()).padStart(2, '0')
      coachProfile.value.birthday = `${year}-${month}-${day}`
    } else {
      coachProfile.value.birthday = ''
    }
  }
})

function birthday(age) {
  const now = new Date()
  now.setFullYear(now.getFullYear() - age)
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// 修復 dayIndex 錯誤的事件處理器
const handleDayClick = (day, event) => {
  // 防止事件冒泡並移除焦點，這樣可以避免 dayIndex 錯誤
  if (event && event.target) {
    event.target.blur()
  }
}

// 資料驗證
const validateForm = () => {
  const errors = []

  // 必填欄位驗證
  if (!coachProfile.value.nickname || !coachProfile.value.nickname.trim()) {
    errors.push('教練名稱不能為空')
  }

  if (!coachProfile.value.realname || !coachProfile.value.realname.trim()) {
    errors.push('真實姓名不能為空')
  }

  if (
    !coachProfile.value.phone_number ||
    !coachProfile.value.phone_number.trim()
  ) {
    errors.push('手機號碼不能為空')
  }

  // 手機號碼格式驗證
  const phoneRegex = /^09\d{8}$/
  if (
    coachProfile.value.phone_number &&
    !phoneRegex.test(coachProfile.value.phone_number)
  ) {
    errors.push('手機號碼格式不正確（請輸入09開頭的10位數字）')
  }

  // 身分證字號驗證
  const idRegex = /^[A-Z][1-2]\d{8}$/
  if (
    coachProfile.value.id_number &&
    !idRegex.test(coachProfile.value.id_number)
  ) {
    errors.push('身分證字號格式不正確')
  }

  // 銀行代號驗證（3位數字）
  const bankCodeRegex = /^\d{3}$/
  if (
    coachProfile.value.bank_code &&
    !bankCodeRegex.test(parseInt(coachProfile.value.bank_code))
  ) {
    errors.push('銀行代號必須為3位數字')
  }

  // 銀行帳號驗證（10-16位數字）
  const bankAccountRegex = /^\d{10,16}$/
  if (
    coachProfile.value.bank_account &&
    !bankAccountRegex.test(parseInt(coachProfile.value.bank_account))
  ) {
    errors.push('銀行帳號必須為10-16位數字')
  }

  // 1. 稱號(job_title)最少 2 個字元，最長 12 字元，不得包含特殊字元與空白
  const jobTitle = coachProfile.value.job_title || ''
  if (!jobTitle.trim()) {
    errors.push('稱號不能為空')
  } else if (jobTitle.length < 2 || jobTitle.length > 12) {
    errors.push('稱號長度需為2~12字元')
  } else if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(jobTitle)) {
    errors.push('稱號不得包含特殊字元或空白')
  }

  // 2. bank_code, bank_account 不可空白
  if (!coachProfile.value.bank_code || !coachProfile.value.bank_code.trim()) {
    errors.push('銀行代號不可空白')
  }
  if (
    !coachProfile.value.bank_account ||
    !coachProfile.value.bank_account.trim()
  ) {
    errors.push('銀行帳號不可空白')
  }

  // 3. birthday 格式為 YYYY-MM-DD
  const birthday = coachProfile.value.birthday || ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    errors.push('請選擇出生年月日')
  } else {
    const birthDate = new Date(birthday)
    const now = new Date()
    const age = Math.floor((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000))

    if (age < 18) {
      errors.push('年齡必須滿18歲')
    } else if (age > 100) {
      errors.push('年齡不可超過100歲')
    }
  }

  // 4. about_me最少 10個字元
  const aboutMe = coachProfile.value.about_me || ''
  if (aboutMe.length < 10) {
    errors.push('自我介紹最少需10個字元')
  }

  // 5. skill 最少 2 個字元，不得包含特殊字元與空白，不同skill可用頓號(、)隔開
  const skillStr = skills.value || ''
  if (skillStr.length < 2) {
    errors.push('專長類別最少需2個字元')
  } else if (
    !/^([\u4e00-\u9fa5a-zA-Z0-9]+)(、[\u4e00-\u9fa5a-zA-Z0-9]+)*$/.test(
      skillStr
    )
  ) {
    errors.push('專長類別不得包含特殊字元或空白，請用頓號(、)分隔')
  }

  // 6. skill_description總字數不可超過100字，或少於10字
  const skillDesc = coachProfile.value.skill_description || ''
  if (skillDesc.length < 10 || skillDesc.length > 100) {
    errors.push('專長介紹字數需為10~100字')
  }

  // 7. experience最少 5個字元
  const experience = coachProfile.value.experience || ''
  if (experience.length < 5) {
    errors.push('學經歷與得獎經歷最少需5個字元')
  }

  // 8. license總字數不可超過50字，或少於5字
  const licenseStr = (coachLicenses.value || []).map(l => l.filename).join('、')
  if (
    licenseStr.length > 0 &&
    (licenseStr.length < 5 || licenseStr.length > 50)
  ) {
    errors.push('執照字數需為5~50字')
  }

  // 9. hobby,motto最少 2個字元
  const hobby = coachProfile.value.hobby || ''
  if (hobby && hobby.length < 2) {
    errors.push('興趣最少需2個字元')
  }
  const motto = coachProfile.value.motto || ''
  if (motto && motto.length < 2) {
    errors.push('座右銘最少需2個字元')
  }
  const expYears = coachProfile.value.experience_years
  if (
    expYears === undefined ||
    expYears === null ||
    expYears === '' ||
    !/^[1-9]\d*$/.test(expYears)
  ) {
    errors.push('教學經驗年數請輸入正整數，不可為0或小數')
  }

  if (errors.length > 0) {
    alert('表單驗證失敗：\n' + errors.join('\n'))
    return false
  }

  return true
}

// 照片檔案處理
const handleFileSelect = async ($event, type) => {
  const files = $event.target.files
  if (!files || files.length === 0) return

  // 檔案類型驗證
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      alert('僅支援圖片格式(PNG, JPG, JPEG)')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('檔案請勿超過2MB')
      return
    }
  }

  try {
    if (type === 'coachAvatar') {
      isUploading.value = true
      const { url, publicId } = await uploadImage(
        files[0],
        'coachAvatar',
        'upload-avatar'
      )
      profileImageFile.value = url
      profileImageId.value = publicId
      isUploading.value = false
    } else if (type === 'bankbook') {
      isBankBookloading.value = true
      const { url, publicId } = await uploadImage(
        files[0],
        type,
        'upload-bankbook'
      )
      bankBookFile.value = url
      bankBookId.value = publicId
      isBankBookloading.value = false
    } else if (type === 'license') {
      isLicenseloading.value = true
      const uploadResult = await uploadMultipleImages(
        files,
        type,
        'upload-license'
      )

      // 添加到證照列表
      coachLicenses.value.push({
        file_url: uploadResult[0].url,
        file_public_id: uploadResult[0].publicId,
        filename: ''
      })

      isLicenseloading.value = false
    }

    $event.target.value = ''
  } catch (error) {
    console.error('上傳檔案失敗:', error)
    alert('檔案上傳失敗，請重新選擇')
  }
}

// 上傳單張圖片
const uploadImage = async (file, imgName, endpoint) => {
  if (!file) return null

  const formData = new FormData()
  formData.append(imgName, file)

  const token = localStorage.getItem('token')
  const response = await api.post(`/api/v1/coaches/${endpoint}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const imageData = {
    url: response.data.data.url,
    publicId: response.data.data.publicId
  }
  return imageData
}

// 上傳多張圖片
const uploadMultipleImages = async (files, imgName, endpoint) => {
  if (!files || files.length === 0) return []

  const formData = new FormData()
  files.forEach(file => {
    formData.append(imgName, file)
  })

  const token = localStorage.getItem('token')
  const response = await api.post(`/api/v1/coaches/${endpoint}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const imageData = response.data.dataArray
  return imageData
}

// 移除證照
const removeLicense = index => {
  if (confirm('確定要刪除這張照片嗎？')) {
    coachLicenses.value.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const token = localStorage.getItem('token')
    submitData.value = JSON.parse(JSON.stringify(coachProfile.value))
    if (
      submitData.value.experience_years !== undefined &&
      submitData.value.experience_years !== null
    ) {
      submitData.value.experience_years = Number(
        submitData.value.experience_years
      )
    }

    if (profileImageId.value && profileImageFile.value) {
      submitData.value.profile_image_url = profileImageFile.value
      submitData.value.profile_image_public_id = profileImageId.value
    } else {
      delete submitData.value.profile_image_url
      delete submitData.value.profile_image_public_id
    }

    if (bankBookId.value && bankBookFile.value) {
      submitData.value.bankbook_copy_url = bankBookFile.value
      submitData.value.bankbook_copy_public_id = bankBookId.value
    } else {
      delete submitData.value.bankbook_copy_url
      delete submitData.value.bankbook_copy_public_id
    }

    // 過濾證照資料：只保留 url、filename、publicId 都有值的物件
    const validLicenses = coachLicenses.value.filter(license => {
      const hasUrl = license.file_url && license.file_url.trim() !== ''
      const hasFilename = license.filename && license.filename.trim() !== ''
      const hasId =
        license.file_public_id && license.file_public_id.trim() !== ''

      return hasUrl && hasFilename && hasId
    })

    if (validLicenses.length > 0) {
      submitData.value.license = validLicenses
        .map(file => file.filename)
        .join('、')
      submitData.value.license_data = validLicenses.map(file => ({
        filename: file.filename,
        file_url: file.file_url,
        file_public_id: file.file_public_id
      }))
    } else {
      delete submitData.value.license
      delete submitData.value.license_data
    }

    delete submitData.value.skills
    delete submitData.value.is_verified
    delete submitData.value.id
    delete submitData.value.email

    submitData.value.skill = skills.value
    submitData.value.favorite_words = '先跳過謝謝'

    // 提交主要資料
    const response = await api.patch(
      `/api/v1/coaches/${coachProfile.value.id}`,
      submitData.value,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.status) {
      alert('個人資料更新成功！')
      inputState.value = 'readOnly'

      // 清除備份檔案
      backupData.value = {}
      backupImage.value = {}

      // 重新載入最新資料
      await loadCoachProfile()
    } else {
      cancelEdit()
      throw new Error(response.data.message || '更新失敗')
    }
  } catch (error) {
    console.error('提交失敗:', error)
    cancelEdit()
    // 錯誤原因
    let errorMessage =
      error.response?.data?.message || error.message || '提交失敗'

    // 將 job_title 相關錯誤訊息轉換為稱號
    if (errorMessage.includes('job_title格式錯誤，中間不可有空格')) {
      errorMessage = errorMessage.replace(
        'job_title格式錯誤，中間不可有空格',
        '稱號格式錯誤，中間不可有空格'
      )
    } else if (
      errorMessage.includes('bank_account請輸入字串格式，不可為空白')
    ) {
      errorMessage = errorMessage.replace(
        'bank_account請輸入字串格式，不可為空白',
        '銀行帳號，不可為空白'
      )
    } else if (
      errorMessage.includes('experience_years請輸入數字，不可為0或小數')
    ) {
      errorMessage = errorMessage.replace(
        'experience_years請輸入數字，不可為0或小數',
        '教學經驗不可為0或小數'
      )
    } else if (
      errorMessage.includes('skill_description總字數不可超過100字，或少於10字')
    ) {
      errorMessage = errorMessage.replace(
        'skill_description總字數不可超過100字，或少於10字',
        '專長介紹字數不可超過100字，或少於10字'
      )
    } else if (errorMessage.includes('license總字數不可超過50字，或少於5字')) {
      errorMessage = errorMessage.replace(
        'license總字數不可超過50字，或少於5字',
        '執照字數不可超過50字，或少於5字'
      )
    }

    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

function toEdit() {
  // 備份表單文字資料
  backupData.value = JSON.parse(JSON.stringify(coachProfile.value))
  // 備份照片類
  backupImage.value.profile = {
    url: profileImageFile.value,
    id: profileImageId.value
  }
  backupImage.value.bankbook = { url: bankBookFile.value, id: bankBookId.value }
  backupImage.value.licenses = JSON.parse(JSON.stringify(coachLicenses.value))

  inputState.value = 'inEdit'
}

function cancelEdit() {
  // 恢復備份資料
  if (Object.keys(backupData.value).length > 0) {
    coachProfile.value = JSON.parse(JSON.stringify(backupData.value))
  }

  profileImageFile.value = backupImage.value.profile.url
  profileImageId.value = backupImage.value.profile.id

  bankBookFile.value = backupImage.value.bankbook.url
  bankBookId.value = backupImage.value.bankbook.id

  coachLicenses.value = JSON.parse(JSON.stringify(backupImage.value.licenses))

  // 清除備份檔案
  backupData.value = {}
  backupImage.value = {}

  skills.value = skillsDisplay.value

  inputState.value = 'readOnly'
}

function triggerAvatarSelect() {
  avatarInput.value?.click()
}

// 觸發證照選擇
const triggerLicenseSelect = () => {
  licenseInput.value?.click()
}

// 取得教練資料
const loadCoachProfile = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await api.get(`/api/v1/coaches/${user.value?.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (response.data.status) {
      const data = response.data.data
      coachLicenses.value = data.licenses.map(file => ({
        filename: file.name,
        file_public_id: file.file_public_id,
        file_url: file.file_url
      }))
      coachProfile.value = data.coachDetails || {}
      skills.value = skillsDisplay.value

      profileImageFile.value = coachProfile.value.profile_image_url
      bankBookFile.value = coachProfile.value.bankbook_copy_url

      delete coachProfile.value.created_at
      delete coachProfile.value.background_image_url
      delete coachProfile.value.background_image_public_id
    }
  } catch (error) {
    console.error('載入教練資料失敗:', error)
  }
}

onMounted(async () => {
  await initUser()
  await loadCoachProfile()
})
</script>

<style scoped lang="scss">
.card-wrapper {
  background-color: $primary-600;
  border-radius: 15px 15px 0 0;
  height: 50px;
}

.card-content {
  border-radius: 15px;
  background-color: $primary-000;
  margin-top: -38px;
  color: $grey-700;
  border: 1px solid rgba(236, 239, 253, 1);
  box-shadow: 0 0 5px 0 rgba(94, 142, 221, 1);
}

.divider {
  opacity: 1;
  border: 0;
  border-top: 1px solid $primary-000;
}

.form-control,
.form-select {
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

  &:focus {
    border-color: $primary-600;
    box-shadow: 0 0 0 0.2rem rgba(62, 91, 238, 0.25);
  }
}

.form-label {
  color: $grey-700;
  font-size: 0.875rem;
}

.text-primary-600 {
  color: $primary-600;
}

.profile-avatar {
  width: 200px;
  border: 3px solid $primary-600;
}

.img-preview {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border: 1px solid $grey-300;
}

.license-card {
  border: 1px solid rgba(236, 239, 253, 1);
  border-radius: 8px;
  padding: 16px;
  background-color: rgba(252, 252, 252, 0.1);
  box-shadow: 0 0 5px 0 rgba(94, 142, 221, 1);
  transition: all 0.2s ease;

  &:hover {
    border-color: $primary-600;
    box-shadow: 0 2px 8px rgba(62, 91, 238, 0.25);
  }
}

.license-image {
  height: 120px;
  object-fit: cover;
  border: 1px solid $grey-300;
}

.btn-primary-600 {
  background-color: $primary-600;
  border-color: $primary-600;
  color: $primary-000;
  padding: 8px 16px;

  &:hover {
    background-color: $primary-300;
    border-color: $primary-300;
    color: $primary-700;
  }

  &:disabled {
    opacity: 0.6;
  }
}

.btn-grey-400 {
  background-color: $grey-400;
  border-color: $grey-400;
  color: $primary-000;
  padding: 8px 16px;

  &:hover {
    background-color: darken($grey-400, 10%);
    border-color: darken($grey-400, 10%);
  }
}

.btn-outline-primary {
  border-color: $primary-600;
  color: $primary-600;
  padding: 8px 16px;

  &:hover {
    background-color: $primary-600;
    border-color: $primary-600;
    color: $primary-000;
  }
}

.btn-notification {
  color: #fff0f0;
  padding: 8px 16px;

  &:hover {
    background-color: #ff8080;
    border-color: #ff8080;
    color: #800000;
  }
}

.badge {
  font-size: 0.75rem;
  padding: 8px 12px;
  border-radius: 100px;
  border: 1px solid $primary-400;
  line-height: 150%;
  font-weight: 600;

  &.badge-approved {
    background-color: $success;
    color: $primary-000;
  }

  &.badge-pending {
    background-color: $notification;
    color: $primary-000;
  }
}

.text-primary-900 {
  color: $primary-900;
}

// 響應式設計
@media (max-width: 768px) {
  .profile-avatar {
    width: 150px;
  }

  .img-preview {
    max-width: 150px;
  }

  .license-image {
    height: 100px;
  }
}

// VCalendar 自定義樣式
:deep(.vc-container) {
  font-family: inherit;

  .vc-header {
    padding: 10px;
  }

  .vc-title {
    font-size: 1rem;
    font-weight: 600;
    color: $primary-900;
  }

  .vc-weekday {
    font-size: 0.875rem;
    font-weight: 500;
    color: $grey-600;
    padding: 8px;
  }

  .vc-day {
    min-height: 32px;

    .vc-day-content {
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover {
        background-color: rgba(62, 91, 238, 0.1);
      }

      &.vc-day-content-selected {
        background-color: $primary-600;
        color: white;
      }

      &.vc-day-content-disabled {
        color: $grey-400;
        cursor: not-allowed;
      }
    }
  }

  .vc-nav-arrow {
    color: $primary-600;

    &:hover {
      background-color: rgba(62, 91, 238, 0.1);
    }
  }
}
</style>
