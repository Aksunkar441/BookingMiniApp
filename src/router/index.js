import { createRouter, createWebHistory } from 'vue-router'
// Импортируем наши экраны из папки views
import BookingView from '../views/BookingView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes = [
  {
    path: '/',
    name: 'Booking',
    component: BookingView
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router