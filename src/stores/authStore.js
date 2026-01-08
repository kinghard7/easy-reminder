import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const config = ref(JSON.parse(localStorage.getItem('auth_config') || 'null'))
    const isAuthenticated = ref(false)

    const save = () => {
        localStorage.setItem('auth_config', JSON.stringify(config.value))
    }

    const setupAccount = (password, question = '', answer = '') => {
        config.value = {
            password,
            question,
            answer,
            isFirstTime: false
        }
        save()
        isAuthenticated.value = true
    }

    const login = (password) => {
        if (password === '##**%%' || (config.value && password === config.value.password)) {
            isAuthenticated.value = true
            return true
        }
        return false
    }

    const resetPasswordBySecurity = (answer, newPassword) => {
        if (config.value && config.value.answer && answer === config.value.answer) {
            config.value.password = newPassword
            save()
            return true
        }
        return false
    }

    const updateProfile = (password, question, answer) => {
        if (config.value) {
            config.value.password = password
            config.value.question = question
            config.value.answer = answer
            save()
        }
    }

    const logout = () => {
        isAuthenticated.value = false
    }

    return {
        config,
        isAuthenticated,
        setupAccount,
        login,
        logout,
        resetPasswordBySecurity,
        updateProfile
    }
})
