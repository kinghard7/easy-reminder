<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useToast } from '../../composables/useToast'
import { Shield, Key, HelpCircle, Save, X } from 'lucide-vue-next'

const props = defineProps(['show'])
const emit = defineEmits(['close'])

const authStore = useAuthStore()
const { showToast } = useToast()
const password = ref(authStore.config?.password || '')
const question = ref(authStore.config?.question || '')
const answer = ref(authStore.config?.answer || '')
const isError = ref(false)

const handleSave = () => {
  if (!/^\d{6}$/.test(password.value)) {
    isError.value = true
    setTimeout(() => isError.value = false, 1000)
    return
  }
  authStore.updateProfile(password.value, question.value, answer.value)
  showToast('安全设置已更新')
  emit('close')
}
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content glass-card animate-fade-in" :class="{ 'shake-error': isError }">
      <div class="modal-header">
        <Shield :size="24" class="text-primary" />
        <h4>安全设置</h4>
        <button @click="emit('close')" class="btn-close glass"><X :size="18" /></button>
      </div>

      <div class="form-body">
        <div class="input-group">
          <label class="input-label"><Key :size="14" /> 访问密码 (6位数字)</label>
          <input 
            v-model="password" 
            type="tel" 
            maxlength="6" 
            class="input-field" 
            placeholder="6位数字" 
          />
        </div>

        <div class="input-group">
          <label class="input-label"><HelpCircle :size="14" /> 密保问题</label>
          <input v-model="question" type="text" class="input-field" placeholder="修改密保问题" />
        </div>

        <div class="input-group">
          <label class="input-label">密保答案</label>
          <input v-model="answer" type="text" class="input-field" placeholder="修改答案" />
        </div>

        <button @click="handleSave" class="btn btn-primary w-full">
          <Save :size="18" /> 保存修改
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center; justify-content: center;
  padding: 2rem;
}

.modal-content {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
}

.btn-close {
  position: absolute;
  right: -0.5rem;
  top: -0.5rem;
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.w-full { width: 100%; }

.text-primary { color: var(--primary); }
</style>
