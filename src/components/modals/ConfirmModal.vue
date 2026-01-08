<script setup>
import { X, AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    default: '确定要进行此操作吗？'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  type: {
    type: String,
    default: 'primary' // primary, danger, warning
  }
})

const emit = defineEmits(['close', 'confirm'])

const handleConfirm = () => {
  emit('confirm')
  emit('close')
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content glass-card">
        <div class="modal-icon-wrapper" :class="type">
          <AlertCircle v-if="type === 'warning' || type === 'danger'" :size="32" />
          <slot name="icon">
            <AlertCircle v-if="type === 'primary'" :size="32" />
          </slot>
        </div>
        
        <div class="modal-body">
          <h3>{{ title }}</h3>
          <p class="text-muted">{{ message }}</p>
        </div>

        <div class="modal-footer">
          <button @click="emit('close')" class="btn btn-secondary flex-1">
            {{ cancelText }}
          </button>
          <button 
            @click="handleConfirm" 
            class="btn flex-1"
            :class="{
              'btn-primary': type === 'primary',
              'btn-danger': type === 'danger',
              'btn-warning': type === 'warning'
            }"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-content {
  width: 100%;
  max-width: 340px;
  padding: 2.5rem 2rem 2rem;
  text-align: center;
  position: relative;
  overflow: visible;
}

.modal-icon-wrapper {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border: 1px solid var(--border);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-icon-wrapper.primary {
  color: var(--primary);
  border-color: var(--primary-glow);
}

.modal-icon-wrapper.danger {
  color: var(--danger);
  border-color: rgba(239, 68, 68, 0.3);
}

.modal-icon-wrapper.warning {
  color: var(--warning);
  border-color: rgba(245, 158, 11, 0.3);
}

.modal-body {
  margin-bottom: 2rem;
}

.modal-body h3 {
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
}

.modal-body p {
  font-size: 0.95rem;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 1rem;
}

.flex-1 {
  flex: 1;
  white-space: nowrap;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: white;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
