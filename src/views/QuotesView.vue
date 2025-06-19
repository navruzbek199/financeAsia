<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useQuotesStore } from '../stores/quotes'
import { useAuthStore } from '../stores/auth'

const quotesStore = useQuotesStore()
const authStore = useAuthStore()

const filterStatus = ref('all')

const filteredQuotes = computed(() => {
  if (filterStatus.value === 'all') {
    return quotesStore.quotes
  }
  return quotesStore.quotes.filter(quote => quote.status === filterStatus.value)
})

const updateStatus = async (quoteId: number, status: string) => {
  try {
    await quotesStore.updateQuoteStatus(quoteId, status)
  } catch (error) {
    console.error('Error updating quote status:', error)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const calculateTotal = (price: number, quantity: number) => {
  return (price * quantity).toLocaleString()
}

onMounted(() => {
  quotesStore.fetchQuotes()
})
</script>

<template>
  <div class="quotes-view">
    <div class="quotes-header">
      <h1>{{ authStore.isAdmin ? 'Quote Requests Management' : 'My Quote Requests' }}</h1>
      <p>{{ authStore.isAdmin ? 'Manage and respond to client quote requests' : 'Track your quote requests and their status' }}</p>
    </div>

    <div class="quotes-filters">
      <div class="filter-group">
        <label for="status-filter">Filter by status:</label>
        <select id="status-filter" v-model="filterStatus" class="filter-select">
          <option value="all">All Quotes</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>

    <div v-if="quotesStore.loading" class="loading">
      <p>Loading quotes...</p>
    </div>

    <div v-else-if="filteredQuotes.length === 0" class="empty-state">
      <p>{{ filterStatus === 'all' ? 'No quote requests found.' : `No ${filterStatus} quotes found.` }}</p>
      <RouterLink v-if="!authStore.isAdmin" to="/products" class="btn btn-primary">
        Browse Products
      </RouterLink>
    </div>

    <div v-else class="quotes-grid">
      <div v-for="quote in filteredQuotes" :key="quote.id" class="quote-card">
        <div class="quote-header">
          <div class="quote-info">
            <h3>{{ quote.product_name }}</h3>
            <p v-if="authStore.isAdmin" class="client-info">
              <strong>Client:</strong> {{ quote.client_name }} ({{ quote.client_email }})
            </p>
            <p class="quote-date">{{ formatDate(quote.created_at) }}</p>
          </div>
          <div class="quote-status">
            <span :class="`status-badge status-${quote.status}`">
              {{ quote.status }}
            </span>
          </div>
        </div>
        
        <div class="quote-body">
          <div class="quote-details">
            <div class="detail-item">
              <span class="detail-label">Quantity:</span>
              <span class="detail-value">{{ quote.quantity }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Unit Price:</span>
              <span class="detail-value">${{ quote.product_price.toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Total Estimate:</span>
              <span class="detail-value total-price">${{ calculateTotal(quote.product_price, quote.quantity) }}</span>
            </div>
          </div>
          
          <div v-if="quote.message" class="quote-message">
            <h4>Client Message:</h4>
            <p>{{ quote.message }}</p>
          </div>
        </div>
        
        <div v-if="authStore.isAdmin && quote.status === 'pending'" class="quote-actions">
          <button 
            @click="updateStatus(quote.id, 'approved')"
            class="btn btn-success"
          >
            Approve
          </button>
          <button 
            @click="updateStatus(quote.id, 'rejected')"
            class="btn btn-danger"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quotes-view {
  max-width: 1200px;
  margin: 0 auto;
}

.quotes-header {
  margin-bottom: 2rem;
}

.quotes-header h1 {
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.quotes-header p {
  color: #64748b;
  margin: 0;
  font-size: 1.1rem;
}

.quotes-filters {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.quotes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.quote-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.2s;
}

.quote-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.quote-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.quote-info h3 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.client-info {
  margin: 0 0 0.5rem 0;
  color: #64748b;
  font-size: 0.875rem;
}

.quote-date {
  margin: 0;
  color: #94a3b8;
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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

.quote-body {
  padding: 1.5rem;
}

.quote-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: #64748b;
  font-size: 0.875rem;
}

.detail-value {
  color: #1e293b;
  font-weight: 600;
}

.total-price {
  color: #16a34a;
  font-size: 1.125rem;
}

.quote-message {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.quote-message h4 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.quote-message p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

.quote-actions {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
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
  flex: 1;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-success {
  background: #16a34a;
  color: white;
}

.btn-success:hover {
  background: #15803d;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover {
  background: #b91c1c;
}

@media (max-width: 768px) {
  .quotes-grid {
    grid-template-columns: 1fr;
  }
  
  .quote-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quote-actions {
    flex-direction: column;
  }
}
</style>