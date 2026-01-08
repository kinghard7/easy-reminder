<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBillStore } from '../stores/billStore'
import { ChevronLeft, Send, History, DollarSign, Calendar, Info, ChevronDown, ChevronUp } from 'lucide-vue-next'
import DatePickerModal from '../components/modals/DatePickerModal.vue'

const route = useRoute()
const router = useRouter()
const billStore = useBillStore()

const bill = computed(() => billStore.bills.find(b => b.id === route.params.id))

const totalPaid = computed(() => {
  if (!bill.value) return 0
  return (bill.value.payments || []).reduce((sum, p) => sum + p.amount, 0)
})

const currentDebt = computed(() => billStore.calculateDebt(bill.value))

const formatCurrency = (val) => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val)
}

const showPaymentModal = ref(false)
const showDatePicker = ref(false)
const paymentAmount = ref(0)
const isError = ref(false)
const isNoteExpanded = ref(false)

const handleDateUpdate = (newDate) => {
  bill.value.date = newDate
  billStore.save()
  showDatePicker.value = false
}



const updateNote = (e) => {
  bill.value.note = e.target.value
  billStore.save()
}

const addPayment = () => {
  // 允许 0.05 的误差，防止因四舍五入导致无法还清
  if (paymentAmount.value <= 0 || paymentAmount.value > currentDebt.value + 0.05) {
    isError.value = true
    setTimeout(() => {
      isError.value = false
    }, 1000)
    return
  }
  if (!bill.value.payments) bill.value.payments = []
  bill.value.payments.push({
    id: Date.now().toString(),
    amount: paymentAmount.value,
    date: new Date().toISOString().split('T')[0]
  })
  billStore.save()
  showPaymentModal.value = false
  paymentAmount.value = 0
}
</script>

<template>
  <div class="bill-detail-page">
    <div v-if="bill" class="container">
      <header class="header">
        <button @click="router.back()" class="btn-icon glass">
          <ChevronLeft :size="24" />
        </button>
        <h3>账单详情</h3>
        <button v-if="currentDebt > 0.01" @click="router.push('/templates')" class="btn-icon glass">
          <Send :size="20" />
        </button>
        <div v-else style="width: 36px"></div>
      </header>

      <div class="debt-card glass-card">
        <div class="header-info">
          <p class="borrower-name">{{ bill.borrower }}</p>
          <p class="status-badge" :class="{ 'overdue': currentDebt > 0.01 }">
            {{ currentDebt > 0.01 ? '待还中' : '已结清' }}
          </p>
        </div>
        <h1 class="main-amount">
          <template v-if="currentDebt > 0.01">
            {{ formatCurrency(currentDebt) }}
          </template>
          <template v-else>
            已还清
          </template>
        </h1>
        <p class="summary-text">本金: {{ formatCurrency(bill.amount) }} | 已还: {{ formatCurrency(totalPaid) }}</p>
      </div>

      <div class="info-grid">
        <div class="info-item glass">
          <div class="icon-label-wrapper">
            <Calendar :size="16" class="text-muted" />
            <p class="info-label">起借日期</p>
          </div>
          <div class="editable-info" @click="showDatePicker = true">
            <div class="info-input clickable-text">{{ bill.date }}</div>
          </div>
        </div>
        <div class="info-item glass">
          <div class="icon-label-wrapper">
            <DollarSign :size="16" class="text-muted" />
            <p class="info-label">年化利率</p>
          </div>
          <div class="info-val-wrapper">
            <p class="info-val">{{ bill.interest }}%</p>
          </div>
        </div>
      </div>

      <div class="note-section glass-card" :class="{ expanded: isNoteExpanded }">
        <div class="note-header" @click="isNoteExpanded = !isNoteExpanded">
          <div class="header-left">
            <span class="text-muted"><Info :size="18" /></span>
            <p class="section-title-alt">备注信息</p>
          </div>
          <component :is="isNoteExpanded ? ChevronUp : ChevronDown" :size="18" class="text-muted" />
        </div>
        <transition name="expand">
          <textarea 
            v-if="isNoteExpanded"
            :value="bill.note" 
            @input="updateNote"
            placeholder="在此输入备注..." 
            class="note-textarea"
            rows="3"
          ></textarea>
        </transition>
      </div>

      <div class="section-header">
        <h4 class="section-title"><History :size="18" /> 还款记录</h4>
        <button 
          v-if="currentDebt > 0" 
          @click="showPaymentModal = true" 
          class="add-btn"
        >
          + 添加还款
        </button>
        <span v-else class="text-muted status-text">已结清</span>
      </div>

      <div class="payment-history">
        <div v-if="!bill.payments || bill.payments.length === 0" class="empty-mini glass">
          暂无还款记录
        </div>
        <div v-for="pay in bill.payments" :key="pay.id" class="payment-item glass">
          <div class="pay-info">
            <p class="pay-date">{{ pay.date }}</p>
            <p class="pay-desc">部分还款</p>
          </div>
          <p class="pay-amount">+ {{ formatCurrency(pay.amount) }}</p>
        </div>
      </div>

      <div class="action-bar" v-if="currentDebt > 0.01">
        <button @click="router.push({ path: '/templates', query: { id: bill.id } })" class="btn btn-primary flex-1">
          <Send :size="18" /> 发起催单
        </button>
      </div>

      <div v-if="showPaymentModal" class="modal-overlay">
        <div class="modal-content glass-card animate-fade-in">
          <div class="modal-header">
            <h4>记录还款</h4>
            <div class="subtitle">请确认本次还款金额</div>
          </div>
          
          <div class="input-container" :class="{ 'shake-error': isError }">
            <div class="input-header">
              <span class="currency-symbol">¥</span>
              <input 
                v-model.number="paymentAmount" 
                type="number" 
                class="amount-input" 
                placeholder="0.00" 
                autoFocus
              />
            </div>
            <div class="total-hint-row">
              <span class="pending-hint">剩余待还: {{ formatCurrency(currentDebt) }}</span>
              <button @click="paymentAmount = Math.round(currentDebt * 100) / 100" class="pay-all-tag">全部还清</button>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="showPaymentModal = false" class="btn-cancel">取消</button>
            <button @click="addPayment" class="btn-confirm">确认还款</button>
          </div>
        </div>

      </div>

      <DatePickerModal 
        :show="showDatePicker"
        :model-value="bill.date"
        @update:modelValue="handleDateUpdate"
        @close="showDatePicker = false"
      />
    </div>
    <div v-else class="container flex-center" style="height: 100vh;">
      <p class="text-muted">加载中...</p>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 0;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.debt-card {
  padding: 1.5rem 1.25rem;
  text-align: center;
  margin-bottom: 1rem;
}

.borrower-name {
  font-size: 1rem;
  color: var(--text-muted);
}

.main-amount {
  font-size: 2.25rem;
  margin: 0.5rem 0;
  font-weight: 800;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  background: var(--success);
  color: white;
}

.status-badge.overdue {
  background: var(--danger);
}

.summary-text {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.info-item {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-radius: 1rem;
}

.icon-label-wrapper {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.info-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.info-val, .info-input {
  font-weight: 700;
  font-size: 1rem;
  background: none;
  border: none;
  color: var(--text);
  font-family: inherit;
  padding: 0;
  width: 100%;
}

.info-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.05);
}

.editable-info {
  flex: 1;
}

.note-section {
  margin-bottom: 1rem;
  padding: 0.75rem 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.note-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.note-textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: none;
  padding: 0.6rem;
  border-radius: 0.6rem;
  margin-top: 0.75rem;
  transition: all 0.3s;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  padding: 0;
}

.note-textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.05);
}

.note-textarea::placeholder {
  color: var(--text-muted);
  opacity: 0.5;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0 0.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: var(--text);
  font-weight: 600;
}

.section-title-alt {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
}

.add-btn {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: var(--primary);
  padding: 0.3rem 0.7rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:active {
  transform: scale(0.95);
  background: rgba(99, 102, 241, 0.2);
}

.status-text {
  font-size: 0.8rem;
  padding: 0.3rem 0.7rem;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 2rem;
}

.payment-history {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 5rem;
}

.payment-item {
  padding: 0.85rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 1rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
}

.pay-date {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.1rem;
}

.pay-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}

.pay-amount {
  color: var(--success);
  font-weight: 700;
  font-size: 1.05rem;
}

.empty-mini {
  padding: 1.5rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(to top, var(--bg) 80%, transparent);
  display: flex;
}

.flex-1 { flex: 1; }

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-content {
  width: 100%;
  max-width: 340px;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.modal-header h4 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.input-container {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1.25rem;
  margin-bottom: 2rem;
  transition: all 0.3s;
}

.input-container:focus-within {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.05);
}

.input-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.currency-symbol {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
}

.amount-input {
  background: none;
  border: none;
  color: var(--text);
  font-size: 2rem;
  font-weight: 700;
  width: 100%;
  font-family: inherit;
  outline: none;
}

.total-hint-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.pending-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.pay-all-tag {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pay-all-tag:active {
  transform: scale(0.95);
  background: rgba(99, 102, 241, 0.2);
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 0.85rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
}

.btn-confirm {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  box-shadow: 0 4px 15px var(--primary-glow);
}

.btn-confirm:active {
  transform: translateY(2px);
}

.clickable-text {
  cursor: pointer;
}

</style>
