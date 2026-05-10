<template>
  <div class="workers-page">
    <h2>Работники</h2>
    <table class="workers-table">
      <thead>
        <tr>
          <th>ФИО</th>
          <th>Роль</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.fio }}</td>
          <td>{{ roleName(u.role) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from './stores/useStore'

const { state } = useStore()
const users = computed(() => state.users)

function roleName(role) {
  const map = { executive: 'Руководитель', assistant: 'Ассистент', coordinator: 'Координатор', aide: 'Помощник' }
  return map[role] || role
}
</script>

<style scoped>
.workers-page {
  padding: 25px;
  max-width: 700px;
  margin: 0 auto;
  background: var(--bg, #f0f6ff);
  min-height: 100vh;
  color: var(--text, #333);
}

.workers-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--card-bg, white);
  border-radius: 8px;
  overflow: hidden;
}

.workers-table th,
.workers-table td {
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid var(--border, #ddd);
}

.workers-table th {
  background: var(--accent-light, #e3f2fd);
  color: var(--accent-hover, #1565C0);
}
</style>