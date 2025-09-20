<!-- src/components/SubscriptionSelector.vue -->
<template>
  <section class="subscription-plans mt-lg-10 mt-7">
    <div class="container">
      <h4 v-if="userInfo?.hasTrial || !userInfo" class="text-center mb-5">
        就差一步，改變正要開始！
      </h4>
      <h2 class="text-center mb-lg-10 mb-7">
        {{
          userInfo?.hasTrial || !userInfo
            ? '我們的訂閱方案'
            : '選擇你的訂閱方案'
        }}
      </h2>

      <!-- 方案卡片 -->
      <div class="row gx-5 gy-4 px-2">
        <div v-for="plan in plans" :key="plan.key" class="col-lg-4">
          <div
            class="card h-100 rounded-4 border border-primary-000"
            :class="{
              'border-3 border-secondary-700': selectedPlan === plan.key
            }"
          >
            <div
              class="card-body p-4 d-flex flex-column"
              :class="[plan.bodyClass]"
            >
              <h5
                class="card-title mb-3 text-center fw-bold"
                :class="plan.titleClass"
              >
                {{ plan.name }} 方案
              </h5>
              <p class="card-text mb-4 plan-desc">
                {{ plan.description }}
              </p>
              <h2 class="fw-bold mb-4 text-center">
                {{ plan.price }}
                <small class="text-muted fs-6">/每月</small>
              </h2>
              <ul class="list-unstyled flex-grow-1 mb-4 text-center">
                <li v-for="(feat, i) in plan.features" :key="i" class="mb-2">
                  • {{ feat }}
                </li>
              </ul>
              <button
                v-if="showPlanUI"
                class="mt-auto btn btn-lg btn-primary"
                :class="plan.buttonClass"
                @click="selectPlan(plan.key)"
              >
                {{ plan.buttonText }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 目前選擇顯示 -->
      <div v-if="showPlanUI" class="text-center my-lg-12 my-7 fs-lg-4">
        您目前選擇
        <strong class="text-primary">
          {{ selectedPlanLabel }}
        </strong>
        <span v-if="!selectedPlan">(尚未選擇)</span>

        <template v-if="selectedPlan">
          <p v-if="limit === Infinity" class="text-danger">
            此方案不需要選擇運動類別
          </p>
          <p v-else-if="selectedCount < limit" class="text-danger">
            您需要選擇 {{ limit }} 種運動
          </p>
        </template>
      </div>

      <!-- 運動種類選擇 -->
      <div v-if="showPlanUI && selectedPlan && limit < Infinity" class="mt-5">
        <div class="row gx-4">
          <div
            v-for="group in groups"
            :key="group.title"
            class="col-md-6 mb-4 text-center"
          >
            <h5 class="fw-semibold mb-2">{{ group.title }}</h5>
            <div class="d-flex justify-content-center flex-wrap">
              <button
                v-for="item in group.items"
                :key="item.label"
                class="btn me-2 mb-2"
                :class="
                  isSelected(item.label)
                    ? 'btn-primary'
                    : 'btn-grey-500 text-black'
                "
                :disabled="!isSelected(item.label) && selectedCount >= limit"
                @click="toggle(item.label)"
              >
                <img
                  v-if="icons[item.iconName]"
                  :src="icons[item.iconName]"
                  class="me-1"
                  width="24"
                  height="24"
                />
                {{ item.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 送出按鈕 -->
      <div class="text-center mt-lg-10 mt-5">
        <button
          v-if="showTrialBtn"
          class="btn btn-success btn-lg"
          @click="submitTrial"
        >
          試用 7 日 Eagerness 方案
        </button>

        <button
          v-else-if="showPlanUI"
          class="btn btn-success btn-lg"
          :disabled="!canSubmit"
          @click="submit"
        >
          選購方案
        </button>
      </div>
    </div>
    <div id="verifyModal" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content text-center p-4 border-1 border-primary-000">
          <h5 class="modal-title mb-3 fw-bold">尚未完成信箱驗證</h5>
          <p class="mb-4">驗證後才能啟用 7 日 Eagerness 試用方案！</p>

          <div class="d-flex justify-content-center gap-3">
            <button class="btn btn-grey-400" data-bs-dismiss="modal">
              稍後再說
            </button>
            <button id="goVerify" class="btn btn-primary" @click="goVerify">
              前往驗證
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// import axios from 'axios'
import { api } from '@/api'
import { useRouter } from 'vue-router'
import { submitEcpay } from '@/api/submitEcpay'

const router = useRouter()

const isLoggedIn = computed(() => !!userInfo.value)
const isVerified = computed(() => userInfo.value?.is_verified)
const hasTrial = computed(() => userInfo.value?.hasTrial)
const hasActiveSub = computed(() => userInfo.value?.hasActiveSubscription)

let verifyModalInstance = null

// 1. 用 import.meta.glob，並加上 eager: true
const iconModules = import.meta.glob('../assets/icons/*.png', {
  eager: true
})
// 2. 轉成 { 檔名: 圖片 URL } 的物件
const icons = Object.fromEntries(
  Object.entries(iconModules).map(([path, module]) => {
    // path 會像 "../assets/icons/weight.png"
    const name = path.split('/').pop().replace('.png', '')
    return [name, module.default]
  })
)

// 訂閱方案
const plans = ref([])
const limitMap = ref({})

// 運動項目
const groups = ref([])

// user資料
const userInfo = ref(null)

const showPlanUI = computed(
  () => isVerified.value && (!hasTrial.value || hasActiveSub.value)
)
const showTrialBtn = computed(
  () => !isLoggedIn.value || !isVerified.value || hasTrial.value
)

const needVerify = computed(() => isLoggedIn.value && !isVerified.value)
async function showVerifyModal() {
  const ModalCtor = window.bootstrap?.Modal || (await import('bootstrap')).Modal
  const el = document.getElementById('verifyModal')
  verifyModalInstance = ModalCtor.getOrCreateInstance(el)
  verifyModalInstance.show()
}

function goVerify() {
  if (verifyModalInstance) {
    verifyModalInstance.hide()
  }
  router.push('/user/profile')
}

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const { data } = await api.get('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('auth/me 回傳:', data)

    userInfo.value = data.data

    if (!userInfo.value.is_verified && !userInfo.value.hasTrial) {
      showVerifyModal()
    }
  } catch (err) {
    console.error('取得使用者資料失敗', err)
  }
})

onMounted(async () => {
  try {
    // 取得運動種類
    const sportsRes = await api.get('/api/v1/users/show-sports-type')
    const { indoor, outdoor } = sportsRes.data.data

    groups.value = [
      {
        title: '室內運動',
        items: indoor.map(item => ({
          label: item.name,
          iconName: labelToIcon[item.name] || 'default'
        }))
      },
      {
        title: '戶外運動',
        items: outdoor.map(item => ({
          label: item.name,
          iconName: labelToIcon[item.name] || 'default'
        }))
      }
    ]

    //  取得方案資料
    const planRes = await api.get('/api/v1/users/plan-info')
    const planData = planRes.data.data

    plans.value = planData.map(plan => {
      const resolutionLabel =
        plan.max_resolution === 2160
          ? '4K'
          : plan.max_resolution === 1080
            ? '1080p'
            : plan.max_resolution === 720
              ? '720p'
              : `${plan.max_resolution}p`

      return {
        key: plan.name.replace('方案', ''), // 例如 "Wellness"
        name: plan.name.replace('方案', ''),
        description: plan.intro,
        price: `NT$${plan.pricing}`,
        features: [
          plan.sports_choice > 0
            ? `任選 ${plan.sports_choice} 種課程類別`
            : '自由學習全平台所有課程',
          `最高可觀看達到 ${resolutionLabel}`,
          plan.livestream ? '可參與教練直播課程' : null
        ].filter(Boolean),
        buttonText: '選擇方案',
        buttonClass:
          plan.pricing === 0
            ? 'btn-outline-secondary'
            : plan.name.includes('Eagerness')
              ? 'btn-primary'
              : 'btn-outline-primary',
        bodyClass: '',
        titleClass: 'fs-lg-4'
      }
    })

    //  產生限制對照表
    limitMap.value = Object.fromEntries(
      planData.map(plan => [
        plan.name.replace('方案', ''), // e.g., "Wellness"
        plan.sports_choice === 0 ? Infinity : plan.sports_choice
      ])
    )
  } catch (err) {
    console.error('載入資料失敗')
  }
})

const limit = computed(() => limitMap.value?.[selectedPlan.value] ?? 0)
const selectedPlanLabel = computed(() => {
  const p = plans.value.find(p => p.key === selectedPlan.value)
  return p ? p.name + '方案' : ''
})

// 對照表
const labelToIcon = {
  瑜珈: 'yoga',
  皮拉提斯: 'pilates',
  重訓: 'weight-lifting',
  有氧: 'aerobic',
  舞蹈: 'dance',
  足球: 'football',
  單車: 'bicycle',
  籃球: 'basketball',
  登山: 'hiking',
  羽球: 'badminton',
  滑板: 'skateboard',
  游泳: 'swimming'
}

// state
const selectedPlan = ref('')
const selectedItems = ref([])

// methods & computed
function selectPlan(key) {
  selectedPlan.value = key
  selectedItems.value = []
}

const selectedCount = computed(() => selectedItems.value.length)

function isSelected(item) {
  return selectedItems.value.includes(item)
}

function toggle(item) {
  if (isSelected(item)) {
    selectedItems.value = selectedItems.value.filter(i => i !== item)
  } else if (selectedCount.value < limit.value) {
    selectedItems.value.push(item)
  }
}

const canSubmit = computed(() => {
  if (!selectedPlan.value) return false
  if (selectedPlan.value === 'Eagerness') return true
  return selectedCount.value === limit.value
})

// 試用七天
async function submitTrial() {
  if (!showTrialBtn.value) return
  if (needVerify.value) {
    showVerifyModal()
    return
  }
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('請先登入學員帳號')
      return
    }

    await api.post(
      '/api/v1/users/subscription',
      {
        subscription_name: 'Eagerness方案-7天試用',
        course_type: []
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    alert('試用成功，歡迎加入！')
    router.push('/')
  } catch (err) {
    alert('申請試用失敗')
  }
}

// 提交
async function submit() {
  if (!showPlanUI.value) return
  const payload = {
    subscription_name: selectedPlanLabel.value,
    course_type: selectedPlan.value === 'Eagerness' ? [] : selectedItems.value
  }
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('請先登入學員帳號')
      return
    }
    await api
      .post('/api/v1/users/subscription', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        const data = res.data.data.subscription
        const payment = {
          price: data.price,
          order_number: data.order_number,
          plan_name: data.plan
        }
        submitEcpay(token, payment)
      })
  } catch (err) {
    alert('訂閱失敗，請確認是否已有訂閱方案')
  }
}
</script>

<style scoped lang="scss">
.plan-desc {
  /* 固定描述高度，讓卡片一致 */
  min-height: 96px;
  overflow: hidden;
}
</style>
