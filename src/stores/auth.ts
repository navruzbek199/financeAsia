import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null) as any;
  const token = ref(localStorage.getItem("token"));
  const loading = ref(false);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  const login = async (email: string, password: string) => {
    loading.value = true;
    try {
      const response = await api.post("/auth/login", { email, password });
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem("token", response.data.token);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    loading.value = true;
    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        name,
      });
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem("token", response.data.token);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  const initializeAuth = () => {
    if (token.value) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
      // You might want to validate the token here
    }
  };

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    initializeAuth,
  };
});
