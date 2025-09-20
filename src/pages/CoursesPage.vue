<template>
  <div class="container mb-lg-12 mb-8">
    <div class="mt-lg-10 mt-8 mb-lg-7 mb-3">
      <h1 class="fs-2 primary-000">
        {{
          route.query.keyword
            ? `搜尋結果：${route.query.keyword}`
            : backendMessage || '課程分類'
        }}
        <span></span>
      </h1>
      <p v-if="hintText" class="text-secondary fs-8">
        {{ hintText }}
      </p>
    </div>

    <div class="d-xxl-flex flex-row justify-content-between">
      <!-- 運動類別按鍵 -->
      <div ref="scrollWrapper" class="scrollable-btn-wrapper">
        <div class="types-btn-wrapper gap-1" @scroll="onScroll">
          <div
            class="btn-group types-btn-group gap-1 mb-xxl-3 my-5 d-flex"
            role="group"
            aria-label="Basic outlined button group"
          >
            <button
              href="#"
              class="btn btn-outline-primary flex-shrink-0 text-nowrap flex-grow-0"
              :class="{ active: currentType === '' }"
              @click="handleCategoryClick('')"
            >
              所有課程
            </button>
            <button
              v-for="skill in primarySkills"
              :key="skill.skill_id"
              class="btn btn-outline-primary flex-shrink-0 text-nowrap"
              :class="{ active: currentType === skill.skill_id }"
              @click="() => handleCategoryClick(skill.skill_id)"
            >
              {{ skill.course_type }}
            </button>
            <div v-if="extraSkills.length" class="btn-group">
              <button
                class="btn btn-outline-primary dropdown-toggle rounded-start"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                type="button"
                data-bs-popper-config='{"strategy":"fixed"}'
              >
                其他分類
              </button>

              <ul class="dropdown-menu">
                <li
                  v-for="skill in extraSkills"
                  :key="skill.skill_id"
                  @click="handleCategoryClick(skill.skill_id)"
                >
                  <a
                    class="dropdown-item text-primary-600 rounded-2"
                    :class="{
                      active: currentType === skill.skill_id,
                      'text-grey-000': currentType === skill.skill_id
                    }"
                    href="#"
                  >
                    {{ skill.course_type }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <!-- 排序按鍵 -->
      <div class="d-flex gap-1 align-items-center sort-btn-group m-lg-5 mb-5">
        <span>排序：</span>
        <button
          type="button"
          class="btn btn-primary"
          :class="{ active: currentSort === 'popular' }"
          @click="() => handleSortClick('popular')"
        >
          最熱門
        </button>
        <button
          type="button"
          class="btn btn-primary"
          :class="{ active: currentSort === 'score' }"
          @click="() => handleSortClick('score')"
        >
          評價最高
        </button>
      </div>
    </div>
    <div class="card-section d-flex flex-wrap gap-lg-8 gap-5">
      <!-- 單一卡片範本-start -->
      <div
        v-for="course in paginatedCourses"
        :key="course.course_id"
        class="card position-relative"
      >
        <span
          class="badge bg-primary-100 fs-9 text-grey-700 position-absolute"
          >{{ course.course_type }}</span
        >
        <img
          :src="`${course.course_image_url}`"
          class="card-img-top"
          alt="card-img-top"
        />
        <div class="card-body">
          <h5 class="card-title fs-7-bold">{{ course.course_name }}</h5>
          <div class="d-flex">
            <p class="fs-7">{{ course.coach_name }}</p>
            <span class="fs-7 px-2">I</span>
            <p class="fs-7">{{ course.coach_title }}</p>
          </div>
          <div class="d-flex justify-content-between">
            <p class="d-flex align-items-center">
              <span class="material-symbols-outlined star"> star </span
              ><span>{{ course.course_score }}</span>
            </p>
            <p class="d-flex align-items-center">
              <span class="material-symbols-outlined"> person </span
              ><span>{{ course.numbers_of_view }}</span
              >瀏覽次數
            </p>
            <p class="d-flex align-items-center">
              <span class="material-symbols-outlined"> schedule </span
              ><span>{{ course.total_hours }}</span
              >小時
            </p>
          </div>
          <p class="card-text">
            {{ course.course_description }}
          </p>
          <div class="card-link">
            <router-link
              :to="{
                name: 'CourseDetails',
                params: { courseId: course.course_id }
              }"
              class="stretched-link"
              >查看更多</router-link
            >
          </div>
        </div>
      </div>
      <!-- 單一卡片範本-end -->
    </div>
    <nav aria-label="Page navigation">
      <ul class="pagination d-flex justify-content-center mb-0">
        <li class="page-item mx-lg-7" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" @click="handlePageClick(currentPage - 1)"
            ><i class="bi bi-chevron-left d-inline d-lg-none"></i>
            <!-- lg 以上顯示文字 -->
            <span class="d-none d-lg-inline">上一頁</span></a
          >
        </li>

        <li
          v-for="page in totalPages"
          :key="page"
          class="page-item mx-lg-5"
          :class="{ active: currentPage === page }"
        >
          <a class="page-link" @click="handlePageClick(page)">{{ page }}</a>
        </li>

        <li
          class="page-item mx-lg-7"
          :class="{ disabled: currentPage === totalPages }"
        >
          <a class="page-link" @click="handlePageClick(currentPage + 1)"
            ><i class="bi bi-chevron-right d-inline d-lg-none"></i>
            <span class="d-none d-lg-inline">下一頁</span></a
          >
        </li>
      </ul>
    </nav>
  </div>
  <WaveBannerReverse />
</template>

<script setup>
import WaveBannerReverse from '@/components/WaveBannerReverse.vue'

// import axios from 'axios'
import { api } from '@/api'
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 技能列表
const skills = ref([])
const filters = ref({})
const pagination = ref({})

const primarySkills = computed(() => skills.value.slice(0, 5))
const extraSkills = computed(() => skills.value.slice(5))

const currentPage = ref(Number(route.query.page) || 1)
const currentType = ref(route.query.skillId || '')
const currentSort = ref(route.query.sortBy || 'popular')

// 滾動相關
const hasScrolled = ref(false)
const isOverflowing = ref(false)
const scrollWrapper = ref(null)

// 搜尋結果分頁
const allCourses = ref([])
const pageSize = 9
const paginatedCourses = ref([])
const backendMessage = ref('')

const debugInfo = ref({
  fetchCount: 0,
  lastFetchParams: null,
  routerPushCount: 0,
  lastRouterPush: null
})

const totalPages = computed(() =>
  route.query.keyword
    ? Math.ceil(allCourses.value.length / pageSize)
    : pagination.value.total_pages || 1
)

function handlePageClick(page) {
  // 防止超出範圍
  if (page < 1 || page > totalPages.value) return

  currentPage.value = page

  // 處理搜尋模式下的分頁
  if (route.query.keyword) {
    paginateCourses()
    return
  }

  // 處理一般模式下的分頁
  const query = {
    page: currentPage.value,
    skillId: currentType.value,
    sortBy: currentSort.value
  }

  debugInfo.value.routerPushCount++
  debugInfo.value.lastRouterPush = {
    type: 'page',
    query: { ...query },
    timestamp: new Date().toISOString()
  }

  router.push({
    path: '/courses',
    query
  })
}

function paginateCourses() {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  paginatedCourses.value = allCourses.value.slice(start, end)
}

async function fetchCourses() {
  const keyword = route.query.keyword || ''

  debugInfo.value.fetchCount++
  const params = {
    keyword,
    page: currentPage.value,
    skillId: currentType.value,
    sortBy: currentSort.value
  }
  debugInfo.value.lastFetchParams = {
    ...params,
    timestamp: new Date().toISOString()
  }

  if (keyword) {
    const { data } = await api.get(`/api/v1/courses/search-courses`, {
      params: { keyword }
    })
    allCourses.value = data.data || []
    backendMessage.value = data.message || ''
    paginateCourses()
  } else {
    const { data } = await api.get(`/api/v1/courses`, {
      params: {
        page: currentPage.value,
        skillId: currentType.value,
        sortBy: currentSort.value
      }
    })
    paginatedCourses.value = data.data
    filters.value = data.meta.filter
    pagination.value = data.meta.pagination
    backendMessage.value = ''
  }
}

const hintText = computed(() => {
  if (!backendMessage.value) return ''
  return backendMessage.value.replace(/^查無關鍵字[，,::\s]*/i, '')
})

async function fetchSkill() {
  const { data } = await api.get(`/api/v1/courses/course-type`)
  skills.value = data.data
}

function handleCategoryClick(skillId) {
  currentType.value = skillId
  currentPage.value = 1

  const query = {
    page: currentPage.value,
    skillId: currentType.value,
    sortBy: currentSort.value
  }

  debugInfo.value.routerPushCount++
  debugInfo.value.lastRouterPush = {
    type: 'category',
    query: { ...query },
    timestamp: new Date().toISOString()
  }

  router.push({
    path: '/courses',
    query
  })
}

function handleSortClick(sortKey) {
  currentSort.value = sortKey
  currentPage.value = 1

  const query = {
    page: currentPage.value,
    skillId: currentType.value,
    sortBy: currentSort.value
  }

  debugInfo.value.routerPushCount++
  debugInfo.value.lastRouterPush = {
    type: 'sort',
    query: { ...query },
    timestamp: new Date().toISOString()
  }

  router.push({
    path: '/courses',
    query
  })
}

// 方法
const onScroll = () => {
  hasScrolled.value = true
}

let isDown = false
let startX = 0
let scrollLeft = 0

const checkOverflow = () => {
  const el = scrollWrapper.value
  if (!el) return
  const mobile = window.innerWidth <= 530
  isOverflowing.value = mobile && el.scrollWidth > el.clientWidth
}

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

onMounted(async () => {
  checkOverflow()
  window.addEventListener('resize', checkOverflow)

  await fetchCourses()
  await fetchSkill()

  // 設置拖拽事件
  if (scrollWrapper.value) {
    const el = scrollWrapper.value
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mouseleave', onMouseUp)
  }
})

watch(
  () => route.query.keyword,
  (newKeyword, oldKeyword) => {
    fetchCourses()
  }
)

watch(
  () => route.query,
  (newQuery, oldQuery) => {
    // 只有在非搜尋模式下才同步狀態並抓取資料
    if (!newQuery.keyword) {
      const page = Number(newQuery.page) || 1
      const skillId = newQuery.skillId || ''
      const sortBy = newQuery.sortBy || 'popular'

      // 同步狀態
      currentPage.value = page
      currentType.value = skillId
      currentSort.value = sortBy

      // 抓取資料
      fetchCourses()
    }
  },
  { immediate: false }
)

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
.container {
  // padding: 0;
  // max-width: 1296px;
  @media (max-width: 992px) {
    padding: 0 24px;
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

.sort-btn-group {
  > .btn {
    padding: 8px 16px;
    background-color: $body-bg;
    border: 0;
    border-color: $body-bg;
    color: $grey-000;
    &:hover {
      background-color: $primary-300;
      color: $primary-700;
    }
    &.active {
      background-color: $primary-700;
      color: $primary-000;
    }
  }
}

.dropdown-toggle {
  border: 0;
  padding: 8px 20px 8px 16px;
  box-shadow: inset 0 0 0 1px $grey-400;
  &::after {
    margin-left: 19px;
    border-top: 5px solid;
    border-right: 5px solid transparent;
    border-bottom: 0;
    border-left: 5px solid transparent;
  }
}
.dropdown-menu {
  border: 0.5px solid $grey-000;
  background-color: $grey-000;
  text-align: center;
  color: $primary-600;
  min-width: auto;
  width: 131px;
  & li {
    &:not(:last-child) {
      padding-bottom: 8px;
    }
  }
}
.-menu {
  padding: 8px;
  border: 0.5px solid $grey-000;
  // transform: translate(0px, 480px);
  & li {
    &:not(:last-child) {
      padding-bottom: 8px;
    }
    > .dropdown-item {
      text-align: center;
      padding: 12px 8px;
    }
  }
}

.card-section {
  margin: 16px 0px 80px 0px;
  @media (max-width: 992px) {
    margin: 12px 0px 40px 0px;
  }
}

.card {
  width: 405.3px;
  max-width: 100%;
  min-width: 327px;
  height: 550px;
  border: 0px;
  border-radius: 16px;
  box-shadow:
    0px 0px 5px #5e8edd,
    inset 0px 0px 0px 1px $primary-000;
  padding: 24px;
  background: rgba(252, 252, 252, 0.1);
  @media (max-width: 576px) {
    min-width: 100%;
  }
}

.badge {
  box-shadow: inset 0px 0px 0px 1px $primary-400;
  border-radius: 100px;
  line-height: 150%;
  padding: 4px 8px;
  top: 36px;
  left: 36px;
}

.card-img-top {
  height: 240px;
  object-fit: cover;
}

.card-body {
  padding: 24px 0px 0px 0px;
  div {
    margin-bottom: 12px;
  }
  p,
  span {
    margin-bottom: 0;
  }
}

// 後面考慮直接改共用scss檔
.fs-7-bold {
  line-height: 1.5;
  font-weight: 700;
}
.fs-7 {
  line-height: 1.5;
}

.material-symbols-outlined {
  color: $secondary-600;
  padding-right: 8px;
  &.star {
    font-variation-settings: 'FILL' 1;
  }
}

.card-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.card-link {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 0px;
  & a {
    color: $grey-000;
  }
}

.pagination > .page-item > .page-link {
  border: 0;
  color: $body-color;
  background-color: $body-bg;
  padding: 8px 16px;
  &:hover {
    color: $primary-700;
    background-color: $primary-300;
  }
}

.page-item.active .page-link {
  color: $primary-100;
  background-color: $primary-700;
}

.page-item.disabled .page-link {
  opacity: 0.4;
}

.page-item {
  @media (max-width: 992px) {
    margin: 0 5px;
  }
}
.types-btn-wrapper {
  overflow-x: auto; // 保留橫向捲動
  display: inline-block;
  white-space: nowrap;
}
/* Chrome/Safari/Webkit */
.types-btn-wrapper::-webkit-scrollbar {
  display: none;
}
.pagination .page-link {
  cursor: pointer;
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
</style>
