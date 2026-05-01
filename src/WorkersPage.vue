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
}

.workers-table {
  width: 100%;
  border-collapse: collapse;
}

.workers-table th,
.workers-table td {
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.workers-table th {
  background: #e3f2fd;
}
</style>