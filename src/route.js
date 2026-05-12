import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from './CalendarView.vue'
import DayPage from './DayPage.vue'
import AdminPanel from './AdminPanel.vue'
import WorkersPage from './WorkersPage.vue'
import LoginPage from './LoginPage.vue'
import ProfilePage from './ProfilePage.vue'
import AboutPage from './AboutPage.vue'


const routes = [
  { path: '/login', component: LoginPage },
  { path: '/', component: CalendarView, meta: { requiresAuth: true } },
  { path: '/day/:date', component: DayPage, meta: { requiresAuth: true } },
  { path: '/admin', component: AdminPanel, meta: { requiresAuth: true, requiresRole: 'assistant' } },
  { path: '/workers', component: WorkersPage, meta: { requiresAuth: true } },
  { path: '/profile', component: ProfilePage, meta: { requiresAuth: true } },
  { path: '/about', component: AboutPage, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// глобальный охранник сие ада
router.beforeEach((to, from, next) => {
  // only регистрацвия
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // чекаю авторизацию через localStorage
  const stored = localStorage.getItem('bizmeet_auth')
  if (!stored) {
    next('/login')
    return
  }

  const auth = JSON.parse(stored)
  
  // проверка роли для ассистента (тип админа, но не он)
  if (to.meta.requiresRole && auth.role !== to.meta.requiresRole) {
    next('/')
    return
  }

  next()
})

export default router