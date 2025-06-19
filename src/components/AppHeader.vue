<script setup>
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <h1>FinanceCRM</h1>
        </div>

        <nav class="nav">
          <RouterLink to="/dashboard" class="nav-link">Dashboard</RouterLink>
          <RouterLink to="/products" class="nav-link">Products</RouterLink>
          <RouterLink to="/quotes" class="nav-link">Quotes</RouterLink>
          <RouterLink v-if="authStore.isAdmin" to="/admin" class="nav-link"
            >Admin</RouterLink
          >
        </nav>

        <div class="user-menu">
          <span class="user-name">{{ authStore.user?.name }}</span>
          <span class="user-role">{{ authStore.user?.role }}</span>
          <button @click="handleLogout" class="btn btn-outline">Logout</button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.logo h1 {
  margin: 0;
  color: #2563eb;
  font-size: 1.5rem;
  font-weight: 700;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #2563eb;
  background-color: #eff6ff;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 600;
  color: #1e293b;
}

.user-role {
  font-size: 0.875rem;
  color: #64748b;
  text-transform: capitalize;
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-outline {
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-outline:hover {
  background: #f8fafc;
  color: #1e293b;
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    height: auto;
    padding: 1rem 0;
  }

  .nav {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 1rem;
    gap: 1rem;
  }

  .user-menu {
    gap: 0.5rem;
  }

  .user-name {
    display: none;
  }
}
</style>
