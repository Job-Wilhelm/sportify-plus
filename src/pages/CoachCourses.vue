<template>
  <div>
    <!-- 當有課程資料時顯示課程列表 -->
    <div
      v-if="courses.length > 0"
      class="d-flex flex-wrap course-grid gap-lg-8 gap-md-6 pt-8 ps-8"
    >
      <div
        v-for="course in courses"
        :key="course.course_id"
        class="mb-4 course-card"
      >
        <div class="card h-100 rounded-4 p-5 position-relative">
          <div class="img-wrapper position-relative">
            <div class="img-decorate">
              <span
                class="badge fs-9 text-primary-000"
                :class="
                  course.is_approved === '已審核'
                    ? 'badge-approved'
                    : 'badge-pending'
                "
              >
                {{ course.is_approved }}
              </span>
            </div>

            <div class="img-container">
              <img
                v-if="course.picture_url"
                :src="course.picture_url"
                class="card-img-top mb-5 rounded-3"
                :alt="course.title"
              />
              <div
                v-else
                class="card-img-top mb-5 rounded-3 no-image d-flex align-items-center justify-content-center"
              >
                <span class="material-symbols-outlined text-muted">image</span>
              </div>
            </div>
          </div>

          <div class="card-body p-0">
            <h5 class="card-title fs-7 mb-3 fw-bold">
              {{ course.title }}
            </h5>

            <div class="d-flex justify-content-between mb-3">
              <p class="d-flex align-items-center mb-0">
                <span class="material-symbols-outlined star"> star </span>
                <span>{{ course.score }}</span>
              </p>
              <p class="d-flex align-items-center mb-0">
                <span class="material-symbols-outlined"> person </span>
                <span>{{ course.numbers_of_view }}</span>
              </p>
              <p class="d-flex align-items-center mb-0">
                <span class="material-symbols-outlined"> schedule </span>
                <span>{{ course.total_hours }}h</span>
              </p>
            </div>

            <p class="card-text mb-4">
              {{ course.description }}
            </p>

            <div class="mt-auto">
              <button
                class="btn btn-primary-600 w-100"
                @click="openEditModal(course)"
              >
                編輯課程
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 當沒有課程資料時顯示空狀態 -->
    <div
      v-else
      class="empty-state d-flex flex-column align-items-center justify-content-center text-center"
    >
      <div class="empty-icon mb-4">
        <span class="material-symbols-outlined">school</span>
      </div>
      <h3 class="mb-3 text-grey-600">還沒有建立任何課程</h3>
      <p class="text-grey-500 mb-0">
        開始建立您的第一個課程，與學員分享您的專業知識！
      </p>
    </div>

    <div
      id="editCourseModal"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="editCourseModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content bg-transparent">
          <div class="modal-body p-0">
            <div class="p-lg-8 px-2 py-8 w-100">
              <h2 class="fs-lg-4 mb-lg-8 mb-6">編輯課程</h2>

              <div class="card-wrapper"></div>
              <div class="card-content p-5 mb-5">
                <form class="container">
                  <!-- 審核建議回覆區域 -->
                  <div
                    v-if="editForm.review_comment"
                    class="review-comment-section mb-5"
                  >
                    <div class="alert alert-warning d-flex align-items-start">
                      <span
                        class="material-symbols-outlined text-warning me-3 mt-1"
                      >
                        feedback
                      </span>
                      <div>
                        <h6 class="alert-heading mb-2 fw-bold">審核建議</h6>
                        <p class="mb-0">{{ editForm.review_comment }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="mb-5">
                    <label for="editName" class="form-label fw-bold"
                      >課程名稱</label
                    >
                    <input
                      id="editName"
                      v-model.trim="editForm.name"
                      type="text"
                      class="form-control"
                      placeholder="請輸入課程名稱"
                      required
                    />
                  </div>

                  <div class="mb-5">
                    <label for="editIntro" class="form-label fw-bold"
                      >課程介紹</label
                    >
                    <textarea
                      id="editIntro"
                      v-model="editForm.intro"
                      class="form-control"
                      rows="5"
                      placeholder="請輸入課程介紹"
                      required
                    ></textarea>
                  </div>

                  <div class="mb-5">
                    <label for="editCategory" class="form-label fw-bold"
                      >課程類別</label
                    >
                    <select
                      id="editCategory"
                      v-model="editForm.category"
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
                    <label class="form-label fw-bold">更新封面照片</label>
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
                        {{
                          isUploadingThumbnail ? '上傳中...' : '更新封面照片'
                        }}
                      </button>

                      <!-- 上傳進度提示 -->
                      <div
                        v-if="isUploadingThumbnail"
                        class="text-primary-600 small"
                      >
                        <i class="bi bi-info-circle me-1"></i>
                        正在上傳封面照片，請稍候...
                      </div>

                      <!-- 圖片預覽 -->
                      <div
                        v-if="editPreviewURL || editForm.currentImageUrl"
                        class="mt-2"
                      >
                        <img
                          :src="editPreviewURL || editForm.currentImageUrl"
                          alt="照片預覽"
                          class="img-preview rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="mb-5">
                    <label class="form-label fw-bold">課程影片管理</label>
                    <div class="upload-section">
                      <draggable
                        ref="editDraggableRef"
                        :initial-data="editForm.chapters"
                        :course-id="editForm.id"
                        @course-id-received="handleCourseIdReceived"
                      ></draggable>
                    </div>
                  </div>

                  <!-- 操作按鈕區 -->
                  <div class="text-center mt-8">
                    <div class="d-flex justify-content-center gap-4">
                      <button
                        type="button"
                        class="btn btn-primary-600 px-5 py-3"
                        :disabled="isSubmitting"
                        @click="updateCourse"
                      >
                        <span
                          v-if="isSubmitting"
                          class="spinner-border spinner-border-sm me-2"
                        ></span>
                        <i v-else class="bi bi-check-circle me-2"></i>
                        {{ isSubmitting ? '更新中...' : '確定修改' }}
                      </button>
                      <button
                        type="button"
                        class="btn btn-grey-400 px-5 py-3"
                        :disabled="isSubmitting"
                        data-bs-dismiss="modal"
                      >
                        <i class="bi bi-x-circle me-2"></i>
                        取消修改
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import draggable from '@/components/VueDraggable.vue'
// import axios from 'axios'
import { api } from '@/api'

const coach = ref([])
const courses = ref([])
const categories = ref([])
const editForm = ref({
  id: null,
  name: '',
  intro: '',
  category: '',
  currentImageUrl: '',
  chapters: [],
  review_comment: ''
})

const editPreviewURL = ref('')
const editDraggableRef = ref(null)
const isSubmitting = ref(false)
const isUploadingThumbnail = ref(false)
const thumbnailUrl = ref('')
const thumbnailPublicId = ref('')
const fileInput = ref(null)

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const loadUserCategories = () => {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.skills && Array.isArray(user.skills)) {
        categories.value = user.skills
      } else {
        console.warn('用戶沒有設定技能，使用預設類別')
        // 如果用戶沒有技能，使用預設類別
        categories.value = [
          '瑜珈',
          '單車',
          '登山',
          '皮拉提斯',
          '足球',
          '籃球',
          '羽球',
          '重訓',
          '滑板',
          '有氧',
          '舞蹈',
          '游泳'
        ]
      }
    }
  } catch (error) {
    console.error('載入用戶技能失敗:', error)
    // 出錯時使用預設類別
    categories.value = [
      '瑜珈',
      '單車',
      '登山',
      '皮拉提斯',
      '足球',
      '籃球',
      '羽球',
      '重訓',
      '滑板',
      '有氧',
      '舞蹈',
      '游泳'
    ]
  }
}

async function getCourses() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('無登入 token')
      return
    }

    const res = await api.get('/api/v1/coaches/courses', {
      headers: { Authorization: `Bearer ${token}` }
    })
    courses.value = res.data.data.courses
    coach.value = res.data.data.coach
  } catch (error) {
    console.error('取得課程失敗:', error)
  }
}

async function openEditModal(course) {
  try {
    // 取得課程詳細資料
    const token = localStorage.getItem('token')
    const response = await api.get(
      `/api/v1/coaches/courses/${course.course_id}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (response.data.status) {
      const courseData = response.data.data

      let sortedChapters = []
      if (courseData.chapters && courseData.chapters.length > 0) {
        sortedChapters = courseData.chapters
          .sort((a, b) => (a.chapter_number || 0) - (b.chapter_number || 0))
          .map(chapter => ({
            ...chapter,
            sub_chapter: (chapter.sub_chapter || []).sort(
              (a, b) =>
                (a.sub_chapter_number || 0) - (b.sub_chapter_number || 0)
            )
          }))
      }

      // 填入表單資料
      editForm.value.id = course.course_id
      editForm.value.name = courseData.name
      editForm.value.intro = courseData.description
      editForm.value.category = courseData.sports_type
      editForm.value.currentImageUrl = courseData.image_url
      editForm.value.currentImageID = courseData.image_public_id
      editForm.value.chapters = sortedChapters
      editForm.value.review_comment = courseData.review_comment || ''

      // 清除之前的預覽圖片和上傳狀態
      editPreviewURL.value = ''
      thumbnailUrl.value = ''
      thumbnailPublicId.value = ''

      await nextTick()

      // 打開 Modal
      const modalEl = document.getElementById('editCourseModal')
      // eslint-disable-next-line no-undef
      const modal = new bootstrap.Modal(modalEl)
      modal.show()
    }
  } catch (error) {
    console.error('載入課程詳細資料失敗:', error)
    alert('載入課程資料失敗，請稍後再試')
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

  if (editPreviewURL.value) {
    URL.revokeObjectURL(editPreviewURL.value)
  }
  editPreviewURL.value = URL.createObjectURL(file)

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
    } else {
      throw new Error(response.data.message || '封面照片上傳失敗')
    }
  } catch (error) {
    console.error('封面照片上傳失敗:', error)
    alert(`封面照片上傳失敗: ${error.response?.data?.message || error.message}`)

    if (editPreviewURL.value) {
      URL.revokeObjectURL(editPreviewURL.value)
      editPreviewURL.value = ''
    }
  } finally {
    isUploadingThumbnail.value = false
  }
}

function formatChaptersData() {
  if (!editDraggableRef.value) return []

  const chapters = editDraggableRef.value.chapters
  return chapters.map((chapter, chapterIndex) => ({
    chapter_number: chapterIndex + 1,
    chapter_title: chapter.title,
    sub_chapter: chapter.sections.map((section, sectionIndex) => ({
      subchapter_id: section.id,
      sub_chapter_number: sectionIndex + 1,
      subtitle: section.title,
      filename: section.fileName || ''
    }))
  }))
}

async function updateCourse() {
  // 表單驗證
  if (!editForm.value.name.trim()) {
    alert('請輸入課程名稱')
    return
  }

  if (!editForm.value.intro.trim()) {
    alert('請輸入課程介紹')
    return
  }

  if (!editForm.value.category) {
    alert('請選擇課程類別')
    return
  }

  isSubmitting.value = true

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('請先登入')
      return
    }

    const chapters = formatChaptersData()

    const courseData = {
      name: editForm.value.name,
      description: editForm.value.intro,
      sports_type: editForm.value.category,
      image_url: editForm.value.currentImageUrl,
      image_public_id: editForm.value.currentImageID,
      chapters
    }

    // 如果有上傳新的封面照片
    if (thumbnailUrl.value && thumbnailPublicId.value) {
      courseData.image_url = thumbnailUrl.value
      courseData.image_public_id = thumbnailPublicId.value
    }

    const response = await api.patch(
      `/api/v1/coaches/courses/${editForm.value.id}`,
      courseData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.status) {
      alert('課程更新成功！')

      // 關閉 Modal
      const modalEl = document.getElementById('editCourseModal')
      // eslint-disable-next-line no-undef
      const modal = bootstrap.Modal.getInstance(modalEl)
      modal.hide()

      // 重新載入課程列表
      await getCourses()
    } else {
      throw new Error(response.data.message || '更新課程失敗')
    }
  } catch (error) {
    console.error('更新課程失敗:', error)
    alert(`更新課程失敗: ${error.response?.data?.message || error.message}`)
  } finally {
    isSubmitting.value = false
  }
}

const handleCourseIdReceived = id => {}

onMounted(async () => {
  loadUserCategories()
  await getCourses()
})
</script>

<style scoped lang="scss">
.course-grid {
  .course-card {
    width: 100%; // 預設手機版 1 欄

    @media (min-width: 768px) {
      width: calc((100% - 40px) / 2); // 平板 2 欄
    }

    @media (min-width: 992px) {
      width: calc((100% - 80px) / 3); // 桌機 3 欄
    }
  }
}

.card {
  border: 1px solid rgba(236, 239, 253, 1);
  box-shadow: 0 0 5px 0 rgba(94, 142, 221, 1);
  background-color: rgba(252, 252, 252, 0.1);
}

.img-decorate {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end; // 改為右對齊，只顯示審核狀態
  position: absolute;
  padding: 12px;
  z-index: 10;
}

.img-container {
  width: 100%;
  height: 160px; // 固定高度
  margin-bottom: 20px;
}

.badge {
  box-shadow: inset 0px 0px 0px 1px $primary-400;
  border-radius: 100px;
  line-height: 150%;
  padding: 4px 8px;
  font-weight: 600;

  &.badge-approved {
    background-color: $success;
  }
  &.badge-pending {
    background-color: $notification;
  }
}

.card-img-top {
  width: 100%;
  height: 160px;
  object-fit: cover;

  &.no-image {
    background-color: #f8f9fa;
    border: 1px dashed #dee2e6;

    .material-symbols-outlined {
      font-size: 48px;
      color: #6c757d;
    }
  }
}

.card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-title {
  line-height: 1.5;
  font-weight: 700;
}

.material-symbols-outlined {
  color: $secondary-600;
  padding-right: 4px;
  font-size: 18px;

  &.star {
    font-variation-settings: 'FILL' 1;
  }
}

.card-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
}

// 空狀態樣式
.empty-state {
  min-height: 400px;
  padding: 60px 20px;

  .empty-icon {
    width: 120px;
    height: 120px;
    background-color: rgba($primary-600, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;

    .material-symbols-outlined {
      font-size: 48px;
      color: $primary-600;
    }
  }

  h3 {
    font-size: 24px;
    font-weight: 600;
    color: $grey-600;
    margin-bottom: 12px;
  }

  p {
    font-size: 16px;
    color: $grey-500;
    max-width: 400px;
    line-height: 1.6;
  }
}

// Modal 內的樣式 - 與 CoachNewCourse 保持一致
.modal-content {
  border: none;
  border-radius: 0;
}

// 審核建議樣式
.review-comment-section {
  .alert {
    border: 1px solid #ffeaa7;
    background-color: #fff9e6;
    border-radius: 8px;

    .alert-heading {
      color: #e17055;
      font-size: 1rem;
    }

    p {
      color: #636e72;
      line-height: 1.6;
    }

    .material-symbols-outlined {
      font-size: 24px;
      color: #e17055;
    }
  }
}

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

.btn-grey-400 {
  background-color: $grey-400;
  border-color: $grey-400;
  color: $primary-000;

  &:hover {
    background-color: darken($grey-400, 10%);
    border-color: darken($grey-400, 10%);
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
