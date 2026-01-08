import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { differenceInDays, parseISO } from 'date-fns'

export const useBillStore = defineStore('bills', () => {
    const bills = ref(JSON.parse(localStorage.getItem('bills') || '[]'))

    const save = () => {
        localStorage.setItem('bills', JSON.stringify(bills.value))
    }

    const addBill = (bill) => {
        bills.value.push({
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            payments: [],
            ...bill
        })
        save()
    }

    const calculateDebt = (bill) => {
        if (!bill) return 0
        const principal = bill.amount
        const payments = bill.payments || []
        const paid = payments.reduce((sum, p) => sum + p.amount, 0)
        const interestRate = (bill.interest || 0) / 100

        if (interestRate <= 0) return Math.max(0, principal - paid)

        // 1. 检查是否存在还款记录，并判断在最后一次还款时是否已结清
        if (payments.length > 0) {
            // 获取最后一次还款的日期
            const lastPaymentDateStr = payments.reduce((max, p) => p.date > max ? p.date : max, payments[0].date)
            const daysAtLastPayment = Math.max(0, differenceInDays(parseISO(lastPaymentDateStr), parseISO(bill.date)))
            const interestAtLastPayment = principal * (interestRate * (daysAtLastPayment / 365))

            // 如果已还款总额 >= 当时的本金+利息（允许0.01误差），则视为永久结清
            if (paid >= (principal + interestAtLastPayment - 0.01)) {
                return 0
            }
        }

        // 2. 如果尚未结清，则计算到今天为止的利息
        const days = Math.max(0, differenceInDays(new Date(), parseISO(bill.date)))
        const years = days / 365
        const totalWithInterest = principal * (1 + interestRate * years)

        const debt = totalWithInterest - paid
        return debt > 0.01 ? debt : 0
    }

    const deleteBill = (id) => {
        const index = bills.value.findIndex(b => b.id === id)
        if (index !== -1) {
            bills.value.splice(index, 1)
            save()
        }
    }

    const totalPending = computed(() => {
        return bills.value.reduce((sum, bill) => {
            return sum + Math.max(0, calculateDebt(bill))
        }, 0)
    })

    return { bills, addBill, deleteBill, totalPending, save, calculateDebt }
})
