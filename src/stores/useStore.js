import { reactive, watch } from 'vue'

const STORAGE_KEY = 'bizmeet'

const defaultState = () => ({
  users: [
    { id: 'exec', fio: 'Иванов Иван Иванович', role: 'executive', key: null },
    { id: 'as1', fio: 'Петрова Анна Сергеевна', role: 'assistant', key: 'AS-2026-01' },
    { id: 'c1', fio: 'Сидоров П.В.', role: 'coordinator', key: 'CO-001', supervisorId: 'exec' },
    { id: 'c2', fio: 'Козлова Е.В.', role: 'coordinator', key: 'CO-002', supervisorId: 'exec' },
    { id: 'a1', fio: 'Морозов Д.', role: 'aide', key: 'AI-001', supervisorId: 'c1' },
    { id: 'a2', fio: 'Фёдорова О.', role: 'aide', key: 'AI-002', supervisorId: 'c2' }
  ],
  meetings: [
    {
      id: 'm1',
      title: 'Обсуждение квартального бюджета',
      date: '2026-05-15',
      startTime: '10:00',
      endTime: '11:30',
      type: 'planning',
      dresscode: 'business',
      location: 'Переговорная 3',
      transport: 'company',
      createdBy: 'as1',
      participants: ['exec', 'c1'],
      bossChecklist: [
        { text: 'Подготовить речь', done: false },
        { text: 'Проверить бюджет', done: false }
      ],
      permissions: {
        coordinator: { viewFields: ['title','location','dresscode','checklist'] },
        aide: { viewFields: ['dresscode'] }
      }
    }
  ],
  log: []
})

const saved = localStorage.getItem(STORAGE_KEY)
const state = reactive(saved ? JSON.parse(saved) : defaultState())

watch(state, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function useStore() {
  const addUser = (user) => {
    state.users.push({ id: Date.now().toString(), ...user })
  }
  const removeUser = (id) => {
    state.users = state.users.filter(u => u.id !== id)
  }
  const addMeeting = (m) => {
    state.meetings.push({ id: Date.now().toString(), ...m })
  }
  const removeMeeting = (id) => {
    state.meetings = state.meetings.filter(m => m.id !== id)
  }
  const getMeetingsByDate = (date) => state.meetings.filter(m => m.date === date)

  return { state, addUser, removeUser, addMeeting, removeMeeting, getMeetingsByDate }
}