<template>
  <div class="login-page">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Вход в систему</h2>
      <p class="hint">Доступ только по приглашению. Обратитесь к ассистенту.</p>

      <label>Ключ доступа</label>
      <input v-model="key" placeholder="Введите ключ" />
      <div class="error" v-if="error">{{ error }}</div>

      <label>ФИО</label>
      <input v-model="fio" placeholder="Лермонтов М.Ю." />

      <button type="submit">Войти</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from './composables/useAuth'
import { useRouter } from 'vue-router'

const { login } = useAuth()
const router = useRouter()
const key = ref('')
const fio = ref('')
const error = ref('')

function handleLogin() {
  error.value = ''
  if (!key.value.trim() || !fio.value.trim()) {
    error.value = 'Заполните все поля'
    return
  }
  const success = login(key.value, fio.value)
  if (!success) {
    error.value = 'Неверный ключ или ФИО'
    return
  }
  router.push('/')
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--bg, #f0f6ff);
}

.login-form {
  background: var(--card-bg, white);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 320px;
}

.login-form h2 {
  margin-bottom: 8px;
  color: var(--accent, #1565C0);
}

.hint {
  font-size: 0.85rem;
  color: var(--muted, #888);
  margin-bottom: 20px;
}

.login-form label {
  display: block;
  margin-top: 10px;
  color: var(--text, #333);
}

.login-form input {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border: 1px solid var(--border, #ccc);
  border-radius: 4px;
  background: var(--card-bg, white);
  color: var(--text, #333);
}

.error {
  color: var(--danger, #d32f2f);
  font-size: 0.9rem;
  margin-top: 8px;
}

.login-form button {
  width: 100%;
  margin-top: 20px;
  padding: 10px;
  background: var(--accent, #1976D2);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
