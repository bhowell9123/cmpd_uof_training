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
  // Development mode: Auto-login as admin for testing
  const DEV_MODE = true
  
  const [user, setUser] = useState(DEV_MODE ? {
    id: 1,
    username: 'admin',
    email: 'admin@capemaypd.gov',
    role: 'super_admin',
    name: 'System Administrator'
  } : null)
  const [loading, setLoading] = useState(!DEV_MODE)
  const [token, setToken] = useState(DEV_MODE ? 'dev-token' : null)

  useEffect(() => {
    if (DEV_MODE) {
      // Skip authentication in dev mode
      return
    }
    
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
      // Use the consolidated auth endpoint
      const response = await fetch('/api/auth/auth?path=verify', {
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
      // Use the consolidated auth endpoint
      const response = await fetch('/api/auth/auth?path=login', {
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
