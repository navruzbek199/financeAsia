import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface QuoteRequest {
  id: number
  client_id: number
  product_id: number
  quantity: number
  message: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  client_name: string
  client_email: string
  product_name: string
  product_price: number
}

export const useQuotesStore = defineStore('quotes', () => {
  const quotes = ref<QuoteRequest[]>([])
  const loading = ref(false)

  const fetchQuotes = async () => {
    loading.value = true
    try {
      const response = await api.get('/quote-requests')
      quotes.value = response.data
    } catch (error) {
      console.error('Error fetching quotes:', error)
    } finally {
      loading.value = false
    }
  }

  const createQuote = async (quoteData: { product_id: number; quantity: number; message?: string }) => {
    try {
      const response = await api.post('/quote-requests', quoteData)
      await fetchQuotes() // Refresh the list
      return response.data
    } catch (error) {
      throw error
    }
  }

  const updateQuoteStatus = async (id: number, status: string) => {
    try {
      await api.put(`/quote-requests/${id}/status`, { status })
      const quote = quotes.value.find(q => q.id === id)
      if (quote) {
        quote.status = status as 'pending' | 'approved' | 'rejected'
      }
    } catch (error) {
      throw error
    }
  }

  return {
    quotes,
    loading,
    fetchQuotes,
    createQuote,
    updateQuoteStatus
  }
})