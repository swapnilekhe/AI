import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    // Check for stored auth token on load
    const token = localStorage.getItem('auth_token')
    if (token) {
      setIsAuthenticated(true)
      console.log('✓ User authenticated from stored token')
    } else {
      console.log('✗ No authentication token found')
    }
  }, [])

  const login = (token) => {
    localStorage.setItem('auth_token', token)
    setIsAuthenticated(true)
    console.log('✓ User logged in successfully')
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setIsAuthenticated(false)
    console.log('✓ User logged out')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
