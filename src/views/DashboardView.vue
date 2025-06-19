<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useAuthStore } from "../stores/auth";
import { useProductsStore } from "../stores/products";
import { useQuotesStore } from "../stores/quotes";

const authStore = useAuthStore();
const productsStore = useProductsStore();
const quotesStore = useQuotesStore();

const stats = computed(() => {
  if (authStore.isAdmin) {
    return [
      {
        title: "Total Products",
        value: productsStore.products.length,
        color: "bg-blue-500",
      },
      {
        title: "Quote Requests",
        value: quotesStore.quotes.length,
        color: "bg-green-500",
      },
      {
        title: "Pending Quotes",
        value: quotesStore.quotes.filter((q) => q.status === "pending").length,
        color: "bg-yellow-500",
      },
      {
        title: "Approved Quotes",
        value: quotesStore.quotes.filter((q) => q.status === "approved").length,
        color: "bg-emerald-500",
      },
    ];
  } else {
    return [
      {
        title: "Available Products",
        value: productsStore.products.length,
        color: "bg-blue-500",
      },
      {
        title: "My Quotes",
        value: quotesStore.quotes.length,
        color: "bg-green-500",
      },
      {
        title: "Pending",
        value: quotesStore.quotes.filter((q) => q.status === "pending").length,
        color: "bg-yellow-500",
      },
      {
        title: "Approved",
        value: quotesStore.quotes.filter((q) => q.status === "approved").length,
        color: "bg-emerald-500",
      },
    ];
  }
});

const recentQuotes = computed(() => {
  return quotesStore.quotes.slice(0, 5);
});

onMounted(() => {
  productsStore.fetchProducts();
  quotesStore.fetchQuotes();
});
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Welcome back, {{ authStore.user?.name }}!</h1>
      <p>
        Here's what's happening with your
        {{ authStore.isAdmin ? "business" : "account" }} today.
      </p>
    </div>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.title" class="stat-card">
        <div class="stat-icon" :class="stat.color"></div>
        <div class="stat-content">
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.title }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="recent-quotes">
        <h2>Recent Quote Requests</h2>
        <div v-if="recentQuotes.length === 0" class="empty-state">
          <p>No quote requests yet.</p>
          <RouterLink to="/products" class="btn btn-primary"
            >Browse Products</RouterLink
          >
        </div>
        <div v-else class="quotes-list">
          <div v-for="quote in recentQuotes" :key="quote.id" class="quote-item">
            <div class="quote-info">
              <h4>{{ quote.product_name }}</h4>
              <p v-if="authStore.isAdmin">Client: {{ quote.client_name }}</p>
              <p>Quantity: {{ quote.quantity }}</p>
              <span class="quote-date">{{
                new Date(quote.created_at).toLocaleDateString()
              }}</span>
            </div>
            <div class="quote-status">
              <span :class="`status-badge status-${quote.status}`">
                {{ quote.status }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="recentQuotes.length > 0" class="view-all">
          <RouterLink to="/quotes" class="btn btn-outline"
            >View All Quotes</RouterLink
          >
        </div>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <RouterLink to="/products" class="action-card">
            <div class="action-icon bg-blue-500">
              <span>📦</span>
            </div>
            <div class="action-content">
              <h3>
                {{ authStore.isAdmin ? "Manage Products" : "Browse Products" }}
              </h3>
              <p>
                {{
                  authStore.isAdmin
                    ? "Add, edit, or remove products"
                    : "View available products and services"
                }}
              </p>
            </div>
          </RouterLink>

          <RouterLink to="/quotes" class="action-card">
            <div class="action-icon bg-green-500">
              <span>💬</span>
            </div>
            <div class="action-content">
              <h3>Quote Requests</h3>
              <p>
                {{
                  authStore.isAdmin
                    ? "Manage client quote requests"
                    : "View your quote requests"
                }}
              </p>
            </div>
          </RouterLink>

          <RouterLink v-if="authStore.isAdmin" to="/admin" class="action-card">
            <div class="action-icon bg-purple-500">
              <span>⚙️</span>
            </div>
            <div class="action-content">
              <h3>Admin Panel</h3>
              <p>Access administrative features</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.dashboard-header p {
  color: #64748b;
  margin: 0;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-content h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.875rem;
  font-weight: 700;
}

.stat-content p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.recent-quotes,
.quick-actions {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.recent-quotes h2,
.quick-actions h2 {
  margin: 0 0 1.5rem 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.quotes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quote-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.quote-info h4 {
  margin: 0 0 0.25rem 0;
  color: #1e293b;
  font-weight: 600;
}

.quote-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.quote-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-approved {
  background: #d1fae5;
  color: #065f46;
}

.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.view-all {
  margin-top: 1rem;
  text-align: center;
}

.actions-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  text-decoration: none;
  transition: all 0.2s;
}

.action-card:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.action-content h3 {
  margin: 0 0 0.25rem 0;
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
}

.action-content p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
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

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-outline {
  background: transparent;
  color: #2563eb;
  border: 1px solid #2563eb;
}

.btn-outline:hover {
  background: #2563eb;
  color: white;
}

.bg-blue-500 {
  background-color: #3b82f6;
}
.bg-green-500 {
  background-color: #10b981;
}
.bg-yellow-500 {
  background-color: #f59e0b;
}
.bg-emerald-500 {
  background-color: #10b981;
}
.bg-purple-500 {
  background-color: #8b5cf6;
}

@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .quote-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
