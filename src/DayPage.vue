<template>
  <div class="day-page">
    <div class="day-card">
      <div class="day-header">
        <h2>{{ dayTitle }}</h2>
        <router-link to="/" class="close-btn" title="Закрыть">&times;</router-link>
      </div>

      <div v-if="meetings.length === 0" class="empty-day">
        <span class="empty-icon">📭</span>
        <p>Пока не запланированы встречи</p>
        <router-link to="/" class="back-calendar-link">← Вернуться к календарю</router-link>
      </div>

      <div v-else>
        <div v-for="m in meetings" :key="m.id" class="meeting-card">
          <div class="time">{{ m.startTime || '--:--' }} – {{ m.endTime || '--:--' }}</div>
          <div v-if="canSeeField(m, 'title')" class="title">{{ m.title }}</div>
          <div v-if="canSeeField(m, 'location')" class="meta">Место: {{ m.location || '-' }}</div>
          <div v-if="canSeeField(m, 'dresscode')" class="meta">Дресс-код: {{ m.dresscode || 'не указан' }}</div>
          <div v-if="canSeeField(m, 'type')" class="meta">Тип: {{ typeName(m.type) }}</div>
          <div v-if="canSeeField(m, 'transport')" class="meta">Транспорт: {{ m.transport || '-' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from './stores/useStore'
import { useAuth } from './composables/useAuth'

const route = useRoute()
const { getMeetingsByDate } = useStore()
const { currentUser } = useAuth()

const dateParam = route.params.date
const meetings = computed(() => {
  const all = getMeetingsByDate(dateParam)
  const role = currentUser.value?.role
  // ассистент и руководитель видят всё
  if (role === 'assistant' || role === 'executive') return all
  // координатор видит встречи, где ему разрешено
  if (role === 'coordinator') {
    return all.filter(m => {
      const perms = m.permissions?.coordinator
      return perms?.viewFields?.length > 0
    })
  }
  // помощник видит только встречи с разрешёнными полями 
  if (role === 'aide') {
    return all.filter(m => {
      const perms = m.permissions?.aide
      return perms?.viewFields?.length > 0
    })
  }
  return []
})

const dayTitle = computed(() => {
  const [y, m, d] = dateParam.split('-')
  return `${d}.${m}.${y}`
})

function canSeeField(meeting, field) {
  const role = currentUser.value?.role
  if (role === 'assistant' || role === 'executive') return true
  const perms = meeting.permissions?.[role]
  return perms?.viewFields?.includes(field)
}
</script>

<style scoped>
.day-page {
  padding: 30px;
  max-width: 650px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg, #f0f6ff);
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.day-card {
  background: var(--card-bg, white);
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-top: 20px;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border, #eee);
}

.day-header h2 {
  margin: 0;
  color: var(--accent, #1565C0);
}

.close-btn {
  text-decoration: none;
  font-size: 1.8rem;
  color: var(--muted, #aaa);
  line-height: 1;
  padding: 0 5px;
}

.close-btn:hover {
  color: var(--danger, #f44336);
}

.empty-day {
  text-align: center;
  padding: 50px 20px;
  color: var(--muted, #888);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 10px;
}

.back-calendar-link {
  display: inline-block;
  margin-top: 15px;
  color: var(--accent, #1976D2);
}

.meeting-card {
  border-left: 4px solid var(--accent, #2196F3);
  background: var(--card-bg, #fafafa);
  padding: 16px;
  margin: 14px 0;
  border-radius: 0 10px 10px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.time {
  font-weight: bold;
  color: var(--accent-hover, #1565C0);
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.title {
  font-size: 1.2rem;
  margin: 6px 0;
  color: var(--text, #333);
}

.meta {
  color: var(--muted, #666);
  font-size: 0.9rem;
  margin: 3px 0;
}
</style>