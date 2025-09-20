<template>
  <div v-if="courseDetail">
    <div class="container">
      <div class="d-flex">
        <!-- 左側選單 -->
        <div class="side-nav d-lg-block d-none">
          <div class="px-3 py-5">
            <h3 class="fs-6 px-3 fw-bold text-center">
              {{ courseName }}
            </h3>
            <div class="my-4 px-3 border-bottom border-primary-000">
              <div class="progress" style="height: 12px">
                <div
                  class="progress-bar bg-primary-600"
                  role="progressbar"
                  :style="{ width: progressPercent + '%' }"
                  :aria-valuenow="progressPercent"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <p class="fs-8 text-end text-grey-500 mt-1">
                {{ finishedCount }} / {{ totalCount }} 章節 ({{
                  progressPercent
                }}%)
              </p>
            </div>

            <ul class="list-group list-group-flush">
              <template v-for="group in groupedLessons" :key="group.title">
                <li
                  class="list-group-title fw-bold text-center fs-7"
                  @click="toggleGroup(group.title)"
                >
                  <span class="flex-grow-1">{{ group.title }}</span>
                  <i
                    class="bi ms-3"
                    :class="
                      isOpen(group.title) ? 'bi-chevron-up' : 'bi-chevron-down'
                    "
                  ></i>
                </li>
                <template v-if="isOpen(group.title)">
                  <li
                    v-for="(lesson, idx) in group.items"
                    :key="idx"
                    :class="{
                      finished: lesson.isFinished,
                      watching: lesson.isCurrentWatching
                    }"
                    class="list-group-item d-flex justify-content-between align-items-center rounded-1"
                    @click="selectLesson(lesson)"
                  >
                    <div class="d-flex flex-column text-center w-100">
                      <p class="fs-9 mb-1" style="height: 42px">
                        {{ lesson.name }}
                      </p>
                      <div
                        class="d-flex align-items-center justify-content-center"
                      >
                        <i
                          v-if="lesson.isFinished"
                          class="bi bi-check-circle-fill text-success fs-5"
                        ></i>
                        <i v-else class="bi bi-circle text-secondary fs-5"></i>
                        <p class="text-secondary mb-0 fs-9 ms-1">
                          {{ lesson.length }}
                        </p>
                      </div>
                    </div>
                    <!-- 右側圖示：已完成顯示打勾，否則顯示空圈 -->
                  </li>
                </template>
              </template>
            </ul>
          </div>
        </div>

        <!-- 右側主區塊：你的專屬教練群 -->
        <div class="p-lg-8 p-2 py-6 w-100" style="max-width: 1056px">
          <h3 ref="playerTop" class="mb-lg-8 mb-5">{{ currentLesson.name }}</h3>
          <!-- 992px以下出現章節按鈕 -->

          <button
            class="btn btn-primary-600 d-lg-none mb-3"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#lessonDrawer"
            aria-controls="lessonDrawer"
          >
            <i class="bi bi-list me-1"></i> 章節
          </button>
          <!-- 播放影片 -->
          <div class="mb-lg-12 mb-6">
            <div class="media-block position-relative d-block">
              <HlsPlayer
                v-if="videoSrc"
                :key="currentLesson.chapterId"
                :src="videoSrc"
                :poster="courseDetail.course.image_url"
                :plan="memberPlan"
              />
              <img
                v-else
                :src="courseDetail.course.image_url"
                class="rounded-2 video-cover w-100"
              />
            </div>
          </div>
          <!-- 課程標題與統計 -->
          <div class="my-lg-12">
            <div class="d-lg-flex justify-content-between align-items-center">
              <h2 class="fw-bold mb-lg-0 mb-5 fs-lg-2 fs-4">
                {{ courseDetail.course.name || '課程名稱載入中' }}
              </h2>
              <div
                class="d-flex align-items-center gap-5 gap-lg-8 mb-lg-0 mb-6"
              >
                <div class="icon-custom">
                  <i class="bi bi-star-fill text-secondary-600 me-1 fs-6"></i>
                  <p>{{ courseDetail.course.score }}</p>
                </div>
                <div class="icon-custom">
                  <i class="bi bi-person me-1 text-secondary-600 fs-6"></i>
                  <p>{{ courseDetail.course.numbers_of_view }} 瀏覽次數</p>
                </div>
                <div class="icon-custom">
                  <i class="bi bi-clock me-1 text-secondary-600 fs-6"></i>
                  <p>{{ courseDetail.course.hours }} 小時</p>
                </div>
              </div>
            </div>
          </div>
          <!-- 課程圖片與介紹 -->
          <div class="gy-4 d-lg-flex mb-lg-12 mb-6">
            <div
              class="p-lg-8 p-5 rounded-4 border border-primary-000 h-100 w-100"
              style="background-color: rgba(255, 255, 255, 0.05)"
            >
              <h5 class="mb-lg-8 fw-bold">課程介紹</h5>
              <div>
                <p class="mb-5">
                  {{ courseDetail.course.description }}
                </p>
              </div>
            </div>
          </div>
          <!-- 教練介紹 -->
          <div
            class="border border-primary-000 rounded-4 p-lg-8 p-5 mb-lg-12 mb-6"
            style="background-color: rgba(255, 255, 255, 0.05)"
          >
            <div
              class="d-flex justify-content-between align-items-center mb-lg-8 mb-5"
            >
              <p class="fs-lg-5 fs-6 mb-0">教練介紹</p>
              <a
                :href="courseDetail.coach.coachPage_Url"
                target="_blank"
                class="btn px-3 py-1 btn-outline-grey-400 mb-0 text-grey-000 fs-8"
              >
                教練詳細資訊
              </a>
            </div>
            <div class="d-lg-flex">
              <img
                :src="courseDetail.coach.profile_image_url"
                :alt="courseDetail.coach.name"
                class="rounded-3 me-lg-8 object-fit-cover mb-lg-0 mb-8 coach-image"
              />
              <div>
                <div
                  class="d-lg-flex align-items-center gap-3 text-white flex-wrap mb-5"
                >
                  <span class="fw-bold fs-lg-7">{{
                    courseDetail.coach.name
                  }}</span>
                  <div class="py-lg-0 py-1">
                    <!-- 小螢幕顯示：水平線 -->
                    <div
                      class="d-block d-lg-none"
                      style="
                        width: 18px;
                        height: 2px;
                        background-color: rgba(255, 255, 255, 0.5);
                      "
                    ></div>

                    <!-- 桌機顯示：垂直線 -->
                    <div
                      class="d-none d-lg-block"
                      style="
                        width: 2px;
                        height: 18px;
                        background-color: rgba(255, 255, 255, 0.5);
                      "
                    ></div>
                  </div>

                  <span class="fw-bold fs-lg-7">
                    {{ courseDetail.coach.title }}
                  </span>
                </div>
                <div>
                  <p>
                    {{ courseDetail.coach.intro }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <!-- 章節介紹 -->
          <div
            class="rounded-4 p-lg-8 p-5 border border-primary-000 mb-lg-12 mb-6"
            style="background-color: rgba(255, 255, 255, 0.05)"
          >
            <div
              class="d-flex justify-content-between align-items-center mb-lg-8 mb-5"
            >
              <p class="fs-lg-5 fs-6 mb-0 fw-bold">章節介紹</p>
              <p
                class="btn px-3 py-1 btn-outline-grey-400 mb-0 text-grey-000 fs-8"
                @click="toggleAll"
              >
                {{ isAllOpen ? '全部收合' : '全部展開' }}
              </p>
            </div>
            <div id="courseDetail" class="accordion w-100">
              <div
                v-for="(item, idx) in courseDetail.chapters"
                :key="idx"
                class="accordion-item border-0 rounded-3 overflow-hidden"
                style="background-color: rgba(255, 255, 255, 0.05)"
              >
                <h2 :id="`heading${idx}`" class="accordion-header">
                  <button
                    class="accordion-button collapsed text-white fs-lg-6 p-5"
                    type="button"
                    @click="toggle(idx)"
                  >
                    {{ item.title }}
                    <i
                      class="bi ms-auto"
                      :class="
                        openIndexes[idx] ? 'bi-chevron-up' : 'bi-chevron-down'
                      "
                    ></i>
                  </button>
                </h2>

                <div
                  :id="`collapse${idx}`"
                  class="accordion-collapse collapse"
                  :class="{
                    show: openIndexes[idx],
                    'rounded-bottom-3': openIndexes[idx]
                  }"
                  :aria-labelledby="`heading${idx}`"
                  data-bs-parent="#courseDetail"
                >
                  <div class="accordion-body fs-lg-6 text-primary-000">
                    <div v-if="openIndexes[idx]" class="hr-line mb-4"></div>
                    <ul class="mb-0 list-unstyled">
                      <li v-for="(sub, i) in item.subtitles" :key="i">
                        {{ sub }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 課程評價 -->
          <div
            class="rounded-4 p-lg-8 p-5 border border-primary-000 mb-lg-12 mb-6"
            style="background-color: rgba(255, 255, 255, 0.05)"
          >
            <div
              class="d-flex justify-content-between align-items-center mb-lg-8 mb-5"
            >
              <div class="d-flex justify-content-between align-items-center">
                <p class="fs-lg-5 fs-6 mb-0 fw-bold">課程評價</p>
                <p class="mb-0 fs-lg-7 fs-9 ms-2">
                  ({{ userRatings.paginatedData?.length || 0 }} 則評價)
                </p>
              </div>
              <button
                class="btn px-3 py-1 btn-outline-grey-400 mb-0 text-grey-000 fs-8"
                data-bs-toggle="modal"
                data-bs-target="#ratingsModal"
              >
                所有評價
              </button>
            </div>
            <!-- modal -->
            <div
              id="ratingsModal"
              class="modal fade"
              tabindex="-1"
              aria-labelledby="ratingsModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog modal-lg custom-modal-width">
                <div class="modal-content">
                  <div
                    class="modal-header bg-grey-000 text-grey-900 p-5 pb-3 border-0"
                  >
                    <h5
                      id="ratingsModalLabel"
                      class="modal-title fw-bold text-primary-900 fs-lg-5 fs-6"
                    >
                      課程評價
                    </h5>
                    <p class="mb-0 fs-lg-7 fs-9 ms-2 text-primary-900">
                      ({{ userRatings.paginatedData.length || 0 }}
                      則評價)
                    </p>
                    <button
                      type="button"
                      class="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div class="px-5 bg-grey-000">
                    <hr
                      class="my-0"
                      style="
                        height: 2px;
                        background-color: #d2d2d2;
                        border: none;
                      "
                    />
                  </div>

                  <div
                    class="modal-body bg-grey-000 text-grey-700 p-5 rounded-bottom-3"
                  >
                    <div
                      v-for="rating in paginatedRatings"
                      :key="rating.id"
                      class="mb-4 p-3 bg-primary-000 rounded-3"
                    >
                      <div
                        class="d-lg-flex border-bottom justify-content-between align-items-center pb-2"
                      >
                        <div
                          class="d-flex justify-content-between align-items-center"
                        >
                          <div class="fw-bold">{{ rating.username }}</div>

                          <div class="text-stars ms-5">
                            <i
                              v-for="n in Math.floor(rating.score)"
                              :key="'full-' + n"
                              class="bi bi-star-fill me-1"
                            ></i>
                            <i
                              v-if="
                                rating.score % 1 >= 0.25 &&
                                rating.score % 1 < 0.75
                              "
                              class="bi bi-star-half me-1 text-warning"
                            ></i>
                            <i
                              v-for="n in 5 -
                              Math.floor(rating.score) -
                              (rating.score % 1 >= 0.25 &&
                              rating.score % 1 < 0.75
                                ? 1
                                : 0)"
                              :key="'empty-' + n"
                              class="bi bi-star text-secondary me-1"
                            ></i>
                          </div>
                        </div>

                        <div class="text-grey-600 fs-lg-8 small">
                          {{ rating.createdAt }}
                        </div>
                      </div>

                      <p class="mt-2 mb-0 text-grey-700">
                        {{ rating.comment }}
                      </p>
                    </div>
                    <!-- Pagination 控制列 -->
                    <nav
                      class="d-flex justify-content-center"
                      style="padding-top: 4px"
                    >
                      <ul class="pagination mb-0">
                        <li
                          class="page-item bg-grey-000"
                          :class="{ disabled: currentPage === 1 }"
                          @click="changePage(currentPage - 1)"
                        >
                          <a class="page-link me-lg-12"
                            ><i
                              class="bi bi-chevron-left d-inline d-lg-none"
                            ></i>
                            <span class="d-none d-lg-inline">上一頁</span></a
                          >
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
                          <a class="page-link ms-lg-12"
                            ><i
                              class="bi bi-chevron-right d-inline d-lg-none"
                            ></i>
                            <span class="d-none d-lg-inline">下一頁</span></a
                          >
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>

            <div id="ratings" class="accordion w-100">
              <div class="d-lg-flex gap-5 align-items-stretch">
                <div
                  v-for="(rating, index) in latestThreeRatings"
                  :key="rating.id"
                  :class="[
                    'card rating-card',
                    'h-100',
                    index === latestThreeRatings.length - 1 ? 'mb-0' : 'mb-5'
                  ]"
                  style="background-color: rgba(255, 255, 255, 0.05)"
                >
                  <div class="card-body p-lg-5">
                    <div
                      class="d-lg-block d-flex justify-content-between align-items-center mb-1"
                    >
                      <h6 class="card-title fw-bold fs-lg-6 fs-8 mb-0 mb-lg-1">
                        {{ rating.username }}
                      </h6>
                      <h6
                        class="card-subtitle mb-lg-1 text-body-secondary mb-0 mb-lg-1"
                      >
                        <!-- 滿星 -->
                        <i
                          v-for="n in Math.floor(rating.score)"
                          :key="'full-' + n"
                          class="bi bi-star-fill text-warning me-1"
                        ></i>

                        <!-- 半星 -->
                        <i
                          v-if="
                            rating.score % 1 >= 0.25 && rating.score % 1 < 0.75
                          "
                          class="bi bi-star-half text-warning me-1"
                        ></i>

                        <!-- 空星 -->
                        <i
                          v-for="n in 5 -
                          Math.floor(rating.score) -
                          (rating.score % 1 >= 0.25 && rating.score % 1 < 0.75
                            ? 1
                            : 0)"
                          :key="'empty-' + n"
                          class="bi bi-star text-secondary me-1"
                        ></i>
                      </h6>
                    </div>
                    <div>
                      <p class="text-grey-400 fs-lg-8 fs-9 mb-5">
                        {{ rating.createdAt }}
                      </p>
                    </div>

                    <hr class="my-lg-5" />
                    <p class="card-text fs-lg-6">
                      {{ rating.comment }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          id="lessonDrawer"
          class="offcanvas offcanvas-start d-lg-none px-3 py-5"
          tabindex="-1"
          aria-labelledby="lessonDrawerLabel"
        >
          <div class="offcanvas-header">
            <h5 id="lessonDrawerLabel" class="mb-0 fs-6">
              {{ courseName }}
            </h5>
            <button
              type="button"
              class="btn-close bg-white lesson-close btn-close-white ms-3"
              data-bs-dismiss="offcanvas"
            ></button>
          </div>
          <div class="px-3">
            <div class="progress" style="height: 12px">
              <div
                class="progress-bar bg-primary-600"
                role="progressbar"
                :style="{ width: progressPercent + '%' }"
                :aria-valuenow="progressPercent"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <p class="fs-8 text-end text-grey-500 mt-1">
              {{ finishedCount }} / {{ totalCount }} 章節 ({{
                progressPercent
              }}%)
            </p>
          </div>

          <div class="offcanvas-body p-0">
            <!-- 章節清單：直接複用你現成的 li -->
            <ul class="list-group list-group-flush">
              <!-- 每個 li 代表一天的 Lesson -->
              <template v-for="group in groupedLessons" :key="group.title">
                <li
                  class="list-group-title fw-bold text-center fs-7 d-flex align-items-center"
                  @click="toggleGroup(group.title)"
                >
                  <span class="flex-grow-1">{{ group.title }}</span>
                  <i
                    class="bi ms-3"
                    :class="
                      isOpen(group.title) ? 'bi-chevron-up' : 'bi-chevron-down'
                    "
                  ></i>
                </li>
                <template v-if="isOpen(group.title)">
                  <li
                    v-for="(lesson, idx) in group.items"
                    :key="idx"
                    :class="{
                      finished: lesson.isFinished,
                      watching: lesson.isCurrentWatching
                    }"
                    class="list-group-item d-flex justify-content-between align-items-center rounded-1"
                    @click="selectLesson(lesson)"
                  >
                    <div class="d-flex flex-column text-center w-100">
                      <p class="fs-9 mb-1" style="height: 42px">
                        {{ lesson.name }}
                      </p>
                      <div
                        class="d-flex align-items-center justify-content-center"
                      >
                        <i
                          v-if="lesson.isFinished"
                          class="bi bi-check-circle-fill text-success fs-5"
                        ></i>
                        <i v-else class="bi bi-circle text-secondary fs-5"></i>
                        <p class="text-secondary mb-0 fs-9 ms-1">
                          {{
                            lesson.length !== '未提供'
                              ? lesson.length
                              : '未提供'
                          }}
                        </p>
                      </div>
                    </div>
                    <!-- 右側圖示：已完成顯示打勾，否則顯示空圈 -->
                  </li>
                </template>
              </template>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
// import axios from 'axios'
import { api } from '@/api'
import HlsPlayer from '@/components/HlsPlayer.vue'

function pickNextLesson(list) {
  const next = list.find(l => !l.isFinished)
  return next || list[0]
}

function pickCurrentPlan(subs) {
  // 1. 由新到舊排
  const sorted = [...subs].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // 2. 找到第一筆尚未到期的訂閱
  const today = Date.now()
  const current = sorted.find(sub => new Date(sub.end_at).getTime() >= today)

  // 3. 判斷方案
  if (!current) return 'wellness'
  const name = current.plan.toLowerCase()
  if (name.includes('eagerness')) return 'eagerness'
  if (name.includes('fitness')) return 'fitness'
  return 'wellness'
}

/* ② ── 給 HlsPlayer 用的 plan 變數 ───────────────────────────── */
const memberPlan = ref('wellness')

const route = useRoute()

// 1. 先準備要放 sidebar 資料的 ref
const courseName = ref('') // ← 這裡用來存 sidebar 回傳的 courseName
const lessons = ref([]) // ← 這裡用來存 sidebar 回傳的 chapter 陣列
const groupedLessons = computed(() => {
  const arr = []
  let group = null
  lessons.value.forEach(lsn => {
    if (!group || group.title !== lsn.title) {
      group = { title: lsn.title, items: [] }
      arr.push(group)
    }
    group.items.push(lsn)
  })
  return arr
})
const courseId = route.params.courseId
const courseDetail = ref(null)
const currentLesson = ref({})
const selectedChapId = ref('')

const openIndexes = ref([])
const userRatings = ref({
  paginatedData: [],
  meta: {
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      total_pages: 1,
      has_next: false,
      has_previous: false
    }
  }
})

const videoSrc = computed(
  () =>
    currentLesson.value?.video_url ||
    courseDetail.value?.course?.video_url ||
    ''
)

async function fetchSidebar(id, token) {
  const { data } = await api.get(`/api/v1/users/courses/${id}/sidebar`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data.data
}

async function fetchDetails(id, chapterId, token) {
  // 不帶 chapterId；後端會回「預設章節」的影片與 course info
  const { data } = await api.get(`/api/v1/users/courses/${id}/details`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { chapterId }
  })
  return data.data // 真正 payload
}

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const sb = await fetchSidebar(courseId, token)
    courseName.value = sb.courseName
    lessons.value = sb.chapter.map(ch => ({ ...ch, isCurrentWatching: false }))

    /* ② 預設選未看第一順位 & 取細節 ------------------------------- */
    const first = pickNextLesson(lessons.value)
    if (!first) return
    first.isCurrentWatching = true
    currentLesson.value = first
    selectedChapId.value = first.chapterId

    openOnly(first.title)

    collapsed.value[first.title] = true

    const detail = await fetchDetails(courseId, first.chapterId, token)
    courseDetail.value = detail
    // 把影片塞回 lesson，避免下次再 call
    first.video_url = detail.course.video_url

    openIndexes.value = detail.chapters.map(() => false)

    currentLesson.value =
      lessons.value.find(l => l.isCurrentWatching) || lessons.value[0]

    openIndexes.value = detail.chapters.map(() => false)

    /* ③ ratings（如需） -------------------------------------- */
    await fetchRatings(courseId)
  } catch (e) {
    console.error('載入資料失敗', e)
  }
})

const playerTop = ref(null)

async function selectLesson(lesson) {
  lessons.value.forEach(l => {
    l.isCurrentWatching = l.chapterId === lesson.chapterId
  })

  currentLesson.value = lesson
  selectedChapId.value = lesson.chapterId

  // ★ 目前只切 local 狀態，不再呼叫 details
  currentLesson.value = lesson
  if (!lesson.video_url) {
    try {
      const token = localStorage.getItem('token')
      const detail = await fetchDetails(courseId, lesson.chapterId, token)

      courseDetail.value = detail
      lesson.video_url = detail.course.video_url // 快取影片
      openIndexes.value = detail.chapters.map(() => false) // 同步章節介紹
    } catch (e) {
      console.error('載入章節影片失敗', e)
    }
  }
  await nextTick()
  playerTop.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

function toggle(idx) {
  openIndexes.value[idx] = !openIndexes.value[idx]
}

const isAllOpen = ref(false)
function toggleAll() {
  isAllOpen.value = !isAllOpen.value
  openIndexes.value = courseDetail.value.chapters.map(() => isAllOpen.value)
}

const latestThreeRatings = computed(() =>
  userRatings.value.paginatedData
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
)

const currentPage = ref(1)
const pageSize = 5

const totalPages = computed(() =>
  Math.ceil(userRatings.value.meta.pagination.total / pageSize)
)

const paginatedRatings = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return userRatings.value.paginatedData.slice(start, end)
})

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

async function fetchRatings(courseId) {
  try {
    const res = await api.get(`/api/v1/courses/${courseId}/ratings`)
    userRatings.value = res.data.data
  } catch (error) {
    console.error('評價載入失敗', error)
  }
}

const collapsed = ref({})
function isOpen(title) {
  return collapsed.value[title] !== false // undefined → 當作展開
}
function openOnly(title) {
  groupedLessons.value.forEach(g => {
    collapsed.value[g.title] = g.title === title
  })
}
function toggleGroup(title) {
  if (isOpen(title)) {
    collapsed.value[title] = false
  } else {
    openOnly(title)
  }
}

function initVideoProgressListener() {
  const video = document.querySelector('.media-block video')
  if (!video) return

  video.removeEventListener('timeupdate', handleTimeupdate)
  video.removeEventListener('ended', handleEnded)

  video.addEventListener('timeupdate', handleTimeupdate)
  video.addEventListener('ended', handleEnded)
}

function handleTimeupdate(e) {
  const v = e.target
  if (!v.duration) return
  const ratio = v.currentTime / v.duration
  if (ratio >= 0.9) finishCurrentLesson(v) // 90 %
}
function handleEnded(e) {
  finishCurrentLesson(e.target)
} // 影片播完

async function finishCurrentLesson(videoEl) {
  const lesson = currentLesson.value
  if (!lesson || lesson.isFinished) return

  try {
    const token = localStorage.getItem('token')
    await api.post(
      '/api/v1/users/view-progress',
      {
        sub_chapter_id: lesson.chapterId,
        watched_seconds: Math.floor(videoEl.duration),
        is_completed: true
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    lesson.isFinished = true
  } catch (err) {
    console.warn('送觀看進度失敗，稍後重送', err)
    /* ➜ 進階：也可以把失敗的 payload 暫存，下次打開時再補送 */
  }
}

/* ③ ── 元件掛載時抓訂閱 + 解析 ───────────────────────────────── */
onMounted(async () => {
  try {
    const token = localStorage.getItem('token') || ''
    const { data } = await api.get('/api/v1/users/subscriptions', {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (data.status) {
      memberPlan.value = pickCurrentPlan(data.data)
    }
  } catch (err) {
    console.error('取得訂閱失敗：', err)
  }
})
/*  完成度統計  */
const finishedCount = computed(
  () => lessons.value.filter(l => l.isFinished).length
)
const totalCount = computed(() => lessons.value.length)
const progressPercent = computed(() =>
  totalCount.value === 0
    ? 0
    : Math.round((finishedCount.value / totalCount.value) * 100)
)

onMounted(() => {
  fetchRatings(courseId)
})
watch(videoSrc, async () => {
  // NEW
  await nextTick() // 等 DOM 重新渲染
  initVideoProgressListener()
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
.container > .d-flex {
  align-items: stretch;
  min-height: 100vh; // 關鍵：讓整個容器最小高度滿版
}

.media-block {
  img {
    width: 100%;
    height: 600px;
    aspect-ratio: 2.16;
    position: relative;
    object-fit: cover;
  }
  .video-cover {
    object-fit: cover;
    filter: brightness(50%);
    border-radius: 12px;
    &:hover {
      filter: brightness(100%);
    }
  }

  .play-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 48px;
    color: $primary-500;
    z-index: 2;
  }
}
.icon-custom {
  display: flex;
  align-items: center;
  p {
    margin-bottom: 0;
    font-size: 24px;
    // 手機版 (小於 576px) 改為 16px
    @media (max-width: 575.98px) {
      font-size: 16px;
    }
  }
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
.list-group-title {
  border: none;
  padding: 8px 16px;
  list-style: none;
  border-bottom: 1px solid $primary-000;
  cursor: pointer;
}
.list-group-item.watching {
  background: $primary-600;
  color: $primary-000;
}

/* List item hover 效果（可以自行調整） */
.list-group-item:hover {
  background-color: $primary-600;
  cursor: pointer;
}

.coach-image {
  width: 164px;
  height: 164px;
  object-fit: cover;
  object-position: center;

  @media (max-width: 992px) {
    width: 100%; // 小螢幕改成滿寬
    height: 164px; // 高度維持
    object-position: top;
  }
}

// 章節介紹
.accordion-body {
  padding: 24px;
  padding-top: 0;
}
.accordion-button {
  padding: 24px 0;
  border: none;
  background-color: transparent;
}
.accordion-button:focus {
  box-shadow: none;
}

.accordion-button::after {
  display: none;
}
.hr-line {
  width: 100%;
  height: 1px;
  background-color: $primary-000;
  margin: 0 auto 1rem;
  margin-bottom: 24px;
}
// 修正最後一個button不要有mb-5
.accordion-item {
  margin-bottom: 24px;
}
#courseDetail .accordion-item:last-child {
  margin-bottom: 0;
}

// modal
.custom-modal-width {
  max-width: 900px;
}
.card:last-child {
  margin-bottom: 0;
}
.page-link {
  cursor: pointer;
  background-color: transparent;
  border: none;
  color: $primary-700;
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
.rating-card {
  width: 100%;
  max-width: 280px;

  @media (max-width: 992px) {
    max-width: 100%;
  }
}
.offcanvas-start {
  top: 72px; // 向下移動，避免遮住 navbar（根據實際 navbar 高度調整）
  height: calc(100% - 56px);
  border-top: 1px solid #ccc;
  box-shadow: 0 4px 12 px rgba(0, 0, 0, 0.1);
  width: 55%;
  text-align: center;
  .list-group-item {
    cursor: pointer;
  }
}
.offcanvas .nav-link {
  text-align: center;
}

/* 列表 hover 效果沿用既有變數 */
.offcanvas .list-group-item:hover {
  background: $primary-600;
  cursor: pointer;
}
</style>
