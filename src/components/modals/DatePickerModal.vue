<script setup>
import { ref, computed, watch } from 'vue'
import { format, addMonths, subMonths, setYear, setMonth, setDate, getDaysInMonth, startOfMonth, getDay, isSameDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String, // YYYY-MM-DD
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const view = ref('date') // 'date', 'year', or 'month'
const internalDate = ref(new Date()) // The date currently being viewed/selected
const today = new Date()

// Initialize internalDate from props
watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.modelValue) {
      internalDate.value = new Date(props.modelValue)
    } else {
      internalDate.value = new Date()
    }
    view.value = 'date'
  }
}, { immediate: true })

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const selectedYear = computed(() => internalDate.value.getFullYear())
const selectedMonth = computed(() => internalDate.value.getMonth())
const currentMonthLabel = computed(() => format(internalDate.value, 'yyyy年M月', { locale: zhCN }))
const formattedDateDisplay = computed(() => format(internalDate.value, 'M月d日 EEEE', { locale: zhCN }))

const daysInMonth = computed(() => getDaysInMonth(internalDate.value))
const startOfMonthOffset = computed(() => getDay(startOfMonth(internalDate.value)))

// Generate a range of years (e.g., 100 years back, 10 years forward)
const yearRange = computed(() => {
  const currentY = new Date().getFullYear()
  const years = []
  for (let i = currentY - 50; i <= currentY + 10; i++) {
    years.push(i)
  }
  return years.reverse() // Newest first
})

const prevMonth = () => {
  internalDate.value = subMonths(internalDate.value, 1)
}

const nextMonth = () => {
  internalDate.value = addMonths(internalDate.value, 1)
}

const selectDate = (day) => {
  internalDate.value = setDate(internalDate.value, day)
}

const selectYear = (year) => {
  internalDate.value = setYear(internalDate.value, year)
  view.value = 'date'
}

const selectMonth = (monthIndex) => {
  internalDate.value = setMonth(internalDate.value, monthIndex)
  view.value = 'date'
}

const isSelected = (day) => {
  const dateToCheck = setDate(internalDate.value, day)
  // Check if it matches the originally passed modelValue (if we want to highlight "currently saved")
  // OR highlight the one currently clicked in this session?
  // Usually pickers highlight the one being "viewed/selected" in the interaction
  return dateToCheck.getDate() === internalDate.value.getDate()
}

const isToday = (day) => {
  const dateToCheck = setDate(internalDate.value, day)
  return isSameDay(dateToCheck, today)
}

const confirm = () => {
  emit('update:modelValue', format(internalDate.value, 'yyyy-MM-dd'))
  emit('close')
}

// Year scroll handling could be added, but simple grid is okay for now
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content glass-card animate-fade-in">
      <!-- Header -->
      <div class="picker-header">
        <div class="year-selector" @click="view = 'year'" :class="{ active: view === 'year' }">
          {{ selectedYear }}年
        </div>
        <div class="date-display" @click="view = 'date'" :class="{ active: view === 'date' }">
          {{ formattedDateDisplay }}
        </div>
      </div>

      <!-- Date View -->
      <div v-if="view === 'date'" class="calendar-view">
        <div class="month-nav">
          <button @click="prevMonth" class="nav-btn"><ChevronLeft :size="20" /></button>
          <span 
            class="month-label clickable-label" 
            @click="view = 'month'"
          >
            {{ currentMonthLabel }}
          </span>
          <button @click="nextMonth" class="nav-btn"><ChevronRight :size="20" /></button>
        </div>

        <div class="weekdays">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>

        <div class="days-grid">
          <div v-for="n in startOfMonthOffset" :key="'space-' + n"></div>
          <div v-for="day in daysInMonth" :key="day" 
               class="day-cell" 
               :class="{ 
                 'selected': isSelected(day),
                 'today': isToday(day) 
               }"
               @click="selectDate(day)">
            {{ day }}
          </div>
        </div>
      </div>



      <!-- Month View -->
      <div v-else-if="view === 'month'" class="month-view">
        <div class="months-grid">
          <div v-for="(m, index) in months" :key="m"
               class="month-cell"
               :class="{ 'selected': index === selectedMonth }"
               @click="selectMonth(index)">
            {{ m }}
          </div>
        </div>
      </div>

      <!-- Year View -->
      <div v-else class="year-view">
        <div class="years-grid">
          <div v-for="year in yearRange" :key="year"
               class="year-cell"
               :class="{ 'selected': year === selectedYear }"
               @click="selectYear(year)">
            {{ year }}
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('close')">取消</button>
        <button class="btn-confirm" @click="confirm">确定</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  align-items: flex-start;
  justify-content: center;
  padding: 1.5rem;
  padding-top: 15vh;
}

.modal-content {
  width: 100%;
  max-width: 340px;
  max-height: 75vh;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.picker-header {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  padding: 1rem;
  color: white;
}

.year-selector {
  font-size: 0.875rem;
  opacity: 0.7;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-bottom: 0.125rem;
}

.year-selector.active, .year-selector:hover {
  opacity: 1;
}

.date-display {
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  line-height: 1.2;
}

.date-display.active, .date-display:hover {
  opacity: 0.8;
}

/* Calendar View */
.calendar-view {
  padding: 0.75rem 1rem 0;
}

.month-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.month-label {
  font-weight: 600;
  font-size: 0.95rem;
}

.clickable-label {
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.clickable-label:hover {
  background: rgba(255,255,255,0.1);
}

.nav-btn {
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.nav-btn:hover {
  background: rgba(255,255,255,0.1);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 0.375rem;
  margin-bottom: 0.75rem;
  min-height: 200px; /* Keep height consistent */
}

.day-cell {
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.875rem;
  cursor: pointer;
  margin: 0 auto;
  transition: all 0.2s;
}

.day-cell:hover:not(.selected) {
  background: rgba(255,255,255,0.1);
}

.day-cell.selected {
  background: var(--primary);
  color: white;
  box-shadow: 0 2px 8px var(--primary-glow);
}

.day-cell.today {
  border: 1px solid var(--primary);
  color: var(--primary);
}

.day-cell.selected.today {
  color: white;
}

.day-cell.selected.today {
  color: white;
}

/* Month View */
.month-view {
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 0.75rem;
  width: 100%;
}

.month-cell {
  padding: 0.75rem 0;
  text-align: center;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.month-cell:hover {
  background: rgba(255,255,255,0.1);
}

.month-cell.selected {
  background: var(--primary);
  color: white;
  font-weight: 700;
}

/* Year View */
.year-view {
  height: 260px;
  overflow-y: auto;
  padding: 0.75rem 0;
}

.years-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  padding: 0 1rem;
}

.year-cell {
  padding: 0.625rem 0;
  text-align: center;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.year-cell:hover {
  background: rgba(255,255,255,0.1);
}

.year-cell.selected {
  background: var(--primary);
  color: white;
  font-weight: 700;
}

/* Actions */
.modal-actions {
  display: flex;
  padding: 0.75rem 1rem 1rem;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel {
  background: none;
  border: none;
  color: var(--text-muted);
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

.btn-confirm {
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

/* Scrollbar for years */
.year-view::-webkit-scrollbar {
  width: 4px;
}
.year-view::-webkit-scrollbar-track {
  background: transparent;
}
.year-view::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
}
</style>
