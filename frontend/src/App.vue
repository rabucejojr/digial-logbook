<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const isMobileMenuOpen = ref(false)

const isActive = (routeName) => {
  return route.name === routeName
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Close mobile menu when route changes
const currentRoute = computed(() => route.path)
import { watch } from 'vue'
watch(currentRoute, () => {
  closeMobileMenu()
})
</script>

<template>
  <div class="app">
    <!-- Navigation Header -->
    <header class="app-header">
      <div class="header-container">
        <!-- Logo/Brand -->
        <RouterLink to="/" class="brand" @click="closeMobileMenu">
          <div class="logo">
            <img src="/dostlogo.png" alt="DOST Logo" class="logo-img" />
          </div>
          <div class="brand-info">
            <span class="brand-text">SDN Client Logbook</span>
            <span class="brand-subtitle">DOST Caraga PSTO- Surigao del Norte</span>
          </div>
        </RouterLink>

        <!-- Desktop Navigation -->
        <nav class="desktop-nav">
          <RouterLink to="/" class="nav-link" :class="{ active: isActive('dashboard') }">
            <i class="nav-icon">🏠</i> Dashboard
          </RouterLink>
          <RouterLink to="/entries" class="nav-link" :class="{ active: isActive('entries') }">
            <i class="nav-icon">👥</i> All Clients
          </RouterLink>
          <RouterLink
            to="/new-entry"
            class="nav-link new-entry-btn"
            :class="{ active: isActive('new-entry') }"
          >
            <i class="nav-icon">📝</i> New Client
          </RouterLink>
          <RouterLink to="/settings" class="nav-link" :class="{ active: isActive('settings') }">
            <i class="nav-icon">⚙️</i> Settings
          </RouterLink>
        </nav>

        <!-- Mobile Menu Button -->
        <button
          class="mobile-menu-btn"
          @click="toggleMobileMenu"
          :class="{ active: isMobileMenuOpen }"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

            <!-- Mobile Navigation -->
      <nav class="mobile-nav" :class="{ open: isMobileMenuOpen }">
        <RouterLink 
          to="/" 
          class="mobile-nav-link"
          :class="{ active: isActive('dashboard') }"
          @click="closeMobileMenu"
        >
          🏠 Dashboard
        </RouterLink>
        <RouterLink 
          to="/entries" 
          class="mobile-nav-link"
          :class="{ active: isActive('entries') }"
          @click="closeMobileMenu"
        >
          👥 All Clients
        </RouterLink>
        <RouterLink 
          to="/new-entry" 
          class="mobile-nav-link"
          :class="{ active: isActive('new-entry') }"
          @click="closeMobileMenu"
        >
          📝 New Client
        </RouterLink>
        <RouterLink 
          to="/settings" 
          class="mobile-nav-link"
          :class="{ active: isActive('settings') }"
          @click="closeMobileMenu"
        >
          ⚙️ Settings
        </RouterLink>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-container">
        <p>&copy; 2025 Department of Science and Technology - Caraga Region</p>
        <p class="footer-tagline">#OneDOST4U</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Reset / Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  font-family: "Segoe UI", Roboto, Arial, sans-serif;
  background: #f9fafb;
  color: #111827;
  height: 100%;
  width: 100%;
}

a {
  text-decoration: none;
  color: inherit;
}

/* App Container */
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ================= HEADER ================= */
.app-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-bottom: 3px solid #fbbf24;
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
}

/* Brand Section */
.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-img {
  width: 40px;
  height: 40px;
}

.brand-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-text {
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
}

.brand-subtitle {
  font-size: 0.8rem;
  color: #e0e7ff;
}

/* Desktop Nav */
.desktop-nav {
  display: none;
  gap: 1rem;
}

.nav-link {
  padding: 0.5rem 0.8rem;
  border-radius: 5px;
  color: #ffffff;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: background 0.3s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.25);
}

.nav-icon {
  font-size: 1.2rem;
}

.new-entry-btn {
  background: #fbbf24;
  color: #1f2937;
  font-weight: bold;
}

.new-entry-btn:hover {
  background: #f59e0b;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 28px;
  height: 22px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.mobile-menu-btn span {
  display: block;
  height: 3px;
  background: #ffffff;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.mobile-menu-btn.active span:nth-child(1) {
  transform: rotate(45deg) translateY(8px);
}

.mobile-menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translateY(-8px);
}

/* Mobile Nav */
.mobile-nav {
  display: flex;
  flex-direction: column;
  background: #1e3a8a;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease;
}

.mobile-nav.open {
  max-height: 300px;
}

.mobile-nav-link {
  padding: 0.8rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-weight: 500;
}

.mobile-nav-link.active {
  background: rgba(255, 255, 255, 0.25);
}

/* ================= MAIN ================= */
.app-main {
  flex: 1;
  padding: 1rem;
}

/* ================= FOOTER ================= */
.app-footer {
  background: #1f2937;
  color: #d1d5db;
  text-align: center;
  padding: 0.8rem 1rem;
  font-size: 0.9rem;
}

.footer-tagline {
  font-style: italic;
  color: #fbbf24;
}

/* ================= RESPONSIVE ================= */
@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
  }
  .mobile-menu-btn {
    display: none;
  }
  .mobile-nav {
    display: none;
  }
}
</style>

