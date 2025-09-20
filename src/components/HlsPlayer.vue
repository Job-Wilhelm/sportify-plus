<template>
  <div class="player-wrapper">
    <video
      ref="video"
      class="hls-video"
      playsinline
      controls
      crossorigin="anonymous"
      :poster="poster"
    />
    <button
      v-show="!isPlaying"
      class="play-btn"
      aria-label="Play / Pause"
      :class="{ hidden: isPlaying }"
      @click.stop="togglePlay"
    >
      <i class="bi bi-play-fill" />
    </button>
    <div
      class="tap-layer"
      @click="togglePlay"
      @touchend.stop.prevent="togglePlay"
    ></div>
    <div
      v-if="uiLevels.length"
      class="quality-control p-0"
      @mouseenter="openPanel"
      @mouseleave="restartTimer"
    >
      <button
        v-show="uiLevels.length"
        class="setting-btn"
        :class="{ visible: showGear }"
        title="畫質設定"
        @click.stop="openPanel"
      >
        <i class="bi bi-gear-fill"></i>
      </button>
      <div
        v-show="showPanel"
        class="quality-panel"
        @click.stop
        @mouseenter="openPanel"
        @mouseleave="restartTimer"
      >
        <select v-model.number="selectedLevel" @change="changeLevel">
          <option :value="-1">自動</option>

          <option
            v-for="(l, idx) in uiLevels"
            :key="idx"
            :value="allLevels.indexOf(l)"
          >
            {{ l.height }}p
          </option>
        </select>
        <span class="current-level">{{ currentLevelTxt }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Hls from 'hls.js'
// import axios from 'axios'
import { api } from '@/api'
import mux from 'mux-embed'

const showPanel = ref(false)
const showGear = ref(false)
let hideTimer = null

const props = defineProps({
  src: { type: String, required: true },
  poster: { type: String, default: '' },
  mode: { type: String, default: 'member' } // ← 新增，可傳 'preview'
})

const PLAN_CAP = { wellness: 720, fitness: 1080, eagerness: Infinity }

const capHeight = ref(720)
const allLevels = ref([])
const uiLevels = ref([])
const selectedLevel = ref(-1)
const currentLevelTxt = ref('Auto')
const isPlaying = ref(false)
const video = ref(null)
let hls = null
let muxBound = false
const MUX_ENV_KEY = import.meta.env.VITE_MUX_ENV_KEY

function restartTimer() {
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    showPanel.value = false
    showGear.value = false
  }, 3000)
}

function openPanel() {
  showPanel.value = true
  showGear.value = true
  restartTimer()
}

async function fetchPlanAndSetCap() {
  try {
    const token = localStorage.getItem('token') || ''
    const { data } = await api.get('/api/v1/users/subscriptions', {
      headers: { Authorization: `Bearer ${token}` }
    })
    capHeight.value = PLAN_CAP[pickCurrentPlan(data.data)] ?? 720
  } catch (e) {
    console.error('讀訂閱失敗 fallback 720p', e)
    capHeight.value = 720
  }
}

function pickCurrentPlan(subs) {
  const today = Date.now()
  const cur = [...subs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .find(s => new Date(s.end_at) >= today)

  const n = (cur?.plan ?? '').toLowerCase()
  if (n.includes('eagerness')) return 'eagerness'
  if (n.includes('fitness')) return 'fitness'
  return 'wellness'
}

function setupPlayer(src, mode = 'member') {
  if (!src) return
  hls?.destroy()
  if (!Hls.isSupported()) {
    video.value.src = src
    return
  }
  hls = new Hls()
  hls.loadSource(src)
  hls.attachMedia(video.value)

  // 串接 Mux Data
  if (MUX_ENV_KEY && !muxBound && video.value) {
    mux.monitor(video.value, {
      debug: false, // 驗證期開啟
      // transport: 'xhr',
      hlsjs: hls,
      Hls,
      data: {
        env_key: MUX_ENV_KEY,
        video_id: props.src, // 之後可換課程 ID
        video_title: props.poster ?? '',
        viewer_user_id:
          JSON.parse(localStorage.getItem('user') || '{}').id || '',
        viewer_plan: props.mode || 'preivew',
        player_name: 'Sportify Plus HLS Player',
        player_init_time: Date.now()
      }
    })
    muxBound = true
  }

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    allLevels.value = hls.levels

    if (mode === 'preview') {
      hls.autoLevelCapping = -1 // 無上限
      uiLevels.value = allLevels.value
    } else {
      uiLevels.value = allLevels.value.filter(l => l.height <= capHeight.value)
      const hiIdx = allLevels.value.findLastIndex(
        l => l.height <= capHeight.value
      )
      hls.autoLevelCapping = hiIdx
    }
    selectedLevel.value = -1
    currentLevelTxt.value = 'Auto'
  })

  hls.on(Hls.Events.LEVEL_SWITCHED, (_, d) => {
    const l = allLevels.value[d.level]
    currentLevelTxt.value = l ? `${l.height}p` : 'Auto'
  })
}

function changeLevel() {
  if (hls) hls.currentLevel = selectedLevel.value
}

function togglePlay() {
  isPlaying.value ? video.value.pause() : video.value.play()
  if (matchMedia('(hover: none)').matches) openPanel()
}

onMounted(async () => {
  if (props.mode !== 'preview') {
    await fetchPlanAndSetCap()
  }

  setupPlayer(props.src, props.mode)

  video.value.addEventListener('play', () => (isPlaying.value = true))
  video.value.addEventListener('pause', () => (isPlaying.value = false))
})

watch(
  () => props.src,
  s => setupPlayer(s, props.mode)
)

onBeforeUnmount(() => {
  hls?.destroy()

  if (muxBound && video.value) {
    if (typeof mux.destroy === 'function') {
      mux.destroy(video.value)
    } else if (typeof mux.unmonitor === 'function') {
      mux.unmonitor(video.value)
    }
    muxBound = false
  }
  clearTimeout(hideTimer)
})
</script>

<style scoped lang="scss">
.player-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
.hls-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.play-btn {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 80px;
  height: 80px;
  border: none;
  border-radius: 50%;
  background: $primary-600;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44px;
  color: #fff;
  cursor: pointer;
  z-index: 1; /* ★ 關鍵：高於 video */
  transition: background 0.25s;
}
.play-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}
.quality-control {
  position: absolute;
  right: 0px;
  bottom: 60px;
  background: rgba(0, 0, 0, 0.45);
  padding: 4px 8px;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  z-index: 20;
}

.quality-control:empty {
  background: transparent;
  padding: 0;
}

.quality-control select {
  background: transparent;
  color: #fff;
  border: none;
  padding: 2px 6px;
  font-size: 14px;
  outline: none;

  &:focus,
  &:active {
    background: #fff;
    color: #000;
  }
}
@media (max-width: 576px) {
  .quality-control {
    display: none; /* 直接不渲染在畫面上 */
  }
}
.current-level {
  font-size: 12px;
}
/* 齒輪按鈕 */
.setting-btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6; /* 高於影片 & play-btn */
  cursor: pointer;
  transition: background 0.2s;
  opacity: 0;
  pointer-events: none;
}
.setting-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}
.player-wrapper:hover .setting-btn {
  opacity: 1;
  pointer-events: auto;
}
.quality-panel {
  position: absolute;
  right: 10px;
  bottom: 56px; /* 齒輪上方一點 */
  background: rgba(0, 0, 0, 0.8);
  padding: 6px 10px;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  z-index: 7; /* 高於齒輪 */
  min-width: 90px;
}

.quality-panel select {
  background: #fff;
  color: #000;
  margin-right: 6px;
}
.tap-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  background: transparent;
  pointer-events: none;
}
@media (hover: none) {
  .setting-btn {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
  }
  .setting-btn.visible {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
