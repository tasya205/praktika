import { ref } from 'vue'
import { useStore } from '../stores/useStore'

const currentUser = ref(null)

export function useAuth() {
  const { state } = useStore()

  const login = (key, fio) => {
    const user = state.users.find(u => u.key === key && u.fio === fio)
    if (user) currentUser.value = user
    return !!user
  }

  const logout = () => { currentUser.value = null }

  return { currentUser, login, logout }
}

// временно, тип заглушек если чо