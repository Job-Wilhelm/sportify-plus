<template>
  <div class="container">
    <div class="d-flex">
      <!-- 左側選單 -->
      <div class="side-nav d-xl-block d-none">
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
      <!-- 外框顏色 -->
      <div class="p-lg-8 px-2 py-8 w-100" style="max-width: 1056px">
        <h2 class="fs-lg-4 mb-lg-8 mb-6">訂閱紀錄</h2>
        <p class="fs-6">目前方案</p>
        <div class="subscription-card">
          <div class="card-wrapper"></div>
          <div
            v-if="currentValidPlan"
            class="card-content p-5 d-lg-flex gap-12 mb-5"
          >
            <div class="mb-lg-0 mb-5">
              <p class="fs-4 fw-bold mb-lg-3 mb-1">
                {{ currentValidPlan.plan }}
              </p>
              <p
                v-if="subscriptionStatus === 'active'"
                class="fs-7 mb-0 pe-lg-3 py-lg-1 mt-lg-7 mt-3"
              >
                下一次收費日期：{{ currentValidPlan.nextPayment }}
              </p>
              <p
                v-else-if="subscriptionStatus === 'trial-active'"
                class="fs-7 mb-0 mt-7"
              >
                試用期至：{{ currentValidPlan.endAt }}
              </p>

              <div v-else-if="subscriptionStatus === 'cancelled-but-valid'">
                <p class="fs-6 fw-bold mb-1">已取消訂閱</p>
                <p class="fs-7 mb-0">
                  剩餘觀看期限至：{{ currentValidPlan.endAt }}
                </p>
              </div>
            </div>
            <div class="mb-lg-0 mb-5 ms-lg-9">
              <p class="fs-4 fw-bold mb-lg-6">可觀看類別</p>
              <p
                v-if="
                  courseType.length > 3 || subscriptionStatus === 'trial-active'
                "
                class="btn btn-primary-600 me-2"
                @click="$router.push('/user/courses')"
              >
                所有
              </p>
              <div v-else class="d-flex">
                <p
                  v-for="type in courseType"
                  :key="type.skill_id"
                  class="btn btn-primary-600 me-2"
                  @click="$router.push('/user/courses')"
                >
                  {{ type.course_type }}
                </p>
              </div>
            </div>
            <div class="mb-lg-0 mb-5 ms-lg-10">
              <p class="fs-4 fw-bold mb-lg-6">
                NT$ {{ currentValidPlan.price }}
              </p>
              <button
                v-if="subscriptionStatus === 'active'"
                class="btn btn-notification fw-bold"
                @click="unsubscribe(currentValidPlan.tradeNo)"
              >
                取消訂閱
              </button>
              <router-link
                v-else-if="subscriptionStatus === 'trial-active'"
                to="/users/subscription"
                class="btn btn-primary-600 fw-bold text-decoration-none"
              >
                升等方案
              </router-link>
              <router-link
                v-else-if="subscriptionStatus === 'cancelled-but-valid'"
                to="/users/subscription"
                class="btn btn-primary-600 fw-bold text-decoration-none"
              >
                重新訂閱
              </router-link>
            </div>
          </div>
          <div v-else class="card-content p-5 text-center mb-5">
            <div class="py-5">
              <h4 class="mb-4">
                <span v-if="records.length > 0">目前沒有訂閱方案</span>
                <span v-else>尚未訂閱任何方案</span>
              </h4>
              <p class="mb-4">
                <span v-if="records.length > 0"
                  >您的訂閱已到期，請重新訂閱以繼續享受服務！</span
                >
                <span v-else>馬上開始您的旅程，探索豐富的課程內容！</span>
              </p>
              <router-link
                to="/users/subscription"
                class="btn btn-primary-600 btn-lg px-5 py-3 text-decoration-none"
              >
                <span v-if="records.length > 0">我要續訂</span>
                <span v-else>馬上訂閱</span>
              </router-link>
            </div>
          </div>
          <p class="fs-6">訂閱紀錄</p>
          <div class="subscription-card">
            <div class="card-wrapper"></div>
            <div class="card-content p-5 mb-5">
              <div v-if="records.length > 0" class="table-responsive">
                <table class="table table-striped mb-0 align-middle">
                  <thead>
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
                    <tr
                      v-for="item in records"
                      :key="item.id"
                      class="text-center"
                    >
                      <td class="td-custom">{{ item.date }}</td>
                      <td class="td-custom">{{ item.orderNumber }}</td>
                      <td class="td-custom">{{ item.plan }}</td>
                      <td class="td-custom">{{ item.period }}</td>
                      <td class="td-custom">{{ item.paymentMethod }}</td>
                      <td class="td-custom">
                        <a
                          v-if="item.invoiceUrl"
                          :href="item.invoiceUrl"
                          target="_blank"
                          class="text-decoration-none"
                        >
                          檢視
                        </a>
                        <span v-else>無</span>
                      </td>
                      <td class="td-custom">NT$ {{ item.price }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-center py-4">
                <p class="text-muted mb-0">尚無已付款的訂閱記錄</p>
              </div>
            </div>
          </div>
          <!-- 分頁（若需要） v-if="meta.total_pages > 1" -->
          <div class="mt-11">
            <nav class="d-flex justify-content-center" style="padding-top: 4px">
              <ul class="pagination mb-0">
                <li
                  class="page-item"
                  :class="{ disabled: currentPage === 1 }"
                  @click.prevent="changePage(currentPage - 1)"
                >
                  <a class="page-link me-lg-11"
                    ><i class="bi bi-chevron-left d-inline d-lg-none"></i>
                    <span class="d-none d-lg-inline">上一頁</span></a
                  >
                </li>

                <li
                  v-for="page in totalPages"
                  :key="page"
                  class="page-item mx-2"
                  :class="{ active: page === currentPage }"
                  @click.prevent="changePage(page)"
                >
                  <a class="page-link">{{ page }}</a>
                </li>

                <li
                  class="page-item"
                  :class="{ disabled: currentPage === totalPages }"
                  @click="changePage(currentPage + 1)"
                >
                  <a class="page-link ms-lg-11"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
// import axios from 'axios'
import { api } from '@/api'
import { initUser } from '@/store/user'
import { cancelPayment } from '@/api/cancelPayment'

const route = useRoute()

// 1. 資料列表
const records = ref([])
// 2. 後端 meta
const meta = ref({ page: 1, total_pages: 1 })
// 3. 本地 currentPage（用來綁 UI）
const currentPage = ref(1)
// 4. 計算 totalPages
const totalPages = computed(() => meta.value.total_pages)
// 存放課程類別
const courseType = ref([])

const cachedValidPlan = ref(null) // 取第一筆資料

// 封裝成函式，之後可重複用
function findValidPlan(list) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    list.find(r => {
      const isPaid = r.isPaid ?? r.is_paid
      const endAt = r.endAt ?? r.end_at
      if (!isPaid || !endAt) return false

      const endDate = new Date(endAt)
      endDate.setHours(23, 59, 59, 999)
      return endDate >= today
    }) || null
  )
}

// 5. 抓資料
async function fetchSubscriptions(page = 1) {
  const token = localStorage.getItem('token')
  const userWrapper = JSON.parse(localStorage.getItem('user'))
  const userId = userWrapper?.data?.id || userWrapper?.id
  if (!token || !userId) return route.push('/login')

  try {
    const res = await api.get('/api/v1/users/subscriptions', {
      headers: { Authorization: `Bearer ${token}` },
      params: { page }
    })

    if (res.data.status) {
      const raw = res.data.data
      // 先濾出已付款的記錄
      const paidRecords = res.data.data.filter(item => item.is_paid === true)
      console.log('已付款記錄:', paidRecords)
      // 你要的欄位映射
      records.value = raw.map(item => ({
        id: item.id,
        date: item.created_at,
        orderNumber: item.order_number,
        plan: item.plan,
        period: item.period,
        paymentMethod: item.payment_method || '免費試用',
        invoiceUrl: item.invoice_image_url,
        price: item.price,
        nextPayment: item.next_payment,
        endAt: item.end_at,
        tradeNo: item.merchant_trade_no,
        isRenewal: item.is_renewal,
        isPaid: item.is_paid
      }))
      //  只在第一頁時，嘗試更新 cachedValidPlan
      if (page === 1 && !cachedValidPlan.value) {
        const rawValid = findValidPlan(raw)
        cachedValidPlan.value = rawValid ? mapRecord(rawValid) : null
      }
      records.value = raw.map(mapRecord)
      // 更新後端回傳的 meta
      meta.value = res.data.meta
      // 同步本地 currentPage
      currentPage.value = res.data.meta.page
    }
    console.log(records.value)

    if (records.value.length > 0 && records.value[0].plan?.includes('試用')) {
      courseType.value = []
    } else {
      // 呼叫取得課程類別API並存放
      courseType.value = await getCourseType(token)
    }
  } catch (err) {
    console.error('取得訂閱紀錄失敗：', err.response?.data || err)
  }
}

const currentValidPlan = computed(() => cachedValidPlan.value)

// 計算目前訂閱狀態
const subscriptionStatus = computed(() => {
  const currentPlan = currentValidPlan.value

  if (!currentPlan) {
    return 'no-subscription'
  }

  const isTrialPlan = currentPlan.plan?.includes('試用')

  console.log('狀態判定:', {
    plan: currentPlan.plan,
    isTrialPlan,
    isRenewal: currentPlan.isRenewal,
    endAt: currentPlan.endAt,
    isPaid: currentPlan.isPaid
  })

  // 試用期判定
  if (isTrialPlan) {
    return 'trial-active' // 因為已經確認未到期，所以是有效試用期
  }

  // 一般訂閱判定
  if (currentPlan.isRenewal) {
    return 'active' // 訂閱中（自動續訂）
  } else {
    return 'cancelled-but-valid' // 已取消但還在有效期內
  }
})

// 取得可觀看課程類別API
async function getCourseType(token) {
  try {
    const res = await api.get('/api/v1/users/course-type', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return res.data.data
  } catch (error) {
    console.error('取得課程類別失敗:', error)
  }
}

// 6. 切頁函式
function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  fetchSubscriptions(page)
}

// 7. 初始呼叫
onMounted(async () => {
  await initUser()
  fetchSubscriptions(1)
})

function mapRecord(item) {
  const paid = item.is_paid
  return {
    id: item.id,
    date: item.created_at,
    orderNumber: item.order_number,
    plan: item.plan,
    period: item.period,
    paymentMethod: paid ? item.payment_method || '免費試用' : '付款失敗',
    invoiceUrl: item.invoice_image_url,
    price: item.price,
    nextPayment: item.next_payment,
    endAt: item.end_at,
    tradeNo: item.merchant_trade_no,
    isRenewal: item.is_renewal,
    isPaid: item.is_paid
  }
}

async function unsubscribe(MerchantTradeNo) {
  try {
    const token = localStorage.getItem('token')

    const confirmed = confirm(
      '確定要取消訂閱嗎？\n取消後將在當前訂閱期結束後停止自動續訂。'
    )
    if (!confirmed) return

    await cancelPayment(token, MerchantTradeNo)

    await fetchSubscriptions(currentPage.value)
    alert('訂閱已成功取消\n您可以繼續使用服務至當前訂閱期結束')
  } catch (error) {
    console.error('取消訂閱失敗:', error)
    alert('取消訂閱失敗，請稍後再試')
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
}
.td-custom {
  color: $primary-900;
  background: $primary-000;
  font-size: 14px;
}
.th-custom,
.td-custom {
  white-space: nowrap;
}
.table-striped > tbody > tr:nth-of-type(odd) > td {
  background-color: $primary-000; /* 你想要的斑馬底色 */
}
</style>
