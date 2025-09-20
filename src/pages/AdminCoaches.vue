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

      <!-- 右側主區塊 -->
      <div class="p-lg-8 px-2 py-8 w-100" style="max-width: 1056px">
        <div class="d-lg-flex">
          <h2 class="fs-lg-4 mb-lg-8 mb-6">教練管理</h2>

          <div class="d-flex flex-wrap gap-lg-6 gap-3 ms-lg-6 mb-3">
            <!-- 選擇類別（技能） -->
            <div class="dropdown">
              <button
                class="btn btn-primary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {{ selectedSkill || '選擇類別' }}
              </button>
              <ul class="dropdown-menu">
                <!-- 全部選項 -->
                <li @click="selectedSkill = ''">
                  <a class="dropdown-item rounded-2" href="#">選擇類別</a>
                </li>
                <li
                  v-for="skill in skillOptions"
                  :key="skill"
                  @click="selectedSkill = skill"
                >
                  <a class="dropdown-item rounded-2" href="#">{{ skill }}</a>
                </li>
              </ul>
            </div>
            <!-- 選擇教練（名稱） -->
            <div class="dropdown">
              <button
                class="btn btn-primary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {{ selectedCoachName || '選擇教練' }}
              </button>
              <ul class="dropdown-menu">
                <!-- 全部選項 -->
                <li @click="selectedCoachName = ''">
                  <a class="dropdown-item rounded-2" href="#">選擇教練</a>
                </li>
                <li
                  v-for="name in coachOptions"
                  :key="name"
                  @click="selectedCoachName = name"
                >
                  <a class="dropdown-item rounded-2" href="#">{{ name }}</a>
                </li>
              </ul>
            </div>
            <!-- 依審核狀態篩選 -->
            <div class="dropdown">
              <button
                class="btn btn-primary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {{ selectedVerifyStatus }}
                <!-- 預設顯示「全部審核狀態」 -->
              </button>

              <ul class="dropdown-menu">
                <li
                  v-for="st in verifyStatusOptions"
                  :key="st"
                  @click="selectedVerifyStatus = st"
                >
                  <a class="dropdown-item rounded-2" href="#">{{ st }}</a>
                </li>
              </ul>
            </div>

            <!-- 文字搜尋（教練名稱模糊搜尋） -->
            <div class="input-group" style="width: 200px; height: 42px">
              <input
                v-model="searchKeyword"
                type="text"
                class="form-control ps-2"
                placeholder="搜尋教練名稱..."
                aria-label="Search"
                aria-describedby="basic-addon1"
              />
            </div>
          </div>
        </div>

        <div class="card-wrapper"></div>
        <div class="card-content p-5 mb-5">
          <div class="table-responsive">
            <table class="table table-striped mb-0 align-middle wide-table">
              <thead>
                <tr>
                  <th class="th-custom">教練編號</th>
                  <th class="th-custom">教練名稱</th>
                  <th class="th-custom">瀏覽次數</th>
                  <th class="th-custom">開課類別</th>
                  <th class="th-custom">審核</th>
                  <th class="th-custom">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="coach in paginatedResults" :key="coach.coach_id">
                  <td class="td-custom">***{{ coach.coach_id.slice(-5) }}</td>
                  <td class="td-custom">{{ coach.coach_name }}</td>
                  <td class="td-custom">{{ coach.numbers_of_view }}</td>
                  <td class="td-custom">
                    {{
                      coach.coach_skills.length
                        ? coach.coach_skills.map(s => s.skill_name).join('、') // ← 這裡換行顯示分隔符
                        : '—'
                    }}
                  </td>
                  <td class="td-custom">
                    <span
                      :class="
                        isVerifiedRow(coach) ? 'text-success' : 'text-warning'
                      "
                    >
                      {{ isVerifiedRow(coach) ? '已審核' : '未審核' }}
                    </span>
                  </td>
                  <td class="td-custom">
                    <button
                      class="btn btn-sm btn-primary"
                      @click="openDetailModal(coach.coach_id)"
                    >
                      檢視
                    </button>
                    <!-- 如果需要刪除功能，可以另外寫 deleteCoach(coach.coach_id) -->
                  </td>
                </tr>

                <tr v-if="coaches.length === 0 && !loading">
                  <td colspan="5" class="text-center text-muted">
                    沒有符合條件的教練
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 分頁 -->
        <!-- 分頁 -->
        <div v-if="totalPages > 1" class="mt-11">
          <nav class="d-flex justify-content-center" style="padding-top: 4px">
            <ul class="pagination mb-0">
              <!-- ⬅︎ 上一頁 -->
              <li
                class="page-item"
                :class="{ disabled: currentPage === 1 }"
                @click="changePage(currentPage - 1)"
              >
                <a class="page-link px-2">
                  <i class="bi bi-chevron-left d-inline d-lg-none"></i>
                  <span class="d-none d-lg-inline">上一頁</span>
                </a>
              </li>

              <!-- 起始 … 與第一頁 -->
              <li
                v-if="showStartDots"
                class="page-item mx-1"
                @click="changePage(1)"
              >
                <a class="page-link">1</a>
              </li>
              <li v-if="showStartDots" class="page-item disabled mx-1">
                <a class="page-link">…</a>
              </li>

              <!-- 主要頁碼迴圈 -->
              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item mx-1"
                :class="{ active: page === currentPage }"
                @click="changePage(page)"
              >
                <a class="page-link">{{ page }}</a>
              </li>

              <!-- 結尾 … 與最後一頁 -->
              <li v-if="showEndDots" class="page-item disabled mx-1">
                <a class="page-link">…</a>
              </li>
              <li
                v-if="showEndDots"
                class="page-item mx-1"
                @click="changePage(totalPages)"
              >
                <a class="page-link">{{ totalPages }}</a>
              </li>

              <!-- ➡︎ 下一頁 -->
              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
                @click="changePage(currentPage + 1)"
              >
                <a class="page-link px-2">
                  <i class="bi bi-chevron-right d-inline d-lg-none"></i>
                  <span class="d-none d-lg-inline">下一頁</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <!-- 以下示範「檢視詳細」的 Modal 結構，可以照需求自行填入欄位 -->
        <div
          id="detailModal"
          class="modal fade"
          tabindex="-1"
          aria-labelledby="detailModalLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-xl p-3">
            <div class="modal-content bg-primary-000 text-grey-700 p-5">
              <div class="modal-header border-grey-200">
                <h5 id="detailModalLabel" class="modal-title text-primary-900">
                  教練詳細資訊
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body px-0">
                <div class="d-flex flex-column-reverse flex-lg-row mb-5">
                  <div class="col-lg-8 d-lg-flex flex-column">
                    <div class="d-lg-flex">
                      <div
                        class="mb-3 d-flex flex-column gap-3 mobile-custom-60"
                      >
                        <div class="me-lg-4">
                          <strong>教練編號：<br class="d-xl-none" /></strong>
                          <span class="des-custom">{{
                            selectedCoach?.id
                          }}</span>
                        </div>
                        <div class="me-lg-4">
                          <strong>教練名稱：</strong>
                          <span class="des-custom">{{
                            selectedCoach?.nickname
                          }}</span>
                        </div>
                        <div class="me-lg-4">
                          <strong>Email：</strong
                          ><span class="des-custom">{{
                            selectedCoach?.email
                          }}</span>
                        </div>
                        <div class="me-lg-4">
                          <strong>手機：</strong
                          ><span class="des-custom">{{
                            selectedCoach?.phone_number
                          }}</span>
                        </div>
                        <div class="me-lg-4">
                          <strong>身分證字號：</strong
                          ><span class="des-custom">{{
                            selectedCoach?.id_number
                          }}</span>
                        </div>
                        <div class="me-lg-4">
                          <strong>專長類別：</strong
                          ><template v-if="selectedCoach?.skills?.length">
                            <span
                              v-for="skill in selectedCoach.skills"
                              :key="skill.name"
                              class="des-custom mb-1"
                            >
                              {{ skill.name }}
                            </span>
                          </template>

                          <!-- 無資料：放一格空框 + 提示文字 -->
                          <span v-else class="des-custom text-muted"></span>
                        </div>
                        <div class="me-lg-4">
                          <p>
                            <strong>專長介紹：</strong
                            ><span class="des-custom">{{
                              selectedCoach?.skill_description
                            }}</span>
                          </p>
                        </div>
                      </div>
                      <div
                        class="mb-3 d-flex flex-column gap-3 mobile-custom-40"
                      >
                        <div class="me-lg-4">
                          <strong>註冊時間：</strong
                          ><span class="des-custom">
                            {{ selectedCoach?.created_at }}</span
                          >
                        </div>

                        <div class="me-lg-4">
                          <strong>本名：</strong
                          ><span class="des-custom">{{
                            selectedCoach?.realname
                          }}</span>
                        </div>

                        <div class="me-lg-4">
                          <strong>出生日期：</strong
                          ><span class="des-custom">{{
                            selectedCoach?.birthday
                          }}</span>
                        </div>
                        <div class="me-lg-4">
                          <strong>教學經驗：</strong
                          ><span class="des-custom"
                            >{{ selectedCoach?.experience_years }} 年</span
                          >
                        </div>
                        <div class="me-lg-4">
                          <strong>稱號：</strong
                          ><span class="des-custom">{{
                            selectedCoach?.job_title
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-4 text-center mb-5">
                    <img
                      v-if="selectedCoach?.profile_image_url"
                      :src="selectedCoach.profile_image_url"
                      alt="教練大頭照"
                      class="rounded-circle mb-3"
                      style="width: 240px; height: 240px; object-fit: cover"
                    />
                    <div
                      v-else
                      class="d-flex align-items-center justify-content-center rounded-circle bg-primary-500 mb-5 mx-auto"
                      style="width: 240px; height: 240px"
                      aria-label="預設頭像"
                    >
                      <i
                        class="bi bi-person-fill text-white"
                        style="font-size: 120px"
                      ></i>
                    </div>
                    <!-- 資格審核開關 -->
                    <div
                      class="form-check form-switch verify-switch d-flex flex-column align-items-center ps-0"
                    >
                      <input
                        id="coachVerified"
                        :checked="isVerified"
                        class="form-check-input m-0"
                        type="checkbox"
                        @click.prevent="askVerify"
                      />
                      <label
                        class="form-check-label mt-2 fw-bold text-center"
                        for="coachVerified"
                      >
                        {{ isVerified ? '資格已審核' : '資格未審核' }}
                      </label>
                    </div>
                  </div>
                </div>
                <!-- 這裡可以自由擺放要顯示的欄位，比如 coach_about_me、coach_title... -->

                <p class="mb-3 fw-bold">自我介紹：</p>
                <div
                  class="border rounded p-3 mb-lg-3 mb-5 bg-grey-100 border-primary-700"
                  style="background-color: #f8f9fa"
                >
                  <p>
                    {{ selectedCoach?.about_me }}
                  </p>
                </div>
                <p class="mb-3 fw-bold">學經歷與得獎經歷：</p>
                <div
                  class="border rounded p-3 mb-lg-3 mb-5 bg-grey-100 border-primary-700"
                  style="background-color: #f8f9fa"
                >
                  <p>
                    {{ selectedCoach?.experience }}
                  </p>
                </div>
                <p class="mb-3 fw-bold">感興趣的事物：</p>
                <div
                  class="border rounded p-3 mb-lg-3 mb-5 bg-grey-100 border-primary-700"
                  style="background-color: #f8f9fa"
                >
                  <p>
                    {{ selectedCoach?.hobby }}
                  </p>
                </div>
                <p class="mb-3 fw-bold">最喜歡的一段話：</p>
                <div
                  class="border rounded p-3 mb-lg-3 mb-5 bg-grey-100 border-primary-700"
                  style="background-color: #f8f9fa"
                >
                  <p>
                    {{ selectedCoach?.favorite_words }}
                  </p>
                </div>
                <p class="mb-3 fw-bold">座右銘：</p>
                <div
                  class="border rounded p-3 mb-lg-3 mb-5 bg-grey-100 border-primary-700"
                  style="background-color: #f8f9fa"
                >
                  <p>
                    {{ selectedCoach?.motto }}
                  </p>
                </div>
                <div v-if="selectedCoach?.bankbook_copy_url">
                  <p class="fw-bold">存摺影本</p>
                  <img
                    :src="selectedCoach.bankbook_copy_url"
                    alt="存摺影本"
                    class="img-fluid rounded mb-3 bankbook-card previewable"
                    style="max-height: 200px; object-fit: cover"
                    @click="
                      openPreview(selectedCoach.bankbook_copy_url, '存摺影本')
                    "
                  />
                </div>
                <div
                  v-if="selectedCoach?.licenses?.length"
                  class="license-wrapper"
                >
                  <p class="fw-bold">相關資格證明</p>
                  <div class="d-flex flex-wrap">
                    <div
                      v-for="lic in selectedCoach.licenses"
                      :key="lic.id"
                      class="license-card text-center me-3 mb-3"
                    >
                      <img
                        :src="lic.file_url"
                        :alt="lic.name"
                        class="previewable"
                        @click="openPreview(lic.file_url, lic.name)"
                      />
                      <p class="lic-name text-wrap text-grey-700 mb-0">
                        {{ lic.name }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="subscription-card">
                <div class="card-wrapper"></div>
                <div class="card-content p-5 mb-5">
                  <div class="table-responsive">
                    <table
                      class="table table-striped mb-0 align-middle wide-table"
                    >
                      <thead class="">
                        <tr class="text-start">
                          <th class="th-custom">類別</th>
                          <th class="th-custom">課程代號</th>
                          <th class="th-custom">課程名稱</th>
                          <th class="th-custom">上架時間</th>
                          <th class="th-custom">教練名稱</th>
                          <th class="th-custom">狀態</th>
                          <th class="th-custom">詳細資訊</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="course in coachCourses" :key="course.id">
                          <td class="td-custom">
                            {{ course.category }}
                          </td>
                          <td class="td-custom">
                            ***{{ course.id.slice(-5) }}
                          </td>
                          <td class="td-custom">{{ course.title }}</td>
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
                              @click="goToAdminCourse(course.id)"
                            >
                              檢視
                            </button>
                          </td>
                        </tr>
                        <!-- 如果篩選後沒資料，顯示提示列 -->
                        <tr v-if="filteredCourses.length === 0 && !loading">
                          <td colspan="8" class="text-center">
                            沒有符合條件的課程
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div class="modal-footer justify-content-center border-0">
                <button
                  type="button"
                  class="btn btn-primary"
                  data-bs-dismiss="modal"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
          <div
            id="confirmVerifyModal"
            class="modal fade"
            tabindex="-1"
            aria-labelledby="confirmVerifyLabel"
            aria-hidden="true"
          >
            <div class="modal-dialog modal-lg modal-dialog-centered p-5 p-lg-0">
              <div
                class="modal-content bg-grey-000 text-grey-700 border-grey-700"
              >
                <div class="modal-header border-0">
                  <h5 id="confirmVerifyLabel" class="modal-title">確認操作</h5>
                  <button class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                  <p class="mb-0">{{ confirmText }}</p>
                </div>
                <div class="modal-footer border-0 justify-content-center">
                  <template v-if="confirmMode === 'warn'">
                    <button class="btn btn-primary" data-bs-dismiss="modal">
                      知道了
                    </button>
                  </template>

                  <template v-else>
                    <div class="w-100">
                      <label class="form-label fw-bold mb-1">審核備註</label>
                      <textarea
                        v-model="reviewComment"
                        rows="3"
                        class="form-control bg-grey-000 text-grey-700 border-primary-600"
                        placeholder="輸入審核原因（選填；若未通過建議必填）"
                      ></textarea>
                    </div>
                    <button
                      class="btn btn-danger me-3 text-grey-700"
                      @click="chooseVerify(false)"
                    >
                      <i class="bi bi-x-circle me-2"></i>
                      未通過
                    </button>
                    <button
                      class="btn btn-success text-grey-700"
                      @click="chooseVerify(true)"
                    >
                      <i class="bi bi-check-circle me-2"></i>
                      通過
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
          <div
            id="imagePreviewModal"
            class="modal fade"
            tabindex="-1"
            aria-hidden="true"
          >
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content bg-transparent border-0 shadow-none">
                <button
                  type="button"
                  class="btn-close position-absolute end-0 top-0 m-3"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>

                <!-- 原圖 → 動態綁 src / alt -->
                <img
                  :src="previewSrc"
                  :alt="previewAlt"
                  class="img-fluid rounded"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- ※ Modal HTML 放在此處即可，不影響其他區塊排版 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// import axios from 'axios'
import { api } from '@/api'

const router = useRouter()
const route = useRoute()

//
// === 身分驗證：只有 role === 'ADMIN' 才能繼續進入此頁面 ===
//
async function checkAdmin() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace({ path: '/' })
      return false
    }
    const res = await api.get('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data?.status && res.data.data?.role === 'ADMIN') {
      return true
    } else {
      router.replace({ path: '/' })
      return false
    }
  } catch (err) {
    console.error('身分驗證失敗：', err)
    router.replace({ path: '/' })
    return false
  }
}
// 確認是否審核通過
const isVerified = ref(false)

// -----------------------------------------------
// === 教練列表相關狀態（把所有頁都拉下來） ===
// -----------------------------------------------

// 1. 用來存「前端合併所有分頁」的陣列
const allCoaches = ref([])

//  2. 取當前「某一頁」的資料，只供拆分 pagination 之用
//
const coaches = ref([])

// 用來存放「目前 Modal 正在顯示的教練物件」
const selectedCoach = ref(null)

const pagination = ref({
  page: 1,
  total: 0,
  total_pages: 1,
  has_next: false,
  has_previous: false
})

const loading = ref(false)
const error = ref(null)

const previewSrc = ref('')
const previewAlt = ref('')

function openPreview(src, alt = '') {
  previewSrc.value = src
  previewAlt.value = alt
  // 顯示 Bootstrap 5 Modal
  // eslint-disable-next-line no-undef
  bootstrap.Modal.getOrCreateInstance(
    document.getElementById('imagePreviewModal')
  ).show()
}

// 由 pagination.value 計算出目前頁碼與總頁數

// 篩選用的三個 ref，一定要都存在

// --------------------------------------------------
// 取得單一頁的教練資料，並回傳「data + pagination info」
// --------------------------------------------------
async function fetchCoachesPage(page = 1) {
  try {
    const token = localStorage.getItem('token')
    const res = await api.get('/api/v1/admin/coaches', {
      headers: { Authorization: `Bearer ${token}` },
      params: { page } // 如果後端不接受 limit，就只傳 page
    })
    if (!res.data.status) {
      throw new Error(res.data.message || '取得教練資料失敗')
    }
    // 回傳 { data: [...], pagination: {...} }
    return {
      data: res.data.data,
      pagination: res.data.meta.pagination
    }
  } catch (err) {
    console.error('fetchCoachesPage 失敗:', err.response?.data || err)
    throw err
  }
}

const selectedVerifyStatus = ref('全部狀態')

const verifyStatusOptions = computed(() => {
  let list = allCoaches.value

  if (selectedSkill.value) {
    list = list.filter(c =>
      c.coach_skills.some(s => s.skill_name === selectedSkill.value)
    )
  }

  if (selectedCoachName.value) {
    list = list.filter(c => c.coach_name === selectedCoachName.value)
  }

  const set = new Set()
  list.forEach(c => set.add(isVerifiedRow(c) ? '已審核' : '未審核'))

  return ['全部狀態', ...Array.from(set)]
})

/**
 * 切分「分頁顯示」給前端 Table 用
 * 由 filteredCoaches 先做過濾、再把結果切成 pageSize，回傳當前 currentPage 那一小段
 */

const pageSize = 9

const selectedSkill = ref('')
const selectedCoachName = ref('')
const searchKeyword = ref('')

async function fetchAllCoaches() {
  loading.value = true
  error.value = null
  allCoaches.value = []
  coaches.value = []

  try {
    // 把第一頁先拉下來
    const first = await fetchCoachesPage(1)
    coaches.value = first.data
    allCoaches.value.push(...first.data)

    // 設定 pagination info
    pagination.value.page = first.pagination.page
    pagination.value.total = first.pagination.total
    pagination.value.total_pages = first.pagination.total_pages
    pagination.value.has_next = first.pagination.has_next
    pagination.value.has_previous = first.pagination.has_previous

    // 如果總頁數大於1，就繼續把後續 pages 都拉下來
    const totalPagesCount = first.pagination.total_pages
    if (totalPagesCount > 1) {
      // 從 2 開始到 total_pages
      for (let p = 2; p <= totalPagesCount; p++) {
        const next = await fetchCoachesPage(p)
        allCoaches.value.push(...next.data)
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || '載入教練資料失敗'
  } finally {
    loading.value = false
  }
}

const filteredCoaches = computed(() => {
  return allCoaches.value.filter(coach => {
    // 技能篩選
    if (
      selectedSkill.value &&
      !coach.coach_skills.some(s => s.skill_name === selectedSkill.value)
    )
      return false
    // 教練名稱下拉
    if (selectedCoachName.value && coach.coach_name !== selectedCoachName.value)
      return false
    // 關鍵字搜尋
    if (searchKeyword.value) {
      const kw = searchKeyword.value.toLowerCase()
      const nameMatch = coach.coach_name.toLowerCase().includes(kw)
      const skillMatch = coach.coach_skills
        .map(s => s.skill_name.toLowerCase())
        .join(' ')
        .includes(kw)
      if (!nameMatch && !skillMatch) return false
    }
    const statusLabel = isVerifiedRow(coach) ? '已審核' : '未審核'
    const matchVerify =
      selectedVerifyStatus.value === '全部狀態' ||
      statusLabel === selectedVerifyStatus.value
    return matchVerify
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredCoaches.value.length / pageSize)
})

const currentPage = ref(1)

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredCoaches.value.slice(start, start + pageSize)
})

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const showStartDots = computed(() => {
  // 前面被省略的頁數 ≥ 2 才顯示 …
  return visiblePages.value[0] > 2
})

const showEndDots = computed(() => {
  // 後面被省略的頁數 ≥ 2 才顯示 …
  const last = visiblePages.value[visiblePages.value.length - 1]
  return totalPages.value - last > 1
})

const maxButtons = ref(7) // 預設桌機 7 顆

const updateMaxButtons = () => {
  maxButtons.value = window.innerWidth < 576 ? 5 : 7 // <576px 改 5 顆
}

onMounted(() => {
  const confirmEl = document.getElementById('confirmVerifyModal')
  confirmEl.addEventListener('hidden.bs.modal', () => {
    reviewComment.value = ''
  })
  updateMaxButtons()
  window.addEventListener('resize', updateMaxButtons)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMaxButtons)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const half = Math.floor(maxButtons.value / 2)

  let start = Math.max(1, current - half)
  let end = start + maxButtons.value - 1
  if (end > total) {
    end = total
    start = Math.max(1, end - maxButtons.value + 1)
  }

  const arr = []
  for (let i = start; i <= end; i++) arr.push(i)
  return arr
})

// 取得某位教練詳細資料
async function fetchCoachDetail(coachId) {
  try {
    const token = localStorage.getItem('token')
    const { data } = await api.get(`/api/v1/admin/coaches/${coachId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!data.status) {
      throw new Error(data.message || '讀取失敗')
    }

    const { coachDetails, licenses = [], courses = [] } = data.data

    selectedCoach.value = {
      ...coachDetails,
      licenses,
      courses
    }
    isVerified.value = coachDetails.is_verified
    // 顯示 Modal
  } catch (err) {
    console.error('fetchCoachDetail 錯誤', err)
  }
}
watch(
  () => selectedCoach.value?.is_verified,
  val => {
    if (val !== undefined) isVerified.value = val
  }
)
async function updateVerifyStatus(approved, commentTxt) {
  if (!selectedCoach.value) return false

  const token = localStorage.getItem('token')
  const newStatus = approved ? 'approved' : 'rejected'

  try {
    // ⬇︎ 後端通常會回最新狀態；若沒有回，改完再手動塞
    const res = await api.patch(
      `/api/v1/admin/coaches/${selectedCoach.value.id}/review`,
      { status: newStatus, review_comment: commentTxt },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    /* ❶ 以後端回傳為準；若沒回，就用 isVerified */
    const verified =
      res.data?.data?.coach_is_verified ?? // 後端有回
      isVerified.value // 否則用目前勾選

    // ──同步 Modal 內資料──
    selectedCoach.value.is_verified = verified
    selectedCoach.value.coach_is_verified = verified

    // ──同步列表 row──
    const row = allCoaches.value.find(
      c => c.coach_id === selectedCoach.value.id
    )
    if (row) row.coach_is_verified = verified

    return true
  } catch (err) {
    console.error('更新審核狀態失敗', err)
    alert('更新失敗，請稍後再試')
    return false
  }
}

const confirmText = ref('')
const confirmMode = ref('normal')

function isVerifiedRow(coach) {
  return coach.coach_is_verified === true || coach.is_verified === true
}

function isProfileComplete(coach) {
  if (!coach) return false

  const required = [
    'realname',
    'id_number',
    'phone_number',
    'birthday',
    'about_me',
    'skill_description',
    'experience',
    'hobby',
    'favorite_words',
    'motto'
  ]

  const basicOK = required.every(
    k => coach[k] && coach[k].toString().trim() !== ''
  )

  const skillsOK = Array.isArray(coach.skills) && coach.skills.length > 0

  return basicOK && skillsOK
}

const reviewComment = ref('')

function askVerify() {
  if (!isProfileComplete(selectedCoach.value)) {
    confirmText.value = '教練基本資料尚未填寫完整，請提醒對方補齊資訊後再審核。'
    confirmMode.value = 'warn'
  } else {
    confirmText.value = '請選擇要將此教練標記審核結果'
    confirmMode.value = 'choose'
  }

  // eslint-disable-next-line no-undef
  bootstrap.Modal.getOrCreateInstance(
    document.getElementById('confirmVerifyModal')
  ).show()
}

async function doVerify(approved) {
  const comment = (reviewComment.value || '').trim()

  if (!approved && !comment) {
    alert('若審核未通過，請填寫原因')
    return
  }

  isVerified.value = approved
  const ok = await updateVerifyStatus(approved, comment)

  // eslint-disable-next-line no-undef
  bootstrap.Modal.getInstance(
    document.getElementById('confirmVerifyModal')
  )?.hide()

  reviewComment.value = ''

  if (!ok) {
    // eslint-disable-next-line no-undef
    bootstrap.Modal.getInstance(
      document.getElementById('confirmVerifyModal')
    )?.hide()
    reviewComment.value = ''
  }
}

function chooseVerify(approved) {
  doVerify(approved)
}

const courses = ref([])
const selectedCategory = ref('全部課程')
const selectedInstructor = ref('全部講師')
const selectedStatus = ref('全部狀態')

async function fetchCourses() {
  loading.value = true
  error.value = null

  try {
    const token = localStorage.getItem('token')
    // 不帶任何參數，因為後端不接受 page/limit
    const res = await api.get('/api/v1/admin/courses', {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (res.data.status) {
      courses.value = res.data.data
      if (res.data.pagination) {
        const p = res.data.pagination
        pagination.value.page = p.page
        pagination.value.limit = p.limit
        pagination.value.total = p.total
        pagination.value.total_pages = p.total_pages
        pagination.value.has_next = p.has_next
        pagination.value.has_previous = p.has_previous
      }
    } else {
      error.value = res.data.message || '取得課程資料失敗'
    }
  } catch (err) {
    console.error('課程列表載入失敗:', err.response?.data || err)
    error.value = err.response?.data?.message || '伺服器錯誤，請稍後再試'
  } finally {
    loading.value = false
  }
}

function formatDateWithoutLib(isoString) {
  if (!isoString) return ''
  const datePart = isoString.slice(2, 10) // "2025-05-28" → "25-05-28"
  const timePart = isoString.slice(11, 16) // "22:00"
  return `${datePart} ${timePart}`
}
//

// ➊ 計算屬性：該教練的課程清單
const coachCourses = computed(() => {
  if (!selectedCoach.value) return []
  return courses.value.filter(
    c => c.instructor === selectedCoach.value.nickname
    // 如果沒有 coach_id，可以用暱稱比對：
    // c.instructor === selectedCoach.value.nickname
  )
})

// ➋ 再把原本的篩選條件套進去
const filteredCourses = computed(() => {
  return coachCourses.value.filter(c => {
    /* 你的分類 / 講師 / 狀態篩選條件原封不動搬進來 */
    // ------------------------------------------------
    const matchCategory =
      selectedCategory.value === '全部課程' ||
      c.category === selectedCategory.value

    const matchInstructor =
      selectedInstructor.value === '全部講師' ||
      c.instructor === selectedInstructor.value

    const statusLabel = c.is_active ? '上架中' : '待審核'
    const matchStatus =
      selectedStatus.value === '全部狀態' ||
      statusLabel === selectedStatus.value

    return matchCategory && matchInstructor && matchStatus
  })
})

function goToAdminCourse(courseId) {
  /* 若此按鈕是在教練詳細 Modal 裡，先把 Modal 關掉 */
  const modalEl = document.getElementById('detailModal')
  /* eslint-disable-next-line no-undef */
  bootstrap.Modal.getInstance(modalEl)?.hide()

  /* 方案 A：路徑參數 /admin/courses/:courseId */
  router.push({ name: 'AdminCourseDetail', params: { courseId } })

  /* 若你選的是 Query 寫法，就改成 ↓ 這行，並刪上面那行 */
  // router.push({ name: 'AdminCourses', query: { courseId } })
}

// 「點擊檢視」要開 modal

function openDetailModal(coachId) {
  // 先用列表現成資料顯示，使用者看不到閃動
  const row = allCoaches.value.find(c => c.coach_id === coachId)
  if (row) {
    selectedCoach.value = { ...row } // shallow copy 就好
    isVerified.value = row.coach_is_verified
  }

  // 之後再去拉 detail，把缺的欄位補齊
  fetchCoachDetail(coachId)

  // eslint-disable-next-line no-undef
  bootstrap.Modal.getOrCreateInstance(
    document.getElementById('detailModal')
  ).show()
}

// onMounted 先檢查管理者身分，通過才呼叫 fetchAllCoaches()
onMounted(async () => {
  const isAdmin = await checkAdmin()
  if (isAdmin) {
    await fetchAllCoaches()
    fetchCourses()
  }
})

// 以下為「篩選條件下拉及搜尋」的邏輯
// --------------------------------------------------

// 1. 技能下拉項目：從 coaches.value 裡蒐集所有技能名稱 (去重)
const skillOptions = computed(() => {
  let list = allCoaches.value
  if (selectedCoachName.value) {
    list = list.filter(coach => coach.coach_name === selectedCoachName.value)
  }

  if (selectedVerifyStatus.value !== '全部狀態') {
    const wantVerified = selectedVerifyStatus.value === '已審核'
    list = list.filter(c => isVerifiedRow(c) === wantVerified)
  }

  const set = new Set()
  list.forEach(coach => coach.coach_skills.forEach(s => set.add(s.skill_name)))
  return Array.from(set)
})

// 2. 教練下拉：先依 selectedSkill 過濾，再去重 coach_name
const coachOptions = computed(() => {
  let list = allCoaches.value
  if (selectedSkill.value) {
    list = list.filter(coach =>
      coach.coach_skills.some(s => s.skill_name === selectedSkill.value)
    )
  }
  if (selectedVerifyStatus.value !== '全部狀態') {
    const wantVerified = selectedVerifyStatus.value === '已審核'
    list = list.filter(c => isVerifiedRow(c) === wantVerified)
  }
  const set = new Set()
  list.forEach(c => set.add(c.coach_name))
  return Array.from(set)
})

watch([skillOptions, coachOptions, verifyStatusOptions], () => {
  if (
    selectedSkill.value &&
    !skillOptions.value.includes(selectedSkill.value)
  ) {
    selectedSkill.value = ''
  }
  if (
    selectedCoachName.value &&
    !coachOptions.value.includes(selectedCoachName.value)
  ) {
    selectedCoachName.value = ''
  }
  if (
    selectedVerifyStatus.value !== '全部狀態' &&
    !verifyStatusOptions.value.includes(selectedVerifyStatus.value)
  ) {
    selectedVerifyStatus.value = '全部狀態'
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
@media (max-width: 1024px) {
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
  border: 1px solid $primary-600;
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
.table-striped > tbody > tr:nth-of-type(odd) > td {
  background-color: $primary-000; /* 你想要的斑馬底色 */
}
textarea {
  resize: none;
}
/* AdminCourses.vue 或同級的 .scss 文件 */
textarea::placeholder {
  color: $grey-200;
  opacity: 1;
}
.table-responsive {
  overflow-x: auto;
}
@media (max-width: 900px) {
  .wide-table {
    min-width: 900px;
  }
}

.verify-switch {
  .form-check-input {
    /* 調整大小，和截圖差不多比例 */
    width: 46px;
    height: 24px;
    cursor: pointer;
    background-color: #ced7e6; /* 未勾選：灰藍 */
    border: none;

    /* 讓圓點看起來更明顯 */
    &::after {
      position: relative;
      top: -2px;
      left: -2px;
      width: 20px;
      height: 20px;
      background-color: #fff;
      border-radius: 50%;
      transition: transform 0.2s ease-in-out;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.15);
      content: '';
    }

    /* 已勾選：背景變藍，圓點往右滑 */
    &:checked {
      background-color: #aabddd; /* 你截圖中的淡藍色，可再微調 */

      &::after {
        transform: translateX(22px); /* 滑到右端 */
      }
    }

    /* 拿掉 Bootstrap 預設的 focus outline，改成柔和陰影 */
    &:focus {
      box-shadow: none;
      outline: none;
    }
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
.background-img {
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
.license-wrapper {
  align-items: flex-start;
}
.license-card {
  width: 200px;
  flex: 0 0 auto;
  border: 1px solid rgba(236, 239, 253, 1);
  border-radius: 8px;
  padding: 8px;
  background-color: rgba(252, 252, 252, 0.1);
  box-shadow: 0 0 5px 0 rgba(94, 142, 221, 1);
  transition: all 0.2s ease;
  @media (max-width: 992px) {
    width: 100%;
  }
}
.bankbook-card {
  border: 1px solid rgba(236, 239, 253, 1);
  border-radius: 8px;
  padding: 8px;
  background-color: rgba(252, 252, 252, 0.1);
  box-shadow: 0 0 5px 0 rgba(94, 142, 221, 1);
  transition: all 0.2s ease;
  @media (max-width: 992px) {
    width: 100%;
  }
}
.license-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 6px;
}
.previewable {
  cursor: zoom-in;
  transition: 0.2s;
}
.previewable:hover {
  opacity: 0.8;
}
.lic-name {
  padding: 8px;
  display: inline-block;
  width: 100%;
  min-height: 38px;
  line-height: 19px;
  overflow: hidden;
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
