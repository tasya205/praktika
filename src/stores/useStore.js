import { reactive, watch } from 'vue'

const STORAGE_KEY = 'bizmeet'

function getDefaultState() {
  return {
    users: [
      {
        id: 'u1',
        role: 'executive',
        fio: 'Иванов Иван Иванович',
        key: null,
        supervisorId: null
      },
      {
        id: 'u2',
        role: 'assistant',
        fio: 'Петрова Анна Сергеевна',
        key: 'ASSIST-2026-01',
        supervisorId: null
      }
    ],
    meetings: [],
    actionsLog: []
  }
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch (e) {
      return getDefaultState()
    }
  }
  return getDefaultState()
}

const state = reactive(load())

watch(state, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
}, { deep: true })

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function generateKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let key = 'BIZ-'
  for (let i = 0; i < 6; i++) {
    key += chars[Math.floor(Math.random() * chars.length)]
  }
  return key
}

function addLogEntry(action) {
  const now = new Date()
  const time = now.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
  state.actionsLog.unshift({
    id: generateId(),
    time,
    action
  })
  if (state.actionsLog.length > 50) {
    state.actionsLog = state.actionsLog.slice(0, 50)
  }
}

export function useStore() {
  function getMeetingsByDate(dateStr) {
    return state.meetings.filter(m => m.date === dateStr)
  }

  function getMeetingById(id) {
    return state.meetings.find(m => m.id === id) || null
  }

  function addMeeting(meetingData, creatorId) {
    const newMeeting = {
      id: generateId(),
      title: meetingData.title || '',
      date: meetingData.date || '',
      startTime: meetingData.startTime || '',
      endTime: meetingData.endTime || '',
      location: meetingData.location || { name: '', type: 'office', address: '', onlineLink: '' },
      type: meetingData.type || 'planning',
      dresscode: meetingData.dresscode || '',
      isConfidential: meetingData.isConfidential || false,
      budgetExpected: meetingData.budgetExpected || 0,
      budgetActual: meetingData.budgetActual || 0,
      createdBy: creatorId || '',
      participants: meetingData.participants || [],
      checklist: {
        coordinator: meetingData.checklist?.coordinator || [],
        executive: meetingData.checklist?.executive || [],
        aideTasks: meetingData.checklist?.aideTasks || []
      },
      permissions: meetingData.permissions || {
        coordinator: {
          viewFields: ['title', 'time', 'location', 'type', 'dresscode', 'checklist']
        },
        aide: {
          viewFields: ['dresscode', 'assignedTasks']
        }
      },
      summary: meetingData.summary || ''
    }
    state.meetings.push(newMeeting)
    addLogEntry(`Создана встреча "${newMeeting.title}" на ${newMeeting.date}`)
    return newMeeting
  }

  function updateMeeting(id, meetingData) {
    const idx = state.meetings.findIndex(m => m.id === id)
    if (idx === -1) return null
    Object.assign(state.meetings[idx], meetingData)
    addLogEntry(`Обновлена встреча "${state.meetings[idx].title}"`)
    return state.meetings[idx]
  }

  function removeMeeting(id) {
    const idx = state.meetings.findIndex(m => m.id === id)
    if (idx === -1) return false
    const title = state.meetings[idx].title
    state.meetings.splice(idx, 1)
    addLogEntry(`Удалена встреча "${title}"`)
    return true
  }

  function addUser(userData) {
    const newUser = {
      id: generateId(),
      fio: userData.fio || '',
      role: userData.role || 'coordinator',
      key: userData.key || generateKey(),
      supervisorId: userData.supervisorId || null
    }
    state.users.push(newUser)
    addLogEntry(`Добавлен пользователь "${newUser.fio}" (${newUser.role})`)
    return newUser
  }

  function removeUser(id) {
    const idx = state.users.findIndex(u => u.id === id)
    if (idx === -1) return false
    const user = state.users[idx]
    if (user.role === 'executive') return false
    state.users.splice(idx, 1)
    addLogEntry(`Удалён пользователь "${user.fio}"`)
    return true
  }

  function updateUser(id, userData) {
    const user = state.users.find(u => u.id === id)
    if (!user) return null
    Object.assign(user, userData)
    addLogEntry(`Обновлён пользователь "${user.fio}"`)
    return user
  }

  function getSubordinates(userId) {
    return state.users.filter(u => u.supervisorId === userId)
  }

  function getUsersByRole(role) {
    return state.users.filter(u => u.role === role)
  }

  return {
    state,
    getMeetingsByDate,
    getMeetingById,
    addMeeting,
    updateMeeting,
    removeMeeting,
    addUser,
    removeUser,
    updateUser,
    getSubordinates,
    getUsersByRole,
    addLogEntry,
    generateKey
  }
}


// import { reactive, watch } from 'vue'

// const STORAGE_KEY = 'bizmeet'

// const defaultState = () => ({
//   users: [
//     { id: 'exec', fio: 'Иванов И.И.', role: 'executive', key: null },
//     { id: 'as1', fio: 'Петрова А.С.', role: 'assistant', key: 'AS-2026-01' }
//   ],
//   meetings: [],
//   log: []
// })

// const saved = localStorage.getItem(STORAGE_KEY)
// const state = reactive(saved ? JSON.parse(saved) : defaultState())

// watch(state, (val) => {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
// }, { deep: true })

// export function useStore() {
//   const addUser = (user) => { state.users.push({ id: Date.now().toString(), ...user }) }
//   const removeUser = (id) => { state.users = state.users.filter(u => u.id !== id) }
//   const addMeeting = (m) => { state.meetings.push({ id: Date.now().toString(), ...m }) }
//   const removeMeeting = (id) => { state.meetings = state.meetings.filter(m => m.id !== id) }
//   const getMeetingsByDate = (date) => state.meetings.filter(m => m.date === date)

//   return { state, addUser, removeUser, addMeeting, removeMeeting, getMeetingsByDate }
// }