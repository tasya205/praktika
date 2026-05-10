<template>
  <div class="profile-page">
    <div class="profile-card">
      <div class="avatar">{{ currentUser?.fio?.charAt(0) || '?' }}</div>
      <h2>{{ currentUser?.fio || 'Неизвестно' }}</h2>
      <div class="role-badge">{{ roleName(currentUser?.role) }}</div>

      <div class="info-row" v-if="currentUser?.key">
        <span class="label">Ключ доступа:</span>
        <code>{{ currentUser.key }}</code>
      </div>

      <button @click="handleLogout" class="logout-btn">Выйти из аккаунта</button>
    </div>
    <router-link to="/" class="back-link">← На главную</router-link>
  </div>
</template>

<script setup>
import { useAuth } from './composables/useAuth'
import { useRouter } from 'vue-router'

const { currentUser, logout } = useAuth()
const router = useRouter()

function handleLogout() {
  logout()
  router.push('/login')
}

function roleName(role) {
  const map = {
    executive: 'Руководитель',
    assistant: 'Ассистент',
    coordinator: 'Координатор',
    aide: 'Помощник'
  }
  return map[role] || role
}
</script>

<style scoped>
.profile-page {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: var(--bg, #f0f6ff);
}

.profile-card {
  background: var(--card-bg, white);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 360px;
  width: 100%;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--accent, #1976D2);
  color: white;
  font-size: 28px;
  line-height: 64px;
  margin: 0 auto 16px;
}

h2 {
  margin: 0 0 8px;
  color: var(--text, #333);
}

.role-badge {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 20px;
  background: var(--accent-light, #e3f2fd);
  color: var(--accent, #1976D2);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.info-row {
  margin: 12px 0;
  font-size: 0.9rem;
  color: var(--text, #333);
}

.label {
  color: var(--muted, #777);
}

code {
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
}

.logout-btn {
  margin-top: 20px;
  padding: 10px 32px;
  background: var(--danger, #f44336);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.back-link {
  margin-top: 20px;
  color: var(--accent, #1976D2);
}
</style>