<template>
  <div class="admin-panel">
    <router-link to="/" class="back-arrow">← Назад</router-link>
    <nav class="tabs">
      <button @click="activeTab = 'meetings'" :class="{ active: activeTab === 'meetings' }">Встречи</button>
      <button @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }">Пользователи</button>
      <button @click="activeTab = 'bossChecklist'" :class="{ active: activeTab === 'bossChecklist' }">Чек-листы</button>
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

        <label>Место проведения</label>
        <input v-model="newMeeting.location" type="text" placeholder="Офис, ресторан, адрес..." />

        <label>Транспорт</label>
        <select v-model="newMeeting.transport">
          <option value="">— Не требуется —</option>
          <option value="personal">Личный автомобиль</option>
          <option value="company">Автомобиль компании</option>
          <option value="partner">Транспорт партнёров</option>
          <option value="taxi">Такси</option>
          <option value="rental">Арендованный автомобиль</option>
        </select>

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
          <button v-if="u.role !== 'executive' && u.id !== currentUser?.id" @click="removeUser(u.id)"
            class="btn-del">Удалить</button>
        </li>
      </ul>
    </section>

    <section v-if="activeTab === 'bossChecklist'">
      <h2>Личный чек-лист руководителя</h2>
      <p class="section-hint">Виден только руководителю и ассистенту</p>

      <div v-if="meetingsWithChecklist.length === 0" class="empty-hint">
        Нет встреч. Создайте встречу во вкладке «Встречи».
      </div>

      <div v-for="m in meetingsWithChecklist" :key="m.id" class="checklist-card">
        <h3>{{ m.date }} — {{ m.title }}</h3>
        <ul class="checklist-items">
          <li v-for="(item, i) in m.bossChecklist" :key="i" class="checklist-item">
            <input type="checkbox" v-model="item.done" @change="saveChecklists" />
            <span :class="{ done: item.done }">{{ item.text }}</span>
            <button @click="removeBossItem(m, i)" class="remove-item-btn" title="Удалить">×</button>
          </li>
        </ul>
        <form @submit.prevent="addBossItem(m)" class="add-item-form">
          <input v-model="newBossItems[m.id]" placeholder="Новая задача для руководителя" />
          <button type="submit">+</button>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from './stores/useStore'
import { useAuth } from './composables/useAuth'

const { state, addMeeting, removeMeeting, addUser, removeUser } = useStore()
const { currentUser } = useAuth()
const router = useRouter()

// Если не ассистент — редирект
if (currentUser.value?.role !== 'assistant') {
  router.push('/')
}

const activeTab = ref('meetings')
const errors = reactive({})

const today = new Date()
const minDate = today.toISOString().split('T')[0]
const maxDateObj = new Date(today)
maxDateObj.setMonth(maxDateObj.getMonth() + 6)
const maxDate = maxDateObj.toISOString().split('T')[0]

const meetings = computed(() => state.meetings)
const users = computed(() => state.users)

const newMeeting = reactive({
  date: '',
  title: '',
  startTime: '',
  endTime: '',
  type: 'planning',
  dresscode: '',
  location: '',
  transport: ''
})

const newUser = reactive({
  fio: '',
  role: 'coordinator',
  key: ''
})

// Чек-лист босса
const newBossItems = reactive({})

const meetingsWithChecklist = computed(() =>
  state.meetings.map(m => ({
    ...m,
    bossChecklist: m.bossChecklist || [
      { text: 'Подготовить вступительную речь', done: false },
      { text: 'Проверить бюджет встречи', done: false },
      { text: 'Выбрать дресс-код', done: false },
      { text: 'Ознакомиться с повесткой', done: false },
      { text: 'Подготовить презентационные материалы', done: false }
    ]
  }))
)

function addNewMeeting() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!newMeeting.date) {
    errors.date = 'Выберите дату'
  } else if (newMeeting.date < minDate) {
    errors.date = 'Нельзя создать встречу в прошлом'
  } else if (newMeeting.date > maxDate) {
    errors.date = 'Можно планировать не далее чем на 6 месяцев вперёд'
  }

  const titleTrimmed = newMeeting.title.trim()
  if (!titleTrimmed) {
    errors.title = 'Введите заголовок'
  } else if (titleTrimmed.length < 6) {
    errors.title = 'Минимум 6 символов'
  }

  if (Object.keys(errors).length) return

  addMeeting({ ...newMeeting })

  Object.assign(newMeeting, {
    date: '',
    title: '',
    startTime: '',
    endTime: '',
    type: 'planning',
    dresscode: '',
    location: '',
    transport: ''
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

function addBossItem(meeting) {
  const text = (newBossItems[meeting.id] || '').trim()
  if (!text) return
  if (!meeting.bossChecklist) meeting.bossChecklist = []
  meeting.bossChecklist.push({ text, done: false })
  newBossItems[meeting.id] = ''
  saveChecklists()
}

function removeBossItem(meeting, index) {
  meeting.bossChecklist.splice(index, 1)
  saveChecklists()
}

function saveChecklists() {
  localStorage.setItem('bizmeet', JSON.stringify(state))
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
  color: var(--text, #333);
}

.back-arrow {
  display: inline-block;
  margin-bottom: 15px;
  color: var(--accent, #1976D2);
  text-decoration: none;
  font-size: 0.95rem;
}

.tabs button {
  padding: 8px 20px;
  border: none;
  background: var(--accent-light, #e3f2fd);
  margin-right: 10px;
  cursor: pointer;
  border-radius: 4px;
  color: var(--text, #333);
}

.tabs button.active {
  background: var(--accent, #1976D2);
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
  border: 1px solid var(--border, #ccc);
  border-radius: 4px;
  background: var(--card-bg, white);
  color: var(--text, #333);
}

.error {
  color: var(--danger, #d32f2f);
  font-size: 0.85rem;
}

.btn-save {
  background: var(--accent, #1976D2);
  color: white;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-del {
  background: var(--danger, #f44336);
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
  border-bottom: 1px solid var(--border, #eee);
}

/* чек-листик */
.section-hint {
  font-size: 0.85rem;
  color: var(--muted, #888);
  margin-bottom: 20px;
  font-style: italic;
}

.empty-hint {
  text-align: center;
  padding: 40px;
  color: var(--muted, #999);
  background: #fafafa;
  border-radius: 12px;
}

.checklist-card {
  background: var(--card-bg, #fdfdfd);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid var(--border, #eee);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.checklist-card h3 {
  margin: 0 0 14px;
  font-size: 1.05rem;
  color: var(--accent, #1565C0);
  padding-bottom: 8px;
  border-bottom: 1px dashed #ddd;
}

.checklist-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
  padding: 8px 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.checklist-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent, #1976D2);
}

.checklist-item span {
  flex: 1;
}

.checklist-item span.done {
  text-decoration: line-through;
  color: #bbb;
}

.remove-item-btn {
  background: none;
  border: none;
  color: #ccc;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0 4px;
}

.remove-item-btn:hover {
  color: var(--danger, #f44336);
}

.add-item-form {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.add-item-form input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--card-bg, white);
  color: var(--text, #333);
}

.add-item-form button {
  padding: 8px 16px;
  background: var(--accent, #1976D2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}
</style>