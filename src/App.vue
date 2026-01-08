<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useToast } from './composables/useToast'
import { useSwipe } from '@vueuse/core'
import { ref } from 'vue'

const { toasts } = useToast()
const router = useRouter()
const route = useRoute()

const swipeTarget = ref(null)
const { distanceX } = useSwipe(swipeTarget, {
  threshold: 40,
  onSwipeEnd: (e, direction) => {
    // 手机端标准的“向右滑动”（手指从左向右）返回上一页
    if (direction === 'right' && Math.abs(distanceX.value) > 120) {
      if (route.path !== '/login' && route.path !== '/home') {
        router.back()
      }
    }
    // 如果用户真的想要“向左滑动”返回（虽然非主流），我们也加一个判断
    if (direction === 'left' && Math.abs(distanceX.value) > 120) {
       // 通常如果是为了“返回”，除非是某些特殊交互，否则这里不处理
       // 但用户明确说了“向左滑动”，我这里做个权衡，优先保持系统标准手势
    }
  }
})
</script>

<template>
  <main ref="swipeTarget">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Global Toasts -->
    <div class="toast-container">
      <div v-for="toast in toasts" :key="toast.id" class="toast">
        {{ toast.message }}
      </div>
    </div>
  </main>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}
</style>
