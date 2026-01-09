import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import './style.css'
import App from './App.vue'

// Define routes (to be expanded)
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('./views/Login.vue') },
  { path: '/home', component: () => import('./views/Home.vue') },
  { path: '/add-bill', component: () => import('./views/AddBill.vue') },
  { path: '/bill/:id', component: () => import('./views/BillDetail.vue') },
  { path: '/templates', component: () => import('./views/Templates.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
const pinia = createPinia()

import vLongPress from './directives/vLongPress'

app.use(pinia)
app.use(router)
app.directive('long-press', vLongPress)

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.path !== '/login' && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})


app.config.errorHandler = (err, instance, info) => {
  console.error('Global Error:', err, info)
  const errorDiv = document.createElement('div')
  errorDiv.style.position = 'fixed'
  errorDiv.style.top = '0'
  errorDiv.style.left = '0'
  errorDiv.style.width = '100%'
  errorDiv.style.backgroundColor = '#ef4444'
  errorDiv.style.color = 'white'
  errorDiv.style.padding = '20px'
  errorDiv.style.zIndex = '999999'
  errorDiv.style.whiteSpace = 'pre-wrap'
  errorDiv.innerText = `App Error: ${err.message}\nInfo: ${info}\nStack: ${err.stack}`
  document.body.appendChild(errorDiv)
}

app.mount('#app')
