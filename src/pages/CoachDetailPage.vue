<template>
  <div class="container d-flex flex-column">
    <h2 class="fs-2 fw-bold">{{ coachInfo.nickname }}</h2>
    <div class="d-md-flex justify-content-between">
      <img
        :src="coachInfo.profile_image_url"
        alt="教練照片"
        class="coach-avatar"
      />
      <div class="info-card-about ms-md-5">
        <h3 class="mb-lg-8 mb-5 fs-5 fw-bold">關於我</h3>
        <p>
          {{ coachInfo.about_me }}
        </p>
      </div>
    </div>
    <div class="info-card">
      <h3 class="mb-8 fs-5 fw-bold">個人經歷</h3>
      <ul class="experience-list">
        <li
          v-for="(item, index) in experienceItems"
          :key="index"
          class="experience-item"
        >
          {{ item }}
        </li>
      </ul>
    </div>
    <div class="info-card">
      <h3 class="mb-8 fs-5 fw-bold">感興趣的事物</h3>
      <p>
        {{ coachInfo.hobby }}
      </p>
    </div>
    <div class="info-card">
      <h3 class="mb-8 fs-5 fw-bold">座右銘</h3>
      <p>
        {{ coachInfo.motto }}
      </p>
    </div>
  </div>
  <WaveBanner />
  <div class="container">
    <CoachCreatedCourse :coach-id="coachId" />
  </div>
</template>

<script setup>
// import axios from 'axios'
import { api } from '@/api'
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'

import WaveBanner from '@/components/WaveBanner.vue'
import CoachCreatedCourse from '@/components/CoachCreatedCourse.vue'

const route = useRoute()

const coachId = ref(route.params.coachId)
const coachInfo = ref({})

const experienceItems = computed(() => {
  if (!coachInfo.value.experience) return []
  return coachInfo.value.experience
    .split('\n')
    .map(item => item.trim())
    .filter(item => item.length > 0)
})

async function fetchCoachDetail(id) {
  try {
    const { data } = await api.get(`/api/v1/courses/coaches/${id}`)
    coachInfo.value = data.data // 依實際結構調整
  } catch (err) {
    console.error('讀取教練失敗', err)
  }
}

onMounted(() => fetchCoachDetail(coachId.value))

watch(
  () => route.params.coachId,
  newId => {
    if (newId) {
      coachId.value = newId
      fetchCoachDetail(newId)
    }
  }
)
</script>

<style scoped lang="scss">
h2,
h3,
p {
  margin-bottom: 0;
}

.container {
  max-width: 1296px;
  height: 100%;
  margin: 80px auto;
  padding: 16px;
  gap: 80px;
  @media (max-width: 992px) {
    padding: 0 24px;
    margin-top: 40px;
    margin-bottom: 40px;
    gap: 32px;
  }
}

.coach-avatar {
  width: 320px;
  height: 320px;
  object-fit: cover;
  border-radius: 8px;
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 32px;
    height: 200px;
  }
}
.info-card-about {
  background-color: rgba(255, 255, 255, 0.05);
  width: 896px;
  max-width: 100%;
  min-height: 200px;
  padding: 40px;
  border-radius: 16px;
  box-shadow: inset 0px 0px 0px 1px $primary-000;
  &:nth-of-type(1) {
    width: 896px;
  }
  @media (max-width: 992px) {
    padding: 24px;
  }
}
.info-card {
  background-color: rgba(255, 255, 255, 0.05);
  width: 100%;
  min-height: 200px;
  padding: 40px;
  border-radius: 16px;
  box-shadow: inset 0px 0px 0px 1px $primary-000;
  &:nth-of-type(1) {
    width: 896px;
  }
  @media (max-width: 992px) {
    padding: 24px;
  }
}

.experience-list {
  list-style: none;
  padding: 0;
  margin: 0;

  .experience-item {
    position: relative;
    padding-left: 20px;
    margin-bottom: 12px;
    line-height: 1.6;

    &:before {
      content: '•';
      color: $primary-600;
      font-weight: bold;
      position: absolute;
      left: 0;
      top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
