<template>
  <div class="position-relative swiper-wrapper-with-nav">
    <swiper
      slides-per-view="3"
      space-between="40"
      :navigation="{
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      }"
      :pagination="{ el: '.custom-pagination', clickable: true }"
      :breakpoints="{
        0: {
          slidesPerView: 1,
          spaceBetween: 32
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 35
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 40
        }
      }"
      :modules="[Navigation, Pagination]"
      class="mySwiper"
    >
      <swiper-slide v-for="course in courses" :key="course.course_id">
        <div class="course-col">
          <div class="card course-card position-relative">
            <span class="badge fs-9 text-grey-700 position-absolute">
              {{ course.category }}
            </span>
            <div class="course-img-wrapper position-relative mb-5">
              <img
                :src="course.imgUrl || defaultCourseImg"
                :alt="course.title"
                class="course-img rounded"
                @error="e => (e.target.src = defaultCourseImg)"
              />
            </div>
            <div class="card-body p-0">
              <h5 class="card-title fs-7 fw-bold mb-2">
                {{ course.title }}
              </h5>
              <div class="d-flex mb-2">
                <p class="fs-7 mb-0">{{ course.instructor.name }}</p>
                <span class="fs-7 px-2 mb-0">|</span>
                <p class="fs-7 mb-0">{{ course.instructor.title }}</p>
              </div>
              <div class="d-flex justify-content-between mb-lg-3 mb-2">
                <div class="icon-custom">
                  <i class="bi bi-star-fill text-secondary-600 me-1 fs-6"></i>
                  <p class="fs-8">{{ course.rating }}</p>
                </div>
                <div class="icon-custom">
                  <i class="bi bi-person me-1 text-secondary-600 fs-6"></i>
                  <p class="fs-8">{{ course.students }} 瀏覽</p>
                </div>
                <div class="icon-custom">
                  <i class="bi bi-clock me-1 text-secondary-600 fs-6"></i>
                  <p class="fs-8">{{ course.duration }} 小時</p>
                </div>
              </div>
              <p class="card-text mb-2">
                {{ course.description }}
              </p>
              <div class="card-link text-center py-1">
                <router-link
                  :to="{
                    name: 'CourseDetails',
                    params: { courseId: course.course_id }
                  }"
                  class="text-grey-000 text-decoration-none stretched-link"
                >
                  查看更多
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </swiper-slide>
      <div class="custom-pagination my-8"></div>
    </swiper>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import { useRoute } from 'vue-router'
// import axios from 'axios'
import { api } from '@/api'
import defaultCourseImg from '@/assets/images/weight-command.png'

const route = useRoute()
const coachId = route.params.coachId
const courses = ref([])

let swiperInstance = null

onMounted(() => {
  // Swiper DOM 完成後再抓到實例
  swiperInstance = document.querySelector('.mySwiper')?.swiper

  const handleResize = () => {
    swiperInstance?.update()
  }

  window.addEventListener('resize', handleResize)

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
  })
})

const fetchCourses = async () => {
  try {
    const res = await api.get(`/api/v1/courses/${coachId}`)
    courses.value = res.data.data.map(item => ({
      course_id: item.course_id,
      title: item.course_name,
      category: item.course_type,
      rating: item.course_score,
      students: item.numbers_of_view,
      duration: item.total_hours,
      instructor: {
        name: item.coach_name,
        title: item.coach_title
      },
      imgUrl: item.course_image_url,
      description: item.course_description
    }))
  } catch (error) {
    console.error('推薦課程載入失敗', error)
  }
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped lang="scss">
/* 波浪圖樣式 */

/* 卡片發光風格 */
.course-card {
  min-height: 550px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #eceffd;
  box-shadow: 0 0 5px rgba(94, 142, 221, 1);
  background-color: rgba(255, 255, 255, 0.1);
}
.plus-icon {
  position: absolute;
  font-size: 1.6rem;
  color: #0d6efd;
  text-shadow:
    0 0 28px #005ca4,
    0 0 10.8px #005ca4;
}
.plus-icon.top.start {
  top: -45px;
  left: -25px;
}
.plus-icon.bottom.end {
  bottom: -45px;
  right: -25px;
}
.badge {
  border: 1px solid $primary-400;
  background-color: $primary-100;
  color: $grey-700;
  border-radius: 100px;
  line-height: 1.5;
  z-index: 1;
  padding: 4px 8px;
  top: 36px;
  left: 36px;
}

//swiper樣式

.mySwiper {
  padding: 0; // 🔥 padding 交由箭頭來控制位置
  position: relative; // 為絕對定位的箭頭提供定位基準
  padding: 12px;

  overflow: hidden;
}

.swiper-slide {
  display: flex; // 可選，保持 coach-col 卡片撐滿
  justify-content: center;
  overflow: visible;
}
.course-col {
  width: 100%; // 滿版佔據 swiper-slide 空間
  max-width: none; // 不限制最大寬度
}

.course-img-wrapper {
  width: 100%;
  height: 240px;
  position: relative;
  overflow: visible;
}

.course-img {
  width: 100%;
  height: 330px;
  max-height: 100%;
  object-fit: cover;
}

/* 箭頭按鈕細框 + 高層級，不再被裁切 */

::v-deep(.custom-pagination) {
  display: flex;
  justify-content: center;
  gap: 24px;

  .swiper-pagination-bullet {
    width: 12px;
    height: 12px;
    background: #d2d2d2;
    opacity: 1;
    border-radius: 50%;
    transition: background-color 0.3s;
  }

  .swiper-pagination-bullet-active {
    background: #e7ff37;
  }
}
::v-deep(.swiper-button-prev),
::v-deep(.swiper-button-next) {
  position: absolute;
  transform: translateY(-80%);
  z-index: 20;
  width: 48px;
  height: 48px;
  font-size: 16px;
  color: $primary-100;
  border-radius: 8px;
  border: 2px solid #a8a8a8;
  top: 50%;
}
::v-deep(.swiper-button-prev) {
  left: 0;
}
::v-deep(.swiper-button-next) {
  right: 0;
}
.swiper-button-prev::after,
.swiper-button-next::after {
  display: none; // 隱藏原生箭頭
}
.swiper-wrapper-with-nav {
  position: relative;
  // overflow-x: hidden; //  防止箭頭超出畫面導致 X 軸
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
.card-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  height: 72px;
}
</style>
