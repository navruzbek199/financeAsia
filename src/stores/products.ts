import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../services/api";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export const useProductsStore = defineStore("products", () => {
  const products = ref<Product[]>([] as any);
  const loading = ref(false);

  const fetchProducts = async () => {
    loading.value = true;
    try {
      const response = await api.get("/products");
      products.value = response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      loading.value = false;
    }
  };

  const createProduct = async (
    productData: Omit<Product, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const response = await api.post("/products", productData);
      products.value.unshift(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      const index = products.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        products.value[index] = response.data;
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      products.value = products.value.filter((p) => p.id !== id);
    } catch (error) {
      throw error;
    }
  };

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
});
