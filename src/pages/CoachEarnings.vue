<template>
  <section class="max-w-6xl mx-auto px-4 py-6 space-y-8">
    <div class="card-wrapper"></div>
    <div class="card-content p-5 mb-5">
      <!-- 頂端控制列 -->
      <div class="d-flex flex-wrap align-items-end gap-3 mb-4">
        <!-- 課程選擇 -->
        <div class="dropdown">
          <button
            id="dropdownCourses"
            class="btn btn-primary-600 dropdown-toggle px-lg-3 px-1 fs-lg-8 fs-9"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {{ selectedCourseName }}
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownCourses">
            <li @click="selectCourse('all')">
              <a class="dropdown-item rounded-2" href="#">所有課程</a>
            </li>
            <li
              v-for="course in courseOptions"
              :key="course.id"
              @click="selectCourse(course.id, course.name)"
            >
              <a class="dropdown-item rounded-2" href="#">{{ course.name }}</a>
            </li>
          </ul>
        </div>
        <!-- 月份範圍選擇 -->
        <div class="dropdown">
          <button
            id="dropdownStartMonth"
            class="btn btn-primary-600 dropdown-toggle px-lg-3 px-1 fs-lg-8 fs-9 text-start"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            起始月份: {{ selectedMonth }}
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownStartMonth">
            <li
              v-for="month in monthOptions"
              :key="month"
              @click="selectMonth(month)"
            >
              <a class="dropdown-item rounded-2" href="#">{{ month }}</a>
            </li>
          </ul>
        </div>
        <!-- 查詢按鈕 -->
        <div>
          <button class="btn btn-primary" @click="submit">查詢</button>
        </div>
      </div>
      <!-- 雙欄:總覽+收益表格 -->
      <div class="row mb-lg-8 mb-6">
        <!-- 總覽 -->
        <div
          class="col-12 col-lg-6 flex align-items-center justify-content-center text-secondary text-primary-900"
        >
          <div>
            <p class="fs-6">總收益</p>
            <p class="fs-2 fw-bold">
              $
              {{
                summary.total_income ? summary.total_income.toLocaleString() : 0
              }}
            </p>
          </div>
          <div>
            <p class="fs-6">總觀看次數</p>
            <p class="fs-2 fw-bold">
              {{
                summary.total_views ? summary.total_views.toLocaleString() : 0
              }}
            </p>
          </div>
        </div>
        <!-- 收益表格 -->
        <div class="col-12 col-lg-6 align-items-center justify-content-center">
          <p class="text-lg font-semibold mb-2 fs-6">收益明細</p>
          <table class="w-full text-sm border">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-2">日期</th>
                <th class="p-2">金額</th>
                <th class="p-2">狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in revenueTable"
                :key="item.month"
                class="text-center border-t"
              >
                <td class="p-2">{{ item.month }}</td>
                <td class="p-2">${{ item.revenue }}</td>
                <td
                  class="p-2"
                  :class="
                    item.is_transfered === '未支付'
                      ? 'text-red-600'
                      : 'text-green-600'
                  "
                >
                  {{ item.is_transfered }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 雙欄:長條圖+圓餅圖 -->
      <div>
        <p class="fs-5 fw-semibold text-dark mb-4">觀看數據</p>
      </div>
      <div class="row mb-lg-8 mb-6 justify-content-center text-center">
        <!-- 長條圖 -->
        <div class="col-12 col-lg-6 d-flex flex-column align-items-start">
          <p class="fs-6 mb-2">各月份觀看次數</p>
          <div style="width: 100%" height:300px>
            <Bar
              v-if="
                barChartData &&
                barChartData.labels &&
                barChartData.labels.length > 0
              "
              :data="barChartData"
              :options="barChartOptions"
            ></Bar>
          </div>
        </div>
        <!-- 圓餅圖 -->
        <div class="col-12 col-lg-6 d-flex flex-column align-items-start">
          <p class="fs-6 mb-2">各月份占比</p>
          <div style="width: 100%; height: 300px">
            <Pie :data="pieChartData" :options="pieChartOptions"></Pie>
          </div>
        </div>
      </div>

      <!-- 各章觀看摺疊 -->
      <div>
        <p class="fs-6">指定課程各章節觀看紀錄</p>
        <template v-if="chapterReport.length > 0">
          <CoachEarningChapterAccordion :chapters="chapterReport" />
        </template>
        <template
          v-else-if="
            isSubmitted && !chapterReport.length && selectedCourse !== 'all'
          "
        >
          <p class="text-center mt-4">此課程近 3 個月無觀看紀錄</p>
        </template>
      </div>
    </div>
  </section>
</template>
<script setup>
// import axios from 'axios'
import { api } from '@/api'
import { ref, onMounted } from 'vue'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Pie, Bar } from 'vue-chartjs'

import CoachEarningChapterAccordion from '@/components/CoachEarningChapterAccordion.vue'

const selectedCourse = ref('all')
const selectedCourseName = ref('所有課程')

const courseOptions = ref([])
const monthOptions = ref([])
const summary = ref({})
const barChartData = ref({
  labels: [],
  datasets: []
})
const pieChartData = ref({
  labels: [],
  datasets: []
})
const chapterReport = ref([])
const revenueTable = ref([])
const fullCourseList = ref([]) // 儲存教練所有課程名稱

const isSubmitted = ref(false) // 儲存送出前的狀態，防止即使渲染

onMounted(async () => {
  await submit()
})

// 生成一年內月份
const today = new Date()

for (let i = 11; i >= 0; i--) {
  const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  monthOptions.value.push(`${year}-${month}`)
}
// 預設選取一年內最早月份
const selectedMonth = ref(monthOptions.value[0])
function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

// 轉換棒狀圖資料
function transformGroupedBarChartData(apiData) {
  if (!apiData || apiData.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }
  // 只取 >= selectedMonth資料
  const filtered = apiData.filter(item => item.month >= selectedMonth.value)

  const courseMap = new Map()
  const allMonths = new Set()

  filtered.forEach(item => {
    allMonths.add(item.month)
    if (!courseMap.has(item.course_id)) {
      courseMap.set(item.course_id, {
        label: item.name,
        dataMap: new Map(),
        color: getRandomColor()
      })
    }
    courseMap.get(item.course_id).dataMap.set(item.month, item.view_count)
  })
  const labels = Array.from(allMonths).sort() // 確保月份排序
  const datasets = Array.from(courseMap.values()).map(course => ({
    label: course.label,
    data: labels.map(month => course.dataMap.get(month) || 0),
    backgroundColor: course.color
  }))
  return { labels, datasets }
}

// 轉換圓餅圖
function transformPieChartData(apiData) {
  if (!apiData || apiData.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }
  const labels = apiData.map(item => item.month)
  const data = apiData.map(item => item.percentage)

  const backgroundColor = labels.map(() => getRandomColor())

  return {
    labels,
    datasets: [
      {
        label: '每月觀看次數占比',
        data,
        backgroundColor
      }
    ]
  }
}

function selectCourse(id, name = '所有課程') {
  selectedCourse.value = id
  selectedCourseName.value = id === 'all' ? '所有課程' : name
}

function selectMonth(month) {
  selectedMonth.value = month
}

// 查詢時觸發，後端統計從開始月份至今

// 此flag檢查是否初始化過fullCourseList 所儲存的課程清單
let isCourseListInitialized = false

async function submit() {
  // 每次查詢前重置
  pieChartData.value = { labels: [], datasets: [] }
  chapterReport.value = []

  const params = {}
  if (selectedCourse.value !== 'all') {
    params.courseId = selectedCourse.value
  }
  if (selectedMonth.value) {
    params.monthStart = selectedMonth.value
  }
  console.log('查詢參數')

  try {
    const token = localStorage.getItem('token')
    const { data } = await api.get('/api/v1/coaches/courses/analysis', {
      headers: { Authorization: `Bearer ${token}` },
      params
    })
    if (data.status) {
      const result = data.data
      // 儲存完整的課程清單，只做一次並保持完整資料
      if (!isCourseListInitialized && Array.isArray(result.coach.course_list)) {
        fullCourseList.value = [...result.coach.course_list]
        courseOptions.value = [...fullCourseList.value]
        isCourseListInitialized = true
      }

      summary.value = result.summary || {}

      if (
        result.view_stats.bar_chart &&
        result.view_stats.bar_chart.length > 0
      ) {
        barChartData.value = transformGroupedBarChartData(
          result.view_stats.bar_chart
        )
      } else {
        barChartData.value = null
      }
      pieChartData.value =
        transformPieChartData(result.view_stats.pie_chart) || []

      revenueTable.value = result.income_detail || []
      chapterReport.value = result.chapter_report || []
    }
  } catch (err) {
    console.error('查詢失敗', err)
  }
}

// 註冊chart.js元件
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale
)

const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: function (tooltipItem) {
          const label = tooltipItem.dataset.label || ''
          const value = tooltipItem.formattedValue
          return `${label}:${value}%`
        }
      }
    }
  }
}

const barChartOptions = {
  responsive: true,
  scales: {
    y: { beginAtZero: true }
  },
  plugins: {
    legend: { display: true },
    title: { display: false }
  }
}
</script>
<style scoped lang="scss">
table th,
table td {
  border: 1px solid #001f3f;
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
.card-content table td.text-red-600 {
  color: #dc2626; //讓table內不吃.card-content的color
}
.card-content table td.text-green-600 {
  color: #16a34a; //讓table內不吃.card-content的color
}
</style>
