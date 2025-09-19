<template>
  <div class="chat-widget">
    <!-- 按鈕，只在未打開時顯示 -->
    <div
      v-if="!isOpen"
      class="chat-toggle bi bi-robot bg-primary-600"
      @click="isOpen = true"
    ></div>

    <!-- 聊天匡 -->
    <div v-if="isOpen" class="chat-box bg-grey-000">
      <div
        class="chat-header bg-grey-000 text-primary-600"
        @click="isOpen = false"
      >
        <p class="mb-0">AI 客服</p>

        <button class="chat-close text-primary-600" @click="isOpen = false">
          一
        </button>
      </div>
      <div ref="chatBody" class="chat-body">
        <div v-for="(msg, index) in messages" :key="index" class="chat-message">
          <span :class="[msg.role, { loading: msg.isLoading }]">{{
            msg.text
          }}</span>
        </div>
      </div>
      <div class="chat-input">
        <input
          v-model="input"
          :disabled="loading"
          placeholder="請輸入訊息..."
          @keyup.enter="sendMessage"
        />
        <button :disabled="loading || !input" @click="sendMessage">送出</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import axios from 'axios'

// 為 ChatWidget 創建獨立的 axios 實例，不使用全域攔截器
const chatAxios = axios.create({
  baseURL: 'https://sptfyplus.zeabur.app/api/v1'
})
const isOpen = ref(false)
const input = ref('')
const messages = ref([])
const loading = ref(false)
const chatBody = ref(null)
const scrollToBottom = async () => {
  await nextTick()
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}
const sendMessage = async () => {
  if (!input.value.trim()) return
  const userMessage = input.value
  messages.value.push({ role: 'user', text: userMessage })
  input.value = ''
  loading.value = true
  await scrollToBottom()

  // 顯示 loading 訊息
  const loadingMessageIndex = messages.value.length
  messages.value.push({ role: 'bot', text: '正在思考中...', isLoading: true })
  await scrollToBottom()

  try {
    const res = await chatAxios.post('/chat', {
      message: userMessage
    })
    // 移除 loading 訊息
    messages.value.splice(loadingMessageIndex, 1)

    if (res.data && res.data.reply) {
      messages.value.push({ role: 'bot', text: res.data.reply })
    } else {
      messages.value.push({
        role: 'bot',
        text: '⚠️ 無法取得回覆，請稍後再試。'
      })
    }
  } catch (error) {
    // 移除 loading 訊息
    messages.value.splice(loadingMessageIndex, 1)

    messages.value.push({
      role: 'bot',
      text: '⚠️ 發送失敗，請檢查網路或稍後再試。'
    })
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}
</script>

<style scoped lang="scss">
.chat-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}
/* 按鈕樣式 */
.chat-toggle {
  width: 56px;
  height: 56px;
  color: $primary-000;
  border-radius: 50%;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  outline: none; // 避免點擊後出現預設框線
}
/* 聊天視窗樣式 */
.chat-box {
  width: 320px;
  height: 420px;
  background: #d4d4d4; // 淺灰色背景
  border: 1px solid #ccc;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
/* header 有 ✕ 關閉鍵 */
.chat-header {
  background: #000; // 黑色背景
  color: white; // 白色文字
  padding: 16px;
  font-weight: bold;
  cursor: pointer;
  position: relative;
  .chat-close {
    position: absolute;
    top: 14px;
    right: 10px;
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
  }
}
.chat-body {
  flex: 1;
  padding: 0 16px;
  overflow-y: auto;
  font-size: 14px;
  .chat-message {
    display: flex;
    width: 100%;
    margin-bottom: 12px;

    .user {
      margin-left: auto;
    }

    .bot {
      margin-right: auto;
    }

    > span {
      display: inline-block;
      width: fit-content;
      max-width: 80%;
      background: $primary-000;
      border-radius: 8px;
      padding: 12px;
      white-space: pre-wrap;
      word-break: break-word;
      color: $grey-1000;
      line-height: 1.6;

      &.loading {
        animation: pulse 1.5s ease-in-out infinite;
        opacity: 0.7;
      }
    }
  }
}

.chat-input {
  display: flex;
  padding: 0 16px 16px 16px;
  input {
    flex: 1;
    border: none;
    outline: none;
    border: 1px solid $grey-400;
    border-radius: 8px;
    padding: 8px 12px;
  }
  button {
    padding: 8px 16px;
    margin-left: 8px;
    background-color: $primary-600;
    color: $primary-000;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}
</style>
