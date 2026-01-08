<script setup>
import { ref, computed } from 'vue'
import { useBillStore } from '../stores/billStore'
import { Plus, Bell, ChevronRight, Wallet, Settings, LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import SecuritySettingsModal from '../components/modals/SecuritySettingsModal.vue'
import ConfirmModal from '../components/modals/ConfirmModal.vue'


const billStore = useBillStore()
const authStore = useAuthStore()
const router = useRouter()
const currentTab = ref('active') // 'active' or 'settled'
const showSettings = ref(false)
const showLogoutConfirm = ref(false)
const showDeleteConfirm = ref(false)
const deleteTargetBill = ref(null)

const handleLogout = () => {
  showLogoutConfirm.value = true
}

const confirmLogout = () => {
  authStore.logout()
  router.push('/login')
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val)
}

const activeBills = computed(() => billStore.bills.filter(b => billStore.calculateDebt(b) > 0.01))
const settledBills = computed(() => billStore.bills.filter(b => billStore.calculateDebt(b) <= 0.01))

const displayBills = computed(() => currentTab.value === 'active' ? activeBills.value : settledBills.value)

const handleLongPress = (bill) => {
  deleteTargetBill.value = bill
  showDeleteConfirm.value = true
}

const handleBillClick = (bill) => {
  // Prevent click if long press triggered (deletion modal is showing)
  if (deleteTargetBill.value) return
  router.push(`/bill/${bill.id}`)
}

const executeDeleteBill = () => {
  if (deleteTargetBill.value) {
    billStore.deleteBill(deleteTargetBill.value.id)
    showDeleteConfirm.value = false
    deleteTargetBill.value = null
  }
}
</script>

<template>
  <div class="home-wrapper">
    <div class="container">

      <header class="home-header">
        <div class="user-profile" @click="showSettings = true">
          <div class="avatar glass">
            <Settings :size="20" color="white" />
          </div>
          <div>
            <h3>安全中心</h3>
          </div>

        </div>
        <button class="btn-icon btn-logout glass" @click="handleLogout">
          <LogOut :size="20" />
        </button>

      </header>

      <div class="summary-card glass-card">
        <p class="label">待还总额</p>
        <h1 class="amount">{{ formatCurrency(billStore.totalPending) }}</h1>
        <div class="stats">
          <div class="stat-item" @click="currentTab = 'active'" :class="{ active: currentTab === 'active' }">
            <span class="dot success"></span>
            <span>{{ activeBills.length }} 笔活跃账单</span>
          </div>
          <div class="stat-item" @click="currentTab = 'settled'" :class="{ active: currentTab === 'settled' }">
            <span class="dot muted"></span>
            <span>{{ settledBills.length }} 笔已还清</span>
          </div>
        </div>
      </div>

      <div class="tabs-container">
        <div class="tab-item" :class="{ active: currentTab === 'active' }" @click="currentTab = 'active'">
          活跃账单
        </div>
        <div class="tab-item" :class="{ active: currentTab === 'settled' }" @click="currentTab = 'settled'">
          历史记录
        </div>
      </div>

      <div class="bill-list">
        <div v-if="displayBills.length === 0" class="empty-state glass">
          <p v-if="currentTab === 'active'">暂无活跃账单记录</p>
          <p v-else>暂无历史还清记录</p>
          <button v-if="currentTab === 'active'" @click="router.push('/add-bill')" class="btn btn-primary">
            <Plus :size="20" /> 记录第一笔
          </button>
        </div>
        
        <div 
          v-for="bill in displayBills" 
          :key="bill.id" 
          class="bill-item glass-card"
          @click="handleBillClick(bill)"
          v-long-press="() => handleLongPress(bill)"
        >
          <div class="bill-info">
            <h5>{{ bill.borrower }}</h5>
            <p class="text-muted">{{ bill.date }}</p>
          </div>
          <div class="bill-amount">
            <div class="amount-group">
              <p class="amount-val">{{ formatCurrency(bill.amount) }}</p>
              <p class="pending-val" v-if="billStore.calculateDebt(bill) > 0.01">
                待还: {{ formatCurrency(billStore.calculateDebt(bill)) }}
              </p>
              <p class="settled-val" v-else>已还清</p>
            </div>
            <ChevronRight :size="16" class="text-muted" />
          </div>
        </div>
      </div>

      <button @click="router.push('/add-bill')" class="fab btn-primary">
        <Plus :size="24" />
      </button>
    </div>

    <SecuritySettingsModal :show="showSettings" @close="showSettings = false" />

    <ConfirmModal 
      :show="showLogoutConfirm"
      title="退出登录"
      message="确定要退出当前账户吗？下次进入仍需输入访问密码以保证安全。"
      confirm-text="确认退出"
      type="danger"
      @close="showLogoutConfirm = false"
      @confirm="confirmLogout"
    />

    <ConfirmModal 
      :show="showDeleteConfirm"
      title="删除账单"
      message="确定要删除这条账单记录吗？删除后不可恢复。"
      confirm-text="确认删除"
      type="danger"
      @close="() => { showDeleteConfirm = false; deleteTargetBill = null }"
      @confirm="executeDeleteBill"
    />

  </div>
</template>


<style scoped>
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
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
  transition: all 0.2s;
}

.btn-icon:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.1);
}

.btn-logout {
  color: var(--danger);
  border-color: rgba(239, 68, 68, 0.2);
}

.btn-logout:active {
  background: rgba(239, 68, 68, 0.1);
}

.summary-card {
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
}

.summary-card .label {
  opacity: 0.8;
  font-size: 0.9rem;
}

.summary-card .amount {
  font-size: 2.5rem;
  margin: 0.5rem 0;
}

.stats {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.stat-item.active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.success {
  background: var(--success);
}

.dot.muted {
  background: var(--text-muted);
}

.tabs-container {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
}

.tab-item {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  position: relative;
  padding: 0.25rem 0.5rem;
  transition: color 0.3s;
}

.tab-item.active {
  color: var(--text);
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -0.6rem;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--primary);
  border-radius: 2px;
}

.bill-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 5rem;
}

.bill-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}


.bill-info {
  flex: 1;
}

.bill-info h5 {
  margin: 0;
  font-size: 1rem;
}

.bill-amount {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-align: right;
}

.amount-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.amount-val {
  font-weight: 700;
  color: var(--text);
  font-size: 1rem;
}

.pending-val {
  font-size: 0.75rem;
  color: var(--secondary);
  font-weight: 600;
}

.settled-val {
  font-size: 0.75rem;
  color: var(--success);
  font-weight: 600;
}

.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.fab {
  position: fixed;
  bottom: 2.5rem;
  right: 1.5rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab:active {
  transform: scale(0.9) rotate(90deg);
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
}

.fab::after {
  content: '';
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  opacity: 0.3;
  z-index: -1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.4; }
  70% { transform: scale(1.3); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}
</style>
