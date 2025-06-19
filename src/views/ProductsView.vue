<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useProductsStore } from "../stores/products";
import { useQuotesStore } from "../stores/quotes";
import { useAuthStore } from "../stores/auth";

const productsStore = useProductsStore();
const quotesStore = useQuotesStore();
const authStore = useAuthStore();

const selectedProduct = ref(null as any);
const quoteForm = ref({
  quantity: 1,
  message: "",
});
const showQuoteModal = ref(false);
const success = ref("");
const error = ref("");

const openQuoteModal = (product: any) => {
  selectedProduct.value = product;
  showQuoteModal.value = true;
  quoteForm.value = { quantity: 1, message: "" };
};

const submitQuote = async () => {
  try {
    error.value = "";
    await quotesStore.createQuote({
      product_id: selectedProduct.value.id as any,
      quantity: quoteForm.value.quantity,
      message: quoteForm.value.message,
    });
    success.value = "Quote request submitted successfully!";
    showQuoteModal.value = false;
    setTimeout(() => {
      success.value = "";
    }, 3000);
  } catch (err: any) {
    error.value = err.response?.data?.error || "Failed to submit quote request";
  }
};

onMounted(() => {
  productsStore.fetchProducts();
});
</script>

<template>
  <div class="products-view">
    <div class="products-header">
      <h1>{{ authStore.isAdmin ? "Product Management" : "Our Products" }}</h1>
      <p>
        {{
          authStore.isAdmin
            ? "Manage your product catalog"
            : "Explore our financial products and services"
        }}
      </p>
    </div>

    <div v-if="success" class="success-message">
      {{ success }}
    </div>

    <div v-if="productsStore.loading" class="loading">
      <p>Loading products...</p>
    </div>

    <div v-else-if="productsStore.products.length === 0" class="empty-state">
      <p>No products available yet.</p>
    </div>

    <div v-else class="products-grid">
      <div
        v-for="product in productsStore.products"
        :key="product.id"
        class="product-card"
      >
        <div class="product-header">
          <h3>{{ product.name }}</h3>
          <span class="product-category">{{ product.category }}</span>
        </div>

        <div class="product-body">
          <p class="product-description">{{ product.description }}</p>
          <div class="product-price">
            <span class="price-label">Starting from</span>
            <span class="price-value"
              >${{ product.price.toLocaleString() }}</span
            >
          </div>
        </div>

        <div class="product-actions">
          <button
            v-if="!authStore.isAdmin"
            @click="openQuoteModal(product)"
            class="btn btn-primary"
          >
            Request Quote
          </button>
          <RouterLink v-else to="/admin" class="btn btn-outline">
            Manage
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Quote Modal -->
    <div
      v-if="showQuoteModal"
      class="modal-overlay"
      @click="showQuoteModal = false"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Request Quote</h2>
          <button @click="showQuoteModal = false" class="close-btn">
            &times;
          </button>
        </div>

        <div class="modal-body">
          <div class="selected-product">
            <h3>{{ selectedProduct?.name }}</h3>
            <p>{{ selectedProduct?.description }}</p>
            <p class="price">
              Starting from ${{ selectedProduct?.price.toLocaleString() }}
            </p>
          </div>

          <form @submit.prevent="submitQuote" class="quote-form">
            <div class="form-group">
              <label for="quantity">Quantity</label>
              <input
                id="quantity"
                v-model="quoteForm.quantity"
                type="number"
                min="1"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="message">Additional Message (Optional)</label>
              <textarea
                id="message"
                v-model="quoteForm.message"
                class="form-input"
                rows="4"
                placeholder="Tell us more about your requirements..."
              ></textarea>
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <div class="modal-actions">
              <button
                type="button"
                @click="showQuoteModal = false"
                class="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Submit Quote Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-view {
  max-width: 1200px;
  margin: 0 auto;
}

.products-header {
  margin-bottom: 2rem;
}

.products-header h1 {
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.products-header p {
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

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.product-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.2s;
}

.product-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-header {
  padding: 1.5rem 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.product-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.product-category {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.product-body {
  padding: 1rem 1.5rem;
}

.product-description {
  color: #64748b;
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.product-price {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-label {
  font-size: 0.875rem;
  color: #64748b;
}

.price-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #16a34a;
}

.product-actions {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
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

.selected-product {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.selected-product h3 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-weight: 600;
}

.selected-product p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.selected-product .price {
  color: #16a34a;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.quote-form {
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

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  background: #fef2f2;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
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

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    padding: 1rem;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
