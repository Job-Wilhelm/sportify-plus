<!-- 管理員後台報表 -->
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
        <!-- 報表名稱與圖表區間 -->
        <div class="card-wrapper"></div>
        <div class="card-content p-5 mb-5">
          <div>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h3 class="m-0">平台儀表板</h3>
              <div class="d-flex align-items-end gap-2">
                <div class="d-flex flex-column">
                  <label class="form-label m-0">開始月份</label>
                  <input
                    v-model="startMonth"
                    type="month"
                    class="month-picker form-control form-control-sm"
                  />
                </div>
                <div class="d-flex flex-column">
                  <label class="form-label m-0">結束月份</label>
                  <input
                    v-model="endMonth"
                    type="month"
                    class="month-picker form-control form-control-sm"
                  />
                </div>
                <button class="btn btn-primary btn-sm" @click="loadReportData">
                  查詢
                </button>
              </div>

              <!-- 選擇起始月份與結束月份 -->
            </div>
            <div>
              <!-- 數據三欄三張卡片 -->
              <div class="row gap-2 mb-4 justify-content-space-around">
                <div class="summary-card col mb-3">
                  <h6>總收入</h6>
                  <p>總計: {{ totalIncome }}</p>
                  <p>本月: {{ currentMonthIncome }}</p>
                </div>
                <div class="summary-card col mb-3">
                  <h6>活躍會員數</h6>
                  <p>訂閱總數: {{ totalMembers }}</p>
                  <p>本月新增: {{ newMembersThisMonth }}</p>
                </div>
                <div class="summary-card col mb-3">
                  <h6>教練與課程數</h6>
                  <p>教練總數: {{ totalCoaches }}</p>
                  <p>課程總數: {{ totalCourses }}</p>
                </div>
              </div>
              <!-- 圖表兩欄 -->
              <div class="row col-12 mb-4 align-items-start">
                <div class="col-12 col-md-4 mb-3">
                  <h5>訂閱方案人數比例圖</h5>
                  <Pie
                    v-if="
                      subscriptionPieData &&
                      subscriptionPieData.labels &&
                      subscriptionPieData.labels.length > 0
                    "
                    :data="subscriptionPieData"
                    :options="pieChartOptions"
                  ></Pie>
                </div>
                <div class="col-12 col-md-8 mb-3">
                  <h5>訂閱運動種類人數一覽</h5>
                  <Bar
                    v-if="
                      sportsTypeData &&
                      sportsTypeData.labels &&
                      sportsTypeData.labels.length > 0
                    "
                    :data="sportsTypeData"
                    :options="barChartOptions"
                  ></Bar>
                </div>
              </div>
              <div
                class="one-column-chart-container row mb-4 align-items: center"
              >
                <h5>訂閱方案人數變化</h5>
                <Line
                  v-if="lineChartData"
                  :data="lineChartData"
                  :options="lineChartOptions"
                ></Line>
              </div>
              <div
                class="one-column-chart-container row mb-4 align-items: center"
              >
                <h5>教練分潤比例圖</h5>
                <Pie
                  v-if="
                    coachProfitData &&
                    coachProfitData.labels &&
                    coachProfitData.labels.length > 0
                  "
                  :data="coachProfitData"
                  :options="coachProfitPieChartOptions"
                ></Pie>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// import axios from 'axios'
import { api } from '@/api'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js'

import { Pie, Bar, Line } from 'vue-chartjs'
import dayjs from 'dayjs'

const route = useRoute()

// 註冊chart.js元件
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale
)

// 儲存api回傳資料

const totalIncome = ref(null)
const currentMonthIncome = ref(null)
const totalMembers = ref(null)
const newMembersThisMonth = ref(null)
const totalCoaches = ref(null)
const totalCourses = ref(null)
const lineChartData = ref(null)
const subscriptionPieData = ref([])
const sportsTypeData = ref([])
const coachProfitData = ref([])

// 設定月份

// 預設為前6個月到當月
const today = dayjs()
const sixMonthsAgo = today.subtract(6, 'month').startOf('month')

// 狀態
const startMonth = ref(sixMonthsAgo.format('YYYY-MM'))
const endMonth = ref(today.startOf('month').format('YYYY-MM'))

// 送出選取月份

// 取得後台報表資料
const loadReportData = async () => {
  if (!startMonth.value || !endMonth.value) {
    alert('請選擇起始月份與結束月份')
    return
  }
  const start = dayjs(startMonth.value)
  const end = dayjs(endMonth.value)

  if (start.isAfter(end)) {
    alert('開始月份不能晚於結束月份')
    return
  }

  const startString = start.format('YYYY-MM')
  const endString = end.format('YYYY-MM')

  console.log(`查詢從 ${startString} 到 ${endString}的報表`)

  try {
    const token = localStorage.getItem('token')
    const { data } = await api.get(`/api/v1/admin/data-analysis`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { startMonth: startString, endMonth: endString }
    })
    if (data.status) {
      const result = data.data
      totalIncome.value = result.totalIncome || 0
      currentMonthIncome.value = result.currentMonthIncome || 0
      totalMembers.value = result.totalMembers || 0
      newMembersThisMonth.value = result.newMembersThisMonth || 0
      totalCoaches.value = result.totalCoaches || 0
      totalCourses.value = result.totalCourses || 0
      subscriptionPieData.value = transformPieChartData(result.planCounts)
      sportsTypeData.value = convertToBarChartData(result.subscribeSports)
      lineChartData.value = transformLineChartData(
        result.subscriberByMonthOutput
      )
      coachProfitData.value = transformPieChartData(result.profitShare)
    }
  } catch (err) {
    console.error('讀取管理員報表資料失敗', err)
  }
}
onMounted(() => {
  loadReportData()
})

// 轉化圓餅圖資料
function transformPieChartData(apiData) {
  if (!apiData || apiData.length === 0) {
    return {
      labels: [],
      datasets: [
        {
          label: '',
          data: [],
          backgroundColor: []
        }
      ]
    }
  }
  let labels = []
  let data = []
  let label
  let amounts = []
  // 依照圓餅圖性質定義資料
  if ('plan' in apiData[0]) {
    // 訂閱方案pie
    labels = apiData.map(item => item.plan)
    data = apiData.map(item => item.proportion)
    label = '訂閱方案人數'
    amounts = apiData.map(item => item.amount)
  } else if ('share' in apiData[0]) {
    // 教練分潤pie
    labels = apiData.map(item => item.name)
    data = apiData.map(item => item.share)
    label = '教練分潤比例'
    amounts = apiData.map(item => item.amount)
  }
  const backgroundColors = labels.map(() => getRandomColor())
  return {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: backgroundColors,
        customAmounts: amounts
      }
    ]
  }
}

// 轉化線狀圖
function transformLineChartData(apiData) {
  if (!Array.isArray(apiData) || apiData.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }
  const labels = Object.keys(apiData[0].monthly)
  const datasets = apiData.map(item => ({
    label: item.name,
    data: labels.map(month => item.monthly[month] || 0), // 確保每個月都有數值
    borderColor: getRandomColor()
  }))

  return { labels, datasets }
}

// 轉化棒狀圖
function convertToBarChartData(apiData) {
  if (!Array.isArray(apiData) || apiData.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }
  const labels = apiData.map(item => item.name)
  const data = apiData.map(item => item.amount)
  const backgroundColors = labels.map(() => getRandomColor())
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors
      }
    ]
  }
}

// 圖表隨機顏色
function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

// 圖表options

const barChartOptions = {
  responsive: true,
  scales: {
    y: { beginAtZero: true }
  },
  plugins: { legend: { display: false }, title: { display: false } },
  text: '訂閱運動種類人數一覽'
}
// 訂閱人數比例的圓餅圖options
const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: function (tooltipItem) {
          const dataset = tooltipItem.dataset // 取得對應data物件
          const index = tooltipItem.dataIndex // 取得資料索引
          const value = dataset.data[index]
          const amount = dataset.customAmounts
            ? dataset.customAmounts[index]
            : 0
          return `${tooltipItem.label}: ${value}% / ${amount}人`
        }
      }
    }
  }
}

// 教練分潤比例的圓餅圖options
const coachProfitPieChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        // 設定hover時會顯示的資訊
        label: function (tooltipItem) {
          const dataset = tooltipItem.dataset // 取得對應data物件
          const index = tooltipItem.dataIndex // 取得資料索引
          const value = dataset.data[index]
          const amount = dataset.customAmounts
            ? dataset.customAmounts[index]
            : 0
          return `${tooltipItem.label}: ${value}% / NT$${amount.toLocaleString()}`
        }
      }
    }
  }
}

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false, // 圖表填滿容器高度
  scales: {
    x: { title: { display: true, text: '月份' } },
    y: {
      beginAtZero: true,
      title: { display: true, text: '訂閱人數', rotation: 90 }
    }
  },
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: false
    },
    tooltip: {
      mode: 'index', // hover時顯示x軸對應所有dataset
      intersect: false
    },
    Interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }
}
</script>

<style scoped lang="scss">
h6 {
  padding-top: 1rem;
  margin-bottom: 1rem;
}
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

.card-wrapper {
  background-color: $primary-600;
  border-radius: 15px 15px 0 0;
  height: 50px;
}
.card-content {
  border-radius: 15px;
  background-color: $grey-000;
  border: 1px solid $primary-600;
  margin-top: -38px;
  padding: 24px;
  color: black;
}
.one-column-chart-container {
  max-width: 600px;
  height: 450px;
  margin: 0 auto;
  padding: 1rem;
}
.month-picker {
  background-color: $grey-000;
  color: black;
}
.summary-card {
  border-radius: 10px;
  border: 1px solid $grey-400;
  background-color: $primary-000;
}
</style>
