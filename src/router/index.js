import { createRouter, createWebHistory } from 'vue-router'
import WelcomeView from '../views/WelcomeView.vue'
import BookingView from '../views/BookingView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: WelcomeView
    },
    {
      path: '/booking',
      name: 'booking',
      component: BookingView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView
    }
  ]
})

export default router