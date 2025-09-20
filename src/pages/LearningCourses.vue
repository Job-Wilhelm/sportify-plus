<template>
  <div class="container">
    <div class="d-flex">
      <!-- 左側選單 -->
      <div class="side-nav">
        <div class="px-3 py-5">
          <h3 class="fs-6 px-3 fw-bold">學習中心</h3>
          <hr class="divider my-5" />
          <ul class="list-group list-group-flush">
            <li
              class="list-group-item active"
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
              class="list-group-item"
              :class="{ active: route.path === '/user/profile' }"
            >
              <router-link to="/user/profile" class="nav-link">
                編輯個人資料
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- 右側主區塊 -->
      <div class="p-lg-8 px-2 py-8 w-100" style="max-width: 1056px">
        <h2 class="fs-lg-4">你的專屬教練群</h2>

        <!-- 無訂閱狀態 -->
        <div v-if="!hasValidSubscription" class="text-center py-8">
          <div class="mb-6">
            <i class="bi bi-play-circle display-1 text-primary-400 mb-4"></i>
            <h3 class="mb-4 text-primary-600">開始您的學習之旅</h3>
            <p class="text-grey-600 mb-6 fs-5">
              您目前沒有有效的訂閱方案，無法觀看課程內容。<br />
              立即訂閱，解鎖所有專業課程！
            </p>
            <router-link
              to="/users/subscription"
              class="btn btn-primary-600 btn-lg px-5 py-3 text-decoration-none"
            >
              立即訂閱
            </router-link>
          </div>
        </div>

        <!-- 有訂閱狀態 -->
        <div v-else>
          <!-- 課程類型按鈕 -->
          <div ref="scrollWrapper" class="scrollable-btn-wrapper">
            <!-- 加寬上下區塊，讓滑動更容易 -->
            <div
              class="scrollable-btn-group d-flex flex-row align-items-center my-lg-8 my-6"
              @scroll="onScroll"
            >
              <div
                class="btn-group types-btn-group gap-3"
                role="group"
                aria-label="Basic outlined button group"
              >
                <button
                  class="btn btn-outline-grey-400"
                  :class="{ active: !currentType && !isFavoriteOnly }"
                  @click="
                    () => {
                      currentType = ''
                      isFavoriteOnly = false
                      currentPage = 1
                    }
                  "
                >
                  所有課程
                </button>
                <button
                  class="btn btn-outline-grey-400"
                  :class="{ active: isFavoriteOnly }"
                  @click="
                    () => {
                      isFavoriteOnly = !isFavoriteOnly
                      currentType = ''
                      currentPage = 1
                    }
                  "
                >
                  已收藏
                </button>
                <button
                  v-for="type in courseTypes"
                  :key="type"
                  class="btn btn-outline-grey-400"
                  :class="{ active: currentType === type && !isFavoriteOnly }"
                  @click="
                    () => {
                      currentType = type
                      isFavoriteOnly = false
                      currentPage = 1
                    }
                  "
                >
                  {{ type }}
                </button>
              </div>
            </div>
            <div v-if="!hasScrolled && isOverflowing" class="scroll-hint"></div>
          </div>

          <!-- 沒有收藏課程的提示 -->
          <div
            v-if="isFavoriteOnly && filteredCourses.length === 0"
            class="text-center py-8"
          >
            <div class="mb-6">
              <i class="bi bi-heart display-1 text-grey-400 mb-4"></i>
              <h3 class="mb-4 text-grey-600">尚未收藏任何課程</h3>
              <p class="text-grey-500 mb-6 fs-5">
                瀏覽課程並點擊愛心圖示來收藏您喜歡的課程
              </p>
              <button
                class="btn btn-primary-600 btn-lg px-5 py-3"
                @click="
                  () => {
                    isFavoriteOnly = false
                    currentType = ''
                    currentPage = 1
                  }
                "
              >
                瀏覽所有課程
              </button>
            </div>
          </div>

          <!-- 課程網格 -->
          <div class="d-flex flex-wrap course-grid gap-lg-8 gap-md-6">
            <div
              v-for="course in pagedCourses"
              :key="course.course_id"
              class="mb-4 course-card"
            >
              <div class="card h-100 rounded-4 p-5 position-relative">
                <div class="img-wrapper position-relative">
                  <div class="img-decorate">
                    <span class="badge bg-primary-100 fs-9 text-grey-700">{{
                      course.course_type
                    }}</span>
                    <i
                      :class="course.isFavorited ? 'bi-heart-fill' : 'bi-heart'"
                      class="bi heart"
                      @click="toggleFavorite(course)"
                    ></i>
                  </div>

                  <img
                    :src="course.course_image_url || learningCourseImg1"
                    class="card-img-top mb-5 rounded-3"
                    :alt="course.name"
                    style="object-fit: cover; height: 160px"
                  />
                  <div class="card-body p-0">
                    <h5 class="card-title fs-7 mb-2 fw-bold">
                      {{ course.course_name }}
                    </h5>
                    <p class="card-text mb-2 fs-7">
                      {{ course.coach_name }}
                    </p>

                    <router-link
                      :to="{
                        name: 'VideoCourses',
                        params: { courseId: course.course_id }
                      }"
                      class="btn btn-primary-600 w-100 mb-2"
                    >
                      點擊上課
                    </router-link>

                    <button
                      class="btn btn-outline-grey-400 w-100"
                      data-bs-toggle="modal"
                      data-bs-target="#ratingModal"
                      @click="openRatingModal(course)"
                    >
                      {{ course.isRated ? '查看評分' : '為此課程評分' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分頁 -->
          <div
            v-if="totalPages >= 1 && filteredCourses.length > 0"
            class="mt-11"
          >
            <nav class="d-flex justify-content-center" style="padding-top: 4px">
              <ul class="pagination mb-0">
                <li
                  class="page-item"
                  :class="{ disabled: currentPage === 1 }"
                  @click="changePage(currentPage - 1)"
                >
                  <a class="page-link me-lg-11">
                    <i class="bi bi-chevron-left d-inline d-lg-none"></i>
                    <span class="d-none d-lg-inline">上一頁</span>
                  </a>
                </li>

                <li
                  v-for="page in totalPages"
                  :key="page"
                  class="page-item mx-2"
                  :class="{ active: page === currentPage }"
                  @click="changePage(page)"
                >
                  <a class="page-link">{{ page }}</a>
                </li>

                <li
                  class="page-item"
                  :class="{ disabled: currentPage === totalPages }"
                  @click="changePage(currentPage + 1)"
                >
                  <a class="page-link ms-lg-11">
                    <i class="bi bi-chevron-right d-inline d-lg-none"></i>
                    <span class="d-none d-lg-inline">下一頁</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <!-- 評分 Modal -->
        <div
          id="ratingModal"
          ref="modalRef"
          class="modal fade"
          tabindex="-1"
          aria-labelledby="ratingModalLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog custom-modal-width">
            <div class="modal-content rounded-4 p-5 bg-grey-000">
              <div class="modal-header border-bottom text-grey-900 p-0 pb-3">
                <h5
                  id="ratingModalLabel"
                  class="modal-title fw-bold text-primary-900"
                >
                  評分
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body p-0 mb-6">
                <!-- 評分顯示 -->
                <div class="d-flex justify-content-center my-6 gap-6">
                  <i
                    v-for="i in 5"
                    :key="i"
                    class="bi"
                    :class="
                      i <= rating
                        ? 'bi-star-fill text-warning'
                        : 'bi-star text-grey-400'
                    "
                    style="font-size: 32px; cursor: pointer"
                    @click="isEditing && (rating = i)"
                  ></i>
                </div>
                <!-- 評語輸入 or 顯示 -->
                <div v-if="isEditing">
                  <textarea
                    v-model="comment"
                    class="form-control bg-grey-000 text-grey-500"
                    rows="4"
                    placeholder="請分享你的課程心得"
                    maxlength="100"
                  ></textarea>
                  <div class="text-end mt-1 fs-8 text-grey-500">
                    {{ comment.length }}/100
                  </div>
                </div>
                <div v-else>
                  <p class="text-grey-700">{{ comment }}</p>
                </div>
              </div>
              <div class="modal-footer border-0 p-0">
                <template v-if="isEditing">
                  <button
                    type="button"
                    class="btn btn-primary w-100"
                    :disabled="!rating || !comment"
                    @click="submitRating"
                  >
                    送出
                  </button>
                </template>
                <template v-else>
                  <button
                    type="button"
                    class="btn btn-primary-600 w-100"
                    @click="isEditing = true"
                  >
                    編輯
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
// import axios from 'axios'
import { api } from '@/api'
import { user, initUser } from '@/store/user'

import learningCourseImg1 from '@/assets/images/learningCourse-1.png'

const modalInstance = ref(null)
const route = useRoute()

const currentType = ref('')
const currentPage = ref(1)
const isFavoriteOnly = ref(false)
const rating = ref(0)
const comment = ref('')
const selectedCourse = ref(null)
const pageSize = 6
const isEditing = ref(false)

const courses = ref([])
const courseTypes = ref([])
const hasValidSubscription = ref(false)

// 滾動相關
const hasScrolled = ref(false)
const isOverflowing = ref(false)
const scrollWrapper = ref(null)

// 計算屬性
const filteredCourses = computed(() => {
  let filtered = courses.value

  // 篩選課程分類
  if (currentType.value) {
    filtered = filtered.filter(c => c.course_type === currentType.value)
  }

  // 篩選已收藏
  if (isFavoriteOnly.value) {
    filtered = filtered.filter(c => c.isFavorited)
  }

  return filtered
})

const totalPages = computed(() => {
  if (isFavoriteOnly.value && filteredCourses.value.length === 0) {
    return 0
  }
  return Math.ceil(filteredCourses.value.length / pageSize)
})

const pagedCourses = computed(() => {
  if (filteredCourses.value.length === 0) {
    return []
  }
  const start = (currentPage.value - 1) * pageSize
  return filteredCourses.value.slice(start, start + pageSize)
})

// 方法
const onScroll = () => {
  hasScrolled.value = true
}

const checkOverflow = () => {
  const wrapper = document.querySelector('.scrollable-btn-group')
  if (!wrapper) return
  const isMobile = window.innerWidth <= 530
  isOverflowing.value = isMobile && wrapper.scrollWidth > wrapper.clientWidth
}

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const fetchCourseTypes = async token => {
  try {
    const res = await api.get('/api/v1/users/course-type', {
      headers: { Authorization: `Bearer ${token}` }
    })
    courseTypes.value = res.data.data.map(item => item.course_type)
  } catch (err) {
    console.error('載入課程類別失敗', err)
  }
}

const fetchAllUserCourses = async token => {
  try {
    // 先抓第 1 頁，並拿到總頁數
    const first = await api.get('/api/v1/users/courses', {
      headers: { Authorization: `Bearer ${token}` },
      params: { page: 1 }
    })
    const allData = [...first.data.data]
    const totalPages = first.data.meta.pagination.total_pages

    // 之後的頁一起併入
    const requests = []
    for (let p = 2; p <= totalPages; p++) {
      requests.push(
        api.get('/api/v1/users/courses', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: p }
        })
      )
    }
    const results = await Promise.all(requests)
    results.forEach(r => allData.push(...r.data.data))

    // 最後一次性寫入 courses
    courses.value = allData
      .filter(c => c.is_approved) // ← 只留下審核通過
      .map(c => ({
        ...c,
        isRated: false,
        isFavorited: c.isFavorited || false
      }))

    // 為每堂課補抓評分狀態
    await Promise.all(courses.value.map(c => fetchUserRatingByCourseId(c)))
    hasValidSubscription.value = true
    console.log('載入課程成功，有有效訂閱')
  } catch (err) {
    console.error('載入所有課程失敗:', err)
    courses.value = []
    hasValidSubscription.value = false
    console.log('載入課程失敗，沒有有效訂閱')
  }
}

const toggleFavorite = async course => {
  const token = localStorage.getItem('token')
  const userData = user.value
  const userId = userData?.id || userData?._id
  const courseId = course.course_id || course.id

  if (!userData || !token) {
    alert('請先登入才能收藏課程')
    return
  }
  if (!token || !userId || !courseId) return

  try {
    if (course.isFavorited) {
      await api.delete(`/api/v1/users/${userId}/favorites/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      course.isFavorited = false
    } else {
      await api.post(
        `/api/v1/users/${userId}/favorites/${courseId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      course.isFavorited = true
    }
  } catch (error) {
    console.error('收藏操作失敗:', error)
  }
}

const submitRating = async () => {
  const userData = user.value

  if (!userData || !userData.id) {
    console.warn('尚未登入或使用者資料未初始化')
    return
  }

  const token = localStorage.getItem('token')
  if (!selectedCourse.value || !userData || !token) return

  const userId = userData.id
  const courseId = selectedCourse.value.course_id || selectedCourse.value.id

  const postUrl = `/api/v1/users/${userId}/ratings/${courseId}`
  const patchUrl = `/api/v1/users/${userId}/rating/${courseId}`

  const payload = {
    score: rating.value,
    comment: comment.value
  }

  try {
    await api.post(postUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    selectedCourse.value.isRated = true
    alert('評分送出成功！')
  } catch (error) {
    const message = error.response?.data?.message
    if (message === '已有評價資料') {
      try {
        await api.patch(patchUrl, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        alert('評分已更新！')
      } catch (patchErr) {
        console.error('修改評價失敗:', patchErr)
        alert('修改評價失敗，請稍後再試')
        return
      }
    } else {
      console.error('送出評價失敗:', error)
      alert('送出失敗，請稍後再試')
      return
    }
  }

  // 更新 local state
  const index = courses.value.findIndex(c => (c.course_id || c.id) === courseId)
  if (index !== -1) {
    courses.value[index].isRated = true
  }

  rating.value = 0
  comment.value = ''

  // 關閉 modal
  const modalEl = document.getElementById('ratingModal')
  if (modalEl) {
    const modal =
      // eslint-disable-next-line no-undef
      bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)
    modal.hide()
  }
}

const openRatingModal = async course => {
  selectedCourse.value = course

  const userData = user.value
  const username = userData.displayName
  const token = localStorage.getItem('token')

  if (!userData || !username) {
    console.warn('使用者資料錯誤')
    return
  }
  if (!userData || !userData.id) {
    console.warn('尚未登入或使用者資料未初始化')
    return
  }
  const courseId = course.course_id || course.id
  if (!courseId) {
    console.warn('課程 ID 缺失')
    return
  }

  try {
    const res = await api.get(`/api/v1/users/courses/${courseId}/ratings`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const allRatings = res.data.data?.paginatedData || []
    const userRating = allRatings.find(r => r.username === username)

    if (userRating) {
      rating.value = userRating.score
      comment.value = userRating.comment || ''
      isEditing.value = false
      course.isRated = true
    } else {
      rating.value = 0
      comment.value = ''
      isEditing.value = true
      course.isRated = false
    }

    // 開啟 Modal
    const modalEl = document.getElementById('ratingModal')
    if (modalEl) {
      modalInstance.value =
        // eslint-disable-next-line no-undef
        bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)
      modalInstance.value.show()
    }
  } catch (err) {
    console.error('查詢評價失敗', err)
    rating.value = 0
    comment.value = ''
    isEditing.value = true
    course.isRated = false
  }
}

const fetchUserRatingByCourseId = async course => {
  const token = localStorage.getItem('token')
  const userWrapper = JSON.parse(localStorage.getItem('user'))
  const userData = userWrapper?.data || userWrapper

  if (!course || (!course.id && !course.course_id)) return

  const courseId = course.course_id || course.id

  try {
    const res = await api.get(`/api/v1/users/courses/${courseId}/ratings`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const ratings = res.data.data?.paginatedData || []
    const match = ratings.find(r => r.username === userData.displayName)

    if (match) {
      course.isRated = true
      course.ratingData = match
    } else {
      course.isRated = false
      course.ratingData = null
    }
  } catch (err) {
    console.error('查詢課程評價失敗', err)
    course.isRated = false
    course.ratingData = null
  }
}

// 拖拽滾動功能
let isDown = false
let startX = 0
let scrollLeft = 0

function onMouseDown(e) {
  if (e.target.closest('button, a, .btn')) return

  isDown = true
  scrollWrapper.value.classList.add('dragging')
  startX = e.pageX - scrollWrapper.value.offsetLeft
  scrollLeft = scrollWrapper.value.scrollLeft
  document.body.style.userSelect = 'none'
}

function onMouseMove(e) {
  if (!isDown) return
  e.preventDefault()
  const x = e.pageX - scrollWrapper.value.offsetLeft
  const walk = x - startX
  scrollWrapper.value.scrollLeft = scrollLeft - walk
}

function onMouseUp() {
  isDown = false
  scrollWrapper.value.classList.remove('dragging')
  document.body.style.userSelect = ''
}

// 生命週期
onMounted(async () => {
  checkOverflow()
  window.addEventListener('resize', checkOverflow)

  await initUser()
  const token = localStorage.getItem('token')
  if (!token) {
    route.push('/login')
    return
  }

  await fetchCourseTypes(token)
  await fetchAllUserCourses(token)

  // 設置拖拽事件
  if (scrollWrapper.value) {
    const el = scrollWrapper.value
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mouseleave', onMouseUp)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkOverflow)

  if (scrollWrapper.value) {
    const el = scrollWrapper.value
    el.removeEventListener('mousedown', onMouseDown)
    el.removeEventListener('mousemove', onMouseMove)
    el.removeEventListener('mouseup', onMouseUp)
    el.removeEventListener('mouseleave', onMouseUp)
  }
})
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
@media (max-width: 1400px) {
  .side-nav {
    display: none;
  }
}

.container > .d-flex {
  align-items: stretch; // 這你已經有加了
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
.scrollable-btn-wrapper {
  position: relative;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  cursor: grab;
  /* Firefox */
  scrollbar-width: none;
  /* IE 10+ */
  -ms-overflow-style: none;
}
/* Chrome、Safari、Edge */
.scrollable-btn-wrapper::-webkit-scrollbar {
  display: none;
}
.scrollable-btn-wrapper.dragging {
  cursor: grabbing;
}
.scroll-hint {
  position: absolute;
  top: 32px;
  right: 0;
  width: 48px;
  height: 40px;
  pointer-events: none;
  background: linear-gradient(to left, $primary-300, transparent);
  z-index: 10;

  // 可加上閃爍動畫讓它被注意到
  animation-name: pulse-hint; /* 動畫名稱          */
  animation-duration: 1.6s; /* 每圈 0.8 秒       */
  animation-timing-function: ease-in-out;
  animation-iteration-count: 3; /* 只跑 3 圈          */
  animation-fill-mode: forwards; /* 跑完保持最後狀態   */
}

// 無訂閱狀態的樣式
.display-1 {
  font-size: 4rem;
}

.btn-lg {
  font-size: 1.125rem;
  padding: 0.75rem 1.5rem;
}

@keyframes pulse-hint {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 0;
  } /* ← 這裡改掉，跑完就看不見 */
}
.scrollable-btn-group {
  -webkit-overflow-scrolling: touch;
  white-space: nowrap;
  display: block;
  scrollbar-width: none; // Firefox
  &::-webkit-scrollbar {
    display: none; // Chrome、Safari、Edge
  }
  .btn-group {
    display: inline-flex;
    flex-wrap: nowrap;
    min-width: max-content; // 讓它延伸超過容器寬
  }

  // 手機版下才套用 max-width 限制
  @media (max-width: 992px) {
    margin-left: -1rem; // 滑動時讓按鈕能靠齊邊
    margin-right: -1rem;
    padding: 0 1rem;
  }
}

.types-btn-group.btn-group > .btn {
  display: inline-flex;
  align-items: center;
  border: 0;
  border-radius: 8px;
  color: $primary-000;
  box-shadow: inset 0 0 0 1px $grey-400;
  &:hover {
    background-color: $primary-300;
    color: $primary-700;
  }
  &:active,
  &.active,
  &:focus-visible {
    background-color: $primary-700;
    color: $primary-000;
  }
}
.course-grid {
  .course-card {
    width: 100%; // 預設手機版 1 欄

    @media (min-width: 768px) {
      width: calc((100% - 40px) / 2); // 平板 2 欄（gap: 40px）
    }

    @media (min-width: 992px) {
      width: calc((100% - 80px) / 3); // 桌機 3 欄（gap: 40px * 2）
    }
  }
}
.card {
  border: 1px solid rgba(236, 239, 253, 1); // 邊框色
  box-shadow: 0 0 5px 0 rgba(94, 142, 221, 1); // Drop shadow
  background-color: rgba(252, 252, 252, 0.1);
}
.img-decorate {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  padding: 12px;
}
.badge {
  box-shadow: inset 0px 0px 0px 1px $primary-400;
  border-radius: 100px;
  line-height: 150%;
  padding: 4px 8px;
}
.heart {
  font-size: 24px;
  border-radius: 4px;
  padding: 8px;
  color: #e30000;
  background-color: rgba(252, 252, 252, 0.5);
  width: 40px;
  height: 40px;
  cursor: pointer;
}
.heart::before {
  vertical-align: top; // 置中
}
// modal style
textarea::placeholder {
  color: $grey-400; // modal placeholder
}
.custom-modal-width {
  max-width: 488px;
}
.form-control {
  min-height: 175px;
  resize: none;
}

.page-link {
  cursor: pointer;
  background-color: transparent;
  border: none;
  color: $primary-000;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(48, 79, 254, 0.1);
  }
}
.page-item.active .page-link {
  background-color: $primary-700;
  color: $primary-100;
}

.page-item.disabled .page-link {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
