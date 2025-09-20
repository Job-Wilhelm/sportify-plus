<template>
  <div class="detail-carousel-wrapper py-lg-10 py-8">
    <div class="detail-carousel-container-outer mb-lg-5 px-lg-0 px-5">
      <div class="container detail-carousel-container px-0">
        <swiper
          :modules="[Navigation, Pagination]"
          :slides-per-view="1"
          :space-between="500"
          navigation
          :pagination="{ el: '.custom-pagination', clickable: true }"
          class="detail-swiper"
          style="background-color: rgba(255, 255, 255, 0.1)"
          @swiper="onSwiper"
        >
          <swiper-slide v-for="(item, index) in slides" :key="index">
            <div
              class="detail-slide d-lg-flex flex-column flex-lg-row justify-content-between p-lg-8 p-0"
            >
              <div class="text-block mb-8 mb-lg-0 h-100">
                <h2 class="detail-title fw-bold mb-lg-2 fs-3">
                  {{ item.title }}
                </h2>
                <p class="detail-desc text-primary-000 mb-5">
                  {{ item.description }}
                </p>
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="`${item.title} 小圖`"
                  class="rounded w-100 d-block object-fit-cover"
                />
              </div>

              <div class="media-block position-relative">
                <HlsPlayer
                  v-if="item.showPlayer && item.videoSrc"
                  :src="item.videoSrc"
                  :poster="item.videoCover"
                  mode="preview"
                  style="height: 600px; max-height: 100%"
                />
                <img
                  v-else
                  :src="item.videoCover"
                  class="video-cover rounded"
                />
                <div
                  v-if="!item.showPlayer"
                  class="play-icon position-absolute"
                  @click.stop="playThis(item)"
                >
                  <i class="bi bi-play-circle-fill"></i>
                </div>
              </div>
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </div>

    <div class="custom-pagination my-lg-8" style="height: 12px"></div>
    <div class="text-center" style="margin-top: 56px">
      <button class="btn btn-primary-600 px-lg-5 py-lg-3 fs-lg-6">
        <router-link to="/users/subscription" class="text-primary-000">
          我要體驗
        </router-link>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HlsPlayer from '@/components/HlsPlayer.vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
// import axios from 'axios'
import { api } from '@/api'

async function getPlayUrlBySkill(skill) {
  if (!skill) return ''

  const { data } = await api.get('/api/v1/courses/get-play-url', {
    params: { skill }
  })

  if (!data.status) throw new Error(data.message || 'API error')

  if (data.data === null) {
    console.warn(`[get-play-url] 「${skill}」沒有播放 ID`)
    return ''
  }

  return data.data
}

onMounted(async () => {
  await Promise.all(
    slides.value.map(async item => {
      try {
        item.videoSrc = await getPlayUrlBySkill(item.skill)
      } catch (e) {
        console.error(`取得 ${item.skill} 影片失敗`, e)
      }
    })
  )
})

function playThis(item) {
  if (!item.videoSrc) return
  item.showPlayer = true
}

const slides = ref([
  {
    skill: '皮拉提斯',
    title: '皮拉提斯',
    description:
      '皮拉提斯是一種結合核心訓練、身體控制與呼吸技巧的運動，能有效強化深層肌群，改善體態與動作協調。不僅有助於提升肌力、柔軟度與平衡感，也能舒緩壓力與疼痛，預防運動傷害。透過皮拉提斯，你能重新覺察身體，打造穩定而健康的體態。',
    image: new URL('@/assets/images/yoga.png', import.meta.url).href,
    videoCover: new URL('@/assets/images/video1.png', import.meta.url).href,
    videoSrc: '',
    showPlayer: false
  },
  {
    skill: '登山',
    title: '登山',
    description:
      '登山是一項結合耐力、體能與自然探索的戶外運動,能有效提升心肺功能與肌耐力，同時幫助你紓解壓力、提升身心健康。透過登山,你能與大自然緊密連結,培養專注力與意志力，並在挑戰過程中收穫自信與滿足感。',
    image: new URL('@/assets/images/about-video2.png', import.meta.url).href,
    videoCover: new URL('@/assets/images/video2.png', import.meta.url).href,
    videoSrc: '',
    showPlayer: false
  },
  {
    skill: '羽球',
    title: '羽球',
    description:
      '羽毛球是一項兼具速度、技巧與策略性的運動, Sportify+提供專業且系統化的羽毛球課程,從基礎握拍、步法練習到戰術策略,讓初學者或進階選手都能循序漸進地精進球技。跟著資深教練一起練習,輕鬆掌握羽毛球運動的精髓。',
    image: new URL('@/assets/images/about-video3.png', import.meta.url).href,
    videoCover: new URL('@/assets/images/video3.png', import.meta.url).href,
    videoSrc: '',
    showPlayer: false
  }
])

const onSwiper = swiper => {
  setTimeout(() => {
    swiper.params.pagination.el = '.custom-pagination'
    swiper.pagination.init()
    swiper.pagination.render()
    swiper.pagination.update()
  })
}
</script>

<style scoped lang="scss">
/* 保持箭頭外露，但隱藏多餘 slide */
::v-deep(.swiper-slide) {
  width: 100%;
  flex-shrink: 0;
  overflow: hidden;

  box-sizing: border-box;
}

/* 箭頭按鈕細框 + 高層級，不再被裁切 */
::v-deep(.swiper-button-prev),
::v-deep(.swiper-button-next) {
  border-radius: 8px;
  border: 2px solid #a8a8a8;
  color: $primary-100;
  width: 48px;
  height: 48px;
  font-size: 16px;
  z-index: 20;
  top: 50%;
  transform: translateY(-50%);
}
::v-deep(.swiper-button-prev) {
  left: -100px;
}
::v-deep(.swiper-button-next) {
  right: -100px;
}

::v-deep(.swiper-button-prev::after),
::v-deep(.swiper-button-next::after) {
  font-size: 16px; // 控制箭頭圖示大小
}

.detail-swiper,
.detail-swiper .text-block .small-image {
  height: auto;
  display: block;
}
/* 最多 800px 寬度，自動置中 */
.detail-swiper {
  width: 100%;
  max-width: 100%; // 不再設 max-width: 1296px
  margin: 0 auto;
}

/* 如果你想同時控制外框 neon 邊框的寬度，也可以這樣 */
.detail-carousel-container {
  max-width: 100%; /* 比 .detail-swiper 稍微寬一點，留出陰影 */
  padding: 0 16px;
  margin: 0 auto;
}

@import '@/assets/styles/all.scss';

.detail-carousel-container {
  position: relative;
  border: 2px solid #d9ff00;
  border: 2px solid #ffffff99 60%;
  border-radius: 12px;
  box-shadow:
    0 0 40px rgba(219, 255, 37, 0.5),
    0 0 12px rgba(219, 255, 37, 0.5);
  overflow: visible;
}

.detail-slide {
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;

  @media (min-width: 992px) {
    flex-wrap: nowrap;
  }

  .text-block {
    width: 100%;
    flex: 1;
    max-width: 352px;
    background-position: center;
    @media (min-width: 992px) {
      max-width: 352px;
      flex: 1;
    }
    @media (max-width: 992px) {
      max-width: 100%;
      width: 100%;
      padding: 0 24px;
      align-self: flex-start;
      padding: 24px;
      padding-bottom: 0;
    }
  }
}
.text-block img {
  width: 100%;
  height: 400px;
  max-width: 352px;

  @media (max-width: 992px) {
    max-width: 100%;
    height: 160px;
    object-fit: cover;
    object-position: top center; //
  }
}

.custom-pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  .swiper-pagination-bullet {
    width: 12px;
    height: 12px;
    background: #e1ff33;
    opacity: 1;
    border-radius: 50%;
    transition: background-color 0.3s;
  }

  .swiper-pagination-bullet-active {
    color: #e1ff33;
  }
}
.swiper-slide {
  overflow: visible;
}
.detail-carousel-wrapper {
  overflow-x: hidden;

  .detail-carousel-container-outer {
    position: relative;
    overflow: visible; // ✅ 允許陰影超出顯示
    max-width: 100%; // ❗ 不限制寬度
  }

  .detail-carousel-container {
    position: relative;
    border: 2px solid #d9ff00;
    border-radius: 12px;
    box-shadow:
      0 0 40px rgba(219, 255, 37, 0.5),
      0 0 12px rgba(219, 255, 37, 0.5);
    overflow: visible;
  }
}
::v-deep(.detail-swiper) {
  overflow: visible;
}
.media-block {
  width: 70%;
  max-width: 808px;
  height: 599px;
  position: relative;
  margin-bottom: 24px;

  @media (max-width: 992px) {
    width: 100%;
    height: 200px;
    padding: 0 24px;
  }

  .video-cover {
    max-width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(50%);
    border-radius: 12px;
  }

  .play-icon {
    cursor: pointer;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 48px;
    color: $primary-500;
    z-index: 2;
  }
}
.media-block img {
  max-width: 808px;
  width: 100%;
  max-height: 599px;
  height: 100%;
  @media (max-width: 992px) {
    width: 100%;
    height: 200px;
  }
}

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
</style>
