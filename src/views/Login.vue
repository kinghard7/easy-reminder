<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'
import { Lock, ArrowRight, ShieldCheck, HelpCircle, Info, ChevronDown, ChevronUp } from 'lucide-vue-next'


const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast()

const mode = ref(authStore.config ? 'login' : 'setup') // setup, login, forgot
const password = ref('')
const confirmPassword = ref('')
const question = ref('')
const answer = ref('')
const newPassword = ref('')
const isError = ref(false)
const loading = ref(false)
const showSecuritySetup = ref(false)


const SUPER_PASSWORD = '##**%%'

const handleAction = () => {
  if (mode.value === 'setup') {
    if (password.value !== confirmPassword.value || !/^\d{6}$/.test(password.value)) {
      triggerError()
      return
    }
    authStore.setupAccount(password.value, question.value, answer.value)
    router.push('/home')
  } else if (mode.value === 'login') {
    if (authStore.login(password.value)) {
      router.push('/home')
    } else {
      triggerError()
    }
  } else if (mode.value === 'forgot') {
    if (!/^\d{6}$/.test(newPassword.value)) {
      triggerError()
      return
    }
    if (authStore.resetPasswordBySecurity(answer.value, newPassword.value)) {
      showToast('密码重置成功，请登录')
      mode.value = 'login'
      password.value = ''
      answer.value = ''
    } else {
      triggerError()
    }
  }
}

const triggerError = () => {
  isError.value = true
  setTimeout(() => isError.value = false, 1000)
}
</script>

<template>
  <div class="login-container flex-center">
    <div class="login-box animate-fade-in">
      <div class="logo-area">
        <div class="logo-icon glass">
          <Lock v-if="mode === 'login'" :size="40" color="var(--primary)" />
          <ShieldCheck v-else :size="40" color="var(--primary)" />
        </div>
        <h1>简账</h1>
        <p class="text-muted">
          {{ mode === 'setup' ? '首次进入，请设置您的访问密码' : '安全访问验证' }}
        </p>
      </div>

      <div class="form-area" :class="{ 'shake-error': isError }">
        <!-- SETUP MODE -->
        <template v-if="mode === 'setup'">
          <div class="input-group">
            <label class="input-label">访问密码 (6位数字)</label>
            <input 
              v-model="password" 
              type="tel" 
              maxlength="6" 
              placeholder="请输入6位数字" 
              class="input-field" 
            />
          </div>
          <div class="input-group">
            <label class="input-label">确认密码</label>
            <input 
              v-model="confirmPassword" 
              type="tel" 
              maxlength="6" 
              placeholder="请再次输入" 
              class="input-field" 
            />
          </div>
          <div class="divider clickable" @click="showSecuritySetup = !showSecuritySetup">
            <span>可选：安全密保</span>
            <component :is="showSecuritySetup ? ChevronUp : ChevronDown" :size="14" class="text-muted" />
          </div>
          
          <transition name="expand">
            <div v-if="showSecuritySetup">
              <div class="input-group">
                <label class="input-label">密保问题 (用于找回密码)</label>
                <input v-model="question" type="text" placeholder="例如：我的宠物名字？" class="input-field" />
              </div>
              <div class="input-group">
                <label class="input-label">密保答案</label>
                <input v-model="answer" type="text" placeholder="请输入答案" class="input-field" />
              </div>
            </div>
          </transition>

        </template>

        <!-- LOGIN MODE -->
        <template v-else-if="mode === 'login'">
          <div class="input-group">
            <label class="input-label">请输入密码</label>
            <input 
              v-model="password" 
              type="tel" 
              maxlength="10" 
              placeholder="6位数字" 
              class="input-field" 
              @keyup.enter="handleAction"
            />
          </div>
          <div class="forgot-link">
            <span @click="mode = 'forgot'">忘记密码？</span>
          </div>
        </template>

        <!-- FORGOT MODE -->
        <template v-else-if="mode === 'forgot'">
          <div v-if="authStore.config?.question" class="security-q glass">
            <HelpCircle :size="18" />
            <span>{{ authStore.config?.question }}</span>
          </div>
          <div v-else class="security-q glass danger">
            <Info :size="18" />
            <span>未设置密保。请使用超级密码登录。</span>
          </div>

          <template v-if="authStore.config?.question">
            <div class="input-group">
              <label class="input-label">您的答案</label>
              <input v-model="answer" type="text" placeholder="请输入密保答案" class="input-field" />
            </div>
            <div class="input-group">
              <label class="input-label">设置新密码 (6位数字)</label>
              <input v-model="newPassword" type="tel" maxlength="6" placeholder="6位数字" class="input-field" />
            </div>
          </template>
          <div class="forgot-link">
            <span @click="mode = 'login'">返回登录</span>
          </div>
        </template>

        <button v-if="mode !== 'forgot' || authStore.config?.question" @click="handleAction" class="btn btn-primary w-full mt-1">
          {{ mode === 'setup' ? '完成设置' : (mode === 'login' ? '进入系统' : '重置并登录') }}
          <ArrowRight :size="20" />
        </button>
      </div>
    </div>

    <div class="bg-decoration">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

.login-box {
  width: 100%;
  max-width: 420px;
  z-index: 10;
}

.logo-area {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2rem;
}

.logo-area h1 {
  font-size: 2.25rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #fff, var(--text-muted));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.form-area {
  background: var(--card-bg);
  padding: 2.5rem;
  border-radius: 2rem;
  border: 1px solid var(--border);
  backdrop-filter: blur(20px);
}

.divider {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--border);
}

.divider span {
  background: #1e293b;
  padding: 0 0.5rem;
  position: relative;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.divider.clickable {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.divider.clickable:active {
  opacity: 0.7;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 200px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-bottom: 0;
}


.forgot-link {
  text-align: right;
  margin-top: -1rem;
  margin-bottom: 1.5rem;
}

.forgot-link span {
  font-size: 0.85rem;
  color: var(--primary);
  cursor: pointer;
}

.security-q {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  font-weight: 500;
}

.w-full { width: 100%; }
.mt-1 { margin-top: 1rem; }

.terms {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  text-align: center;
  color: var(--text-muted);
  opacity: 0.6;
}

/* Background Decoration */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.blob {
  position: absolute;
  filter: blur(80px);
  border-radius: 50%;
  opacity: 0.3;
}

.blob-1 {
  width: 300px;
  height: 300px;
  background: var(--primary);
  top: -100px;
  right: -50px;
}

.blob-2 {
  width: 250px;
  height: 250px;
  background: var(--secondary);
  bottom: -50px;
  left: -50px;
}
</style>
