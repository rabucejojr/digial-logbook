import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { title: 'Client Management Dashboard' },
    },
    {
      path: '/entries',
      name: 'entries',
      component: () => import('../views/EntriesView.vue'),
      meta: { title: 'All Clients' },
    },
    {
      path: '/new-entry',
      name: 'new-entry',
      component: () => import('../views/NewEntryView.vue'),
      meta: { title: 'Register New Client' },
    },
    {
      path: '/entry/:id',
      name: 'entry-detail',
      component: () => import('../views/EntryDetailView.vue'),
      meta: { title: 'Client Details' },
    },
    {
      path: '/entry/:id/edit',
      name: 'edit-entry',
      component: () => import('../views/EditEntryView.vue'),
      meta: { title: 'Edit Client Information' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { title: 'System Settings' },
    },
    // Redirect old routes
    {
      path: '/home',
      redirect: '/',
    },
    {
      path: '/about',
      redirect: '/settings',
    },
    // Catch-all 404 route
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/DashboardView.vue'),
      meta: { title: '404 - Page Not Found' },
    },
  ],
})

// Navigation guard to set page title
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - DOST Client Logbook`
  } else {
    document.title = 'DOST Client Logbook - Department of Science and Technology'
  }
  next()
})

export default router
