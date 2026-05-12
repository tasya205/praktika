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

  const login = (key, fio) => {
    const store = getStore()
    const user = store.users.find(u => u.key === key && u.fio === fio)
    if (user) {
      currentUser.value = { id: user.id, fio: user.fio, role: user.role }
      localStorage.setItem('bizmeet_auth', JSON.stringify(currentUser.value))
      return true
    }
    return false
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('bizmeet_auth')
  }

  const isAssistant = () => currentUser.value?.role === 'assistant'
  const isExecutive = () => currentUser.value?.role === 'executive'
  const isCoordinator = () => currentUser.value?.role === 'coordinator'

  return { currentUser, login, logout, isAssistant, isExecutive, isCoordinator }
}