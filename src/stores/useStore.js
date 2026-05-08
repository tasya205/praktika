import { reactive, watch } from 'vue'

const STORAGE_KEY = 'bizmeet'

const defaultState = () => ({
  users: [
    { id: 'exec', fio: 'Иванов И.И.', role: 'executive', key: null },
    { id: 'as1', fio: 'Петрова А.С.', role: 'assistant', key: 'AS-2026-01' }
  ],
  meetings: [],
  log: []
})

const saved = localStorage.getItem(STORAGE_KEY)
const state = reactive(saved ? JSON.parse(saved) : defaultState())

watch(state, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function useStore() {
  const addUser = (user) => { state.users.push({ id: Date.now().toString(), ...user }) }
  const removeUser = (id) => { state.users = state.users.filter(u => u.id !== id) }
  const addMeeting = (m) => { state.meetings.push({ id: Date.now().toString(), ...m }) }
  const removeMeeting = (id) => { state.meetings = state.meetings.filter(m => m.id !== id) }
  const getMeetingsByDate = (date) => state.meetings.filter(m => m.date === date)

  return { state, addUser, removeUser, addMeeting, removeMeeting, getMeetingsByDate }
}