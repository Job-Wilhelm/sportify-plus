<script setup>
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import { v4 as uuidv4 } from 'uuid'
import { UpChunk } from '@mux/upchunk'
// import axios from 'axios'
import { api } from '@/api'

const chapters = ref([])
const isDragging = ref(false)
const draggedItem = ref(null)

const props = defineProps({
  initialData: {
    type: Array,
    default: () => []
  },
  courseId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['course-id-received'])

const uploadControllers = ref(new Map())

watch(
  () => props.initialData,
  newData => {
    console.log('VueDraggable 接收到的 initialData:', newData)

    if (newData && newData.length > 0) {
      // 轉換後端資料格式為前端格式
      chapters.value = newData.map((chapter, chapterIndex) => {
        // 處理章節資料
        const chapterData = {
          id: uuidv4(),
          title: chapter.chapter_title,
          collapsed: false,
          sections: []
        }

        // 處理小節資料
        let sectionsSource = []
        sectionsSource = chapter.sub_chapter

        chapterData.sections = sectionsSource.map((section, sectionIndex) => ({
          id: section.subchapter_id,
          title: section.subtitle,
          fileName: section.filename,
          uploading: false,
          uploadProgress: 100
        }))

        return chapterData
      })
    } else {
      chapters.value = []
    }
  },
  { immediate: true, deep: true }
)

const totalSections = computed(() =>
  chapters.value.reduce((total, chapter) => total + chapter.sections.length, 0)
)

const addChapter = () =>
  chapters.value.push({
    id: uuidv4(),
    collapsed: false,
    sections: [],
    title: '新章節'
  })

const addSection = chapter => {
  if (chapter.collapsed) {
    chapter.collapsed = false
  }
  chapter.sections.push({
    id: uuidv4(),
    file: null,
    fileName: '',
    fileSize: 0,
    title: '新小節'
  })
}

const onFileChange = async (section, file) => {
  if (!file) {
    section.file = null
    section.fileName = ''
    section.fileSize = 0
    return
  }

  // 檔案類型驗證
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm']
  if (!allowedTypes.includes(file.type)) {
    alert('請選擇支援的影片格式 (MP4, MOV, WebM)')
    return
  }

  // 檔案大小限制 4GB
  const maxSize = 4 * 1024 * 1024 * 1024
  if (file.size > maxSize) {
    alert('檔案大小不能超過 4GB')
    return
  }

  section.file = file
  section.fileName = file.name
  section.fileSize = file.size
  section.uploading = true
  section.uploadProgress = 0

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('請先登入')
    }
    const uploadData = {
      subChapterId: section.id,
      extension: file.type.split('/').pop(),
      size: section.fileSize
    }

    if (props.courseId != null) {
      uploadData.courseId = props.courseId
    }

    const { data } = await api.post('/api/v1/mux/upload-url', uploadData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // 將 course_id 傳出去
    if (data.course_id) {
      emit('course-id-received', data.course_id)
    }

    const url = data.url
    if (!url) {
      throw new Error('無法獲取上傳 URL')
    }

    console.log('上傳資料:', uploadData)
    console.log('後端回應:', data)

    const upload = UpChunk.createUpload({
      endpoint: url,
      file,
      chunkSize: 30720,
      attempts: 5,
      delayBeforeAttempt: 0.5,
      maxFileSize: 4194304,
      dynamicChunkSize: true
    })

    uploadControllers.value.set(section.id, upload)

    upload.on('error', err => {
      console.error('上傳錯誤:', err.detail)
      section.uploading = false
      section.uploadProgress = 0
      uploadControllers.value.delete(section.id)
      alert('上傳失敗，請重試')
    })
    upload.on('progress', progress => {
      console.log('上傳進度:', progress.detail)
      section.uploadProgress = progress.detail
    })
    upload.on('success', () => {
      console.log('上傳成功')
      section.uploading = false
      section.uploadProgress = 100
      uploadControllers.value.delete(section.id)
    })
  } catch (error) {
    console.error('上傳失敗:', error)
    section.uploading = false
    section.uploadProgress = 0
    uploadControllers.value.delete(section.id)
  }
}

const cancelUpload = section => {
  const upload = uploadControllers.value.get(section.id)
  if (upload) {
    upload.abort() // 中斷上傳
    uploadControllers.value.delete(section.id)
  }

  section.uploading = false
  section.uploadProgress = 0
  section.file = null
  section.fileName = ''
  section.fileSize = 0
}

// 檢查檔案是否存在
const hasFile = section => {
  return (
    (section.file && section.fileName) ||
    (section.fileName && section.uploadProgress === 100)
  )
}

// 處理 Enter 鍵事件
const handleKeydown = event => {
  if (event.key === 'Enter') {
    event.preventDefault() // 阻止預設行為
    event.target.blur() // 讓輸入框失去焦點，觸發 @blur 保存
  }
}

// 刪除功能
const removeChapter = index => {
  const chapter = chapters.value[index]

  // 檢查是否有正在上傳的檔案
  const uploadingSections = chapter.sections.filter(
    section => section.uploading
  )

  if (uploadingSections.length > 0) {
    const confirmMessage = `此章節有 ${uploadingSections.length} 個檔案正在上傳中，確定要刪除嗎？`
    if (!confirm(confirmMessage)) {
      return
    }

    // 取消所有上傳
    uploadingSections.forEach(section => {
      const upload = uploadControllers.value.get(section.id)
      if (upload) {
        upload.abort()
        uploadControllers.value.delete(section.id)
      }
    })
  } else if (!confirm('確定要刪除這個章節嗎？')) {
    return
  }

  chapters.value.splice(index, 1)
}

const removeSection = (chapter, sectionIndex) => {
  const section = chapter.sections[sectionIndex]

  if (section.uploading) {
    if (!confirm('此小節正在上傳中，確定要刪除嗎？')) {
      return
    }

    // 取消上傳
    const upload = uploadControllers.value.get(section.id)
    if (upload) {
      upload.abort()
      uploadControllers.value.delete(section.id)
    }
  } else if (!confirm('確定要刪除這個小節嗎？')) {
    return
  }

  chapter.sections.splice(sectionIndex, 1)
}

// 拖曳狀態管理
const onDragStart = item => {
  isDragging.value = true
  draggedItem.value = item
}

const onDragEnd = () => {
  isDragging.value = false
  draggedItem.value = null
}

// 章節折疊功能
const toggleChapter = chapter => {
  chapter.collapsed = !chapter.collapsed
}

// ✅ 移除檔案
const removeFile = section => {
  section.file = null
  section.fileName = ''
  section.fileSize = 0
}

// ✅ 格式化檔案大小
const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

defineExpose({
  chapters
})
</script>

<template>
  <div class="draggable-container">
    <!-- 工具列 -->
    <div class="toolbar">
      <div class="stats">
        總計: {{ chapters.length }} 章節 / {{ totalSections }} 小節
      </div>
      <div class="actions">
        <button class="btn btn-primary-600" @click.prevent="addChapter">
          <i class="bi bi-plus-circle me-2"></i>
          <span class="d-none d-md-inline">新增章節</span>
          <span class="d-md-none">章節</span>
        </button>
      </div>
    </div>

    <!-- 拖曳區域 -->
    <draggable
      v-model="chapters"
      item-key="id"
      handle=".chapter-handle"
      animation="200"
      :class="{ 'is-dragging': isDragging }"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <template #item="{ element: chapter, index: chapterIndex }">
        <div
          class="chapter-card"
          :class="{
            collapsed: chapter.collapsed
          }"
        >
          <div class="chapter-header">
            <span class="chapter-handle handle material-symbols-outlined">
              drag_indicator
            </span>
            <input
              v-model="chapter.title"
              class="chapter-title"
              placeholder="大章節名稱"
              @keydown="handleKeydown"
            />
            <div class="chapter-actions">
              <button
                v-show="!chapter.collapsed"
                class="icon-btn"
                title="新增小節"
                @click.prevent="addSection(chapter)"
              >
                <span class="material-symbols-outlined"> add </span>
              </button>
              <button
                v-show="!chapter.collapsed"
                class="icon-btn danger"
                title="刪除章節"
                @click.prevent="removeChapter(chapterIndex)"
              >
                <span class="material-symbols-outlined"> delete </span>
              </button>
              <button
                class="icon-btn"
                :title="chapter.collapsed ? '展開' : '折疊'"
                @click.prevent="toggleChapter(chapter)"
              >
                <span class="material-symbols-outlined">
                  {{ chapter.collapsed ? 'stat_1' : 'stat_minus_1' }}
                </span>
              </button>
            </div>
          </div>
          <!-- 小節區域 -->
          <div v-show="!chapter.collapsed" class="sections-container">
            <draggable
              v-model="chapter.sections"
              item-key="id"
              :group="{ name: 'sections', pull: true, put: true }"
              handle=".section-handle"
              animation="180"
              @start="onDragStart"
              @end="onDragEnd"
            >
              <template #item="{ element: section, index: sectionIndex }">
                <div class="section-item">
                  <span class="section-handle handle material-symbols-outlined">
                    drag_indicator
                  </span>
                  <input
                    v-model="section.title"
                    class="section-title"
                    placeholder="小章節名稱"
                    @keydown="handleKeydown"
                  />
                  <!-- 檔案處理區域 -->
                  <div class="file-section">
                    <!-- 如果正在上傳，顯示進度條 -->
                    <div v-if="section.uploading" class="upload-progress">
                      <progress
                        :value="section.uploadProgress"
                        max="100"
                        class="progress-element"
                      ></progress>
                      <span class="progress-text"
                        >{{ Math.round(section.uploadProgress) }}%</span
                      >
                      <button
                        class="icon-btn danger small cancel-btn"
                        title="取消上傳"
                        @click.prevent="cancelUpload(section)"
                      >
                        <span class="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    <!-- 如果沒有檔案且未上傳中，顯示上傳按鈕 -->
                    <div v-else-if="!hasFile(section)" class="file-upload">
                      <input
                        :id="`file-${section.id}`"
                        type="file"
                        accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
                        class="file-input"
                        @change="onFileChange(section, $event.target.files[0])"
                      />
                      <label :for="`file-${section.id}`" class="file-label">
                        <span class="material-symbols-outlined">upload</span>
                        <span class="d-none d-sm-inline">選擇影片</span>
                        <span class="d-sm-none">選擇</span>
                      </label>
                    </div>

                    <!-- 如果有檔案，顯示檔案資訊 -->
                    <div v-else class="file-info">
                      <div class="file-details">
                        <span class="file-name">{{ section.fileName }}</span>
                        <span class="file-size d-none d-sm-block">{{
                          formatFileSize(section.fileSize)
                        }}</span>
                      </div>
                      <button
                        class="icon-btn danger small"
                        title="移除檔案"
                        @click.prevent="removeFile(section)"
                      >
                        <span class="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  </div>
                  <button
                    class="icon-btn danger"
                    title="刪除小節"
                    @click.prevent="removeSection(chapter, sectionIndex)"
                  >
                    <span class="material-symbols-outlined"> delete </span>
                  </button>
                </div>
              </template>
            </draggable>

            <!-- 空狀態提示 -->
            <div v-if="chapter.sections.length === 0" class="empty-sections">
              <p class="d-none d-md-block">尚無小節，點擊上方 ＋ 新增</p>
              <p class="d-md-none">點擊 ＋ 新增小節</p>
            </div>
          </div>
        </div>
      </template>
    </draggable>

    <!-- 空狀態 -->
    <div v-if="chapters.length === 0" class="empty-state">
      <h3 class="d-none d-md-block">尚未建立章節</h3>
      <h5 class="d-md-none">尚未建立章節</h5>
      <p class="d-none d-md-block">點擊「新增章節」開始建立您的課程</p>
      <p class="d-md-none small">點擊「新增章節」開始建立</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.draggable-container {
  width: 100%;

  @media (max-width: 768px) {
    padding: 0;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;

  @media (max-width: 768px) {
    padding: 8px 12px;
    margin-bottom: 16px;
  }
}

.stats {
  color: #666;
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
}

.actions {
  display: flex;
  gap: 8px;
}

.chapter-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fff;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    margin-bottom: 8px;
    border-radius: 6px;
  }
}

.chapter-card:hover {
  border-color: #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chapter-card.selected {
  border-color: #007acc;
  background: #f0f8ff;
}

.chapter-card.collapsed {
  opacity: 0.7;

  .chapter-title {
    opacity: 0.8;
    font-style: italic;
  }

  .chapter-header {
    background: #f0f0f0;
  }
}

.chapter-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;

  @media (max-width: 991px) {
    padding: 10px 12px;
    gap: 8px;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    gap: 8px;
  }
}

.chapter-title {
  flex: 1;
  border: none;
  background: transparent;
  font-weight: 600;
  font-size: 16px;

  @media (max-width: 991px) {
    font-size: 15px;
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
}

.chapter-actions {
  display: flex;
  gap: 4px;

  @media (max-width: 991px) {
    gap: 2px;
    flex-shrink: 0; // 防止按鈕區域被壓縮
  }

  @media (max-width: 768px) {
    gap: 2px;
  }
}

.sections-container {
  padding: 8px 0;

  @media (max-width: 768px) {
    padding: 4px 0;
  }
}

.section-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 24px;
  border-bottom: 1px solid #f0f0f0;

  @media (max-width: 991px) {
    flex-wrap: wrap;
    gap: 8px;
    padding: 6px 16px;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    gap: 8px;
    flex-wrap: wrap;
  }

  @media (max-width: 576px) {
    padding: 4px 8px;
    gap: 6px;
  }
}

.section-item:last-child {
  border-bottom: none;
}

.section-item.selected {
  background: #f0f8ff;
}

.section-title {
  flex: 1;
  border: none;
  background: transparent;
  padding: 4px 8px;
  border-radius: 4px;

  @media (max-width: 768px) {
    font-size: 14px;
    min-width: 120px;
  }

  @media (max-width: 576px) {
    font-size: 12px;
    min-width: 100px;
  }
}

.section-title:focus {
  background: white;
  border: 1px solid #007acc;
}

.handle {
  cursor: grab;
  user-select: none;
  font-size: 16px;
  color: #999;
  padding: 4px;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 2px;
  }
}

.handle:hover {
  color: #666;
}

.handle:active {
  cursor: grabbing;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;

  @media (max-width: 768px) {
    padding: 2px 6px;
    font-size: 12px;

    .material-symbols-outlined {
      font-size: 16px;
    }
  }
}

.icon-btn:hover {
  background: #f0f0f0;
}

.icon-btn.danger:hover {
  background: #ffe6e6;
  color: #d32f2f;
}

.icon-btn.primary {
  background: #007acc;
  color: white;
}

.empty-sections {
  text-align: center;
  padding: 20px;
  color: #999;
  font-style: italic;

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 14px;
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;

  @media (max-width: 768px) {
    padding: 20px 12px;
  }
}

.is-dragging {
  opacity: 0.8;
}

.btn-primary-600 {
  background-color: $primary-600;
  border-color: $primary-600;
  color: $primary-000;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;

  &:hover {
    background-color: $primary-700;
    border-color: $primary-700;
    color: $primary-000;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
  }
}

/* ✅ 檔案處理樣式 */
.file-section {
  min-width: 200px;

  @media (max-width: 991px) {
    width: 100%;
    min-width: auto;
    order: 3;
    margin-top: 8px;
  }

  @media (max-width: 768px) {
    min-width: 150px;
  }

  @media (max-width: 576px) {
    min-width: 120px;
    width: 100%;
    order: 3;
    margin-top: 8px;
  }
}

.file-upload {
  position: relative;
}

.file-input {
  display: none;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f8f9fa;
  border: 1px dashed #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 11px;
    gap: 4px;
  }

  @media (max-width: 576px) {
    padding: 3px 6px;
    font-size: 10px;
    justify-content: center;
  }
}

.file-label:hover {
  background: #e9ecef;
  border-color: #007acc;
  color: #007acc;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 4px;
  min-width: 180px;

  @media (max-width: 768px) {
    padding: 4px 8px;
    gap: 6px;
    min-width: 140px;
  }

  @media (max-width: 576px) {
    padding: 3px 6px;
    min-width: 100px;
  }
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #2e7d32;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 11px;
  }

  @media (max-width: 576px) {
    font-size: 10px;
  }
}

.file-size {
  display: block;
  font-size: 10px;
  color: #4caf50;

  @media (max-width: 768px) {
    font-size: 9px;
  }
}

.icon-btn.small {
  padding: 2px 4px;
  font-size: 12px;

  @media (max-width: 768px) {
    padding: 1px 3px;
    font-size: 10px;
  }
}

.icon-btn.small .material-symbols-outlined {
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  min-width: 200px;

  @media (max-width: 991px) {
    min-width: 160px;
    padding: 5px 10px;
    gap: 6px;
  }
  @media (max-width: 768px) {
    padding: 4px 8px;
    gap: 6px;
    min-width: 150px;
  }

  @media (max-width: 576px) {
    padding: 3px 6px;
    min-width: 120px;
    gap: 4px;
  }
}

.progress-element {
  flex: 1;
  height: 8px;
  border: none;
  border-radius: 4px;
  background: #e0e0e0;

  @media (max-width: 768px) {
    height: 6px;
  }

  /* WebKit 瀏覽器樣式 */
  &::-webkit-progress-bar {
    background: #e0e0e0;
    border-radius: 4px;
  }

  &::-webkit-progress-value {
    background: linear-gradient(90deg, #007acc 0%, #0056b3 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  /* Firefox 樣式 */
  &::-moz-progress-bar {
    background: linear-gradient(90deg, #007acc 0%, #0056b3 100%);
    border-radius: 4px;
  }
}

.progress-text {
  font-size: 12px;
  color: #666;
  min-width: 40px;
  text-align: right;
  font-weight: 500;

  @media (max-width: 991px) {
    font-size: 11px;
    min-width: 35px;
  }

  @media (max-width: 768px) {
    font-size: 10px;
    min-width: 30px;
  }

  @media (max-width: 576px) {
    font-size: 9px;
    min-width: 25px;
  }
}

.cancel-btn {
  margin-left: 4px;
  background: #ff4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    margin-left: 2px;
  }

  @media (max-width: 576px) {
    width: 16px;
    height: 16px;
  }
}

.cancel-btn:hover {
  background: #cc0000;
}

.cancel-btn .material-symbols-outlined {
  font-size: 12px;

  @media (max-width: 768px) {
    font-size: 10px;
  }

  @media (max-width: 576px) {
    font-size: 9px;
  }
}

// 手機版特殊調整
@media (max-width: 991px) {
  .section-item {
    .section-handle {
      order: 0;
    }

    .section-title {
      order: 1;
      flex: 1;
      font-size: 14px;
      min-width: 150px;
    }

    .file-section {
      order: 2;
      width: calc(100% - 80px);
    }

    .icon-btn:not(.small) {
      order: 3;
      margin-left: auto;
    }
  }
}

@media (max-width: 576px) {
  .section-item {
    .section-title {
      order: 1;
      width: 100%;
      margin-bottom: 4px;
    }

    .section-handle {
      order: 0;
    }

    .file-section {
      order: 2;
      width: calc(100% - 60px);
    }

    .icon-btn:not(.small) {
      order: 4;
      margin-left: auto;
    }
  }
}
</style>
