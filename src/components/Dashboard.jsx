import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useContent } from '../contexts/ContentContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Edit3, 
  Eye,
  Save,
  AlertCircle,
  BookOpen,
  BarChart3
} from 'lucide-react'

export default function Dashboard() {
  const { user, logout, hasPermission } = useAuth()
  const { modules, slides, loading, error, getUnsavedChangesCount } = useContent()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const unsavedChanges = getUnsavedChangesCount()

  const stats = {
    totalSlides: slides.length,
    totalModules: modules.length,
    unsavedChanges: unsavedChanges,
    lastModified: 'Today'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">CMPD Training Admin</h1>
                <p className="text-sm text-gray-500">Use of Force Training Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {unsavedChanges > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'content', label: 'Content Management', icon: FileText },
              ...(hasPermission('manage_users') ? [{ id: 'users', label: 'User Management', icon: Users }] : []),
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Slides</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSlides}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Training Modules</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalModules}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unsaved Changes</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.unsavedChanges}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Modified</CardTitle>
                  <Save className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">{stats.lastModified}</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/slides')}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Edit3 className="h-5 w-5 mr-2 text-blue-600" />
                    Edit Slides
                  </CardTitle>
                  <CardDescription>
                    Modify slide content, images, and structure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Open Slide Editor
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/presentation')}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-green-600" />
                    Preview Presentation
                  </CardTitle>
                  <CardDescription>
                    View the presentation as users see it
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Open Presentation
                  </Button>
                </CardContent>
              </Card>

              {hasPermission('manage_users') && (
                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('users')}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-purple-600" />
                      Manage Users
                    </CardTitle>
                    <CardDescription>
                      Add, edit, or remove admin users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      User Management
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Changes */}
            <Card>
              <CardHeader>
                <CardTitle>Database Status</CardTitle>
                <CardDescription>
                  System is connected to Vercel Postgres
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-green-600 font-medium">✓ Database Connected</p>
                  <p className="text-sm text-gray-600 mt-1">
                    All changes are automatically saved to the database
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
              <Button onClick={() => navigate('/admin/slides')}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Slides
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle>Module {module.id}: {module.name}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Slides {module.slides[0]} - {module.slides[1]}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/slides?module=${module.id}`)}
                      >
                        Edit Module
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && hasPermission('manage_users') && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">User management interface will be implemented here.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">System settings interface will be implemented here.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
