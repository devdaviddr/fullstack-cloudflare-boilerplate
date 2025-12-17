import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import Navigation from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import TodoList from './pages/TodoList'
import Login from './pages/Login'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="h-screen flex flex-col">
              <Navigation />
              <div className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <TodoList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </div>
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
