import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Users } from 'lucide-react'

export default function UserManagement() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500">Manage admin users and permissions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                User Management Interface
              </h3>
              <p className="text-gray-600 mb-6">
                This feature will allow you to manage admin users, roles, and permissions.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Add and remove admin users</p>
                <p>• Assign roles and permissions</p>
                <p>• View user activity logs</p>
                <p>• Reset user passwords</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
