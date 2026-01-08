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

app.mount('#app')
