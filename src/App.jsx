import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Components
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import SlideEditor from './components/SlideEditor'
import UserManagement from './components/UserManagement'
import PresentationView from './components/PresentationView'

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ContentProvider } from './contexts/ContentContext'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />
}

// Main App Layout
function AppLayout() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/presentation" element={<PresentationView />} />
        <Route path="/presentation/slide/:slideId" element={<PresentationView />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/slides" element={
          <ProtectedRoute>
            <SlideEditor />
          </ProtectedRoute>
        } />
        <Route path="/admin/slides/:slideId" element={
          <ProtectedRoute>
            <SlideEditor />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <AppLayout />
      </ContentProvider>
    </AuthProvider>
  )
}

export default App
