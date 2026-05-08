import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from './CalendarView.vue'
import DayPage from './DayPage.vue'
import AdminPanel from './AdminPanel.vue'
import WorkersPage from './WorkersPage.vue'

const routes = [
  { path: '/', component: CalendarView },
  { path: '/day/:date', component: DayPage },
  { path: '/admin', component: AdminPanel, meta: { requiresRole: 'assistant' } },
  { path: '/workers', component: WorkersPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router