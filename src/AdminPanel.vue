<template>
  <div class="admin-panel">
    <nav class="tabs">
      <button @click="activeTab = 'meetings'" :class="{ active: activeTab === 'meetings' }">Встречи</button>
      <button @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }">Пользователи</button>
    </nav>

    <!-- вкладка встречъ справа-->
    <section v-if="activeTab === 'meetings'">
      <h2>Управление встречами</h2>
      <form novalidate @submit.prevent="addNewMeeting" class="form">
        <label>Дата</label>
        <input v-model="newMeeting.date" type="date" :min="minDate" :max="maxDate" required />
        <div class="error" v-if="errors.date">{{ errors.date }}</div>

        <label>Заголовок</label>
        <input v-model="newMeeting.title" type="text" required />
        <div class="error" v-if="errors.title">{{ errors.title }}</div>

        <label>Время начала</label>
        <input v-model="newMeeting.startTime" type="time" />
        <label>Время окончания</label>
        <input v-model="newMeeting.endTime" type="time" />

        <label>Тип</label>
        <select v-model="newMeeting.type">
          <option value="planning">Планёрка</option>
          <option value="negotiation">Переговоры</option>
          <option value="informal">Неформальная</option>
          <option value="urgent">Срочно</option>
        </select>

        <label>Дресс-код</label>
        <input v-model="newMeeting.dresscode" placeholder="Например: деловой" />

        <button type="submit" class="btn-save">Добавить встречу</button>
      </form>

      <h3>Список встреч</h3>
      <ul class="meeting-list">
        <li v-for="m in meetings" :key="m.id">
          <span>{{ m.date }} — {{ m.title }}</span>
          <button @click="removeMeeting(m.id)" class="btn-del">Удалить</button>
        </li>
      </ul>
    </section>

    <!-- вкладка пользователей (на будущее вроде должно понадобиться)-->
    <section v-if="activeTab === 'users'">
      <h2>Сотрудники</h2>
      <form @submit.prevent="addNewUser" class="form">
        <label>ФИО</label>
        <input v-model="newUser.fio" required />
        <div class="error" v-if="errors.fio">{{ errors.fio }}</div>

        <label>Роль</label>
        <select v-model="newUser.role">
          <option value="coordinator">Координатор</option>
          <option value="aide">Помощник</option>
        </select>

        <label>Пароль (ключ)</label>
        <input v-model="newUser.key" placeholder="Придумайте ключ" required />
        <div class="error" v-if="errors.key">{{ errors.key }}</div>

        <button type="submit" class="btn-save">Добавить пользователя</button>
      </form>

      <h3>Текущие сотрудники</h3>
      <ul class="user-list">
        <li v-for="u in users" :key="u.id">
          <span>{{ u.fio }} ({{ roleName(u.role) }})</span>
          <button v-if="u.role !== 'executive'" @click="removeUser(u.id)" class="btn-del">Удалить</button>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { useStore } from './stores/useStore'
import { useAuth } from './composables/useAuth'
import { ref, reactive, computed } from 'vue'

const { state, addMeeting, removeMeeting, addUser, removeUser } = useStore()
const { currentUser } = useAuth()

const activeTab = ref('meetings')
const errors = reactive({})

const today = new Date()
const minDate = today.toISOString().split('T')[0]
const maxDateObj = new Date(today)
maxDateObj.setMonth(maxDateObj.getMonth() + 6)
const maxDate = maxDateObj.toISOString().split('T')[0]

const meetings = computed(() => state.meetings)
const users = computed(() => state.users)

// планы возможные на функционал, в раздумьях еще..
const newMeeting = reactive({
  date: '',
  title: '',
  startTime: '',
  endTime: '',
  type: 'planning',
  dresscode: ''
})

const newUser = reactive({
  fio: '',
  role: 'coordinator',
  key: ''
})

// проверки вреени и не только
function addNewMeeting() {
  Object.keys(errors).forEach(k => delete errors[k])

  // проверка даты
  if (!newMeeting.date) {
    errors.date = 'Выберите дату'
  } else if (newMeeting.date < minDate) {
    errors.date = 'Нельзя создать встречу в прошлом'
  } else if (newMeeting.date > maxDate) {
    errors.date = 'Можно планировать не далее чем на 6 месяцев вперёд'
  }

  // проверККа заголовка
  const titleTrimmed = newMeeting.title.trim()
  if (!titleTrimmed) {
    errors.title = 'Введите заголовок'
  } else if (titleTrimmed.length < 6) {
    errors.title = 'Минимум 6 символов'
  }

  // если есть ошибки – расстрел
  if (Object.keys(errors).length) return

  addMeeting({ ...newMeeting })

  // бан
  Object.assign(newMeeting, {
    date: '',
    title: '',
    startTime: '',
    endTime: '',
    type: 'planning',
    dresscode: ''
  })
}
function addNewUser() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!newUser.fio.trim()) errors.fio = 'Введите ФИО'
  if (!newUser.key.trim()) errors.key = 'Придумайте ключ'
  if (Object.keys(errors).length) return

  addUser({ ...newUser })
  Object.assign(newUser, { fio: '', role: 'coordinator', key: '' })
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
.admin-panel {
  padding: 25px;
  max-width: 800px;
  margin: 0 auto;
}

.tabs button {
  padding: 8px 20px;
  border: none;
  background: #e3f2fd;
  margin-right: 10px;
  cursor: pointer;
  border-radius: 4px;
}

.tabs button.active {
  background: #1976D2;
  color: white;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
  max-width: 400px;
}

.form label {
  font-weight: bold;
}

.form input,
.form select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.error {
  color: #d32f2f;
  font-size: 0.85rem;
}

.btn-save {
  background: #1976D2;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-del {
  background: #f44336;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  margin-left: 10px;
  cursor: pointer;
}

.meeting-list,
.user-list {
  list-style: none;
  padding: 0;
}

.meeting-list li,
.user-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
</style>