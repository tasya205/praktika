import { ref } from 'vue'
import { useStore } from '../stores/useStore'

const STORAGE_KEY = 'bizmeet'

const currentUser = ref(null)

// восстановление сессии из localStorage вроде как
try {
  const saved = localStorage.getItem('bizmeet_auth')
  if (saved) {
    currentUser.value = JSON.parse(saved)
  }
} catch (e) {}

export function useAuth() {
  // пользователи из основного хранилища подгружаются
  const getStore = () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { users: [], meetings: [] }
  }

  function login(key, fio) {
    const trimmedKey = key.trim()
    const trimmedFio = fio.trim()
    const user = state.users.find(u => {
      if (u.role === 'assistant' || u.role === 'coordinator' || u.role === 'aide') {
        return u.key === trimmedKey && u.fio.toLowerCase() === trimmedFio.toLowerCase()
      }
      if (u.role === 'executive') {
        return u.fio.toLowerCase() === trimmedFio.toLowerCase()
      }
      return false
    })
    if (user) {
      currentUser.value = { ...user }
      sessionStorage.setItem('currentUserId', user.id)
      return true
    }
    return false
  }

  function logout() {
    currentUser.value = null
    sessionStorage.removeItem('currentUserId')
  }

  function restoreSession() {
    const savedId = sessionStorage.getItem('currentUserId')
    if (savedId) {
      const user = state.users.find(u => u.id === savedId)
      if (user) {
        currentUser.value = { ...user }
        return true
      }
    }
    return false
  }

  function isAssistant() {
    return currentUser.value?.role === 'assistant'
  }

  function isExecutive() {
    return currentUser.value?.role === 'executive'
  }

  function isCoordinator() {
    return currentUser.value?.role === 'coordinator'
  }

  function isAide() {
    return currentUser.value?.role === 'aide'
  }

  function canEditMeeting(meeting) {
    if (!currentUser.value) return false
    if (isAssistant()) return true
    return false
  }

  function canViewField(fieldName, meeting) {
    if (!currentUser.value) return false
    if (isAssistant() || isExecutive()) return true
    if (meeting.createdBy === currentUser.value.id) return true
    if (isCoordinator() && meeting.participants.includes(currentUser.value.id)) {
      return meeting.permissions?.coordinator?.viewFields?.includes(fieldName) || false
    }
    if (isAide() && meeting.participants.includes(currentUser.value.id)) {
      return meeting.permissions?.aide?.viewFields?.includes(fieldName) || false
    }
    return false
  }

  return {
    currentUser,
    login,
    logout,
    restoreSession,
    isAssistant,
    isExecutive,
    isCoordinator,
    isAide,
    canEditMeeting,
    canViewField
  }
}

// import { ref } from 'vue'
// import { useStore } from '../stores/useStore'

// const currentUser = ref(null)

// export function useAuth() {
//   const { state } = useStore()

//   const login = (key, fio) => {
//     const user = state.users.find(u => u.key === key && u.fio === fio)
//     if (user) currentUser.value = user
//     return !!user
//   }

//   const logout = () => { currentUser.value = null }

//   return { currentUser, login, logout }
// }

// // временно, тип заглушек если чо
