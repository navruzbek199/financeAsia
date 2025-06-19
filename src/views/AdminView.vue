<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductsStore } from '../stores/products'
import { useQuotesStore } from '../stores/quotes'

const productsStore = useProductsStore()
const quotesStore = useQuotesStore()

const showProductForm = ref(false)
const editingProduct = ref(null)
const productForm = ref({
  name: '',
  description: '',
  price: 0,
  category: ''
})

const error = ref('')
const success = ref('')

const openProductForm = (product = null) => {
  editingProduct.value = product
  if (product) {
    productForm.value = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category
    }
  } else {
    productForm.value = {
      name: '',
      description: '',
      price: 0,
      category: ''
    }
  }
  showProductForm.value = true
}

const closeProductForm = () => {
  showProductForm.value = false
  editingProduct.value = null
  error.value = ''
}

const saveProduct = async () => {
  try {
    error.value = ''
    
    if (editingProduct.value) {
      await productsStore.updateProduct(editingProduct.value.id, productForm.value)
      success.value = 'Product updated successfully!'
    } else {
      await productsStore.createProduct(productForm.value)
      success.value = 'Product created successfully!'
    }
    
    closeProductForm()
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to save product'
  }
}

const deleteProduct = async (product) => {
  if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
    try {
      await productsStore.deleteProduct(product.id)
      success.value = 'Product deleted successfully!'
      setTimeout(() => {
        success.value = ''
      }, 3000)
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete product'
    }
  }
}

const updateQuoteStatus = async (quoteId: number, status: string) => {
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

onMounted(() => {
  productsStore.fetchProducts()
  quotesStore.fetchQuotes()
})
</script>

<template>
  <div class="admin-view">
    <div class="admin-header">
      <h1>Admin Dashboard</h1>
      <p>Manage products and quote requests</p>
    </div>

    <div v-if="success" class="success-message">
      {{ success }}
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="admin-sections">
      <!-- Products Management -->
      <section class="admin-section">
        <div class="section-header">
          <h2>Products Management</h2>
          <button @click="openProductForm()" class="btn btn-primary">
            Add New Product
          </button>
        </div>

        <div v-if="productsStore.loading" class="loading">
          <p>Loading products...</p>
        </div>

        <div v-else-if="productsStore.products.length === 0" class="empty-state">
          <p>No products available. Create your first product!</p>
        </div>

        <div v-else class="products-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in productsStore.products" :key="product.id">
                <td>
                  <div class="product-cell">
                    <strong>{{ product.name }}</strong>
                    <small>{{ product.description }}</small>
                  </div>
                </td>
                <td>{{ product.category }}</td>
                <td>${{ product.price.toLocaleString() }}</td>
                <td>
                  <div class="table-actions">
                    <button @click="openProductForm(product)" class="btn btn-sm btn-outline">
                      Edit
                    </button>
                    <button @click="deleteProduct(product)" class="btn btn-sm btn-danger">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Quote Requests Management -->
      <section class="admin-section">
        <div class="section-header">
          <h2>Quote Requests</h2>
          <span class="badge">{{ quotesStore.quotes.filter(q => q.status === 'pending').length }} pending</span>
        </div>

        <div v-if="quotesStore.loading" class="loading">
          <p>Loading quotes...</p>
        </div>

        <div v-else-if="quotesStore.quotes.length === 0" class="empty-state">
          <p>No quote requests yet.</p>
        </div>

        <div v-else class="quotes-table">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="quote in quotesStore.quotes" :key="quote.id">
                <td>
                  <div class="client-cell">
                    <strong>{{ quote.client_name }}</strong>
                    <small>{{ quote.client_email }}</small>
                  </div>
                </td>
                <td>{{ quote.product_name }}</td>
                <td>{{ quote.quantity }}</td>
                <td>${{ (quote.product_price * quote.quantity).toLocaleString() }}</td>
                <td>
                  <span :class="`status-badge status-${quote.status}`">
                    {{ quote.status }}
                  </span>
                </td>
                <td>{{ formatDate(quote.created_at) }}</td>
                <td>
                  <div v-if="quote.status === 'pending'" class="table-actions">
                    <button 
                      @click="updateQuoteStatus(quote.id, 'approved')"
                      class="btn btn-sm btn-success"
                    >
                      Approve
                    </button>
                    <button 
                      @click="updateQuoteStatus(quote.id, 'rejected')"
                      class="btn btn-sm btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                  <span v-else class="status-final">{{ quote.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Product Form Modal -->
    <div v-if="showProductForm" class="modal-overlay" @click="closeProductForm">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
          <button @click="closeProductForm" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveProduct" class="product-form">
            <div class="form-group">
              <label for="name">Product Name</label>
              <input
                id="name"
                v-model="productForm.name"
                type="text"
                required
                class="form-input"
                placeholder="Enter product name"
              />
            </div>
            
            <div class="form-group">
              <label for="category">Category</label>
              <input
                id="category"
                v-model="productForm.category"
                type="text"
                required
                class="form-input"
                placeholder="Enter category"
              />
            </div>
            
            <div class="form-group">
              <label for="price">Price</label>
              <input
                id="price"
                v-model="productForm.price"
                type="number"
                step="0.01"
                min="0"
                required
                class="form-input"
                placeholder="Enter price"
              />
            </div>
            
            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="productForm.description"
                class="form-input"
                rows="4"
                placeholder="Enter product description"
              ></textarea>
            </div>
            
            <div v-if="error" class="error-message">
              {{ error }}
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="closeProductForm" class="btn btn-outline">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingProduct ? 'Update Product' : 'Create Product' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-view {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header {
  margin-bottom: 2rem;
}

.admin-header h1 {
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.admin-header p {
  color: #64748b;
  margin: 0;
  font-size: 1.1rem;
}

.success-message {
  background: #d1fae5;
  color: #065f46;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  border: 1px solid #a7f3d0;
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  border: 1px solid #fecaca;
}

.admin-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.admin-section {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.section-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
}

.badge {
  background: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.loading {
  padding: 2rem;
  text-align: center;
  color: #64748b;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #64748b;
}

.products-table,
.quotes-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.product-cell,
.client-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-cell strong,
.client-cell strong {
  color: #1e293b;
}

.product-cell small,
.client-cell small {
  color: #64748b;
  font-size: 0.875rem;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
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

.status-final {
  color: #64748b;
  font-size: 0.875rem;
  text-transform: capitalize;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.close-btn:hover {
  color: #1e293b;
}

.modal-body {
  padding: 1.5rem;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
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

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
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
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .table-actions {
    flex-direction: column;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .products-table,
  .quotes-table {
    font-size: 0.875rem;
  }
  
  th,
  td {
    padding: 0.75rem;
  }
}
</style>