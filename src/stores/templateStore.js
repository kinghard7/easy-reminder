import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useTemplateStore = defineStore('templates', () => {
    const defaultTemplates = [
        {
            id: 1,
            name: '温和',
            content: '嘿 {name}，最近怎么样？提醒一下之前那笔 {amount} 元的借款，如果你手头方便的话可以帮我处理一下哈，谢啦！',
            type: 'gentle'
        },
        {
            id: 2,
            name: '正式',
            content: '借款人 {name} 您好，您于 {date} 借出的款项目前待还金额为 {amount} 元。请及时核对并完成还款。',
            type: 'formal'
        },
        {
            id: 3,
            name: '直接',
            content: '兄弟，还欠我 {amount} 块呢，看到回个话，转账还是红包？',
            type: 'direct'
        },
        {
            id: 4,
            name: '自定义',
            content: '在此输入您的自定义消息内容，可以使用 {name}、{amount}、{date} 等变量。',
            type: 'custom'
        }
    ]

    const templates = ref(JSON.parse(localStorage.getItem('user_templates')) || defaultTemplates)

    watch(templates, (newVal) => {
        localStorage.setItem('user_templates', JSON.stringify(newVal))
    }, { deep: true })

    return { templates }
})
