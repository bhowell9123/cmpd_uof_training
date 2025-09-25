import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(username, password)
      
      if (result.success) {
        navigate('/admin')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const demoCredentials = [
    { username: 'admin', password: 'admin123', role: 'Super Admin' },
    { username: 'editor', password: 'editor123', role: 'Content Editor' },
    { username: 'reviewer', password: 'reviewer123', role: 'Content Reviewer' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center text-white">
          <div className="flex justify-center mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">CMPD Training Admin</h1>
          <p className="text-blue-100 mt-2">Use of Force Training Management System</p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Demo Credentials</CardTitle>
            <CardDescription>
              Use these credentials to test different user roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoCredentials.map((cred, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{cred.username}</div>
                    <div className="text-sm text-gray-600">{cred.role}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUsername(cred.username)
                      setPassword(cred.password)
                    }}
                    disabled={loading}
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Public Access */}
        <div className="text-center">
          <Button
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => navigate('/presentation')}
          >
            View Public Presentation
          </Button>
        </div>
      </div>
    </div>
  )
}
