<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBillStore } from '../stores/billStore'
import { useToast } from '../composables/useToast'
import { ChevronLeft, Save } from 'lucide-vue-next'
import DatePickerModal from '../components/modals/DatePickerModal.vue'

const router = useRouter()
const billStore = useBillStore()
const { showToast } = useToast()

const form = ref({
  borrower: '',
  amount: null,
  date: new Date().toISOString().split('T')[0],
  interest: 0, // 年化利率
  note: ''
})

const scrollIntoView = (e) => {
  // 延迟一秒给手机键盘弹出留出时间
  setTimeout(() => {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}

const handleSave = () => {
  if (!form.value.borrower || !form.value.amount) return
  billStore.addBill({ ...form.value })
  showToast('账单已成功录入')
  router.push('/home')
}

const showDatePicker = ref(false)
const handleDateUpdate = (newDate) => {
  form.value.date = newDate
  showDatePicker.value = false
}
</script>

<template>
  <div class="container animate-fade-in">

    <header class="header">
      <button @click="router.back()" class="btn-icon glass">
        <ChevronLeft :size="24" />
      </button>
      <h3>新增账单</h3>
      <div style="width: 40px"></div>
    </header>

    <form @submit.prevent="handleSave" class="bill-form">
      <div class="input-group">
        <label class="input-label">借款人姓名</label>
        <input 
          v-model="form.borrower" 
          type="text" 
          placeholder="请输入姓名" 
          class="input-field"
          required
          @focus="scrollIntoView"
        />
      </div>

      <div class="input-group">
        <label class="input-label">借款金额 (¥)</label>
        <input 
          v-model.number="form.amount" 
          type="number" 
          placeholder="0.00" 
          class="input-field"
          required
          @focus="scrollIntoView"
        />
      </div>

      <div class="input-group">
        <label class="input-label">借款日期</label>
        <div 
          class="input-field clickable-select" 
          @click="showDatePicker = true"
        >
          {{ form.date }}
        </div>
      </div>

      <div class="input-group">
        <label class="input-label">年化利率 (%)</label>
        <input 
          v-model.number="form.interest" 
          type="number" 
          placeholder="0" 
          class="input-field"
          @focus="scrollIntoView"
        />
        <p class="hint">设为 0 表示无利息</p>
      </div>

      <div class="input-group">
        <label class="input-label">备注 (可选)</label>
        <textarea 
          v-model="form.note" 
          placeholder="添加备注..." 
          class="input-field"
          rows="3"
          @focus="scrollIntoView"
        ></textarea>
      </div>

      <button type="submit" class="btn btn-primary w-full mt-2">
        <Save :size="20" /> 保存账单
      </button>
    </form>
  </div>


  <DatePickerModal 
    :show="showDatePicker"
    :model-value="form.date"
    @update:modelValue="handleDateUpdate"
    @close="showDatePicker = false"
  />
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 0;
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

.bill-form {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.w-full {
  width: 100%;
}

.mt-2 {
  margin-top: 1.25rem;
}

.hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* 增加超大底部间距，确保键盘弹出时能滚上来到视口中心 */
  padding-bottom: 60vh;
}

.input-field {
  padding: 0.75rem 1rem;
}

.input-group {
  margin-bottom: 1rem;
}

textarea.input-field {
  resize: none;
}

.clickable-select {
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style>
