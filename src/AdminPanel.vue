<template>
  <div class="admin-panel">
    <div class="admin-header">
      <h1>Панель управления</h1>
      <router-link to="/" class="back-link">← Календарь</router-link>
    </div>

    <nav class="tabs">
      <button
        @click="activeTab = 'meetings'"
        :class="{ active: activeTab === 'meetings' }"
      >
        Встречи
      </button>
      <button
        @click="activeTab = 'users'"
        :class="{ active: activeTab === 'users' }"
      >
        Пользователи
      </button>
      <button
        @click="activeTab = 'log'"
        :class="{ active: activeTab === 'log' }"
      >
        Журнал
      </button>
    </nav>

    <!-- Вкладка ВСТРЕЧИ -->
    <section v-if="activeTab === 'meetings'" class="tab-content">
      <h2>{{ editingMeetingId ? 'Редактировать встречу' : 'Новая встреча' }}</h2>

      <form @submit.prevent="saveMeeting" class="meeting-form">
        <!-- Дата -->
        <div class="form-group">
          <label>Дата *</label>
          <input v-model="form.date" type="date" :min="minDate" :max="maxDate" />
          <div class="field-error" v-if="errors.date">{{ errors.date }}</div>
        </div>

        <!-- Заголовок -->
        <div class="form-group">
          <label>Заголовок *</label>
          <input v-model="form.title" type="text" placeholder="О чём встреча" />
          <div class="field-error" v-if="errors.title">{{ errors.title }}</div>
        </div>

        <!-- Время -->
        <div class="form-row">
          <div class="form-group">
            <label>Начало</label>
            <input v-model="form.startTime" type="time" />
          </div>
          <div class="form-group">
            <label>Конец</label>
            <input v-model="form.endTime" type="time" />
          </div>
        </div>

        <!-- Тип встречи -->
        <div class="form-group">
          <label>Тип встречи</label>
          <select v-model="form.type">
            <option value="planning">Планёрка</option>
            <option value="negotiation">Переговоры</option>
            <option value="presentation">Презентация / Предложение</option>
            <option value="partnership">Старт сотрудничества</option>
            <option value="signing">Подписание документов</option>
            <option value="informal">Неформальная / Нетворкинг</option>
            <option value="urgent">Срочно / Оффер</option>
            <option value="interview">Интервью</option>
          </select>
        </div>

        <!-- Место -->
        <fieldset class="fieldset">
          <legend>Место проведения</legend>
          <div class="form-group">
            <label>Название места</label>
            <input v-model="form.location.name" placeholder="Переговорная 3, Ресторан и т.д." />
          </div>
          <div class="form-group">
            <label>Тип места</label>
            <select v-model="form.location.type">
              <option value="office">Офис</option>
              <option value="restaurant">Ресторан</option>
              <option value="online">Онлайн</option>
              <option value="offsite">Выезд</option>
            </select>
          </div>
          <div class="form-group" v-if="form.location.type === 'online'">
            <label>Ссылка</label>
            <input v-model="form.location.onlineLink" placeholder="https://..." />
          </div>
          <div class="form-group" v-else>
            <label>Адрес</label>
            <input v-model="form.location.address" placeholder="ул. Примерная, 1" />
          </div>
        </fieldset>

        <!-- Дресс-код -->
        <div class="form-group">
          <label>Дресс-код</label>
          <select v-model="form.dresscode">
            <option value="">Не указан</option>
            <option value="business">Деловой</option>
            <option value="smart_casual">Smart Casual</option>
            <option value="casual">Свободный</option>
            <option value="branded">Спецформа (лого компании)</option>
          </select>
        </div>

        <!-- Конфиденциальность -->
        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="form.isConfidential" />
            Конфиденциальная встреча
          </label>
        </div>

        <!-- Бюджет -->
        <div class="form-row">
          <div class="form-group">
            <label>Бюджет (ожидаемый)</label>
            <input v-model.number="form.budgetExpected" type="number" min="0" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Бюджет (факт)</label>
            <input v-model.number="form.budgetActual" type="number" min="0" placeholder="0" />
          </div>
        </div>

        <!-- Участники -->
        <div class="form-group">
          <label>Участники</label>
          <div class="participants-select">
            <div
              v-for="user in availableParticipants"
              :key="user.id"
              class="participant-option"
            >
              <label>
                <input
                  type="checkbox"
                  :value="user.id"
                  v-model="form.participants"
                />
                {{ user.fio }} ({{ roleName(user.role) }})
              </label>
            </div>
          </div>
        </div>

        <!-- Чек-лист координатора -->
        <fieldset class="fieldset">
          <legend>Чек-лист координатора</legend>
          <div
            v-for="(item, idx) in form.checklist.coordinator"
            :key="idx"
            class="checklist-item"
          >
            <input
              v-model="item.text"
              type="text"
              placeholder="Задача для подготовки"
            />
            <button type="button" class="btn-remove" @click="removeCoordinatorTask(idx)">
              ✕
            </button>
          </div>
          <button type="button" class="btn-add-item" @click="addCoordinatorTask">
            + Добавить задачу
          </button>
        </fieldset>

        <!-- Чек-лист руководителя -->
        <fieldset class="fieldset">
          <legend>Чек-лист руководителя</legend>
          <div
            v-for="(item, idx) in form.checklist.executive"
            :key="idx"
            class="checklist-item"
          >
            <input
              v-model="item.text"
              type="text"
              placeholder="Задача для руководителя"
            />
            <button type="button" class="btn-remove" @click="removeExecutiveTask(idx)">
              ✕
            </button>
          </div>
          <button type="button" class="btn-add-item" @click="addExecutiveTask">
            + Добавить задачу
          </button>
        </fieldset>

        <!-- Настройки видимости -->
        <fieldset class="fieldset">
          <legend>Видимость для координатора</legend>
          <div class="permissions-grid">
            <label v-for="field in coordinatorFields" :key="field.value">
              <input
                type="checkbox"
                :value="field.value"
                v-model="form.permissions.coordinator.viewFields"
              />
              {{ field.label }}
            </label>
          </div>
        </fieldset>

        <fieldset class="fieldset">
          <legend>Видимость для помощника</legend>
          <div class="permissions-grid">
            <label v-for="field in aideFields" :key="field.value">
              <input
                type="checkbox"
                :value="field.value"
                v-model="form.permissions.aide.viewFields"
              />
              {{ field.label }}
            </label>
          </div>
        </fieldset>

        <!-- Кнопки -->
        <div class="form-actions">
          <button type="submit" class="btn-save">
            {{ editingMeetingId ? 'Сохранить' : 'Создать встречу' }}
          </button>
          <button
            v-if="editingMeetingId"
            type="button"
            class="btn-cancel"
            @click="cancelEdit"
          >
            Отмена
          </button>
        </div>
      </form>

      <!-- Список встреч -->
      <h3>Все встречи</h3>
      <div v-if="meetings.length === 0" class="empty-list">Пока нет встреч</div>
      <ul v-else class="meeting-list">
        <li v-for="m in meetings" :key="m.id" class="meeting-list-item">
          <div class="meeting-info">
            <strong>{{ m.date }}</strong>
            <span class="meeting-time" v-if="m.startTime">{{ m.startTime }}–{{ m.endTime }}</span>
            <span>{{ m.title }}</span>
            <span class="meeting-type-badge">{{ typeName(m.type) }}</span>
          </div>
          <div class="meeting-actions">
            <button @click="editMeeting(m)" class="btn-edit">Ред.</button>
            <button @click="deleteMeeting(m.id)" class="btn-del">Удалить</button>
          </div>
        </li>
      </ul>
    </section>

    <!-- Вкладка ПОЛЬЗОВАТЕЛИ -->
    <section v-if="activeTab === 'users'" class="tab-content">
      <h2>Добавить пользователя</h2>
      <form @submit.prevent="saveUser" class="user-form">
        <div class="form-group">
          <label>ФИО *</label>
          <input v-model="userForm.fio" type="text" placeholder="Иванов Иван Иванович" />
          <div class="field-error" v-if="userErrors.fio">{{ userErrors.fio }}</div>
        </div>

        <div class="form-group">
          <label>Роль</label>
          <select v-model="userForm.role">
            <option value="coordinator">Координатор</option>
            <option value="aide">Помощник</option>
          </select>
        </div>

        <div class="form-group">
          <label>Руководитель</label>
          <select v-model="userForm.supervisorId">
            <option :value="null">Не назначен</option>
            <option
              v-for="u in possibleSupervisors"
              :key="u.id"
              :value="u.id"
            >
              {{ u.fio }} ({{ roleName(u.role) }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Ключ доступа</label>
          <div class="key-row">
            <input v-model="userForm.key" type="text" placeholder="Сгенерируется автоматически" />
            <button type="button" class="btn-generate" @click="generateUserKey">Сген.</button>
          </div>
          <div class="field-error" v-if="userErrors.key">{{ userErrors.key }}</div>
        </div>

        <button type="submit" class="btn-save">Добавить пользователя</button>
      </form>

      <h3>Текущие пользователи</h3>
      <ul class="user-list">
        <li v-for="u in users" :key="u.id" class="user-list-item">
          <div>
            <strong>{{ u.fio }}</strong>
            <span class="role-badge" :class="'role-' + u.role">{{ roleName(u.role) }}</span>
            <span v-if="u.key" class="key-info">Ключ: {{ u.key }}</span>
          </div>
          <div class="user-actions">
            <button
              v-if="u.role === 'executive'"
              @click="editExecutiveFio(u)"
              class="btn-edit"
            >
              Сменить ФИО
            </button>
            <button
              v-if="u.role !== 'executive' && u.role !== 'assistant'"
              @click="deleteUser(u.id)"
              class="btn-del"
            >
              Удалить
            </button>
          </div>
        </li>
      </ul>
    </section>

    <!-- Вкладка ЖУРНАЛ -->
    <section v-if="activeTab === 'log'" class="tab-content">
      <h2>Журнал действий</h2>
      <div v-if="state.actionsLog.length === 0" class="empty-list">Журнал пуст</div>
      <ul v-else class="log-list">
        <li v-for="entry in state.actionsLog" :key="entry.id" class="log-item">
          <span class="log-time">{{ entry.time }}</span>
          <span>{{ entry.action }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from './stores/useStore'
import { useAuth } from './composables/useAuth'

const { state, addMeeting, updateMeeting, removeMeeting, addUser, removeUser, updateUser, addLogEntry, generateKey } = useStore()
const { currentUser } = useAuth()

const activeTab = ref('meetings')
const editingMeetingId = ref(null)
const errors = reactive({})
const userErrors = reactive({})

const today = new Date()
const minDate = today.toISOString().split('T')[0]
const maxDateObj = new Date(today)
maxDateObj.setMonth(maxDateObj.getMonth() + 6)
const maxDate = maxDateObj.toISOString().split('T')[0]

const meetings = computed(() => state.meetings)
const users = computed(() => state.users)

const availableParticipants = computed(() => {
  return state.users.filter(u => u.role !== 'assistant')
})

const possibleSupervisors = computed(() => {
  return state.users.filter(u => u.role === 'executive' || u.role === 'coordinator')
})

const coordinatorFields = [
  { value: 'title', label: 'Заголовок' },
  { value: 'time', label: 'Время' },
  { value: 'location', label: 'Место' },
  { value: 'type', label: 'Тип' },
  { value: 'dresscode', label: 'Дресс-код' },
  { value: 'checklist', label: 'Чек-лист' }
]

const aideFields = [
  { value: 'dresscode', label: 'Дресс-код' },
  { value: 'assignedTasks', label: 'Свои задачи' }
]

function emptyForm() {
  return {
    date: '',
    title: '',
    startTime: '',
    endTime: '',
    location: { name: '', type: 'office', address: '', onlineLink: '' },
    type: 'planning',
    dresscode: '',
    isConfidential: false,
    budgetExpected: 0,
    budgetActual: 0,
    participants: [],
    checklist: {
      coordinator: [],
      executive: [],
      aideTasks: []
    },
    permissions: {
      coordinator: {
        viewFields: ['title', 'time', 'location', 'type', 'dresscode', 'checklist']
      },
      aide: {
        viewFields: ['dresscode', 'assignedTasks']
      }
    },
    summary: ''
  }
}

const form = reactive(emptyForm())

const userForm = reactive({
  fio: '',
  role: 'coordinator',
  supervisorId: null,
  key: ''
})

function generateUserKey() {
  userForm.key = generateKey()
}

function addCoordinatorTask() {
  form.checklist.coordinator.push({ id: Date.now().toString(36), text: '', done: false, assignedTo: null })
}

function removeCoordinatorTask(idx) {
  form.checklist.coordinator.splice(idx, 1)
}

function addExecutiveTask() {
  form.checklist.executive.push({ id: Date.now().toString(36), text: '', done: false })
}

function removeExecutiveTask(idx) {
  form.checklist.executive.splice(idx, 1)
}

function saveMeeting() {
  Object.keys(errors).forEach(k => delete errors[k])

  if (!form.date) {
    errors.date = 'Выберите дату'
  } else if (form.date < minDate) {
    errors.date = 'Нельзя создать встречу в прошлом'
  } else if (form.date > maxDate) {
    errors.date = 'Можно планировать не далее 6 месяцев'
  }

  const titleTrimmed = form.title.trim()
  if (!titleTrimmed) {
    errors.title = 'Введите заголовок'
  } else if (titleTrimmed.length < 3) {
    errors.title = 'Минимум 3 символа'
  }

  if (Object.keys(errors).length) return

  if (editingMeetingId.value) {
    updateMeeting(editingMeetingId.value, { ...form })
  } else {
    addMeeting({ ...form }, currentUser.value?.id)
  }

  Object.assign(form, emptyForm())
  editingMeetingId.value = null
}

function editMeeting(meeting) {
  editingMeetingId.value = meeting.id
  Object.assign(form, {
    date: meeting.date,
    title: meeting.title,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    location: { ...meeting.location },
    type: meeting.type,
    dresscode: meeting.dresscode,
    isConfidential: meeting.isConfidential,
    budgetExpected: meeting.budgetExpected,
    budgetActual: meeting.budgetActual,
    participants: [...meeting.participants],
    checklist: {
      coordinator: meeting.checklist.coordinator.map(t => ({ ...t })),
      executive: meeting.checklist.executive.map(t => ({ ...t })),
      aideTasks: meeting.checklist.aideTasks.map(t => ({ ...t }))
    },
    permissions: {
      coordinator: { viewFields: [...meeting.permissions.coordinator.viewFields] },
      aide: { viewFields: [...meeting.permissions.aide.viewFields] }
    },
    summary: meeting.summary
  })
}

function cancelEdit() {
  Object.assign(form, emptyForm())
  editingMeetingId.value = null
}

function deleteMeeting(id) {
  if (confirm('Удалить встречу?')) {
    removeMeeting(id)
  }
}

function saveUser() {
  Object.keys(userErrors).forEach(k => delete userErrors[k])

  if (!userForm.fio.trim()) {
    userErrors.fio = 'Введите ФИО'
  }

  if (!userForm.key.trim()) {
    userForm.key = generateKey()
  }

  if (Object.keys(userErrors).length) return

  addUser({ ...userForm })
  addLogEntry(`Добавлен пользователь "${userForm.fio}"`)

  Object.assign(userForm, {
    fio: '',
    role: 'coordinator',
    supervisorId: null,
    key: ''
  })
}

function deleteUser(id) {
  if (confirm('Удалить пользователя?')) {
    removeUser(id)
  }
}

function editExecutiveFio(user) {
  const newFio = prompt('Новое ФИО руководителя:', user.fio)
  if (newFio && newFio.trim()) {
    updateUser(user.id, { fio: newFio.trim() })
    addLogEntry(`Изменено ФИО руководителя на "${newFio.trim()}"`)
  }
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

function typeName(type) {
  const map = {
    planning: 'Планёрка',
    negotiation: 'Переговоры',
    presentation: 'Презентация',
    partnership: 'Старт сотрудничества',
    signing: 'Подписание',
    informal: 'Неформальная',
    urgent: 'Срочно',
    interview: 'Интервью'
  }
  return map[type] || type
}
</script>

<style scoped>
.admin-panel {
  padding: 25px;
  max-width: 900px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.admin-header h1 {
  margin: 0;
  color: #1565C0;
}

.back-link {
  color: #1976D2;
  text-decoration: none;
  font-size: 0.9rem;
}

.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  border-bottom: 2px solid #e0e0e0;
}

.tabs button {
  padding: 10px 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: 0.2s;
}

.tabs button.active {
  color: #1976D2;
  border-bottom-color: #1976D2;
  font-weight: 600;
}

.tab-content {
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.meeting-form,
.user-form {
  background: #f9fcff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 0.9rem;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group input[type="time"],
.form-group input[type="number"],
.form-group select {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1976D2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.field-error {
  color: #d32f2f;
  font-size: 0.8rem;
  margin-top: 2px;
}

.fieldset {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 14px;
}

.fieldset legend {
  font-weight: 700;
  color: #1565C0;
  padding: 0 6px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 400;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.checklist-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.checklist-item input {
  flex: 1;
}

.btn-remove {
  background: #ffcdd2;
  border: none;
  color: #c62828;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}

.btn-remove:hover {
  background: #ef9a9a;
}

.btn-add-item {
  background: #e3f2fd;
  border: 1px dashed #1976D2;
  color: #1976D2;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: 0.2s;
}

.btn-add-item:hover {
  background: #bbdefb;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.permissions-grid label {
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 6px;
}

.participants-select {
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px;
}

.participant-option {
  margin-bottom: 4px;
}

.participant-option label {
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-save {
  background: #1976D2;
  color: white;
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-save:hover {
  background: #1565C0;
}

.btn-cancel {
  background: #eee;
  color: #333;
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.meeting-list,
.user-list,
.log-list {
  list-style: none;
  padding: 0;
}

.meeting-list-item,
.user-list-item,
.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.meeting-info {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.meeting-time {
  color: #666;
  font-size: 0.85rem;
}

.meeting-type-badge {
  background: #e3f2fd;
  color: #1565C0;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.role-badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-left: 8px;
}

.role-badge.role-executive { background: #ffecb3; color: #e65100; }
.role-badge.role-assistant { background: #c8e6c9; color: #1b5e20; }
.role-badge.role-coordinator { background: #bbdefb; color: #0d47a1; }
.role-badge.role-aide { background: #f3e5f5; color: #6a1b9a; }

.key-info {
  font-size: 0.8rem;
  color: #888;
  margin-left: 8px;
  font-family: monospace;
}

.meeting-actions,
.user-actions {
  display: flex;
  gap: 6px;
}

.btn-edit {
  background: #fff3e0;
  border: 1px solid #ff9800;
  color: #e65100;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-edit:hover {
  background: #ffe0b2;
}

.btn-del {
  background: #ffebee;
  border: 1px solid #f44336;
  color: #c62828;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-del:hover {
  background: #ffcdd2;
}

.key-row {
  display: flex;
  gap: 8px;
}

.key-row input {
  flex: 1;
}

.btn-generate {
  background: #e8eaf6;
  border: 1px solid #3f51b5;
  color: #1a237e;
  padding: 9px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
}

.empty-list {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 30px;
}

.log-item {
  padding: 10px 0;
  font-size: 0.9rem;
}

.log-time {
  color: #888;
  margin-right: 12px;
  font-family: monospace;
  min-width: 80px;
  display: inline-block;
}
</style>

<!-- <template>
  <div class="admin-panel">
    <nav class="tabs">
      <button @click="activeTab = 'meetings'" :class="{ active: activeTab === 'meetings' }">Встречи</button>
      <button @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }">Пользователи</button>
    </nav> -->

    <!-- вкладка встречъ справа-->
    <!-- <section v-if="activeTab === 'meetings'">
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
    <!-- <section v-if="activeTab === 'users'">
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
</style> --> 