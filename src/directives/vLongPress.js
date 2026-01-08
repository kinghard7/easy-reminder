export default {
    mounted(el, binding) {
        if (typeof binding.value !== 'function') {
            console.warn(`[v-long-press] The provided value must be a function.`)
            return
        }

        let pressTimer = null
        const duration = 500 // 500ms as requested

        const start = (e) => {
            if (e.type === 'click' && e.button !== 0) return;

            if (pressTimer === null) {
                pressTimer = setTimeout(() => {
                    binding.value(e)
                    pressTimer = null
                }, duration)
            }
        }

        const cancel = (e) => {
            if (pressTimer !== null) {
                clearTimeout(pressTimer)
                pressTimer = null
            }
        }

        // Touch events for mobile
        el.addEventListener('touchstart', start, { passive: true })
        el.addEventListener('touchend', cancel)
        el.addEventListener('touchcancel', cancel)

        // Mouse events for desktop testing
        el.addEventListener('mousedown', start)
        el.addEventListener('click', cancel)
        el.addEventListener('mouseout', cancel)
    },
    unmounted(el) {
        // Cleanup will be handled by browser removing listeners when element is removed
        // But good practice not really needed for simple ELs unless we stored them
    }
}
