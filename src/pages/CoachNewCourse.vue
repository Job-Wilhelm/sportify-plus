<template>
  <div class="p-lg-8 px-2 py-8">
    <h2 class="fs-lg-4 mb-lg-8 mb-6">建立新課程</h2>

    <div class="card-wrapper"></div>
    <div class="card-content p-5 mb-5">
      <form class="container">
        <div class="mb-5">
          <label for="name" class="form-label fw-bold">課程名稱</label>
          <input
            id="name"
            v-model.trim="form.name"
            type="text"
            class="form-control"
            placeholder="請輸入課程名稱"
            required
          />
        </div>

        <div class="mb-5">
          <label for="intro" class="form-label fw-bold">課程介紹</label>
          <textarea
            id="intro"
            v-model="form.intro"
            class="form-control"
            rows="5"
            placeholder="請輸入課程介紹"
            required
          ></textarea>
        </div>

        <div class="mb-5">
          <label for="category" class="form-label fw-bold">課程類別</label>
          <select
            id="category"
            v-model="form.category"
            class="form-select"
            required
          >
            <option disabled value="">請選擇類別</option>
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>

        <div class="mb-5">
          <label class="form-label fw-bold">上傳封面照片</label>
          <div class="d-flex flex-column gap-3">
            <!-- 隱藏的檔案輸入框 -->
            <input
              ref="fileInput"
              type="file"
              class="d-none"
              accept="image/*"
              @change="selectImg"
            />

            <!-- 自訂樣式的上傳按鈕 -->
            <button
              type="button"
              class="btn btn-outline-primary"
              :disabled="isUploadingThumbnail"
              @click="triggerFileSelect"
            >
              <i
                v-if="!isUploadingThumbnail"
                class="bi bi-cloud-upload me-2"
              ></i>
              <span
                v-if="isUploadingThumbnail"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              {{ isUploadingThumbnail ? '上傳中...' : '選擇封面照片' }}
            </button>

            <!-- 上傳進度提示 -->
            <div v-if="isUploadingThumbnail" class="text-primary-600 small">
              <i class="bi bi-info-circle me-1"></i>
              正在上傳封面照片，請稍候...
            </div>

            <!-- 圖片預覽 -->
            <div v-if="previewURL" class="mt-2">
              <img
                :src="previewURL"
                alt="照片預覽"
                class="img-preview rounded"
              />
            </div>
          </div>
        </div>

        <div class="mb-5">
          <label class="form-label fw-bold">課程影片上傳</label>
          <div class="upload-section">
            <draggable
              ref="draggableRef"
              @course-id-received="handleCourseIdReceived"
            ></draggable>
          </div>
        </div>

        <div class="text-center mt-8">
          <button
            type="submit"
            class="btn btn-primary-600 px-5 py-3"
            :disabled="isSubmitting"
            @click.prevent="formSubmit"
          >
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            <i v-else class="bi bi-plus-circle me-2"></i>
            {{ isSubmitting ? '建立中...' : '建立新課程' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import draggable from '@/components/VueDraggable.vue'
import { useRouter } from 'vue-router'
// import axios from 'axios'
import { api } from '@/api'

const router = useRouter()
const courseId = ref(null)
const fileInput = ref(null)
const categories = ref([])
const form = reactive({ name: '', intro: '', category: '' })
const previewURL = ref('')
const draggableRef = ref(null)
const isSubmitting = ref(false)
const isUploadingThumbnail = ref(false)
const thumbnailUrl = ref('')
const thumbnailPublicId = ref('')

const checkUserVerification = () => {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      alert('請先登入')
      router.push('/login')
      return false
    }

    const user = JSON.parse(userStr)
    if (!user.is_verified) {
      alert('須待個人資料通過驗證，方可建立新課程')
      router.push('/coach/profile')
      return false
    }

    // 設定 categories 為用戶的技能
    if (user.skills && Array.isArray(user.skills)) {
      categories.value = user.skills
    } else {
      alert('請先到個人資料頁面設定您的專長技能')
      router.push('/coach/profile')
      return false
    }

    return true
  } catch (error) {
    console.error('檢查用戶驗證狀態失敗:', error)
    alert('驗證狀態檢查失敗，請重新登入')
    router.push('/login')
    return false
  }
}

onMounted(() => {
  checkUserVerification()
})

const handleCourseIdReceived = id => {
  courseId.value = id
  console.log('接收到 course_id:', id)
}

const triggerFileSelect = () => {
  fileInput.value?.click()
}

function formatChaptersData() {
  if (!draggableRef.value) return []

  const chapters = draggableRef.value.chapters

  return chapters.map((chapter, chapterIndex) => ({
    chapter_number: chapterIndex + 1,
    chapter_title: chapter.title,
    sub_chapter: chapter.sections.map((section, sectionIndex) => ({
      subchapter_id: section.id,
      sub_chapter_number: sectionIndex + 1,
      subtitle: section.title,
      filename: section.fileName
    }))
  }))
}

async function createCourse() {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('請先登入')
    return
  }

  const chapters = formatChaptersData()

  const courseData = {
    name: form.name,
    description: form.intro,
    sports_type: form.category,
    chapters
  }

  if (thumbnailUrl.value && thumbnailPublicId.value) {
    courseData.image_url = thumbnailUrl.value
    courseData.image_public_id = thumbnailPublicId.value
  }
  console.log(courseData)
  try {
    const response = await api.patch(
      `/api/v1/coaches/courses/${courseId.value}`,
      courseData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.status) {
      alert('課程建立成功！')
      router.push('/coach/courses')
    } else {
      throw new Error(response.data.message || '建立課程失敗')
    }
  } catch (error) {
    console.error('建立課程失敗:', error)
    alert(`建立課程失敗: ${error.response?.data?.message || error.message}`)
  }
}

async function selectImg(e) {
  const file = e.target.files[0]
  if (!file) return

  const allowed = ['png', 'jpeg', 'jpg']
  const type = file.type.split('/').pop()
  if (!allowed.includes(type)) {
    alert('僅支援圖片格式(png, jpg, jpeg)')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('檔案請勿超過5MB')
    return
  }

  if (previewURL.value) {
    URL.revokeObjectURL(previewURL.value)
  }
  previewURL.value = URL.createObjectURL(file)

  await uploadCourseThumbnail(file)
}

async function uploadCourseThumbnail(file) {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('請先登入')
    return
  }

  isUploadingThumbnail.value = true

  try {
    const formData = new FormData()
    formData.append('courseThumbnail', file)

    const response = await api.post(
      '/api/v1/coaches/upload-course-thumbnail',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.status) {
      thumbnailUrl.value = response.data.data.url
      thumbnailPublicId.value = response.data.data.publicId
      console.log('封面照片上傳成功:', response.data.data)
    } else {
      throw new Error(response.data.message || '封面照片上傳失敗')
    }
  } catch (error) {
    console.error('封面照片上傳失敗:', error)
    alert(`封面照片上傳失敗: ${error.response?.data?.message || error.message}`)

    // 上傳失敗時清除預覽
    if (previewURL.value) {
      URL.revokeObjectURL(previewURL.value)
      previewURL.value = ''
    }
  } finally {
    isUploadingThumbnail.value = false
  }
}

async function formSubmit() {
  // 表單驗證
  if (!form.name.trim()) {
    alert('請輸入課程名稱')
    return
  }

  if (!form.intro.trim()) {
    alert('請輸入課程介紹')
    return
  }

  if (!form.category) {
    alert('請選擇課程類別')
    return
  }

  // 檢查是否有上傳封面照片
  if (!thumbnailUrl.value) {
    alert('請上傳課程封面照片')
    return
  }

  // 檢查是否有章節資料
  if (
    !draggableRef.value ||
    !draggableRef.value.chapters ||
    draggableRef.value.chapters.length === 0
  ) {
    alert('請至少建立一個章節')
    return
  }

  // 檢查章節是否有影片
  const chapters = draggableRef.value.chapters
  let hasVideo = false

  for (const chapter of chapters) {
    for (const section of chapter.sections) {
      if (section.fileName) {
        hasVideo = true
        break
      }
    }
    if (hasVideo) break
  }

  if (!hasVideo) {
    alert('請至少上傳一個影片')
    return
  }

  isSubmitting.value = true

  try {
    await createCourse()
  } finally {
    isSubmitting.value = false
  }
}
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

.img-preview {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border: 1px solid $grey-300;
}

.upload-section {
  padding: 20px;
  border: 1px dashed $primary-700;
  border-radius: 8px;
  background-color: rgba(252, 252, 252, 0.1);
  transition: all 0.2s ease;

  &:hover {
    border-color: $primary-600;
    background-color: rgba(236, 239, 253, 0.1);
  }
}

.btn-primary-600 {
  background-color: $primary-600;
  border-color: $primary-600;
  color: $primary-000;

  &:hover {
    background-color: $primary-700;
    border-color: $primary-700;
  }

  &:disabled {
    opacity: 0.6;
  }
}

.btn-outline-primary {
  border-color: $primary-600;
  color: $primary-600;
  background-color: transparent;

  &:hover {
    background-color: $primary-600;
    border-color: $primary-600;
    color: $primary-000;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.text-primary-600 {
  color: $primary-600;
}

// 響應式設計
@media (max-width: 768px) {
  .img-preview {
    max-width: 150px;
    max-height: 150px;
  }

  .container {
    padding: 0;
  }
}
</style>
