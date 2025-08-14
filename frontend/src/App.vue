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
            <span class="brand-subtitle">DOST Caraga</span>
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
/* Mobile First Base Styles */
.app {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  padding: 0;
}

/* Header Styles - Mobile First */
.app-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-bottom: 3px solid #fbbf24;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
  width: 100vw;
}

.header-container {
  width: 100%;
  padding: 0 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  overflow-x:auto;
  width: 100vw;

}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.logo {
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
  flex-shrink: 0;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-info {
  display: none;
}

.brand-text {
  font-weight: 700;
  font-size: 16px;
}

.brand-subtitle {
  font-size: 11px;
  opacity: 0.9;
  font-weight: 400;
}

.brand:hover {
  color: #fbbf24;
}

/* Desktop Navigation - Hidden on Mobile */
.desktop-nav {
  display: none;
}

.nav-link {
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 13px;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-icon {
  font-size: 14px;
}

.nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.nav-link.active {
  color: #1e3a8a;
  background-color: #fbbf24;
  font-weight: 600;
}

.nav-link.new-entry-btn {
  background-color: #16a34a;
  color: white;
  font-weight: 600;
}

.nav-link.new-entry-btn:hover {
  background-color: #15803d;
  color: white;
}

.nav-link.new-entry-btn.active {
  background-color: #166534;
  color: white;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.mobile-menu-btn span {
  width: 24px;
  height: 2px;
  background-color: white;
  transition: all 0.3s ease;
  transform-origin: center;
}

.mobile-menu-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Mobile Navigation */
.mobile-nav {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.mobile-nav.open {
  max-height: 280px;
}

.mobile-nav-link {
  padding: 14px 16px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.mobile-nav-link.active {
  color: #1e3a8a;
  background-color: #fbbf24;
  font-weight: 600;
}

.mobile-nav-link:last-child {
  border-bottom: none;
}

/* Main Content */
.app-main {
  flex: 1;
  width: 100%;
  max-width: 100%;
}

/* Footer */
.app-footer {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-top: 3px solid #fbbf24;
  padding: 16px 0;
  margin-top: auto;
  width: 100%;
}

.footer-container {
  width: 100%;
  padding: 0 12px;
  text-align: center;
}

.footer-container p {
  margin: 0 0 2px 0;
  color: white;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
}

.footer-tagline {
  font-size: 10px !important;
  opacity: 0.9;
  font-weight: 400 !important;
}

/* Tablet Styles (min-width: 481px) */
@media (min-width: 481px) {
  .header-container {
    padding: 0 16px;
    height: 60px;
  }

  .logo {
    width: 36px;
    height: 36px;
    padding: 4px;
  }

  .brand {
    font-size: 15px;
    gap: 10px;
  }

  .footer-container {
    padding: 0 16px;
  }

  .footer-container p {
    font-size: 13px;
  }

  .footer-tagline {
    font-size: 11px !important;
  }

  .app-footer {
    padding: 18px 0;
  }
}

/* Small Desktop Styles (min-width: 769px) */
@media (min-width: 769px) {
  .header-container {
    padding: 0 20px;
    height: 64px;
  }

  .brand {
    font-size: 16px;
    gap: 12px;
  }

  .brand-info {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .logo {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    padding: 4px;
  }

  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .mobile-menu-btn {
    display: none;
  }

  .mobile-nav {
    display: none;
  }

  .nav-link {
    padding: 9px 14px;
    font-size: 14px;
    gap: 7px;
  }

  .nav-icon {
    font-size: 15px;
  }

  .footer-container {
    padding: 0 20px;
  }

  .footer-container p {
    font-size: 14px;
  }

  .footer-tagline {
    font-size: 12px !important;
  }

  .app-footer {
    padding: 20px 0;
  }

  .app-header {
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
  }
}

/* Large Desktop Styles (min-width: 1025px) */
@media (min-width: 1025px) {
  .header-container {
    padding: 0 32px;
    max-width: none;
  }

  .desktop-nav {
    gap: 8px;
  }

  .nav-link {
    padding: 10px 16px;
    font-size: 14px;
    gap: 8px;
  }

  .nav-icon {
    font-size: 16px;
  }

  .footer-container {
    padding: 0 32px;
  }
}

/* Extra Large Screens (min-width: 1441px) */
@media (min-width: 1441px) {
  .header-container {
    padding: 0 48px;
  }

  .footer-container {
    padding: 0 48px;
  }

  .desktop-nav {
    gap: 12px;
  }

  .nav-link {
    padding: 12px 20px;
    font-size: 15px;
  }
}

/* Ultra Wide Screens (min-width: 1921px) */
@media (min-width: 1921px) {
  .header-container {
    padding: 0 64px;
  }

  .footer-container {
    padding: 0 64px;
  }
}

/* Smooth transitions */
* {
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .app-header {
    border-bottom-width: 4px;
  }
  
  .nav-link.active {
    border: 2px solid #1e3a8a;
  }
}

/* Print styles */
@media print {
  .app-header,
  .app-footer {
    display: none;
  }
  
  .app-main {
    margin: 0;
    padding: 0;
  }
}
</style>
