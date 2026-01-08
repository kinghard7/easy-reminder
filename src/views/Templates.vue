<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBillStore } from '../stores/billStore'
import { useTemplateStore } from '../stores/templateStore'
import { ChevronLeft, Send, Copy, Mail, MessageSquare, Edit2, GripVertical } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'
import draggable from 'vuedraggable'

const route = useRoute()
const router = useRouter()
const templateStore = useTemplateStore()
const billStore = useBillStore()
const { showToast } = useToast()

const billId = route.query.id
const currentBill = computed(() => billStore.bills.find(b => b.id === billId))

const templates = computed({
  get: () => templateStore.templates,
  set: (val) => templateStore.templates = val
})

const selectedTemplate = ref(templates.value[0])

const formatCurrency = (val) => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val)
}

const getPreview = (content) => {
  const name = currentBill.value?.borrower || '[借款人]'
  const amount = currentBill.value ? formatCurrency(billStore.calculateDebt(currentBill.value)) : '[金额]'
  const date = currentBill.value?.date || '[日期]'
  
  return content.replace(/{name}/g, name)
                .replace(/{amount}/g, amount)
                .replace(/{date}/g, date)
}

const dragOptions = computed(() => ({
  animation: 200,
  group: 'templates',
  disabled: false,
  ghostClass: 'ghost',
  chosenClass: 'chosen',
  delay: 0, 
  handle: '.drag-handle',
  forceFallback: true, // Improved mobile support
  fallbackTolerance: 3 // Small tolerance for tap vs drag
}))

const handleSend = (method) => {
  const text = getPreview(selectedTemplate.value.content)
  if (method === 'sms') {
    window.location.href = `sms:?body=${encodeURIComponent(text)}`
  } else if (method === 'email') {
    window.location.href = `mailto:?subject=账单提醒&body=${encodeURIComponent(text)}`
  }
  showToast('已尝试调用系统原生功能')
}
</script>

<template>
  <div class="container">

    <header class="header">
      <button @click="router.back()" class="btn-icon glass">
        <ChevronLeft :size="24" />
      </button>
      <h3>催单模板</h3>
      <div style="width: 40px"></div>
    </header>

    <draggable 
      v-model="templates" 
      v-bind="dragOptions"
      item-key="id"
      class="template-selector"
      handle=".drag-handle"
    >
      <template #item="{ element: tpl }">
        <div 
          class="tpl-card glass"
          :class="{ active: selectedTemplate.id === tpl.id }"
          @click="selectedTemplate = tpl"
        >
          <div class="tpl-icon">
            <MessageSquare v-if="tpl.type === 'gentle'" :size="20" />
            <Edit2 v-else-if="tpl.type === 'custom'" :size="20" />
            <Copy v-else :size="20" />
          </div>
          <span>{{ tpl.name }}</span>
          <div class="drag-handle">
            <GripVertical :size="14" class="text-muted" />
          </div>
        </div>
      </template>
    </draggable>

    <div class="preview-area glass-card" :class="{ 'editing-mode': selectedTemplate.type === 'custom' }">
      <div class="preview-header">
        <span class="badge">{{ selectedTemplate.type === 'custom' ? '自定义内容' : '预览效果' }}</span>
      </div>
      
      <div v-if="selectedTemplate.type === 'custom'" class="edit-box">
        <textarea 
          v-model="selectedTemplate.content" 
          class="custom-textarea"
          rows="4"
          placeholder="请输入模板内容..."
        ></textarea>
        <div class="var-hints">
          <span class="hint-tag" @click="selectedTemplate.content += '{name}'">{name}</span>
          <span class="hint-tag" @click="selectedTemplate.content += '{amount}'">{amount}</span>
          <span class="hint-tag" @click="selectedTemplate.content += '{date}'">{date}</span>
        </div>
      </div>
      <p v-else class="preview-content">{{ getPreview(selectedTemplate.content) }}</p>
    </div>

    <div v-if="selectedTemplate.type === 'custom'" class="custom-card glass-card animate-slide-up">
      <h4>自定义变量说明</h4>
      <ul class="var-list">
        <li><code>{name}</code> - 借款人姓名</li>
        <li><code>{amount}</code> - 待还金额</li>
        <li><code>{date}</code> - 借款日期</li>
      </ul>
    </div>

    <div class="send-options">
      <p class="section-label">发送方式</p>
      <div class="options-grid">
        <button @click="handleSend('sms')" class="option-btn glass">
          <MessageSquare :size="24" color="#10b981" />
          <span>短信催单</span>
        </button>
        <button @click="handleSend('email')" class="option-btn glass">
          <Mail :size="24" color="#6366f1" />
          <span>邮件催单</span>
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.template-selector {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 0.25rem 1.5rem;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tpl-card {
  flex: 0 0 auto;
  padding: 0.6rem 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  user-select: none;
  border: 1px solid var(--border);
}

.tpl-card span {
  font-size: 0.85rem;
  font-weight: 500;
}

.tpl-icon {
  display: flex;
  align-items: center;
  opacity: 0.8;
}

.tpl-card.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.drag-handle {
  opacity: 0.4;
  padding: 0.4rem; /* Increase touch area */
  margin: -0.4rem; /* Compensate for padding */
  margin-left: 0.25rem;
  cursor: grab;
  display: flex; /* Ensure icon centers */
  align-items: center;
}

.ghost {
  opacity: 0;
}

.chosen {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  z-index: 10;
}

.editing-mode {
  border: 1px solid var(--primary);
}

.preview-area {
  padding: 2rem;
  margin-bottom: 2rem;
  min-height: 150px;
}

.preview-header {
  margin-bottom: 1rem;
}

.badge {
  font-size: 0.7rem;
  background: var(--primary-glow);
  color: var(--primary);
  padding: 0.2rem 0.6rem;
  border-radius: 0.5rem;
  font-weight: 700;
}

.preview-content {
  font-size: 1.1rem;
  line-height: 1.7;
}

.custom-textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  color: var(--text);
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  resize: none;
  margin-bottom: 1rem;
}

.custom-textarea:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.08);
}

.var-hints {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.hint-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.hint-tag:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.send-options {
  margin-bottom: 2rem;
}

.section-label {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.option-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border: none;
  border-radius: 1.5rem;
  cursor: pointer;
}

.custom-card h4 {
  margin-bottom: 1rem;
}

.var-list {
  list-style: none;
  padding: 0;
}

.var-list li {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

code {
  background: rgba(255,255,255,0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
  color: var(--secondary);
}
</style>
