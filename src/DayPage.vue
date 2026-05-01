<template>
  <div class="day-page">
    <h2>{{ dayTitle }}</h2>
    <div v-if="meetings.length === 0" class="empty-day">
      Пока не запланированы встречи
    </div>
    <div v-else>
      <div v-for="m in meetings" :key="m.id" class="meeting-card">
        <div class="time">{{ m.startTime || '--:--' }} – {{ m.endTime || '--:--' }}</div>
        <div class="title">{{ m.title }}</div>
        <div class="meta">Место: {{ m.location?.name || '-' }} | Дресс-код: {{ m.dresscode }}</div>
        <div class="type">Тип: {{ m.type }}</div>
        <!-- дополнительные фильтры, напишу когда-никогда может -->
      </div>
    </div>
    <router-link to="/" class="back-link">← Назад к календарю</router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from './stores/useStore'

const route = useRoute()
const { getMeetingsByDate } = useStore()

const dateParam = route.params.date
const meetings = computed(() => getMeetingsByDate(dateParam))
const dayTitle = computed(() => {
  const [y, m, d] = dateParam.split('-')
  return `${d}.${m}.${y}`
})
</script>

<style scoped>
.day-page { padding: 30px; max-width: 700px; margin: 0 auto; }
.empty-day { padding: 50px; text-align: center; color: #666; font-style: italic; background: #f0f6ff; border-radius: 12px; }
.meeting-card { border-left: 4px solid #2196F3; background: #fff; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.time { font-weight: bold; color: #1565C0; }
.title { font-size: 1.2rem; margin: 5px 0; }
.meta, .type { color: #555; font-size: 0.9rem; }
.back-link { display: inline-block; margin-top: 20px; color: #1976D2; }
</style>