import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      setToken(savedToken)
      verifyToken(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (authToken) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(authToken)
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('auth_token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('auth_token', data.token)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
  }

  const hasPermission = (permission) => {
    if (!user) return false

    const permissions = {
      super_admin: {
        read: true,
        write: true,
        delete: true,
        manage_users: true,
        view_audit: true
      },
      content_editor: {
        read: true,
        write: true,
        delete: false,
        manage_users: false,
        view_audit: false
      },
      content_reviewer: {
        read: true,
        write: false,
        delete: false,
        manage_users: false,
        view_audit: false
      }
    }

    const userPermissions = permissions[user.role] || {}
    return userPermissions[permission] || false
  }

  const getAuthHeaders = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    getAuthHeaders,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
