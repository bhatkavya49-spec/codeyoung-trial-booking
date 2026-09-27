import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const sendOTP = async (data) => {
  const response = await api.post('/auth/send-otp', data)
  return response.data
}

export const verifyOTP = async (email, code) => {
  const response = await api.post('/auth/verify-otp', { email, code })
  return response.data
}

export const sendLoginOTP = async (data) => {
  const response = await api.post('/auth/login/send-otp', data)
  return response.data
}

export const verifyLoginOTP = async (data) => {
  const response = await api.post('/auth/login/verify-otp', data)
  return response.data
}

export const getAvailableSlots = async (params) => {
  const query = new URLSearchParams(params).toString()
  const response = await api.get(`/slots?${query}`)
  return response.data
}

export const createBooking = async (data) => {
  const response = await api.post('/bookings', data)
  return response.data
}

export const getParentProfile = async (parentId) => {
  const response = await api.get(`/auth/me?parentId=${encodeURIComponent(parentId)}`)
  return response.data
}

export default api