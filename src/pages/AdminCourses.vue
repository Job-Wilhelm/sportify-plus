<template>
  <div class="container">
    <div class="d-flex">
      <!-- 左側選單 -->
      <div class="side-nav">
        <div class="px-3 py-5">
          <h3 class="fs-6 px-3 fw-bold">管理後臺</h3>
          <hr class="divider my-5" />
          <ul class="list-group list-group-flush">
            <li
              class="list-group-item"
              :class="{ active: route.path === '/admin/courses' }"
            >
              <router-link to="/admin/courses" class="nav-link">
                課程管理
              </router-link>
            </li>

            <li
              class="list-group-item"
              :class="{ active: route.path === '/admin/subscriptions' }"
            >
              <router-link to="/admin/users" class="nav-link">
                會員管理
              </router-link>
            </li>

            <li
              class="list-group-item"
              :class="{ active: route.path === '/admin/coaches' }"
            >
              <router-link to="/admin/coaches" class="nav-link">
                教練管理
              </router-link>
            </li>
            <li
              class="list-group-item"
              :class="{ active: route.path === '/admin/reports' }"
            >
              <router-link to="/admin/reports" class="nav-link">
                報表管理
              </router-link>
            </li>
          </ul>
        </div>
      </div>
      <!-- 外框顏色 -->
      <div class="p-lg-8 px-2 py-8 w-100" style="max-width: 1056px">
        <div class="d-lg-flex gap-6">
          <h2 class="fs-lg-4 mb-lg-8 mb-6">課程管理</h2>
          <div class="d-flex mb-5">
            <!-- ★ 讓這個 .scrollable-group 自行橫向捲動 -->
            <div class="d-flex flex-nowrap gap-lg-6 gap-1">
              <!--  下拉選單：所有課程 -->
              <div class="dropdown">
                <button
                  id="dropdownCategory"
                  class="btn btn-primary-600 dropdown-toggle px-lg-3 px-1 fs-lg-8 fs-9"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {{ selectedCategory }}
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownCategory">
                  <li
                    v-for="cat in categoryOptions"
                    :key="cat"
                    @click="selectedCategory = cat"
                  >
                    <a class="dropdown-item rounded-2" href="#">{{ cat }}</a>
                  </li>
                </ul>
              </div>

              <!--  下拉選單：選擇講師 -->
              <div class="dropdown">
                <button
                  id="dropdownInstructors"
                  class="btn btn-primary-600 dropdown-toggle px-lg-3 px-1 fs-lg-8 fs-9"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {{ selectedInstructor }}
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownInstructors">
                  <li
                    v-for="instr in instructorOptions"
                    :key="instr"
                    @click="selectedInstructor = instr"
                  >
                    <a class="dropdown-item rounded-2" href="#">{{ instr }}</a>
                  </li>
                </ul>
              </div>

              <!--  下拉選單：選擇狀態 -->
              <div class="dropdown">
                <button
                  id="dropdownStatus"
                  class="btn btn-primary-600 dropdown-toggle px-lg-3 px-1 fs-lg-8 fs-9"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {{ selectedStatus }}
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownStatus">
                  <li
                    v-for="st in statusOptions"
                    :key="st"
                    @click="selectedStatus = st"
                  >
                    <a class="dropdown-item rounded-2" href="#">{{ st }}</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="subscription-card">
          <div class="card-wrapper"></div>
          <div class="card-content p-5 mb-5">
            <div class="table-responsive">
              <table class="table table-striped mb-0 align-middle wide-table">
                <thead class="">
                  <tr class="text-start">
                    <th class="th-custom">類別</th>
                    <th class="th-custom">課程代號</th>
                    <th class="th-custom">課程名稱</th>
                    <th class="th-custom">上架時間</th>
                    <th class="th-custom">教練名稱</th>
                    <th class="th-custom">狀態</th>
                    <th class="th-custom">詳細資訊</th>
                    <th class="th-custom">課程評價</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="course in paginatedCourses" :key="course.id">
                    <td class="td-custom">
                      {{ course.category }}
                    </td>
                    <td class="td-custom">***{{ course.id.slice(-5) }}</td>
                    <td class="td-custom title-cell">{{ course.title }}</td>
                    <td class="td-custom">
                      {{ formatDateWithoutLib(course.created_at) }}
                    </td>
                    <td class="td-custom">{{ course.instructor }}</td>

                    <td class="td-custom">
                      <span
                        class=""
                        :class="course.is_active ? '' : 'text-warning'"
                      >
                        {{ course.is_active ? '上架中' : '待審核' }}
                      </span>
                    </td>
                    <td class="td-custom">
                      <button
                        class="btn btn-sm btn-primary"
                        @click="openDetailModal(course.id)"
                      >
                        檢視
                      </button>
                    </td>
                    <td class="td-custom">
                      <!-- 按下這個按鈕就開 modal，並呼叫 openRatingsModal -->
                      <button
                        class="btn btn-sm btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#ratingsModal"
                        @click="() => openRatingsModal(course.id)"
                      >
                        評價
                      </button>
                    </td>
                  </tr>
                  <!-- 如果篩選後沒資料，顯示提示列 -->
                  <tr v-if="filteredCourses.length === 0 && !loading">
                    <td colspan="8" class="text-center text-muted">
                      沒有符合條件的課程
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- modal -->
        <div
          id="ratingsModal"
          class="modal fade"
          tabindex="-1"
          aria-labelledby="ratingsModalLabel"
        >
          <div class="modal-dialog modal-lg custom-modal-width">
            <div class="modal-content">
              <div
                class="modal-header bg-grey-000 text-grey-900 p-lg-5 pb-lg-3 border-0"
              >
                <h5
                  id="ratingsModalLabel"
                  class="modal-title fw-bold text-primary-900 fs-lg-5 fs-6"
                >
                  課程評價
                </h5>
                <p class="mb-0 fs-lg-7 fs-9 ms-2 text-primary-900">
                  ({{ userRatings.paginatedData.length || 0 }} 則評價)
                </p>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="px-lg-5 bg-grey-000">
                <hr
                  class="my-0"
                  style="height: 2px; background-color: #d2d2d2; border: none"
                />
              </div>

              <div
                class="modal-body bg-grey-000 text-grey-700 p-lg-5 rounded-bottom-3"
              >
                <div
                  v-for="rating in paginatedRatings"
                  :key="rating.id"
                  class="mb-4 p-lg-3 bg-primary-000 rounded-3"
                >
                  <div
                    class="d-flex border-bottom justify-content-between align-items-center pb-2"
                  >
                    <div
                      class="d-flex justify-content-between align-items-center"
                    >
                      <div class="fw-bold">{{ rating.username }}</div>

                      <div class="text-stars ms-lg-5">
                        <i
                          v-for="n in Math.floor(rating.score)"
                          :key="'full-' + n"
                          class="bi bi-star-fill me-1"
                        ></i>
                        <i
                          v-if="
                            rating.score % 1 >= 0.25 && rating.score % 1 < 0.75
                          "
                          class="bi bi-star-half me-1 text-warning"
                        ></i>
                        <i
                          v-for="n in 5 -
                          Math.floor(rating.score) -
                          (rating.score % 1 >= 0.25 && rating.score % 1 < 0.75
                            ? 1
                            : 0)"
                          :key="'empty-' + n"
                          class="bi bi-star text-secondary me-1"
                        ></i>
                      </div>
                    </div>

                    <div class="text-grey-600 fs-lg-8 small">
                      {{ rating.createdAt }}
                      <button
                        class="btn btn-link text-danger ms-1 p-1"
                        title="刪除此評價"
                        @click="askDeleteRating(rating.id)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  <p class="mt-2 mb-0 text-grey-700">{{ rating.comment }}</p>
                </div>

                <!-- Pagination 控制列 -->
                <nav
                  class="d-flex justify-content-center"
                  style="padding-top: 4px"
                >
                  <ul class="pagination mb-0">
                    <li
                      class="page-item bg-grey-000"
                      :class="{ disabled: currentRatingPage === 1 }"
                      @click="changeRatingPage(currentRatingPage - 1)"
                    >
                      <a class="page-link me-12"
                        ><i class="bi bi-chevron-left d-inline d-lg-none"></i>
                        <!-- lg 以上顯示文字 -->
                        <span class="d-none d-lg-inline">上一頁</span></a
                      >
                    </li>

                    <li
                      v-for="page in totalRatingPages"
                      :key="page"
                      class="page-item mx-2"
                      :class="{ active: page === currentRatingPage }"
                      @click="changeRatingPage(page)"
                    >
                      <a class="page-link">{{ page }}</a>
                    </li>

                    <li
                      class="page-item"
                      :class="{
                        disabled: currentRatingPage === totalRatingPages
                      }"
                      @click="changeRatingPage(currentRatingPage + 1)"
                    >
                      <a class="page-link ms-12"
                        ><i class="bi bi-chevron-right d-inline d-lg-none"></i>
                        <span class="d-none d-lg-inline">下一頁</span></a
                      >
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <!-- ※ 建議把 Modal HTML 放在這裡（也就是 container 底部、在所有內容之後） -->
        <div
          id="detailModal"
          ref="detailModal"
          class="modal fade"
          tabindex="-1"
          aria-labelledby="detailModalLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-xl">
            <div class="modal-content bg-primary-000 text-grey-700 p-5">
              <!-- --- Modal 標頭 --- -->
              <div class="modal-header border-grey-200">
                <h5 id="detailModalLabel" class="modal-title text-primary-900">
                  課程詳細資訊
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <!-- --- Modal 主體 --- -->
              <div class="modal-body">
                <div class="d-flex flex-column-reverse flex-lg-row">
                  <!-- 左半：文字與課程資訊 (占 8/12) -->
                  <div class="col-lg-8 d-flex flex-column flex-fill">
                    <div class="d-lg-flex">
                      <div
                        class="mb-3 d-flex flex-column gap-3 mobile-custom-60"
                      >
                        <div class="me-lg-4">
                          <strong>課程代號：<br class="d-xl-none" /></strong
                          ><span class="des-custom">{{
                            selectedDetail.id
                          }}</span>
                        </div>
                        <div class="me-lg-4">
                          <strong>教練名稱：</strong
                          ><span class="des-custom">{{
                            selectedDetail.coach.name
                          }}</span>
                        </div>
                        <div class="me-lg-4">
                          <strong>課程名稱：</strong
                          ><span class="des-custom">{{
                            selectedDetail.name
                          }}</span>
                        </div>
                      </div>
                      <div
                        class="mb-lg-3 mb-5 d-flex flex-column gap-3 mobile-custom-40"
                      >
                        <div class="me-lg-4">
                          <strong>課程狀態：</strong
                          ><span class="des-custom">{{
                            selectedDetail.status
                          }}</span>
                        </div>

                        <div class="me-lg-4">
                          <strong>上架時間：</strong
                          ><span class="des-custom">{{
                            selectedDetail.publishedAt
                          }}</span>
                        </div>
                        <div class="me-lg-4">
                          <strong>課程類別：</strong
                          ><span class="des-custom">{{
                            selectedDetail.category
                          }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="mb-lg-3 mb-5">
                      <p class="fw-bold mb-lg-3 mb-2">課程介紹：</p>
                      <div
                        class="border rounded p-3 bg-grey-100 border-primary-700 me-lg-4"
                        style="background-color: #f8f9fa"
                      >
                        {{ selectedDetail.description }}
                      </div>
                    </div>
                    <div class="mb-lg-3 mb-5">
                      <p class="mb-2 fw-bold">課程照片：</p>
                      <img
                        :src="selectedDetail.image_url"
                        alt="課程照片"
                        class="img-fluid rounded course-photo"
                      />
                    </div>
                  </div>

                  <!-- 右半：教練頭像 (占 4/12) -->
                  <div class="col-lg-4 text-center">
                    <img
                      :src="selectedDetail.coach.profile_image_url"
                      alt="教練頭像"
                      class="rounded-circle mb-5"
                      style="width: 240px; height: 240px; object-fit: cover"
                    />
                  </div>
                </div>

                <!-- 下面可以再加「審核建議」之類的表單欄位 -->

                <div class="mb-lg-3 mb-5">
                  <p class="fw-bold mb-2">課程影片：</p>
                  <div
                    id="courseVideoAccordion"
                    class="accordion border-primary-600"
                  >
                    <div
                      v-for="(chap, idx) in selectedDetail.chapters"
                      :key="idx"
                      class="accordion-item bg-grey-000 text-grey-700 border-primary-600"
                    >
                      <h2
                        :id="`headingChap${idx}`"
                        class="accordion-header text-grey-700"
                      >
                        <button
                          class="accordion-button collapsed bg-grey-000 text-grey-700 d-flex justify-content-between align-items-center"
                          type="button"
                          data-bs-toggle="collapse"
                          :data-bs-target="`#collapseChap${idx}`"
                          aria-expanded="false"
                          :aria-controls="`collapseChap${idx}`"
                        >
                          {{ chap.title }}
                          <i
                            class="bi bi-chevron-down custom-toggle-icon text-primary-700"
                          ></i>
                        </button>
                      </h2>
                      <div
                        :id="`collapseChap${idx}`"
                        class="accordion-collapse collapse"
                        :aria-labelledby="`headingChap${idx}`"
                        data-bs-parent="#courseVideoAccordion"
                      >
                        <div
                          class="accordion-body border-top border-primary-600"
                        >
                          <ul class="mb-0 list-unstyled">
                            <li
                              v-for="lesson in chap.lessons"
                              :key="lesson.id"
                              class=""
                            >
                              <button
                                class="accordion-button collapsed bg-grey-000 text-grey-700 d-flex justify-content-between align-items-center sub-custom"
                                type="button"
                                data-bs-toggle="collapse"
                                :data-bs-target="`#video-${lesson.id}`"
                                :aria-controls="`video-${lesson.id}`"
                                @click="playModalLesson(lesson)"
                              >
                                {{ lesson.subtitle }}
                                <i
                                  class="bi bi-chevron-down ms-auto custom-toggle-icon"
                                ></i>
                              </button>
                              <div
                                :id="`video-${lesson.id}`"
                                class="collapse mt-2"
                                @[BS_COLLAPSE_HIDDEN]="
                                  () => onCollapseHide(lesson)
                                "
                              >
                                <div
                                  v-if="currentModalLesson?.id === lesson.id"
                                >
                                  <HlsPlayer
                                    v-if="modalVideoSrc"
                                    :src="modalVideoSrc"
                                    :poster="selectedDetail.image_url"
                                    mode="preview"
                                  />
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mx-auto w-100">
                  <!-- 如果此課程已經是「上架中」而且尚未按下編輯，就只顯示「編輯」＋「確定」兩個按鈕 -->
                  <template
                    v-if="selectedDetail.status === '上架中' && !isEditing"
                  >
                    <div class="modal-footer border-0 justify-content-center">
                      <!-- 按下後切換到編輯模式 -->
                      <button
                        type="button"
                        class="btn btn-primary-600"
                        @click="enableEdit"
                      >
                        編輯
                      </button>
                      <!-- 直接關閉 Modal -->
                      <button
                        type="button"
                        class="btn btn-grey-400 ms-lg-3"
                        @click="closeDetailModal"
                      >
                        確定
                      </button>
                    </div>
                  </template>
                  <!-- 其餘狀況（剛打開、或點了「編輯」後）都顯示「審核建議 + 通過/未通過」 -->
                  <template v-else>
                    <div class="mt-4 mb-lg-3 mb-2">
                      <p class="fw-bold">審核建議：</p>
                      <textarea
                        v-model="selectedDetail.reviewComment"
                        class="form-control bg-grey-000 text-grey-700 border-primary-600"
                        rows="3"
                        placeholder="輸入審核建議..."
                      ></textarea>
                    </div>
                    <!-- --- Modal 底部：按鈕 --- -->
                    <div class="modal-footer border-0 justify-content-center">
                      <button
                        type="button"
                        class="btn btn-danger text-grey-700"
                        @click="rejectReview"
                      >
                        <i class="bi bi-x-circle me-2"></i>
                        未通過
                      </button>
                      <button
                        type="button"
                        class="btn btn-success text-grey-700 ms-lg-5"
                        @click="approveReview"
                      >
                        <i class="bi bi-check-circle me-2"></i>
                        通過
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- ※ Modal HTML 放在這邊就好，與上方的表格元件並列，並不會影響到其他區塊的排版 -->

        <!-- 分頁（若需要） v-if="meta.total_pages > 1" -->
        <div class="mt-11">
          <nav class="d-flex justify-content-center" style="padding-top: 4px">
            <ul class="pagination mb-0">
              <li
                class="page-item"
                :class="{ disabled: currentCoursePage === 1 }"
                @click="changeCoursePage(currentCoursePage - 1)"
              >
                <a class="page-link me-lg-11 me-5"
                  ><!-- 小於 lg 顯示圖示 -->
                  <i class="bi bi-chevron-left d-inline d-lg-none"></i>
                  <!-- lg 以上顯示文字 -->
                  <span class="d-none d-lg-inline">上一頁</span></a
                >
              </li>
              <li
                v-for="page in totalCoursePages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentCoursePage }"
                @click="changeCoursePage(page)"
              >
                <a class="page-link">{{ page }}</a>
              </li>
              <li
                class="page-item"
                :class="{ disabled: currentCoursePage === totalCoursePages }"
                @click="changeCoursePage(currentCoursePage + 1)"
              >
                <a class="page-link ms-lg-11 ms-5"
                  ><i class="bi bi-chevron-right d-inline d-lg-none"></i>
                  <span class="d-none d-lg-inline">下一頁</span></a
                >
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
  <!-- 刪除評價modal -->
  <div
    id="confirmDeleteModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="confirmDeleteModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-sm">
      <div class="modal-content bg-grey-000 text-grey-700">
        <div class="modal-header border-0">
          <h5 id="confirmDeleteModalLabel" class="modal-title">確認刪除</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <p>確定要刪除此則評價嗎？</p>
        </div>
        <div class="modal-footer justify-content-center border-0">
          <button
            type="button"
            class="btn btn-grey-400 text-grey-700"
            data-bs-dismiss="modal"
          >
            取消
          </button>
          <button
            type="button"
            class="btn btn-danger text-grey-700"
            @click="confirmDelete"
          >
            刪除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// import axios from 'axios'
import { api } from '@/api'
import HlsPlayer from '@/components/HlsPlayer.vue'

const detailModal = ref(null)

const router = useRouter()
const route = useRoute()

// 目前是否處於「編輯模式」的旗標
const isEditing = ref(false)

// 取得courseId方便教練跳轉
function openFromRoute() {
  const id = route.params.courseId // ← 不用 as string
  if (id) {
    nextTick(() => openDetailModal(id)) // ← 這裡也拿掉 as
    // router.replace({ name: 'AdminCourses' })  // ← 若要導回乾淨網址可加
  }
}
onMounted(openFromRoute)
watch(() => route.params.courseId, openFromRoute)

//
// === 身分驗證：只有 role === 'ADMIN' 才能繼續進入此頁面 ===
//
async function checkAdmin() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      // 沒有 token，直接跳回首頁或登入頁
      router.replace({ path: '/' })
      return false
    }
    const res = await api.get('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data?.status && res.data.data?.role === 'ADMIN') {
      // 確認是 admin，才允許繼續
      return true
    } else {
      // 如果不是 admin，就導回首頁
      router.replace({ path: '/' })
      return false
    }
  } catch (err) {
    // 驗證失敗或 401，就導回首頁
    console.error('身分驗證失敗：', err)
    router.replace({ path: '/' })
    return false
  }
}

//
// === 課程列表相關狀態 ===
//
const courses = ref([])

// 存放當前正在「檢視」的那筆課程詳細資料
const selectedDetail = ref({
  // 課程基本
  id: '',
  name: '',
  score: 0,
  student_amount: 0,
  hours: 0,
  image_url: '',
  description: '',
  status: '', // ← 新增
  publishedAt: '', // ← 新增
  category: '', // ← 新增
  // 教練欄位
  coach: {
    id: '',
    name: '',
    title: '',
    intro: '',
    profile_image_url: '',
    coachPage_Url: ''
  },
  reviewComment: '',
  // 章節清單
  chapters: []
})

const loading = ref(false)
const error = ref(null)

// 這三個 ref 分別綁定「目前選到的分類／講師／狀態」
const selectedCategory = ref('全部課程')
const selectedInstructor = ref('全部講師')
const selectedStatus = ref('全部狀態')

const categoryOptions = computed(() => {
  let list = courses.value
  if (selectedInstructor.value !== '全部講師') {
    list = list.filter(c => c.instructor === selectedInstructor.value)
  }
  if (selectedStatus.value !== '全部狀態') {
    const wantActive = selectedStatus.value === '上架中'
    list = list.filter(c => c.is_active === wantActive)
  }
  const set = new Set()
  list.forEach(c => set.add(c.category))
  return ['全部課程', ...Array.from(set)]
})

const instructorOptions = computed(() => {
  let list = courses.value
  if (selectedCategory.value !== '全部課程') {
    list = list.filter(c => c.category === selectedCategory.value)
  }
  if (selectedStatus.value !== '全部狀態') {
    const wantActive = selectedStatus.value === '上架中'
    list = list.filter(c => c.is_active === wantActive)
  }
  const set = new Set()
  list.forEach(c => set.add(c.instructor))
  return ['全部講師', ...Array.from(set)]
})

const statusOptions = computed(() => {
  let list = courses.value

  if (selectedCategory.value !== '全部課程') {
    list = list.filter(c => c.category === selectedCategory.value)
  }
  if (selectedInstructor.value !== '全部講師') {
    list = list.filter(c => c.instructor === selectedInstructor.value)
  }

  const set = new Set()
  list.forEach(c => set.add(c.is_active ? '上架中' : '待審核'))
  return ['全部狀態', ...Array.from(set)]
})

const pageSize = 20

// 由 pagination.value 計算出目前課程頁碼與總頁數
// const currentCoursePage = computed(() => pagination.value.page)
// const totalCoursePages = computed(() => pagination.value.total_pages)
const currentCoursePage = ref(1)

const totalCoursePages = computed(() =>
  Math.max(Math.ceil(filteredCourses.value.length / pageSize), 1)
)

const paginatedCourses = computed(() => {
  const start = (currentCoursePage.value - 1) * pageSize
  return filteredCourses.value.slice(start, start + pageSize)
})

function formatDateWithoutLib(isoString) {
  if (!isoString) return ''
  const datePart = isoString.slice(2, 10) // "2025-05-28" → "25-05-28"
  const timePart = isoString.slice(11, 16) // "22:00"
  return `${datePart} ${timePart}`
}

/**
 * 從 /admin/courses 把所有資料拉下來（後端固定每頁 20 筆）
 * 1. 先打 page=1 拿到 total
 * 2. 之後逐頁抓，直到收到「足夠的唯一 id 數量」為止
 *    - 後端 page=2 會重送 page=1，但 page=3 又會送剩下 4 筆
 *    - 所以用 Set 去重，再看總量是否到了就結束
 */
async function fetchAllCourses() {
  loading.value = true
  error.value = null
  courses.value = []

  try {
    const token = localStorage.getItem('token')

    /* ❶ 先抓 page=1 */
    const { data: first } = await api.get('/api/v1/admin/courses', {
      headers: { Authorization: `Bearer ${token}` },
      params: { page: 1 }
    })

    // 塞進陣列
    courses.value.push(...first.data)

    /* ❷ 根據 meta.total_pages，再把 2~n 頁補齊 */
    const totalPages = first.pagination.total_pages // ← 2
    const requests = []

    for (let p = 2; p <= totalPages; p++) {
      requests.push(
        api.get('/api/v1/admin/courses', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: p }
        })
      )
    }

    const results = await Promise.all(requests)
    results.forEach(res => courses.value.push(...res.data.data))

    /* 現在 courses.value 應該就是 24 筆，且不會重複 */
  } catch (err) {
    console.error('課程列表載入失敗:', err.response?.data || err)
    error.value = err.response?.data?.message || '伺服器錯誤，請稍後再試'
  } finally {
    loading.value = false
  }
}

function changeCoursePage(page) {
  if (page < 1 || page > totalCoursePages.value) return
  currentCoursePage.value = page
}
watch([selectedCategory, selectedInstructor, selectedStatus], () => {
  currentCoursePage.value = 1
})
watch([categoryOptions, instructorOptions, statusOptions], () => {
  if (!categoryOptions.value.includes(selectedCategory.value)) {
    selectedCategory.value = '全部課程'
  }
  if (!instructorOptions.value.includes(selectedInstructor.value)) {
    selectedInstructor.value = '全部講師'
  }
  if (!statusOptions.value.includes(selectedStatus.value)) {
    selectedStatus.value = '全部狀態'
  }
})

// 審核成功／失敗後都要關掉 Modal
function closeDetailModal() {
  const modalEl = document.getElementById('detailModal')
  // eslint-disable-next-line no-undef
  const bs = bootstrap.Modal.getInstance(modalEl)
  if (bs) bs.hide()

  selectedDetail.value.reviewComment = ''
  isEditing.value = false
}

/**
 * 按下「通過」時呼叫
 * PATCH /api/v1/admin/courses/:courseId/review
 * body 裡帶 approved: true
 */
async function approveReview() {
  const commentTxt = (selectedDetail.value.reviewComment || '').trim()
  try {
    const courseId = selectedDetail.value.id
    const token = localStorage.getItem('token')
    await api.patch(
      `/api/v1/admin/courses/${courseId}/review`,
      {
        status: 'approved',
        review_comment: commentTxt
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    // 關閉 Modal，並顯示成功訊息
    closeDetailModal()
    alert('課程已標記為「上架中」')
    // 如果需要重新載入列表，可呼叫 fetchCourses() 或 refresh 資料
    await fetchAllCourses()
    // 不一定要立刻還原 edit flag（通常關 Modal 就沒差），
    // 但若 modal 留著，也可再把 isEditing 變 false
    isEditing.value = false
  } catch (err) {
    console.error('通過審核失敗：', err.response?.data || err)
    alert(err.response?.data?.message || '審核通過失敗，請稍後再試')
  }
}

/**
 * 按下「未通過」時呼叫
 * 同樣呼叫 PATCH，把 approved: false
 */
async function rejectReview() {
  const commentTxt = (selectedDetail.value.reviewComment || '').trim()

  if (!commentTxt) {
    // 前端先做必填驗證
    alert('若審核未通過，請填寫建議')
    return
  }

  try {
    const courseId = selectedDetail.value.id
    const token = localStorage.getItem('token')
    await api.patch(
      `/api/v1/admin/courses/${courseId}/review`,
      {
        status: 'rejected',
        review_comment: commentTxt
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    closeDetailModal()
    alert('課程未通過，已退回給教練更新')
    fetchAllCourses()
    isEditing.value = false
  } catch (err) {
    console.error('拒絕審核失敗：', err.response?.data || err)
    alert(err.response?.data?.message || '審核拒絕失敗，請稍後再試')
  }
}

//

// === 依「所選分類 / 講師 / 狀態」來做篩選的 computed ===
//
const filteredCourses = computed(() => {
  return courses.value.filter(c => {
    // 1) 分類篩選
    const matchCategory =
      selectedCategory.value === '全部課程' ||
      c.category === selectedCategory.value

    // 2) 講師篩選
    const matchInstructor =
      selectedInstructor.value === '全部講師' ||
      c.instructor === selectedInstructor.value

    // 3) 狀態篩選
    //    後端的 is_active:true →「上架中」
    //                false →「待審核」
    const statusLabel = c.is_active ? '上架中' : '待審核'
    const matchStatus =
      selectedStatus.value === '全部狀態' ||
      statusLabel === selectedStatus.value

    return matchCategory && matchInstructor && matchStatus
  })
})

//

// === 評價 Modal 相關狀態 ===
//

// 存放要查看評價的那堂課 ID
const selectedCourseId = ref(null)

// 存放該課程的評價陣列與分頁資訊
const userRatings = ref({
  paginatedData: [],
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_previous: false
  }
})

const loadingRatings = ref(false)

// 由 userRatings.value.pagination 計算出目前評價頁碼與總頁數
const currentRatingPage = computed(() => userRatings.value.pagination.page)
const totalRatingPages = computed(
  () => userRatings.value.pagination.total_pages
)

// 當按下「檢視評價」按鈕時呼叫，先將 courseId 存起並抓第 1 頁評價
function openRatingsModal(courseId) {
  selectedCourseId.value = courseId
  fetchRatings(courseId, 1)
}

// 向後端拿該課程、指定頁的評價
async function fetchRatings(courseId, page = 1) {
  loadingRatings.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await api.get(`/api/v1/admin/courses/${courseId}/ratings`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, limit: userRatings.value.pagination.limit }
    })

    if (res.data.status) {
      userRatings.value.paginatedData = res.data.data.paginatedData
      userRatings.value.pagination = res.data.data.meta.pagination
    } else {
      userRatings.value.paginatedData = []
      userRatings.value.pagination = {
        page: 1,
        limit: userRatings.value.pagination.limit,
        total: 0,
        total_pages: 1,
        has_next: false,
        has_previous: false
      }
    }
  } catch (err) {
    console.error('取得評價失敗：', err.response?.data || err)
    userRatings.value.paginatedData = []
    userRatings.value.pagination = {
      page: 1,
      limit: userRatings.value.pagination.limit,
      total: 0,
      total_pages: 1,
      has_next: false,
      has_previous: false
    }
  } finally {
    loadingRatings.value = false
  }
}

// 分頁列點擊時，切換到指定頁
function changeRatingPage(page) {
  if (page < 1 || page > userRatings.value.pagination.total_pages) return
  fetchRatings(selectedCourseId.value, page)
}

// 讓 template 使用：paginatedRatings = userRatings.value.paginatedData
const paginatedRatings = computed(() => userRatings.value.paginatedData)

// openDetailModal：呼叫 GET /courses/:id/details，然後補值並用 Bootstrap JS 打開 Modal
async function openDetailModal(courseId) {
  try {
    const token = localStorage.getItem('token')
    // 1) 先呼叫 /details 拿 description、chapters、coach 等
    const res = await api.get(`/api/v1/admin/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.data.status) {
      throw new Error(res.data.message || '取得 Detail 失敗')
    }

    const payload = res.data.data

    // 2) 把 /details 裡的課程名稱、說明、章節與 coach 資料塞進去
    selectedDetail.value.id = payload.course.id || ''
    selectedDetail.value.name = payload.course.name || ''
    selectedDetail.value.score = payload.course.score || 0
    selectedDetail.value.student_amount = payload.course.student_amount || 0
    selectedDetail.value.hours = payload.course.hours || 0
    selectedDetail.value.image_url = payload.course.image_url || ''
    selectedDetail.value.description = payload.course.description || ''

    // 塞 coach 相關
    selectedDetail.value.coach.id = payload.coach.id || ''
    selectedDetail.value.coach.name = payload.coach.name || ''
    selectedDetail.value.coach.title = payload.coach.title || ''
    selectedDetail.value.coach.intro = payload.coach.intro || ''
    selectedDetail.value.coach.profile_image_url =
      payload.coach.profile_image_url || ''
    selectedDetail.value.coach.coachPage_Url = payload.coach.coachPage_Url || ''

    // 3) 接著從先前 fetchCourses() 拿到的 courses.value 找同一筆 course，
    //    拿 is_active 與 created_at。 detail endpoint 裡並沒有回傳這兩個欄位，
    //    所以必須從列表裡「找一筆匹配的」才能取得。
    const base = courses.value.find(c => c.id === courseId)
    if (base) {
      // 課程狀態
      selectedDetail.value.status = base.is_active ? '上架中' : '待審核'
      // 上架時間 (把 "2025-05-28T22:00:18.895Z" 轉成 "25/05/28 22:00")
      if (base.created_at) {
        // 取 "2025-05-28" → "25/05/28"，再加上 "22:00"
        const datePart = base.created_at.slice(2, 10).replace(/-/g, '/')
        const timePart = base.created_at.slice(11, 16)
        selectedDetail.value.publishedAt = `${datePart} ${timePart}`
      } else {
        selectedDetail.value.publishedAt = ''
      }
      // 類別也可以直接從 base.category 塞
      selectedDetail.value.category = base.category
    } else {
      // 如果 courses.value 裡找不到，就留空或給預設
      selectedDetail.value.status = ''
      selectedDetail.value.publishedAt = ''
      selectedDetail.value.category = ''
    }

    const rawChapters = payload.chapters || []
    const grouped = rawChapters.reduce((acc, ch) => {
      let group = acc.find(g => g.title === ch.title)
      if (!group) {
        group = { title: ch.title, lessons: [] }
        acc.push(group)
      }
      group.lessons.push({
        id: ch.id,
        subtitle: ch.subtitle,
        video_url: ch.video_url,
        duration: ch.duration,
        uploaded_at: ch.uploaded_at
      })

      return acc
    }, [])
    selectedDetail.value.chapters = grouped

    // 確保一開始非編輯狀態
    isEditing.value = false

    // 4) 再打開 Bootstrap Modal
    const modalEl = document.getElementById('detailModal')
    // eslint-disable-next-line no-undef
    const bsModal = new bootstrap.Modal(modalEl)
    bsModal.show()
  } catch (err) {
    console.error('載入課程詳細失敗：', err)
    alert('無法載入課程詳細，請稍後再試')
  }
}

const currentModalLesson = ref(null)
const modalVideoSrc = ref('')
const modalLoading = ref(false)

const BS_COLLAPSE_HIDDEN = 'hidden.bs.collapse'

async function playModalLesson(lesson) {
  // 已經在播放這顆 → 直接收合或什麼都不做
  if (currentModalLesson.value?.id === lesson.id) return

  currentModalLesson.value = lesson // 標記目前播放
  modalLoading.value = true

  modalVideoSrc.value = lesson.video_url
}

function onCollapseHide(lesson) {
  if (currentModalLesson.value?.id === lesson.id) {
    modalVideoSrc.value = ''
    currentModalLesson.value = null
  }
}

function onModalHide() {
  document.querySelectorAll('#detailModal video').forEach(v => {
    v.pause()
    v.currentTime = 0
  })

  modalVideoSrc.value = ''
  currentModalLesson.value = null

  selectedDetail.value.reviewComment = ''
  isEditing.value = false
}

onMounted(() => {
  if (detailModal.value) {
    detailModal.value.addEventListener('hidden.bs.modal', onModalHide)
  }
})

onBeforeUnmount(() => {
  if (detailModal.value) {
    detailModal.value.removeEventListener('hidden.bs.modal', onModalHide)
  }
})

function enableEdit() {
  isEditing.value = true
}

// === 用來記錄「要刪除的 ratingId」 ===
const pendingDeleteRatingId = ref(null)

// 當按下垃圾桶按鈕時，先將 ratingId 存起來，並叫 Modal 彈出
function askDeleteRating(ratingId) {
  pendingDeleteRatingId.value = ratingId
  // 用 Bootstrap 的 JS API 來開啟「confirmDeleteModal」
  const modalEl = document.getElementById('confirmDeleteModal')
  // eslint-disable-next-line no-undef
  const bs = new bootstrap.Modal(modalEl)
  bs.show()
}

// 真正按下「刪除」之後呼叫的函式
async function confirmDelete() {
  // 先把 Modal 隱藏
  const modalEl = document.getElementById('confirmDeleteModal')
  // eslint-disable-next-line no-undef
  const bs = bootstrap.Modal.getInstance(modalEl)
  bs.hide()

  // 如果沒有 pendingDeleteRatingId，就不用送 API
  if (!pendingDeleteRatingId.value) return

  try {
    const token = localStorage.getItem('token')
    // 這裡的 selectedCourseId 必須已經在「開啟評價 Modal」時設定過
    await api.delete(
      `/api/v1/admin/courses/${selectedCourseId.value}/ratings/${pendingDeleteRatingId.value}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    // 刪除成功後，重新撈當前頁的評價
    fetchRatings(selectedCourseId.value, currentRatingPage.value)
  } catch (err) {
    console.error('刪除評價失敗：', err.response?.data || err)
    alert(err.response?.data?.message || '刪除評價失敗，請稍後再試')
  } finally {
    // 清除暫存的 ratingId
    pendingDeleteRatingId.value = null
  }
}

// onMounted 先檢查身份，通過才繼續 fetchCourses
onMounted(async () => {
  const isAdmin = await checkAdmin()
  if (isAdmin) {
    fetchAllCourses()
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
.card-wrapper {
  background-color: $primary-600;
  border-radius: 15px 15px 0 0;
  height: 50px;
}
.card-content {
  border-radius: 15px;
  background-color: $primary-000;
  margin-top: -38px;
  padding: 24px;
  color: black;
}
.th-custom {
  color: $primary-900;
  background: $primary-000;
  font-size: 20px;
  text-align: center;
  white-space: nowrap;
  @media (max-width: 992px) {
    font-size: 16px;
  }
}
.td-custom {
  color: $primary-900;
  background: $primary-000;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
}
.title-cell {
  white-space: normal; // 讓文字可以自動折行
  word-break: break-word; // 長單字或網址也能斷行
  min-width: 180px;
  width: 100%;
}
.table-striped > tbody > tr:nth-of-type(odd) > td {
  background-color: $primary-000; /* 你想要的斑馬底色 */
}
textarea {
  resize: none;
}
/* AdminCourses.vue 或同級的 .scss 文件 */
textarea::placeholder {
  /* 如果你有 SCSS 變數 $grey-200，就這樣用 */
  color: $grey-200;
  opacity: 1; /* 確保在部分瀏覽器上不會因為 opacity 被壓低而看不見 */
}
.table-responsive {
  overflow-x: auto;
}
@media (max-width: 900px) {
  .wide-table {
    min-width: 200px;
  }
}
@media (max-width: 1200px) {
  .side-nav {
    display: none;
  }
}
.mobile-custom-60 {
  width: 60%;
  @media (max-width: 992px) {
    width: 100%;
  }
}
.mobile-custom-40 {
  width: 40%;
  @media (max-width: 992px) {
    width: 100%;
  }
}
.des-custom {
  margin-top: 8px;
  background-color: $grey-100;
  border: 1px solid $primary-700;
  color: $grey-700;
  display: block;
  width: 100%;
  padding: 6px 12px;
  background-clip: padding-box;
  border-radius: 6px;
  min-height: 40px;
}
.course-photo {
  max-height: 250px;
  height: auto;
  object-fit: contain;
}
.accordion-button::after {
  display: none; // 隱藏 Bootstrap 預設箭頭
}
.custom-toggle-icon {
  color: $primary-600;
  margin-left: auto;
  transition: transform 0.3s;
}
.accordion-button[aria-expanded='true'] .custom-toggle-icon {
  transform: rotate(180deg); // 展開時轉向上
}
.sub-custom {
  border: none;
  border-bottom: 1px solid $primary-600;
  border-radius: 0;
  transition: border 0.2s ease;
  outline: none;
}
.sub-custom:last-child {
  border-bottom: 1px solid $primary-600;
}
.sub-custom:focus {
  border-top-color: #5b8def;
  border-bottom-color: #5b8def;
}

.accordion-button:not(.collapsed) {
  box-shadow: none;
}
.dropdown-menu {
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
</style>
