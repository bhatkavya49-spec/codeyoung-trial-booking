import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'codeyoung_parent'

export function AuthProvider({ children }) {
  const [parent, setParent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setParent(JSON.parse(stored))
      } catch {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = (parentData) => {
    const data = {
      ...parentData,
      emailVerified: true,
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setParent(data)
  }

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    setParent(null)
  }

  const isAuthenticated = !!parent

  return (
    <AuthContext.Provider value={{ parent, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}