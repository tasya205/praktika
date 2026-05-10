<template>
  <div class="calendar-layout">
    <aside class="sidebar">
      <!-- aside — это тег для боковой доп. области y страницы -->
      <div class="year-select">
        <button @click="changeYear(-1)">&lt;</button>
        <span>{{ currentYear }}</span>
        <button @click="changeYear(1)">&gt;</button>
      </div>
      <ul class="month-list">
        <li v-for="(month, idx) in months" :key="idx" :class="{ active: idx === currentMonth }"
          @click="currentMonth = idx">
          {{ month }}
        </li>
      </ul>
      <button v-if="isAssistant" class="btn-add" @click="goAddMeeting">+ Встреча</button>
      <router-link to="/profile" class="profile-link">Профиль</router-link>
      <router-link to="/about" class="about-link">О системе</router-link>
      <div class="theme-switch">
        <button @click="toggleTheme" class="theme-btn">
          {{ isPink ? '💙 Синяя' : '💗 Розовая' }}
        </button>
      </div>
    </aside>

    <main class="month-grid">
      <div class="weekdays">
        <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
      </div>
      <div class="days">
        <div v-for="(day, i) in daysArray" :key="i" :class="['day', {
          inactive: !day.current,
          today: day.isToday,
          hasMeetings: day.meetings?.length,
          selected: day.current && day.dateStr === selectedDate
        }]" @click="day.current && openDay(day.dateStr)">
          <span class="day-num">{{ day.num }}</span>
          <div v-if="day.meetings?.length" class="meeting-indicators">
            <span v-for="(m, idx) in day.meetings" :key="idx" class="dot" :style="{ background: dotColor(m) }"></span>
          </div>
        </div>
      </div>
    </main>

    <aside class="day-preview" v-if="selectedDate">
      <div class="preview-header">
        <h3>{{ formattedSelectedDate }}</h3>
        <button class="close-btn" @click="closePreview">&times;</button>
      </div>
      <div v-if="dayMeetings.length">
        <div v-for="m in dayMeetings" :key="m.id" class="preview-item">
          <strong>{{ m.startTime || '--:--' }}</strong> {{ m.title }}
        </div>
      </div>
      <div v-else class="empty">Нет встреч</div>
      <router-link v-if="selectedDate" :to="`/day/${selectedDate}`" class="detail-link">Открыть день</router-link>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from './stores/useStore'
import { useAuth } from './composables/useAuth'

const { state, getMeetingsByDate } = useStore()
const { currentUser, isAssistant: checkAssistant } = useAuth()
const router = useRouter()

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const selectedDate = ref(null)
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

const isAssistant = computed(() => checkAssistant())

const firstDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value, 1))
const lastDayOfMonth = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0))
const startPad = computed(() => (firstDayOfMonth.value.getDay() + 6) % 7)

const daysArray = computed(() => {
  const days = []
  const totalDays = lastDayOfMonth.value.getDate()
  const prevMonthDate = new Date(currentYear.value, currentMonth.value, 0)
  const prevMonthDays = prevMonthDate.getDate()
  for (let i = startPad.value - 1; i >= 0; i--) {
    days.push({
      num: prevMonthDays - i,
      current: false,
      dateStr: formatDate(currentYear.value, currentMonth.value - 1, prevMonthDays - i),
      meetings: []
    })
  }
  const todayStr = new Date().toISOString().slice(0, 10)
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = formatDate(currentYear.value, currentMonth.value, d)
    const meetings = getMeetingsByDate(dateStr)
    days.push({
      num: d,
      current: true,
      isToday: dateStr === todayStr,
      dateStr,
      meetings
    })
  }
  const remain = 42 - days.length
  for (let d = 1; d <= remain; d++) {
    days.push({ num: d, current: false, dateStr: '', meetings: [] })
  }
  return days
})

const dayMeetings = computed(() => selectedDate.value ? getMeetingsByDate(selectedDate.value) : [])

const formattedSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  const [y, m, d] = selectedDate.value.split('-')
  const monthNames = ['января','февраля','марта','апреля','мая','июня',
                      'июля','августа','сентября','октября','ноября','декабря']
  return `${parseInt(d)} ${monthNames[parseInt(m)-1]} ${y}`
})

function formatDate(year, month, day) {
  const m = month < 0 ? 11 : month > 11 ? 0 : month
  const y = month < 0 ? year - 1 : month > 11 ? year + 1 : year
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function changeYear(delta) {
  currentYear.value += delta
}

function openDay(dateStr) {
  selectedDate.value = dateStr
}

function closePreview() {
  selectedDate.value = null
}

function goAddMeeting() {
  router.push('/admin?tab=meetings')
}

function dotColor(meeting) {
  if (meeting.type === 'urgent') return '#f44336'
  if (meeting.type === 'planning') return '#2196F3'
  if (meeting.type === 'informal') return '#4CAF50'
  return '#FF9800'
}

const isPink = ref(false)
function toggleTheme() {
  isPink.value = !isPink.value
  document.body.classList.toggle('pink-theme', isPink.value)
}
</script>

<style scoped>
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: #666;
  padding: 0 5px;
}

.close-btn:hover {
  color: #000;
}

.calendar-layout {
  display: flex;
  height: 100vh;
  background: var(--bg, #fff);
  font-family: Arial;
}

/* сайдбар */
.sidebar {
  width: 200px;
  background: var(--sidebar-bg, #e3f2fd);
  padding: 15px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
}

.year-select {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.year-select button {
  background: var(--accent-light, #bbdefb);
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  color: var(--text, #333);
}

.month-list {
  list-style: none;
  padding: 0;
}

.month-list li {
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 4px;
  color: var(--text, #333);
}

.month-list li.active {
  background: var(--accent, #2196F3);
  color: white;
}

.btn-add {
  width: 100%;
  margin-top: 20px;
  padding: 10px;
  background: var(--accent, #1976D2);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* сетка дней */
.month-grid {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--text, #333);
}

.days {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 4px;
}

.day {
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  position: relative;
  min-height: 80px;
  background: var(--card-bg, white);
  color: var(--text, #333);
}

.day.inactive {
  background: #f5f5f5;
  cursor: default;
  color: #bbb;
}

.day.today {
  border: 2px solid var(--accent, #1976D2);
}

.day.selected {
  background: var(--accent-light, #e3f2fd);
  border-color: var(--accent, #1976D2);
}

.day-num {
  font-size: 1.1rem;
}

.meeting-indicators {
  margin-top: 2px;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 2px;
}

/* превьюшка дня */
.day-preview {
  width: 260px;
  background: var(--card-bg, #f9fcff);
  padding: 15px;
  border-left: 1px solid var(--border, #ddd);
}

.day-preview h3 {
  margin-top: 0;
  color: var(--accent-hover, #1565C0);
}

.preview-item {
  margin: 8px 0;
  color: var(--text, #333);
}

.empty {
  color: #aaa;
  font-style: italic;
  margin: 20px 0;
}

.detail-link {
  display: inline-block;
  margin-top: 10px;
  color: var(--accent, #1976D2);
  text-decoration: underline;
}

/* профильные ссылки */
.profile-link,
.about-link {
  display: block;
  margin-top: 8px;
  text-align: center;
  color: var(--accent, #1976D2);
  text-decoration: none;
  font-size: 0.9rem;
}

.profile-link:hover,
.about-link:hover {
  text-decoration: underline;
}

/* кнопка смены темы */
.theme-switch {
  margin-top: auto;
  padding-top: 15px;
}
.theme-btn {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--accent, #1976D2);
  background: var(--card-bg, white);
  color: var(--accent, #1976D2);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}
.theme-btn:hover {
  background: var(--accent, #1976D2);
  color: white;
}
</style>