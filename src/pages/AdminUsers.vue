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
              :class="{ active: route.path === '/admin/users' }"
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
          <h2 class="fs-lg-4 mb-lg-8 mb-6">會員管理</h2>

          <div class="d-flex flex-wrap gap-lg-6 gap-1 ms-1 ms-lg-6 mb-5">
            <!-- 選擇類別 -->
            <div class="dropdown">
              <button
                class="btn btn-primary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {{ selectedPlanLabel || '選擇方案' }}
              </button>
              <ul class="dropdown-menu">
                <!-- 「全部方案」(清空 selectedPlan) -->
                <li>
                  <a
                    href="#"
                    class="dropdown-item rounded-2"
                    @click.prevent="selectedPlan = ''"
                  >
                    全部方案
                  </a>
                </li>

                <!-- 動態產生其他三個方案 -->
                <li v-for="plan in planOptions" :key="plan.value">
                  <a
                    href="#"
                    class="dropdown-item rounded-2"
                    @click.prevent="selectedPlan = plan.value"
                  >
                    {{ plan.label }}
                  </a>
                </li>
              </ul>
            </div>

            <!-- 文字搜尋（教練名稱模糊搜尋） -->
            <div class="input-group" style="width: 200px; height: 42px">
              <input
                v-model="searchKeyword"
                type="text"
                class="form-control ps-2"
                placeholder="搜尋會員名稱..."
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
                  <th class="th-custom">會員編號</th>
                  <th class="th-custom">會員名稱</th>
                  <th class="th-custom">Email</th>
                  <th class="th-custom">註冊時間</th>
                  <th class="th-custom">目前方案</th>
                  <th class="th-custom">詳細資訊</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in paginatedUsers" :key="user.id">
                  <td class="td-custom">***{{ user.id.slice(-5) }}</td>
                  <td class="td-custom">{{ user.name }}</td>
                  <td class="td-custom">{{ user.email }}</td>
                  <td class="td-custom">{{ user.createdAt }}</td>
                  <td class="td-custom">
                    <template v-if="user.plan === 'Fitness方案'">
                      Fitness方案
                    </template>

                    <template v-else-if="user.plan === 'Wellness方案'">
                      Wellness方案
                    </template>

                    <template v-else-if="user.plan === 'Eagerness方案'">
                      Eagerness方案
                    </template>
                    <template v-else-if="user.plan === 'Eagerness方案-7天試用'">
                      試用方案
                    </template>
                    <template v-else>未訂閱</template>
                  </td>
                  <td class="td-custom">
                    <button
                      class="btn btn-sm btn-primary"
                      @click="openDetailModal(user)"
                    >
                      檢視
                    </button>
                    <!-- 如果需要刪除功能，可以另外寫 -->
                  </td>
                </tr>

                <tr v-if="paginatedUsers.length === 0">
                  <td colspan="5" class="text-center text-muted">
                    暫無會員資料
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination 控制列 -->
        <nav class="d-flex justify-content-center" style="padding-top: 4px">
          <ul class="pagination mb-0">
            <li
              class="page-item"
              :class="{ disabled: currentUserPage === 1 }"
              @click="changeUserPage(currentUserPage - 1)"
            >
              <a class="page-link me-lg-11 me-5"
                ><!-- 小於 lg 顯示圖示 -->
                <i class="bi bi-chevron-left d-inline d-lg-none"></i>
                <!-- lg 以上顯示文字 -->
                <span class="d-none d-lg-inline">上一頁</span></a
              >
            </li>
            <li
              v-for="page in totalUserPages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentUserPage }"
              @click="changeUserPage(page)"
            >
              <a class="page-link">{{ page }}</a>
            </li>
            <li
              class="page-item"
              :class="{ disabled: currentUserPage === totalUserPages }"
              @click="changeUserPage(currentUserPage + 1)"
            >
              <a class="page-link ms-lg-11 ms-5"
                ><i class="bi bi-chevron-right d-inline d-lg-none"></i>
                <span class="d-none d-lg-inline">下一頁</span></a
              >
            </li>
          </ul>
        </nav>

        <!-- 以下示範「檢視詳細」的 Modal 結構，可以照需求自行填入欄位 -->
        <div
          id="detailModal"
          class="modal fade"
          tabindex="-1"
          aria-labelledby="detailModalLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-xl">
            <div class="modal-content bg-primary-000 text-grey-700 p-5">
              <div class="modal-header border-grey-200">
                <h5 id="detailModalLabel" class="modal-title text-primary-900">
                  會員詳細資訊
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <div class="row d-flex flex-column-reverse flex-lg-row">
                  <!-- 左半：文字與課程資訊 (占 8/12) -->
                  <div class="col-lg-8 d-flex flex-column">
                    <div class="d-lg-flex">
                      <div
                        class="mb-3 d-flex flex-column gap-3 mobile-custom-60"
                      >
                        <div class="me-lg-4">
                          <strong>會員編號：<br class="d-xl-none" /></strong
                          ><span class="des-custom">{{
                            selectedUser?.id
                          }}</span>
                        </div>
                        <div class="me-lg-4">
                          <strong>會員名稱：</strong
                          ><span class="des-custom">{{
                            selectedUser?.name
                          }}</span>
                        </div>
                        <div class="me-lg-4">
                          <strong>Email：</strong
                          ><span class="des-custom">{{
                            selectedUser?.email
                          }}</span>
                        </div>
                        <div class="me-lg-4">
                          <strong>訂閱期間：</strong
                          ><span class="des-custom">{{
                            selectedUser?.period || '—'
                          }}</span>
                        </div>
                      </div>
                      <div
                        class="mb-lg-3 mb-5 d-flex flex-column gap-3 mobile-custom-40"
                      >
                        <div class="me-lg-4">
                          <strong>目前方案：</strong
                          ><span class="des-custom">{{
                            selectedUser?.plan || '未訂閱'
                          }}</span>
                        </div>

                        <div class="me-lg-4">
                          <strong>註冊時間：</strong
                          ><span class="des-custom">{{
                            selectedUser?.createdAt
                          }}</span>
                        </div>

                        <div class="me-lg-4">
                          <strong>所選課程：</strong
                          ><span class="des-custom">{{ displayCourses }}</span>
                        </div>
                        <div class="me-lg-4">
                          <strong>下次付款日：</strong
                          ><span class="des-custom">{{
                            selectedUser?.next_payment || '—'
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-lg-4 text-center">
                    <!-- 有頭像就顯示照片 -->
                    <img
                      v-if="selectedUser?.profile_image_url"
                      :src="selectedUser.profile_image_url"
                      alt="會員頭像"
                      class="rounded-circle mb-lg-0 mb-5"
                      style="width: 240px; height: 240px; object-fit: cover"
                    />

                    <!-- 沒圖片：顯示預設人像 + primary-600 底色 -->
                    <div
                      v-else
                      class="d-flex align-items-center justify-content-center rounded-circle bg-primary-500 mb-lg-0 mb-5 mx-auto"
                      style="width: 240px; height: 240px"
                      aria-label="預設頭像"
                    >
                      <i
                        class="bi bi-person-fill text-white"
                        style="font-size: 120px"
                      ></i>
                    </div>
                  </div>
                </div>
                <p class="fs-6 fw-bold">訂閱紀錄</p>
                <!-- 訂閱記錄表格 -->
                <div class="subscription-card">
                  <div class="card-wrapper"></div>
                  <div class="card-content p-5 mb-5">
                    <div class="table-responsive">
                      <table class="table table-striped mb-0 align-middle">
                        <thead class="">
                          <tr class="text-start">
                            <th class="th-custom">日期</th>
                            <th class="th-custom">訂單編號</th>
                            <th class="th-custom">付款內容</th>
                            <th class="th-custom">訂閱期間</th>
                            <th class="th-custom">付款方式</th>
                            <th class="th-custom">發票</th>
                            <th class="th-custom">金額</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="r in records" :key="r.id">
                            <td class="td-custom">{{ r.date }}</td>
                            <td class="td-custom">{{ r.orderNumber }}</td>
                            <td class="td-custom">{{ r.plan }}</td>
                            <td class="td-custom">{{ r.period }}</td>
                            <td class="td-custom">{{ r.paymentMethod }}</td>
                            <td class="td-custom">
                              <a
                                :href="r.invoiceUrl"
                                target="_blank"
                                class="text-decoration-none"
                              >
                                檢視
                              </a>
                            </td>
                            <td class="td-custom">NT$ {{ r.price }}</td>
                          </tr>
                          <tr v-if="records.length === 0">
                            <td colspan="7" class="text-center">無訂閱紀錄</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <!-- 切換頁數 -->
                <nav
                  class="d-flex justify-content-center"
                  style="padding-top: 4px"
                >
                  <ul class="pagination modal-pagination mb-0">
                    <li
                      class="page-item"
                      :class="{ disabled: currentModalPage === 1 }"
                      @click="changeModalPage(currentModalPage - 1)"
                    >
                      <a class="page-link me-lg-11 me-5 text-grey-700"
                        ><i class="bi bi-chevron-left d-inline d-lg-none"></i>
                        <!-- lg 以上顯示文字 -->
                        <span class="d-none d-lg-inline">上一頁</span></a
                      >
                    </li>
                    <li
                      v-for="page in totalModalPages"
                      :key="page"
                      class="page-item mx-2 text-primary-900;"
                      :class="{ active: page === currentModalPage }"
                      @click="changeModalPage(page)"
                    >
                      <a class="page-link">{{ page }}</a>
                    </li>
                    <li
                      class="page-item"
                      :class="{
                        disabled: currentModalPage === totalModalPages
                      }"
                      @click="changeModalPage(currentModalPage + 1)"
                    >
                      <a class="page-link ms-lg-11 ms-5 text-grey-700"
                        ><i class="bi bi-chevron-right d-inline d-lg-none"></i>
                        <span class="d-none d-lg-inline">下一頁</span></a
                      >
                    </li>
                  </ul>
                </nav>

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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// import axios from 'axios'
import { api } from '@/api'

const router = useRouter()
const route = useRoute()

const allUsers = ref([])

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

//  取當前「某一頁」的資料，只供拆分 pagination 之用

const users = ref([])
// 用來篩選的三個 ref
const selectedPlan = ref('') // 目前下拉選到哪個方案
const searchKeyword = ref('') // 文字搜尋會員名稱
const selectedUser = ref(null) // Modal 裡顯示的會員物件

watch([selectedPlan, searchKeyword], () => {
  fetchUsers(1)
})

// 下拉選單的四個選項
const planOptions = [
  { label: 'Fitness方案', value: 'Fitness方案' },
  { label: 'Wellness方案', value: 'Wellness方案' },
  { label: 'Eagerness方案', value: 'Eagerness方案' },
  { label: '試用方案', value: 'Eagerness方案-7天試用' }, // 顯示文字是「試用方案」
  { label: '未訂閱', value: '未訂閱' }
]

const selectedPlanLabel = computed(() => {
  const found = planOptions.find(p => p.value === selectedPlan.value)
  return found ? found.label : '選擇方案'
})

// 把後端資料抓下來
async function fetchUsers(page = 1) {
  try {
    const token = localStorage.getItem('token')
    if (!token) return router.replace('/login')
    const res = await api.get('/api/v1/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
      params: { page }
    })
    if (res.data.status) {
      // ← 直接把後端給的全部 data 放進 users
      users.value = res.data.data

      // 更新 pagination
      const p = res.data.pagination || res.data.meta?.pagination
      pagination.value = {
        page: p.page,
        total: p.total,
        total_pages: p.total_pages,
        has_next: p.has_next,
        has_previous: p.has_previous
      }
    } else {
      console.error('取得會員失敗：', res.data.message)
    }
  } catch (err) {
    console.error('fetchUsers error:', err)
  }
}

// 抓取所有頁
async function fetchUsersPage(page = 1) {
  const token = localStorage.getItem('token')
  const res = await api.get('/api/v1/admin/users', {
    headers: { Authorization: `Bearer ${token}` },
    params: { page }
  })
  return { data: res.data.data, pagination: res.data.pagination }
}

async function fetchAllUsers() {
  const first = await fetchUsersPage(1)
  allUsers.value = first.data
  pagination.value = {
    page: first.pagination.page,
    total_pages: first.pagination.total_pages
  }
  for (let p = 2; p <= first.pagination.total_pages; p++) {
    const { data } = await fetchUsersPage(p)
    allUsers.value.push(...data)
  }
}

const filtered = computed(() => {
  return allUsers.value.filter(u => {
    if (
      searchKeyword.value &&
      !u.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
      return false
    if (selectedPlan.value) {
      if (selectedPlan.value === '未訂閱') return !u.plan
      return u.plan === selectedPlan.value
    }
    return true
  })
})

const pageSize = 20

const pagination = ref({
  page: 1,
  total_pages: 1,
  has_next: false,
  has_previous: false
})

const currentPage = computed(() => pagination.value.page)
const totalPages = computed(() => pagination.value.total_pages)
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

// 由 pagination.value 計算出目前頁碼與總頁數
const currentUserPage = computed(() => pagination.value.page)
// 由 pagination.value 計算出目前課程頁碼與總頁數
const totalUserPages = computed(() => pagination.value.total_pages)

// 換頁
function changeUserPage(p) {
  if (p < 1 || p > totalPages.value) return
  pagination.value.page = p
}

// 載入用戶訂閱紀錄
// 用來存放訂閱紀錄列表
const records = ref([])
// 分页 meta
const subscriptionMeta = ref({ page: 1, total_pages: 1 })

// 把從後端拿到的 raw 欄位 mapping 成我們要的格式
async function fetchSubscriptions(userId, page = 1) {
  try {
    const token = localStorage.getItem('token')
    const res = await api.get(`/api/v1/admin/subscriptions/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page }
    })
    if (res.data.status) {
      records.value = res.data.data.map(item => ({
        id: item.id,
        date: item.purchased_at,
        orderNumber: item.order_number,
        plan: item.plan,
        period: item.period,
        paymentMethod: item.payment_method,
        invoiceUrl: item.invoice_image_url,
        price: item.price,
        nextPayment: item.next_payment
      }))
      subscriptionMeta.value = res.data.meta
    } else {
      console.error('取得訂閱失敗：', res.data.message)
      records.value = []
    }
  } catch (err) {
    console.error('fetchSubscriptions error:', err)
    records.value = []
  }
}

const currentModalPage = ref(1)
const totalModalPages = computed(() => subscriptionMeta.value.total_pages)

function changeModalPage(p) {
  if (p < 1 || p > totalModalPages.value) return
  currentModalPage.value = p
  if (selectedUser.value) {
    fetchSubscriptions(selectedUser.value.id, p)
  }
}

// 計算要顯示的「所選課程」
const displayCourses = computed(() => {
  if (!selectedUser.value) return ''

  const plan = selectedUser.value.plan || ''
  // 如果是 Eagerness 方案（含試用）
  if (plan.startsWith('Eagerness方案')) {
    return '所有課程'
  }
  // 否則如果 course_type 陣列有內容，就列出
  if (
    Array.isArray(selectedUser.value.course_type) &&
    selectedUser.value.course_type.length > 0
  ) {
    return selectedUser.value.course_type.join('、')
  }
  // 其餘都視為「未訂閱」
  return '未訂閱'
})

// onMounted 先檢查管理者身分，通過才呼叫 fetchAllCoaches()
onMounted(async () => {
  const isAdmin = await checkAdmin()
  if (!isAdmin) return
  await fetchAllUsers()
})

function openDetailModal(user) {
  selectedUser.value = user
  currentModalPage.value = 1
  fetchSubscriptions(user.id, 1)
  const modalEl = document.getElementById('detailModal')
  // eslint-disable-next-line no-undef
  new bootstrap.Modal(modalEl).show()
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

// modal Page
.modal-pagination .page-link {
  cursor: pointer;
  background-color: transparent;
  border: none;
  color: $grey-700;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(48, 79, 254, 0.1);
  }
}
.modal-pagination .page-item.active .page-link {
  background-color: $primary-700;
  color: $primary-100;
}

.modal-pagination .page-item.disabled .page-link {
  opacity: 0.4;
  cursor: not-allowed;
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
  border: 1px solid $primary-600;
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
